# Скрипт для получения Twitch User ID из JWT токена

param(
    [Parameter(Mandatory=$true)]
    [string]$Token
)

# JWT состоит из 3 частей: header.payload.signature
$parts = $Token -split '\.'
if ($parts.Length -ne 3) {
    Write-Host "❌ Неверный формат JWT токена" -ForegroundColor Red
    exit 1
}

# Декодируем payload (вторая часть)
$payload = $parts[1]

# JWT использует base64url, но PowerShell нужен base64
# Заменяем символы base64url на base64
$payload = $payload -replace '-', '+' -replace '_', '/'

# Добавляем padding если нужно
$mod = $payload.Length % 4
if ($mod -gt 0) {
    $payload += '=' * (4 - $mod)
}

# Декодируем
try {
    $bytes = [System.Convert]::FromBase64String($payload)
    $json = [System.Text.Encoding]::UTF8.GetString($bytes)
    $decoded = $json | ConvertFrom-Json
    
    if ($decoded.twitchUserId) {
        Write-Host "`n✅ Twitch User ID найден:" -ForegroundColor Green
        Write-Host "   $($decoded.twitchUserId)" -ForegroundColor Cyan
        Write-Host "`nДобавьте в .env:" -ForegroundColor Yellow
        Write-Host "   ADMIN_TWITCH_IDS=$($decoded.twitchUserId)" -ForegroundColor White
    } else {
        Write-Host "`n⚠️ twitchUserId не найден в токене" -ForegroundColor Yellow
        Write-Host "`nPayload:" -ForegroundColor Cyan
        Write-Host $json -ForegroundColor White
    }
} catch {
    Write-Host "❌ Ошибка декодирования: $_" -ForegroundColor Red
}
