# Quick Start (No Docker) - PowerShell

Write-Host "Starting VisionPulse locally..." -ForegroundColor Cyan
Write-Host ""

# Check dependencies
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Python not found. Install Python 3.11+ first." -ForegroundColor Red
    exit 1
}

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Node.js not found. Install Node.js 20+ first." -ForegroundColor Red
    exit 1
}

Write-Host "[1/4] Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
python -m pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install backend deps" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[2/4] Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location ..\frontend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to install frontend deps" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[3/4] Starting backend server..." -ForegroundColor Yellow
Set-Location ..\backend
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
}

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "[4/4] Starting frontend dev server..." -ForegroundColor Yellow
Set-Location ..\frontend
$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    npm run dev
}

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "VisionPulse is running!" -ForegroundColor Green
Write-Host ""
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:8000" -ForegroundColor Cyan
Write-Host "API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop servers..."

# Wait for user to cancel
try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    Write-Host "Stopping servers..." -ForegroundColor Yellow
    Stop-Job $backendJob -ErrorAction SilentlyContinue
    Stop-Job $frontendJob -ErrorAction SilentlyContinue
    Remove-Job $backendJob -ErrorAction SilentlyContinue
    Remove-Job $frontendJob -ErrorAction SilentlyContinue
}
