# 🔧 НАСТРОЙКА TWITCH OAUTH

## Шаг 1: Twitch Developer Console

### 1.1 Создать приложение

1. Откройте: https://dev.twitch.tv/console/apps
2. Нажмите **"Register Your Application"** или **"Create"**
3. Заполните:
   - **Name**: Drops Crypto (или любое имя)
   - **OAuth Redirect URLs**: `http://localhost:3000/auth/twitch/callback`
   - **Category**: Choose any (например, Website Integration)

4. Сохраните и скопируйте:
   - **Client ID**
   - **Client Secret** (нажмите "New Secret" если нужно)

---

## Шаг 2: Настроить .env

Откройте файл:
```
C:\Users\Admin\Downloads\drops\drops-crypto-api\.env
```

**Добавьте/обновите следующие строки:**

```env
# Twitch OAuth
TWITCH_CLIENT_ID=ваш_client_id
TWITCH_CLIENT_SECRET=ваш_client_secret
TWITCH_REDIRECT_URI=http://localhost:3000/auth/twitch/callback

# App configuration
PUBLIC_BASE_URL=http://localhost:3000
APP_DEEPLINK_SCHEME=dropscrypto
JWT_SECRET=любая_длинная_случайная_строка_для_безопасности
```

**Пример полного .env:**

```env
DATABASE_URL=postgresql://drops:drops@localhost:5432/drops
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=supersecret_random_string_12345

# Twitch OAuth
TWITCH_CLIENT_ID=abc123xyz456
TWITCH_CLIENT_SECRET=def789uvw012
TWITCH_REDIRECT_URI=http://localhost:3000/auth/twitch/callback

# App configuration
PUBLIC_BASE_URL=http://localhost:3000
APP_DEEPLINK_SCHEME=dropscrypto

# Admin (после OAuth)
ADMIN_TWITCH_IDS=
```

---

## Шаг 3: Перезапустить backend

**ВАЖНО**: После изменения .env обязательно перезапустить!

```powershell
# Остановить (Ctrl+C если запущен)
# Затем запустить заново:
cd C:\Users\Admin\Downloads\drops\drops-crypto-api
npm run start:dev
```

**Дождитесь:** `Nest application successfully started`

---

## Шаг 4: Проверить /health

Откройте в браузере:
```
http://localhost:3000/health
```

**Ожидается:** `{ "ok": true }`

---

## Шаг 5: Запустить OAuth flow

### 5.1 Открыть OAuth URL

В браузере на ПК откройте:
```
http://localhost:3000/auth/twitch/start
```

### 5.2 Авторизация в Twitch

1. Twitch покажет экран авторизации
2. Нажмите **"Authorize"** (разрешить доступ)
3. Twitch перенаправит на `/auth/twitch/callback`

### 5.3 Что произойдет

- Backend обработает callback
- Создаст/обновит пользователя в БД
- Попытается редиректнуть на `dropscrypto://auth?token=...`

**На ПК** deep link может не открыться, но это **не проблема** — пользователь в БД создастся!

---

## Шаг 6: Проверить успешность OAuth

### Открыть Prisma Studio

```powershell
cd C:\Users\Admin\Downloads\drops\drops-crypto-api
npx prisma studio
```

### Проверить таблицу User

1. Откройте таблицу **User**
2. Найдите запись с `twitchLogin = tiktak6828`
3. Скопируйте **twitchUserId**

**Если запись есть** → OAuth прошел успешно! ✅

**Если записи нет** → проверьте:
- Redirect URI в Twitch Console совпадает с .env
- Backend запущен
- Нет ошибок в консоли backend

---

## Шаг 7: Настроить ADMIN_TWITCH_IDS

После получения twitchUserId:

1. Откройте `.env`
2. Обновите строку:
   ```env
   ADMIN_TWITCH_IDS=ваш_twitch_user_id
   ```
3. Перезапустите backend

---

## ❌ Решение проблем

### Ошибка: "redirect_uri_mismatch"

**Причина**: Redirect URI в Twitch Console не совпадает с .env

**Решение**:
1. Проверьте Twitch Console → OAuth Redirect URLs
2. Должно быть: `http://localhost:3000/auth/twitch/callback`
3. Убедитесь, что в .env: `TWITCH_REDIRECT_URI=http://localhost:3000/auth/twitch/callback`

### Ошибка: "invalid_client"

**Причина**: Неверный Client ID или Secret

**Решение**:
1. Проверьте `.env` файл
2. Убедитесь, что Client ID и Secret скопированы правильно (без пробелов)

### Backend не запускается

**Решение**:
1. Проверьте, что все переменные в .env заполнены
2. Убедитесь, что нет синтаксических ошибок в .env
3. Перезапустите backend после любых изменений .env

---

## ✅ Чеклист

- [ ] Twitch Developer Console: приложение создано
- [ ] Client ID и Secret скопированы
- [ ] Redirect URI добавлен: `http://localhost:3000/auth/twitch/callback`
- [ ] .env файл заполнен (TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, TWITCH_REDIRECT_URI)
- [ ] Backend перезапущен после изменения .env
- [ ] `/health` отвечает `{ "ok": true }`
- [ ] OAuth flow запущен: `http://localhost:3000/auth/twitch/start`
- [ ] Авторизация в Twitch прошла
- [ ] Пользователь создан в БД (проверено через Prisma Studio)
- [ ] twitchUserId скопирован и добавлен в ADMIN_TWITCH_IDS

---

**После выполнения всех шагов можно тестировать Admin Guard!** 🚀
