from fastapi import APIRouter, HTTPException, Request, Header
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
from bson import ObjectId
import os
import hmac
import hashlib
import logging
import json

from models import OrderStatus

router = APIRouter(prefix="/api/webhooks", tags=["webhooks"])
logger = logging.getLogger(__name__)

def get_db():
    mongo_url = os.environ.get('MONGO_URL')
    client = AsyncIOMotorClient(mongo_url)
    return client[os.environ.get('DB_NAME')]

def validate_webhook_signature(payload: str, signature: str, secret: str) -> bool:
    """Validate OrionPay webhook signature"""
    if not secret or not signature:
        return True  # Skip validation if no secret configured
    
    expected = hmac.new(
        secret.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    
    try:
        return hmac.compare_digest(signature, expected)
    except:
        return False

@router.post("/orionpay")
async def orionpay_webhook(
    request: Request,
    x_webhook_signature: str = Header(None, alias="X-Webhook-Signature")
):
    """Handle OrionPay webhook notifications"""
    db = get_db()
    
    try:
        body = await request.body()
        payload = json.loads(body)
        
        logger.info(f"Webhook received: {payload.get('event')}")
        
        # Validate signature (optional - if WEBHOOK_SECRET is set)
        webhook_secret = os.environ.get("ORIONPAY_WEBHOOK_SECRET")
        if webhook_secret and x_webhook_signature:
            if not validate_webhook_signature(body.decode(), x_webhook_signature, webhook_secret):
                logger.warning("Invalid webhook signature")
                raise HTTPException(status_code=401, detail="Invalid signature")
        
        event = payload.get("event")
        data = payload.get("data", {})
        
        if event == "payment.success":
            # Payment confirmed - update order status
            transaction_id = data.get("transactionId")
            buyer_email = data.get("buyerEmail")
            
            # Find order by transaction ID or email
            order = None
            if transaction_id:
                order = await db.orders.find_one({"transactionId": transaction_id})
            
            if not order and buyer_email:
                # Try to find by email (most recent pending order)
                order = await db.orders.find_one(
                    {"email": buyer_email, "status": OrderStatus.PENDING},
                    sort=[("createdAt", -1)]
                )
            
            if order:
                await db.orders.update_one(
                    {"_id": order["_id"]},
                    {
                        "$set": {
                            "status": OrderStatus.PAID,
                            "paidAt": datetime.utcnow(),
                            "paymentData": data,
                            "updatedAt": datetime.utcnow()
                        }
                    }
                )
                logger.info(f"Order {order.get('orderNumber')} marked as PAID")
            else:
                logger.warning(f"Order not found for transaction {transaction_id}")
        
        elif event == "purchase.created":
            # Purchase initiated - log for tracking
            logger.info(f"Purchase created: {data.get('purchaseId')}")
        
        return {"received": True, "event": event}
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/orionpay/test")
async def test_webhook():
    """Test endpoint to verify webhook is accessible"""
    return {"status": "ok", "message": "Webhook endpoint is working"}
