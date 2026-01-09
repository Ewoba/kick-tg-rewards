# 🔄 Порт изменён обратно на 3000

## Что изменено

Все настройки обновлены для работы на порту **3000**.

---

## ✅ Что уже обновлено автоматически

1. ✅ **Backend порт** (`drops-crypto-api/src/main.ts`) → `3000`
2. ✅ **Мобильное приложение**:
   - `App.tsx` → `http://10.0.2.2:3000`
   - `utils/api.ts` → `http://10.0.2.2:3000`
   - `screens/AuthScreen.tsx` → `http://10.0.2.2:3000`
   - `screens/ProfileScreen.tsx` → `http://10.0.2.2:3000`
   - `screens/StreamersScreen.tsx` → `http://10.0.2.2:3000`
   - `screens/PrizesScreen.tsx` → `http://10.0.2.2:3000`
   - `screens/MyPrizesScreen.tsx` → `http://10.0.2.2:3000`
3. ✅ **Скрипты**: `start-ngrok.ps1` → порт 3000

---

## ⚠️ Что нужно обновить вручную

### 1. Обновите `.env` файл

Откройте: `C:\Users\Admin\Downloads\drops\drops-crypto-api\.env`

**Измените эти строки:**

**Было:**
```env
TWITCH_REDIRECT_URI=http://localhost:3000/auth/twitch/callback
PUBLIC_BASE_URL=http://localhost:3000
```

**Стало:**
```env
TWITCH_REDIRECT_URI=http://localhost:3000/auth/twitch/callback
PUBLIC_BASE_URL=http://localhost:3000
```

---

### 2. Обновите Twitch Console

1. Откройте: **https://dev.twitch.tv/console/apps**
2. Найдите ваше приложение
3. В **OAuth Redirect URLs** измените:
   - **Было**: `http://localhost:3000/auth/twitch/callback`
   - **Стало**: `http://localhost:3000/auth/twitch/callback`
4. **Сохраните изменения**

---

### 3. Перезапустите backend

**Остановите** текущий процесс (Ctrl + C), затем:

```powershell
cd C:\Users\Admin\Downloads\drops\drops-crypto-api
npm run start:dev
```

**Дождитесь:** `Nest application successfully started`

---

### 4. Проверьте

**Health endpoint:**
```
http://localhost:3000/health
```

**Ожидается:** `{ "ok": true }`

**OAuth start:**
```
http://localhost:3000/auth/twitch/start
```

---

## 📋 Чеклист

- [ ] `.env` файл обновлён (`TWITCH_REDIRECT_URI` и `PUBLIC_BASE_URL` на 3000)
- [ ] Twitch Console обновлён (Redirect URI на 3000)
- [ ] Backend перезапущен
- [ ] `/health` отвечает на порту 3000
- [ ] OAuth работает на порту 3000

---

**После выполнения всех шагов приложение будет работать на порту 3000!** ✅
