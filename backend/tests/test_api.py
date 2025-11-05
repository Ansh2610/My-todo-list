import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root():
    """Basic health check"""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "alive"

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["ok"] is True

def test_upload_no_file():
    """Upload without file should fail"""
    response = client.post("/api/upload")
    assert response.status_code == 422  # unprocessable entity

def test_upload_too_large():
    """File > 10MB should fail"""
    # create fake large file
    large_file = b"x" * (11 * 1024 * 1024)  # 11MB
    files = {"file": ("test.jpg", large_file, "image/jpeg")}
    response = client.post("/api/upload", files=files)
    assert response.status_code == 400

# TODO: add tests for inference, export, websockets
# need to mock YOLO model first
