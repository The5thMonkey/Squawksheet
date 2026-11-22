// Fetches each season's schedule and results from the league site (SportsEngine / sportngin).
// Run: node tools/schedule.mjs [--out schedule-out] [--season F26]
// Used by .github/workflows/league-schedule.yml, which saves the files to the league-schedule branch.
// The stats entry page reads them from there and merges them in when you click "Sync schedule".
// It only reads seasons that have a "League schedule link" (schedule_url) set on the Season & roster tab.
// No dependencies (Node 20+ for fetch).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const out = arg('--out', 'schedule-out'), only = arg('--season', null);
const data = JSON.parse(readFileSync(new URL('../data/squawks.json', import.meta.url), 'utf8'));
const norm = s => String(s || '').toLowerCase().replace(/&amp;/g, '&').replace(/[^a-z0-9]/g, '');
const byName = Object.fromEntries(Object.entries(data.teams).map(([code, name]) => [norm(name), code]));
const decode = s => s.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ').trim();
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function get(url) {
  for (let attempt = 1; ; attempt++) {
    try {
      const r = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 (WinterSquawks schedule sync; github.com/The5thMonkey/Squawksheet)' } });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return await r.text();
    } catch (e) { if (attempt >= 3) throw new Error(`${url}: ${e.message}`); await sleep(2000 * attempt); }
  }
}
const to24 = t => { const m = t && t.match(/(\d{1,2}):(\d{2})\s*([AP]M)/i); if (!m) return null; let h = +m[1] % 12; if (/p/i.test(m[3])) h += 12; return `${String(h).padStart(2, '0')}:${m[2]}`; };

// One day's page: rows look like <tr id="game_list_row_NNN" class="odd completed ..."> visitor, V score, home, H score, location, status
export function parseDay(html, date) {
  const games = [];
  for (const chunk of html.split('<tr id="game_list_row_').slice(1)) {
    const row = chunk.slice(0, chunk.indexOf('</tr>'));
    const id = row.match(/^(\d+)/)?.[1];
    const cells = row.split(/<td[\s>]/).slice(1);
    if (!id || cells.length < 6) continue;
    const team = c => decode((c.match(/class="teamName"[^>]*>([^<]+)</) || c.match(/class="scheduleListTeam">\s*([^<]+)</) || [])[1] || '');
    const score = c => { const v = decode((c.match(/<div[^>]*>([^<]*)<\/div>/) || [])[1] || ''); return /^\d+$/.test(v) ? +v : null; };
    const away_name = team(cells[0]), home_name = team(cells[2]);
    const alt = (cells[5].match(/alt="([^"]+)"/) || [])[1] || '';
    const final = /final/i.test(alt);
    games.push({
      id, date, time: to24((cells[5].match(/<span>([^<]+)<\/span>/) || [])[1]),
      away: byName[norm(away_name)] || null, home: byName[norm(home_name)] || null, away_name, home_name,
      status: final ? 'final' : 'scheduled', decided: /\/OT/i.test(alt) ? 'OT' : /\/SO/i.test(alt) ? 'SO' : null,
      away_score: final ? score(cells[1]) : null, home_score: final ? score(cells[3]) : null, status_text: alt || null,
    });
  }
  return games;
}

async function season(s) {
  const u = new URL(s.schedule_url);
  const div = u.pathname.match(/division_instance\/(\d+)/)?.[1], sub = u.searchParams.get('subseason');
  if (!div) throw new Error(`${s.id}: can't find division_instance in ${s.schedule_url}`);
  const base = `${u.origin}/schedule/day/division_instance/${div}`, q = sub ? `?subseason=${sub}` : '';
  const first = await get(base + q);
  const dates = [...new Set([...first.matchAll(new RegExp(`/schedule/day/division_instance/${div}/(\\d{4})/(\\d{1,2})/(\\d{1,2})`, 'g'))]
    .map(m => `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`))].sort();
  if (!dates.length) throw new Error(`${s.id}: no game days found on ${base + q}`);
  const games = [];
  for (const d of dates) {
    const [y, m, dd] = d.split('-').map(Number);
    games.push(...parseDay(await get(`${base}/${y}/${m}/${dd}${q}`), d));
    await sleep(400);   // be polite to the league site
  }
  games.sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')));
  const unknown = [...new Set(games.flatMap(g => [!g.away && g.away_name, !g.home && g.home_name]).filter(Boolean))];
  console.log(`${s.id}: ${dates.length} days, ${games.length} games, ${games.filter(g => g.status === 'final').length} with results${unknown.length ? `; unknown teams: ${unknown.join(', ')}` : ''}`);
  return { season: s.id, url: s.schedule_url, fetched_at: new Date().toISOString(), days: dates, games, unknown_teams: unknown };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const list = data.seasons.filter(s => s.schedule_url && (!only || s.id === only));
  if (!list.length) { console.log('No seasons have a league schedule link.'); process.exit(0); }
  mkdirSync(out, { recursive: true });
  let failed = 0;
  for (const s of list) {
    try { const r = await season(s); writeFileSync(`${out}/${s.id}.json`, JSON.stringify(r, null, 1) + '\n'); }
    catch (e) { console.error('✕', e.message); failed++; }
  }
  writeFileSync(`${out}/README.md`, 'Fetched automatically from the league site by tools/schedule.mjs. Do not edit; it is replaced on every run.\n');
  process.exit(failed ? 1 : 0);
}
