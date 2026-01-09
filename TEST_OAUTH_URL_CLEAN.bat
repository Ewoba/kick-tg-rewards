@echo off
REM Test OAuth URL generation - clean version

setlocal enabledelayedexpansion

echo.
echo ========================================
echo   OAUTH URL TEST
echo ========================================
echo.

cd /d "c:\Users\Admin\Music\drops\drops-crypto-api"

echo Generating OAuth URL...
echo.

node test-oauth-url.js

pause
