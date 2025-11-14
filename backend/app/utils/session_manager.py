"""
Session manager to track uploads per session and prevent abuse.
"""
from collections import defaultdict
from datetime import datetime, timedelta
import threading
from app.config.security import MAX_IMAGES_PER_SESSION, SESSION_TTL_MINUTES

class SessionManager:
    def __init__(self, max_images_per_session=MAX_IMAGES_PER_SESSION, session_ttl_minutes=SESSION_TTL_MINUTES):
        self.max_images_per_session = max_images_per_session
        self.session_ttl_minutes = session_ttl_minutes
        self.sessions = defaultdict(lambda: {"count": 0, "created_at": datetime.now()})
        self.lock = threading.Lock()
    
    def can_upload(self, session_id: str) -> tuple[bool, str]:
        """
        Check if session can upload another image.
        Returns (allowed, reason).
        """
        with self.lock:
            # Clean old sessions first
            self._cleanup_old_sessions()
            
            session = self.sessions[session_id]
            
            # Check if session has too many images
            if session["count"] >= self.max_images_per_session:
                return False, f"Session limit reached ({self.max_images_per_session} images max)"
            
            return True, ""
    
    def increment(self, session_id: str):
        """Increment upload count for session."""
        with self.lock:
            if session_id not in self.sessions:
                self.sessions[session_id] = {
                    "count": 0,
                    "created_at": datetime.now()
                }
            self.sessions[session_id]["count"] += 1
    
    def get_count(self, session_id: str) -> int:
        """Get current upload count for session."""
        with self.lock:
            return self.sessions.get(session_id, {}).get("count", 0)
    
    def _cleanup_old_sessions(self):
        """Remove sessions older than TTL."""
        now = datetime.now()
        cutoff = now - timedelta(minutes=self.session_ttl_minutes)
        
        expired = [
            sid for sid, data in self.sessions.items()
            if data["created_at"] < cutoff
        ]
        
        for sid in expired:
            del self.sessions[sid]

# Global instance
session_manager = SessionManager()
