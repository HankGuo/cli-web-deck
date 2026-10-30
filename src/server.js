const http = require('http');
const net = require('net');
const fs = require('fs');
const path = require('path');
const url = require('url');

class WebDeckServer {
  constructor(options = {}) {
    this.port = options.port || 8080;
    this.host = options.host || '0.0.0.0';
    this.workspace = options.workspace || process.cwd();
    this.command = options.command || 'bash';
    this.title = options.title || 'CLI Web Deck';
    this.sessionManager = options.sessionManager;
    this.internalPort = options.sessionManager.internalPort;
    this.auth = options.auth || null; // 'user:pass' if specified
  }

  start() {
    const server = http.createServer((req, res) => {
      this.handleHttpRequest(req, res);
    });

    // Handle WebSocket upgrade for ttyd
    server.on('upgrade', (req, clientSocket, head) => {
      this.handleWsUpgrade(req, clientSocket, head);
    });

    server.listen(this.port, this.host, () => {
      console.log(`\n======================================================`);
      console.log(`  🚀 ${this.title} is running!`);
      console.log(`  - Web Console:   http://${this.host === '0.0.0.0' ? '127.0.0.1' : this.host}:${this.port}`);
      console.log(`  - Target CLI:    ${this.command}`);
      console.log(`  - Workspace:     ${this.workspace}`);
      if (this.auth) {
        console.log(`  - Auth:          Basic Auth enabled`);
      }
      console.log(`======================================================\n`);
    });

    return server;
  }

  checkAuth(req, res) {
    if (!this.auth) return true;
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      res.writeHead(401, {
        'WWW-Authenticate': 'Basic realm="CLI Web Deck Protected Area"',
        'Content-Type': 'text/plain; charset=utf-8'
      });
      res.end('Authentication required.');
      return false;
    }
    const token = authHeader.split(' ')[1] || '';
    const credentials = Buffer.from(token, 'base64').toString('utf8');
    if (credentials !== this.auth) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Access denied: Invalid credentials.');
      return false;
    }
    return true;
  }

  handleHttpRequest(req, res) {
    if (!this.checkAuth(req, res)) return;

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // 1. Static Web Deck UI
    if (pathname === '/' || pathname === '/index.html') {
      return this.serveFile(path.join(__dirname, 'public/index.html'), 'text/html; charset=utf-8', res);
    }
    if (pathname === '/style.css') {
      return this.serveFile(path.join(__dirname, 'public/style.css'), 'text/css; charset=utf-8', res);
    }
    if (pathname === '/client.js') {
      return this.serveFile(path.join(__dirname, 'public/client.js'), 'application/javascript; charset=utf-8', res);
    }

    // 2. API Endpoints
    if (pathname === '/api/status' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({
        status: 'online',
        title: this.title,
        command: this.command,
        workspace: this.workspace,
        sessionName: this.sessionManager.sessionName
      }));
    }

    if (pathname === '/api/files' && req.method === 'GET') {
      return this.handleListFiles(req, res);
    }

    if (pathname.startsWith('/api/files/') && req.method === 'GET') {
      const fileName = decodeURIComponent(pathname.replace('/api/files/', ''));
      const filePath = path.join(this.workspace, path.basename(fileName));
      if (!fs.existsSync(filePath)) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        return res.end('File not found');
      }
      return this.serveFile(filePath, 'application/octet-stream', res, true);
    }

    if (pathname === '/api/upload' && req.method === 'POST') {
      return this.handleFileUpload(req, res);
    }

    if (pathname === '/api/session/reset' && req.method === 'POST') {
      try {
        this.sessionManager.resetSession();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: true, message: 'Session reset successfully' }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: err.message }));
      }
    }

    // 3. Proxy all /terminal/* or root ttyd assets to local ttyd
    if (pathname.startsWith('/terminal') || pathname === '/ws' || pathname.startsWith('/token')) {
      return this.proxyHttp(req, res);
    }

    // Fallback: proxy to ttyd directly
    this.proxyHttp(req, res);
  }

  handleListFiles(req, res) {
    try {
      if (!fs.existsSync(this.workspace)) {
        fs.mkdirSync(this.workspace, { recursive: true });
      }
      const entries = fs.readdirSync(this.workspace, { withFileTypes: true });
      const files = entries
        .filter(e => !e.name.startsWith('.'))
        .map(e => {
          const fullPath = path.join(this.workspace, e.name);
          let size = 0;
          let mtime = new Date();
          try {
            const stats = fs.statSync(fullPath);
            size = stats.size;
            mtime = stats.mtime;
          } catch {}
          return {
            name: e.name,
            isDirectory: e.isDirectory(),
            size,
            mtime
          };
        })
        .sort((a, b) => b.mtime - a.mtime);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, files }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
  }

  handleFileUpload(req, res) {
    const rawFilename = req.headers['x-filename'];
    if (rawFilename) {
      // Direct binary stream mode
      const fileName = path.basename(decodeURIComponent(rawFilename));
      const targetPath = path.join(this.workspace, fileName);
      const writeStream = fs.createWriteStream(targetPath);

      req.pipe(writeStream);
      writeStream.on('finish', () => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, filename: fileName, path: targetPath }));
      });
      writeStream.on('error', (err) => {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      });
      return;
    }

    // Multipart/form-data basic handler
    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('multipart/form-data')) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Expected multipart/form-data or x-filename header' }));
    }

    const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
    if (!boundaryMatch) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: false, error: 'Missing boundary' }));
    }
    const boundary = boundaryMatch[1] || boundaryMatch[2];

    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      const buffer = Buffer.concat(chunks);
      const parts = this.parseMultipart(buffer, boundary);
      const savedFiles = [];

      for (const part of parts) {
        if (part.filename) {
          const safeName = path.basename(part.filename);
          const target = path.join(this.workspace, safeName);
          fs.writeFileSync(target, part.data);
          savedFiles.push(safeName);
        }
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, files: savedFiles }));
    });
  }

  parseMultipart(buffer, boundary) {
    const parts = [];
    const boundaryBuffer = Buffer.from('--' + boundary);
    let start = buffer.indexOf(boundaryBuffer);

    while (start !== -1) {
      const next = buffer.indexOf(boundaryBuffer, start + boundaryBuffer.length);
      if (next === -1) break;

      const partBuffer = buffer.slice(start + boundaryBuffer.length, next);
      const headerEnd = partBuffer.indexOf('\r\n\r\n');
      if (headerEnd !== -1) {
        const headerStr = partBuffer.slice(0, headerEnd).toString('utf8');
        let data = partBuffer.slice(headerEnd + 4);
        if (data.slice(data.length - 2).toString() === '\r\n') {
          data = data.slice(0, data.length - 2);
        }

        const fnMatch = headerStr.match(/filename="([^"]+)"/);
        const nameMatch = headerStr.match(/name="([^"]+)"/);
        parts.push({
          name: nameMatch ? nameMatch[1] : null,
          filename: fnMatch ? fnMatch[1] : null,
          data
        });
      }
      start = next;
    }
    return parts;
  }

  serveFile(filePath, contentType, res, isDownload = false) {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        return res.end('Not Found');
      }
      const headers = { 'Content-Type': contentType };
      if (isDownload) {
        headers['Content-Disposition'] = `attachment; filename="${path.basename(filePath)}"`;
      }
      res.writeHead(200, headers);
      res.end(data);
    });
  }

  proxyHttp(req, res) {
    const options = {
      hostname: '127.0.0.1',
      port: this.internalPort,
      path: req.url,
      method: req.method,
      headers: { ...req.headers, host: `127.0.0.1:${this.internalPort}` }
    };

    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      res.writeHead(502, { 'Content-Type': 'text/plain' });
      res.end('Gateway Error: TTYD backend not ready. (' + err.message + ')');
    });

    req.pipe(proxyReq);
  }

  handleWsUpgrade(req, clientSocket, head) {
    if (!this.checkAuth(req, clientSocket)) {
      clientSocket.destroy();
      return;
    }

    const serverSocket = net.connect(this.internalPort, '127.0.0.1', () => {
      let rawReq = `${req.method} ${req.url} HTTP/1.1\r\n`;
      for (let i = 0; i < req.rawHeaders.length; i += 2) {
        const key = req.rawHeaders[i];
        const val = req.rawHeaders[i + 1];
        if (key.toLowerCase() === 'host') {
          rawReq += `Host: 127.0.0.1:${this.internalPort}\r\n`;
        } else {
          rawReq += `${key}: ${val}\r\n`;
        }
      }
      rawReq += '\r\n';

      serverSocket.write(rawReq);
      if (head && head.length > 0) {
        serverSocket.write(head);
      }

      clientSocket.pipe(serverSocket);
      serverSocket.pipe(clientSocket);
    });

    serverSocket.on('error', (err) => {
      clientSocket.destroy();
    });
    clientSocket.on('error', () => {
      serverSocket.destroy();
    });
  }
}

module.exports = WebDeckServer;
