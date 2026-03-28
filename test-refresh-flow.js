const http = require('http');

const data = JSON.stringify({
  email: 'admin@etherealtechno.com',
  password: 'Password123!'
});

const req1 = http.request({
  hostname: 'localhost', port: 3000, path: '/api/auth/signin', method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
}, res1 => {
  const cookie = res1.headers['set-cookie'] ? res1.headers['set-cookie'][0].split(';')[0] : '';
  console.log('Login cookie:', cookie);

  const req2 = http.request({
    hostname: 'localhost', port: 3000, path: '/api/auth/refresh', method: 'POST',
    headers: { 'Cookie': cookie, 'Content-Type': 'application/json' }
  }, res2 => {
    let body = '';
    res2.on('data', c => { body += c; });
    res2.on('end', () => {
      console.log('Refresh 1 status:', res2.statusCode, body);
      console.log('Refresh 1 Set-Cookie:', res2.headers['set-cookie']);

      // Attempt second refresh with same original cookie (to simulate race condition / lost cookie)
      const req3 = http.request({
        hostname: 'localhost', port: 3000, path: '/api/auth/refresh', method: 'POST',
        headers: { 'Cookie': cookie, 'Content-Type': 'application/json' }
      }, res3 => {
        let body3 = '';
        res3.on('data', c => { body3 += c; });
        res3.on('end', () => {
          console.log('Refresh 2 (same cookie) status:', res3.statusCode, body3);
        });
      });
      req3.end();
    });
  });
  req2.end();
});
req1.write(data);
req1.end();
