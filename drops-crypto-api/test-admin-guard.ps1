# Скрипт для проверки Admin Guard

param(
    [Parameter(Mandatory=$true)]
    [string]$Token
)

$headers = @{ Authorization = "Bearer $Token" }

Write-Host "`nТестирование Admin Guard..." -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/admin/claims" -Headers $headers -ErrorAction Stop
    
    Write-Host "`n✅ УСПЕХ: Admin Guard разрешил доступ" -ForegroundColor Green
    Write-Host "   Статус: 200 OK" -ForegroundColor Green
    Write-Host "   Claims найдено: $($response.Count)" -ForegroundColor Green
    
    if ($response.Count -gt 0) {
        Write-Host "`nПервые 3 claims:" -ForegroundColor Cyan
        $response | Select-Object -First 3 | ForEach-Object {
            Write-Host "  - ID: $($_.id), Status: $($_.status), Prize: $($_.prize.title)" -ForegroundColor White
        }
    } else {
        Write-Host "`n   Список пуст (это нормально, если нет claims)" -ForegroundColor Yellow
    }
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    
    if ($statusCode -eq 403) {
        Write-Host "`n❌ FORBIDDEN: Admin Guard заблокировал доступ" -ForegroundColor Red
        Write-Host "   Статус: 403 Forbidden" -ForegroundColor Red
        Write-Host "   Причина: Ваш twitchUserId не в ADMIN_TWITCH_IDS" -ForegroundColor Yellow
        Write-Host "`n   Проверьте:" -ForegroundColor Yellow
        Write-Host "   1. ADMIN_TWITCH_IDS прописан в .env" -ForegroundColor White
        Write-Host "   2. Backend перезапущен после изменения .env" -ForegroundColor White
        Write-Host "   3. twitchUserId в токене совпадает с ADMIN_TWITCH_IDS" -ForegroundColor White
    } elseif ($statusCode -eq 401) {
        Write-Host "`n❌ UNAUTHORIZED: Неверный токен" -ForegroundColor Red
        Write-Host "   Статус: 401 Unauthorized" -ForegroundColor Red
    } else {
        Write-Host "`n❌ ОШИБКА: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "   Статус: $statusCode" -ForegroundColor Red
    }
}

Write-Host "`n================================" -ForegroundColor Cyan
