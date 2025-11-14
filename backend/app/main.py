from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import os
import secrets

from app.routers import upload, inference, export, ws, validation
from app.middleware.security import SecurityHeadersMiddleware, CSRFProtectionMiddleware
from app.utils.cleanup import start_cleanup_task

limiter = Limiter(key_func=get_remote_address)
app = FastAPI(
    title="VisionPulse API",
    description="AI-assisted image annotation with ground truth validation",
    version="2.0.0"
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Security Middleware (order matters!)
# 1. Security Headers (with dev/prod detection)
app.add_middleware(SecurityHeadersMiddleware)

# 2. CSRF Protection (skip localhost in dev mode)
csrf_secret = os.getenv("CSRF_SECRET_KEY", "change-me-in-production")
app.add_middleware(CSRFProtectionMiddleware, secret_key=csrf_secret)

# 3. CORS - allow local + production
allowed_origins = os.getenv(
    "ALLOWED_ORIGINS", 
    "http://localhost:5173,http://localhost:5174,http://localhost:80"
).split(",") + [
    "https://vision-pulse-ag.vercel.app",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(upload.router, prefix="/api", tags=["upload"])
app.include_router(inference.router, prefix="/api", tags=["inference"])
app.include_router(validation.router, prefix="/api", tags=["validation"])
app.include_router(export.router, prefix="/api", tags=["export"])
app.include_router(ws.router, prefix="/ws", tags=["websockets"])

# Start background cleanup task on startup
@app.on_event("startup")
def startup_event():
    """Start cleanup task when server starts."""
    start_cleanup_task()  # Uses CLEANUP_INTERVAL_MINUTES from config

@app.get("/")
async def root():
    return {"status": "alive", "version": "0.1.0"}

@app.get("/health")
async def health():
    return {"ok": True}

@app.get("/csrf-token")
async def get_csrf_token(request: Request):
    """
    Get CSRF token for frontend.
    Token is set in cookie and returned in response.
    """
    csrf_token = request.cookies.get("csrf_token")
    if not csrf_token:
        csrf_token = secrets.token_urlsafe(32)
    
    response = JSONResponse({"csrf_token": csrf_token})
    response.set_cookie(
        key="csrf_token",
        value=csrf_token,
        httponly=True,
        secure=False,  # Set to True in production (HTTPS only)
        samesite="lax",
        max_age=3600  # 1 hour
    )
    return response

@app.get("/limits")
async def get_limits():
    """Return current security limits for transparency."""
    from app.config.security import (
        MAX_UPLOAD_SIZE_MB,
        MAX_IMAGES_PER_SESSION,
        UPLOAD_RATE_LIMIT,
        INFERENCE_RATE_LIMIT,
        ALLOWED_MIME_TYPES
    )
    return {
        "max_upload_size_mb": MAX_UPLOAD_SIZE_MB,
        "max_images_per_session": MAX_IMAGES_PER_SESSION,
        "upload_rate_limit": UPLOAD_RATE_LIMIT,
        "inference_rate_limit": INFERENCE_RATE_LIMIT,
        "allowed_mime_types": ALLOWED_MIME_TYPES
    }
