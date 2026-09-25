// Builds the static site: site/ + games/ + manifest.json  ->  <out>/
// With an access config (PREVIEW_ACCESS env / access.config.json) the games are
// encrypted per folder and the site asks for a password (see protect.js).
// Usage: node scripts/build.js [--out dist]
const fs = require('fs');
const path = require('path');
const { buildManifest } = require('./manifest');
const { loadConfig, writeProtected } = require('./protect');

const ROOT = path.resolve(__dirname, '..');
const SITE = path.join(ROOT, 'site');
const GAMES = path.join(ROOT, 'games');

const args = process.argv.slice(2);
const outArg = args.includes('--out') ? args[args.indexOf('--out') + 1] : 'dist';
const OUT = path.resolve(ROOT, outArg);

if (OUT === ROOT || OUT === SITE || OUT === GAMES) throw new Error(`Refusing to build into ${OUT}`);

const cfg = loadConfig(ROOT);
const manifest = buildManifest(GAMES);

// Remote games (default for public GitHub repos): the build ships only the list;
// the service worker (site/sw.js) fetches each file from GitHub at this exact
// commit when a playable is opened, and nothing is kept once it is closed.
// PREVIEW_GAMES=bundle (or a non-GitHub remote) copies/encrypts games/ into the site instead.
const r = manifest.repo;
const remote = process.env.PREVIEW_GAMES !== 'bundle' && r && r.commit;
if (!remote && process.env.PREVIEW_TREE) {
  throw new Error('Bundling games needs them checked out: unset PREVIEW_TREE and remove sparse-checkout in the workflow');
}
if (remote) {
  const enc = p => p.split('/').map(encodeURIComponent).join('/');
  manifest.source = { base: `https://raw.githubusercontent.com/${enc(r.owner)}/${enc(r.name)}/${r.commit}/${r.games ? enc(r.games) + '/' : ''}` };
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.cpSync(SITE, OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');

if (cfg) {
  console.log(`Access control ON (${cfg.source}): ${cfg.users.length} password(s), public: ${cfg.public.join(', ') || 'none'}`);
  const { pub, enc } = writeProtected({ cfg, manifest, gamesDir: GAMES, outDir: OUT, remote });
  console.log(remote
    ? `Built ${manifest.count} playable(s), loaded on demand from ${manifest.source.base}`
    : `Built ${manifest.count} playable(s): ${enc} file(s) encrypted, ${pub} public -> ${path.relative(ROOT, OUT) || OUT}`);
} else if (remote) {
  fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest));
  console.log('Access control OFF (no PREVIEW_ACCESS / access.config.json): everything is public');
  console.log(`Built ${manifest.count} playable(s), loaded on demand from ${manifest.source.base}`);
} else {
  if (fs.existsSync(GAMES)) {
    fs.cpSync(GAMES, path.join(OUT, 'games'), {
      recursive: true,
      filter: src => !path.basename(src).startsWith('.git'),
    });
  }
  fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest));
  console.log('Access control OFF (no PREVIEW_ACCESS / access.config.json): everything is public');
  console.log(`Built ${manifest.count} playable(s) -> ${path.relative(ROOT, OUT) || OUT}`);
}

// Surface the access mode on the GitHub Actions run page (never prints passwords/tokens).
if (process.env.GITHUB_ACTIONS) {
  if (!cfg) {
    console.log('::warning title=Access control OFF::Secret PREVIEW_ACCESS is empty or not visible to this workflow - the site is public.');
  } else {
    const editors = cfg.users.filter(u => u.role !== 'viewer').map(u => `${u.name} (${u.role})`);
    console.log(`::notice title=Access control ON::${cfg.users.length} password(s); public folders: ${cfg.public.join(', ') || 'none'}; can edit: ${editors.join(', ') || 'none'}`);
    if (editors.length && !cfg.editToken) console.log('::warning title=Editing disabled::Some users have an owner/admin/editor role but secret PREVIEW_EDIT_TOKEN is not set.');
  }
}
