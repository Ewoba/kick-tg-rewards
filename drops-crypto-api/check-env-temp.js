require('dotenv').config();
const result = {
  TWITCH_CLIENT_ID: process.env.TWITCH_CLIENT_ID || 'NOT SET',
  TWITCH_CLIENT_SECRET: process.env.TWITCH_CLIENT_SECRET || 'NOT SET',
  hasPlaceholder: (process.env.TWITCH_CLIENT_ID || '').includes('your_twitch_client_id_here')
};
console.log(JSON.stringify(result));
