# Drops Crypto

Полный стек приложения для Drops криптой с Twitch OAuth и кошельками.

## Структура проекта

- `drops-crypto-api/` - Backend на NestJS
- `drops-crypto-app/` - Мобильное приложение на React Native + Expo

## Быстрый старт

### 1. Backend

```bash
cd drops-crypto-api
npm install
docker compose up -d
cp .env.example .env
# Отредактируйте .env с вашими ключами Twitch
npx prisma migrate dev --name init
npm run start:dev
```

### 2. ngrok

В отдельном терминале:

```bash
ngrok http 3000
```

Скопируйте https URL и обновите в `drops-crypto-api/.env`:
- `PUBLIC_BASE_URL`
- `TWITCH_REDIRECT_URI`

Также добавьте этот URL в Twitch Developer Console как Redirect URL.

### 3. Мобильное приложение

```bash
cd drops-crypto-app
npm install
# Обновите API_BASE в App.tsx на ваш ngrok URL
npm start
```

Отсканируйте QR код в Expo Go или запустите на эмуляторе.

## Контрольная точка

После настройки проверьте:

1. ✅ Backend запущен на `localhost:3000`
2. ✅ ngrok показывает публичный URL
3. ✅ `/health` доступен с телефона через ngrok URL
4. ✅ Twitch OAuth настроен в Developer Console
5. ✅ Приложение открывает Twitch login при нажатии "Привязать Twitch"
6. ✅ После логина возвращается в приложение с токеном

## Следующие шаги

После успешной проверки контрольной точки:
- Добавить навигацию (Profile/Streamers/Prizes)
- Запрос `/me` с авторизацией
- Экран добавления кошелька
- UI похожий на референс
