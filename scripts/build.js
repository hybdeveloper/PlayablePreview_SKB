// Builds the static site: site/ + games/ + manifest.json  ->  <out>/
// Usage: node scripts/build.js [--out dist]
const fs = require('fs');
const path = require('path');
const { buildManifest } = require('./manifest');

const ROOT = path.resolve(__dirname, '..');
const SITE = path.join(ROOT, 'site');
const GAMES = path.join(ROOT, 'games');

const args = process.argv.slice(2);
const outArg = args.includes('--out') ? args[args.indexOf('--out') + 1] : 'dist';
const OUT = path.resolve(ROOT, outArg);

if (OUT === ROOT || OUT === SITE || OUT === GAMES) throw new Error(`Refusing to build into ${OUT}`);

fs.rmSync(OUT, { recursive: true, force: true });
fs.cpSync(SITE, OUT, { recursive: true });
if (fs.existsSync(GAMES)) {
  fs.cpSync(GAMES, path.join(OUT, 'games'), {
    recursive: true,
    filter: src => !path.basename(src).startsWith('.git'),
  });
}

const manifest = buildManifest(GAMES);
fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest));
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');

console.log(`Built ${manifest.count} playable(s) -> ${path.relative(ROOT, OUT) || OUT}`);
