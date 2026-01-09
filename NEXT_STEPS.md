# ✅ Автоматически выполнено

Следующие шаги уже выполнены:
- ✅ Установлены зависимости в `drops-crypto-api`
- ✅ Установлены зависимости в `drops-crypto-app`
- ✅ Создан `.env` файл в `drops-crypto-api`
- ✅ Сгенерирован Prisma Client

# ⚠️ Требуется выполнить вручную

## 1. Запустить Docker Desktop

Docker Desktop должен быть запущен перед следующими шагами.

**Windows:** Найдите "Docker Desktop" в меню Пуск и запустите его.
**Mac:** Откройте Docker Desktop из Applications.

Дождитесь, пока Docker Desktop полностью запустится (иконка в трее будет зеленой).

## 2. Запустить Docker Compose

После запуска Docker Desktop, выполните:

```bash
cd drops-crypto-api
docker compose up -d
```

Проверьте, что контейнеры запущены:
```bash
docker ps
```

Должны быть видны контейнеры `postgres` и `redis`.

## 3. Выполнить миграции Prisma

```bash
cd drops-crypto-api
npx prisma migrate dev --name init
```

Это создаст таблицы в базе данных PostgreSQL.

## 4. Настроить Twitch ключи

Откройте файл `drops-crypto-api/.env` и замените:

```
TWITCH_CLIENT_ID=your_twitch_client_id_here
TWITCH_CLIENT_SECRET=your_twitch_client_secret_here
```

на ваши реальные ключи из https://dev.twitch.tv/console/apps

## 5. Запустить Backend

```bash
cd drops-crypto-api
npm run start:dev
```

Backend должен запуститься на `http://localhost:3000`.

Проверьте: откройте http://localhost:3000/health в браузере → должно вернуть `{"ok":true}`

## 6. Запустить ngrok (в новом терминале)

```bash
ngrok http 3000
```

Скопируйте HTTPS URL (например: `https://xxxxx.ngrok-free.app`)

## 7. Обновить .env с ngrok URL

В файле `drops-crypto-api/.env` замените:

```
PUBLIC_BASE_URL=http://localhost:3000
TWITCH_REDIRECT_URI=http://localhost:3000/auth/twitch/callback
```

на:

```
PUBLIC_BASE_URL=https://xxxxx.ngrok-free.app
TWITCH_REDIRECT_URI=https://xxxxx.ngrok-free.app/auth/twitch/callback
```

(Замените `xxxxx.ngrok-free.app` на ваш реальный ngrok URL)

## 8. Перезапустить Backend

Остановите backend (Ctrl+C) и запустите снова:

```bash
npm run start:dev
```

## 9. Настроить Twitch Developer Console

1. Перейдите на https://dev.twitch.tv/console/apps
2. Откройте ваше приложение
3. В разделе "OAuth Redirect URLs" добавьте:

```
https://xxxxx.ngrok-free.app/auth/twitch/callback
```

4. Сохраните изменения

## 10. Обновить Mobile App

Откройте файл `drops-crypto-app/App.tsx` и найдите строку:

```typescript
const API_BASE = 'https://xxxxx.ngrok-free.app';
```

Замените `https://xxxxx.ngrok-free.app` на ваш реальный ngrok URL.

## 11. Запустить Mobile App

```bash
cd drops-crypto-app
npm start
```

Откройте Expo Go на телефоне и отсканируйте QR код.

## 12. Тестирование

1. В приложении нажмите "Привязать Twitch"
2. Войдите в Twitch
3. Должно вернуть в приложение с токеном
4. В приложении должно показаться "Token: есть"

# ✅ Контрольная точка

Все работает, если:
- ✅ `/health` открывается с телефона через ngrok
- ✅ После нажатия "Привязать Twitch" открывается Twitch login
- ✅ После авторизации возвращается в приложение
- ✅ В приложении показывается "Token: есть"

---

**Важно:** Если ngrok URL изменится (при перезапуске ngrok), нужно обновить его во всех местах:
1. `drops-crypto-api/.env` (PUBLIC_BASE_URL и TWITCH_REDIRECT_URI)
2. `drops-crypto-app/App.tsx` (API_BASE)
3. Twitch Developer Console (OAuth Redirect URLs)
