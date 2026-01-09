@echo off
REM Complete setup and verification script

echo.
echo ============================================
echo DROPS CRYPTO - COMPLETE SETUP VERIFICATION
echo ============================================
echo.
echo Step 1: Starting backend on port 3000...
echo.
start "" cmd /k "cd /d c:\Users\Admin\Music\drops\drops-crypto-api && node dist/src/main.js"
echo Backend window opened. Waiting 3 seconds...
timeout /t 3 /nobreak

echo.
echo Step 2: Testing backend health endpoint...
curl.exe http://localhost:3000/health
echo.

echo Step 3: Testing Twitch credentials...
cd /d c:\Users\Admin\Music\drops\drops-crypto-api
node test-twitch-token.js
echo.

echo Step 4: Instructions for manual testing...
echo.
echo TO TEST OAUTH FLOW:
echo 1. Open browser: http://localhost:3000/auth/twitch/start
echo 2. Sign in with your Twitch account (tiktak6828)
echo 3. Copy the JWT token from the callback
echo 4. Update ADMIN_TWITCH_IDS in .env with your twitchUserId
echo.
echo TO START MOBILE APP:
echo 1. Open new terminal
echo 2. cd c:\Users\Admin\Music\drops\drops-crypto-app
echo 3. npx expo start -c
echo 4. Press 'a' for Android emulator
echo.
echo Full port 3000 configuration:
echo - Backend: http://localhost:3000
echo - Mobile: http://10.0.2.2:3000 (for Android emulator)
echo.
echo ============================================
pause
