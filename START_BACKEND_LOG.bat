@echo off
setlocal

cd /d "c:\Users\Admin\Music\drops\drops-crypto-api"

echo Starting backend with logging to backend.log
echo Working dir: %CD%

echo NOTE: This will write logs to backend.log in the backend folder.

echo Starting...

start "BACKEND-LOG" cmd /k "cd /d c:\Users\Admin\Music\drops\drops-crypto-api && echo Starting backend (logging to backend.log) && node dist\src\main.js > backend.log 2>&1"

echo Backend launched in new window.

pause
