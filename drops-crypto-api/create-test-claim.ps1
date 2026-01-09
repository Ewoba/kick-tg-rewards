# Скрипт для создания тестового claim (для админа)

param(
    [Parameter(Mandatory=$true)]
    [string]$Token,
    [Parameter(Mandatory=$false)]
    [string]$PrizeId = $null
)

$headers = @{ Authorization = "Bearer $Token" }

Write-Host "`nСоздание тестового claim..." -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# 1. Получить список призов
Write-Host "`n1. Получение списка призов..." -ForegroundColor Yellow
try {
    $prizes = Invoke-RestMethod -Uri "http://localhost:3000/prizes" -ErrorAction Stop
    
    if ($prizes.Count -eq 0) {
        Write-Host "   ❌ Нет доступных призов. Запустите seed:" -ForegroundColor Red
        Write-Host "      npm run prisma:seed" -ForegroundColor White
        exit 1
    }
    
    Write-Host "   ✅ Найдено призов: $($prizes.Count)" -ForegroundColor Green
    
    if (-not $PrizeId) {
        $PrizeId = $prizes[0].id
        Write-Host "   Используется приз: $($prizes[0].title) (ID: $PrizeId)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "   ❌ Ошибка при получении призов: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 2. Получить информацию о пользователе
Write-Host "`n2. Получение информации о пользователе..." -ForegroundColor Yellow
try {
    $me = Invoke-RestMethod -Uri "http://localhost:3000/me" -Headers $headers -ErrorAction Stop
    Write-Host "   ✅ Пользователь: $($me.twitchLogin)" -ForegroundColor Green
    
    if (-not $me.wallet) {
        Write-Host "   ⚠️  У пользователя нет кошелька" -ForegroundColor Yellow
        Write-Host "      Добавьте кошелёк через /me/wallet" -ForegroundColor White
        Write-Host "      ИЛИ через мобильное приложение (Профиль)" -ForegroundColor White
        exit 1
    }
    
    Write-Host "   ✅ Кошелёк: $($me.wallet.address)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Ошибка при получении информации о пользователе: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 3. Создать claim
Write-Host "`n3. Создание claim..." -ForegroundColor Yellow
try {
    $claim = Invoke-RestMethod -Method POST -Uri "http://localhost:3000/prizes/$PrizeId/claim" -Headers $headers -ErrorAction Stop
    
    Write-Host "   ✅ Claim создан!" -ForegroundColor Green
    Write-Host "   ID: $($claim.claim.id)" -ForegroundColor White
    Write-Host "   Статус: $($claim.claim.status)" -ForegroundColor White
    Write-Host "   Приз: $($claim.claim.prize.title)" -ForegroundColor White
    
    Write-Host "`n✅ ТЕСТОВЫЙ CLAIM СОЗДАН!" -ForegroundColor Green
    Write-Host "   Теперь можно проверить:" -ForegroundColor Cyan
    Write-Host "   - GET /prizes/my/claims (в мобилке: Мои призы)" -ForegroundColor White
    Write-Host "   - PUT /admin/claims/$($claim.claim.id)/mark-success (для админа)" -ForegroundColor White
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    
    if ($statusCode -eq 400) {
        $errorBody = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "   ❌ Ошибка: $($errorBody.message)" -ForegroundColor Red
        
        if ($errorBody.message -like "*already claimed*") {
            Write-Host "   Приз уже получен ранее" -ForegroundColor Yellow
        } elseif ($errorBody.message -like "*wallet*") {
            Write-Host "   Нужен кошелёк (добавьте через /me/wallet)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ❌ Ошибка: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "   Статус: $statusCode" -ForegroundColor Red
    }
    exit 1
}

Write-Host "`n================================" -ForegroundColor Cyan
