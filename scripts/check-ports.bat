@echo off
echo 🔍 Checking port availability for Kalshi Analytics...
echo.

REM Check port 3000 (Node.js Backend)
echo Checking port 3000 (Node.js Backend)...
netstat -ano | findstr :3000 >nul
if %errorlevel% equ 0 (
    echo ❌ Port 3000 is already in use
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
        echo    Process ID: %%a
        echo    To kill: taskkill /PID %%a /F
    )
) else (
    echo ✅ Port 3000 is available
)
echo.

REM Check port 5173 (Frontend)
echo Checking port 5173 (Frontend Dev Server)...
netstat -ano | findstr :5173 >nul
if %errorlevel% equ 0 (
    echo ❌ Port 5173 is already in use
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do (
        echo    Process ID: %%a
        echo    To kill: taskkill /PID %%a /F
    )
) else (
    echo ✅ Port 5173 is available
)
echo.

REM Check port 8000 (Python API)
echo Checking port 8000 (Python Kalshi API)...
netstat -ano | findstr :8000 >nul
if %errorlevel% equ 0 (
    echo ❌ Port 8000 is already in use
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000') do (
        echo    Process ID: %%a
        echo    To kill: taskkill /PID %%a /F
    )
) else (
    echo ✅ Port 8000 is available
)
echo.

echo 💡 Quick port cleanup commands:
echo    Kill all Node.js processes: taskkill /IM node.exe /F
echo    Kill all Python processes: taskkill /IM python.exe /F
echo.
echo 🚀 To start the services: start-dev.bat
echo.
pause 