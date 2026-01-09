# Инструкция по настройке Drops Crypto

## Шаг 1: Подготовка окружения

### Требования:
- ✅ Node.js 20+
- ✅ Docker + Docker Compose
- ✅ Git
- ✅ ngrok
- ✅ Expo Go (на телефоне) или Android Studio/Xcode

## Шаг 2: Настройка Backend

### 2.1 Установка зависимостей

```bash
cd drops-crypto-api
npm install
```

### 2.2 Запуск инфраструктуры

```bash
docker compose up -d
```

Это запустит:
- PostgreSQL на порту 5432
- Redis на порту 6379

### 2.3 Настройка переменных окружения

Создайте файл `.env` на основе `.env.example`:

```bash
cp .env.example .env
```

Заполните следующие переменные:

```env
DATABASE_URL=postgresql://drops:drops@localhost:5432/drops
REDIS_URL=redis://localhost:6379

TWITCH_CLIENT_ID=ваш_twitch_client_id
TWITCH_CLIENT_SECRET=ваш_twitch_client_secret
JWT_SECRET=supersecret

PUBLIC_BASE_URL=http://localhost:3000
APP_DEEPLINK_SCHEME=dropscrypto
TWITCH_REDIRECT_URI=http://localhost:3000/auth/twitch/callback
```

### 2.4 Инициализация базы данных

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 2.5 Получение Twitch Client ID и Secret

1. Перейдите на https://dev.twitch.tv/console/apps
2. Войдите в аккаунт Twitch
3. Создайте новое приложение или используйте существующее
4. Скопируйте Client ID и создайте Client Secret
5. Вставьте их в `.env`

### 2.6 Запуск Backend (пока без ngrok)

```bash
npm run start:dev
```

Backend должен запуститься на `http://localhost:3000`

Проверьте: откройте http://localhost:3000/health - должно вернуть `{"ok":true}`

## Шаг 3: Настройка ngrok

### 3.1 Запуск ngrok

В **новом терминале**:

```bash
ngrok http 3000
```

### 3.2 Получение публичного URL

ngrok покажет что-то вроде:

```
Forwarding   https://xxxxx.ngrok-free.app -> http://localhost:3000
```

Скопируйте этот HTTPS URL (например: `https://xxxxx.ngrok-free.app`)

### 3.3 Обновление .env

Обновите `drops-crypto-api/.env`:

```env
PUBLIC_BASE_URL=https://xxxxx.ngrok-free.app
TWITCH_REDIRECT_URI=https://xxxxx.ngrok-free.app/auth/twitch/callback
```

### 3.4 Перезапуск Backend

Остановите backend (Ctrl+C) и запустите снова:

```bash
npm run start:dev
```

### 3.5 Проверка доступности

Откройте на **телефоне** (в браузере):

`https://xxxxx.ngrok-free.app/health`

Должно вернуть `{"ok":true}`

✅ **Контрольная точка**: Если health endpoint открывается с телефона - всё настроено правильно!

## Шаг 4: Настройка Twitch Developer Console

### 4.1 Добавление Redirect URL

1. Перейдите на https://dev.twitch.tv/console/apps
2. Откройте ваше приложение
3. В разделе "OAuth Redirect URLs" добавьте:

```
https://xxxxx.ngrok-free.app/auth/twitch/callback
```

(Замените `xxxxx.ngrok-free.app` на ваш ngrok URL)

4. Сохраните изменения

## Шаг 5: Настройка мобильного приложения

### 5.1 Установка зависимостей

```bash
cd drops-crypto-app
npm install
```

### 5.2 Обновление API URL

Откройте `drops-crypto-app/App.tsx` и замените:

```typescript
const API_BASE = 'https://xxxxx.ngrok-free.app';
```

на ваш ngrok URL.

### 5.3 Запуск приложения

```bash
npm start
```

### 5.4 Открытие в Expo Go

1. Установите Expo Go на телефон (iOS/Android)
2. Отсканируйте QR код из терминала
3. Или запустите на эмуляторе/симуляторе

## Шаг 6: Тестирование OAuth флоу

### 6.1 Проверка диплинка

1. В приложении нажмите "Привязать Twitch"
2. Откроется браузер с Twitch login
3. Войдите в Twitch
4. Twitch перенаправит на ваш callback URL
5. Backend создаст JWT и редиректнет в приложение
6. Приложение должно открыться и показать "Token: есть"

### 6.2 Если не вернуло в приложение

Проверьте:

1. ✅ Scheme в `drops-crypto-app/app.json` равен `"dropscrypto"`
2. ✅ `APP_DEEPLINK_SCHEME` в backend `.env` равен `dropscrypto`
3. ✅ Redirect URL в Twitch Console совпадает с ngrok URL
4. ✅ ngrok все еще запущен (URL не изменился)

## Шаг 7: Следующие шаги

После успешной контрольной точки можно:

1. Добавить навигацию (Profile/Streamers/Prizes)
2. Добавить запрос `/me` с авторизацией
3. Создать экран добавления кошелька
4. Улучшить UI

## Troubleshooting

### Backend не запускается

- Проверьте, что PostgreSQL запущен: `docker ps`
- Проверьте `.env` файл
- Проверьте логи: `docker compose logs postgres`

### ngrok не работает

- Убедитесь, что backend запущен на порту 3000
- Проверьте, что ngrok запущен в отдельном терминале
- Если ngrok показывает ошибку - проверьте, что порт 3000 свободен

### Twitch OAuth не работает

- Проверьте Redirect URL в Twitch Console
- Убедитесь, что Client ID и Secret правильные
- Проверьте логи backend при попытке авторизации

### Диплинк не работает

- Убедитесь, что scheme совпадает везде
- Переустановите приложение в Expo Go
- Проверьте, что deep link правильно парсится в `App.tsx`
