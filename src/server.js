const express = require('express');
const path = require('path');
const httpProxy = require('http-proxy');
const morgan = require('morgan');

console.log('Booting server');

const apiUrl = process.env['API_URL'] || 'http://localhost:3000/api/v1';

const apiProxy = new httpProxy.createProxyServer({
    target: apiUrl,
    changeOrigin: true
}).on('error', function (err) {
    console.error(err);
});

const app = express();
app.use(morgan('combined'));

app.use('/api', function (req, res) {
    console.log('API =>');
    apiProxy.web(req, res)
});

app.use(express.static(path.resolve('./public')));

app.get('*', function (req, res) {
    res.sendFile(path.resolve('./public/index.html'))
});

app.use(function (err, req, res, next) {
    console.log(err);
    res.writeHead(500, {'Content-Type': 'application/json'});
    res.write(JSON.stringify({success: false, message: 'Server internal error'}));
    res.end();
});

app.listen(8080, function () {
    console.log('* Listening on tcp://localhost:8080');
    console.log('* API: ' + apiUrl);
});
