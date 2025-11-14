import time
import json
import numpy as np
from pathlib import Path
from datetime import datetime
from fastapi import APIRouter, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from ultralytics import YOLO
from app.utils.metrics import calc_metrics
from app.schemas.validation import GroundTruthBox
from app.config.security import (
    INFERENCE_RATE_LIMIT,
    YOLO_CONFIDENCE_THRESHOLD,
    YOLO_INFERENCE_TIMEOUT_SECONDS
)

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

# load model once (lazy)
model = None

# cross-platform temp dir
import tempfile
UPLOAD_DIR = Path(tempfile.gettempdir()) / "visionpulse_uploads"
VALIDATION_DIR = Path(tempfile.gettempdir()) / "visionpulse_validations"
VALIDATION_DIR.mkdir(exist_ok=True)

def get_model():
    global model
    if model is None:
        model = YOLO("yolov8n.pt")
        # Warm up the model with a dummy prediction to ensure consistent performance
        import numpy as np
        dummy_img = np.zeros((640, 640, 3), dtype=np.uint8)
        model.predict(dummy_img, verbose=False)
    return model

@router.post("/infer/{session_id}")
@limiter.limit(INFERENCE_RATE_LIMIT)
async def run_inference(request: Request, session_id: str):
    """
    Run YOLO on uploaded image.
    Returns boxes + metrics (FPS, avg conf, false pos rate).
    
    Ensures CONSISTENT inference quality across all images by:
    - Using fixed image size (640x640) - no dynamic resizing
    - Fixed confidence threshold (0.25)
    - Fixed IoU threshold for NMS (0.45)
    - Model warmup on first load to prevent cold-start performance issues
    
    Security: Rate limited + timeout protection.
    """
    
    # Find all files for this session
    files = list(UPLOAD_DIR.glob(f"{session_id}_*.*"))
    if not files:
        raise HTTPException(404, "Session not found")
    
    # Get the most recently uploaded file (highest timestamp)
    filepath = max(files, key=lambda f: f.stat().st_mtime)
    
    # inference with timeout protection
    start = time.perf_counter()
    try:
        yolo = get_model()
        results = yolo.predict(
            filepath, 
            conf=YOLO_CONFIDENCE_THRESHOLD,
            iou=0.45,  # Standard NMS IoU threshold
            imgsz=640,  # Fixed image size for consistency
            max_det=300,  # Maximum detections per image
            agnostic_nms=False,  # Class-specific NMS
            verbose=False
        )
        
        elapsed = time.perf_counter() - start
        
        # Timeout check
        if elapsed > YOLO_INFERENCE_TIMEOUT_SECONDS:
            raise HTTPException(408, f"Inference timeout ({YOLO_INFERENCE_TIMEOUT_SECONDS}s limit)")
            
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
    
    # Save boxes for validation (convert to GroundTruthBox format)
    gt_boxes = []
    for idx, box in enumerate(boxes):
        gt_box = GroundTruthBox(
            x1=box['x1'],
            y1=box['y1'],
            x2=box['x2'],
            y2=box['y2'],
            confidence=box['confidence'],
            label=box['label'],
            class_id=box['class_id'],
            is_verified=False,  # Not verified yet
            is_correct=True      # Default assumption (until user marks as FP)
        )
        gt_boxes.append(gt_box)
    
    # Save validation data - append to session's image list
    validation_file = VALIDATION_DIR / f"{session_id}.json"
    image_id = f"{session_id}_{int(time.time() * 1000)}"  # Unique image ID
    
    # Assign unique box_ids
    for idx, gt_box in enumerate(gt_boxes):
        gt_box.box_id = f"{image_id}_box_{idx}"
    
    # Load existing session data or create new
    if validation_file.exists():
        with open(validation_file, 'r') as f:
            session_data = json.load(f)
        print(f"[INFERENCE] Loading existing session {session_id}: {len(session_data.get('images', []))} images already stored")
    else:
        session_data = {
            "session_id": session_id,
            "images": []
        }
        print(f"[INFERENCE] Creating new session {session_id}")
    
    # Add this image's data
    image_data = {
        "image_id": image_id,
        "timestamp": datetime.utcnow().isoformat(),
        "boxes": [b.dict() for b in gt_boxes],
        "yolo_metrics": metrics
    }
    session_data["images"].append(image_data)
    
    print(f"[INFERENCE] Appending new image {image_id}. Total images now: {len(session_data['images'])}")
    
    with open(validation_file, 'w') as f:
        json.dump(session_data, f, default=str)
    
    # Return boxes with box_ids for frontend
    boxes_with_ids = []
    for idx, box in enumerate(boxes):
        box_with_id = box.copy()
        box_with_id['box_id'] = f"{image_id}_box_{idx}"
        boxes_with_ids.append(box_with_id)
    
    return {
        "session_id": session_id,
        "image_id": image_id,
        "boxes": boxes_with_ids,
        "count": len(boxes),
        "metrics": metrics
    }
