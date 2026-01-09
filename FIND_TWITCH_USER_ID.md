# 🔍 НАЙТИ twitchUserId ДЛЯ tiktak6828

## Способ 1: Через Prisma Studio (РЕКОМЕНДУЕТСЯ)

### 1. Запустить Prisma Studio

```powershell
cd C:\Users\Admin\Downloads\drops\drops-crypto-api
npx prisma studio
```

**Ожидается**: Откроется браузер на `http://localhost:5555`

### 2. Найти пользователя

1. В Prisma Studio откройте таблицу **User**
2. Найдите строку, где `twitchLogin = tiktak6828`
3. Скопируйте значение поля **twitchUserId**

**Пример:**
```
twitchUserId: 123456789
```

---

## Способ 2: Через PowerShell + Node.js

### Если пользователь уже есть в БД

**Вариант A: Через Prisma напрямую**

Создайте файл `temp-find-user.js`:

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { twitchLogin: 'tiktak6828' },
    select: { twitchUserId: true, twitchLogin: true }
  });

  if (user) {
    console.log('Twitch User ID:', user.twitchUserId);
    console.log('Twitch Login:', user.twitchLogin);
  } else {
    console.log('Пользователь не найден. Авторизуйтесь через OAuth.');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Запустите:
```powershell
cd C:\Users\Admin\Downloads\drops\drops-crypto-api
node temp-find-user.js
```

Удалите временный файл:
```powershell
Remove-Item temp-find-user.js
```

---

## Способ 3: Если пользователя нет в БД

**Нужно сначала авторизоваться:**

1. Откройте: `http://localhost:3000/auth/twitch/start`
2. Авторизуйтесь через Twitch (ваш аккаунт tiktak6828)
3. После авторизации пользователь создастся в БД
4. Затем используйте Способ 1 или 2 для поиска twitchUserId

---

## После нахождения twitchUserId

### Добавить в .env

Откройте файл:
```
C:\Users\Admin\Downloads\drops\drops-crypto-api\.env
```

**Добавьте строку:**
```env
ADMIN_TWITCH_IDS=ваш_twitch_user_id
```

**Например:**
```env
ADMIN_TWITCH_IDS=123456789
```

**Если несколько админов:**
```env
ADMIN_TWITCH_IDS=123456789,987654321
```

### Перезапустить backend

```powershell
cd C:\Users\Admin\Downloads\drops\drops-crypto-api
npm run start:dev
```

**ВАЖНО**: .env перечитывается только при запуске!

---

## ✅ Проверка

После настройки ADMIN_TWITCH_IDS и перезапуска backend:

```powershell
cd C:\Users\Admin\Downloads\drops\drops-crypto-api
.\test-admin-guard.ps1 -Token "ВАШ_JWT_ТОКЕН"
```

**Ожидается**: `200 OK` (если twitchUserId правильный)

---

**После нахождения twitchUserId и настройки ADMIN_TWITCH_IDS перейдите к следующим шагам!**
