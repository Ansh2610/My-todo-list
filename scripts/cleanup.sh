#!/bin/bash
# Cleanup temp files (run as cron job on server)

UPLOAD_DIR="/tmp/uploads"
MAX_AGE=3600  # 1 hour

if [ -d "$UPLOAD_DIR" ]; then
    echo "Cleaning up temp files older than $MAX_AGE seconds..."
    find $UPLOAD_DIR -type f -mmin +60 -delete
    echo "Cleanup complete"
else
    echo "Upload dir not found: $UPLOAD_DIR"
fi
