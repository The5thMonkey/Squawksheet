// Run: node tools/validate.mjs [path/to/squawks.json]
// Used by the GitHub check on every pull request. No dependencies.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { validate, index, careers } from '../js/core.js';
const file = process.argv[2] || new URL('../data/squawks.json', import.meta.url);
let data;
try { data = JSON.parse(readFileSync(file, 'utf8')); }
catch (e) { console.error('✕ data/squawks.json is not valid JSON:', e.message); process.exit(1); }
for (const k of ['meta', 'teams', 'players', 'seasons', 'games']) if (!data[k]) { console.error(`✕ missing top-level "${k}"`); process.exit(1); }
const { errs, warns } = validate(data);
// A browser that already has squawks.json in Downloads saves the next one as "squawks(1).json".
// Uploaded like that, GitHub adds a new file and the site keeps reading the old data.
for (const [code, src] of Object.entries(data.team_logos || {})) if (src.startsWith('img/') && !existsSync(new URL('../' + src, import.meta.url))) errs.push(`Team ${code}: logo file ${src} is missing`);
if (!process.argv[2]) {
  const stray = readdirSync(new URL('../data/', import.meta.url)).filter(f => /^squawks.*\.json$/i.test(f) && f !== 'squawks.json');
  for (const f of stray) errs.push(`data/${f} is an extra copy: the site only reads data/squawks.json. Rename the download to squawks.json before uploading (it replaces the old one), and delete ${f}.`);
}
try { careers(index(data)); } catch (e) { errs.push('Stats could not be calculated: ' + e.message); }
for (const w of warns) console.log('⚠', w);
for (const e of errs) console.error('✕', e);
console.log(`${data.games.length} games, ${data.players.length} players: ${errs.length} error(s), ${warns.length} warning(s)`);
process.exit(errs.length ? 1 : 0);
