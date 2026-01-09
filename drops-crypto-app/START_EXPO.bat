@echo off
setlocal enabledelayedexpansion

cd /d "c:\Users\Admin\Music\drops\drops-crypto-app"

echo ========================================
echo   Starting Expo Development Server
echo ========================================
echo.
echo Waiting for Expo to start...
echo.
echo Once the QR code appears:
echo   1. Press 'a' for Android emulator
echo   2. Or scan the QR code with Expo Go app
echo.
echo ========================================
echo.

node launch-expo.js

pause
