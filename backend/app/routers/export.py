import io
import zipfile
from pathlib import Path
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

router = APIRouter()

# cross-platform temp dir
import tempfile
UPLOAD_DIR = Path(tempfile.gettempdir()) / "visionpulse_uploads"

class ExportRequest(BaseModel):
    session_id: str
    boxes: list[dict]  # {x1, y1, x2, y2, class_id, ...}
    image_width: int
    image_height: int

@router.post("/export")
async def export_yolo(data: ExportRequest):
    """
    Export boxes to YOLO format (txt).
    Returns ZIP with image + labels.
    """
    
    # convert boxes to YOLO format
    # YOLO: class_id x_center y_center width height (normalized)
    lines = []
    for box in data.boxes:
        x1, y1, x2, y2 = box["x1"], box["y1"], box["x2"], box["y2"]
        cls = box["class_id"]
        
        # normalize
        x_center = ((x1 + x2) / 2) / data.image_width
        y_center = ((y1 + y2) / 2) / data.image_height
        width = (x2 - x1) / data.image_width
        height = (y2 - y1) / data.image_height
        
        # clamp to [0, 1]
        x_center = max(0, min(1, x_center))
        y_center = max(0, min(1, y_center))
        width = max(0, min(1, width))
        height = max(0, min(1, height))
        
        lines.append(f"{cls} {x_center:.6f} {y_center:.6f} {width:.6f} {height:.6f}")
    
    # create zip in memory
    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        # add labels.txt
        labels_content = "\n".join(lines)
        zf.writestr(f"{data.session_id}.txt", labels_content)
        
        # add original image
        files = list(UPLOAD_DIR.glob(f"{data.session_id}.*"))
        if files:
            with open(files[0], "rb") as img:
                zf.writestr(files[0].name, img.read())
    
    zip_buffer.seek(0)
    
    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename={data.session_id}.zip"}
    )
