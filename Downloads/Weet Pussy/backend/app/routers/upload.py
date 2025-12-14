import os
import uuid
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse

from app.security.dependencies import get_admin_user
from app.models.user import User

router = APIRouter(prefix="/api/upload", tags=["Upload"])

# Configure upload directory
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


def get_file_extension(filename: str) -> str:
    """Get file extension from filename."""
    return filename.rsplit(".", 1)[-1].lower() if "." in filename else ""


@router.post("/image")
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_admin_user)
):
    """
    Upload an image file. Returns the URL to access the uploaded image.
    Admin only.
    """
    # Validate file extension
    ext = get_file_extension(file.filename)
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Read file content to check size
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size: {MAX_FILE_SIZE // (1024*1024)}MB"
        )
    
    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}.{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    # Ensure upload directory exists
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    # Save file
    try:
        with open(file_path, "wb") as buffer:
            buffer.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to save file")
    
    # Return the URL to access the image
    image_url = f"/uploads/{unique_filename}"
    
    return JSONResponse(content={
        "success": True,
        "filename": unique_filename,
        "url": image_url,
        "size": len(content)
    })


@router.delete("/image/{filename}")
async def delete_image(
    filename: str,
    current_user: User = Depends(get_admin_user)
):
    """Delete an uploaded image. Admin only."""
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        os.remove(file_path)
        return {"success": True, "message": "File deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to delete file")
