/**
 * Local Development Server (Expert Mode)
 * Mimics Vercel Serverless Functions locally.
 * Run with: node dev.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');

// 1. Load .env manually (Robust parsing)
const envPath = path.join(__dirname, '.env');
const env = {};
if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split(/\r?\n/).forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join('=').trim(); // Handle '=' in values
            if (key) env[key] = value;
        }
    });
    console.log('✅ Loaded .env file');
    if (!env.GEMINI_API_KEY) {
        console.error('❌ Error: GEMINI_API_KEY not found in .env file!');
    }
} else {
    console.warn('⚠️ No .env file found. Create one with GEMINI_API_KEY=your_key');
}

const PORT = 3000;

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    // 2. Handle /api/chat (Backend Proxy)
    if (req.url === '/api/chat' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            const API_KEY = env.GEMINI_API_KEY;
            console.log(`💬 Incoming chat request...`);
            
            if (!API_KEY) {
                console.error('❌ Error: GEMINI_API_KEY is missing!');
                res.writeHead(500, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'GEMINI_API_KEY is missing in your .env file.' }));
            }

            // Safe debugging: show only start/end of key
            console.log(`🔑 Using Key Start: ${API_KEY.substring(0, 7)}...${API_KEY.substring(API_KEY.length - 4)}`);

            const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

            const proxyReq = https.request(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            }, proxyRes => {
                console.log(`🤖 Google API StatusCode: ${proxyRes.statusCode}`);
                
                let responseBody = '';
                proxyRes.on('data', d => responseBody += d);
                proxyRes.on('end', () => {
                    if (proxyRes.statusCode !== 200) {
                        console.error(`❌ Google API Error Response: ${responseBody}`);
                    }
                    res.writeHead(proxyRes.statusCode, { 'Content-Type': 'application/json' });
                    res.end(responseBody);
                });
            });

            proxyReq.on('error', e => {
                console.error(`❌ Proxy request failed: ${e.message}`);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Proxy request failed: ' + e.message }));
            });

            proxyReq.write(body);
            proxyReq.end();
        });
        return;
    }

    // 3. Handle Static Files
    let relativePath = req.url === '/' ? 'index.html' : req.url;
    let filePath = path.join(__dirname, relativePath);
    const ext = path.extname(filePath);
    let contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404);
                res.end('File not found: ' + relativePath);
            } else {
                res.writeHead(500);
                res.end('Server error: ' + error.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`
🚀 EXPERT LOCAL SERVER STARTED
-----------------------------
- URL: http://localhost:${PORT}
- Environment: Local Development
- Target: Gemini 1.5 Flash

👉 Open your browser to http://localhost:3000 to test.
    `);
});
