# VisionPulse - Deployment Guide

## Quick Deploy (Render.com - FREE)

### Backend Deployment

1. **Create account at [render.com](https://render.com)**

2. **Create New Web Service**
   - Connect your GitHub repo: `Ansh2610/My-todo-list`
   - Root Directory: `backend`
   - Environment: `Python 3`
   - Build Command: `pip install -r requirements.txt && python -c "from ultralytics import YOLO; YOLO('yolov8n.pt')"`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   
3. **Add Environment Variables**
   ```
   PYTHONUNBUFFERED=1
   MAX_UPLOAD_SIZE=10485760
   ALLOWED_ORIGINS=https://your-frontend-url.onrender.com
   ```

4. **Note the backend URL** (e.g., `https://visionpulse-api.onrender.com`)

### Frontend Deployment

1. **Create New Static Site**
   - Connect same repo
   - Root Directory: `frontend`
   - Build Command: `npm install && VITE_API_URL=https://your-backend-url.onrender.com VITE_WS_URL=wss://your-backend-url.onrender.com npm run build`
   - Publish Directory: `dist`

2. **Update Backend CORS** with frontend URL in environment variables

### Your Shareable Link
Your app will be live at: `https://visionpulse.onrender.com` 🚀

---

## Alternative: Railway.app (Also FREE)

1. Install Railway CLI: `npm install -g @railway/cli`
2. Login: `railway login`
3. Deploy:
   ```
   cd backend
   railway up
   ```
4. Get URL from dashboard

---

## Docker Deployment (Self-hosted)

```bash
# Install Docker first: https://docs.docker.com/get-docker/

# Build and run
docker-compose up --build

# Access at http://localhost
```

## Health Check
Backend: `GET /api/health`
Frontend: Open browser to deployed URL
