# Быстрый старт всего проекта одной командой
Write-Host "=== Быстрый старт Drops Crypto ===" -ForegroundColor Green
Write-Host ""

# 1. Проверка Docker
Write-Host "1. Проверка Docker..." -ForegroundColor Yellow
try {
    $containers = docker ps --format "{{.Names}}" 2>$null
    if ($containers -match "postgres" -and $containers -match "redis") {
        Write-Host "   ✅ Контейнеры работают" -ForegroundColor Green
    } else {
        Write-Host "   ⚠ Запуск контейнеров..." -ForegroundColor Yellow
        Set-Location drops-crypto-api
        docker compose up -d
        Start-Sleep -Seconds 3
        Set-Location ..
        Write-Host "   ✅ Контейнеры запущены" -ForegroundColor Green
    }
} catch {
    Write-Host "   ✗ Docker недоступен" -ForegroundColor Red
    Write-Host "   Запустите Docker Desktop и повторите" -ForegroundColor Yellow
    exit 1
}

# 2. Проверка Backend
Write-Host "`n2. Проверка Backend..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri http://localhost:3000/health -Method Get -TimeoutSec 2 -ErrorAction Stop
    Write-Host "   ✅ Backend работает" -ForegroundColor Green
} catch {
    Write-Host "   ⚠ Запуск Backend..." -ForegroundColor Yellow
    Set-Location drops-crypto-api
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run start:dev" -WindowStyle Minimized
    Set-Location ..
    Write-Host "   ⏳ Ожидание запуска Backend..." -ForegroundColor Cyan
    Start-Sleep -Seconds 8
    
    try {
        $health = Invoke-RestMethod -Uri http://localhost:3000/health -Method Get -TimeoutSec 3
        Write-Host "   ✅ Backend запущен" -ForegroundColor Green
    } catch {
        Write-Host "   ⚠ Backend еще запускается, проверьте вручную" -ForegroundColor Yellow
    }
}

# 3. Проверка ngrok
Write-Host "`n3. Проверка ngrok..." -ForegroundColor Yellow
$ngrokPath = "$env:USERPROFILE\ngrok\ngrok.exe"
if (Test-Path $ngrokPath) {
    $env:Path += ";$env:USERPROFILE\ngrok"
}

$ngrokCmd = Get-Command ngrok -ErrorAction SilentlyContinue
if ($ngrokCmd) {
    try {
        $ngrokApi = Invoke-RestMethod -Uri http://localhost:4040/api/tunnels -Method Get -TimeoutSec 1 -ErrorAction SilentlyContinue
        if ($ngrokApi.tunnels) {
            $publicUrl = $ngrokApi.tunnels[0].public_url
            Write-Host "   ✅ ngrok запущен: $publicUrl" -ForegroundColor Green
        } else {
            Write-Host "   ⚠ ngrok не запущен, запускаю..." -ForegroundColor Yellow
            Start-Process powershell -ArgumentList "-NoExit", "-Command", "ngrok http 3000" -WindowStyle Normal
            Write-Host "   ⏳ Ожидание запуска ngrok..." -ForegroundColor Cyan
            Start-Sleep -Seconds 5
            Write-Host "   ✅ ngrok запущен (проверьте окно ngrok для получения URL)" -ForegroundColor Green
        }
    } catch {
        Write-Host "   ⚠ ngrok не запущен, запускаю..." -ForegroundColor Yellow
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "ngrok http 3000" -WindowStyle Normal
        Write-Host "   ⏳ Ожидание запуска ngrok..." -ForegroundColor Cyan
        Start-Sleep -Seconds 5
        Write-Host "   ✅ ngrok запущен (проверьте окно ngrok для получения URL)" -ForegroundColor Green
    }
} else {
    Write-Host "   ⚠ ngrok не установлен" -ForegroundColor Yellow
    Write-Host "   Установите: powershell -ExecutionPolicy Bypass -File .\setup-ngrok.ps1" -ForegroundColor Gray
}

# 4. Проверка .env
Write-Host "`n4. Проверка конфигурации..." -ForegroundColor Yellow
if (Test-Path "drops-crypto-api\.env") {
    $envContent = Get-Content "drops-crypto-api\.env" -Raw
    $needsConfig = $envContent -match "your_twitch_client_id_here"
    
    if ($needsConfig) {
        Write-Host "   ⚠ Требуется настройка Twitch ключей" -ForegroundColor Yellow
        Write-Host "   Откройте drops-crypto-api\.env и обновите TWITCH_CLIENT_ID и TWITCH_CLIENT_SECRET" -ForegroundColor Gray
    } else {
        Write-Host "   ✅ Конфигурация выглядит настроенной" -ForegroundColor Green
    }
} else {
    Write-Host "   ✗ .env файл не найден" -ForegroundColor Red
}

# Итоговый статус
Write-Host "`n=== Готово! ===" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Следующие шаги:" -ForegroundColor Cyan
Write-Host "1. Скопируйте ngrok URL из окна ngrok" -ForegroundColor White
Write-Host "2. Обновите URL: .\update-ngrok-url.ps1 -NgrokUrl 'https://ваш-url'" -ForegroundColor White
Write-Host "3. Настройте Twitch Developer Console (если еще не сделано)" -ForegroundColor White
Write-Host "4. Запустите мобильное приложение: cd drops-crypto-app; npm start" -ForegroundColor White
Write-Host ""

# Предложение запустить мобильное приложение
$runApp = Read-Host "Запустить мобильное приложение сейчас? (y/n)"
if ($runApp -eq "y" -or $runApp -eq "Y") {
    Write-Host "`nЗапуск мобильного приложения..." -ForegroundColor Cyan
    Set-Location drops-crypto-app
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start" -WindowStyle Normal
    Set-Location ..
    Write-Host "✅ Мобильное приложение запускается" -ForegroundColor Green
}
