from fastapi import APIRouter, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import os

from models import SettingsBase, SettingsUpdate, SettingsResponse

router = APIRouter(prefix="/api/settings", tags=["settings"])

# Get database connection
def get_db():
    mongo_url = os.environ.get('MONGO_URL')
    client = AsyncIOMotorClient(mongo_url)
    return client[os.environ.get('DB_NAME')]

@router.get("", response_model=SettingsResponse)
async def get_settings():
    """Get site settings"""
    db = get_db()
    settings = await db.settings.find_one()
    
    if not settings:
        # Create default settings if not exists
        default_settings = SettingsBase().model_dump()
        default_settings["updatedAt"] = datetime.utcnow()
        result = await db.settings.insert_one(default_settings)
        default_settings["_id"] = str(result.inserted_id)
        return default_settings
    
    settings["_id"] = str(settings["_id"])
    return settings

@router.put("", response_model=SettingsResponse)
async def update_settings(settings_update: SettingsUpdate):
    """Update site settings"""
    db = get_db()
    
    # Get current settings or create default
    current = await db.settings.find_one()
    
    if not current:
        default_settings = SettingsBase().model_dump()
        default_settings["updatedAt"] = datetime.utcnow()
        result = await db.settings.insert_one(default_settings)
        current = await db.settings.find_one({"_id": result.inserted_id})
    
    # Update only provided fields
    update_data = {k: v for k, v in settings_update.model_dump().items() if v is not None}
    update_data["updatedAt"] = datetime.utcnow()
    
    await db.settings.update_one(
        {"_id": current["_id"]},
        {"$set": update_data}
    )
    
    updated = await db.settings.find_one({"_id": current["_id"]})
    updated["_id"] = str(updated["_id"])
    return updated
