# Скрипт проверки .env файла
Write-Host "=== Проверка .env файла ===" -ForegroundColor Cyan
Write-Host ""

$envFile = ".env"
if (-not (Test-Path $envFile)) {
    Write-Host "✗ Файл .env не найден!" -ForegroundColor Red
    Write-Host "  Создайте файл .env в папке drops-crypto-api" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Файл .env найден" -ForegroundColor Green
Write-Host ""

# Проверка значений через Node.js (dotenv)
$nodeCheck = node check-env-temp.js 2>&1
$checkResult = $nodeCheck | ConvertFrom-Json

Write-Host "Текущие значения:" -ForegroundColor Yellow
Write-Host "  TWITCH_CLIENT_ID: " -NoNewline
if ($checkResult.hasPlaceholder) {
    Write-Host "$($checkResult.TWITCH_CLIENT_ID) ⚠️ PLACEHOLDER!" -ForegroundColor Red
    Write-Host ""
    Write-Host "ПРОБЛЕМА: В .env стоит placeholder, а не реальный Client ID!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Что нужно сделать:" -ForegroundColor Yellow
    Write-Host "  1. Создайте Twitch приложение на https://dev.twitch.tv/console/apps" -ForegroundColor White
    Write-Host "  2. Скопируйте Client ID и Client Secret" -ForegroundColor White
    Write-Host "  3. Откройте файл .env и замените:" -ForegroundColor White
    Write-Host "     TWITCH_CLIENT_ID=your_twitch_client_id_here" -ForegroundColor Gray
    Write-Host "     на" -ForegroundColor Gray
    Write-Host "     TWITCH_CLIENT_ID=ваш_реальный_client_id" -ForegroundColor Green
    Write-Host ""
    Write-Host "  4. Также замените TWITCH_CLIENT_SECRET на реальный секрет" -ForegroundColor White
    Write-Host "  5. Перезапустите backend: npm run start:dev" -ForegroundColor White
    Write-Host ""
    Write-Host "  Подробнее см. TWITCH_OAUTH_SETUP.md" -ForegroundColor Cyan
    exit 1
} elseif ($checkResult.TWITCH_CLIENT_ID -eq "NOT SET") {
    Write-Host "NOT SET ⚠️" -ForegroundColor Red
    Write-Host "  Добавьте строку TWITCH_CLIENT_ID=... в .env" -ForegroundColor Yellow
} else {
    Write-Host "$($checkResult.TWITCH_CLIENT_ID) ✓" -ForegroundColor Green
}

Write-Host "  TWITCH_CLIENT_SECRET: " -NoNewline
if ($checkResult.TWITCH_CLIENT_SECRET -eq "NOT SET") {
    Write-Host "NOT SET ⚠️" -ForegroundColor Red
    Write-Host "  Добавьте строку TWITCH_CLIENT_SECRET=... в .env" -ForegroundColor Yellow
} elseif ($checkResult.TWITCH_CLIENT_SECRET -eq "your_twitch_client_secret_here" -or $checkResult.TWITCH_CLIENT_SECRET -eq "") {
    Write-Host "PLACEHOLDER или пусто ⚠️" -ForegroundColor Red
} else {
    Write-Host "✓ (скрыто)" -ForegroundColor Green
}

Write-Host ""
Write-Host "Дополнительные проверки..." -ForegroundColor Cyan

# Проверка других обязательных переменных
$fullCheck = node check-env-full-temp.js 2>&1
$fullResult = $fullCheck | ConvertFrom-Json

$allOk = $true

if ($fullResult.TWITCH_REDIRECT_URI -eq "NOT SET") {
    Write-Host "  ⚠️ TWITCH_REDIRECT_URI не установлен" -ForegroundColor Yellow
    $allOk = $false
} else {
    Write-Host "  ✓ TWITCH_REDIRECT_URI: $($fullResult.TWITCH_REDIRECT_URI)" -ForegroundColor Green
}

if ($fullResult.PUBLIC_BASE_URL -eq "NOT SET") {
    Write-Host "  ⚠️ PUBLIC_BASE_URL не установлен" -ForegroundColor Yellow
    $allOk = $false
} else {
    Write-Host "  ✓ PUBLIC_BASE_URL: $($fullResult.PUBLIC_BASE_URL)" -ForegroundColor Green
}

if ($fullResult.JWT_SECRET -eq "NOT SET") {
    Write-Host "  ⚠️ JWT_SECRET не установлен" -ForegroundColor Yellow
    $allOk = $false
} else {
    Write-Host "  ✓ JWT_SECRET установлен" -ForegroundColor Green
}

Write-Host ""

if (-not $checkResult.hasPlaceholder -and $allOk) {
    Write-Host "✓ Все переменные окружения настроены корректно!" -ForegroundColor Green
    Write-Host "  Теперь можно запускать backend: npm run start:dev" -ForegroundColor Cyan
} else {
    Write-Host "✗ Требуется настройка .env файла" -ForegroundColor Red
    Write-Host "  См. TWITCH_OAUTH_SETUP.md для инструкций" -ForegroundColor Yellow
    exit 1
}
