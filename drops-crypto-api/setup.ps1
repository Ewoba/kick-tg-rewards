# Скрипт автоматической настройки Backend
Write-Host "=== Настройка Drops Crypto API ===" -ForegroundColor Green

# Проверка Docker
Write-Host "`n1. Проверка Docker..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "   ✓ Docker работает" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Docker не запущен. Запустите Docker Desktop и повторите попытку." -ForegroundColor Red
    exit 1
}

# Запуск Docker Compose
Write-Host "`n2. Запуск Docker Compose..." -ForegroundColor Yellow
docker compose up -d
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Контейнеры запущены" -ForegroundColor Green
    Start-Sleep -Seconds 5  # Даем время базе данных запуститься
} else {
    Write-Host "   ✗ Ошибка при запуске контейнеров" -ForegroundColor Red
    exit 1
}

# Генерация Prisma Client
Write-Host "`n3. Генерация Prisma Client..." -ForegroundColor Yellow
npx prisma generate
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Prisma Client сгенерирован" -ForegroundColor Green
} else {
    Write-Host "   ✗ Ошибка при генерации Prisma Client" -ForegroundColor Red
    exit 1
}

# Выполнение миграций
Write-Host "`n4. Выполнение миграций..." -ForegroundColor Yellow
npx prisma migrate dev --name init
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Миграции выполнены" -ForegroundColor Green
} else {
    Write-Host "   ✗ Ошибка при выполнении миграций" -ForegroundColor Red
    exit 1
}

# Проверка .env файла
Write-Host "`n5. Проверка .env файла..." -ForegroundColor Yellow
if (Test-Path .env) {
    $envContent = Get-Content .env -Raw
    if ($envContent -match "your_twitch_client_id_here") {
        Write-Host "   ⚠ Нужно обновить TWITCH_CLIENT_ID и TWITCH_CLIENT_SECRET в .env" -ForegroundColor Yellow
    } else {
        Write-Host "   ✓ .env файл настроен" -ForegroundColor Green
    }
} else {
    Write-Host "   ✗ .env файл не найден" -ForegroundColor Red
    exit 1
}

Write-Host "`n=== Настройка завершена ===" -ForegroundColor Green
Write-Host "`nСледующие шаги:" -ForegroundColor Cyan
Write-Host "1. Обновите TWITCH_CLIENT_ID и TWITCH_CLIENT_SECRET в .env" -ForegroundColor White
Write-Host "2. Запустите backend: npm run start:dev" -ForegroundColor White
Write-Host "3. В новом терминале запустите ngrok: ngrok http 3000" -ForegroundColor White
Write-Host "4. Обновите PUBLIC_BASE_URL и TWITCH_REDIRECT_URI в .env с ngrok URL" -ForegroundColor White
