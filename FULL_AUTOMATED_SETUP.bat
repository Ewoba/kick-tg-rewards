@echo off
REM Complete automated setup and validation

title Drops Crypto - Complete Setup

echo.
echo ============================================
echo   DROPS CRYPTO - COMPLETE SETUP AUTOMATION
echo ============================================
echo.

cd /d "%~dp0drops-crypto-api"

REM Step 1: Validate setup
echo [Step 1] Validating configuration...
node validate-setup.js
if errorlevel 1 (
    echo.
    echo Setup validation failed. Please fix the errors above.
    pause
    exit /b 1
)

echo.
echo [Step 2] Testing OAuth URL generation...
node test-oauth-url.js

echo.
echo [Step 3] Building backend...
call npm run build
if errorlevel 1 (
    echo Build failed!
    pause
    exit /b 1
)

echo.
echo ============================================
echo   SETUP COMPLETE! Starting backend...
echo ============================================
echo.

node dist\src\main.js

pause
