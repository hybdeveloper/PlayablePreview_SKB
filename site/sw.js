/* Service worker for password-protected builds: serves games/<path> by
 * decrypting g/<id>.bin with the viewer's folder keys, so multi-file games
 * (scripts, images, audio) work unchanged. In open builds it passes through. */
importScripts('assets/shared.js');

const BASE = self.registration.scope;
const GAMES_PATH = new URL('games/', BASE).pathname;
PPShared.init(BASE);

const MIME = {
  html: 'text/html; charset=utf-8', htm: 'text/html; charset=utf-8', js: 'text/javascript; charset=utf-8',
  mjs: 'text/javascript; charset=utf-8', css: 'text/css; charset=utf-8', json: 'application/json; charset=utf-8',
  svg: 'image/svg+xml', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp',
  ico: 'image/x-icon', mp3: 'audio/mpeg', ogg: 'audio/ogg', wav: 'audio/wav', m4a: 'audio/mp4', mp4: 'video/mp4',
  webm: 'video/webm', woff: 'font/woff', woff2: 'font/woff2', ttf: 'font/ttf', otf: 'font/otf', wasm: 'application/wasm',
  txt: 'text/plain; charset=utf-8', atlas: 'text/plain; charset=utf-8',
};
const mime = p => MIME[(p.split('.').pop() || '').toLowerCase()] || 'application/octet-stream';
const isHtml = p => /\.html?$/i.test(p);

let session = null;
const getSession = () => session || (session = PPShared.loadSession().catch(() => (session = null, { open: true })));

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('message', e => {
  const t = e.data && e.data.type;
  if (t === 'refresh') session = null;
  if (t === 'claim') e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin || !url.pathname.startsWith(GAMES_PATH)) return;
  e.respondWith(serve(url, e.request));
});

function page(status, title, text) {
  text = text.replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);
  return new Response(
    `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title>` +
    `<body style="margin:0;height:100vh;display:grid;place-items:center;font:15px system-ui;background:#111318;color:#e7e9ee;text-align:center">` +
    `<div><h2 style="margin:0 0 8px">${title}</h2><p style="color:#8b919e">${text}</p><a style="color:#8ab4ff" href="${BASE}">Open Playable Preview</a></div>`,
    { status, headers: { 'content-type': MIME.html } });
}

async function serve(url, request) {
  const s = await getSession();
  if (s.open) return fetch(request);

  let path = url.pathname.slice(GAMES_PATH.length);
  try { path = decodeURIComponent(path); } catch { /* keep raw */ }
  if (path.endsWith('/') || path === '') path += 'index.html';
  const inject = url.searchParams.has('pp_inject') && isHtml(path);

  let body;
  if (PPShared.isUnder(path, s.access.public || [])) {
    if (!inject) return fetch(request);
    const res = await fetch(url.origin + url.pathname);
    if (!res.ok) return res;
    body = await res.arrayBuffer();
  } else {
    const k = PPShared.findScope(s.keys, path);
    if (!k) return page(403, 'Locked', s.payload ? 'Your password does not give access to this playable.' : 'Sign in to view this playable.');
    const res = await fetch(await PPShared.blobUrl(k, path));
    if (!res.ok) return page(404, 'Not found', path);
    try { body = await PPShared.decryptBlob(k, await res.arrayBuffer()); } catch { return page(500, 'Could not decrypt', 'Reload the preview and try again.'); }
  }

  if (inject) body = PPShared.injectHtml(new TextDecoder().decode(body), null);
  return new Response(body, { headers: { 'content-type': mime(path), 'cache-control': 'no-store' } });
}
