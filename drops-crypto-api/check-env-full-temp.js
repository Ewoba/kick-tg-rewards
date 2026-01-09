require('dotenv').config();
const result = {
  TWITCH_REDIRECT_URI: process.env.TWITCH_REDIRECT_URI || 'NOT SET',
  PUBLIC_BASE_URL: process.env.PUBLIC_BASE_URL || 'NOT SET',
  JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET'
};
console.log(JSON.stringify(result));
