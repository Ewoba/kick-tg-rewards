@echo off
REM Launch the full suite via PowerShell script
powershell -ExecutionPolicy Bypass -NoProfile -File "%~dp0start-all.ps1"
pause
