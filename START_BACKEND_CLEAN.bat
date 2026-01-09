@echo off
REM Direct Node.js launcher - no terminal input corruption
REM This file uses only ASCII characters to avoid Cyrillic issues

setlocal enabledelayedexpansion

echo.
echo ========================================
echo   DROPS CRYPTO BACKEND LAUNCHER
echo ========================================
echo.

REM Check Node.js is installed
echo Checking Node.js installation...
node -v >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo Found Node.js: !NODE_VERSION!
echo.

REM Navigate to backend directory
cd /d "c:\Users\Admin\Music\drops\drops-crypto-api"
if errorlevel 1 (
    echo ERROR: Could not navigate to backend directory
    pause
    exit /b 1
)

REM Check if backend is compiled
if not exist "dist\src\main.js" (
    echo ERROR: Backend is not compiled!
    echo Please run: BUILD_BACKEND.bat first
    echo Or run: npm run build
    pause
    exit /b 1
)

echo ✓ Backend compiled successfully
echo.
echo Starting backend server on port 3000...
echo Listening at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start Node.js directly
node dist\src\main.js

REM If we get here, the server stopped
echo.
echo Backend process exited.
pause
