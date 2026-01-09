require('dotenv').config();
const https = require('https');
const qs = require('querystring');

const data = qs.stringify({
  client_id: process.env.TWITCH_CLIENT_ID,
  client_secret: process.env.TWITCH_CLIENT_SECRET,
  grant_type: 'client_credentials'
});

console.log('Testing Twitch token endpoint...');
console.log('Client ID:', process.env.TWITCH_CLIENT_ID ? '✓ loaded' : '✗ missing');
console.log('Client Secret:', process.env.TWITCH_CLIENT_SECRET ? '✓ loaded' : '✗ missing');

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
    console.log('\nResponse HTTP', res.statusCode);
    try {
      const j = JSON.parse(body);
      if (j.message) {
        console.log('❌ ERROR:', j.message);
      } else if (j.access_token) {
        console.log('✅ SUCCESS: Got access token');
      } else {
        console.log('Response:', j);
      }
    } catch (e) {
      console.log('Response body:', body);
    }
    process.exit(0);
  });
});

req.on('error', err => {
  console.error('Request error:', err.message);
  process.exit(1);
});

req.write(data);
req.end();
