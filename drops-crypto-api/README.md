# Drops Crypto API

Backend API для приложения Drops криптой на NestJS + Prisma + PostgreSQL.

## Требования

- Node.js 20+
- Docker + Docker Compose
- ngrok

## Установка

1. Установите зависимости:

```bash
npm install
```

2. Скопируйте `.env.example` в `.env` и заполните:

```bash
cp .env.example .env
```

3. Запустите инфраструктуру (PostgreSQL + Redis):

```bash
docker compose up -d
```

4. Настройте базу данных:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

5. Запустите ngrok:

```bash
ngrok http 3000
```

6. Обновите `.env` с вашим ngrok URL:

```
PUBLIC_BASE_URL=https://xxxxx.ngrok-free.app
TWITCH_REDIRECT_URI=https://xxxxx.ngrok-free.app/auth/twitch/callback
```

7. Настройте Twitch Developer Console:

- Перейдите в https://dev.twitch.tv/console/apps
- Создайте приложение или используйте существующее
- В "OAuth Redirect URLs" добавьте: `https://xxxxx.ngrok-free.app/auth/twitch/callback`
- Скопируйте Client ID и Client Secret в `.env`

8. Запустите backend:

```bash
npm run start:dev
```

## Эндпоинты

- `GET /health` - Проверка здоровья сервиса
- `GET /auth/twitch/start` - Начало OAuth флоу с Twitch
- `GET /auth/twitch/callback` - Callback от Twitch (редирект в приложение)
- `GET /me` - Получить информацию о текущем пользователе (требует JWT)
- `POST /me/wallet` - Добавить/обновить кошелёк (требует JWT)

## Структура

- `src/prisma/` - Prisma service и module
- `src/auth/` - Twitch OAuth логика
- `src/me/` - Endpoints для текущего пользователя
- `src/health.controller.ts` - Health check endpoint
