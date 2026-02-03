from fastapi import APIRouter, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import os

from models import SettingsBase, SettingsUpdate, SettingsResponse

router = APIRouter(prefix="/api/settings", tags=["settings"])

def get_db():
    mongo_url = os.environ.get('MONGO_URL')
    client = AsyncIOMotorClient(mongo_url)
    return client[os.environ.get('DB_NAME')]

@router.get("")
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

@router.put("")
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
    update_data = {}
    for key, value in settings_update.model_dump().items():
        if value is not None:
            # Handle nested objects
            if hasattr(value, 'model_dump'):
                update_data[key] = value.model_dump()
            elif isinstance(value, list) and len(value) > 0 and hasattr(value[0], 'model_dump'):
                update_data[key] = [item.model_dump() for item in value]
            else:
                update_data[key] = value
    
    update_data["updatedAt"] = datetime.utcnow()
    
    await db.settings.update_one(
        {"_id": current["_id"]},
        {"$set": update_data}
    )
    
    updated = await db.settings.find_one({"_id": current["_id"]})
    updated["_id"] = str(updated["_id"])
    return updated

@router.post("/reset")
async def reset_settings():
    """Reset settings to default"""
    db = get_db()
    
    await db.settings.delete_many({})
    
    default_settings = SettingsBase().model_dump()
    default_settings["updatedAt"] = datetime.utcnow()
    result = await db.settings.insert_one(default_settings)
    default_settings["_id"] = str(result.inserted_id)
    
    return default_settings
