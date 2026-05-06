const http = require('http');
const fs   = require('fs');
const path = require('path');
const base = __dirname;
const mime = {
  'html': 'text/html; charset=utf-8',
  'css' : 'text/css; charset=utf-8',
  'js'  : 'application/javascript; charset=utf-8',
  'ico' : 'image/x-icon',
  'png' : 'image/png',
  'jpg' : 'image/jpeg',
  'svg' : 'image/svg+xml'
};
http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];
  if (urlPath === '/') urlPath = '/index.html';
  const fp  = path.join(base, urlPath);
  const ext = path.extname(fp).slice(1).toLowerCase();
  fs.readFile(fp, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': mime[ext] || 'text/plain', 'Access-Control-Allow-Origin': '*' });
    res.end(data);
  });
}).listen(8090, () => { console.log('Server: http://localhost:8090'); });
