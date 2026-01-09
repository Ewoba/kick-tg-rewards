const { spawn } = require('child_process');
const path = require('path');

const appDir = 'c:\\Users\\Admin\\Music\\drops\\drops-crypto-app';

console.log('Starting Expo development server...');
console.log('Working directory:', appDir);
console.log('');
console.log('Press Ctrl+C to stop the server');
console.log('Press "a" in terminal to launch Android emulator');
console.log('');

const expo = spawn('npx', ['expo', 'start', '-c'], {
  cwd: appDir,
  stdio: 'inherit',
  shell: true
});

expo.on('error', (error) => {
  console.error('Failed to start Expo:', error.message);
  process.exit(1);
});

expo.on('exit', (code) => {
  console.log('Expo server stopped with exit code:', code);
});
