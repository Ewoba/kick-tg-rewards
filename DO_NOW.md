# ⚡ ВЫПОЛНИТЬ СЕЙЧАС

## 1️⃣ Twitch Console

1. Откройте: https://dev.twitch.tv/console/apps
2. Создайте приложение
3. В **Redirect URL** добавьте **СТРОГО**:
   ```
   http://localhost:3000/auth/twitch/callback
   ```
4. Скопируйте:
   - **Client ID**
   - **Client Secret**

---

## 2️⃣ .env файл

**Откройте:** `C:\Users\Admin\Downloads\drops\drops-crypto-api\.env`

**⚠️ ВАЖНО: Каждая переменная должна быть с новой строки!**

**Вставьте в таком виде (с переносами строк):**

```env
TWITCH_CLIENT_ID=ваш_client_id
TWITCH_CLIENT_SECRET=ваш_client_secret
TWITCH_REDIRECT_URI=http://localhost:3000/auth/twitch/callback
PUBLIC_BASE_URL=http://localhost:3000
APP_DEEPLINK_SCHEME=dropscrypto
JWT_SECRET=любая_длинная_случайная_строка
```

**❌ НЕПРАВИЛЬНО (слитно):**
```env
TWITCH_CLIENT_ID=...TWITCH_CLIENT_SECRET=...TWITCH_REDIRECT_URI=...
```

**✅ ПРАВИЛЬНО (каждая переменная с новой строки):**
```env
TWITCH_CLIENT_ID=...
TWITCH_CLIENT_SECRET=...
TWITCH_REDIRECT_URI=...
```

---

## 3️⃣ Перезапустить backend

```powershell
cd C:\Users\Admin\Downloads\drops\drops-crypto-api
npm run start:dev
```

**Дождитесь:** `Nest application successfully started`

**Проверка:**
```
http://localhost:3000/health
```

**Ожидается:** `{ "ok": true }`

---

## 4️⃣ Пройти OAuth flow

**Откройте в браузере:**
```
http://localhost:3000/auth/twitch/start
```

**Дальше:**
1. Twitch покажет экран авторизации
2. Нажмите **"Authorize"**
3. Twitch перенаправит на `/auth/twitch/callback`

**⚠️ Нюанс:** После callback вас может попытаться перекинуть на `dropscrypto://...` — на ПК это нормально, если не откроется. **Главное — запись должна создаться в БД.**

---

## 5️⃣ Проверить появление пользователя

```powershell
cd C:\Users\Admin\Downloads\drops\drops-crypto-api
npx prisma studio
```

**В Prisma Studio:**
1. Откройте таблицу **User**
2. Найдите запись с `twitchLogin = tiktak6828`

---

## ❓ Что мне нужно от вас

**После шагов 4–5 ответьте одним словом:**

- **"Да"** — если запись появилась в таблице User
- **"Нет"** — если записи нет / ошибка

**Если "Нет"** — пришлите текст ошибки (обычно это `redirect_uri_mismatch`), и я скажу, что именно не совпало.

---

## ✅ Чеклист

- [ ] Twitch Console: приложение создано, Redirect URL добавлен
- [ ] Client ID и Secret скопированы
- [ ] .env заполнен (каждая переменная с новой строки!)
- [ ] Backend перезапущен
- [ ] `/health` отвечает `{ "ok": true }`
- [ ] OAuth flow пройден: `http://localhost:3000/auth/twitch/start`
- [ ] Prisma Studio открыт, таблица User проверена

---

**Выполняйте шаги по порядку. После шагов 4–5 напишите: "Да" или "Нет"** ✅
