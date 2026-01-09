# 🎯 TWITCH OAUTH - ЧЁТКАЯ ИНСТРУКЦИЯ

## Шаг 1: Создать Twitch приложение

1. Откройте: https://dev.twitch.tv/console/apps
2. Нажмите **"Register Your Application"** или **"Create"**
3. Заполните:
   - **Name**: Drops Crypto (или любое)
   - **OAuth Redirect URLs**: `http://localhost:3000/auth/twitch/callback`
   - **Category**: Website Integration (или любая)

4. Сохраните и скопируйте:
   - **Client ID**
   - **Client Secret** (нажмите "New Secret" если нужно)

---

## Шаг 2: Заполнить .env

**Откройте:** `C:\Users\Admin\Downloads\drops\drops-crypto-api\.env`

**Добавьте/обновите:**
```env
TWITCH_CLIENT_ID=ваш_client_id
TWITCH_CLIENT_SECRET=ваш_client_secret
TWITCH_REDIRECT_URI=http://localhost:3000/auth/twitch/callback
PUBLIC_BASE_URL=http://localhost:3000
APP_DEEPLINK_SCHEME=dropscrypto
JWT_SECRET=любая_длинная_случайная_строка_для_безопасности
```

**Важно**: 
- `TWITCH_REDIRECT_URI` должен быть **ТОЧНО** таким же, как в Twitch Console
- Без пробелов, без лишних символов

---

## Шаг 3: Перезапустить backend

```powershell
cd C:\Users\Admin\Downloads\drops\drops-crypto-api
npm run start:dev
```

**Дождитесь:** `Nest application successfully started`

**Проверка:**
```
http://localhost:3000/health → { "ok": true }
```

---

## Шаг 4: Пройти OAuth flow

### 4.1 Открыть OAuth URL

В браузере откройте:
```
http://localhost:3000/auth/twitch/start
```

### 4.2 Авторизация

1. Twitch покажет экран авторизации
2. Нажмите **"Authorize"**
3. Twitch перенаправит на `/auth/twitch/callback`

### 4.3 Что произойдет

- Backend обработает callback
- Создаст пользователя в БД
- Попытается редиректнуть на `dropscrypto://auth?token=...`

**На ПК deep link может не открыться** — это нормально! Пользователь в БД уже создан.

### 4.4 Проверить в Prisma Studio

```powershell
cd C:\Users\Admin\Downloads\drops\drops-crypto-api
npx prisma studio
```

**Откройте таблицу User** → Найдите запись с `twitchLogin = tiktak6828`

**❓ Напишите:** Появилась ли запись? (да/нет)

---

## Шаг 5: Найти twitchUserId и прописать ADMIN_TWITCH_IDS

### 5.1 Найти twitchUserId

В Prisma Studio (таблица User):
- Найдите запись `twitchLogin = tiktak6828`
- Скопируйте значение **twitchUserId**

### 5.2 Добавить в .env

Откройте `.env` и добавьте/обновите:
```env
ADMIN_TWITCH_IDS=ваш_twitch_user_id
```

**Пример:**
```env
ADMIN_TWITCH_IDS=123456789
```

### 5.3 Перезапустить backend

**ВАЖНО**: .env перечитывается только при запуске!

```powershell
# Остановить (Ctrl+C)
# Затем:
npm run start:dev
```

---

## Шаг 6: Проверить админ-доступ

### 6.1 Получить JWT токен

**Вариант A:** Из deep link редиректа
- Скопируйте `token=...` из URL после OAuth

**Вариант B:** Через OAuth еще раз
- Откройте: `http://localhost:3000/auth/twitch/start`
- Скопируйте токен из редиректа

### 6.2 Проверить Admin Guard

```powershell
cd C:\Users\Admin\Downloads\drops\drops-crypto-api
.\test-admin-guard.ps1 -Token "ВАШ_JWT_ТОКЕН"
```

**Ожидается:**
- ✅ **200 OK** → Admin Guard работает!
- ❌ **403 Forbidden** → Проверьте ADMIN_TWITCH_IDS и перезапуск backend

---

## Шаг 7: Создать тестовый claim

### 7.1 Проверить призы

Если призов нет, сначала создайте:
```powershell
cd C:\Users\Admin\Downloads\drops\drops-crypto-api
npm run prisma:seed
```

### 7.2 Создать claim

```powershell
.\create-test-claim.ps1 -Token "ВАШ_JWT_ТОКЕН"
```

**Скрипт:**
- Найдет доступный приз
- Создаст claim
- Покажет claimId

### 7.3 Проверить смену статуса

**В PowerShell (или через API):**

```powershell
$token = "ВАШ_JWT_ТОКЕН"
$headers = @{ Authorization = "Bearer $token" }

# Получить список claims
$claims = Invoke-RestMethod -Uri "http://localhost:3000/admin/claims" -Headers $headers
$claimId = $claims[0].id

# Изменить статус на PROCESSING
Invoke-RestMethod -Method PUT -Uri "http://localhost:3000/admin/claims/$claimId/mark-processing" -Headers $headers

# Или на SUCCESS
Invoke-RestMethod -Method PUT -Uri "http://localhost:3000/admin/claims/$claimId/mark-success" -Headers $headers

# Или на FAILED
$body = @{ error = "Test error" } | ConvertTo-Json
Invoke-RestMethod -Method PUT -Uri "http://localhost:3000/admin/claims/$claimId/mark-failed" -Headers $headers -Body $body -ContentType "application/json"
```

**В мобилке:**
- Откройте вкладку **"Мои призы"**
- Обновите (pull-to-refresh)
- Проверьте изменение статуса
- Проверьте фильтры (Все / В ожидании / Успешно / Ошибка)

---

## ❌ Решение проблем

### Ошибка: "redirect_uri_mismatch"

**Причина**: Redirect URI в Twitch Console не совпадает с .env

**Решение**:
1. Проверьте Twitch Console → OAuth Redirect URLs
2. Должно быть: `http://localhost:3000/auth/twitch/callback`
3. Убедитесь, что в .env: `TWITCH_REDIRECT_URI=http://localhost:3000/auth/twitch/callback`
4. **ТОЧНО одинаково**, без пробелов!

**Если не помогает** — пришлите текст ошибки, укажу точное значение.

### Ошибка: "invalid_client"

**Причина**: Неверный Client ID или Secret

**Решение**:
1. Проверьте `.env` файл
2. Убедитесь, что Client ID и Secret скопированы правильно
3. Без пробелов, без лишних символов

### Backend не запускается

**Решение**:
1. Проверьте синтаксис `.env` файла
2. Убедитесь, что все переменные заполнены
3. Перезапустите backend

---

## ✅ Чеклист

- [ ] Шаг 1: Twitch приложение создано, Client ID и Secret скопированы
- [ ] Шаг 2: .env заполнен (TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, TWITCH_REDIRECT_URI)
- [ ] Шаг 3: Backend перезапущен, /health отвечает
- [ ] Шаг 4: OAuth flow пройден, пользователь в БД (проверено через Prisma Studio)
- [ ] Шаг 5: twitchUserId найден, ADMIN_TWITCH_IDS прописан, backend перезапущен
- [ ] Шаг 6: Admin Guard работает (200 OK)
- [ ] Шаг 7: Тестовый claim создан, статусы переключаются

---

**После Шага 4 напишите: появилась ли запись в таблице User? (да/нет)** ✅
