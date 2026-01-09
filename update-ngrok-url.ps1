# Скрипт для автоматического обновления ngrok URL во всех файлах
param(
    [Parameter(Mandatory=$true)]
    [string]$NgrokUrl
)

Write-Host "=== Обновление ngrok URL ===" -ForegroundColor Green
Write-Host "URL: $NgrokUrl`n" -ForegroundColor Cyan

# Убираем http:// или https:// если есть
$NgrokUrl = $NgrokUrl -replace "^https?://", ""
# Добавляем https://
if (-not $NgrokUrl.StartsWith("https://")) {
    $NgrokUrl = "https://" + $NgrokUrl
}

Write-Host "1. Обновление drops-crypto-api/.env..." -ForegroundColor Yellow
$envFile = "drops-crypto-api\.env"
if (Test-Path $envFile) {
    $content = Get-Content $envFile -Raw
    $content = $content -replace "PUBLIC_BASE_URL=.*", "PUBLIC_BASE_URL=$NgrokUrl"
    $content = $content -replace "TWITCH_REDIRECT_URI=.*", "TWITCH_REDIRECT_URI=$NgrokUrl/auth/twitch/callback"
    Set-Content -Path $envFile -Value $content -NoNewline
    Write-Host "   ✓ .env обновлен" -ForegroundColor Green
} else {
    Write-Host "   ✗ .env файл не найден" -ForegroundColor Red
}

Write-Host "`n2. Обновление drops-crypto-app/App.tsx..." -ForegroundColor Yellow
$appTsx = "drops-crypto-app\App.tsx"
if (Test-Path $appTsx) {
    $content = Get-Content $appTsx -Raw
    # Ищем строку с API_BASE
    if ($content -match "const API_BASE = 'https://.+?'") {
        $content = $content -replace "const API_BASE = 'https://.+?'", "const API_BASE = '$NgrokUrl'"
        Set-Content -Path $appTsx -Value $content -NoNewline
        Write-Host "   ✓ App.tsx обновлен" -ForegroundColor Green
    } else {
        Write-Host "   ⚠ API_BASE не найден в App.tsx, обновите вручную" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ✗ App.tsx файл не найден" -ForegroundColor Red
}

Write-Host "`n=== Обновление завершено ===" -ForegroundColor Green
Write-Host "`nНе забудьте:" -ForegroundColor Cyan
Write-Host "1. Обновить Redirect URL в Twitch Developer Console: $NgrokUrl/auth/twitch/callback" -ForegroundColor White
Write-Host "2. Перезапустить backend после изменения .env" -ForegroundColor White
