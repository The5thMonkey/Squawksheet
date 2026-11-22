// core.js — all stat math lives here. Shared by the site, the entry page and the validator.
// Nothing is stored twice: every total is derived from games (tracked seasons) or roster legacy lines (pre-F24).

export const TERM_ORDER = { W: 0, S: 1, F: 2 };
export function seasonSort(a, b) {
  const ya = +a.id.slice(1), yb = +b.id.slice(1);
  return ya - yb || TERM_ORDER[a.id[0]] - TERM_ORDER[b.id[0]];
}

export function index(data) {
  const players = Object.fromEntries(data.players.map(p => [p.id, p]));
  const seasons = [...data.seasons].sort(seasonSort);
  const seasonById = Object.fromEntries(seasons.map(s => [s.id, s]));
  const gamesBySeason = {};
  for (const g of data.games) (gamesBySeason[g.season] ||= []).push(g);
  for (const k in gamesBySeason) gamesBySeason[k].sort((a, b) => (a.date || '').localeCompare(b.date || '') || a.id.localeCompare(b.id));
  return { data, players, seasons, seasonById, gamesBySeason, teams: data.teams };
}

export const final = g => g.status === 'final';
export function starPoints(data, seasonId) {
  const sp = data.meta.star_points || { default: [4, 2, 1] };
  return sp[seasonId] || sp.default;
}
// assists for a game: paired (a1/a2 on goals) + legacy unpaired list
export function gameAssists(g) {
  const out = [...(g.assists_unpaired || [])];
  for (const x of g.goals || []) { if (x.a1) out.push(x.a1); if (x.a2) out.push(x.a2); }
  return out;
}
const count = (arr, v) => arr.reduce((n, x) => n + (x === v), 0);

// ---------- per-season lines ----------
export function skaterSeasonLine(ix, season, pid) {
  const s = season;
  const entry = (s.roster || []).find(e => e.player === pid);
  if (s.tracking !== 'game-log') {
    if (!entry || entry.pos === 'G' || !entry.legacy) return null;
    const L = entry.legacy;
    return { season: s.id, gp: L.gp ?? 0, g: L.g ?? 0, a: L.a ?? 0, pts: (L.g ?? 0) + (L.a ?? 0), cup: 0, pen: 0, pim: 0, vg: 0, verified: false, number: entry.number, pos: entry.pos, tags: entry.tags };
  }
  const gs = (ix.gamesBySeason[s.id] || []).filter(final);
  const line = { season: s.id, gp: 0, g: 0, a: 0, pts: 0, cup: 0, pen: 0, pim: 0, vg: 0, gwg: 0, verified: true, number: entry?.number, pos: entry?.pos, tags: entry?.tags || [] };
  const sp = starPoints(ix.data, s.id);
  for (const g of gs) {
    if (!g.roster.includes(pid) || g.goalie === pid || isBackupGoalie(g, pid)) continue;
    line.gp++;
    const goals = g.goals.filter(x => x.scorer === pid);
    line.g += goals.length; line.vg += goals.filter(x => x.video).length;
    line.a += count(gameAssists(g), pid);
    g.stars.forEach((st, i) => { if (st === pid) line.cup += sp[i] || 0; });
    for (const p of g.penalties || []) if (p.player === pid) { line.pen += p.count; line.pim += p.pim; }
  }
  line.pts = line.g + line.a;
  if (!line.gp && !entry) return null;
  if (!line.gp && entry?.pos === 'G') return null;
  return line;
}

// ---------- lineups ----------
// g.lineup = { f: [[LW, C, RW], ...] (up to 4), d: [[LD, RD], ...] (up to 3), g: [G1, G2] (up to 2) }; empty slots are null.
// When a game has a lineup, its roster is exactly the players in it. g.goalie is the goalie of record.
export const LINEUP_MAX = { f: 4, d: 3, g: 2 };
export const lineupPlayers = lu => lu ? [...(lu.g || []), ...(lu.f || []).flat(), ...(lu.d || []).flat()].filter(Boolean) : [];
// a goalie who dressed but isn't the goalie of record: no skater or goalie stats for that game
export const isBackupGoalie = (g, p) => p !== g.goalie && !!g.lineup && (g.lineup.g || []).includes(p);

export function goalieSeasonLine(ix, season, pid) {
  const s = season;
  const entry = (s.roster || []).find(e => e.player === pid && e.pos === 'G');
  if (s.tracking !== 'game-log') {
    if (!entry || !entry.legacy) return null;
    const L = entry.legacy;
    return { season: s.id, gp: L.gp ?? 0, w: L.w ?? 0, l: null, t: null, otl: null, ga: L.ga ?? 0, so: null, sa: null, g: L.pts_g ?? 0, a: L.pts_a ?? 0, cup: 0, verified: false, tags: entry.tags };
  }
  const gs = (ix.gamesBySeason[s.id] || []).filter(final);
  const line = { season: s.id, gp: 0, w: 0, l: 0, t: 0, otl: 0, ga: 0, so: 0, sa: 0, saGames: 0, gaS: 0, g: 0, a: 0, cup: 0, verified: true, tags: entry?.tags || [] };
  const sp = starPoints(ix.data, s.id);
  for (const g of gs) {
    g.stars.forEach((st, i) => { if (st === pid && g.goalie === pid) line.cup += sp[i] || 0; });
    if (g.goalie !== pid) continue;
    line.gp++;
    const r = g.result; if (r === 'W') line.w++; else if (r === 'L') line.l++; else if (r === 'T') line.t++; else if (r === 'OTL') line.otl++;
    const gaG = (g.ga ?? 0) - (g.en_against ?? 0); line.ga += gaG; if (gaG === 0) line.so++;  // empty-net goals don't count against the goalie
    if (g.shots_against != null) { line.sa += g.shots_against; line.saGames++; line.gaS += gaG; }
    line.a += count(gameAssists(g), pid); line.g += g.goals.filter(x => x.scorer === pid).length;
  }
  if (!line.gp) return null;
  // Seasons migrated from the old sheet carry a hand-typed goalie GA total; it wins over summed scores.
  if (entry?.sheet_ga != null && entry.sheet_ga !== line.ga) { line.gaFromScores = line.ga; line.ga = entry.sheet_ga; }
  return line;
}

// ---------- team season record ----------
export function teamRecord(ix, s) {
  const blank = () => ({ gp: 0, w: 0, l: 0, t: 0, otl: 0, gf: 0, ga: 0 });
  if (s.tracking === 'game-log') {
    const reg = blank(), po = blank();
    for (const g of (ix.gamesBySeason[s.id] || []).filter(final)) {
      const r = g.playoff ? po : reg;
      r.gp++; r.gf += g.gf ?? 0; r.ga += g.ga ?? 0;
      if (g.result === 'W') r.w++; else if (g.result === 'L') r.l++; else if (g.result === 'T') r.t++; else if (g.result === 'OTL') r.otl++;
    }
    return { reg, po, computed: true };
  }
  const o = s.overview || s.sheet_record || {};
  const rt = s.raw_team_season || {};
  const reg = { gp: (o.w ?? 0) + (o.l ?? 0) + (o.t ?? 0) + (o.otl ?? 0), w: o.w ?? 0, l: o.l ?? 0, t: o.t ?? 0, otl: o.otl ?? 0, gf: null, ga: null };
  const po = { gp: rt.pgp ?? 0, w: rt.pw ?? 0, l: rt.pl ?? 0, t: 0, otl: 0, gf: null, ga: null };
  return { reg, po, computed: false, gfAll: o.gf ?? null, gaAll: o.ga ?? null };
}
export function points(data, r) {
  const p = data.meta.points_rule; return r.w * p.win + r.t * p.tie + r.otl * p.otl;
}
// Final place if one was set; otherwise, for seasons whose standings come from games, the Squawks' current spot.
export function place(s, data) {
  if (s.place != null) return s.place;
  if (!data || !s.standings_from_games) return s.overview?.place ?? s.sheet_record?.place ?? null;
  const i = computeStandings(data, s.id).findIndex(r => r.team === 'WSQ'); return i < 0 ? null : i + 1;
}

// ---------- standings from games ----------
// Seasons with standings_from_games: true work their standings out from the games instead of a copied snapshot:
// the Squawks' own games come from the game log, every other game from league_games.
// 2 points for a win, 1 for a tie or an overtime/shootout loss. Order: points, then wins, goal difference, goals for.
export const LG_DECIDED = { null: 'Regulation', OT: 'Overtime', SO: 'Shootout' };
export const lgOT = g => g.ot !== undefined ? g.ot : ((g.winner || '').endsWith('OT') ? 'OT' : null);
export const lgFinal = g => g.home_score != null && g.away_score != null;
export function lgWinner(g) { // same coding as the imported sheet: Home, Away, HomeOT, AwayOT, Tie
  if (!lgFinal(g)) return null; if (g.home_score === g.away_score) return 'Tie';
  return (g.home_score > g.away_score ? 'Home' : 'Away') + (lgOT(g) ? 'OT' : '');
}
export function computeStandings(data, sid) {
  const rows = {};
  const row = t => rows[t] ||= { team: t, gp: 0, w: 0, l: 0, t: 0, otl: 0, t_otl: 0, pts: 0, gf: 0, ga: 0, sf: 0, sa: 0, shots: 0 };
  const add = (t, f, a, res, sf, sa) => {
    const r = row(t); r.gp++; r.gf += f; r.ga += a;
    if (sf != null && sa != null) { r.sf += sf; r.sa += sa; r.shots++; }
    if (res === 'W') { r.w++; r.pts += 2; } else if (res === 'T') { r.t++; r.t_otl++; r.pts += 1; } else if (res === 'OTL') { r.otl++; r.t_otl++; r.pts += 1; } else r.l++;
  };
  const opp = { W: 'L', L: 'W', T: 'T', OTL: 'W' };
  for (const g of data.league_games || []) {
    if (g.season !== sid || g.playoff || g.home === 'WSQ' || g.away === 'WSQ') continue;
    if (g.home) row(g.home); if (g.away) row(g.away);
    if (!lgFinal(g) || !g.home || !g.away) continue;
    const hr = g.home_score > g.away_score ? 'W' : g.home_score === g.away_score ? 'T' : lgOT(g) ? 'OTL' : 'L';
    const ar = hr === 'W' ? (lgOT(g) ? 'OTL' : 'L') : hr === 'T' ? 'T' : 'W';
    add(g.home, g.home_score, g.away_score, hr, g.home_shots, g.away_shots);
    add(g.away, g.away_score, g.home_score, ar, g.away_shots, g.home_shots);
  }
  for (const g of data.games || []) {
    if (g.season !== sid || g.playoff || g.status !== 'final' || !g.result || !g.opponent) continue;
    add('WSQ', g.gf, g.ga, g.result, g.shots_for, g.shots_against);
    add(g.opponent, g.ga, g.gf, g.result === 'W' && g.ot ? 'OTL' : opp[g.result], g.shots_against, g.shots_for);
  }
  row('WSQ');
  return Object.values(rows).sort((a, b) => b.pts - a.pts || b.w - a.w || (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf || a.team.localeCompare(b.team));
}
export const seasonStandings = (data, s) => s.standings_from_games ? computeStandings(data, s.id) : (s.standings || []);

// ---------- league schedule (fetched from the league site by tools/schedule.mjs) ----------
// A fetched schedule is { season, url, fetched_at, games: [{ id, date, time, home, away, home_name, away_name,
// status: 'scheduled' | 'final', decided: null | 'OT' | 'SO', home_score, away_score }] } with team codes (null if unknown).
// mergeSchedule() adds missing games and fills in dates, times and home/away. It never changes a score.
const pairKey = (a, b) => [a, b].sort().join('|');
export function mergeSchedule(data, sid, sched, newSquawksGame) {
  const rep = { leagueAdded: [], leagueUpdated: [], squawksAdded: [], squawksUpdated: [], unknownTeams: [], notes: [] };
  const lg = data.league_games ||= [];
  const used = new Set();
  for (const s0 of sched.games || []) {
    const s = { ...s0, home: s0.home || teamByName(data, s0.home_name), away: s0.away || teamByName(data, s0.away_name) };
    if (!s.home || !s.away) { for (const k of ['home', 'away']) if (!s[k] && !rep.unknownTeams.includes(s[k + '_name'])) rep.unknownTeams.push(s[k + '_name']); continue; }
    if (s.home === 'WSQ' || s.away === 'WSQ') {
      const opp = s.home === 'WSQ' ? s.away : s.home;
      let g = data.games.find(x => x.season === sid && x.date === s.date && x.opponent === opp);
      if (!g) {
        const other = data.games.find(x => x.season === sid && x.date === s.date);
        if (other) { rep.notes.push(`${s.date}: league site has the Squawks vs ${data.teams[opp]}, the game log has ${data.teams[other.opponent] || 'no opponent'}. Not changed.`); continue; }
        g = newSquawksGame(sid); g.date = s.date; g.time = s.time; g.opponent = opp; data.games.push(g); rep.squawksAdded.push(g.id); continue;
      }
      if (g.status !== 'final' && s.time && g.time !== s.time) { g.time = s.time; rep.squawksUpdated.push(g.id); }
      continue;
    }
    const pk = pairKey(s.home, s.away);
    const cand = x => x.season === sid && !used.has(x) && x.home !== 'WSQ' && x.away !== 'WSQ';
    let g = lg.find(x => cand(x) && x.source_id === s.id)
      || lg.find(x => cand(x) && !x.source_id && x.date === s.date && pairKey(x.home, x.away) === pk)
      || lg.find(x => cand(x) && !x.source_id && !x.date && pairKey(x.home, x.away) === pk);   // imported games without dates, in order
    if (!g) {
      g = { season: sid, date: s.date, time: s.time, home: s.home, away: s.away, home_score: null, away_score: null, home_shots: null, away_shots: null, ot: null, winner: null, playoff: false, championship: false, source_id: s.id };
      lg.push(g); used.add(g); rep.leagueAdded.push(g); continue;
    }
    used.add(g);
    const before = JSON.stringify(g);
    g.source_id = s.id; g.date = s.date; if (s.time || !g.time) g.time = s.time;
    if (g.home !== s.home) { // the league site's home/away wins; scores and shots move with their team
      [g.home, g.away] = [g.away, g.home]; [g.home_score, g.away_score] = [g.away_score, g.home_score]; [g.home_shots, g.away_shots] = [g.away_shots, g.home_shots];
      if (g.winner) g.winner = lgWinner(g);
    }
    if (JSON.stringify(g) !== before) rep.leagueUpdated.push(g);
  }
  return rep;
}
// The league site's result for a game, as a short label, e.g. "4–3 SO". Away score shown second to match home–away order.
export const siteScore = s => s && s.status === 'final' && s.home_score != null ? `${s.home_score}–${s.away_score}${s.decided ? ' ' + s.decided : ''}` : null;
export function verification(ix, s) {
  const gs = (ix.gamesBySeason[s.id] || []).filter(final);
  return { goals: gs.reduce((n, g) => n + g.goals.length, 0), video_linked: gs.reduce((n, g) => n + g.goals.filter(x => x.video).length, 0) };
}
export function nextSeasonId(id) {
  const t = id[0], y = +id.slice(1);
  return t === 'W' ? 'S' + y : t === 'S' ? 'F' + y : 'W' + (y + 1);
}

// ---------- careers ----------
export function careers(ix, { includeExcluded = false, seasonFilter = null } = {}) {
  const sk = {}, gk = {};
  for (const s of ix.seasons) {
    if (!includeExcluded && !s.in_totals) continue;
    if (seasonFilter && !seasonFilter(s)) continue;
    const pids = new Set((s.roster || []).map(e => e.player));
    for (const g of ix.gamesBySeason[s.id] || []) for (const p of g.roster || []) pids.add(p);
    for (const pid of pids) {
      const l = skaterSeasonLine(ix, s, pid);
      if (l && (l.gp || l.g || l.a)) {
        const c = sk[pid] ||= { player: pid, seasons: 0, gp: 0, g: 0, a: 0, pts: 0, cup: 0, pen: 0, pim: 0, vg: 0, first: s.id, last: s.id, champs: 0, pres: 0, lines: [] };
        c.seasons++; c.gp += l.gp; c.g += l.g; c.a += l.a; c.pts += l.pts; c.cup += l.cup; c.pen += l.pen; c.pim += l.pim; c.vg += l.vg; c.last = s.id;
        if (s.champion) c.champs++; if (s.presidents) c.pres++; c.lines.push(l);
      }
      const gl = goalieSeasonLine(ix, s, pid);
      if (gl) {
        const c = gk[pid] ||= { player: pid, seasons: 0, gp: 0, w: 0, l: 0, t: 0, otl: 0, ga: 0, so: 0, sa: 0, saGames: 0, gaS: 0, g: 0, a: 0, cup: 0, first: s.id, last: s.id, champs: 0, pres: 0, lines: [] };
        c.seasons++; c.gp += gl.gp; c.w += gl.w; c.l += gl.l || 0; c.t += gl.t || 0; c.otl += gl.otl || 0; c.ga += gl.ga; c.so += gl.so || 0; c.a += gl.a; c.g += gl.g || 0; c.cup += gl.cup; c.last = s.id;
        c.sa += gl.sa || 0; c.saGames += gl.saGames || 0; c.gaS += gl.gaS || 0;
        if (!ix.players[pid]?.sub) { if (s.champion) c.champs++; if (s.presidents) c.pres++; } c.lines.push(gl);
      }
    }
  }
  return { skaters: Object.values(sk), goalies: Object.values(gk) };
}

export function latestSeason(ix) { return ix.seasons[ix.seasons.length - 1]; }
export function isActive(ix, pid) { const s = latestSeason(ix); return (s.roster || []).some(e => e.player === pid); }

// ---------- validation (used by entry page + GitHub check) ----------
export function validate(data) {
  const errs = [], warns = [];
  const P = new Set(data.players.map(p => p.id));
  const S = new Set(data.seasons.map(s => s.id));
  const T = new Set(Object.keys(data.teams));
  const ids = new Set();
  if (data.players.length !== P.size) errs.push('Duplicate player ids');
  for (const s of data.seasons) {
    for (const e of s.roster || []) if (!P.has(e.player)) errs.push(`${s.id}: roster has unknown player "${e.player}"`);
  }
  for (const g of data.games) {
    const w = `${g.id}${g.date ? ' (' + g.date + ')' : ''}`;
    if (ids.has(g.id)) errs.push(`${w}: duplicate game id`); ids.add(g.id);
    if (!S.has(g.season)) errs.push(`${w}: unknown season "${g.season}"`);
    if (!T.has(g.opponent)) errs.push(`${w}: unknown opponent "${g.opponent}"`);
    if (g.date && !/^\d{4}-\d{2}-\d{2}$/.test(g.date)) errs.push(`${w}: date must be YYYY-MM-DD`);
    if (g.status !== 'final') continue;
    if (!['W', 'L', 'T', 'OTL'].includes(g.result)) errs.push(`${w}: result must be W, L, T or OTL`);
    if (!Number.isInteger(g.gf) || !Number.isInteger(g.ga)) errs.push(`${w}: final game needs integer goals for/against`);
    else {
      const exp = g.gf > g.ga ? ['W'] : g.gf < g.ga ? ['L', 'OTL'] : ['T', 'W', 'L', 'OTL'];
      if (!exp.includes(g.result)) errs.push(`${w}: result ${g.result} contradicts score ${g.gf}-${g.ga}`);
      if (g.result === 'OTL' && !g.ot) warns.push(`${w}: OTL without OT/SO marked`);
      if (!g.forfeit && g.goals.length !== g.gf && !(g.ot === 'SO' && g.goals.length === g.gf - 1)) warns.push(`${w}: ${g.goals.length} goals logged but score says ${g.gf}`);
    }
    if (g.en_against != null && (!Number.isInteger(g.en_against) || g.en_against < 0 || g.en_against > g.ga)) errs.push(`${w}: empty-net goals against must be between 0 and ${g.ga}`);
    for (const p of g.roster || []) if (!P.has(p)) errs.push(`${w}: roster has unknown player "${p}"`);
    if (g.goalie && !P.has(g.goalie)) errs.push(`${w}: unknown goalie "${g.goalie}"`);
    const junk = Object.keys(g).filter(k => k.startsWith('_')); if (junk.length) errs.push(`${w}: has working fields that shouldn't be saved (${junk.join(', ')})`);
    if (g.lineup) {
      const lu = g.lineup, lp = lineupPlayers(lu);
      for (const [k, n, w2] of [['f', 4, 3], ['d', 3, 2]]) {
        if (!Array.isArray(lu[k]) || lu[k].length > n || lu[k].some(r => !Array.isArray(r) || r.length !== w2)) errs.push(`${w}: lineup ${k === 'f' ? 'forwards' : 'defense'} must be up to ${n} lines of ${w2}`);
      }
      if (!Array.isArray(lu.g) || lu.g.length > 2) errs.push(`${w}: lineup can have at most 2 goalies`);
      for (const p of lp) if (!P.has(p)) errs.push(`${w}: lineup has unknown player "${p}"`);
      const dup = lp.filter((p, i) => lp.indexOf(p) !== i); if (dup.length) errs.push(`${w}: ${[...new Set(dup)].join(', ')} is in the lineup more than once`);
      const rs = new Set(g.roster || []);
      if (lp.length !== rs.size || lp.some(p => !rs.has(p))) errs.push(`${w}: roster doesn't match the lineup`);
      const gs = (lu.g || []).filter(Boolean);
      if (gs.length && !gs.includes(g.goalie)) errs.push(`${w}: goalie of record must be one of the lineup's goalies`);
    }
    const ros = new Set(g.roster || []);
    for (const x of g.goals || []) {
      for (const k of ['scorer', 'a1', 'a2']) {
        const v = x[k]; if (!v) continue;
        if (!P.has(v)) errs.push(`${w}: goal ${k} "${v}" is not a known player`);
        else if (!ros.has(v)) errs.push(`${w}: ${k} ${v} is not in the game roster`);
      }
      if (x.a1 && (x.a1 === x.scorer || x.a1 === x.a2)) errs.push(`${w}: a player cannot assist their own goal or assist twice`);
      if (x.a2 && !x.a1) errs.push(`${w}: second assist without a first assist`);
      if (x.video && !/^https?:\/\//.test(x.video)) errs.push(`${w}: video link must start with http`);
    }
    const so = g.shootout;
    if (so) {
      if (g.ot !== 'SO') errs.push(`${w}: shootout stats entered but the game isn't marked as a shootout`);
      for (const p of so.goals || []) { if (!P.has(p)) errs.push(`${w}: shootout goal by unknown player "${p}"`); else if (!ros.has(p)) errs.push(`${w}: shootout scorer ${p} is not in the game roster`); }
      for (const p of so.misses || []) { if (!P.has(p)) errs.push(`${w}: shootout miss by unknown player "${p}"`); else if (!ros.has(p)) errs.push(`${w}: shootout shooter ${p} is not in the game roster`); }
      if (so.goalie && !P.has(so.goalie)) errs.push(`${w}: unknown shootout goalie "${so.goalie}"`);
      for (const k of ['saves', 'ga']) if (so[k] != null && (!Number.isInteger(so[k]) || so[k] < 0)) errs.push(`${w}: shootout ${k} must be a whole number`);
    }
    for (const a of g.assists_unpaired || []) if (!P.has(a)) errs.push(`${w}: assist "${a}" is not a known player`);
    for (const st of g.stars || []) if (st && !P.has(st)) warns.push(`${w}: star "${st}" is not a known player`);
    for (const p of g.penalties || []) if (!P.has(p.player)) errs.push(`${w}: penalty for unknown player "${p.player}"`);
  }
  for (const [code, name] of Object.entries(data.teams || {})) {
    if (!/^[A-Z]{2,4}$/.test(code)) errs.push(`Team ${code}: code must be 2-4 capital letters`);
    if (!String(name || '').trim()) errs.push(`Team ${code}: missing name`);
  }
  const names = Object.values(data.teams || {}).map(normName); const dupN = names.filter((n, i) => names.indexOf(n) !== i);
  if (dupN.length) errs.push(`Two teams have the same name (${dupN.join(', ')})`);
  for (const [code, c] of Object.entries(data.team_colors || {})) {
    if (!data.teams[code]) errs.push(`Team colors for unknown team ${code}`);
    if (!Array.isArray(c) || c.length !== 2 || c.some(x => !/^#[0-9a-f]{6}$/i.test(x))) errs.push(`Team ${code}: colors must be two #rrggbb values`);
  }
  for (const [code, src] of Object.entries(data.team_logos || {})) {
    if (!data.teams[code]) errs.push(`Logo for unknown team ${code}`);
    if (!/^img\/[\w./-]+\.(png|jpe?g|webp|svg)$/i.test(src) && !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(src)) errs.push(`Team ${code}: logo must be an img/ path or an uploaded image`);
    else if (src.length > 300000) errs.push(`Team ${code}: logo image is too large (re-upload it; it's shrunk automatically)`);
  }
  const seenAw = new Set();
  for (const a of data.awards || []) {
    const w = `Awards ${a.season}`;
    if (!S.has(a.season)) errs.push(`${w}: unknown season "${a.season}"`);
    if (seenAw.has(a.season)) errs.push(`${w}: listed twice`); seenAw.add(a.season);
    for (const k of ['presidents', 'stanley_keg', 'runner_up']) if (a[k] && !data.teams[a[k]]) errs.push(`${w}: unknown team "${a[k]}" for ${k}`);
    for (const k of ['art_ross', 'rocket']) { const x = a[k]; if (x?.team && !data.teams[x.team]) errs.push(`${w}: unknown team "${x.team}" for ${k}`); if (x?.value != null && !(Number.isInteger(x.value) && x.value >= 0)) errs.push(`${w}: ${k} total must be a whole number`); }
    if (a.stanley_keg && a.stanley_keg === a.runner_up) errs.push(`${w}: the Stanley Keg winner can't also be the runner-up`);
  }
  for (const [i, g] of (data.league_games || []).entries()) {
    const w = `League game ${g.season} #${i + 1}${g.home && g.away ? ` (${g.home} v ${g.away})` : ''}`;
    if (!S.has(g.season)) errs.push(`${w}: unknown season "${g.season}"`);
    for (const k of ['home', 'away']) if (g[k] && !data.teams[g[k]]) errs.push(`${w}: unknown team "${g[k]}"`);
    if (g.home && g.home === g.away) errs.push(`${w}: a team can't play itself`);
    if ((g.home_score == null) !== (g.away_score == null)) errs.push(`${w}: enter both scores or neither`);
    if (g.ot === 'OT' && lgFinal(g) && g.home_score === g.away_score) errs.push(`${w}: decided in overtime but the score is tied (a tied game after overtime goes to a shootout)`);
    if (g.date && !/^\d{4}-\d{2}-\d{2}$/.test(g.date)) errs.push(`${w}: date must be YYYY-MM-DD`);
    if (g.ot && !['OT', 'SO'].includes(g.ot)) errs.push(`${w}: "decided in" must be Regulation, OT or SO`);
  }
  return { errs, warns };
}

// ---------- formatting ----------
export const fmt = {
  rec: r => `${r.w}-${r.l}-${r.t + r.otl}`,
  rec4: r => `${r.w}-${r.l}-${r.t}-${r.otl}`,
  n2: v => (v == null || !isFinite(v)) ? '–' : v.toFixed(2),
  n3: v => (v == null || !isFinite(v)) ? '–' : v.toFixed(3).replace(/^0/, ''),
  date: d => { if (!d) return ''; const [y, m, dd] = d.split('-'); return `${+m}/${+dd}/${y.slice(2)}`; },
  // stored as 24-hour 'HH:MM'; shown as '10:05 PM'
  time: t => { if (!t) return ''; const [h, m] = t.split(':').map(Number); return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`; },
};

// Full names shown when hovering over abbreviated column headers (after a 1-second pause).
export const HEADER_TIPS = {
  GP: 'Games played', G: 'Goals', A: 'Assists', PTS: 'Points', Pts: 'Points', 'P/GP': 'Points per game', 'G/GP': 'Goals per game',
  PIM: 'Penalty minutes', W: 'Wins', L: 'Losses', T: 'Ties', OTL: 'Overtime and shootout losses', 'T/OTL': 'Ties and overtime/shootout losses',
  GF: 'Goals for', GA: 'Goals against', GAA: 'Goals-against average', 'SV%': 'Save percentage', SO: 'Shutouts',
  SF: 'Shots for', SA: 'Shots against', DIFF: 'Goal differential', Diff: 'Goal differential', 'Pt%': 'Points percentage (points ÷ points available)',
  Pos: 'Position', 'SO%': 'Shootout scoring percentage (goals ÷ attempts)', 'SO games': 'Shootout games', 'SO wins': 'Shootout wins',
  'Reg. W-L-T-OTL': 'Regular season: wins – losses – ties – overtime/shootout losses', 'Reg W-L-T-OTL': 'Regular season: wins – losses – ties – overtime/shootout losses',
  'W-L-T-OTL': 'Wins – losses – ties – overtime/shootout losses', 'Reg GF-GA': 'Regular season: goals for – goals against',
  'Playoff W-L-OTL': 'Playoffs: wins – losses – overtime/shootout losses', 'Playoff GP': 'Playoff games played', 'Playoff GF-GA': 'Playoffs: goals for – goals against',
  '⭐': 'Times named one of the three stars', '▶ G': 'Goals with a video', 'V': 'Visitor', 'H': 'Home',
};
// Career points-per-game leaderboard: minimum games played (3 full seasons of 14)
export const PPG_MIN_GP = 42;
export const normName = s => String(s || '').toLowerCase().replace(/&amp;/g, '&').replace(/[^a-z0-9]/g, '');
export const teamByName = (data, name) => { const n = normName(name); return n ? Object.keys(data.teams).find(k => normName(data.teams[k]) === n) || null : null; };

export function teamColor(data, code) { return (data.team_colors || {})[code] || ['#e9edf1', '#333f42']; }

// ---------- milestones ----------
// A potential milestone: within 3 of the next multiple of 25 (points: within 5). Multiples of 50 are `major`.
// Three variations: total (all seasons), regular season and playoffs. Regular/playoff splits only exist
// game by game from F24 on, except team wins, which the old sheets split all the way back.
const step = 25;
function near(value, within) { const target = (Math.floor(value / step) + 1) * step; const need = target - value; return need <= within ? { target, need, major: target % 50 === 0 } : null; }
function gameSplit(ix, pick) {
  const sk = {}, gk = {}, team = { g: 0, a: 0, w: 0 };
  for (const g of ix.data.games.filter(final)) {
    if (!pick(g)) continue;
    team.g += g.gf || 0; team.a += gameAssists(g).length; if (g.result === 'W') team.w++;
    for (const p of g.roster) {
      if (p === g.goalie) { const x = gk[p] ||= { gp: 0, w: 0 }; x.gp++; if (g.result === 'W') x.w++; continue; }
      if (isBackupGoalie(g, p)) continue;
      const x = sk[p] ||= { gp: 0, g: 0, a: 0, pts: 0, pen: 0 };
      x.gp++; const G = g.goals.filter(y => y.scorer === p).length, A = gameAssists(g).filter(y => y === p).length;
      x.g += G; x.a += A; x.pts += G + A;
    }
    for (const p of g.penalties || []) if (sk[p.player]) sk[p.player].pen += p.count;
  }
  return { sk, gk, team };
}
export const SPLITS = [
  { k: 'total', label: 'total' },
  { k: 'reg', label: 'regular season', since: 'F24' },
  { k: 'po', label: 'playoff', since: 'F24' },
];
const PSTATS = [
  { k: 'pts', label: 'points', within: 5, src: 'sk' }, { k: 'a', label: 'assists', within: 3, src: 'sk' },
  { k: 'gp', label: 'games', within: 3, src: 'sk' }, { k: 'pen', label: 'penalties', within: 3, src: 'sk' },
  { k: 'w', label: 'wins', within: 3, src: 'gk' }, { k: 'gp', label: 'goalie games', within: 3, src: 'gk' },
];
export function milestones(ix) {
  const out = { team: [], players: [] };
  const active = new Set((latestSeason(ix).roster || []).map(e => e.player));
  const car = careers(ix);
  const tot = { sk: Object.fromEntries(car.skaters.map(c => [c.player, c])), gk: Object.fromEntries(car.goalies.map(c => [c.player, c])) };
  const reg = gameSplit(ix, g => !g.playoff), po = gameSplit(ix, g => g.playoff);
  const src = { total: tot, reg, po };
  for (const sp of SPLITS) for (const m of PSTATS) for (const [pid, c] of Object.entries(src[sp.k][m.src])) {
    if (!active.has(pid)) continue;
    const n = near(c[m.k] || 0, m.within);
    if (n) out.players.push({ player: pid, stat: m.label, split: sp.k, splitLabel: sp.label, since: sp.since, value: c[m.k] || 0, ...n });
  }
  // team
  let tw = { total: 0, reg: 0, po: 0 }, tg = 0, ta = 0;
  for (const s of ix.seasons) {
    const r = teamRecord(ix, s); tw.reg += r.reg.w; tw.po += r.po.w;
    tg += r.computed ? r.reg.gf + r.po.gf : (r.gfAll || 0);
  }
  tw.total = tw.reg + tw.po; ta = car.skaters.reduce((n, c) => n + c.a, 0) + car.goalies.reduce((n, c) => n + (c.a || 0), 0);
  const T = [
    ['wins', 'total', tw.total], ['wins', 'reg', tw.reg], ['wins', 'po', tw.po],
    ['goals', 'total', tg], ['goals', 'reg', reg.team.g], ['goals', 'po', po.team.g],
    ['assists', 'total', ta], ['assists', 'reg', reg.team.a], ['assists', 'po', po.team.a],
  ];
  for (const [stat, split, v] of T) {
    const n = near(v, 3); const sp = SPLITS.find(s => s.k === split);
    if (n) out.team.push({ stat, split, splitLabel: sp.label, since: stat === 'wins' ? null : sp.since, value: v, ...n });
  }
  const ord = (a, b) => a.need - b.need || b.major - a.major || b.target - a.target;
  out.team.sort(ord); out.players.sort(ord);
  return out;
}

// ---------- shootouts (kept apart: never added to regular stats or team totals) ----------
export function shootoutTotals(ix) {
  const sk = {}, gk = {};
  for (const g of ix.data.games.filter(final)) {
    const so = g.shootout; if (!so) continue;
    const shooter = p => sk[p] ||= { player: p, g: 0, miss: 0, games: new Set() };
    for (const p of so.goals || []) { const x = shooter(p); x.g++; x.games.add(g.id); }
    for (const p of so.misses || []) { const x = shooter(p); x.miss++; x.games.add(g.id); }
    if (so.goalie) { const x = gk[so.goalie] ||= { player: so.goalie, gp: 0, saves: 0, ga: 0, w: 0 }; x.gp++; x.saves += so.saves || 0; x.ga += so.ga || 0; if (g.result === 'W') x.w++; }
  }
  return { skaters: Object.values(sk).map(x => ({ ...x, games: x.games.size, att: x.g + x.miss })), goalies: Object.values(gk) };
}
