# Скрипт для запуска Android эмулятора
Write-Host "=== Запуск Android эмулятора ===" -ForegroundColor Cyan

# Поиск эмулятора
$possiblePaths = @(
    "$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe",
    "$env:USERPROFILE\AppData\Local\Android\Sdk\emulator\emulator.exe",
    "${env:ANDROID_HOME}\emulator\emulator.exe"
)

$emulatorPath = $null
foreach ($path in $possiblePaths) {
    if (Test-Path $path) {
        $emulatorPath = $path
        Write-Host "✅ Найден эмулятор: $path" -ForegroundColor Green
        break
    }
}

if (-not $emulatorPath) {
    Write-Host "❌ Android эмулятор не найден" -ForegroundColor Red
    Write-Host ""
    Write-Host "Установите Android Studio:" -ForegroundColor Yellow
    Write-Host "1. Скачайте: https://developer.android.com/studio" -ForegroundColor White
    Write-Host "2. Установите Android Studio" -ForegroundColor White
    Write-Host "3. В Android Studio: Tools → SDK Manager → SDK Tools" -ForegroundColor White
    Write-Host "4. Установите: Android Emulator, Android SDK Platform-Tools" -ForegroundColor White
    Write-Host "5. Создайте эмулятор: Tools → Device Manager → Create Device" -ForegroundColor White
    exit 1
}

# Список доступных эмуляторов
Write-Host "`nДоступные эмуляторы:" -ForegroundColor Yellow
$avds = & $emulatorPath -list-avds

if ($avds.Count -eq 0) {
    Write-Host "❌ Нет созданных эмуляторов" -ForegroundColor Red
    Write-Host ""
    Write-Host "Создайте эмулятор в Android Studio:" -ForegroundColor Yellow
    Write-Host "Tools → Device Manager → Create Device" -ForegroundColor White
    exit 1
}

for ($i = 0; $i -lt $avds.Count; $i++) {
    Write-Host "  $($i + 1). $($avds[$i])" -ForegroundColor White
}

# Выбор эмулятора
Write-Host ""
$choice = Read-Host "Выберите эмулятор (1-$($avds.Count))"

try {
    $index = [int]$choice - 1
    if ($index -lt 0 -or $index -ge $avds.Count) {
        Write-Host "❌ Неверный выбор" -ForegroundColor Red
        exit 1
    }
    
    $selectedAvd = $avds[$index]
    Write-Host "`n🚀 Запуск эмулятора: $selectedAvd" -ForegroundColor Cyan
    Write-Host "Это может занять минуту..." -ForegroundColor Yellow
    Write-Host ""
    
    # Запуск эмулятора в фоне
    Start-Process -FilePath $emulatorPath -ArgumentList "-avd", $selectedAvd -WindowStyle Normal
    
    Write-Host "✅ Эмулятор запускается..." -ForegroundColor Green
    Write-Host ""
    Write-Host "Следующие шаги:" -ForegroundColor Yellow
    Write-Host "1. Дождитесь полной загрузки эмулятора" -ForegroundColor White
    Write-Host "2. Установите Expo Go из Play Store на эмуляторе" -ForegroundColor White
    Write-Host "3. Запустите приложение: cd drops-crypto-app; npm start" -ForegroundColor White
    Write-Host "4. В Expo CLI нажмите 'a' для Android" -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host "❌ Ошибка: $_" -ForegroundColor Red
    exit 1
}
