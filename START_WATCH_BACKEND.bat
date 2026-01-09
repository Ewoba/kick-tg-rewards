@echo off
setlocal

cd /d "c:\Users\Admin\Music\drops"

echo Starting log watcher (watch-backend.js) in new window...
start "BACKEND-WATCH" cmd /k "cd /d c:\Users\Admin\Music\drops && node watch-backend.js"

echo Log watcher started.

pause
