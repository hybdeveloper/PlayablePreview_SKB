/* Code shared by the page (app.js) and the service worker (sw.js):
 * password unlock, per-folder keys, encrypted blob lookup and MRAID injection.
 *
 * Protected builds publish:
 *   access.json         { v, kdf, public: [folder...], entries: [{ iv, ct }] }
 *                       each entry = AES-GCM(PBKDF2(password)) of { name, manifest, keys }
 *   g/<id>.bin          iv(12) || AES-GCM(file) for every non-public file,
 *                       id = HMAC(scope mac key, path)[0..16] as hex
 * The password-derived key is kept (non-extractable) in IndexedDB so the
 * service worker can decrypt game files while the player is open. */
(function (root) {
  'use strict';

  const te = new TextEncoder(), td = new TextDecoder();
  const b64d = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
  const hex = buf => Array.from(new Uint8Array(buf), b => b.toString(16).padStart(2, '0')).join('');
  const subtle = crypto.subtle;

  let base = '';
  const init = b => { base = b; };
  const isUnder = (path, dirs) => dirs.some(d => d === '' || path === d || path.startsWith(d + '/'));

  /* ---------- IndexedDB (one tiny key/value store per site) ---------- */
  function db() {
    return new Promise((resolve, reject) => {
      const r = indexedDB.open('pp-auth:' + new URL(base).pathname, 1);
      r.onupgradeneeded = () => r.result.createObjectStore('kv');
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
  }
  async function kv(mode, fn) {
    const d = await db();
    return new Promise((resolve, reject) => {
      const tx = d.transaction('kv', mode);
      const req = fn(tx.objectStore('kv'));
      tx.oncomplete = () => resolve(req && req.result);
      tx.onerror = () => reject(tx.error);
    });
  }
  const saveKey = k => kv('readwrite', s => s.put(k, 'key'));
  const loadKey = () => kv('readonly', s => s.get('key')).catch(() => null);
  const clearKey = () => kv('readwrite', s => s.delete('key')).catch(() => {});

  /* ---------- access / unlock ---------- */
  async function fetchAccess() {
    const res = await fetch(base + 'access.json', { cache: 'no-cache' });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('access.json: HTTP ' + res.status);
    return res.json();
  }

  async function deriveKey(password, kdf) {
    const material = await subtle.importKey('raw', te.encode(password), 'PBKDF2', false, ['deriveKey']);
    return subtle.deriveKey(
      { name: 'PBKDF2', hash: 'SHA-256', salt: b64d(kdf.salt), iterations: kdf.iterations },
      material, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
  }

  async function unlock(access, key) {
    for (const e of access.entries) {
      try {
        const pt = await subtle.decrypt({ name: 'AES-GCM', iv: b64d(e.iv) }, key, b64d(e.ct));
        return JSON.parse(td.decode(pt));
      } catch { /* not this entry */ }
    }
    return null;
  }

  async function importKeys(keys) {
    const out = {};
    for (const [scope, k] of Object.entries(keys || {})) {
      out[scope] = {
        e: await subtle.importKey('raw', b64d(k.e), 'AES-GCM', false, ['decrypt']),
        m: await subtle.importKey('raw', b64d(k.m), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']),
      };
    }
    return out;
  }

  // Everything the service worker needs to serve games/ for the current viewer.
  async function loadSession() {
    const access = await fetchAccess();
    if (!access) return { open: true };
    const key = await loadKey();
    const payload = key ? await unlock(access, key) : null;
    return { open: false, access, payload, keys: payload ? await importKeys(payload.keys) : {} };
  }

  /* ---------- encrypted files ---------- */
  function findScope(keys, path) {
    let best = null;
    for (const s of Object.keys(keys)) {
      if (isUnder(path, [s]) && (best === null || s.length > best.length)) best = s;
    }
    return best === null ? null : keys[best];
  }
  async function blobUrl(k, path) {
    const sig = await subtle.sign('HMAC', k.m, te.encode(path));
    return base + 'g/' + hex(sig).slice(0, 32) + '.bin';
  }
  async function decryptBlob(k, buf) {
    const bytes = new Uint8Array(buf);
    return subtle.decrypt({ name: 'AES-GCM', iv: bytes.slice(0, 12) }, k.e, bytes.slice(12));
  }

  /* ---------- MRAID injection ---------- */
  function injectHtml(html, baseHref) {
    const esc = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
    const tag = (baseHref ? `<base href="${esc(baseHref)}">` : '') + `<script src="${esc(base + 'assets/mraid-stub.js')}"><\/script>`;
    const m = html.match(/<head\b[^>]*>/i) || html.match(/<html\b[^>]*>/i) || html.match(/<!doctype[^>]*>/i);
    if (!m) return tag + html;
    const at = m.index + m[0].length;
    return html.slice(0, at) + tag + html.slice(at);
  }

  root.PPShared = {
    init, isUnder, saveKey, loadKey, clearKey, fetchAccess, deriveKey, unlock, importKeys,
    loadSession, findScope, blobUrl, decryptBlob, injectHtml,
  };
})(self);
