@echo off
setlocal enabledelayedexpansion

echo 🚀 Starting Kalshi Analytics Development Environment

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is required but not installed
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is required but not installed
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is required but not installed
    pause
    exit /b 1
)

echo 📦 Starting Python Kalshi API service...
cd python-service

REM Check if virtual environment exists, create if not
if not exist "venv" (
    echo 🔨 Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install dependencies
echo 📥 Installing Python dependencies...
pip install -r requirements.txt

REM Check if config.env exists
if not exist "config.env" (
    echo ❌ config.env file not found in python-service directory
    echo 📝 Please create config.env with your Kalshi API credentials:
    echo KALSHI_EMAIL=your-email@example.com
    echo KALSHI_PASSWORD=your-password
    echo KALSHI_BASE_URL=https://trading-api.kalshi.com/trade-api/v2
    pause
    exit /b 1
)

REM Start Python service in background
echo 🐍 Starting Python service on port 8000...
start /B python main.py

cd ..

REM Wait a bit for Python service to start
timeout /t 5 /nobreak >nul

echo 📦 Starting Node.js backend...

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📥 Installing Node.js dependencies...
    npm install
)

REM Set environment variables
set PYTHON_SERVICE_URL=http://localhost:8000
set PORT=3000

REM Start Node.js backend in background
echo ⚡ Starting Node.js backend on port 3000...
start /B npm run dev

REM Wait a bit for Node.js backend to start
timeout /t 3 /nobreak >nul

echo 📦 Starting frontend development server...
echo 🌐 Starting frontend on port 5173...
echo 🔗 Open http://localhost:5173 in your browser

REM Start frontend (this will be in foreground)
npm run dev

echo Press any key to stop all services...
pause >nul 