"""
Background task to cleanup old uploaded files.
Runs periodically to prevent disk space issues.
"""
import os
import time
from pathlib import Path
from datetime import datetime, timedelta
import threading
import tempfile
from app.config.security import FILE_TTL_MINUTES, CLEANUP_INTERVAL_MINUTES

UPLOAD_DIR = Path(tempfile.gettempdir()) / "visionpulse_uploads"

def cleanup_old_files():
    """Delete uploaded files older than TTL."""
    if not UPLOAD_DIR.exists():
        return
    
    now = datetime.now()
    cutoff = now - timedelta(minutes=FILE_TTL_MINUTES)
    
    deleted_count = 0
    for filepath in UPLOAD_DIR.glob("*"):
        if not filepath.is_file():
            continue
        
        # Check file age
        modified_time = datetime.fromtimestamp(filepath.stat().st_mtime)
        if modified_time < cutoff:
            try:
                filepath.unlink()
                deleted_count += 1
            except Exception as e:
                print(f"Failed to delete {filepath}: {e}")
    
    if deleted_count > 0:
        print(f"Cleaned up {deleted_count} old files")

def start_cleanup_task(interval_minutes=CLEANUP_INTERVAL_MINUTES):
    """Start background cleanup task."""
    def run():
        while True:
            try:
                cleanup_old_files()
            except Exception as e:
                print(f"Cleanup task error: {e}")
            time.sleep(interval_minutes * 60)
    
    thread = threading.Thread(target=run, daemon=True)
    thread.start()
    print(f"Started cleanup task (runs every {interval_minutes} minutes)")
