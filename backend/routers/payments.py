from fastapi import APIRouter, HTTPException, Request
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta
from bson import ObjectId
import os
import httpx
import logging

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

@router.post("/pix/generate")
async def generate_pix_payment(order_id: str):
    """Generate PIX payment for an order"""
    db = get_db()
    payment_settings = await get_payment_settings()
    
    api_key = payment_settings.get("orionpayApiKey")
    expiration_minutes = payment_settings.get("pixExpirationMinutes", 30)
    
    if not api_key:
        raise HTTPException(
            status_code=500, 
            detail="API Key do gateway de pagamento não configurada. Configure no painel admin."
        )
    
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
                "expiresAt": order.get("pixExpiration").isoformat() if order.get("pixExpiration") else None
            }
    
    # Generate new PIX via OrionPay API
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
            
            if response.status_code != 200:
                logger.error(f"OrionPay error: {response.status_code} - {response.text}")
                raise HTTPException(
                    status_code=response.status_code, 
                    detail=f"Erro ao gerar PIX: {response.text}"
                )
            
            data = response.json()
            pix_data = data.get("data", data)
            
            # Calculate expiration time
            pix_expiration = datetime.utcnow() + timedelta(minutes=expiration_minutes)
            
            # Update order with PIX info
            await db.orders.update_one(
                {"_id": order["_id"]},
                {
                    "$set": {
                        "pixCode": pix_data.get("pixCode"),
                        "qrCodeBase64": pix_data.get("qrCode"),
                        "transactionId": pix_data.get("id"),
                        "pixExpiration": pix_expiration,
                        "updatedAt": datetime.utcnow()
                    }
                }
            )
            
            return {
                "success": True,
                "pixCode": pix_data.get("pixCode"),
                "qrCode": pix_data.get("qrCode"),
                "transactionId": pix_data.get("id"),
                "expiresAt": pix_expiration.isoformat()
            }
            
    except httpx.RequestError as e:
        logger.error(f"Request error: {e}")
        raise HTTPException(status_code=500, detail=f"Erro de conexão: {str(e)}")

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
