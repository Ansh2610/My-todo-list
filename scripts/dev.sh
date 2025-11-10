#!/bin/bash
# Quick dev setup script

echo "Setting up VisionPulse development environment..."

# check docker
if ! command -v docker &> /dev/null; then
    echo "Error: Docker not found. Install Docker first."
    exit 1
fi

# check docker-compose
if ! command -v docker-compose &> /dev/null; then
    echo "Error: docker-compose not found. Install docker-compose first."
    exit 1
fi

echo "Starting services..."
docker-compose up -d

echo ""
echo "Services starting..."
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
echo ""
echo "Run 'docker-compose logs -f' to see logs"
