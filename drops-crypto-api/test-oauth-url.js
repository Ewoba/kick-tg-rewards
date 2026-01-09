#!/usr/bin/env node
/**
 * OAuth URL Generator Test
 * Shows the exact OAuth URL that will be used for Twitch login
 */

require('dotenv').config();

const clientId = process.env.TWITCH_CLIENT_ID;
const redirectUri = process.env.TWITCH_REDIRECT_URI;
const scope = encodeURIComponent('user:read:email');

console.log('=== Twitch OAuth URL Verification ===\n');

console.log('Configuration from .env:');
console.log('  Client ID:', clientId);
console.log('  Redirect URI:', redirectUri);
console.log('  Scope:', 'user:read:email');
console.log();

if (!clientId) {
  console.error('❌ ERROR: TWITCH_CLIENT_ID not set in .env');
  process.exit(1);
}

if (!redirectUri) {
  console.error('❌ ERROR: TWITCH_REDIRECT_URI not set in .env');
  process.exit(1);
}

// Generate a test state (in real app, this is random)
const testState = 'test_state_for_verification_' + Date.now();

const oauthUrl = 
  `https://id.twitch.tv/oauth2/authorize` +
  `?response_type=code` +
  `&client_id=${encodeURIComponent(clientId)}` +
  `&redirect_uri=${encodeURIComponent(redirectUri)}` +
  `&scope=${scope}` +
  `&state=${encodeURIComponent(testState)}`;

console.log('✅ Generated OAuth URL:');
console.log(oauthUrl);
console.log();

console.log('To test this flow:');
console.log('1. Copy the URL above');
console.log('2. Open it in your browser');
console.log('3. Sign in with Twitch');
console.log('4. You should be redirected to:', redirectUri);
console.log();

console.log('Verification Checklist:');
console.log(`  ✓ Client ID looks valid: ${clientId.length > 10 ? 'YES' : 'NO'}`);
console.log(`  ✓ Redirect URI starts with http://: ${redirectUri.startsWith('http://') ? 'YES' : 'NO'}`);
console.log(`  ✓ Redirect URI includes /auth/twitch/callback: ${redirectUri.includes('/auth/twitch/callback') ? 'YES' : 'NO'}`);
console.log(`  ✓ Port is 3000: ${redirectUri.includes(':3000') ? 'YES' : 'NO'}`);
console.log();

console.log('=== IMPORTANT ===');
console.log('Verify in Twitch Developer Console:');
console.log(`1. Exact redirect URL matches: "${redirectUri}"`);
console.log('2. If not, update it in console and try again');
console.log('3. Do NOT include any query parameters in console');
console.log('=================');
