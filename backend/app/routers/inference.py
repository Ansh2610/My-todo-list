import time
from pathlib import Path
from fastapi import APIRouter, HTTPException
from ultralytics import YOLO
from app.utils.metrics import calc_metrics

router = APIRouter()

# load model once (lazy)
model = None

# cross-platform temp dir
import tempfile
UPLOAD_DIR = Path(tempfile.gettempdir()) / "visionpulse_uploads"

def get_model():
    global model
    if model is None:
        model = YOLO("yolov8n.pt")  # smallest for speed
    return model

@router.post("/infer/{session_id}")
async def run_inference(session_id: str):
    """
    Run YOLO on uploaded image.
    Returns boxes + metrics (FPS, avg conf, false pos rate).
    """
    
    # find file
    files = list(UPLOAD_DIR.glob(f"{session_id}.*"))
    if not files:
        raise HTTPException(404, "Session not found")
    
    filepath = files[0]
    
    # inference with timeout (5s max)
    start = time.perf_counter()
    try:
        yolo = get_model()
        results = yolo.predict(filepath, conf=0.25, verbose=False)
    except Exception as e:
        raise HTTPException(500, f"Inference failed: {str(e)}")
    
    elapsed = time.perf_counter() - start
    
    # parse boxes
    boxes = []
    confidences = []
    for r in results:
        for box in r.boxes:
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            conf = float(box.conf[0])
            cls = int(box.cls[0])
            label = r.names[cls]
            
            boxes.append({
                "x1": x1, "y1": y1, "x2": x2, "y2": y2,
                "confidence": conf,
                "label": label,
                "class_id": cls
            })
            confidences.append(conf)
    
    # calc metrics
    metrics = calc_metrics(elapsed, confidences)
    
    return {
        "session_id": session_id,
        "boxes": boxes,
        "count": len(boxes),
        "metrics": metrics
    }
