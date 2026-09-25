// Password protection for the built site (see site/assets/shared.js for the
// browser side). Config comes from the PREVIEW_ACCESS env var (GitHub/GitLab
// secret) or a local, git-ignored access.config.json:
//
// {
//   "public": ["Demo/Puzzle"],                                   // optional, no password needed
//   "users": [
//     { "name": "Boss",     "password": "...", "folders": ["*"], "role": "owner" },
//     { "name": "Client A", "password": "...", "folders": ["ClientA", "Demo/Runner"] }
//   ]
// }
//
// Every folder named in "folders" becomes a key scope. Files are encrypted with
// the key of the deepest scope containing them (files outside every scope use
// the root scope, readable only by "*" users). A user receives the keys of all
// scopes inside the folders they were granted.
//
// Roles (enforced by the page UI; every non-viewer holds the same edit token):
//   owner  - everything, including renaming/deleting folders and managing users
//   admin  - upload, rename and delete any playable; no folder changes, no users
//   editor - upload; rename and delete only the playables they uploaded
//   viewer - read only (default; legacy "edit": true means owner)
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ITERATIONS = 150000;
const DEFAULT_SALT = 'PlayablePreview/v1';

const ROLES = ['owner', 'admin', 'editor', 'viewer'];

const norm = p => (p === '*' ? '' : String(p).replace(/\\/g, '/').replace(/^\/+|\/+$/g, ''));
const isUnder = (p, dirs) => dirs.some(d => d === '' || p === d || p.startsWith(d + '/'));

function loadConfig(root) {
  let raw = process.env.PREVIEW_ACCESS;
  let source = 'PREVIEW_ACCESS';
  const file = path.join(root, 'access.config.json');
  if (!raw && fs.existsSync(file)) { raw = fs.readFileSync(file, 'utf8'); source = 'access.config.json'; }
  if (!raw || !raw.trim()) return null;

  let cfg;
  try { cfg = JSON.parse(raw); } catch (e) { throw new Error(`${source} is not valid JSON: ${e.message}`); }
  const users = (cfg.users || []).map((u, i) => {
    if (!u || typeof u.password !== 'string' || !u.password) throw new Error(`${source}: users[${i}] needs a "password"`);
    const folders = (Array.isArray(u.folders) ? u.folders : [u.folders || '*']).map(norm);
    const role = ROLES.includes(u.role) ? u.role : u.edit === true ? 'owner' : 'viewer';
    return { name: String(u.name || `User ${i + 1}`), password: u.password, folders, role };
  });
  const passwords = new Set();
  for (const u of users) {
    if (passwords.has(u.password)) throw new Error(`${source}: two users share the same password`);
    passwords.add(u.password);
  }
  // Token that non-viewers get (encrypted with their password) to change files from the page.
  const editToken = (process.env.PREVIEW_EDIT_TOKEN || cfg.editToken || "").trim() || null;
  return { source, raw: cfg, users, public: (cfg.public || []).map(norm), salt: cfg.salt || DEFAULT_SALT, editToken };
}

function encrypt(key, data) {
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ct = Buffer.concat([c.update(data), c.final(), c.getAuthTag()]);
  return { iv, ct };
}

// Keep only nodes the viewer may see; ancestor folders of visible nodes stay
// so the tree can be browsed, with size/modified recomputed from what is left.
function prune(node, visible) {
  if (visible(node.path)) return node;
  if (node.type !== 'folder') return null;
  const children = node.children.map(c => prune(c, visible)).filter(Boolean);
  if (!children.length && node.path !== '') return null;
  return {
    ...node, children,
    size: children.reduce((s, c) => s + c.size, 0),
    modified: children.reduce((m, c) => Math.max(m, c.modified), 0) || node.modified,
  };
}
const countGames = n => (n.type === 'game' ? 1 : n.children.reduce((s, c) => s + countGames(c), 0));

function listFiles(dir, rel = '') {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.git')) continue;
    const r = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) out.push(...listFiles(path.join(dir, e.name), r));
    else out.push(r);
  }
  return out;
}

function folderExists(manifest, p) {
  const walk = n => n.path === p || (n.children || []).some(walk);
  return p === '' || walk(manifest.root);
}

// Writes games/ (public files only), g/*.bin, access.json and a public-only manifest.json.
function writeProtected({ cfg, manifest, gamesDir, outDir }) {
  for (const p of [...cfg.public, ...cfg.users.flatMap(u => u.folders)]) {
    if (!folderExists(manifest, p)) console.warn(`  ! folder "${p}" does not exist in games/`);
  }

  const scopes = [...new Set(['', ...cfg.users.flatMap(u => u.folders)])];
  const keys = Object.fromEntries(scopes.map(s => [s, { e: crypto.randomBytes(32), m: crypto.randomBytes(32) }]));
  const scopeOf = p => scopes.filter(s => isUnder(p, [s])).sort((a, b) => b.length - a.length)[0];

  let pub = 0, enc = 0;
  if (fs.existsSync(gamesDir)) {
    fs.mkdirSync(path.join(outDir, 'g'), { recursive: true });
    for (const rel of listFiles(gamesDir)) {
      const src = path.join(gamesDir, rel);
      if (isUnder(rel, cfg.public)) {
        const dst = path.join(outDir, 'games', rel);
        fs.mkdirSync(path.dirname(dst), { recursive: true });
        fs.copyFileSync(src, dst);
        pub++;
      } else {
        const k = keys[scopeOf(rel)];
        const id = crypto.createHmac('sha256', k.m).update(rel, 'utf8').digest('hex').slice(0, 32);
        const { iv, ct } = encrypt(k.e, fs.readFileSync(src));
        fs.writeFileSync(path.join(outDir, 'g', id + '.bin'), Buffer.concat([iv, ct]));
        enc++;
      }
    }
  }

  const publicVisible = p => isUnder(p, cfg.public);
  const publicRoot = prune(manifest.root, publicVisible) || { ...manifest.root, children: [] };
  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify({ generatedAt: manifest.generatedAt, count: countGames(publicRoot), root: publicRoot, repo: manifest.repo }));

  const salt = crypto.createHash('sha256').update(cfg.salt).digest();
  const entries = cfg.users.map(u => {
    const root = prune(manifest.root, p => publicVisible(p) || isUnder(p, u.folders)) || { ...manifest.root, children: [] };
    const userKeys = Object.fromEntries(scopes.filter(s => isUnder(s, u.folders))
      .map(s => [s, { e: keys[s].e.toString('base64'), m: keys[s].m.toString('base64') }]));
    const payload = { name: u.name, role: u.role, manifest: { generatedAt: manifest.generatedAt, count: countGames(root), root, repo: manifest.repo }, keys: userKeys };
    if (u.role !== 'viewer' && cfg.editToken) payload.edit = { token: cfg.editToken };
    // Owners edit the user list from the page, which rewrites the whole PREVIEW_ACCESS secret.
    if (u.role === 'owner') payload.config = cfg.raw;
    const key = crypto.pbkdf2Sync(u.password, salt, ITERATIONS, 32, 'sha256');
    const { iv, ct } = encrypt(key, Buffer.from(JSON.stringify(payload)));
    console.log(`  - ${u.name}: ${u.folders.map(f => f || "*").join(", ")} (${payload.manifest.count} playables), ${u.role}${u.role !== 'viewer' && !payload.edit ? ' (no edit token)' : ''}`);
    return { iv: iv.toString('base64'), ct: ct.toString('base64') };
  });
  entries.sort(() => Math.random() - 0.5); // order must not reveal which entry is whose

  const access = {
    v: 1,
    kdf: { name: 'PBKDF2', hash: 'SHA-256', iterations: ITERATIONS, salt: salt.toString('base64') },
    public: cfg.public,
    entries,
  };
  fs.writeFileSync(path.join(outDir, 'access.json'), JSON.stringify(access));
  return { pub, enc };
}

module.exports = { loadConfig, writeProtected, ROLES };
