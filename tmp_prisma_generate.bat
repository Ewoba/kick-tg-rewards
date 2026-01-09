@echo off
cd /d C:\Users\Admin\Music\drops\drops-crypto-api
"C:\Program Files\nodejs\npx.cmd" prisma generate > prisma-gen.log 2>&1
type prisma-gen.log
pause
