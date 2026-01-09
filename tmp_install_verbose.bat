@echo off
cd /d C:\Users\Admin\Music\drops\drops-crypto-api
"C:\Program Files\nodejs\npm.cmd" install --verbose > install.log 2>&1
type install.log
pause
