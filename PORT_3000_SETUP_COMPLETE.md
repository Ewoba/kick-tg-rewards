# Port 3000 Setup Complete ✅

## What's Ready

### Backend (NestJS)
- **Port:** 3000
- **Health:** `http://localhost:3000/health`
- **Status:** ✅ Compiles, runs on 0.0.0.0:3000
- **Database:** Starts without DB (timeout protection added)
- **Env:** PORT=3000, reads from environment

### Mobile App (React Native / Expo)
- **API Base:** `http://10.0.2.2:3000` (Android emulator)
- **Status:** ✅ Dependencies installed
- **Commands:** 
  ```bash
  cd drops-crypto-app
  npx expo start -c
  # Press 'a' for Android
  ```

### Twitch OAuth
- **Client ID:** `8z9i3mclo11j984ow4scz3gyg6wge` ✅ Verified in Console
- **Client Secret:** `kqtiw59y2fraq7dhnwei550u94onmv` ✅ Verified in Console
- **Redirect URL:** `http://localhost:3000/auth/twitch/callback` ✅ Verified
- **OAuth Start:** `http://localhost:3000/auth/twitch/start`

---

## Quick Start (3 Steps)

### 1️⃣ Start Backend
```batch
cd c:\Users\Admin\Music\drops\drops-crypto-api
node dist/src/main.js
```
Or double-click: `c:\Users\Admin\Music\drops\final-start-backend.bat`

### 2️⃣ Test OAuth Flow (in browser)
```
http://localhost:3000/auth/twitch/start
```
- Sign in with Twitch (tiktak6828)
- After redirect, extract JWT token from URL

### 3️⃣ Start Mobile App (new terminal)
```bash
cd c:\Users\Admin\Music\drops\drops-crypto-app
npx expo start -c
# Press 'a' for Android emulator
```

---

## Next: Get Admin Access

After OAuth redirects back:
1. Copy your `twitchUserId` from Prisma Studio:
   ```bash
   npx prisma studio
   ```
2. Update `.env`:
   ```
   ADMIN_TWITCH_IDS=<your_twitchUserId>
   ```
3. Restart backend
4. Test admin endpoints with JWT token

---

## All Port References Updated
- ✅ `drops-crypto-api/.env` → PORT=3000
- ✅ `drops-crypto-api/src/main.ts` → reads PORT, binds 0.0.0.0
- ✅ `drops-crypto-app/utils/api.ts` → 10.0.2.2:3000
- ✅ `drops-crypto-app/App.tsx` → 10.0.2.2:3000
- ✅ All screen files → 10.0.2.2:3000
- ✅ All scripts updated

---

## Troubleshooting

**Backend won't start:**
- Check: `netstat -ano | findstr :3000`
- Kill existing: `taskkill /IM node.exe /F`
- Rebuild: `npm run build` in drops-crypto-api

**Twitch "invalid client":**
- Verify Client ID/Secret in [Twitch Console](https://dev.twitch.tv/console)
- Test credentials: `node test-twitch-token.js`

**Mobile can't connect:**
- Emulator IP for backend: `10.0.2.2:3000` (not localhost!)
- Real device: Use ngrok URL or local network IP

---

**Status: Port 3000 setup complete and tested ✅**
