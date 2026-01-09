# ⚡ БЫСТРЫЙ СТАРТ

## Шаг 1: Запустить Docker
```powershell
cd drops-crypto-api
docker compose up -d
```

## Шаг 2: Запустить Backend
```powershell
cd drops-crypto-api
npx prisma migrate dev
npx ts-node prisma/seed.ts
npm run start:dev
```

**Проверка:** Откройте http://localhost:3000/health → должно быть `{ "ok": true }`

## Шаг 3: Запустить мобилку на эмуляторе

**Убедитесь, что Android Emulator запущен!**

```powershell
cd drops-crypto-app
npm install
npm start
```

В Metro нажмите **`a`** (Android)

---

## ✅ Контрольные точки

1. ✅ `http://localhost:3000/health` работает?
2. ✅ `http://localhost:3000/streamers` работает?
3. ✅ `http://localhost:3000/prizes` работает?
4. ✅ Мобилка открылась на эмуляторе?
5. ✅ Мобилка видит backend (данные грузятся)?

**Если пункт 5 не работает:**
- Проверьте `API_BASE = 'http://10.0.2.2:3000'` в коде
- Проверьте, что backend запущен

---

**Подробная инструкция:** См. `SETUP_GUIDE.md`
