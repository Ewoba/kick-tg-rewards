# ✅ ФИНАЛЬНЫЕ ШАГИ - ВЫПОЛНИТЬ СЕЙЧАС

## 1️⃣ Откройте .env

**Файл:**
```
C:\Users\Admin\Downloads\drops\drops-crypto-api\.env
```

---

## 2️⃣ Вставьте построчно (копируйте целиком)

**Это единственно корректный формат:**

```
TWITCH_CLIENT_ID=ваш_client_id
TWITCH_CLIENT_SECRET=ваш_client_secret
TWITCH_REDIRECT_URI=http://localhost:3000/auth/twitch/callback
PUBLIC_BASE_URL=http://localhost:3000
APP_DEEPLINK_SCHEME=dropscrypto
JWT_SECRET=любая_длинная_случайная_строка
```

**⚠️ ВАЖНО:**
- Каждая переменная на отдельной строке
- После каждой строки Enter (новая строка)
- Не должно быть все в одной строке!

---

## 3️⃣ Перезапустите backend

```powershell
cd C:\Users\Admin\Downloads\drops\drops-crypto-api
npm run start:dev
```

**Проверка:**
```
http://localhost:3000/health → { "ok": true }
```

---

## 4️⃣ Запустите OAuth

**Откройте в браузере:**
```
http://localhost:3000/auth/twitch/start
```

**Дальше:**
1. Twitch покажет экран авторизации
2. Нажмите **"Authorize"**
3. Twitch перенаправит на `/auth/twitch/callback`

---

## 5️⃣ Проверьте, что пользователь создался

```powershell
cd C:\Users\Admin\Downloads\drops\drops-crypto-api
npx prisma studio
```

**В Prisma Studio:**
1. Откройте таблицу **User**
2. Найдите запись с `twitchLogin = tiktak6828`

---

## ❓ После выполнения

**Напишите одним словом:**

- **"Да"** — если запись появилась в таблице User
- **"Нет"** — если записи нет или ошибка

**Если "Нет"** — пришлите текст ошибки.

---

**Выполняйте шаги 1-5 по порядку. После шага 5 напишите: "Да" или "Нет"** ✅
