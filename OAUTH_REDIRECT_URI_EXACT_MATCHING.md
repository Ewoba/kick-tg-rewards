# Twitch OAuth Exact Matching Checklist ✅

## The Critical Rule

**The Redirect URI in your code MUST match EXACTLY (byte-for-byte) with the Redirect URI registered in Twitch Developer Console.**

There is NO flexibility here. Even a single character difference will cause `invalid_redirect_uri` errors.

---

## Your Configuration

### In .env (drops-crypto-api/.env)
```
TWITCH_REDIRECT_URI=http://localhost:3000/auth/twitch/callback
```

### In Twitch Developer Console
Must be registered as:
```
http://localhost:3000/auth/twitch/callback
```

### In Backend Code (src/auth/auth.controller.ts)
```typescript
const redirectUri = process.env.TWITCH_REDIRECT_URI!; // Reads from .env
const url =
  `https://id.twitch.tv/oauth2/authorize` +
  `?response_type=code` +
  `&client_id=${clientId}` +
  `&redirect_uri=${encodeURIComponent(redirectUri)}` +  // URL encoded
  `&scope=user:read:email` +
  `&state=${state}`;
```

---

## Step-by-Step Verification

### ✅ Step 1: Verify in Twitch Console

1. Go to [Twitch Developer Console](https://dev.twitch.tv/console/apps)
2. Click on your application "drops kript"
3. Click "Edit"
4. Find "OAuth Redirect URL" field
5. **It should contain EXACTLY:**
   ```
   http://localhost:3000/auth/twitch/callback
   ```
6. **NOT:**
   - `localhost:3000/auth/twitch/callback` (missing `http://`)
   - `http://localhost:3000` (missing `/auth/twitch/callback`)
   - `https://localhost:3000/auth/twitch/callback` (wrong protocol)
   - `http://127.0.0.1:3000/auth/twitch/callback` (wrong host)

### ✅ Step 2: Verify in .env

File: `drops-crypto-api/.env` line 24

```dotenv
TWITCH_REDIRECT_URI=http://localhost:3000/auth/twitch/callback
```

Check:
- ✓ Protocol is `http://` (not `https://`)
- ✓ Host is `localhost` (not `127.0.0.1` or an IP)
- ✓ Port is `:3000` (not `:3001` or another port)
- ✓ Path is `/auth/twitch/callback` (exact spelling)
- ✓ No trailing slash

### ✅ Step 3: Test OAuth URL Generation

Run this command:
```bash
cd c:\Users\Admin\Music\drops\drops-crypto-api
node test-oauth-url.js
```

You should see the exact OAuth URL that will be used:
```
https://id.twitch.tv/oauth2/authorize?response_type=code&client_id=8z9i3mclo11j984ow4scz3gyg6wge&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Ftwitch%2Fcallback&scope=user%3Aread%3Aemail&state=...
```

Note: The redirect_uri is **URL-encoded** in the final URL:
- `http://` becomes `http%3A%2F%2F`
- `:` becomes `%3A`
- `/` becomes `%2F`

But when decoded, it matches exactly: `http://localhost:3000/auth/twitch/callback`

---

## OAuth Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Your App Backend (localhost:3000)                            │
│                                                               │
│ GET /auth/twitch/start                                      │
│   ↓                                                           │
│   Generate OAuth URL with:                                  │
│   - client_id from .env ✓                                  │
│   - redirect_uri from .env ✓                               │
│   - state (random, stored in DB)                            │
│   ↓                                                           │
│   Redirect to Twitch                                         │
└─────────────────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ Twitch OAuth Server (id.twitch.tv)                           │
│                                                               │
│ User logs in                                                 │
│ ↓                                                             │
│ Twitch validates:                                            │
│ - Is client_id registered? ✓                               │
│ - Is redirect_uri EXACTLY matching? ✓ (CRITICAL!)         │
│ - Does user have permissions? ✓                            │
│ ↓                                                             │
│ Redirect to:                                                 │
│ http://localhost:3000/auth/twitch/callback?code=...&state=...
└─────────────────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ Your App Backend (localhost:3000)                            │
│                                                               │
│ GET /auth/twitch/callback?code=XXX&state=YYY               │
│   ↓                                                           │
│   Validate state (must match what we stored)                │
│   ↓                                                           │
│   Exchange code for access_token (using client_secret)      │
│   ↓                                                           │
│   Get user info from Twitch API                             │
│   ↓                                                           │
│   Create/update user in database                            │
│   ↓                                                           │
│   Generate JWT token                                        │
│   ↓                                                           │
│   Redirect to app with token                                │
│   dropscrypto://auth?token=JWT...                           │
└─────────────────────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────────────────┐
│ Mobile App (Expo)                                            │
│                                                               │
│ Receives deep link: dropscrypto://auth?token=JWT...        │
│ ↓                                                             │
│ Stores JWT in secure storage                                │
│ ↓                                                             │
│ Navigates to main app                                       │
│ ✅ User authenticated!                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `invalid_redirect_uri` | Redirect URI doesn't match | **Verify exact match in Twitch Console vs .env** |
| `invalid_client` | Wrong Client ID/Secret pair | Re-generate Secret in Twitch Console and update .env |
| `redirect_uri_mismatch` | Typo in URI | Check for trailing slashes, http/https, port number |
| `temporarily_unavailable` | Twitch API down | Wait and retry later |

---

## Verification Checklist Before Testing

Run this command to auto-validate:
```bash
cd c:\Users\Admin\Music\drops\drops-crypto-api
node validate-setup.js
```

This checks:
- ✓ .env file exists and is readable
- ✓ All required env variables are set
- ✓ Port is 3000
- ✓ Redirect URI format is correct
- ✓ Backend is compiled (dist/src/main.js exists)
- ✓ Dependencies installed (node_modules exists)
- ✓ Prisma client generated

---

## Ready to Test?

Once verification passes:

### 1. Start Backend
```bash
node dist/src/main.js
```

### 2. Open OAuth Start in Browser
```
http://localhost:3000/auth/twitch/start
```

### 3. Sign In With Twitch
You should be redirected to Twitch login. After signing in, you'll be redirected back to:
```
http://localhost:3000/auth/twitch/callback?code=...&state=...
```

### 4. Get JWT Token
Check your browser's dev console or network tab for the redirect to:
```
dropscrypto://auth?token=eyJhbGciOi...
```

---

## If You Get `invalid_redirect_uri`

This ALWAYS means the redirect URI doesn't match. Check:

1. **In Twitch Console:** Copy the Redirect URL field value
2. **In .env:** Check line 24 value
3. **Compare character-by-character:**
   - Same protocol? `http://`
   - Same host? `localhost`
   - Same port? `:3000`
   - Same path? `/auth/twitch/callback`
   - No extra spaces or slashes?

If they don't match EXACTLY, update `.env` and restart backend.

---

**The golden rule: Redirect URI in code = Redirect URI in Twitch Console (byte-for-byte exact match)** ✅
