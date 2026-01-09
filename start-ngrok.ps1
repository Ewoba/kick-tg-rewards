# Скрипт запуска ngrok
Write-Host "=== Запуск ngrok ===" -ForegroundColor Green

# Проверка ngrok
# Проверка ngrok
$ngrok = (Get-Command ngrok -ErrorAction SilentlyContinue) -or (where.exe ngrok 2>$null)
if (-not $ngrok) {
    Write-Host "✗ ngrok не найден" -ForegroundColor Red
    Write-Host "Установите ngrok: https://ngrok.com/download" -ForegroundColor Yellow
    exit 1
}

Write-Host "`nЗапуск ngrok на порт 3000..." -ForegroundColor Cyan
Write-Host "Откроется новое окно с процессом ngrok — не закрывайте его." -ForegroundColor Yellow
Write-Host "После запуска:" -ForegroundColor White
Write-Host "1. Скопируйте HTTPS URL (например: https://xxxxx.ngrok-free.app)" -ForegroundColor White
Write-Host "2. Обновите PUBLIC_BASE_URL и TWITCH_REDIRECT_URI в drops-crypto-api/.env" -ForegroundColor White
Write-Host "3. Обновите API_BASE в drops-crypto-app/App.tsx`n" -ForegroundColor White

Start-Process powershell -ArgumentList "-NoExit", "-Command", "ngrok http 3000" -WindowStyle Normal
