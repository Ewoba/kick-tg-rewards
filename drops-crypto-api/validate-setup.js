#!/usr/bin/env node
/**
 * Complete Setup Validator
 * Checks all configuration before starting the app
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

console.log('\n╔════════════════════════════════════════════════════════╗');
console.log('║     DROPS CRYPTO - COMPLETE SETUP VALIDATOR            ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

let errors = [];
let warnings = [];
let success = [];

// 1. Check .env file
console.log('Checking .env configuration...');
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  errors.push('.env file not found');
} else {
  success.push('.env file exists');
}

// 2. Check required env variables
const required = ['PORT', 'TWITCH_CLIENT_ID', 'TWITCH_CLIENT_SECRET', 'TWITCH_REDIRECT_URI', 'JWT_SECRET'];
required.forEach(key => {
  if (!process.env[key]) {
    errors.push(`Missing required env variable: ${key}`);
  } else {
    if (key === 'TWITCH_CLIENT_SECRET' || key === 'JWT_SECRET') {
      success.push(`${key}: ✓ (hidden)`);
    } else {
      success.push(`${key}: ${process.env[key]}`);
    }
  }
});

// 3. Check Port
console.log('\nValidating port configuration...');
const port = process.env.PORT;
if (port !== '3000') {
  warnings.push(`Port is ${port}, expected 3000`);
} else {
  success.push(`Port configured correctly: 3000`);
}

// 4. Check Redirect URI
console.log('Validating Twitch OAuth configuration...');
const redirectUri = process.env.TWITCH_REDIRECT_URI;
const expectedRedirectUri = 'http://localhost:3000/auth/twitch/callback';

if (redirectUri !== expectedRedirectUri) {
  errors.push(`Redirect URI mismatch!\n  Expected: ${expectedRedirectUri}\n  Got: ${redirectUri}`);
} else {
  success.push(`Redirect URI is correct: ${redirectUri}`);
}

// 5. Check Client ID format
const clientId = process.env.TWITCH_CLIENT_ID;
if (clientId.length < 10) {
  errors.push('Client ID seems too short (should be ~30 chars)');
} else if (clientId.includes('ВАШ_') || clientId.includes('placeholder') || clientId.includes('your_')) {
  errors.push('Client ID still contains placeholder text');
} else {
  success.push(`Client ID format looks valid (${clientId.length} chars)`);
}

// 6. Check dist folder (compiled backend)
console.log('Checking compiled backend...');
const mainPath = path.join(__dirname, 'dist', 'src', 'main.js');
if (!fs.existsSync(mainPath)) {
  warnings.push('dist/src/main.js not found - you need to run: npm run build');
} else {
  success.push('Backend compiled: dist/src/main.js exists');
}

// 7. Check node_modules
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  errors.push('node_modules not found - run: npm install');
} else {
  success.push('Dependencies installed: node_modules exists');
}

// 8. Check Prisma client
const prismaClientPath = path.join(__dirname, 'node_modules', '@prisma', 'client');
if (!fs.existsSync(prismaClientPath)) {
  warnings.push('Prisma client not generated - run: npx prisma generate');
} else {
  success.push('Prisma client generated');
}

// Print results
console.log('\n╔════════════════════════════════════════════════════════╗');
console.log('║                   VALIDATION RESULTS                   ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

if (success.length > 0) {
  console.log('✅ SUCCESS:');
  success.forEach(msg => console.log(`   ${msg}`));
  console.log();
}

if (warnings.length > 0) {
  console.log('⚠️  WARNINGS:');
  warnings.forEach(msg => console.log(`   ${msg}`));
  console.log();
}

if (errors.length > 0) {
  console.log('❌ ERRORS:');
  errors.forEach(msg => console.log(`   ${msg}`));
  console.log();
  console.log('Fix the errors above before starting the backend.\n');
  process.exit(1);
}

console.log('╔════════════════════════════════════════════════════════╗');
console.log('║                  ALL CHECKS PASSED! ✅                 ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

console.log('Next steps:');
console.log('1. Start backend:');
console.log('   node dist/src/main.js\n');
console.log('2. Test health endpoint:');
console.log('   curl http://localhost:3000/health\n');
console.log('3. Start OAuth flow:');
console.log('   Open in browser: http://localhost:3000/auth/twitch/start\n');
console.log('4. Start mobile app (new terminal):');
console.log('   cd ../drops-crypto-app');
console.log('   npx expo start -c\n');
