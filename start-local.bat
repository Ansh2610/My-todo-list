@echo off
REM Quick start script for Windows (no Docker)

echo Starting VisionPulse locally...
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python not found. Install Python 3.11+ first.
    exit /b 1
)

REM Check Node
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not found. Install Node.js 20+ first.
    exit /b 1
)

echo [1/4] Installing backend dependencies...
cd backend
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install backend deps
    exit /b 1
)

echo.
echo [2/4] Installing frontend dependencies...
cd ..\frontend
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install frontend deps
    exit /b 1
)

echo.
echo [3/4] Starting backend server...
cd ..\backend
start cmd /k "python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

echo.
echo [4/4] Starting frontend dev server...
cd ..\frontend
start cmd /k "npm run dev"

echo.
echo ================================
echo VisionPulse is starting!
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo ================================
echo.
echo Press any key to stop servers...
pause
