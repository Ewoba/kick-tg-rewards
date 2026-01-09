@echo off
cd /d C:\Users\Admin\Music\drops\drops-crypto-api
echo Running: npm run prisma:generate
"C:\Program Files\nodejs\npm.cmd" run prisma:generate
echo Done
pause
