# Скрипт автоматической установки ngrok
Write-Host "=== Установка ngrok ===" -ForegroundColor Green

# Проверка, установлен ли уже ngrok
$ngrokPath = where.exe ngrok 2>$null
if ($ngrokPath) {
    Write-Host "✅ ngrok уже установлен: $ngrokPath" -ForegroundColor Green
    ngrok version
    exit 0
}

Write-Host "`nngrok не найден. Начинаю установку...`n" -ForegroundColor Yellow

# Создаем папку для ngrok
$ngrokDir = "$env:USERPROFILE\ngrok"
New-Item -ItemType Directory -Path $ngrokDir -Force | Out-Null
Write-Host "📁 Создана папка: $ngrokDir" -ForegroundColor Cyan

# URL для загрузки ngrok (Windows amd64)
$ngrokUrl = "https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip"
$zipPath = "$ngrokDir\ngrok.zip"

Write-Host "`n📥 Скачивание ngrok..." -ForegroundColor Cyan
try {
    Invoke-WebRequest -Uri $ngrokUrl -OutFile $zipPath -UseBasicParsing
    Write-Host "✅ Скачивание завершено" -ForegroundColor Green
} catch {
    Write-Host "✗ Ошибка при скачивании: $_" -ForegroundColor Red
    Write-Host "`nСкачайте вручную с https://ngrok.com/download" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n📦 Распаковка..." -ForegroundColor Cyan
try {
    Expand-Archive -Path $zipPath -DestinationPath $ngrokDir -Force
    Remove-Item $zipPath -Force
    Write-Host "✅ Распаковка завершена" -ForegroundColor Green
} catch {
    Write-Host "✗ Ошибка при распаковке: $_" -ForegroundColor Red
    exit 1
}

# Добавление в PATH
Write-Host "`n🔧 Добавление в PATH..." -ForegroundColor Cyan
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($currentPath -notlike "*$ngrokDir*") {
    [Environment]::SetEnvironmentVariable("Path", "$currentPath;$ngrokDir", "User")
    $env:Path += ";$ngrokDir"
    Write-Host "✅ Добавлено в PATH" -ForegroundColor Green
    Write-Host "⚠ Может потребоваться перезапуск терминала" -ForegroundColor Yellow
} else {
    Write-Host "✅ Уже в PATH" -ForegroundColor Green
}

# Проверка установки
Write-Host "`n🧪 Проверка установки..." -ForegroundColor Cyan
Start-Sleep -Seconds 2
$ngrokExe = "$ngrokDir\ngrok.exe"
if (Test-Path $ngrokExe) {
    Write-Host "✅ ngrok успешно установлен!" -ForegroundColor Green
    Write-Host "`nРасположение: $ngrokExe" -ForegroundColor Cyan
    
    # Попытка запуска версии
    try {
        & $ngrokExe version
    } catch {
        Write-Host "⚠ Не удалось проверить версию (возможно, нужно перезапустить терминал)" -ForegroundColor Yellow
    }
    
    Write-Host "`n📝 Следующие шаги:" -ForegroundColor Yellow
    Write-Host "1. Перезапустите терминал (или используйте полный путь)" -ForegroundColor White
    Write-Host "2. Зарегистрируйтесь на https://dashboard.ngrok.com (опционально)" -ForegroundColor White
    Write-Host "3. Настройте authtoken: ngrok config add-authtoken ВАШ_TOKEN (если зарегистрировались)" -ForegroundColor White
    Write-Host "4. Запустите: ngrok http 3000" -ForegroundColor White
    Write-Host "   или используйте скрипт: .\start-ngrok.ps1" -ForegroundColor White
    
} else {
    Write-Host "✗ Ошибка: ngrok.exe не найден после установки" -ForegroundColor Red
    exit 1
}
