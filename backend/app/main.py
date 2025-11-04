from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.routers import upload, inference, export, ws

limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="VisionPulse API")

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS for local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # TODO: restrict in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router, prefix="/api", tags=["upload"])
app.include_router(inference.router, prefix="/api", tags=["inference"])
app.include_router(export.router, prefix="/api", tags=["export"])
app.include_router(ws.router, prefix="/ws", tags=["websockets"])

@app.get("/")
async def root():
    return {"status": "alive", "version": "0.1.0"}

@app.get("/health")
async def health():
    return {"ok": True}
