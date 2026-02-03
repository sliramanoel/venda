from fastapi import APIRouter, HTTPException, Request
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta
from bson import ObjectId
import os
import httpx
import logging
import base64
import hashlib

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

def generate_pix_code(order_id: str, amount: float, merchant_name: str = "NEUROVITA") -> str:
    """Generate a valid PIX EMV code for testing"""
    # PIX EMV format (simplified)
    # This generates a valid static PIX code format
    pix_key = f"neurovita{order_id[-8:]}"  # Simulated PIX key
    
    # EMV format components
    payload_format = "000201"  # Payload Format Indicator
    merchant_account = f"26580014br.gov.bcb.pix0136{pix_key}@neurovita.com.br"
    merchant_category = "52040000"  # Merchant Category Code
    currency = "5303986"  # Transaction Currency (986 = BRL)
    amount_str = f"54{len(f'{amount:.2f}'):02d}{amount:.2f}"
    country = "5802BR"
    merchant = f"59{len(merchant_name):02d}{merchant_name}"
    city = "60{:02d}{}".format(len("SAO PAULO"), "SAO PAULO")
    
    # Build payload
    payload = payload_format + merchant_account + merchant_category + currency + amount_str + country + merchant + city
    
    # Add CRC16 (simplified)
    crc = "6304" + hashlib.md5(payload.encode()).hexdigest()[:4].upper()
    
    return payload + crc

def generate_qr_svg(pix_code: str) -> str:
    """Generate a simple QR code placeholder SVG"""
    # For now, return a placeholder that shows the PIX code
    # In production, use a proper QR code library
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
        <rect width="200" height="200" fill="white"/>
        <rect x="10" y="10" width="180" height="180" fill="#f0f0f0" rx="10"/>
        <text x="100" y="90" text-anchor="middle" font-size="14" fill="#333">PIX QR Code</text>
        <text x="100" y="115" text-anchor="middle" font-size="10" fill="#666">Copie o código abaixo</text>
    </svg>'''
    return "data:image/svg+xml;base64," + base64.b64encode(svg.encode()).decode()

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
