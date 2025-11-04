# VisionPulse

AI-assisted image labeling with live inference monitoring. Upload → auto-detect → edit → export YOLO format.

## Quick Start

```bash
# local dev
docker-compose up

# frontend: http://localhost:5173
# backend: http://localhost:8000
```

## Features

- YOLOv8 auto-labeling
- Edit bounding boxes
- YOLO format export
- Real-time metrics (FPS, confidence, false-pos tracking)
- WebSocket streaming

## Stack

- Frontend: React + Vite + TypeScript + Tailwind
- Backend: FastAPI + YOLOv8
- Deploy: Vercel (FE) + EC2 (BE)

## Setup (Local)

```bash
# clone
git clone https://github.com/yourname/visionpulse
cd visionpulse

# run
docker-compose up
```

## Security

- Input validation (max 10MB, MIME check)
- Sandboxed inference (timeout)
- Ephemeral storage (auto-cleanup)
- Rate limiting
- See `SECURITY.md` for details

## Deploy (EC2)

```bash
# see ec2/deploy_ec2.sh
./ec2/deploy_ec2.sh
```

## Metrics

- **FPS**: Inference speed
- **Avg Confidence**: Mean confidence across boxes
- **False Positive Rate**: % boxes < 0.5 confidence (proxy)

## License

MIT
