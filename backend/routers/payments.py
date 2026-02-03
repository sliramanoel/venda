from fastapi import APIRouter, HTTPException, Request
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
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

def get_api_key():
    return os.environ.get('ORIONPAY_API_KEY')

@router.post("/pix/generate")
async def generate_pix_payment(order_id: str):
    """Generate PIX payment for an order"""
    db = get_db()
    api_key = get_api_key()
    
    if not api_key:
        raise HTTPException(status_code=500, detail="API Key não configurada")
    
    # Get order
    try:
        order = await db.orders.find_one({"_id": ObjectId(order_id)})
    except:
        order = await db.orders.find_one({"orderNumber": order_id})
    
    if not order:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    
    # Check if already has a PIX
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
                    "email": order["email"],
                    "name": order["name"]
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
            
            # Update order with PIX info
            pix_expiration = datetime.utcnow().replace(
                hour=datetime.utcnow().hour,
                minute=datetime.utcnow().minute + 30,
                second=0,
                microsecond=0
            )
            
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
