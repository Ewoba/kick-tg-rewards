# Twitch/Kick Rewards — прототип

Минимальный стек для авторизации через Kick, Telegram-бота и статичного профиля с привязкой Steam trade link.

## Что внутри
- `backend-python/` — FastAPI: OAuth Kick (PKCE), хранение Steam trade link (in-memory), health и моковые rewards.
- `backend-csharp/` — ASP.NET Core minimal API: health + rewards (in-memory).
- `frontend/` — статичная страница профиля с блоками Kick/Twitch/Steam и отображением статуса участия.
- `bot/` — Telegram-бот (python-telegram-bot) с кнопками открытия фронта и авторизации Kick.

## Запуск локально
### Python API
```bash
cd backend-python
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
Проверка: `http://localhost:8000/health` → `{ "ok": true, "service": "python-api" }`.

### C# API (опционально)
```bash
cd backend-csharp
dotnet restore
dotnet run --urls "http://localhost:5000"
```
Проверка: `http://localhost:5000/health`.

### Telegram-бот
```bash
cd bot
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
set BOT_TOKEN=ваш_токен
set FRONTEND_URL=http://localhost:8001
python main.py
```
Команды: `/start`, `/profile`. Есть кнопки «Открыть» (WebApp-ссылка на фронт) и «Авторизоваться в Kick».

### Фронтенд
```bash
python -m http.server 8001 --directory frontend
```
Открыть `http://localhost:8001`. Кнопка «Войти через Kick» ведёт на `/auth/kick/start`. Steam trade link редактируется напрямую в поле и сохраняется в localStorage + через API.

## Основные эндпоинты (Python)
- `GET /health`
- `GET /rewards`, `POST /rewards`, `GET /rewards/{id}`, `DELETE /rewards/{id}`
- `GET /auth/kick/start`, `GET /auth/kick/callback` — PKCE OAuth Kick
- `GET /steam/link`, `POST /steam/link` — хранение Steam trade link (in-memory)
- (Twitch эндпоинты есть, но отключены флагом ENABLE_TWITCH)

## Настройка Kick OAuth
В `backend-python/.env`:
```
KICK_CLIENT_ID=...
KICK_CLIENT_SECRET=...
KICK_REDIRECT_URI=http://localhost:8000/auth/kick/callback
KICK_AUTH_URL=https://id.kick.com/oauth/authorize
KICK_TOKEN_URL=https://id.kick.com/oauth/token
KICK_USER_URL=https://api.kick.com/public/v1/users
KICK_SCOPE=user:read
```
В консоли Kick добавьте Redirect URI точь-в-точь как выше. После «Allow» API вернёт JSON и редиректит на FRONTEND_URL с параметрами `kick_user`, `kick_email`, `kick_id`.

## Что уже сделано
- PKCE OAuth для Kick, редирект в фронт и сохранение профиля на клиенте.
- Плашка «Участие» меняет статус на зелёный, если есть Kick (или Twitch-заглушка) и заполнен Steam trade link.
- Steam trade link можно ввести/удалить, сохраняется в localStorage и через API.
- Бот с кнопками открытия фронта и авторизации Kick.
- Единый стиль блоков Kick/Twitch и кнопок.

## Что дальше (идея бэклога)
- Завести реальное хранилище (DB) вместо in-memory.
- Подключить Twitch OAuth заново и унифицировать статус участия.
- Поднять фронтенд на HTTPS (Vercel/Netlify) и API на публичный хост для полноценного использования в Telegram Web App.
- Добавить refresh токенов, защиту state/PKCE в хранилище, авторизацию бота к API.

## Безопасность
- Не коммить `.env` и токены (используйте `.env.example`).
- В проде требуется HTTPS и точное совпадение Redirect URI в консоли Kick/Twitch.
