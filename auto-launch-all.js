#!/usr/bin/env node

const { spawn, spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const projectRoot = 'c:\\Users\\Admin\\Music\\drops';
const backendDir = path.join(projectRoot, 'drops-crypto-api');
const appDir = path.join(projectRoot, 'drops-crypto-app');

console.clear();
console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║                                                                ║');
console.log('║     🚀 DROPS CRYPTO - ПОЛНЫЙ АВТОЗАПУСК                       ║');
console.log('║                                                                ║');
console.log('║     Backend + Mobile App + Twitch OAuth                       ║');
console.log('║                                                                ║');
console.log('╚════════════════════════════════════════════════════════════════╝');
console.log('');

// Step 1: Check Node.js
console.log('[1/5] Проверка Node.js...');
const nodeCheck = spawnSync('node', ['-v'], { stdio: 'pipe' });
if (nodeCheck.error) {
  console.error('❌ Node.js не найден!');
  process.exit(1);
}
console.log('✅ Node.js найден:', nodeCheck.stdout.toString().trim());
console.log('');

// Step 2: Check npm
console.log('[2/5] Проверка npm...');
const npmCheck = spawnSync('npm', ['-v'], { stdio: 'pipe' });
if (npmCheck.error) {
  console.error('❌ npm не найден!');
  process.exit(1);
}
console.log('✅ npm найден:', npmCheck.stdout.toString().trim());
console.log('');

// Step 3: Build backend if needed
console.log('[3/5] Проверка компиляции бэкенда...');
const mainJsPath = path.join(backendDir, 'dist', 'src', 'main.js');
if (!fs.existsSync(mainJsPath)) {
  console.log('⚠️  Бэкенд не скомпилирован. Компилирую...');
  const buildProcess = spawnSync('npm', ['run', 'build'], {
    cwd: backendDir,
    stdio: 'inherit'
  });
  if (buildProcess.error || buildProcess.status !== 0) {
    console.error('❌ Ошибка компиляции!');
    process.exit(1);
  }
}
console.log('✅ Бэкенд скомпилирован');
console.log('');

// Step 4: Verify files exist
console.log('[4/5] Проверка файлов...');
if (!fs.existsSync(mainJsPath)) {
  console.error('❌ dist\\src\\main.js не найден!');
  process.exit(1);
}
if (!fs.existsSync(path.join(appDir, 'package.json'))) {
  console.error('❌ Мобильное приложение не найдено!');
  process.exit(1);
}
console.log('✅ Все файлы на месте');
console.log('');

// Step 5: Start both processes
console.log('[5/5] Запуск приложений...');
console.log('');
console.log('📋 ИНСТРУКЦИИ:');
console.log('   1. Откроются ДВА окна (Backend и Expo)');
console.log('   2. В окне Expo дождись загрузки');
console.log('   3. Нажми: a  (для Android эмулятора)');
console.log('   4. Приложение загрузится (2-3 минуты)');
console.log('   5. Кликни "Sign In with Twitch"');
console.log('   6. Введи: tiktak6828');
console.log('');
console.log('⏳ Запуск через 3 секунды...');
console.log('');

setTimeout(() => {
  // Start Backend in new window
  console.log('🔥 Запускаю Backend на порт 3000...');
  const backendTitle = 'BACKEND - Port 3000';
  const backendCmd = process.platform === 'win32' 
    ? `cd /d "${backendDir}" && node dist\\src\\main.js`
    : `cd "${backendDir}" && node dist/src/main.js`;
  
  const backend = spawn('cmd', ['/c', `title ${backendTitle} && ${backendCmd}`], {
    detached: true,
    stdio: 'ignore',
    shell: true
  });
  backend.unref();

  // Wait 4 seconds for backend to initialize
  setTimeout(() => {
    // Start Expo in new window
    console.log('📱 Запускаю Expo...');
    const expoTitle = 'EXPO - Mobile App';
    const expoCmd = process.platform === 'win32'
      ? `cd /d "${appDir}" && npx expo start -c`
      : `cd "${appDir}" && npx expo start -c`;
    
    const expo = spawn('cmd', ['/c', `title ${expoTitle} && ${expoCmd}`], {
      detached: true,
      stdio: 'ignore',
      shell: true
    });
    expo.unref();

    console.log('✅ Оба окна запущены!');
    console.log('');
    console.log('🎉 Система готова!');
    console.log('');
    console.log('Смотри открытые окна, там будут все логи.');
    process.exit(0);
  }, 4000);
}, 3000);
