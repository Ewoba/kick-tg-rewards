# Скрипт диагностики ошибки "invalid client"
Write-Host "=== ДИАГНОСТИКА: invalid client ===" -ForegroundColor Cyan
Write-Host ""

# Проверка .env
Write-Host "1. Проверка .env файла..." -ForegroundColor Yellow
$nodeCheck = node -e "require('dotenv').config(); console.log(JSON.stringify({ CLIENT_ID: process.env.TWITCH_CLIENT_ID || 'NOT SET', CLIENT_SECRET_LENGTH: process.env.TWITCH_CLIENT_SECRET ? process.env.TWITCH_CLIENT_SECRET.length : 0, REDIRECT_URI: process.env.TWITCH_REDIRECT_URI || 'NOT SET' }))" 2>&1

$envCheck = $nodeCheck | ConvertFrom-Json

Write-Host "  TWITCH_CLIENT_ID: $($envCheck.CLIENT_ID)" -ForegroundColor $(if ($envCheck.CLIENT_ID -eq 'NOT SET') { 'Red' } else { 'Green' })
Write-Host "  TWITCH_CLIENT_SECRET: " -NoNewline
if ($envCheck.CLIENT_SECRET_LENGTH -eq 0) {
    Write-Host "NOT SET ⚠️" -ForegroundColor Red
} else {
    Write-Host "SET (length: $($envCheck.CLIENT_SECRET_LENGTH)) ✓" -ForegroundColor Green
}
Write-Host "  TWITCH_REDIRECT_URI: $($envCheck.REDIRECT_URI)" -ForegroundColor $(if ($envCheck.REDIRECT_URI -eq 'NOT SET') { 'Red' } else { 'Green' })
Write-Host ""

# Проверка URL, который генерируется
Write-Host "2. Проверка OAuth URL..." -ForegroundColor Yellow
$oauthUrl = "http://localhost:3000/auth/twitch/start"
Write-Host "  URL: $oauthUrl" -ForegroundColor White
Write-Host ""
Write-Host "  ⚠️ Откройте этот URL в браузере и посмотрите на адрес после редиректа." -ForegroundColor Yellow
Write-Host "  Должно быть: client_id=$($envCheck.CLIENT_ID)" -ForegroundColor Cyan
Write-Host ""

# Инструкции
Write-Host "3. Что проверить:" -ForegroundColor Yellow
Write-Host "  ✓ Client ID существует в Twitch Console" -ForegroundColor White
Write-Host "  ✓ Client Secret соответствует этому Client ID" -ForegroundColor White
Write-Host "  ✓ Redirect URI добавлен: http://localhost:3000/auth/twitch/callback" -ForegroundColor White
Write-Host "  ✓ Backend перезапущен после изменения .env" -ForegroundColor White
Write-Host ""

# Решение
Write-Host "4. Если всё правильно, но ошибка остаётся:" -ForegroundColor Yellow
Write-Host "  → Создайте новый Client Secret в Twitch Console" -ForegroundColor White
Write-Host "  → Обновите .env с новым Secret" -ForegroundColor White
Write-Host "  → Перезапустите backend: npm run start:dev" -ForegroundColor White
Write-Host ""
