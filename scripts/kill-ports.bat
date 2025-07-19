@echo off
echo Killing processes on ports 3000, 5173, 8000...

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000"') do (
    echo Killing process with PID %%a on port 3000
    taskkill /PID %%a /F
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5173"') do (
    echo Killing process with PID %%a on port 5173
    taskkill /PID %%a /F
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8000"') do (
    echo Killing process with PID %%a on port 8000
    taskkill /PID %%a /F
)

echo.
echo Done.
pause 