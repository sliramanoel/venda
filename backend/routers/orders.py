from fastapi import APIRouter, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
from typing import List
from bson import ObjectId
import os
import random
import string

from models import OrderCreate, OrderResponse, OrderStatus, OrderStatusUpdate
from utils.validators import validate_brazilian_phone, validate_email, validate_name

router = APIRouter(prefix="/api/orders", tags=["orders"])

def get_db():
    mongo_url = os.environ.get('MONGO_URL')
    client = AsyncIOMotorClient(mongo_url)
    return client[os.environ.get('DB_NAME')]

def generate_order_number():
    """Generate unique order number"""
    timestamp = datetime.utcnow().strftime("%Y%m%d")
    random_part = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"NV-{timestamp}-{random_part}"

@router.post("", response_model=OrderResponse)
async def create_order(order: OrderCreate):
    """Create a new order with validation"""
    db = get_db()
    
    # Validate name
    is_valid, error_msg = validate_name(order.name)
    if not is_valid:
        raise HTTPException(status_code=400, detail=f"Nome inválido: {error_msg}")
    
    # Validate phone
    is_valid, error_msg = validate_brazilian_phone(order.phone)
    if not is_valid:
        raise HTTPException(status_code=400, detail=f"Telefone inválido: {error_msg}")
    
    # Validate email
    is_valid, error_msg = validate_email(order.email)
    if not is_valid:
        raise HTTPException(status_code=400, detail=f"Email inválido: {error_msg}")
    
    order_data = order.model_dump()
    order_data["orderNumber"] = generate_order_number()
    order_data["status"] = OrderStatus.PENDING
    order_data["createdAt"] = datetime.utcnow()
    order_data["updatedAt"] = datetime.utcnow()
    
    result = await db.orders.insert_one(order_data)
    
    created_order = await db.orders.find_one({"_id": result.inserted_id})
    created_order["_id"] = str(created_order["_id"])
    
    return created_order

@router.get("", response_model=List[OrderResponse])
async def list_orders(skip: int = 0, limit: int = 100):
    """List all orders (admin)"""
    db = get_db()
    
    orders = await db.orders.find().sort("createdAt", -1).skip(skip).limit(limit).to_list(limit)
    
    for order in orders:
        order["_id"] = str(order["_id"])
    
    return orders

@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(order_id: str):
    """Get a specific order"""
    db = get_db()
    
    try:
        order = await db.orders.find_one({"_id": ObjectId(order_id)})
    except:
        # Try to find by order number
        order = await db.orders.find_one({"orderNumber": order_id})
    
    if not order:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    
    order["_id"] = str(order["_id"])
    return order

@router.patch("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(order_id: str, status_update: OrderStatusUpdate):
    """Update order status"""
    db = get_db()
    
    try:
        oid = ObjectId(order_id)
    except:
        raise HTTPException(status_code=400, detail="ID de pedido inválido")
    
    order = await db.orders.find_one({"_id": oid})
    if not order:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    
    await db.orders.update_one(
        {"_id": oid},
        {"$set": {"status": status_update.status, "updatedAt": datetime.utcnow()}}
    )
    
    updated_order = await db.orders.find_one({"_id": oid})
    updated_order["_id"] = str(updated_order["_id"])
    
    return updated_order

@router.post("/validate")
async def validate_order_data(data: dict):
    """Validate order data before submission (real-time validation)"""
    errors = {}
    
    # Validate name if provided
    if 'name' in data and data['name']:
        is_valid, error_msg = validate_name(data['name'])
        if not is_valid:
            errors['name'] = error_msg
    
    # Validate phone if provided
    if 'phone' in data and data['phone']:
        is_valid, error_msg = validate_brazilian_phone(data['phone'])
        if not is_valid:
            errors['phone'] = error_msg
    
    # Validate email if provided
    if 'email' in data and data['email']:
        is_valid, error_msg = validate_email(data['email'])
        if not is_valid:
            errors['email'] = error_msg
    
    return {
        "valid": len(errors) == 0,
        "errors": errors
    }
