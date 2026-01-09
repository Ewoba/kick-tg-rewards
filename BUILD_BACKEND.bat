@echo off
setlocal enabledelayedexpansion

echo.
echo ============================================================================
echo   🔨 КОМПИЛЯЦИЯ BACKEND (npm run build)
echo ============================================================================
echo.

cd /d "c:\Users\Admin\Music\drops\drops-crypto-api"

if not exist "package.json" (
    echo ❌ ERROR: package.json not found!
    echo Expected at: c:\Users\Admin\Music\drops\drops-crypto-api\package.json
    pause
    exit /b 1
)

echo Компилируем NestJS backend...
echo.

npm run build

if %errorlevel% neq 0 (
    echo.
    echo ❌ ОШИБКА: Компиляция не удалась!
    echo Проверь консоль выше на ошибки
    pause
    exit /b 1
)

echo.
echo ✅ Компиляция завершена успешно!
echo.
echo Если видишь это сообщение, бэкенд готов к запуску
echo Используй: AUTO_START_ALL.bat или START_BACKEND_CLEAN.bat
echo.

pause
