#!/usr/bin/env node

// Direct Node.js startup script - bypasses terminal input issues
const { spawn } = require('child_process');
const path = require('path');

const backendPath = path.join(process.env.USERPROFILE, 'Music', 'drops', 'drops-crypto-api');

console.log('[Backend Launcher] Starting server...');
console.log('[Backend Launcher] Working directory:', backendPath);
console.log('[Backend Launcher] Node version:', process.version);
console.log('[Backend Launcher] Starting node process...');
console.log('');

const child = spawn('node', ['dist/src/main.js'], {
  cwd: backendPath,
  stdio: 'inherit',
  shell: true,
  windowsHide: false
});

child.on('error', (err) => {
  console.error('[Backend Launcher] Failed to start:', err);
  process.exit(1);
});

child.on('exit', (code, signal) => {
  console.log(`[Backend Launcher] Process exited with code ${code} and signal ${signal}`);
  process.exit(code);
});
