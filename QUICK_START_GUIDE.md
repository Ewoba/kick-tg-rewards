# 🚀 DROPS CRYPTO - ULTIMATE QUICK START GUIDE

## ⚡ 30-Second Start

### **Step 1: Validate Everything**
Double-click: `c:\Users\Admin\Music\drops\VALIDATE_SETUP_CLEAN.bat`

Expected output:
```
✅ SUCCESS:
   .env file exists
   PORT: 3000
   TWITCH_CLIENT_ID: loaded
   TWITCH_CLIENT_SECRET: loaded
   ...
   ALL CHECKS PASSED!
```

### **Step 2: Start Backend**
Double-click: `c:\Users\Admin\Music\drops\START_BACKEND_CLEAN.bat`

Expected output:
```
Found Node.js: v20.18.0
Starting backend server on port 3000...

[Nest] 12345 - 08.01.2026, 20:49:30 LOG [NestFactory] Starting Nest application...
...
[Nest] 12345 - 08.01.2026, 20:49:34 LOG [NestApplication] Nest application successfully started
Server listening on http://0.0.0.0:3000
```

**Leave this window open!**

### **Step 3: Test Backend (new CMD window)**
```bash
curl http://localhost:3000/health
```

Expected: `{"ok":true}`

### **Step 4: Open OAuth in Browser**
Open: **`http://localhost:3000/auth/twitch/start`**

You will be redirected to Twitch login.

### **Step 5: Sign In With Twitch**
- Account: tiktak6828
- Password: (your password)

After sign-in, you'll be redirected back to your app.

### **Step 6: Start Mobile App (new terminal)**
```bash
cd c:\Users\Admin\Music\drops\drops-crypto-app
npx expo start -c
```

Press `a` for Android emulator.

---

## 📋 Important Notes

### Node.js Version Check
Before starting, verify Node.js is installed:
```bash
node -v
```

Should show: `v20.x.x` (or similar)

If you get "command not found", install Node.js from https://nodejs.org/

### Keyboard Layout
When running commands manually (not using .bat files), **make sure your keyboard is set to English**, not Russian/Cyrillic.

The character `с` (Russian) looks like `c` (English) but is different!

### Port 3000 Must Be Free
Before starting:
```bash
netstat -ano | find ":3000"
```

If it shows a process already using port 3000:
```bash
taskkill /IM node.exe /F
```

---

## 🔍 Troubleshooting

### Backend Won't Start

**Check 1: Is Node.js installed?**
```bash
node -v
```

If error, install from https://nodejs.org/

**Check 2: Is port 3000 free?**
```bash
netstat -ano | find ":3000"
```

If occupied, kill it:
```bash
taskkill /PID <PID> /F
```

**Check 3: Are dependencies installed?**
```bash
cd c:\Users\Admin\Music\drops\drops-crypto-api
npm install
npx prisma generate
```

**Check 4: Rebuild backend**
```bash
npm run build
node dist\src\main.js
```

### OAuth Redirect Error

**Check 1: Redirect URI matches exactly**

In Twitch Console:
```
http://localhost:3000/auth/twitch/callback
```

In .env (line 24):
```
TWITCH_REDIRECT_URI=http://localhost:3000/auth/twitch/callback
```

Must be **exactly identical**. No extra spaces, slashes, or characters.

**Check 2: Backend is running**

Test:
```bash
curl http://localhost:3000/health
```

Should return: `{"ok":true}`

If connection refused, backend is not running. Start it!

**Check 3: Client ID and Secret are valid**

Test:
```bash
cd c:\Users\Admin\Music\drops\drops-crypto-api
node test-twitch-token.js
```

Should show: `HTTP 200` and `✅ SUCCESS: Got access token`

If shows `❌ ERROR: invalid client`, regenerate the Secret in Twitch Console.

### Mobile App Can't Connect

**Check 1: Using correct API URL**

In `drops-crypto-app/utils/api.ts`:
```typescript
export const API_BASE = 'http://10.0.2.2:3000';
```

Must be `10.0.2.2` (not `localhost` or `127.0.0.1`)

**Check 2: Backend is running on port 3000**

Test from emulator's perspective:
```bash
adb shell
ping 10.0.2.2
```

**Check 3: Firewall allows port 3000**

Temporarily disable Windows Defender firewall or add exception for Node.js

---

## 📁 Files You Need

| File | Purpose | How to Use |
|------|---------|-----------|
| `START_BACKEND_CLEAN.bat` | Start backend | Double-click |
| `VALIDATE_SETUP_CLEAN.bat` | Check setup | Double-click |
| `TEST_OAUTH_URL_CLEAN.bat` | Test OAuth URL | Double-click |
| `.env` | Configuration | Edit with VS Code |
| `dist/src/main.js` | Compiled backend | `node dist\src\main.js` |

---

## 🔗 Quick Links

| What | URL | Purpose |
|------|-----|---------|
| Health Check | `http://localhost:3000/health` | Verify backend is running |
| OAuth Start | `http://localhost:3000/auth/twitch/start` | Begin OAuth flow |
| Prisma Studio | `npx prisma studio` | View database |
| API Base | `http://10.0.2.2:3000` | Mobile app API endpoint |

---

## ✅ Configuration Summary

- **Backend:** Port 3000 ✓
- **Mobile:** API_BASE = `http://10.0.2.2:3000` ✓
- **Twitch Client ID:** 8z9i3mclo11j984ow4scz3gyg6wge ✓
- **Twitch Redirect URI:** `http://localhost:3000/auth/twitch/callback` ✓
- **JWT Secret:** Configured in .env ✓
- **Database:** PostgreSQL + Redis (optional, not required for testing) ✓

---

## 🎯 Full Workflow

1. **Validate** → `VALIDATE_SETUP_CLEAN.bat`
2. **Start Backend** → `START_BACKEND_CLEAN.bat` (leave running)
3. **Test Health** → `curl http://localhost:3000/health`
4. **OAuth Test** → Open `http://localhost:3000/auth/twitch/start` in browser
5. **Sign In** → Use Twitch account (tiktak6828)
6. **Start Mobile** → `npx expo start -c` → Press `a`
7. **Test Mobile** → Sign in through mobile app

---

## 📝 Notes

- Keep the backend window open while testing
- Don't close browser tabs with OAuth flows
- If backend crashes, check the error message and restart
- For production, use environment-specific .env files

---

**Ready to start? Double-click `START_BACKEND_CLEAN.bat`!** 🚀
