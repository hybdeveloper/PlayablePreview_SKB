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

// Reads games/ either from disk or, with PREVIEW_TREE=<file> (CI), from a GitHub
// "git tree" JSON (GET /repos/:repo/git/trees/:sha?recursive=1, which includes
// sizes), so the large game files never have to be checked out. Only playable.json
// files are read, via `git show` (fetched on demand in a blobless clone).
function fsSource(root) {
  const at = rel => path.join(root, rel);
  return {
    list: rel => fs.readdirSync(at(rel), { withFileTypes: true }).map(e => ({ name: e.name, dir: e.isDirectory() })),
    exists: rel => fs.existsSync(at(rel)),
    size: rel => fs.statSync(at(rel)).size,
    mtime: rel => Math.round(fs.statSync(at(rel)).mtimeMs),
    read: rel => { try { return fs.readFileSync(at(rel), 'utf8'); } catch { return null; } },
  };
}

function treeSource(root, file) {
  const run = args => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024 });
  const prefix = run(['rev-parse', '--show-prefix']).trim().replace(/\/$/, ''); // games dir inside the repo
  const tree = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!Array.isArray(tree.tree)) throw new Error(`${file}: not a git tree (${tree.message || 'no "tree" field'})`);
  if (tree.truncated) throw new Error(`${file}: tree is truncated; build without PREVIEW_TREE`);
  const dirs = new Map([['', new Map()]]), sizes = new Map();
  for (const e of tree.tree) {
    if (e.type !== 'blob' || (prefix && !e.path.startsWith(prefix + '/'))) continue;
    const rel = prefix ? e.path.slice(prefix.length + 1) : e.path;
    sizes.set(rel, e.size || 0);
    let dir = '';
    rel.split('/').forEach((name, i, parts) => {
      if (!dirs.has(dir)) dirs.set(dir, new Map());
      dirs.get(dir).set(name, i < parts.length - 1);
      dir = dir ? `${dir}/${name}` : name;
    });
  }
  return {
    list: rel => [...(dirs.get(rel) || [])].map(([name, dir]) => ({ name, dir })),
    exists: rel => sizes.has(rel) || dirs.has(rel),
    size: rel => sizes.get(rel) || 0,
    mtime: () => Date.now(),
    read: rel => { try { return sizes.has(rel) ? run(['show', `HEAD:${prefix ? prefix + '/' : ''}${rel}`]) : null; } catch { return null; } },
  };
}

function buildManifest(gamesDir) {
  const root = path.resolve(gamesDir);
  if (!fs.existsSync(root)) fs.mkdirSync(root, { recursive: true });
  const src = process.env.PREVIEW_TREE ? treeSource(root, path.resolve(process.env.PREVIEW_TREE)) : fsSource(root);
  const dates = gitDates(root);
  let owners = {};
  try { owners = JSON.parse(fs.readFileSync(path.join(root, '..', OWNERS_FILE), 'utf8')) || {}; } catch { /* none yet */ }
  const ownerOf = rel => (typeof owners[rel] === 'string' ? { owner: owners[rel] } : {});
  const join = (a, b) => (a ? `${a}/${b}` : b);
  let count = 0;

  const fileInfo = rel => ({ size: src.size(rel), modified: dates.get(path.join(root, rel)) || src.mtime(rel) });

  function walkFiles(rel) {
    let size = 0, modified = 0;
    for (const e of src.list(rel)) {
      const info = e.dir ? walkFiles(join(rel, e.name)) : fileInfo(join(rel, e.name));
      size += info.size;
      modified = Math.max(modified, info.modified);
    }
    return { size, modified };
  }

  function readMeta(rel) {
    try { return JSON.parse(src.read(join(rel, 'playable.json'))) || {}; } catch { return {}; }
  }

  function gameFolder(rel, name) {
    const thumb = src.list(rel).filter(e => !e.dir).find(e => {
      const ext = path.extname(e.name).toLowerCase();
      return IMG_EXT.includes(ext) && THUMB_NAMES.includes(path.basename(e.name, ext).toLowerCase());
    });
    const meta = readMeta(rel);
    count++;
    return {
      type: 'game', kind: 'folder', name, title: meta.title || name, path: rel, entry: `${rel}/index.html`,
      ...walkFiles(rel),
      ...(thumb && { thumb: `${rel}/${thumb.name}` }),
      ...(meta.orientation && { orientation: meta.orientation }),
      ...(meta.description && { description: meta.description }),
      ...ownerOf(`${rel}/index.html`),
    };
  }

  function gameFile(rel, name, siblings) {
    const base = path.basename(name, path.extname(name));
    const thumb = siblings.find(s => IMG_EXT.includes(path.extname(s).toLowerCase()) && path.basename(s, path.extname(s)) === base);
    count++;
    const dir = rel.includes('/') ? rel.slice(0, rel.lastIndexOf('/') + 1) : '';
    return {
      type: 'game', kind: 'file', name, title: base, path: rel, entry: rel,
      ...fileInfo(rel),
      ...(thumb && { thumb: dir + thumb }),
      ...ownerOf(rel),
    };
  }

  function folder(rel, name) {
    const entries = src.list(rel).filter(e => !isHidden(e.name));
    const siblings = entries.filter(e => !e.dir).map(e => e.name);
    const children = [];
    for (const e of entries) {
      const eRel = join(rel, e.name);
      if (e.dir) {
        children.push(src.exists(join(eRel, 'index.html')) ? gameFolder(eRel, e.name) : folder(eRel, e.name));
      } else if (HTML_EXT.includes(path.extname(e.name).toLowerCase())) {
        children.push(gameFile(eRel, e.name, siblings));
      }
    }
    const size = children.reduce((s, c) => s + c.size, 0);
    const modified = children.reduce((m, c) => Math.max(m, c.modified), 0) || src.mtime(rel);
    return { type: 'folder', name, title: name, path: rel, size, modified, children };
  }

  const tree = folder('', 'Playables');
  return { generatedAt: Date.now(), count, root: tree, repo: repoInfo(root) };
}

module.exports = { buildManifest, isHidden, OWNERS_FILE };
