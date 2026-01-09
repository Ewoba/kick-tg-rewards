@echo off
pushd "%~dp0drops-crypto-api"
powershell -ExecutionPolicy Bypass -NoProfile -File "%~dp0drops-crypto-api\start-backend-clean.ps1"
popd
pause
