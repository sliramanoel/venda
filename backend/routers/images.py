from fastapi import APIRouter, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import os

from models import ProductImagesBase, ProductImagesUpdate, ProductImagesResponse

router = APIRouter(prefix="/api/images", tags=["images"])

def get_db():
    mongo_url = os.environ.get('MONGO_URL')
    client = AsyncIOMotorClient(mongo_url)
    return client[os.environ.get('DB_NAME')]

@router.get("", response_model=ProductImagesResponse)
async def get_images():
    """Get product images"""
    db = get_db()
    images = await db.product_images.find_one()
    
    if not images:
        # Create default images if not exists
        default_images = ProductImagesBase().model_dump()
        default_images["updatedAt"] = datetime.utcnow()
        result = await db.product_images.insert_one(default_images)
        default_images["_id"] = str(result.inserted_id)
        return default_images
    
    images["_id"] = str(images["_id"])
    return images

@router.put("", response_model=ProductImagesResponse)
async def update_images(images_update: ProductImagesUpdate):
    """Update product images"""
    db = get_db()
    
    # Get current images or create default
    current = await db.product_images.find_one()
    
    if not current:
        default_images = ProductImagesBase().model_dump()
        default_images["updatedAt"] = datetime.utcnow()
        result = await db.product_images.insert_one(default_images)
        current = await db.product_images.find_one({"_id": result.inserted_id})
    
    # Update only provided fields
    update_data = {k: v for k, v in images_update.model_dump().items() if v is not None}
    update_data["updatedAt"] = datetime.utcnow()
    
    await db.product_images.update_one(
        {"_id": current["_id"]},
        {"$set": update_data}
    )
    
    updated = await db.product_images.find_one({"_id": current["_id"]})
    updated["_id"] = str(updated["_id"])
    return updated
