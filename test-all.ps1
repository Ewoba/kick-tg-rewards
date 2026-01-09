# Скрипт быстрого тестирования проекта
Write-Host "=== Тестирование Drops Crypto ===" -ForegroundColor Cyan
Write-Host ""

# 1. Проверка Docker
Write-Host "1. Проверка Docker контейнеров..." -ForegroundColor Yellow
try {
    $containers = docker ps --format "{{.Names}}" 2>$null
    if ($containers -match "postgres" -and $containers -match "redis") {
        Write-Host "   ✅ Docker контейнеры запущены" -ForegroundColor Green
        docker ps --format "table {{.Names}}\t{{.Status}}" | Select-Object -Skip 1
    } else {
        Write-Host "   ❌ Docker контейнеры не запущены" -ForegroundColor Red
        Write-Host "   Запустите: cd drops-crypto-api; docker compose up -d" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ Docker недоступен" -ForegroundColor Red
}

# 2. Проверка Backend
Write-Host "`n2. Проверка Backend..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri http://localhost:3000/health -Method Get -TimeoutSec 2
    Write-Host "   ✅ Backend работает на http://localhost:3000" -ForegroundColor Green
    Write-Host "   Response: $($health | ConvertTo-Json -Compress)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Backend не отвечает" -ForegroundColor Red
    Write-Host "   Запустите: cd drops-crypto-api; npm run start:dev" -ForegroundColor Gray
}

# 3. Проверка ngrok
Write-Host "`n3. Проверка ngrok..." -ForegroundColor Yellow
try {
    $ngrok = Invoke-RestMethod -Uri http://localhost:4040/api/tunnels -Method Get -TimeoutSec 1 -ErrorAction Stop
    if ($ngrok.tunnels -and $ngrok.tunnels.Count -gt 0) {
        $publicUrl = $ngrok.tunnels[0].public_url
        Write-Host "   ✅ ngrok работает: $publicUrl" -ForegroundColor Green
        
        # Проверка health через ngrok
        try {
            $ngrokHealth = Invoke-RestMethod -Uri "$publicUrl/health" -Method Get -TimeoutSec 2
            Write-Host "   ✅ Health через ngrok: OK" -ForegroundColor Green
        } catch {
            Write-Host "   ⚠ Health через ngrok не работает" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ⚠ ngrok запущен, но туннели не найдены" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ ngrok не запущен" -ForegroundColor Red
    Write-Host "   Запустите: ngrok http 3000" -ForegroundColor Gray
}

# 4. Проверка .env
Write-Host "`n4. Проверка конфигурации..." -ForegroundColor Yellow
if (Test-Path "drops-crypto-api\.env") {
    $envContent = Get-Content "drops-crypto-api\.env" -Raw
    $hasClientId = $envContent -notmatch "your_twitch_client_id_here"
    $hasNgrokUrl = $envContent -match "PUBLIC_BASE_URL=https://.*ngrok"
    
    if ($hasClientId) {
        Write-Host "   ✅ Twitch ключи настроены" -ForegroundColor Green
    } else {
        Write-Host "   ⚠ Twitch ключи не настроены" -ForegroundColor Yellow
    }
    
    if ($hasNgrokUrl) {
        Write-Host "   ✅ ngrok URL настроен" -ForegroundColor Green
    } else {
        Write-Host "   ⚠ ngrok URL не настроен" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ .env файл не найден" -ForegroundColor Red
}

# 5. Проверка API endpoints (если backend работает)
Write-Host "`n5. Проверка API endpoints..." -ForegroundColor Yellow
try {
    $streamers = Invoke-RestMethod -Uri http://localhost:3000/streamers -Method Get -TimeoutSec 2
    Write-Host "   ✅ GET /streamers работает ($($streamers.Count) стримеров)" -ForegroundColor Green
} catch {
    Write-Host "   ⚠ GET /streamers не работает" -ForegroundColor Yellow
}

try {
    $prizes = Invoke-RestMethod -Uri http://localhost:3000/prizes -Method Get -TimeoutSec 2
    Write-Host "   ✅ GET /prizes работает ($($prizes.Count) призов)" -ForegroundColor Green
} catch {
    Write-Host "   ⚠ GET /prizes не работает" -ForegroundColor Yellow
}

# Итоги
Write-Host "`n=== Итоги ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Следующие шаги:" -ForegroundColor Yellow
Write-Host "1. Если что-то не работает - см. TESTING_GUIDE.md" -ForegroundColor White
Write-Host "2. Запустите mobile app: cd drops-crypto-app; npm start" -ForegroundColor White
Write-Host "3. Откройте Expo Go и протестируйте приложение" -ForegroundColor White
Write-Host ""
