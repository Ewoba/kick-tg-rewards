@echo off
setlocal

cd /d "c:\Users\Admin\Music\drops\drops-crypto-app"

echo Starting Expo (tunnel) - this allows physical devices to connect via QR code

start "EXPO-TUNNEL" cmd /k "cd /d c:\Users\Admin\Music\drops\drops-crypto-app && npx expo start -c --tunnel"

echo Expo launched in new window (tunnel mode).

pause
