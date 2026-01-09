@echo off
REM Diagnose Twitch credentials

cd /d "c:\Users\Admin\Music\drops\drops-crypto-api"

echo.
echo Testing Twitch credentials with new secret...
echo.

node diagnose-twitch.js

pause
