"""
Security middleware for VisionPulse API.

Implements:
- CSRF protection for state-changing operations
- Security headers (CSP, HSTS, X-Frame-Options, etc.)
- Request sanitization
"""
import secrets
from typing import Optional
from fastapi import Request, HTTPException, status
from fastapi.responses import Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp


class CSRFProtectionMiddleware(BaseHTTPMiddleware):
    """
    CSRF token validation for state-changing operations.
    
    Protects POST, PUT, DELETE, PATCH endpoints.
    Requires 'X-CSRF-Token' header matching cookie value.
    """
    
    def __init__(self, app: ASGIApp, secret_key: str = None):
        super().__init__(app)
        self.secret_key = secret_key or secrets.token_urlsafe(32)
        
    async def dispatch(self, request: Request, call_next):
        # Generate CSRF token for GET requests
        if request.method == "GET":
            response = await call_next(request)
            
            # Set CSRF token cookie if not exists
            csrf_token = request.cookies.get("csrf_token")
            if not csrf_token:
                csrf_token = secrets.token_urlsafe(32)
                response.set_cookie(
                    key="csrf_token",
                    value=csrf_token,
                    httponly=True,
                    secure=True,  # HTTPS only in production
                    samesite="strict",
                    max_age=3600  # 1 hour
                )
            
            return response
        
        # Validate CSRF token for state-changing operations
        if request.method in ["POST", "PUT", "DELETE", "PATCH"]:
            # Skip CSRF for WebSocket upgrades
            if request.url.path.startswith("/ws/"):
                return await call_next(request)
            
            # Skip CSRF for health check
            if request.url.path == "/health":
                return await call_next(request)
            
            # Skip CSRF in local development (localhost only)
            # TODO: Remove this in production!
            if "localhost" in request.url.netloc or "127.0.0.1" in request.url.netloc:
                return await call_next(request)
            
            # Get token from header and cookie
            header_token = request.headers.get("X-CSRF-Token")
            cookie_token = request.cookies.get("csrf_token")
            
            # Validate tokens exist and match
            if not header_token or not cookie_token:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="CSRF token missing"
                )
            
            if not secrets.compare_digest(header_token, cookie_token):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="CSRF token invalid"
                )
        
        return await call_next(request)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Add security headers to all responses.
    
    Headers:
    - Content-Security-Policy: Prevent XSS
    - X-Frame-Options: Prevent clickjacking
    - X-Content-Type-Options: Prevent MIME sniffing
    - Strict-Transport-Security: Enforce HTTPS
    - X-XSS-Protection: Browser XSS filter (legacy)
    - Referrer-Policy: Control referrer information
    """
    
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Determine if we're in development mode
        is_dev = request.url.scheme == "http" and "localhost" in request.url.netloc
        
        # Content Security Policy (relaxed for development)
        if is_dev:
            # Development: Allow localhost origins
            response.headers["Content-Security-Policy"] = (
                "default-src 'self' http://localhost:* http://127.0.0.1:*; "
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:* http://127.0.0.1:*; "
                "style-src 'self' 'unsafe-inline' http://localhost:* http://127.0.0.1:*; "
                "img-src 'self' data: blob: http://localhost:* http://127.0.0.1:*; "
                "font-src 'self' http://localhost:* http://127.0.0.1:*; "
                "connect-src 'self' ws://localhost:* ws://127.0.0.1:* http://localhost:* http://127.0.0.1:* wss:; "
                "frame-ancestors 'none'"
            )
        else:
            # Production: Strict CSP
            response.headers["Content-Security-Policy"] = (
                "default-src 'self'; "
                "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "  # Allow React
                "style-src 'self' 'unsafe-inline'; "
                "img-src 'self' data: blob:; "
                "font-src 'self'; "
                "connect-src 'self' wss:; "
                "frame-ancestors 'none'"
            )
        
        # Prevent clickjacking
        response.headers["X-Frame-Options"] = "DENY"
        
        # Prevent MIME sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"
        
        # Enforce HTTPS (production only)
        if request.url.scheme == "https":
            response.headers["Strict-Transport-Security"] = (
                "max-age=31536000; includeSubDomains; preload"
            )
        
        # XSS Protection (legacy, but doesn't hurt)
        response.headers["X-XSS-Protection"] = "1; mode=block"
        
        # Referrer Policy
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # Permissions Policy (disable unnecessary features)
        response.headers["Permissions-Policy"] = (
            "geolocation=(), microphone=(), camera=(), payment=()"
        )
        
        return response


def validate_session_id(session_id: str) -> str:
    """
    Validate and sanitize session ID.
    
    Security: Prevent path traversal, SQL injection, command injection.
    
    Args:
        session_id: User-provided session ID
    
    Returns:
        Sanitized session ID
    
    Raises:
        ValueError: If session ID is invalid
    """
    import re
    
    # Must be alphanumeric, hyphens, underscores only
    if not re.match(r'^[a-zA-Z0-9_-]+$', session_id):
        raise ValueError("Invalid session_id format")
    
    # Max length check
    if len(session_id) > 100:
        raise ValueError("session_id too long")
    
    # Prevent path traversal
    if '..' in session_id or '/' in session_id or '\\' in session_id:
        raise ValueError("Invalid session_id characters")
    
    return session_id


def sanitize_filename(filename: str, max_length: int = 255) -> str:
    """
    Sanitize user-provided filename.
    
    Security: Prevent path traversal, command injection, null bytes.
    
    Args:
        filename: User-provided filename
        max_length: Maximum allowed length
    
    Returns:
        Sanitized filename
    """
    import re
    from pathlib import Path
    
    # Remove path components (keep only filename)
    filename = Path(filename).name
    
    # Remove null bytes
    filename = filename.replace('\x00', '')
    
    # Allow alphanumeric, dots, hyphens, underscores only
    filename = re.sub(r'[^a-zA-Z0-9._-]', '_', filename)
    
    # Prevent hidden files
    if filename.startswith('.'):
        filename = '_' + filename[1:]
    
    # Truncate to max length
    if len(filename) > max_length:
        name_part = filename[:max_length - 10]
        ext_part = filename[-10:]
        filename = name_part + ext_part
    
    return filename or 'unnamed_file'


def validate_image_content(file_bytes: bytes, max_size: int = 10 * 1024 * 1024) -> bool:
    """
    Validate image file content.
    
    Security: Prevent malicious files, zip bombs, memory exhaustion.
    
    Args:
        file_bytes: Image file bytes
        max_size: Maximum allowed file size in bytes
    
    Returns:
        True if valid
    
    Raises:
        ValueError: If file is invalid or malicious
    """
    from PIL import Image
    import io
    
    # Size check
    if len(file_bytes) > max_size:
        raise ValueError(f"File too large (max {max_size / 1024 / 1024}MB)")
    
    # Minimum size check (prevent empty files)
    if len(file_bytes) < 100:
        raise ValueError("File too small (likely corrupt or empty)")
    
    # Validate it's actually an image
    try:
        img = Image.open(io.BytesIO(file_bytes))
        
        # Check image dimensions (prevent zip bombs)
        width, height = img.size
        if width * height > 50_000_000:  # 50 megapixels max
            raise ValueError("Image dimensions too large")
        
        # Verify format
        if img.format not in ['JPEG', 'PNG', 'WEBP']:
            raise ValueError(f"Unsupported format: {img.format}")
        
        # Close image
        img.close()
        
        return True
        
    except Exception as e:
        raise ValueError(f"Invalid image file: {str(e)}")
