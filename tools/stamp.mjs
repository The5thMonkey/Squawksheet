// Run: node tools/stamp.mjs        (after changing anything in css/ or js/)
//      node tools/stamp.mjs --check (used by the GitHub check: fails if the stamp is out of date)
// Adds ?v=<fingerprint> to the style and script links so browsers load fresh copies after a change
// instead of reusing what GitHub Pages lets them cache for 10 minutes. No dependencies.
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const root = new URL('../', import.meta.url);
const read = f => readFileSync(new URL(f, root), 'utf8');
const strip = s => s.replace(/\?v=[\w-]+/g, '');
const code = ['css/style.css', 'js/core.js', 'js/app.js', 'js/admin.js'];
const v = createHash('sha1').update(code.map(f => strip(read(f))).join('\n')).digest('hex').slice(0, 10);
const targets = {
  'index.html': [/(href="css\/style\.css)(\?v=[\w-]+)?"/g, /(src="js\/app\.js)(\?v=[\w-]+)?"/g],
  'admin.html': [/(href="css\/style\.css)(\?v=[\w-]+)?"/g, /(src="js\/admin\.js)(\?v=[\w-]+)?"/g],
  'js/app.js': [/(from '\.\/core\.js)(\?v=[\w-]+)?'/g],
  'js/admin.js': [/(from '\.\/core\.js)(\?v=[\w-]+)?'/g],
};
const stale = [];
for (const [f, res] of Object.entries(targets)) {
  const before = read(f); let after = before;
  for (const re of res) after = after.replace(re, (m, a) => `${a}?v=${v}${m.endsWith("'") ? "'" : '"'}`);
  if (after !== before) { stale.push(f); if (!process.argv.includes('--check')) writeFileSync(new URL(f, root), after); }
}
if (process.argv.includes('--check')) {
  if (stale.length) { console.error(`✕ Version stamp is out of date in ${stale.join(', ')}. Run: node tools/stamp.mjs`); process.exit(1); }
  console.log(`✓ version stamp ${v} is current`);
} else console.log(stale.length ? `Stamped ${v} into ${stale.join(', ')}` : `Already stamped ${v}`);
