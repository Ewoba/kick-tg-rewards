# Скрипт для поиска twitchUserId по twitchLogin

param(
    [Parameter(Mandatory=$false)]
    [string]$TwitchLogin = "tiktak6828"
)

Write-Host "`nПоиск twitchUserId для '$TwitchLogin'..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

try {
    $query = "SELECT id, \"twitchUserId\", \"twitchLogin\" FROM \"User\" WHERE \"twitchLogin\" = '$TwitchLogin';"
    $result = docker exec -i drops-crypto-api-postgres-1 psql -U drops -d drops -t -A -F"," -c $query
    
    if ($result) {
        $fields = $result.Trim() -split ","
        if ($fields.Length -ge 3) {
            $userId = $fields[0]
            $twitchUserId = $fields[1]
            $twitchLogin = $fields[2]
            
            Write-Host "`n✅ Найден пользователь:" -ForegroundColor Green
            Write-Host "   ID: $userId" -ForegroundColor White
            Write-Host "   Twitch Login: $twitchLogin" -ForegroundColor White
            Write-Host "   Twitch User ID: $twitchUserId" -ForegroundColor Cyan
            
            Write-Host "`n📋 Добавьте в .env файл:" -ForegroundColor Yellow
            Write-Host "   ADMIN_TWITCH_IDS=$twitchUserId" -ForegroundColor White
            
            # Попробовать автоматически добавить в .env
            $envPath = ".env"
            if (Test-Path $envPath) {
                $envContent = Get-Content $envPath -Raw
                
                if ($envContent -notmatch "ADMIN_TWITCH_IDS") {
                    Write-Host "`n💡 Попробую добавить автоматически..." -ForegroundColor Yellow
                    Add-Content -Path $envPath -Value "`n# Admin allowlist`nADMIN_TWITCH_IDS=$twitchUserId"
                    Write-Host "   ✅ Добавлено в .env" -ForegroundColor Green
                    Write-Host "   ⚠️  Перезапустите backend для применения изменений!" -ForegroundColor Yellow
                } else {
                    Write-Host "`n⚠️  ADMIN_TWITCH_IDS уже существует в .env" -ForegroundColor Yellow
                    Write-Host "   Проверьте значение вручную" -ForegroundColor White
                }
            } else {
                Write-Host "`n❌ .env файл не найден" -ForegroundColor Red
            }
            
            return $twitchUserId
        }
    } else {
        Write-Host "`n❌ Пользователь '$TwitchLogin' не найден в БД" -ForegroundColor Red
        Write-Host "   Возможно, нужно сначала авторизоваться через Twitch OAuth" -ForegroundColor Yellow
        return $null
    }
} catch {
    Write-Host "`n❌ Ошибка при запросе к БД: $($_.Exception.Message)" -ForegroundColor Red
    return $null
}

Write-Host "`n========================================" -ForegroundColor Cyan
