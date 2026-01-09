# 🎯 ЧТО СДЕЛАТЬ ПРЯМО СЕЙЧАС

## ✅ Шаг 1: Проверить Postgres

```powershell
cd C:\Users\Admin\Downloads\drops\drops-crypto-api
docker compose up -d
docker ps
```

**Ожидается**: postgres и redis в статусе "Up"

## ✅ Шаг 2: Применить миграции

```powershell
cd C:\Users\Admin\Downloads\drops\drops-crypto-api

# Сгенерировать Prisma Client
npx prisma generate

# Применить миграцию
npx prisma migrate dev --name add_oauth_state_and_nonce_used
```

**Что создастся:**
- Таблица `OAuthState`
- Поле `nonceUsed` в `WalletVerification`
- Уникальный индекс на `nonce`

## ✅ Шаг 3: Настроить ADMIN_TWITCH_IDS

### Вариант A: Получить Twitch User ID из JWT токена

**Если у вас есть токен:**
```powershell
cd drops-crypto-api
.\get-twitch-user-id.ps1 -Token "ваш_jwt_токен"
```

Или декодируйте токен на https://jwt.io

### Вариант B: Получить из БД

```powershell
cd drops-crypto-api
npx prisma studio
```

Откройте таблицу `User` → скопируйте `twitchUserId`

### Добавить в .env

Откройте `drops-crypto-api\.env` и добавьте:

```env
ADMIN_TWITCH_IDS=ваш_twitch_user_id
```

**Пример:**
```env
ADMIN_TWITCH_IDS=123456789
```

## ✅ Шаг 4: Перезапустить backend

```powershell
cd C:\Users\Admin\Downloads\drops\drops-crypto-api
npm run start:dev
```

---

## 🔍 Контрольные точки

### 1. API жив ✅

Откройте: `http://localhost:3000/health`

**Ожидается**: `{ "ok": true }`

### 2. OAuth state работает ✅

1. Откройте: `http://localhost:3000/auth/twitch/start`
2. Авторизуйтесь → должно работать
3. Попробуйте использовать тот же state дважды → должна быть ошибка ✅

### 3. Admin Guard работает ✅

**Тест с обычным пользователем:**
```powershell
$token = "обычный_токен"
$headers = @{ Authorization = "Bearer $token" }
Invoke-RestMethod -Uri http://localhost:3000/admin/claims -Headers $headers
```
**Ожидается**: `403 Forbidden` ✅

**Тест с админом:**
```powershell
$token = "admin_токен"  # пользователь из ADMIN_TWITCH_IDS
$headers = @{ Authorization = "Bearer $token" }
Invoke-RestMethod -Uri http://localhost:3000/admin/claims -Headers $headers
```
**Ожидается**: Список claims ✅

### 4. SIWE Nonce одноразовый ✅

1. Получите nonce: `POST /me/wallet/nonce`
2. Верифицируйте: `POST /me/wallet/verify`
3. Попробуйте использовать тот же nonce снова → должна быть ошибка "Nonce already used" ✅

---

## ✅ Готово к тестированию!

После выполнения всех шагов проект готов к тестированию на эмуляторе.
