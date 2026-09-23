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

fs.rmSync(OUT, { recursive: true, force: true });
fs.cpSync(SITE, OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');

if (cfg) {
  console.log(`Access control ON (${cfg.source}): ${cfg.users.length} password(s), public: ${cfg.public.join(', ') || 'none'}`);
  const { pub, enc } = writeProtected({ cfg, manifest, gamesDir: GAMES, outDir: OUT });
  console.log(`Built ${manifest.count} playable(s): ${enc} file(s) encrypted, ${pub} public -> ${path.relative(ROOT, OUT) || OUT}`);
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
