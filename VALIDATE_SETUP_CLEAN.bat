@echo off
REM Validation script launcher - avoids terminal input issues

setlocal enabledelayedexpansion

echo.
echo ========================================
echo   SETUP VALIDATION
echo ========================================
echo.

REM Check Node.js
node -v >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not found
    pause
    exit /b 1
)

cd /d "c:\Users\Admin\Music\drops\drops-crypto-api"

echo Running validation checks...
echo.

node validate-setup.js

if errorlevel 1 (
    echo.
    echo Validation failed. Fix the errors above.
    pause
    exit /b 1
)

echo.
echo All checks passed!
pause
