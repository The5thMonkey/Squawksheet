// Run: node tools/validate.mjs [path/to/squawks.json]
// Used by the GitHub check on every pull request. No dependencies.
import { readFileSync } from 'node:fs';
import { validate, index, careers } from '../js/core.js';
const file = process.argv[2] || new URL('../data/squawks.json', import.meta.url);
let data;
try { data = JSON.parse(readFileSync(file, 'utf8')); }
catch (e) { console.error('✕ data/squawks.json is not valid JSON:', e.message); process.exit(1); }
for (const k of ['meta', 'teams', 'players', 'seasons', 'games']) if (!data[k]) { console.error(`✕ missing top-level "${k}"`); process.exit(1); }
const { errs, warns } = validate(data);
try { careers(index(data)); } catch (e) { errs.push('Stats could not be calculated: ' + e.message); }
for (const w of warns) console.log('⚠', w);
for (const e of errs) console.error('✕', e);
console.log(`${data.games.length} games, ${data.players.length} players: ${errs.length} error(s), ${warns.length} warning(s)`);
process.exit(errs.length ? 1 : 0);
