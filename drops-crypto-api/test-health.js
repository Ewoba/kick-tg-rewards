const http = require('http');

http.get('http://localhost:3000/health', (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Body:', data);
  });
}).on('error', (e) => {
  console.log('Error:', e.message);
});
