from fastapi import APIRouter, HTTPException, Request
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta
from bson import ObjectId
import os
import httpx
import logging
import base64
import hashlib
import io
import qrcode

from models import OrderStatus

router = APIRouter(prefix="/api/payments", tags=["payments"])
logger = logging.getLogger(__name__)

ORIONPAY_API_URL = "https://payapi.orion.moe/api/v1"

def get_db():
    mongo_url = os.environ.get('MONGO_URL')
    client = AsyncIOMotorClient(mongo_url)
    return client[os.environ.get('DB_NAME')]

async def get_payment_settings():
    """Get payment gateway settings from database"""
    db = get_db()
    settings = await db.settings.find_one({}, {"_id": 0})
    
    if not settings:
        # Return defaults if no settings
        return {
            "paymentGateway": "orionpay",
            "orionpayApiKey": os.environ.get('ORIONPAY_API_KEY', ''),
            "orionpayWebhookSecret": "",
            "paymentTestMode": True,
            "pixExpirationMinutes": 30
        }
    
    # Fallback to env var if not in settings
    if not settings.get("orionpayApiKey"):
        settings["orionpayApiKey"] = os.environ.get('ORIONPAY_API_KEY', '')
    
    return settings

def generate_pix_emv_code(order_id: str, amount: float, merchant_name: str = "NEUROVITA") -> str:
    """
    Generate a valid PIX EMV code (BR Code)
    This follows the EMV QR Code specification for PIX
    """
    def format_field(id: str, value: str) -> str:
        return f"{id}{len(value):02d}{value}"
    
    # PIX key (simulated - in production use real PIX key)
    pix_key = f"teste{order_id[-6:]}@neurovita.pix"
    
    # Build the merchant account info (ID 26)
    gui = format_field("00", "br.gov.bcb.pix")
    chave = format_field("01", pix_key)
    merchant_account = format_field("26", gui + chave)
    
    # Build the full payload
    payload_format = format_field("00", "01")  # Payload Format Indicator
    merchant_category = format_field("52", "0000")  # Merchant Category Code (0000 = not informed)
    currency = format_field("53", "986")  # Transaction Currency (986 = BRL)
    amount_field = format_field("54", f"{amount:.2f}")  # Transaction Amount
    country = format_field("58", "BR")  # Country Code
    merchant_name_field = format_field("59", merchant_name[:25])  # Merchant Name (max 25 chars)
    city = format_field("60", "SAO PAULO")  # Merchant City
    
    # Additional data (ID 62)
    txid = format_field("05", f"NV{order_id[-8:].upper()}")
    additional_data = format_field("62", txid)
    
    # Assemble payload without CRC
    payload = (
        payload_format +
        merchant_account +
        merchant_category +
        currency +
        amount_field +
        country +
        merchant_name_field +
        city +
        additional_data +
        "6304"  # CRC field ID and length placeholder
    )
    
    # Calculate CRC16 CCITT
    def crc16_ccitt(data: bytes) -> int:
        crc = 0xFFFF
        for byte in data:
            crc ^= byte << 8
            for _ in range(8):
                if crc & 0x8000:
                    crc = (crc << 1) ^ 0x1021
                else:
                    crc <<= 1
                crc &= 0xFFFF
        return crc
    
    crc = crc16_ccitt(payload.encode('utf-8'))
    pix_code = payload + f"{crc:04X}"
    
    return pix_code

def generate_qr_code_base64(data: str) -> str:
    """Generate QR code as base64 data URI"""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Convert to base64
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    img_base64 = base64.b64encode(buffer.getvalue()).decode()
    
    return f"data:image/png;base64,{img_base64}"

@router.post("/pix/generate")
async def generate_pix_payment(order_id: str):
    """Generate PIX payment for an order"""
    db = get_db()
    payment_settings = await get_payment_settings()
    
    api_key = payment_settings.get("orionpayApiKey")
    expiration_minutes = payment_settings.get("pixExpirationMinutes", 30)
    test_mode = payment_settings.get("paymentTestMode", True)
    
    # Get order
    try:
        order = await db.orders.find_one({"_id": ObjectId(order_id)})
    except:
        order = await db.orders.find_one({"orderNumber": order_id})
    
    if not order:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    
    # Check if already has a valid PIX
    if order.get("pixCode") and order.get("pixExpiration"):
        expiration = order.get("pixExpiration")
        if isinstance(expiration, datetime) and expiration > datetime.utcnow():
            return {
                "success": True,
                "pixCode": order.get("pixCode"),
                "qrCode": order.get("qrCodeBase64"),
                "transactionId": order.get("transactionId"),
                "expiresAt": order.get("pixExpiration").isoformat() if order.get("pixExpiration") else None,
                "testMode": order.get("pixTestMode", False)
            }
    
    # Calculate expiration time
    pix_expiration = datetime.utcnow() + timedelta(minutes=expiration_minutes)
    
    # Try OrionPay API first
    pix_code = None
    qr_code = None
    transaction_id = None
    is_test_mode = False
    
    if api_key and not test_mode:
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{ORIONPAY_API_URL}/pix/generate",
                    headers={
                        "Content-Type": "application/json",
                        "X-API-Key": api_key
                    },
                    json={
                        "amount": order["totalPrice"],
                        "email": order["email"]
                    },
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    pix_data = data.get("data", data)
                    pix_code = pix_data.get("pixCode")
                    qr_code = pix_data.get("qrCode")
                    transaction_id = pix_data.get("id")
                else:
                    logger.warning(f"OrionPay error: {response.status_code} - {response.text}")
        except Exception as e:
            logger.warning(f"OrionPay request failed: {e}")
    
    # Fallback to test mode if OrionPay fails or test mode is enabled
    if not pix_code:
        is_test_mode = True
        pix_code = generate_pix_code(str(order["_id"]), order["totalPrice"])
        qr_code = generate_qr_svg(pix_code)
        transaction_id = f"TEST_{order['_id']}"
        logger.info(f"Using test mode PIX for order {order.get('orderNumber')}")
    
    # Update order with PIX info
    await db.orders.update_one(
        {"_id": order["_id"]},
        {
            "$set": {
                "pixCode": pix_code,
                "qrCodeBase64": qr_code,
                "transactionId": transaction_id,
                "pixExpiration": pix_expiration,
                "pixTestMode": is_test_mode,
                "updatedAt": datetime.utcnow()
            }
        }
    )
    
    return {
        "success": True,
        "pixCode": pix_code,
        "qrCode": qr_code,
        "transactionId": transaction_id,
        "expiresAt": pix_expiration.isoformat(),
        "testMode": is_test_mode
    }

@router.get("/pix/status/{order_id}")
async def check_pix_status(order_id: str):
    """Check PIX payment status for an order"""
    db = get_db()
    
    try:
        order = await db.orders.find_one({"_id": ObjectId(order_id)})
    except:
        order = await db.orders.find_one({"orderNumber": order_id})
    
    if not order:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    
    return {
        "orderId": str(order["_id"]),
        "orderNumber": order.get("orderNumber"),
        "status": order.get("status"),
        "isPaid": order.get("status") == OrderStatus.PAID,
        "pixCode": order.get("pixCode"),
        "transactionId": order.get("transactionId")
    }

@router.get("/config")
async def get_payment_config():
    """Get payment gateway configuration status (without sensitive data)"""
    payment_settings = await get_payment_settings()
    
    return {
        "gateway": payment_settings.get("paymentGateway", "orionpay"),
        "isConfigured": bool(payment_settings.get("orionpayApiKey")),
        "testMode": payment_settings.get("paymentTestMode", True),
        "pixExpirationMinutes": payment_settings.get("pixExpirationMinutes", 30)
    }
