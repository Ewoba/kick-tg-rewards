Write-Host "=== Start Drops Crypto API ===" -ForegroundColor Green

if (-not (Test-Path .env)) {
    Write-Host "ERROR: .env not found" -ForegroundColor Red
    exit 1
}

$npm = (Get-Command npm.cmd -ErrorAction SilentlyContinue) -or (Get-Command npm -ErrorAction SilentlyContinue)
if (-not $npm) {
    Write-Host "ERROR: npm not found. Install Node.js and ensure npm is on PATH." -ForegroundColor Red
    exit 1
}

Write-Host "Launching backend using: $($npm.Path)" -ForegroundColor Gray
Start-Process -FilePath $npm.Path -ArgumentList 'run','start:dev' -WorkingDirectory (Get-Location) -NoNewWindow -Wait
Write-Host "=== Start Drops Crypto API ===" -ForegroundColor Green

if (-not (Test-Path .env)) {
    Write-Host "ERROR: .env not found" -ForegroundColor Red
    exit 1
}

$npm = (Get-Command npm.cmd -ErrorAction SilentlyContinue) -or (Get-Command npm -ErrorAction SilentlyContinue)
if (-not $npm) {
    Write-Host "ERROR: npm not found. Install Node.js and ensure npm is on PATH." -ForegroundColor Red
    exit 1
}

Write-Host "Launching backend using: $($npm.Path)" -ForegroundColor Gray
Start-Process -FilePath $npm.Path -ArgumentList 'run','start:dev' -WorkingDirectory (Get-Location) -NoNewWindow -Wait
# Скрипт запуска Backend
Write-Host "=== Запуск Drops Crypto API ===" -ForegroundColor Green

# Проверка .env
if (-not (Test-Path .env)) {
    Write-Host "✗ .env файл не найден" -ForegroundColor Red
    exit 1
}

$envContent = Get-Content .env -Raw
if ($envContent -match "your_twitch_client_id_here") {
    Write-Host "⚠ Предупреждение: TWITCH_CLIENT_ID и TWITCH_CLIENT_SECRET не настроены" -ForegroundColor Yellow
    Write-Host "Backend запустится, но Twitch OAuth не будет работать" -ForegroundColor Yellow
}

Write-Host "`nЗапуск backend на http://localhost:3000..." -ForegroundColor Cyan
Write-Host "Для остановки нажмите Ctrl+C`n" -ForegroundColor Gray

# Найти npm (предпочтительно npm.cmd для Windows)
$npmCmd = (Get-Command npm.cmd -ErrorAction SilentlyContinue) -or (Get-Command npm -ErrorAction SilentlyContinue)
if (-not $npmCmd) {
    Write-Host "✗ npm не найден. Установите Node.js (https://nodejs.org/) и перезапустите терминал." -ForegroundColor Red
    exit 1
}

# Запускаем npm в текущей директории (где лежит backend)
Write-Host "Использую: $($npmCmd.Path)" -ForegroundColor Gray
& $npmCmd.Path run start:dev
