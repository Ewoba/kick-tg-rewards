#!/usr/bin/env node
/**
 * Twitch Credentials Diagnostic
 * Tests if the new secret is valid
 */

require('dotenv').config();
const https = require('https');
const qs = require('querystring');

const clientId = process.env.TWITCH_CLIENT_ID;
const clientSecret = process.env.TWITCH_CLIENT_SECRET;

console.log('\n╔════════════════════════════════════════════════════════╗');
console.log('║          TWITCH CREDENTIALS DIAGNOSTIC                 ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

console.log('Configuration loaded:');
console.log(`  Client ID:     ${clientId}`);
console.log(`  Client Secret: ${clientSecret}`);
console.log(`  Redirect URI:  ${process.env.TWITCH_REDIRECT_URI}`);
console.log();

if (!clientId || !clientSecret) {
  console.error('❌ ERROR: Missing credentials in .env');
  process.exit(1);
}

console.log('Testing with Twitch API...\n');

const data = qs.stringify({
  client_id: clientId,
  client_secret: clientSecret,
  grant_type: 'client_credentials'
});

const req = https.request({
  hostname: 'id.twitch.tv',
  path: '/oauth2/token',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(data)
  }
}, res => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    console.log(`HTTP Status: ${res.statusCode}`);
    console.log();

    try {
      const json = JSON.parse(body);
      
      if (res.statusCode === 200) {
        console.log('✅ SUCCESS!');
        console.log('   Credentials are valid.');
        console.log(`   Access Token: ${json.access_token.substring(0, 20)}...`);
        console.log(`   Token Type: ${json.token_type}`);
        console.log(`   Expires In: ${json.expires_in}s`);
      } else if (json.message) {
        console.log(`❌ ERROR: ${json.message}`);
        console.log();
        console.log('Possible causes:');
        console.log('  1. Client ID and Secret don\'t match');
        console.log('  2. Secret was regenerated but old one is in .env');
        console.log('  3. Using credentials from wrong application');
        console.log();
        console.log('Solution:');
        console.log('  1. Go to Twitch Developer Console');
        console.log('  2. Click your application (drops krypt)');
        console.log('  3. Copy the Client ID from the console');
        console.log('  4. Click "New Secret" to generate a fresh secret');
        console.log('  5. Copy the NEW secret to .env line 23');
        console.log('  6. Verify Redirect URL is: http://localhost:3000/auth/twitch/callback');
      } else {
        console.log('Response:', json);
      }
    } catch (e) {
      console.log('Response:', body);
    }

    process.exit(res.statusCode === 200 ? 0 : 1);
  });
});

req.on('error', err => {
  console.error('❌ Network Error:', err.message);
  process.exit(1);
});

req.write(data);
req.end();
