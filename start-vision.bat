@echo off
REM VisionPulse - Local Dev with Conda Environment 'vision'

echo ====================================
echo VisionPulse - Starting Local Dev
echo ====================================
echo.

REM Activate conda environment
call conda activate vision
if errorlevel 1 (
    echo ERROR: Failed to activate 'vision' environment
    echo Run: conda create -n vision python=3.11 -y
    pause
    exit /b 1
)

echo [1/2] Starting Backend (FastAPI)...
cd backend
start "VisionPulse Backend" cmd /k "conda activate vision && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

echo Waiting for backend to start...
timeout /t 3 /nobreak > nul

echo.
echo [2/2] Starting Frontend (Vite)...
cd ..\frontend
start "VisionPulse Frontend" cmd /k "npm run dev"

echo.
echo ====================================
echo VisionPulse is starting!
echo ====================================
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo.
echo ====================================
echo Close the terminal windows to stop
echo ====================================
