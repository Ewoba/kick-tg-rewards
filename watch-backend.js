const fs = require('fs');
const path = require('path');
const logPath = path.resolve(__dirname, 'drops-crypto-api', 'backend.log');

console.log('Watching', logPath);

if (!fs.existsSync(logPath)) {
  console.log('Log file does not exist yet. Waiting for file to be created...');
}

let lastSize = 0;

function check() {
  fs.stat(logPath, (err, stat) => {
    if (err) return setTimeout(check, 1000);
    if (stat.size > lastSize) {
      const stream = fs.createReadStream(logPath, { start: lastSize, end: stat.size });
      stream.on('data', chunk => {
        const text = chunk.toString();
        process.stdout.write(text);
        if (/invalid client/i.test(text)) {
          console.log('\n===== DETECTED invalid client in backend log =====');
        }
        if (/ERROR|Exception|Traceback/i.test(text)) {
          console.log('\n===== ERROR FOUND in backend log =====');
        }
      });
      stream.on('end', () => {
        lastSize = stat.size;
        setTimeout(check, 500);
      });
    } else {
      setTimeout(check, 1000);
    }
  });
}

check();
