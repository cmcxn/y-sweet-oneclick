const http = require('http');
const url = require('url');

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  const parsedUrl = url.parse(req.url, true);
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  
  if (parsedUrl.pathname === '/doc/new') {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({
      docId: parsedUrl.query.z || 'mock-doc-' + Date.now(),
      url: 'ws://localhost:8080/doc/mock',
      token: 'mock-token-' + Date.now()
    }));
  } else if (parsedUrl.pathname.startsWith('/doc/')) {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({status: 'ok', message: 'Mock Y-Sweet endpoint'}));
  } else {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({
      message: 'Mock Y-Sweet server - network restricted environment', 
      url: req.url,
      status: 'running'
    }));
  }
});

server.listen(8080, '0.0.0.0', () => {
  console.log('Mock Y-Sweet server listening on port 8080');
  console.log('Available endpoints:');
  console.log('  GET  / - Health check');
  console.log('  POST /doc/new - Create new document');
  console.log('  *    /doc/* - Document operations');
});