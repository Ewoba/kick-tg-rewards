# Скрипт для поиска twitchUserId через Prisma

param(
    [Parameter(Mandatory=$false)]
    [string]$TwitchLogin = "tiktak6828"
)

Write-Host "`nПоиск twitchUserId для '$TwitchLogin'..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Создаем временный скрипт Node.js
$nodeScript = @"
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { twitchLogin: '$TwitchLogin' },
    select: { id: true, twitchUserId: true, twitchLogin: true }
  });

  if (user) {
    console.log(JSON.stringify(user));
  } else {
    console.log('NOT_FOUND');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.`$disconnect());
"@

$tempScript = "temp-find-user.js"
$nodeScript | Out-File -FilePath $tempScript -Encoding utf8

try {
    Write-Host "`nЗапрос к БД через Prisma..." -ForegroundColor Yellow
    $result = node $tempScript 2>&1 | Out-String
    
    if ($result -match "NOT_FOUND") {
        Write-Host "`n❌ Пользователь '$TwitchLogin' не найден в БД" -ForegroundColor Red
        Write-Host "   Возможно, нужно сначала авторизоваться через Twitch OAuth" -ForegroundColor Yellow
        Write-Host "   Откройте: http://localhost:3000/auth/twitch/start" -ForegroundColor White
    } else {
        $user = $result | ConvertFrom-Json
        
        Write-Host "`n✅ Найден пользователь:" -ForegroundColor Green
        Write-Host "   ID: $($user.id)" -ForegroundColor White
        Write-Host "   Twitch Login: $($user.twitchLogin)" -ForegroundColor White
        Write-Host "   Twitch User ID: $($user.twitchUserId)" -ForegroundColor Cyan
        
        $twitchUserId = $user.twitchUserId
        
        Write-Host "`n📋 Добавьте в .env файл:" -ForegroundColor Yellow
        Write-Host "   ADMIN_TWITCH_IDS=$twitchUserId" -ForegroundColor White
        
        # Попробовать автоматически добавить в .env
        $envPath = ".env"
        if (Test-Path $envPath) {
            $envContent = Get-Content $envPath -Raw
            
            if ($envContent -notmatch "ADMIN_TWITCH_IDS") {
                Write-Host "`n💡 Добавляю в .env автоматически..." -ForegroundColor Yellow
                Add-Content -Path $envPath -Value "`n# Admin allowlist`nADMIN_TWITCH_IDS=$twitchUserId"
                Write-Host "   ✅ Добавлено: ADMIN_TWITCH_IDS=$twitchUserId" -ForegroundColor Green
                Write-Host "   ⚠️  ОБЯЗАТЕЛЬНО перезапустите backend!" -ForegroundColor Yellow
                Write-Host "      npm run start:dev" -ForegroundColor White
            } else {
                Write-Host "`n⚠️  ADMIN_TWITCH_IDS уже существует в .env" -ForegroundColor Yellow
                Write-Host "   Проверьте значение вручную" -ForegroundColor White
                Get-Content $envPath | Select-String "ADMIN_TWITCH_IDS"
            }
        } else {
            Write-Host "`n❌ .env файл не найден" -ForegroundColor Red
        }
        
        return $twitchUserId
    }
} catch {
    Write-Host "`n❌ Ошибка: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Убедитесь, что backend установлен и Prisma Client сгенерирован" -ForegroundColor Yellow
} finally {
    if (Test-Path $tempScript) {
        Remove-Item $tempScript -Force
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
