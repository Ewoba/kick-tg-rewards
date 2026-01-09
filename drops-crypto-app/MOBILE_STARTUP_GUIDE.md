# 📱 STARTING MOBILE APP WITH EXPO

## ✅ Current Status
- ✅ Backend running on port 3000
- ✅ Twitch OAuth credentials verified
- ✅ Health endpoint responding
- ⏳ Mobile app ready to launch

## 🚀 How to Start the Mobile App

### Option 1: Use the Batch File (Recommended - No Terminal Issues)
1. **Navigate to:** `c:\Users\Admin\Music\drops\drops-crypto-app`
2. **Double-click:** `START_EXPO.bat`
3. Wait for the Expo dev server to start (takes ~10-15 seconds)
4. You should see a terminal with a QR code

### Option 2: Command Line (if batch fails)
```powershell
# From the root directory, open CMD (not PowerShell)
cd c:\Users\Admin\Music\drops\drops-crypto-app
npx expo start -c
```

## 📱 Launch on Android Emulator

Once Expo is running and you see the menu:

```
Press w ├ open web
Press a ├ open Android
Press i ├ open iOS simulator
```

**Press `a`** to launch on Android emulator

This will:
1. Build the React Native app for Android
2. Install it on the emulator
3. Automatically open the app

## 🔐 Testing OAuth Flow on Mobile

Once the app launches:

1. **Tap "Sign In with Twitch"** on the home screen
2. **Browser opens** with Twitch login
3. **Sign in with:** tiktak6828 (or your Twitch account)
4. **Allow permissions** when prompted
5. **Redirects back to app** automatically
6. **Extract the twitchUserId** from the profile screen

## 📋 What to Expect

### Success Indicators
- ✅ Backend health check returns: `{"ok":true}`
- ✅ Twitch OAuth token endpoint: HTTP 200 (valid credentials)
- ✅ OAuth URL generates correctly
- ✅ Mobile app connects to `http://10.0.2.2:3000`
- ✅ Sign-in button works and opens Twitch OAuth flow
- ✅ User profile displays after authentication

### If Something Goes Wrong
- Check backend is running: `node test-health.js`
- Check Twitch credentials: `cmd /c diagnose-twitch.bat`
- Mobile can't connect to backend? Verify:
  - Backend listens on `0.0.0.0:3000`
  - Mobile uses `10.0.2.2:3000` (Android emulator special IP)
  - No firewall blocking port 3000

## 🔄 After Successful Login

1. Extract `twitchUserId` from profile
2. Update `.env` line 35: `ADMIN_TWITCH_IDS=<twitchUserId>`
3. Restart backend
4. Retry sign-in (should have admin access)

---

**Backend Location:** `c:\Users\Admin\Music\drops\drops-crypto-api`
**Mobile Location:** `c:\Users\Admin\Music\drops\drops-crypto-app`
**Backend Port:** 3000
**Mobile Emulator IP:** 10.0.2.2:3000
