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
    if (!g.roster.includes(pid) || g.goalie === pid) continue;
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
export function place(s) { return s.place ?? s.overview?.place ?? s.sheet_record?.place ?? null; }
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
