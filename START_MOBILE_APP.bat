@echo off
setlocal enabledelayedexpansion

echo.
echo ============================================================================
echo   📱 ЗАПУСК МОБИЛЬНОГО ПРИЛОЖЕНИЯ (EXPO)
echo ============================================================================
echo.

cd /d "c:\Users\Admin\Music\drops\drops-crypto-app"

if not exist "package.json" (
    echo ❌ ERROR: package.json not found!
    echo Expected at: c:\Users\Admin\Music\drops\drops-crypto-app\package.json
    pause
    exit /b 1
)

echo Проверяем зависимости...
if not exist "node_modules" (
    echo ⚠️  node_modules не найдены, устанавливаем зависимости...
    call npm install
    if errorlevel 1 (
        echo ❌ Не удалось установить зависимости
        pause
        exit /b 1
    )
)

echo.
echo ✅ Запускаем Expo dev server...
echo.
echo 📋 ИНСТРУКЦИИ:
echo   1. Дождись, пока Expo загрузится (это может занять 10-30 секунд)
echo   2. Ты увидишь меню с опциями
echo   3. Нажми: a  (для Android эмулятора)
echo   4. Приложение будет собираться и загружаться на эмулятор (2-3 минуты)
echo.
echo 🛑 Чтобы остановить: Нажми Ctrl+C
echo.

npx expo start -c

pause
