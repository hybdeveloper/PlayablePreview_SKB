// Local dev server. The manifest is regenerated on every request, so new games
// show up after a browser refresh. Listens on all interfaces so a phone on the
// same Wi-Fi can open the QR code link.
// Usage: node scripts/serve.js [port]          live from site/ + games/ (no passwords)
//        node scripts/serve.js --dist [port]   serve the built dist/ (test a protected build)
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { buildManifest } = require('./manifest');

const ROOT = path.resolve(__dirname, '..');
const DIST = process.argv.includes('--dist') ? path.join(ROOT, 'dist') : null;
const SITE = DIST || path.join(ROOT, 'site');
const GAMES = DIST ? path.join(DIST, 'games') : path.join(ROOT, 'games');
const PORT = Number(process.argv.slice(2).find(a => /^\d+$/.test(a)) || process.env.PORT || 5173);

const MIME = {
  '.html': 'text/html; charset=utf-8', '.htm': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.gif': 'image/gif', '.webp': 'image/webp', '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.wav': 'audio/wav', '.m4a': 'audio/mp4',
  '.mp4': 'video/mp4', '.webm': 'video/webm',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf',
  '.wasm': 'application/wasm', '.atlas': 'text/plain; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
};

function send(res, status, body, type = 'text/plain; charset=utf-8') {
  res.writeHead(status, { 'content-type': type, 'cache-control': 'no-store' });
  res.end(body);
}

http.createServer((req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); } catch { return send(res, 400, 'Bad request'); }

  if (pathname === '/manifest.json' && !DIST) {
    return send(res, 200, JSON.stringify(buildManifest(GAMES)), MIME['.json']);
  }

  const [base, rel] = pathname.startsWith('/games/') ? [GAMES, pathname.slice(7)] : [SITE, pathname];
  let file = path.join(base, rel);
  if (!file.startsWith(base)) return send(res, 403, 'Forbidden');

  fs.stat(file, (err, st) => {
    if (!err && st.isDirectory()) { file = path.join(file, 'index.html'); st = fs.existsSync(file) && fs.statSync(file); }
    if (err || !st) return send(res, 404, 'Not found');
    res.writeHead(200, {
      'content-type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'content-length': st.size,
      'cache-control': 'no-store',
    });
    fs.createReadStream(file).pipe(res);
  });
}).listen(PORT, '0.0.0.0', () => {
  console.log(`Playable Preview running:\n  http://localhost:${PORT}`);
  for (const addrs of Object.values(os.networkInterfaces())) {
    for (const a of addrs || []) if (a.family === 'IPv4' && !a.internal) console.log(`  http://${a.address}:${PORT}  (LAN / phone)`);
  }
});
