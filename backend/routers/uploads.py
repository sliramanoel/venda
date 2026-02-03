from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from datetime import datetime
import os
import uuid
import shutil
from pathlib import Path

router = APIRouter(prefix="/api/uploads", tags=["uploads"])

# Upload directory
UPLOAD_DIR = Path(__file__).parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

# Allowed extensions
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

def get_file_extension(filename: str) -> str:
    return Path(filename).suffix.lower()

def is_allowed_file(filename: str) -> bool:
    return get_file_extension(filename) in ALLOWED_EXTENSIONS

@router.post("/image")
async def upload_image(file: UploadFile = File(...)):
    """Upload an image file"""
    
    # Validate file extension
    if not is_allowed_file(file.filename):
        raise HTTPException(
            status_code=400, 
            detail=f"Tipo de arquivo não permitido. Use: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Read file content
    content = await file.read()
    
    # Validate file size
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"Arquivo muito grande. Máximo: {MAX_FILE_SIZE // 1024 // 1024}MB"
        )
    
    # Generate unique filename
    ext = get_file_extension(file.filename)
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    file_path = UPLOAD_DIR / unique_filename
    
    # Save file
    with open(file_path, "wb") as f:
        f.write(content)
    
    # Generate URL
    base_url = os.environ.get('REACT_APP_BACKEND_URL', '')
    if not base_url:
        base_url = os.environ.get('BACKEND_URL', 'http://localhost:8001')
    
    file_url = f"{base_url}/api/uploads/images/{unique_filename}"
    
    return {
        "success": True,
        "filename": unique_filename,
        "url": file_url,
        "size": len(content),
        "uploadedAt": datetime.utcnow().isoformat()
    }

@router.get("/images/{filename}")
async def get_image(filename: str):
    """Serve an uploaded image"""
    file_path = UPLOAD_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Imagem não encontrada")
    
    # Determine content type
    ext = get_file_extension(filename)
    content_types = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml'
    }
    
    return FileResponse(
        file_path,
        media_type=content_types.get(ext, 'application/octet-stream'),
        headers={"Cache-Control": "public, max-age=31536000"}
    )

@router.delete("/images/{filename}")
async def delete_image(filename: str):
    """Delete an uploaded image"""
    file_path = UPLOAD_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Imagem não encontrada")
    
    os.remove(file_path)
    
    return {"success": True, "message": "Imagem removida com sucesso"}

@router.get("/list")
async def list_images():
    """List all uploaded images"""
    base_url = os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:8001')
    
    images = []
    for file in UPLOAD_DIR.iterdir():
        if file.is_file() and is_allowed_file(file.name):
            images.append({
                "filename": file.name,
                "url": f"{base_url}/api/uploads/images/{file.name}",
                "size": file.stat().st_size,
                "createdAt": datetime.fromtimestamp(file.stat().st_ctime).isoformat()
            })
    
    return {"images": images, "count": len(images)}
