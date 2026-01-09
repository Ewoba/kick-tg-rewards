# Script to start the entire project
Write-Host "=== Start Drops Crypto Project ===" -ForegroundColor Green

# 1) Check Docker
Write-Host "`n1. Check Docker..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "   Docker is running" -ForegroundColor Green
} catch {
    Write-Host "   Docker is NOT running" -ForegroundColor Red
    Write-Host "   Start Docker Desktop and retry." -ForegroundColor Yellow
    exit 1
}

# Запуск Docker Compose (если не запущен)
Write-Host "`n2. Проверка Docker Compose..." -ForegroundColor Yellow
$containers = docker ps --filter "name=postgres" --format "{{.Names}}"
if (-not $containers) {
    Write-Host "   Starting Docker Compose..." -ForegroundColor Cyan
    Set-Location drops-crypto-api
    docker compose up -d
    Set-Location ..
    Start-Sleep -Seconds 3
    Write-Host "   Containers started" -ForegroundColor Green
} else {
    Write-Host "   Containers already running" -ForegroundColor Green
}

# Запуск Backend
Write-Host "`n3. Start Backend..." -ForegroundColor Yellow
Write-Host "   Backend will start in a background window..." -ForegroundColor Cyan

# Запустить backend в отдельном окне PowerShell, используя npm.cmd
$backendPath = Join-Path $PSScriptRoot 'drops-crypto-api'
## Resolve npm path (prefer npm.cmd on Windows)
$npmCmdInfo = Get-Command npm.cmd -ErrorAction SilentlyContinue
if (-not $npmCmdInfo) { $npmCmdInfo = Get-Command npm -ErrorAction SilentlyContinue }
$npmPath = if ($npmCmdInfo) { $npmCmdInfo.Path } else { $null }

if ($npmPath) {
    Write-Host "   Launching backend via: $npmPath" -ForegroundColor Gray
    Start-Process -FilePath $npmPath -ArgumentList 'run','start:dev' -WorkingDirectory $backendPath -WindowStyle Normal
} else {
    Write-Host "   npm not found. Install Node.js and ensure 'npm' is on PATH." -ForegroundColor Red
    Write-Host "   To start backend manually: cd $backendPath; npm run start:dev" -ForegroundColor Yellow
}

Start-Sleep -Seconds 5

# Проверка ngrok
Write-Host "`n4. Check ngrok..." -ForegroundColor Yellow
$ngrokPath = where.exe ngrok 2>$null
if ($ngrokPath) {
    Write-Host "   Launching ngrok in a separate window..." -ForegroundColor Cyan
    Start-Process -FilePath powershell -ArgumentList '-NoExit','-File', "$PSScriptRoot\start-ngrok.ps1" -WindowStyle Normal
    Write-Host "   ngrok started" -ForegroundColor Green
} else {
    Write-Host "   ngrok not found. Run manually: ngrok http 3000" -ForegroundColor Red
}

# Запуск Mobile App
Write-Host "`n5. Start Mobile App..." -ForegroundColor Yellow
Write-Host "   Launching Mobile App in a separate window..." -ForegroundColor Cyan

$appPath = Join-Path $PSScriptRoot 'drops-crypto-app'
if ($npmPath) {
    Write-Host "   Launching mobile app via: $npmPath" -ForegroundColor Gray
    Start-Process -FilePath $npmPath -ArgumentList 'start' -WorkingDirectory $appPath -WindowStyle Normal
} else {
    Write-Host "   npm not found. Install Node.js and run manually: cd $appPath; npm start" -ForegroundColor Red
}

Write-Host "`n=== All services started ===" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Copy ngrok HTTPS URL from the ngrok window" -ForegroundColor White
Write-Host "2. Update PUBLIC_BASE_URL and TWITCH_REDIRECT_URI in drops-crypto-api/.env" -ForegroundColor White
Write-Host "3. Update API_BASE in drops-crypto-app/App.tsx" -ForegroundColor White
Write-Host "4. Add Redirect URL in Twitch Developer Console" -ForegroundColor White
Write-Host "5. Restart backend after .env changes" -ForegroundColor White
