// Scans the games/ directory and produces the tree the site renders.
//
// Rules:
//   - A folder that contains index.html is ONE playable (multi-file build).
//   - Any other *.html / *.htm file is a playable (single-file build).
//   - Every other folder is a normal folder you can browse into.
//   - Names starting with "." or "_" are hidden from the listing (still deployed).
//   - Thumbnail: <game folder>/thumbnail|thumb|icon|cover|preview.(png|jpg|webp|gif|svg)
//                or, for a single file "Foo.html", a sibling "Foo.png" (etc).
//   - Optional <game folder>/playable.json: { "title", "orientation": "portrait|landscape", "description" }
//   - Uploader: .pp-owners.json next to games/ maps game file paths to the user
//     who uploaded them from the site (written by edit mode, used for permissions).
//
// Modified dates come from git history when available (CI checkouts reset mtimes),
// falling back to the file system.

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const HTML_EXT = ['.html', '.htm'];
const IMG_EXT = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'];
const THUMB_NAMES = ['thumbnail', 'thumb', 'icon', 'cover', 'preview'];

const OWNERS_FILE = '.pp-owners.json';

const isHidden = name => name.startsWith('.') || name.startsWith('_') || name === 'node_modules';
const toPosix = p => p.split(path.sep).join('/');

function gitDates(dir) {
  const dates = new Map();
  try {
    const top = execFileSync('git', ['rev-parse', '--show-toplevel'], { cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    const out = execFileSync(
      'git', ['-c', 'core.quotepath=off', 'log', '--no-renames', '--format=@@%cI', '--name-only', '--', '.'], // --no-renames: no blob downloads in CI's blobless clone
      { cwd: dir, encoding: 'utf8', maxBuffer: 512 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] }
    );
    let date = 0;
    for (const raw of out.split('\n')) {
      const line = raw.trim();
      if (!line) continue;
      if (line.startsWith('@@')) { date = Date.parse(line.slice(2)); continue; }
      const abs = path.resolve(top, line);
      if (!dates.has(abs)) dates.set(abs, date); // log is newest-first
    }
  } catch { /* not a git repo / git missing */ }
  return dates;
}

// GitHub repo the site is built from, so the page's edit mode (rename/upload)
// knows where to commit. Null for non-GitHub remotes.
function repoInfo(dir) {
  try {
    const git = args => execFileSync('git', args, { cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    let full = process.env.GITHUB_REPOSITORY;
    if (!full) {
      const m = git(['config', '--get', 'remote.origin.url']).match(/github\.com[:/]([^/]+)\/(.+?)(?:\.git)?\/?$/);
      if (!m) return null;
      full = `${m[1]}/${m[2]}`;
    }
    const [owner, name] = full.split('/');
    const branch = process.env.GITHUB_REF_NAME || git(['rev-parse', '--abbrev-ref', 'HEAD']);
    const games = toPosix(path.relative(git(['rev-parse', '--show-toplevel']), dir));
    const commit = process.env.GITHUB_SHA || git(['rev-parse', 'HEAD']); // what this build contains
    return { owner, name, branch, games, commit, workflow: 'deploy.yml' };
  } catch {
    return null;
  }
}

function buildManifest(gamesDir) {
  const root = path.resolve(gamesDir);
  const dates = gitDates(root);
  let owners = {};
  try { owners = JSON.parse(fs.readFileSync(path.join(root, '..', OWNERS_FILE), 'utf8')) || {}; } catch { /* none yet */ }
  const ownerOf = rel => (typeof owners[rel] === 'string' ? { owner: owners[rel] } : {});
  let count = 0;

  const fileInfo = abs => {
    const st = fs.statSync(abs);
    return { size: st.size, modified: dates.get(abs) || Math.round(st.mtimeMs) };
  };

  function walkFiles(abs) {
    let size = 0, modified = 0;
    for (const e of fs.readdirSync(abs, { withFileTypes: true })) {
      const p = path.join(abs, e.name);
      const info = e.isDirectory() ? walkFiles(p) : fileInfo(p);
      size += info.size;
      modified = Math.max(modified, info.modified);
    }
    return { size, modified };
  }

  function readMeta(abs) {
    try { return JSON.parse(fs.readFileSync(path.join(abs, 'playable.json'), 'utf8')); } catch { return {}; }
  }

  function gameFolder(abs, rel, name) {
    const files = fs.readdirSync(abs, { withFileTypes: true }).filter(e => e.isFile());
    const thumb = files.find(e => {
      const ext = path.extname(e.name).toLowerCase();
      return IMG_EXT.includes(ext) && THUMB_NAMES.includes(path.basename(e.name, ext).toLowerCase());
    });
    const meta = readMeta(abs);
    count++;
    return {
      type: 'game', kind: 'folder', name, title: meta.title || name, path: rel, entry: `${rel}/index.html`,
      ...walkFiles(abs),
      ...(thumb && { thumb: `${rel}/${thumb.name}` }),
      ...(meta.orientation && { orientation: meta.orientation }),
      ...(meta.description && { description: meta.description }),
      ...ownerOf(`${rel}/index.html`),
    };
  }

  function gameFile(abs, rel, name, siblings) {
    const base = path.basename(name, path.extname(name));
    const thumb = siblings.find(s => IMG_EXT.includes(path.extname(s).toLowerCase()) && path.basename(s, path.extname(s)) === base);
    count++;
    const dir = rel.includes('/') ? rel.slice(0, rel.lastIndexOf('/') + 1) : '';
    return {
      type: 'game', kind: 'file', name, title: base, path: rel, entry: rel,
      ...fileInfo(abs),
      ...(thumb && { thumb: dir + thumb }),
      ...ownerOf(rel),
    };
  }

  function folder(abs, rel, name) {
    const entries = fs.readdirSync(abs, { withFileTypes: true }).filter(e => !isHidden(e.name));
    const siblings = entries.filter(e => e.isFile()).map(e => e.name);
    const children = [];
    for (const e of entries) {
      const eAbs = path.join(abs, e.name);
      const eRel = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) {
        children.push(fs.existsSync(path.join(eAbs, 'index.html')) ? gameFolder(eAbs, eRel, e.name) : folder(eAbs, eRel, e.name));
      } else if (HTML_EXT.includes(path.extname(e.name).toLowerCase())) {
        children.push(gameFile(eAbs, eRel, e.name, siblings));
      }
    }
    const size = children.reduce((s, c) => s + c.size, 0);
    const modified = children.reduce((m, c) => Math.max(m, c.modified), 0) || Math.round(fs.statSync(abs).mtimeMs);
    return { type: 'folder', name, title: name, path: toPosix(rel), size, modified, children };
  }

  if (!fs.existsSync(root)) fs.mkdirSync(root, { recursive: true });
  const tree = folder(root, '', 'Playables');
  return { generatedAt: Date.now(), count, root: tree, repo: repoInfo(root) };
}

module.exports = { buildManifest, isHidden, OWNERS_FILE };
