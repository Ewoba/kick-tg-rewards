@echo off
setlocal enabledelayedexpansion

echo.
echo ================================
echo   BACKEND HEALTH CHECK
echo ================================
echo.

cd /d "c:\Users\Admin\Music\drops\drops-crypto-api"

if not exist "test-health.js" (
    echo ❌ ERROR: test-health.js not found!
    echo Expected at: c:\Users\Admin\Music\drops\drops-crypto-api\test-health.js
    pause
    exit /b 1
)

echo Testing backend at http://localhost:3000/health...
echo.

node test-health.js

echo.
echo ================================
echo If you see: Status: 200, Body: {"ok":true}
echo Then BACKEND IS RUNNING! ✅
echo ================================
echo.

pause
