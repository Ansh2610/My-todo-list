#!/usr/bin/env python3
"""
Quick demo script to test the API locally
Run backend first: docker-compose up backend
"""

import requests
import time

API_URL = "http://localhost:8000"

def test_api():
    print("Testing VisionPulse API...")
    
    # health check
    print("\n1. Health check...")
    r = requests.get(f"{API_URL}/health")
    print(f"   Status: {r.status_code}")
    print(f"   Response: {r.json()}")
    
    # TODO: add actual upload test with sample image
    # For now, just checking if server is alive
    
    print("\nAPI is running! Open http://localhost:5173 to test UI")

if __name__ == "__main__":
    try:
        test_api()
    except requests.exceptions.ConnectionError:
        print("Error: Backend not running. Start with: docker-compose up backend")
