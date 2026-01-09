# Скрипт проверки статуса проекта Drops Crypto
Write-Host "`n=== Проверка статуса Drops Crypto ===" -ForegroundColor Cyan
Write-Host ""

# 1. Проверка Docker
Write-Host "1. Docker контейнеры:" -ForegroundColor Yellow
try {
    $containers = docker ps --format "{{.Names}}" 2>$null
    if ($containers -match "postgres" -and $containers -match "redis") {
        Write-Host "   ✅ PostgreSQL и Redis запущены" -ForegroundColor Green
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | Select-Object -Skip 1
    } else {
        Write-Host "   ⚠ Контейнеры не запущены" -ForegroundColor Yellow
        Write-Host "   Запустите: cd drops-crypto-api; docker compose up -d" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ✗ Docker не доступен" -ForegroundColor Red
}

# 2. Проверка Backend
Write-Host "`n2. Backend API:" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri http://localhost:3000/health -Method Get -TimeoutSec 2 -ErrorAction Stop
    if ($response.ok) {
        Write-Host "   ✅ Backend работает на http://localhost:3000" -ForegroundColor Green
        Write-Host "   Response: $($response | ConvertTo-Json -Compress)" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ⚠ Backend не отвечает" -ForegroundColor Yellow
    Write-Host "   Запустите: cd drops-crypto-api; npm run start:dev" -ForegroundColor Gray
}

# 3. Проверка ngrok
Write-Host "`n3. ngrok:" -ForegroundColor Yellow
$ngrokPath = where.exe ngrok 2>$null
if ($ngrokPath) {
    Write-Host "   ✅ ngrok установлен" -ForegroundColor Green
    try {
        $ngrokApi = Invoke-RestMethod -Uri http://localhost:4040/api/tunnels -Method Get -TimeoutSec 1 -ErrorAction SilentlyContinue
        if ($ngrokApi.tunnels) {
            $publicUrl = $ngrokApi.tunnels[0].public_url
            Write-Host "   ✅ ngrok запущен: $publicUrl" -ForegroundColor Green
        } else {
            Write-Host "   ⚠ ngrok установлен, но не запущен" -ForegroundColor Yellow
            Write-Host "   Запустите: ngrok http 3000" -ForegroundColor Gray
        }
    } catch {
        Write-Host "   ⚠ ngrok установлен, но не запущен" -ForegroundColor Yellow
        Write-Host "   Запустите: ngrok http 3000" -ForegroundColor Gray
    }
} else {
    Write-Host "   ⚠ ngrok не установлен" -ForegroundColor Yellow
    Write-Host "   Скачайте: https://ngrok.com/download" -ForegroundColor Gray
}

# 4. Проверка .env файла
Write-Host "`n4. Конфигурация .env:" -ForegroundColor Yellow
if (Test-Path "drops-crypto-api\.env") {
    $envContent = Get-Content "drops-crypto-api\.env" -Raw
    $hasClientId = $envContent -notmatch "your_twitch_client_id_here"
    $hasClientSecret = $envContent -notmatch "your_twitch_client_secret_here"
    
    if ($hasClientId -and $hasClientSecret) {
        Write-Host "   ✅ Twitch ключи настроены" -ForegroundColor Green
    } else {
        Write-Host "   ⚠ Twitch ключи не настроены" -ForegroundColor Yellow
        Write-Host "   Обновите TWITCH_CLIENT_ID и TWITCH_CLIENT_SECRET в drops-crypto-api\.env" -ForegroundColor Gray
    }
    
    if ($envContent -match "PUBLIC_BASE_URL=https://.*ngrok") {
        Write-Host "   ✅ PUBLIC_BASE_URL настроен на ngrok" -ForegroundColor Green
    } else {
        Write-Host "   ⚠ PUBLIC_BASE_URL не настроен на ngrok URL" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ✗ .env файл не найден" -ForegroundColor Red
}

# 5. Проверка базы данных
Write-Host "`n5. База данных:" -ForegroundColor Yellow
try {
    Set-Location drops-crypto-api -ErrorAction SilentlyContinue
    $migrations = Get-ChildItem prisma\migrations -Directory -ErrorAction SilentlyContinue
    if ($migrations) {
        Write-Host "   ✅ Миграции найдены ($($migrations.Count) миграций)" -ForegroundColor Green
    } else {
        Write-Host "   ⚠ Миграции не найдены" -ForegroundColor Yellow
    }
    Set-Location .. -ErrorAction SilentlyContinue
} catch {
    Write-Host "   ⚠ Не удалось проверить миграции" -ForegroundColor Yellow
}

# 6. Проверка Mobile App
Write-Host "`n6. Mobile App:" -ForegroundColor Yellow
if (Test-Path "drops-crypto-app\App.tsx") {
    $appContent = Get-Content "drops-crypto-app\App.tsx" -Raw
    if ($appContent -match "const API_BASE = 'https://.*ngrok") {
        Write-Host "   ✅ API_BASE настроен на ngrok URL" -ForegroundColor Green
    } elseif ($appContent -match "const API_BASE = 'https://xxxxx") {
        Write-Host "   ⚠ API_BASE не обновлен (все еще xxxxx.ngrok-free.app)" -ForegroundColor Yellow
        Write-Host "   Обновите в drops-crypto-app\App.tsx" -ForegroundColor Gray
    } else {
        Write-Host "   ⚠ API_BASE требует проверки" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ✗ App.tsx не найден" -ForegroundColor Red
}

# Итоговый статус
Write-Host "`n=== Итоговый статус ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Следующие шаги:" -ForegroundColor Yellow
Write-Host "1. Настройте Twitch ключи в drops-crypto-api\.env" -ForegroundColor White
Write-Host "2. Установите и запустите ngrok: ngrok http 3000" -ForegroundColor White
Write-Host "3. Обновите URL: .\update-ngrok-url.ps1 -NgrokUrl 'https://ваш-url'" -ForegroundColor White
Write-Host "4. Настройте Twitch Developer Console" -ForegroundColor White
Write-Host "5. Запустите мобильное приложение: cd drops-crypto-app; npm start" -ForegroundColor White
Write-Host ""
