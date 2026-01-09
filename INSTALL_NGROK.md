# Установка ngrok

ngrok нужен для создания публичного туннеля к вашему локальному backend.

## Способы установки

### Способ 1: Скачать с официального сайта (рекомендуется)

1. Перейдите на https://ngrok.com/download
2. Скачайте версию для Windows
3. Распакуйте `ngrok.exe` в папку, которая добавлена в PATH, или в удобное место

### Способ 2: Через Chocolatey (если установлен)

```powershell
choco install ngrok
```

### Способ 3: Через Scoop (если установлен)

```powershell
scoop install ngrok
```

### Способ 4: Прямая загрузка

```powershell
# Создайте папку для ngrok
New-Item -ItemType Directory -Path "$env:USERPROFILE\ngrok" -Force

# Скачайте ngrok
Invoke-WebRequest -Uri "https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip" -OutFile "$env:USERPROFILE\ngrok\ngrok.zip"

# Распакуйте
Expand-Archive -Path "$env:USERPROFILE\ngrok\ngrok.zip" -DestinationPath "$env:USERPROFILE\ngrok" -Force

# Добавьте в PATH (текущая сессия)
$env:Path += ";$env:USERPROFILE\ngrok"

# Добавьте в PATH постоянно
[Environment]::SetEnvironmentVariable("Path", $env:Path + ";$env:USERPROFILE\ngrok", "User")
```

## Регистрация (опционально, но рекомендуется)

1. Зарегистрируйтесь на https://dashboard.ngrok.com/signup
2. Получите authtoken на https://dashboard.ngrok.com/get-started/your-authtoken
3. Настройте:

```powershell
ngrok config add-authtoken ВАШ_AUTHTOKEN
```

Регистрация позволяет:
- Использовать стабильные домены
- Больше трафика
- Больше функций

## Использование

После установки запустите:

```powershell
ngrok http 3000
```

Или используйте наш скрипт:

```powershell
.\start-ngrok.ps1
```

## Проверка установки

```powershell
ngrok version
```

Должно показать версию ngrok.
