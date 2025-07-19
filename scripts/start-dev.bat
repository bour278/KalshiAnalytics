@echo off
setlocal enabledelayedexpansion

echo.
echo ====================================================================
echo = Starting Kalshi Analytics Development Environment
echo ====================================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is required but not installed
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is required but not installed
    pause
    exit /b 1
)

echo.
echo =================================================
echo = Starting Python Data Service (Backend)
echo =================================================
echo.
cd backend\data-service

REM Check if virtual environment exists, create if not
if not exist "venv" (
    echo [INFO] Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install dependencies
echo [INFO] Installing Python dependencies...
pip install -r requirements.txt >nul

REM Check if .env exists
if not exist ".env" (
    echo [ERROR] .env file not found in backend/data-service directory
    echo [INFO] Please create .env with your Kalshi API credentials:
    echo KALSHI_BASE_URL=https://trading-api.kalshi.com/trade-api/v2
    echo KALSHI_API_KEY=your_actual_api_key_here
    pause
    exit /b 1
)

REM Start Python service in background
echo [INFO] Starting Python service on port 8000...
start /B python main.py

cd ..\..

REM Wait a bit for Python service to start
timeout /t 5 /nobreak >nul

echo.
echo =================================================
echo = Starting API Gateway (Backend)
echo =================================================
echo.
cd backend\api-gateway

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo [INFO] Installing Node.js dependencies...
    npm install >nul
)

REM Set environment variables
set PYTHON_SERVICE_URL=http://localhost:8000
set PORT=3000

REM Start Node.js backend in background
echo [INFO] Starting Node.js backend on port 3000...
start /B npm run dev

cd ..\..

REM Wait a bit for Node.js backend to start
timeout /t 3 /nobreak >nul

echo.
echo =================================================
echo = Starting Frontend Development Server
echo =================================================
echo.
cd frontend

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo [INFO] Installing Node.js dependencies...
    npm install >nul
)

echo.
echo =======================================================================
echo.
echo   [SUCCESS] Frontend is starting on http://localhost:5173
echo.
echo   You can now open your browser and navigate to this URL.
echo.
echo =======================================================================
echo.

REM Start frontend (this will be in foreground)
npm run dev 