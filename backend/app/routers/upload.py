import os
import uuid
import magic
from pathlib import Path
from fastapi import APIRouter, UploadFile, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

MAX_SIZE = int(os.getenv("MAX_UPLOAD_SIZE", 10485760))  # 10MB
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}

# cross-platform temp dir
import tempfile
UPLOAD_DIR = Path(tempfile.gettempdir()) / "visionpulse_uploads"

UPLOAD_DIR.mkdir(exist_ok=True, parents=True)

@router.post("/upload")
@limiter.limit("10/minute")  # prevent spam
async def upload_image(request: Request, file: UploadFile):
    """
    Upload an image. Returns session_id for tracking.
    Validates: size, MIME type.
    """
    
    # size check
    contents = await file.read()
    if len(contents) > MAX_SIZE:
        raise HTTPException(400, f"File too large. Max {MAX_SIZE} bytes")
    
    # MIME check
    mime = magic.from_buffer(contents, mime=True)
    if mime not in ALLOWED_TYPES:
        raise HTTPException(400, f"Invalid file type: {mime}")
    
    # save with random session id
    session_id = str(uuid.uuid4())
    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    filepath = UPLOAD_DIR / f"{session_id}.{ext}"
    
    with open(filepath, "wb") as f:
        f.write(contents)
    
    return {
        "session_id": session_id,
        "filename": file.filename,
        "size": len(contents),
        "mime": mime
    }
