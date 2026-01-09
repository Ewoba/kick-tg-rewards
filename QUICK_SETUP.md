# ⚡ БЫСТРАЯ УСТАНОВКА - ЧТО СДЕЛАТЬ СЕЙЧАС

## 🎯 Шаг за шагом (строго по порядку)

### 1️⃣ Проверить Docker

```powershell
cd C:\Users\Admin\Downloads\drops\drops-crypto-api
docker compose up -d
docker ps
```

**Должно быть**: `postgres` и `redis` в статусе "Up"

---

### 2️⃣ Применить миграции

```powershell
cd C:\Users\Admin\Downloads\drops\drops-crypto-api

# 1. Сгенерировать Prisma Client
npx prisma generate

# 2. Применить миграцию
npx prisma migrate dev --name add_oauth_state_and_nonce_used
```

**Что произойдет:**
- Создастся таблица `OAuthState` (для CSRF защиты)
- Добавится поле `nonceUsed` в `WalletVerification` (защита от replay)
- Добавится уникальный индекс на `nonce`

**Если ошибка** "migration already exists" → миграция уже применена, можно пропустить.

---

### 3️⃣ Настроить ADMIN_TWITCH_IDS

#### Способ 1: Через скрипт (если есть токен)

```powershell
cd drops-crypto-api

# Если у вас есть JWT токен:
.\get-twitch-user-id.ps1 -Token "ваш_jwt_токен"
```

#### Способ 2: Через Prisma Studio

```powershell
cd drops-crypto-api
npx prisma studio
```

Откройте таблицу `User` → скопируйте `twitchUserId`

#### Способ 3: Через JWT decoder

1. Скопируйте токен из приложения или логов
2. Откройте: https://jwt.io
3. Вставьте токен → в payload найдите `twitchUserId`

#### Добавить в .env

Откройте `drops-crypto-api\.env` и добавьте строку:

```env
ADMIN_TWITCH_IDS=ваш_twitch_user_id
```

**Пример:**
```env
ADMIN_TWITCH_IDS=123456789
```

**Если несколько админов:**
```env
ADMIN_TWITCH_IDS=123456789,987654321
```

---

### 4️⃣ Перезапустить backend

```powershell
cd C:\Users\Admin\Downloads\drops\drops-crypto-api
npm run start:dev
```

Дождитесь: `Nest application successfully started`

---

## ✅ Проверка (контрольные точки)

### ✅ 1. API жив

```
http://localhost:3000/health
```

**Ожидается**: `{ "ok": true }`

### ✅ 2. OAuth state работает

1. Откройте: `http://localhost:3000/auth/twitch/start`
2. Авторизуйтесь → должно работать
3. Попробуйте использовать тот же callback URL дважды → должна быть ошибка ✅

### ✅ 3. Admin Guard работает

**Тест 1: Обычный пользователь → 403**
```powershell
$token = "обычный_токен"
$headers = @{ Authorization = "Bearer $token" }
Invoke-RestMethod -Uri http://localhost:3000/admin/claims -Headers $headers
```
**Ожидается**: `403 Forbidden` ✅

**Тест 2: Админ → 200**
```powershell
$token = "admin_токен"  # twitchUserId в ADMIN_TWITCH_IDS
$headers = @{ Authorization = "Bearer $token" }
Invoke-RestMethod -Uri http://localhost:3000/admin/claims -Headers $headers
```
**Ожидается**: Список claims ✅

### ✅ 4. SIWE Nonce одноразовый

1. `POST /me/wallet/nonce` → получите nonce
2. `POST /me/wallet/verify` → верифицируйте
3. Попробуйте тот же nonce/signature снова → должна быть ошибка "Nonce already used" ✅

---

## 🚀 Готово!

После выполнения всех шагов:

- ✅ Backend запущен
- ✅ Миграции применены
- ✅ Admin Guard настроен
- ✅ OAuth state защищен
- ✅ SIWE nonce защищен

**Можно тестировать на эмуляторе!** 📱

---

**Следующий шаг**: Следуйте `TESTING_CHECKLIST.md` для полного тестирования.
