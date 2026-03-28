const http = require('http');

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/refresh',
    method: 'POST',
    headers: {
        'Cookie': 'refresh_token=fake-token',
        'Content-Type': 'application/json'
    }
};

const req = http.request(options, res => {
    let data = '';
    res.on('data', chunk => { data += chunk; });
    res.on('end', () => {
        console.log(`Status Options: ${res.statusCode}`);
        console.log(`Body: ${data}`);
    });
});
req.end();
