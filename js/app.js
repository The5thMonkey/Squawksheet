import * as TR from './trophies.js?v=522cee18c9';
import * as C from './core.js?v=522cee18c9';

const $app = document.getElementById('app');
let IX = null;
const TABLES = {};

// ---------- helpers ----------
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const P = id => IX.players[id];
const pname = id => P(id)?.name ?? id;
const plink = id => P(id) ? `<a href="#/player/${id}">${esc(pname(id))}</a>` : esc(id);
const tname = c => IX.teams[c] ?? c ?? '';
const tchip = (c, abbr = false) => { if (!c) return ''; const [bg, fg] = C.teamColor(IX.data, c); return `<span class="team" style="background:${bg};color:${fg}">${esc(abbr ? c : tname(c))}</span>`; };
const tlogoSrc = c => (IX.data.team_logos || {})[c];
const tlogo = (c, cls = 'tlogo') => tlogoSrc(c) ? `<img class="${cls}" src="${esc(tlogoSrc(c))}" alt="${esc(tname(c))} logo">` : `<span class="${cls} none" style="background:${C.teamColor(IX.data, c)[0]};color:${C.teamColor(IX.data, c)[1]}">${esc(c)}</span>`;
const slink = id => `<a href="#/season/${id}">${esc(IX.seasonById[id]?.name ?? id)}</a>`;
const glink = (g, label) => `<a href="#/game/${g.id}">${label}</a>`;
const resPill = g => g.status !== 'final' ? '<span class="pill T">—</span>' : `<span class="pill ${g.result}">${g.result}${g.ot && g.result !== 'OTL' ? ' ' + g.ot : g.result === 'OTL' && g.ot === 'SO' ? ' SO' : ''}</span>`;
const score = g => g.status === 'final' ? `${g.gf}–${g.ga}${g.forfeit ? ' <span class="pill T" title="Awarded by forfeit">FF</span>' : ''}` : 'scheduled';
const ppg = (p, gp) => gp ? p / gp : null;
const info = html => `<span class="info" tabindex="0" aria-label="More info">i<span class="tip">${html}</span></span>`;
// YouTube links play inside the site; anything else (e.g. Google Photos) opens in a new tab
const ytInfo = url => { try { const u = new URL(url); let id = null;
  if (u.hostname === 'youtu.be') id = u.pathname.slice(1).split('/')[0];
  else if (/(^|\.)youtube\.com$/.test(u.hostname)) id = u.searchParams.get('v') || (u.pathname.match(/\/(?:shorts|embed|live)\/([\w-]+)/) || [])[1];
  if (!id) return null; const t = u.searchParams.get('t') || u.searchParams.get('start') || '';
  const m = String(t).match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?$/); const start = m ? (+m[1] || 0) * 3600 + (+m[2] || 0) * 60 + (+m[3] || 0) : 0;
  return { id, start }; } catch { return null; } };
function openVideo(btn) {
  const li = btn.closest('[data-goal]'); const box = li?.querySelector('.vidbox'); if (!box) return;
  const open = !box.hidden;
  document.querySelectorAll('.vidbox').forEach(b => { b.hidden = true; b.innerHTML = ''; });
  document.querySelectorAll('.vidbtn.on').forEach(b => b.classList.remove('on'));
  if (open) return;
  const y = ytInfo(btn.dataset.url);
  box.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(y.id)}?autoplay=1&rel=0&playsinline=1${y.start ? '&start=' + y.start : ''}" title="Goal video" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe><a class="small" href="${esc(btn.dataset.url)}" target="_blank" rel="noopener">Open on YouTube ↗</a>`;
  box.hidden = false; btn.classList.add('on');
}
document.addEventListener('click', e => { const b = e.target.closest('.vidbtn'); if (b) { e.preventDefault(); openVideo(b); } });
const vidIcon = url => url ? `<a class="vid" href="${esc(url)}" target="_blank" rel="noopener" title="Goal video">▶</a>` : '';
const seasonBadge = s => s.tracking === 'game-log'
  ? `<span class="pill ver" title="Game-by-game log">game log</span>`
  : `<span class="pill unv" title="Season totals scraped from the old league site; not verifiable">unverified totals</span>`;

function table(id, cols, rows, sort, opts = {}) {
  TABLES[id] = { cols, rows, sort: TABLES[id]?.sort ?? sort, opts };
  return `<div class="tw" id="t-${id}">${renderTable(id)}</div>`;
}
function renderTable(id) {
  const { cols, rows, sort, opts } = TABLES[id];
  let rs = [...rows];
  if (sort) {
    const c = cols.find(c => c.k === sort.k);
    const v = c?.v || (r => r[sort.k]);
    rs.sort((a, b) => { const x = v(a), y = v(b); const nx = x == null || Number.isNaN(x), ny = y == null || Number.isNaN(y); if (nx && ny) return 0; if (nx) return 1; if (ny) return -1; return (x > y ? 1 : x < y ? -1 : 0) * (sort.asc ? 1 : -1); });
  }
  if (opts.limit) rs = rs.slice(0, opts.limit);
  const head = cols.map(c => `<th class="${c.l ? 'l ' : ''}${c.nosort ? '' : 'sort '}${sort?.k === c.k ? 'on' + (sort.asc ? ' asc' : '') : ''}" data-t="${id}" data-k="${c.k}" title="${esc(c.title || '')}">${c.h}</th>`).join('');
  const body = rs.map((r, i) => `<tr${r._cls ? ` class="${r._cls}"` : ''}>${cols.map(c => `<td class="${c.l ? 'l' : ''} ${c.cls || ''}">${c.f ? c.f(r, i) : (r[c.k] ?? '')}</td>`).join('')}</tr>`).join('');
  const foot = opts.total ? `<tr class="tot">${cols.map(c => `<td class="${c.l ? 'l' : ''}">${opts.total[c.k] ?? ''}</td>`).join('')}</tr>` : '';
  return `<table><thead><tr>${head}</tr></thead><tbody>${body || `<tr><td class="l muted" colspan="${cols.length}">Nothing here yet.</td></tr>`}${foot}</tbody></table>`;
}
document.addEventListener('click', e => {
  const th = e.target.closest('th.sort'); if (!th) return;
  const t = TABLES[th.dataset.t]; const k = th.dataset.k;
  t.sort = t.sort?.k === k ? { k, asc: !t.sort.asc } : { k, asc: false };
  document.getElementById('t-' + th.dataset.t).innerHTML = renderTable(th.dataset.t);
});

function seasonSummary(s) {
  const rec = C.teamRecord(IX, s);
  const all = { w: rec.reg.w + rec.po.w, l: rec.reg.l + rec.po.l, t: rec.reg.t + rec.po.t, otl: rec.reg.otl + rec.po.otl };
  const gf = rec.computed ? rec.reg.gf + rec.po.gf : rec.gfAll, ga = rec.computed ? rec.reg.ga + rec.po.ga : rec.gaAll;
  // points leader & cup leader computed from lines
  const lines = [];
  const pids = new Set((s.roster || []).map(e => e.player));
  for (const g of IX.gamesBySeason[s.id] || []) for (const p of g.roster) pids.add(p);
  for (const pid of pids) { const l = C.skaterSeasonLine(IX, s, pid); if (l) lines.push({ pid, ...l }); const gl = C.goalieSeasonLine(IX, s, pid); if (gl?.cup) lines.push({ pid, pts: -1, cup: gl.cup }); }
  const top = (k) => { const m = Math.max(...lines.map(l => l[k] ?? 0)); return m > 0 ? { v: m, who: lines.filter(l => l[k] === m).map(l => l.pid) } : null; };
  return { s, rec, all, gf, ga, pl: top('pts'), cup: s.tracking === 'game-log' ? top('cup') : null };
}
const whoList = t => t ? t.who.map(plink).join(' / ') + ` <span class="muted">(${t.v})</span>` : '<span class="muted">–</span>';

// ---------- pages ----------
function pageHome() {
  const S = IX.seasons;
  const sums = S.map(seasonSummary);
  const tot = sums.reduce((a, x) => ({ w: a.w + x.all.w, l: a.l + x.all.l, t: a.t + x.all.t, otl: a.otl + x.all.otl }), { w: 0, l: 0, t: 0, otl: 0 });
  const champs = S.filter(s => s.champion), pres = S.filter(s => s.presidents);
  const cur = C.latestSeason(IX); const cs = seasonSummary(cur);
  const cg = IX.gamesBySeason[cur.id] || [];
  const last = [...cg].reverse().find(C.final), next = cg.find(g => g.status !== 'final');
  const car = C.careers(IX);
  const lead = (k, n = 5) => [...car.skaters].sort((a, b) => b[k] - a[k]).slice(0, n).map((c, i) => `<tr><td class="l">${i + 1}. ${plink(c.player)}</td><td>${c[k]}</td></tr>`).join('');
  return `
  <section class="hero"><div class="hero-id"><img class="hero-logo" src="img/logos/alternate.png" alt=""><div><h1>WinterSquawks</h1><div class="sub">All-time ${tot.w}-${tot.l}-${tot.t}-${tot.otl} ${info('W-L-T-OTL, regular season and playoffs combined, Winter 2022 onward.')}</div></div></div>
  <div class="trophies stacked">${champs.length ? `<div title="Stanley Keg championships">${'🏆'.repeat(champs.length)}</div>` : ''}${pres.length ? `<div title="President's Trophies">${'🥇'.repeat(pres.length)}</div>` : ''}</div></section>
  <div class="grid g4">
    <div class="stat"><div class="k">Stanley Kegs</div><div class="v">${champs.length}</div><div class="s">${champs.map(s => slink(s.id)).join(', ')}</div></div>
    <div class="stat"><div class="k">President's Trophies</div><div class="v">${pres.length}</div><div class="s">${pres.map(s => slink(s.id)).join(', ')}</div></div>
    <div class="stat"><div class="k">Seasons</div><div class="v">${S.length}</div><div class="s">${IX.seasons[0].name} – ${cur.name}</div></div>
    <div class="stat"><div class="k">Games played</div><div class="v">${sums.reduce((a, x) => a + x.rec.reg.gp + x.rec.po.gp, 0)}</div><div class="s">${IX.data.games.filter(C.final).length} with game logs ${info('Every game, lineup, goal and three stars is logged from Fall 2024 on. Earlier seasons only have season totals.')}</div></div>
  </div>
  <div class="grid g2">
    <div class="card"><h2 style="margin-top:0">${esc(cur.name)} ${seasonBadge(cur)}</h2>
      <div class="kv"><dt>Record</dt><dd>${C.fmt.rec4(cs.rec.reg)} (W-L-T-OTL) · ${C.points(IX.data, cs.rec.reg)} pts${C.place(cur, IX.data) ? ' · ' + ordinal(C.place(cur, IX.data)) + ' place' : ''}</dd>
      <dt>Last game</dt><dd>${last ? `${glink(last, `${C.fmt.date(last.date)} vs ${tchip(last.opponent)}`)} ${resPill(last)} ${score(last)}` : '–'}</dd>
      <dt><span class="hovertip" tabindex="0">Next game ⓘ<span class="tip wide">${milestoneHtml()}</span></span></dt><dd>${next ? `${C.fmt.date(next.date)} ${C.fmt.time(next.time)} vs ${tchip(next.opponent)}` : '–'}</dd>
      <dt>Points leader</dt><dd>${whoList(cs.pl)}</dd><dt>Squawk 🏆 leader</dt><dd>${whoList(cs.cup)}</dd></div>
      <h3 style="margin-top:1rem">Recent games</h3>
      <div class="tw"><table><tbody>${cg.filter(C.final).slice(-6).reverse().map(g => `<tr><td class="l">${glink(g, C.fmt.date(g.date))}</td><td class="l">${tchip(g.opponent)}</td><td>${resPill(g)}</td><td>${score(g)}</td><td class="l small">${g.stars[0] ? '⭐ ' + esc(pname(g.stars[0])) : ''}</td></tr>`).join('')}</tbody></table></div>
      <p><a href="#/season/${cur.id}">Full season page →</a></p></div>
    <div class="card"><h2 style="margin-top:0">All-time leaders</h2>
      <div class="grid leaders"><table><tbody><tr><th class="l">Points</th><th></th></tr>${lead('pts')}</tbody></table>
      <table><tbody><tr><th class="l">Goals</th><th></th></tr>${lead('g')}</tbody></table>
      <table><tbody><tr><th class="l">Squawk 🏆 ${info('Three-stars points (4 / 2 / 1). Tracked from Fall 2024 on.')}</th><th></th></tr>${lead('cup')}</tbody></table>
      <div class="goons"><table><tbody><tr><th class="l">👊 Goons</th><th>PIM</th></tr>${lead('pim')}</tbody></table></div></div></div>
  </div>
  <h2>Season by season</h2>${seasonsTable('home')}`;
}
function milestoneHtml() {
  const ms = C.milestones(IX);
  const one = (n, stat) => n === 1 ? stat.replace(/ies$/, 'y').replace(/s$/, '') : stat;
  const sl = m => m.split === 'total' ? '' : ` ${m.splitLabel}${m.since ? '*' : ''}`;
  const li = (m, who) => `<li class="${m.major ? 'major' : ''}">${who}: ${m.need} ${one(m.need, m.stat)} from ${m.target}${sl(m)} ${m.stat} <span class="muted">(${m.value})</span></li>`;
  const team = ms.team.length ? `<ul class="ms">${ms.team.map(m => li(m, 'Team')).join('')}</ul>` : '<p class="muted">None close right now.</p>';
  const pl = ms.players.length ? `<ul class="ms">${ms.players.map(m => li(m, esc(pname(m.player)))).join('')}</ul>` : '<p class="muted">None close right now.</p>';
  return `<b>Milestones watch</b><br><b>Team</b>${team}<b>Players</b>${pl}<span class="muted small">Within 3 of the next 25 (player points: within 5). Bold = a multiple of 50. * Regular season / playoff splits count from F24 on (team wins go back to W22). Penalties count from F25.</span>`;
}
function shootoutBlock(g) {
  if (g.forfeit) return `<p class="small"><span class="pill T">Forfeit</span> ${tchip(g.opponent)} forfeited; awarded ${g.gf}–${g.ga}. No scorer is credited.</p>`;
  if (g.ot !== 'SO') return '';
  const so = g.shootout;
  if (!so) return `<h3 style="margin-top:1rem">Shootout ${info('Shootout stats are kept separately and never count toward regular totals.')}</h3><p class="muted">No shootout stats recorded.</p>`;
  return `<h3 style="margin-top:1rem">Shootout ${info('Shootout stats are kept separately and never count toward regular totals.')}</h3>
    <p>Goals: ${(so.goals || []).length ? so.goals.map(plink).join(', ') : '<span class="muted">none</span>'}${so.goalie ? `<br>🥅 ${plink(so.goalie)}: ${so.saves ?? 0} saves, ${so.ga ?? 0} goals allowed` : ''}</p>`;
}
function shootoutTables(filt) {
  const so = C.shootoutTotals(IX);
  const nm = { k: 'name', h: 'Player', l: 1, f: c => plink(c.player), v: c => pname(c.player) };
  return `<p class="small">${info('Shootout stats started being tracked after the old sheets. They are kept on their own and never added to goals, points, wins or team totals.')}</p>
  <h2>Shooters</h2>${table('so-sk', [nm, { k: 'games', h: 'SO games' }, { k: 'att', h: 'Attempts' }, { k: 'g', h: 'Goals' }, { k: 'miss', h: 'Misses' }, { k: 'pct', h: 'SO%', f: c => c.att ? C.fmt.n3(c.g / c.att) : '–', v: c => c.att ? c.g / c.att : null, title: 'Shootout goals ÷ attempts' }], filt(so.skaters), { k: 'g', asc: false })}
  <h2>Goalies</h2>${table('so-gk', [nm, { k: 'gp', h: 'SO games' }, { k: 'w', h: 'SO wins' }, { k: 'saves', h: 'Saves' }, { k: 'ga', h: 'Goals allowed' },
    { k: 'sv', h: 'SV%', f: c => (c.saves + c.ga) ? C.fmt.n3(c.saves / (c.saves + c.ga)) : '–', v: c => (c.saves + c.ga) ? c.saves / (c.saves + c.ga) : null }], filt(so.goalies), { k: 'gp', asc: false })}`;
}
const ordinal = n => n + (['th', 'st', 'nd', 'rd'][(n % 100 - 20) % 10] || ['th', 'st', 'nd', 'rd'][n % 100] || 'th');

function seasonsTable(id) {
  const rows = [...IX.seasons].reverse().map(seasonSummary);
  return table(id, [
    { k: 'season', h: 'Season', l: 1, f: x => slink(x.s.id), v: x => x.s.year * 10 + C.TERM_ORDER[x.s.id[0]] },
    { k: 'place', h: 'Place', f: x => C.place(x.s, IX.data) ?? '', v: x => C.place(x.s, IX.data) },
    { k: 'gp', h: 'GP', f: x => x.rec.reg.gp + x.rec.po.gp, v: x => x.rec.reg.gp + x.rec.po.gp, title: 'Regular season + playoffs' },
    { k: 'rec', h: 'Reg. W-L-T-OTL', f: x => C.fmt.rec4(x.rec.reg), nosort: 1 },
    { k: 'pts', h: 'Pts', f: x => C.points(IX.data, x.rec.reg), v: x => C.points(IX.data, x.rec.reg), title: '2 per win, 1 per tie/OTL' },
    { k: 'po', h: 'Playoffs', f: x => x.rec.po.gp ? `${x.rec.po.w}-${x.rec.po.l}${x.rec.po.otl ? '-' + x.rec.po.otl : ''}` : '–', nosort: 1 },
    { k: 'gf', h: 'GF', f: x => x.gf ?? '–', v: x => x.gf }, { k: 'ga', h: 'GA', f: x => x.ga ?? '–', v: x => x.ga },
    { k: 'dif', h: 'Diff', f: x => x.gf != null && x.ga != null ? (x.gf - x.ga > 0 ? '+' : '') + (x.gf - x.ga) : '–', v: x => x.gf - x.ga },
    { k: 'pl', h: 'Points leader', l: 1, f: x => whoList(x.pl), nosort: 1 },
    { k: 'cup', h: 'Squawk 🏆', l: 1, f: x => x.cup ? whoList(x.cup) : '<span class="muted">–</span>', nosort: 1 },
    { k: 'res', h: 'Result', l: 1, cls: 'wrap', f: x => `${x.s.champion ? '<span class="pill champ">🏆 Champions</span> ' : ''}${x.s.presidents ? '<span class="pill champ">🥇</span> ' : ''}${esc(x.s.champion ? '' : x.s.result || '')}`, nosort: 1 },
  ], rows, null);
}
function pageSeasons() {
  return `<h1>Seasons ${info('Goals for/against before Fall 2024 are the old Overview totals and include playoffs. Points: 2 per win, 1 per tie or OT/SO loss.')}</h1>${seasonsTable('seasons')}`;
}

// Stanley Keg winner (left) and President's Trophy winner (right), in the Keg winner's colors
function winnersBand(s) {
  const a = (IX.data.awards || []).find(x => x.season === s.id);
  if (!a || !(a.stanley_keg || a.presidents)) return '';
  const [bg, fg] = C.teamColor(IX.data, a.stanley_keg || a.presidents);
  const sst = C.seasonStandings(IX.data, s);
  const rec = c => { const r = sst.find(x => x.team === c); if (!r) return '';
    const pos = sst.indexOf(r) + 1;
    return `${r.w != null ? `${r.w}-${r.l}-${r.t_otl ?? 0} · ` : ''}${r.pts} pts · ${ordinal(pos)} in standings`; };
  const logo = c => c === 'WSQ' ? '<img class="tlogo lg wsq" src="img/logos/secondary.png" alt="WinterSquawks logo">' : tlogo(c, 'tlogo lg');
  const side = (c, trophy, label, extra, right) => c ? `<div class="wb-side${right ? ' r' : ''}">${logo(c)}<div>
    <div class="wb-label">${trophy} ${label}</div><div class="wb-team">${esc(tname(c))}</div><div class="wb-info">${rec(c)}${extra ? `<br>${extra}` : ''}</div></div></div>` : '<div></div>';
  const final = a.runner_up ? `Beat ${esc(tname(a.runner_up))} in the final` : '';
  return `<section class="winners" style="--wb-bg:${bg};--wb-fg:${fg}">
    ${side(a.stanley_keg, '🏆', 'Stanley Keg', final, false)}
    ${side(a.presidents, '🥇', "President's Trophy", 'Regular-season champions', true)}</section>`;
}
function pageSeason(id) {
  const s = IX.seasonById[id]; if (!s) return notFound();
  const x = seasonSummary(s); const gs = IX.gamesBySeason[id] || [];
  const i = IX.seasons.indexOf(s), prev = IX.seasons[i - 1], next = IX.seasons[i + 1];
  const pids = new Set((s.roster || []).map(e => e.player)); for (const g of gs) for (const p of g.roster) pids.add(p);
  const sk = [], gk = [];
  for (const pid of pids) { const l = C.skaterSeasonLine(IX, s, pid); if (l && (l.gp || l.g || l.a)) sk.push({ pid, ...l }); const gl = C.goalieSeasonLine(IX, s, pid); if (gl) gk.push({ pid, ...gl }); }
  const tracked = s.tracking === 'game-log';
  const ver = C.verification(IX, s);
  const skCols = [
    { k: 'name', h: 'Skater', l: 1, f: r => `${plink(r.pid)}${r.tags?.length ? ` <span class="muted small">(${esc(r.tags.join(', '))})</span>` : ''}`, v: r => pname(r.pid) },
    { k: 'number', h: '#', f: r => r.number ?? '', v: r => +r.number }, { k: 'pos', h: 'Pos', f: r => r.pos ?? '' },
    { k: 'gp', h: 'GP' }, { k: 'g', h: 'G' }, { k: 'a', h: 'A' }, { k: 'pts', h: 'PTS' },
    { k: 'ppg', h: 'P/GP', f: r => C.fmt.n2(ppg(r.pts, r.gp)), v: r => ppg(r.pts, r.gp) },
    ...(tracked ? [{ k: 'cup', h: 'Squawk 🏆', title: 'Three-stars points' }, { k: 'pim', h: 'PIM' }, { k: 'vg', h: '▶ G', title: 'Goals with a video link' }] : []),
  ];
  const tot = { name: 'Team', gp: '', g: sk.reduce((a, r) => a + r.g, 0), a: sk.reduce((a, r) => a + r.a, 0) }; tot.pts = tot.g + tot.a;
  const gkCols = [
    { k: 'name', h: 'Goalie', l: 1, f: r => `${plink(r.pid)}${r.tags?.length ? ` <span class="muted small">(${esc(r.tags.join(', '))})</span>` : ''}`, v: r => pname(r.pid) },
    { k: 'gp', h: 'GP' }, { k: 'w', h: 'W' }, ...(tracked ? [{ k: 'l', h: 'L' }, { k: 't', h: 'T' }, { k: 'otl', h: 'OTL' }] : []),
    { k: 'ga', h: 'GA' }, { k: 'gaa', h: 'GAA', f: r => C.fmt.n2(r.gp ? r.ga / r.gp : null), v: r => r.gp ? r.ga / r.gp : null },
    ...(tracked ? [{ k: 'so', h: 'SO' }, { k: 'sv', h: 'SV%', f: r => r.sa ? C.fmt.n3(1 - r.gaS / r.sa) : '–', v: r => r.sa ? 1 - r.gaS / r.sa : null, title: 'Only games with shot data' }, { k: 'cup', h: 'Squawk 🏆' }] : []),
  ];
  const gameCols = [
    { k: 'date', h: 'Date', l: 1, f: g => glink(g, C.fmt.date(g.date) || '–') }, { k: 'time', h: 'Time', f: g => C.fmt.time(g.time), v: g => g.time || '' },
    { k: 'opp', h: 'Opponent', l: 1, f: g => tchip(g.opponent) + (g.playoff ? ` <span class="pill champ">${g.championship ? 'Final' : 'Playoff'}</span>` : '') },
    { k: 'res', h: 'Result', f: g => resPill(g) }, { k: 'score', h: 'Score', f: g => glink(g, score(g)) },
    { k: 'sh', h: 'Shots', f: g => g.shots_for != null ? `${g.shots_for}–${g.shots_against}` : '' },
    { k: 'gs', h: 'Goals', l: 1, f: g => g.goals.map(x => `${esc(initials(x.scorer, g.season))}${x.video ? '<span class="vid">▶</span>' : ''}`).join(' ') },
    { k: 'st', h: '⭐ Stars', l: 1, f: g => g.stars.filter(Boolean).map(p => esc(pname(p).split(' ').pop())).join(', ') },
  ];
  const st = C.seasonStandings(IX.data, s), live = !!s.standings_from_games;
  const stCols = live ? [{ k: 'rk', h: '#', f: r => st.indexOf(r) + 1, v: r => st.indexOf(r) }, { k: 'team', h: 'Team', l: 1, f: r => r.team === 'WSQ' ? tchip(r.team) : `<a class="tl" href="#/team/${esc(r.team)}">${tchip(r.team)}</a>`, v: r => tname(r.team) },
      { k: 'gp', h: 'GP' }, { k: 'w', h: 'W' }, { k: 'l', h: 'L' }, { k: 't', h: 'T' }, { k: 'otl', h: 'OTL', title: 'Overtime and shootout losses' }, { k: 'pts', h: 'PTS' },
      { k: 'gf', h: 'GF' }, { k: 'ga', h: 'GA' }, { k: 'diff', h: 'DIFF', f: r => (r.gf - r.ga > 0 ? '+' : '') + (r.gf - r.ga), v: r => r.gf - r.ga },
      ...(st.some(r => r.shots) ? [{ k: 'sf', h: 'SF', title: 'Shots for' }, { k: 'sa', h: 'SA', title: 'Shots against' }] : [])]
    : [{ k: 'team', h: 'Team', l: 1, f: r => tchip(r.team) },
    ...['w', 'l', 't_otl', 'pts', 'gp', 'gf', 'ga'].filter(k => st.some(r => r[k] != null)).map(k => ({ k, h: { w: 'W', l: 'L', t_otl: 'T/OTL', pts: 'PTS', gp: 'GP', gf: 'GF', ga: 'GA' }[k], f: r => r[k] ?? '' }))];
  return `
  <p class="small">${prev ? `<a href="#/season/${prev.id}">← ${esc(prev.name)}</a>` : ''} ${next ? ` · <a href="#/season/${next.id}">${esc(next.name)} →</a>` : ''}</p>
  <section class="hero"><div class="hero-id"><img class="hero-logo" src="img/logos/alternate.png" alt=""><div><h1>${esc(s.name)}</h1><div class="sub">${esc(s.team_name)} · ${esc(s.division)} ${seasonBadge(s)} ${tracked ? info(`${ver.video_linked} of ${ver.goals} goals have a video link (▶). The links are kept for reference; the video tracking site is no longer online.`) : info("Season totals scraped by hand from the old league site, which no longer exists. They can't be checked game by game.")}</div>
  ${s.story_title ? `<div class="sub" style="margin-top:.4rem"><i>${esc(s.story_title)}</i></div>` : ''}</div></div>
  <div style="text-align:right"><div class="big">${C.fmt.rec4(x.rec.reg)}</div><div class="sub">W-L-T-OTL · ${C.points(IX.data, x.rec.reg)} pts${C.place(s, IX.data) ? ' · ' + ordinal(C.place(s, IX.data)) : ''}</div>
  <div class="sub">${s.champion ? '🏆 STANLEY KEG CHAMPIONS' : esc(s.result || '')}${s.presidents ? ' · 🥇 President\'s Trophy' : ''}</div></div></section>
  ${winnersBand(s)}
  <h2>Skaters</h2>${table('sk-' + id, skCols, sk, { k: 'pts', asc: false }, { total: tot })}
  <h2>Goalies</h2>${table('gk-' + id, gkCols, gk, { k: 'gp', asc: false })}
  ${gs.length ? `<h2>Games</h2>${table('gm-' + id, gameCols, gs, null)}` : ''}
  ${st.length ? `<h2>Division standings ${info(live ? 'Worked out from every game in the division: the Squawks\' games from the game log, the rest from the league games entered on the stats page. 2 points for a win, 1 for a tie or an overtime/shootout loss.' : 'Snapshot copied from the season tab.')}</h2>${table('st-' + id, stCols, st, null)}` : ''}
  ${leadersBlock(s)}
  ${storyBlock(s)}`;
}
function initials(pid, sid) { const p = P(pid); if (!p) return pid; return p.initials?.[sid] || p.name.split(' ').map(w => w[0]).join(''); }
function leadersBlock(s) {
  const L = s.leaders || {}; if (!L.art_ross?.length && !L.rocket?.length) return '';
  const li = arr => arr.map(x => `<tr><td class="l">${esc(x.name)}</td><td class="l">${tchip(x.team)}</td><td>${x.value ?? ''}</td></tr>`).join('');
  return `<h2>League leaders</h2><div class="grid g2"><div class="tw"><table><thead><tr><th class="l">Art Ross (points)</th><th class="l">Team</th><th>PTS</th></tr></thead><tbody>${li(L.art_ross || [])}</tbody></table></div>
  <div class="tw"><table><thead><tr><th class="l">"Rocket" Richard (goals)</th><th class="l">Team</th><th>G</th></tr></thead><tbody>${li(L.rocket || [])}</tbody></table></div></div>`;
}
function storyBlock(s) {
  if (!s.story?.length) return '';
  // group by row so multi-column media grids read naturally
  const rows = {}; for (const l of s.story) (rows[l.row] ||= []).push(l);
  const html = Object.values(rows).map(cells => `<p>${cells.map(c => c.link ? `<a href="${esc(c.link)}" target="_blank" rel="noopener">${esc(c.text)}</a>` : esc(c.text)).join(' <span class="l">·</span> ')}</p>`).join('');
  return `<h2>Story of the season</h2><div class="card story">${html.replace(/\n/g, '<br>')}</div>`;
}

// The season-story blurb for a game, laid out as the front page of a sports section
function newspaper(g, s, tale) {
  const opp = tname(g.opponent).toUpperCase(), sc = `${g.gf}–${g.ga}`;
  const extra = g.ot === 'SO' ? ' IN A SHOOTOUT' : g.ot ? ' IN OVERTIME' : '';
  const won = g.status === 'final' && g.result === 'W', po = !!g.playoff, champ = po && g.championship;
  const title = champ && won;   // won the Stanley Keg
  const head = g.status !== 'final' ? `SQUAWKS VS. ${opp}`
    : title ? 'SQUAWKS WIN THE STANLEY KEG!'
    : won ? `SQUAWKS BEAT ${opp} ${sc}${extra}${po ? '!' : ''}`
    : g.result === 'T' ? `SQUAWKS, ${opp} SKATE TO ${sc} TIE`
    : `SQUAWKS FALL TO ${opp} ${sc}${extra}`;
  const kicker = champ ? 'Championship Final' : po ? 'Playoffs' : 'Regular Season';
  const stars = g.stars[0] ? `${esc(pname(g.stars[0]))} named first star${g.stars[1] ? `; ${esc(pname(g.stars[1]))} and ${g.stars[2] ? esc(pname(g.stars[2])) : '–'} round out the three` : ''}` : '';
  const deck = title ? `Beat ${esc(tname(g.opponent))} ${sc}${extra.toLowerCase()} in the final${stars ? ' · ' + stars : ''}` : stars;
  const d = g.date ? new Date(g.date + 'T12:00:00') : null;
  const dateline = d ? d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '';
  // drop the "5/8 Drunken Masters:" lead-in the season story uses
  const body = tale.map(l => esc(l.text.replace(/^\s*(?:[^\d:]{1,40}?\s)?\d{1,2}\/\d{1,2}(?:\/\d{2,4})?(?:\s+[^:\-–\d]{1,40}?)?\s*[:\-–]\s*/, '')));
  const watch = tale.filter(l => l.link).map(l => ytInfo(l.link) ? `<button class="vidbtn" data-url="${esc(l.link)}">▶ Watch the game</button>` : `<a href="${esc(l.link)}" target="_blank" rel="noopener">▶ Watch the game ↗</a>`).join(' ');
  const strap = title ? '★ Championship Extra ★' : champ ? 'Championship Edition' : po && won ? '★ Playoff Extra ★' : po ? 'Playoff Edition' : '';
  const photo = g.photo?.src ? `<figure class="np-photo"><img src="${esc(g.photo.src)}" alt="${esc(g.photo.caption || 'Championship photo')}" loading="lazy"><figcaption>${esc(g.photo.caption || '')}</figcaption></figure>` : '';
  const cls = ['paper', po && 'po', won && 'won', champ && 'champ', title && 'title'].filter(Boolean).join(' ');
  return `<article class="${cls}" data-goal="paper">
    ${po && won ? '<div class="confetti" aria-hidden="true"></div>' : ''}
    <header class="mh"><div class="mh-meta"><span>${esc(s.name)}</span><span>${esc(dateline)}</span><span>${esc(s.division)}</span></div>
      ${strap ? `<div class="np-strap">${strap}</div>` : ''}
      <div class="mh-name">The Beer League Telegraph<span>(ed Pass)</span></div>
      <div class="mh-sec"><span>Sports</span></div></header>
    <div class="np-kicker">${kicker}</div>
    <h3 class="np-head">${head}</h3>
    ${title ? `<div class="np-score">${esc(tname('WSQ'))} ${g.gf} <span>·</span> ${esc(tname(g.opponent))} ${g.ga}</div>` : ''}
    ${deck ? `<div class="np-deck">${deck}</div>` : ''}
    ${photo}
    ${body.length ? `<div class="np-body${body.join('').length < 260 ? ' short' : ''}">${body.map((t, k) => `<p${k === 0 ? ' class="lede"' : ''}>${t}</p>`).join('')}</div>` : ''}
    ${watch ? `<div class="np-watch">${watch}</div>` : ''}<div class="vidbox" hidden></div>
  </article>`;
}
// A game's lines, laid out like a lineup card: forward lines, defense pairs, goalies
function lineupCard(g) {
  const lu = g.lineup; if (!lu) return '';
  const num = p => { const e = (IX.seasonById[g.season]?.roster || []).find(x => x.player === p); return e?.number ?? IX.players[p]?.number ?? ''; };
  const slot = (p, pos, extra = '') => p ? `<a class="lu-p${extra}" href="#/player/${esc(p)}"><span class="lu-pos">${pos}</span><span class="lu-num">${num(p) !== '' ? '#' + esc(num(p)) : ''}</span><span class="lu-name">${esc(pname(p))}</span></a>`
    : `<div class="lu-p empty"><span class="lu-pos">${pos}</span><span class="lu-name">—</span></div>`;
  const ord = ['1st', '2nd', '3rd', '4th'];
  const rows = (lines, pos, label) => lines.map((l, i) => l.some(Boolean) ? `<div class="lu-row"><div class="lu-lab">${ord[i]} ${label}</div><div class="lu-slots n${pos.length}">${l.map((p, k) => slot(p, pos[k])).join('')}</div></div>` : '').join('');
  const gs = (lu.g || []).filter(Boolean);
  return `<h2>Lineup</h2><div class="lineup">
    <div class="lu-group"><div class="lu-head">Forwards</div>${rows(lu.f || [], ['LW', 'C', 'RW'], 'line')}</div>
    <div class="lu-group"><div class="lu-head">Defense</div>${rows(lu.d || [], ['LD', 'RD'], 'pair')}</div>
    <div class="lu-group"><div class="lu-head">Goalies</div><div class="lu-row"><div class="lu-lab"></div><div class="lu-slots goalies">${gs.map(p => slot(p, 'G', p === g.goalie && gs.length > 1 ? ' rec' : '')).join('')}</div></div>
      ${gs.length > 1 && g.goalie ? `<p class="small muted lu-note">★ Goalie of record: ${esc(pname(g.goalie))} (credited with the result, goals against and any shutout)</p>` : ''}</div>
  </div>`;
}
function pageGame(id) {
  const g = IX.data.games.find(x => x.id === id); if (!g) return notFound();
  const s = IX.seasonById[g.season]; const gs = IX.gamesBySeason[g.season]; const i = gs.indexOf(g);
  const paired = g.goals.some(x => x.a1);
  const goals = g.goals.map((x, k) => `<li data-goal="${k}" id="goal-${k}">${k + 1}. <b>${plink(x.scorer)}</b>${x.a1 ? ` <span class="muted">from ${plink(x.a1)}${x.a2 ? ', ' + plink(x.a2) : ''}</span>` : ''} ${!x.video ? '<span class="muted small">no video</span>' : ytInfo(x.video) ? `<button class="vidbtn" data-url="${esc(x.video)}">▶ video</button>` : `<a href="${esc(x.video)}" target="_blank" rel="noopener" title="Opens in a new tab">▶ video ↗</a>`}<div class="vidbox" hidden></div></li>`).join('');
  const [m, d] = g.date ? [+g.date.slice(5, 7), +g.date.slice(8, 10)] : [0, 0];
  const tale = (s.story || []).filter(l => new RegExp(`(^|\\D)${m}/${d}(\\D|$)`).test(l.text));
  const stars = ['1st', '2nd', '3rd'];
  return `<p class="small"><a href="#/season/${s.id}">← ${esc(s.name)}</a>${gs[i - 1] ? ` · <a href="#/game/${gs[i - 1].id}">previous game</a>` : ''}${gs[i + 1] ? ` · <a href="#/game/${gs[i + 1].id}">next game</a>` : ''}</p>
  <section class="hero matchup">
    <div class="mu-team"><img class="mu-logo" src="img/logos/secondary.png" alt="WinterSquawks logo"><div class="mu-name">${esc(tname('WSQ'))}</div></div>
    <div class="mu-mid"><div class="big">${score(g)}</div><div>${resPill(g)}</div>${g.shots_for != null ? `<div class="sub">Shots ${g.shots_for}–${g.shots_against}</div>` : ''}
      <div class="sub">${C.fmt.date(g.date)} ${C.fmt.time(g.time)}</div><div class="sub">${g.playoff ? (g.championship ? 'Championship' : 'Playoffs') : 'Regular season'}</div></div>
    <a class="mu-team r" href="#/team/${esc(g.opponent)}">${tlogo(g.opponent, 'mu-logo')}<div class="mu-name">${tchip(g.opponent)}</div></a>
  </section>
  <div class="grid g2">
    <div class="card"><h3>Goals</h3>${goals ? `<ul class="goal-list">${goals}</ul>` : '<p class="muted">No goals logged.</p>'}
      ${g.assists_unpaired?.length ? `<h3 style="margin-top:1rem">Assists ${info("The old sheet didn't record which goal each assist went with.")}</h3><p>${g.assists_unpaired.map(plink).join(', ')}</p>` : ''}
      ${!paired && !g.assists_unpaired?.length && g.goals.length ? '<p class="muted small">No assists recorded.</p>' : ''}</div>
    <div class="card"><h3>Three stars</h3>${g.stars.some(Boolean) ? g.stars.map((p, k) => p ? `<div>⭐ ${stars[k]}: ${plink(p)}</div>` : '').join('') : '<p class="muted">–</p>'}
      ${shootoutBlock(g)}
      ${g.lineup ? '' : `<h3 style="margin-top:1rem">Lineup</h3><p>${g.goalie ? `🥅 ${plink(g.goalie)} · ` : ''}${g.roster.filter(p => p !== g.goalie).map(plink).join(', ') || '<span class="muted">not recorded</span>'}</p>`}
      ${g.penalties?.length ? `<h3>Penalties</h3><p>${g.penalties.map(p => `${plink(p.player)} (${p.count}, ${p.pim} min)`).join(', ')}</p>` : ''}
      ${g.links?.length ? `<h3>Links</h3><p>${g.links.map(l => `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join(' · ')}</p>` : ''}
      ${g.notes ? `<h3>Notes</h3><p>${esc(g.notes)}</p>` : ''}</div>
  </div>
  ${lineupCard(g)}
  ${tale.length || g.photo ? newspaper(g, s, tale) : ''}`;
}

const SCOPES = {
  all: { label: 'All-time', f: () => true },
  video: { label: 'Game-log era (F24 →)', f: s => s.tracking === 'game-log' },
  legacy: { label: 'Pre-video (W22 – S24)', f: s => s.tracking !== 'game-log' },
};
let PL_STATE = { tab: 'sk', scope: 'all', active: false };
function pagePlayers() {
  const sc = SCOPES[PL_STATE.scope];
  const car = C.careers(IX, { includeExcluded: !!sc.inc, seasonFilter: sc.f });
  const filt = arr => PL_STATE.active ? arr.filter(c => C.isActive(IX, c.player)) : arr;
  const span = c => `${c.first}${c.last !== c.first ? '–' + c.last : ''}`;
  const name = { k: 'name', h: 'Player', l: 1, f: c => `${plink(c.player)}${C.isActive(IX, c.player) ? '' : ' <span class="muted small">alum</span>'}`, v: c => pname(c.player) };
  const skCols = [name, { k: 'span', h: 'Seasons', f: c => `${c.seasons} <span class="muted small">${span(c)}</span>`, v: c => c.seasons },
    { k: 'gp', h: 'GP' }, { k: 'g', h: 'G' }, { k: 'a', h: 'A' }, { k: 'pts', h: 'PTS' }, { k: 'ppg', h: 'P/GP', f: c => C.fmt.n2(ppg(c.pts, c.gp)), v: c => ppg(c.pts, c.gp) },
    { k: 'gpg', h: 'G/GP', f: c => C.fmt.n2(ppg(c.g, c.gp)), v: c => ppg(c.g, c.gp) },
    { k: 'cup', h: 'Squawk 🏆' }, { k: 'pim', h: 'PIM' }];
  const gkCols = [name, { k: 'span', h: 'Seasons', f: c => `${c.seasons} <span class="muted small">${span(c)}</span>`, v: c => c.seasons },
    { k: 'gp', h: 'GP' }, { k: 'w', h: 'W' }, { k: 'ga', h: 'GA' }, { k: 'gaa', h: 'GAA', f: c => C.fmt.n2(c.gp ? c.ga / c.gp : null), v: c => c.gp ? c.ga / c.gp : null },
    { k: 'so', h: 'SO', title: 'Game-log era only' }, { k: 'sv', h: 'SV%', f: c => c.sa ? C.fmt.n3(1 - c.gaS / c.sa) : '–', v: c => c.sa ? 1 - c.gaS / c.sa : null, title: 'Games with shot data only' },
    { k: 'a', h: 'A' }, { k: 'cup', h: 'Squawk 🏆' }];
  const body = PL_STATE.tab === 'sk' ? table('car-sk', skCols, filt(car.skaters), { k: 'pts', asc: false }) : PL_STATE.tab === 'gk' ? table('car-gk', gkCols, filt(car.goalies), { k: 'gp', asc: false }) : shootoutTables(filt);
  return `<h1>Players ${info('Squawk 🏆 points start in F24, penalties in F25. Before F24, games played are what the old league site listed.')}</h1>
  <div class="tabs"><button data-pl-tab="sk" class="${PL_STATE.tab === 'sk' ? 'on' : ''}">Skaters</button><button data-pl-tab="gk" class="${PL_STATE.tab === 'gk' ? 'on' : ''}">Goalies</button><button data-pl-tab="so" class="${PL_STATE.tab === 'so' ? 'on' : ''}">Shootouts</button></div>
  <div class="controls"><label>Scope <select id="pl-scope">${Object.entries(SCOPES).map(([k, v]) => `<option value="${k}" ${k === PL_STATE.scope ? 'selected' : ''}>${v.label}</option>`).join('')}</select></label>
  <label><input type="checkbox" id="pl-active" ${PL_STATE.active ? 'checked' : ''}> Current roster only</label></div>
  ${body}`;
}
document.addEventListener('click', e => { const b = e.target.closest('[data-pl-tab]'); if (b) { PL_STATE.tab = b.dataset.plTab; route(); } });
document.addEventListener('change', e => {
  if (e.target.id === 'pl-scope') { PL_STATE.scope = e.target.value; route(); }
  if (e.target.id === 'pl-active') { PL_STATE.active = e.target.checked; route(); }
});

function defaultPhoto(p) { const d = IX.data.meta.default_photos || {}; return p.goalie || p.position === 'G' ? d.goalie : d.skater; }
// Main and ALT photos: one is picked at random each time the page opens.
// Listed in the data (player.photos); if none are listed, look for img/players/<id>.jpg and <id>-alt.jpg.
function loadPlayerPhoto(p) {
  const cands = p.photos?.length ? p.photos : [`img/players/${p.id}.jpg`, `img/players/${p.id}-alt.jpg`];
  const ok = src => new Promise(res => { const i = new Image(); i.onload = () => res(src); i.onerror = () => res(null); i.src = src; });
  Promise.all(cands.map(ok)).then(found => {
    const have = found.filter(Boolean); if (!have.length) return;
    const el = document.getElementById('pphoto'); if (el) el.src = have[Math.floor(Math.random() * have.length)];
  });
}
function pagePlayer(pid) {
  const p = P(pid); if (!p) return notFound();
  const car = C.careers(IX, { includeExcluded: true });
  const sk = car.skaters.find(c => c.player === pid), gk = car.goalies.find(c => c.player === pid);
  const counted = C.careers(IX); const skc = counted.skaters.find(c => c.player === pid), gkc = counted.goalies.find(c => c.player === pid);
  const cards = [];
  const soT = C.shootoutTotals(IX); const soS = soT.skaters.find(c => c.player === pid), soG = soT.goalies.find(c => c.player === pid);
  if (skc) cards.push(['Games', skc.gp], ['Goals', skc.g], ['Assists', skc.a], ['Points', skc.pts], ['P/GP', C.fmt.n2(ppg(skc.pts, skc.gp))], ['Squawk 🏆', skc.cup]);
  if (soS) cards.push(['Shootout goals', soS.g]);
  if (soG) cards.push(['Shootout saves', `${soG.saves}/${soG.saves + soG.ga}`]);
  if (gkc) { cards.push(['Goalie GP', gkc.gp], ['Wins', gkc.w], ['GAA', C.fmt.n2(gkc.gp ? gkc.ga / gkc.gp : null)]); if (gkc.lines.some(l => l.verified)) cards.push(['Shutouts (F24 →)', gkc.so]); }
  const champs = (skc?.champs || gkc?.champs || 0), pres = (skc?.pres || gkc?.pres || 0);
  const skRows = (sk?.lines || []).map(l => ({ ...l, s: IX.seasonById[l.season] }));
  const gkRows = (gk?.lines || []).map(l => ({ ...l, s: IX.seasonById[l.season] }));
  const sCol = { k: 'season', h: 'Season', l: 1, f: r => `${slink(r.season)} ${r.s.champion ? '🏆' : ''}${r.s.presidents ? '🥇' : ''} ${r.verified ? '' : '<span class="pill unv">unverified</span>'}`, v: r => r.s.year * 10 + C.TERM_ORDER[r.season[0]] };
  const log = [];
  for (const s of IX.seasons) for (const g of (IX.gamesBySeason[s.id] || []).filter(C.final)) {
    if (!g.roster.includes(pid) || C.isBackupGoalie(g, pid)) continue;
    const gl = g.goals.filter(x => x.scorer === pid); const a = C.gameAssists(g).filter(x => x === pid).length;
    const star = g.stars.indexOf(pid);
    log.push({ g, G: gl.length, A: a, vids: g.goals.map((x, k) => ({ x, k })).filter(o => o.x.scorer === pid && o.x.video), star, goalie: g.goalie === pid });
  }
  return `<section class="hero has-photo"><img class="pphoto" id="pphoto" src="${esc(defaultPhoto(p))}" alt="${esc(p.name)}"><div style="flex:1"><h1>${esc(p.name)}</h1><div class="sub">${p.number ? '#' + esc(p.number) + ' · ' : ''}${esc(p.position || (p.goalie ? 'G' : ''))}${p.nicknames?.length ? ' · "' + p.nicknames.map(esc).join('", "') + '"' : ''} · ${C.isActive(IX, pid) ? 'Active' : 'Alumni'}${p.sub ? ' · Sub goalie' : ''}</div></div>
  <div class="trophies stacked">${champs ? `<div title="Stanley Keg championships">${'🏆'.repeat(champs)}</div>` : ''}${pres ? `<div title="President's Trophies">${'🥇'.repeat(pres)}</div>` : ''}</div></section>
  <div class="grid g4">${cards.map(([k, v]) => `<div class="stat"><div class="k">${k}</div><div class="v">${v}</div></div>`).join('')}</div>
  ${skRows.length ? `<h2>Skater, season by season</h2>${table('ps-' + pid, [sCol, { k: 'number', h: '#', f: r => r.number ?? '' }, { k: 'gp', h: 'GP' }, { k: 'g', h: 'G' }, { k: 'a', h: 'A' }, { k: 'pts', h: 'PTS' }, { k: 'ppg', h: 'P/GP', f: r => C.fmt.n2(ppg(r.pts, r.gp)), v: r => ppg(r.pts, r.gp) }, { k: 'cup', h: 'Squawk 🏆', f: r => r.verified ? r.cup : '–' }, { k: 'pim', h: 'PIM', f: r => r.verified ? r.pim : '–' }, { k: 'vg', h: '▶ G', f: r => r.verified ? r.vg : '–' }], skRows, { k: 'season', asc: true })}` : ''}
  ${gkRows.length ? `<h2>Goalie, season by season</h2>${table('pg-' + pid, [sCol, { k: 'gp', h: 'GP' }, { k: 'w', h: 'W' }, { k: 'l', h: 'L', f: r => r.l ?? '–' }, { k: 'ga', h: 'GA' }, { k: 'gaa', h: 'GAA', f: r => C.fmt.n2(r.gp ? r.ga / r.gp : null) }, { k: 'so', h: 'SO', f: r => r.so ?? '–' }], gkRows, { k: 'season', asc: true })}` : ''}
  ${log.length ? `<h2>Game log (F24 →)</h2>${table('pl-' + pid, [
    { k: 'date', h: 'Date', l: 1, f: r => glink(r.g, C.fmt.date(r.g.date)), v: r => r.g.date }, { k: 'opp', h: 'Opponent', l: 1, f: r => tchip(r.g.opponent) + (r.g.playoff ? ' <span class="pill champ">PO</span>' : '') },
    { k: 'res', h: 'Result', f: r => `${resPill(r.g)} ${score(r.g)}` }, { k: 'G', h: 'G' }, { k: 'A', h: 'A' }, { k: 'pts', h: 'PTS', f: r => r.G + r.A, v: r => r.G + r.A },
    { k: 'star', h: '⭐', f: r => r.star >= 0 ? ['1st', '2nd', '3rd'][r.star] : '', v: r => r.star >= 0 ? 3 - r.star : 0 }, { k: 'v', h: 'Videos', l: 1, f: r => (r.goalie ? '🥅 ' : '') + r.vids.map(o => ytInfo(o.x.video) ? `<a class="vid" href="#/game/${esc(r.g.id)}/v${o.k}" title="Watch on the game page">▶</a>` : vidIcon(o.x.video)).join(' ') }], log, { k: 'date', asc: false })}` : ''}
  ${p.links?.length ? `<p class="small">Links: ${p.links.map(l => `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.season)} profile</a>`).join(' · ')}</p>` : ''}`;
}

function pageRecords() {
  const car = C.careers(IX);
  const lb = (arr, k, f = v => v, n = 10, min = null) => arr.filter(c => min ? min(c) : true).sort((a, b) => b[k] - a[k]).slice(0, n).map((c, i) => `<tr><td class="l">${i + 1}. ${plink(c.player)}</td><td>${f(c[k], c)}</td></tr>`).join('');
  const box = (title, rows) => `<div class="tw"><table><thead><tr><th class="l">${title}</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`;
  car.skaters.forEach(c => { c.ppg = c.gp ? c.pts / c.gp : 0; });
  // leader card(s) shown above a ranking: everyone tied for #1 gets their photo
  const photoOf = p => p.photos?.[0] || defaultPhoto(p);
  const leaders = (rows, pid, val, fmt = v => v, note = () => '') => {
    if (!rows.length) return '';
    const best = fmt(val(rows[0]), rows[0]);
    const tied = rows.filter(r => fmt(val(r), r) === best);
    if (tied.length > 3) return `<div class="rec-leader tie many"><b>${best}</b><span class="small">${tied.length} players tied</span></div>`;
    return `<div class="rec-leader${tied.length > 1 ? ' tie' : ''}">${tied.map(r => { const p = P(pid(r)); if (!p) return ''; const n = note(r);
      return `<div class="rec-person"><a href="#/player/${p.id}"><img src="${esc(photoOf(p))}" alt="${esc(p.name)}"></a><a class="nm" href="#/player/${p.id}">${esc(p.name)}</a>${n ? `<span class="muted small">${n}</span>` : ''}</div>`; }).join('')}
      <b>${best}</b>${tied.length > 1 ? '<span class="small">tied</span>' : ''}</div>`;
  };
  const rbox = (title, leaderHtml, table) => `<div class="rec-box"><div class="rec-title">${title}</div>${leaderHtml}${table}</div>`;
  const lbox = (title, arr, k, f = v => v, min = null) => {
    const rows = arr.filter(c => min ? min(c) : true).sort((a, b) => b[k] - a[k]);
    return rbox(title, leaders(rows, r => r.player, r => r[k], f), box('Top 10', lb(arr, k, f, 10, min)));
  };
  // single season
  const ss = []; for (const s of IX.seasons) for (const e of new Set([...(s.roster || []).map(e => e.player), ...(IX.gamesBySeason[s.id] || []).flatMap(g => g.roster)])) { const l = C.skaterSeasonLine(IX, s, e); if (l) ss.push({ player: e, season: s.id, ...l }); }
  const ssSorted = k => [...ss].sort((a, b) => b[k] - a[k]);
  const sbox = (title, k) => rbox(title, leaders(ssSorted(k), r => r.player, r => r[k], v => v, r => slink(r.season)), box('Top 10', sb(k)));
  const sb = (k) => ssSorted(k).slice(0, 10).map((c, i) => `<tr><td class="l">${i + 1}. ${plink(c.player)} <span class="muted small">${c.season}</span></td><td>${c[k]}</td></tr>`).join('');
  // single game
  const sg = []; for (const g of IX.data.games.filter(C.final)) for (const p of g.roster) { if (p === g.goalie || C.isBackupGoalie(g, p)) continue; const G = g.goals.filter(x => x.scorer === p).length, A = C.gameAssists(g).filter(x => x === p).length; if (G + A) sg.push({ p, g, G, A, PTS: G + A }); }
  const sgSorted = k => [...sg].sort((a, b) => b[k] - a[k] || (b.g.date > a.g.date ? 1 : -1));
  const gbox = (title, k) => rbox(title, leaders(sgSorted(k), r => r.p, r => r[k], v => v, r => glink(r.g, C.fmt.date(r.g.date) + ' v ' + r.g.opponent)), box('Top 8', gb(k)));
  const gb = k => sgSorted(k).slice(0, 8).map((c, i) => `<tr><td class="l">${i + 1}. ${plink(c.p)} <span class="muted small">${glink(c.g, C.fmt.date(c.g.date) + ' v ' + c.g.opponent)}</span></td><td>${c[k]}</td></tr>`).join('');
  const fg = IX.data.games.filter(C.final);
  const wins = [...fg].sort((a, b) => (b.gf - b.ga) - (a.gf - a.ga)).slice(0, 5).map(g => `<tr><td class="l">${glink(g, `${C.fmt.date(g.date)} vs ${tchip(g.opponent)}`)}</td><td>${g.gf}–${g.ga}</td></tr>`).join('');
  // streaks over every logged game in order, keeping every run that ties the longest
  const ordered = IX.seasons.flatMap(s => (IX.gamesBySeason[s.id] || []).filter(C.final));
  const runs = test => { let cur = []; const out = []; for (const g of ordered) { if (test(g)) cur.push(g); else { if (cur.length) out.push(cur); cur = []; } } if (cur.length) out.push(cur);
    const n = Math.max(0, ...out.map(r => r.length)); return { n, spans: out.filter(r => r.length === n && n > 0) }; };
  const ongoing = r => r[r.length - 1] === ordered[ordered.length - 1];
  const span = r => `${glink(r[0], C.fmt.date(r[0].date))} – ${glink(r[r.length - 1], C.fmt.date(r[r.length - 1].date))}${ongoing(r) ? ' <span class="pill champ">active</span>' : ''}`;
  const streakCard = (k, x, sub) => `<div class="stat"><div class="k">${k}</div><div class="v">${x.n}</div><div class="s">${sub ? sub + '<br>' : ''}${x.spans.map(span).join('<br>') || '–'}</div></div>`;
  const winRun = runs(g => g.result === 'W'), unbeaten = runs(g => g.result !== 'L' && g.result !== 'OTL'), loseRun = runs(g => g.result === 'L' || g.result === 'OTL');
  const losses = [...fg].filter(g => g.ga > g.gf).sort((a, b) => (b.ga - b.gf) - (a.ga - a.gf) || (b.date > a.date ? 1 : -1)).slice(0, 5).map(g => `<tr><td class="l">${glink(g, `${C.fmt.date(g.date)} vs ${tchip(g.opponent)}`)}</td><td>${g.gf}–${g.ga}</td></tr>`).join('');
  return `<h1>Records</h1>
  <h2>Career</h2><div class="grid rec4">${lbox('Points', car.skaters, 'pts')}${lbox('Goals', car.skaters, 'g')}${lbox('Assists', car.skaters, 'a')}${lbox(`Points per game (<span class="has-tip" tabindex="0" data-tip="3 Full Seasons">${C.PPG_MIN_GP}+ GP</span>)`, car.skaters, 'ppg', v => v.toFixed(2), c => c.gp >= C.PPG_MIN_GP)}${lbox('Games played', car.skaters, 'gp')}${lbox('Squawk 🏆 points', car.skaters, 'cup')}${lbox('Penalty minutes', car.skaters, 'pim')}${lbox('Goalie wins', car.goalies, 'w')}</div>
  <h2>Single season</h2><div class="grid rec3">${sbox('Points', 'pts')}${sbox('Goals', 'g')}${sbox('Assists', 'a')}</div>
  <h2>Single game (F24 →)</h2><div class="grid rec3">${gbox('Points', 'PTS')}${gbox('Goals', 'G')}${gbox('Assists', 'A')}</div>
  <h2>Team (F24 →)</h2><div class="grid g2 team-rec">${box('Biggest wins', wins)}${box('Biggest losses', losses)}</div>
  <div class="grid g3" style="margin-top:1rem">${streakCard('Longest win streak', winRun)}${streakCard('Longest unbeaten run', unbeaten, 'wins + ties')}${streakCard('Longest losing streak', loseRun, 'losses + OT losses')}</div>`;
}

function pageOpponents() {
  const agg = {};
  for (const g of IX.data.games.filter(C.final)) {
    const a = agg[g.opponent] ||= { opp: g.opponent, gp: 0, w: 0, l: 0, t: 0, otl: 0, gf: 0, ga: 0, po: 0, last: null };
    a.gp++; a[{ W: 'w', L: 'l', T: 't', OTL: 'otl' }[g.result]]++; a.gf += g.gf; a.ga += g.ga; if (g.playoff) a.po++; a.last = g;
  }
  const leg = IX.data.legacy.head_to_head.map(h => ({ ...h, gp: ['w', 'l', 't', 'otl'].reduce((n, k) => n + (h.regular[k] || 0), 0) + ['w', 'l', 'otl'].reduce((n, k) => n + (h.playoffs[k] || 0), 0) }));
  return `<h1>Opponents</h1>
  <h2>Head to head, game-log era (F24 →)</h2>${table('opp', [
    { k: 'opp', h: 'Opponent', l: 1, f: r => `${tlogo(r.opp, 'tlogo sm')} ${tlink(r.opp)}`, v: r => tname(r.opp) }, { k: 'gp', h: 'GP' }, { k: 'w', h: 'W' }, { k: 'l', h: 'L' }, { k: 't', h: 'T' }, { k: 'otl', h: 'OTL' },
    { k: 'pct', h: 'Pt%', f: r => C.fmt.n3((2 * r.w + r.t + r.otl) / (2 * r.gp)), v: r => (2 * r.w + r.t + r.otl) / (2 * r.gp) }, { k: 'gf', h: 'GF' }, { k: 'ga', h: 'GA' },
    { k: 'dif', h: 'Diff', f: r => (r.gf - r.ga > 0 ? '+' : '') + (r.gf - r.ga), v: r => r.gf - r.ga }, { k: 'po', h: 'Playoff GP' }, { k: 'last', h: 'Last meeting', l: 1, f: r => `${glink(r.last, C.fmt.date(r.last.date))} ${resPill(r.last)} ${score(r.last)}`, v: r => r.last.date }],
    Object.values(agg), { k: 'gp', asc: false })}
  <h2>All-time (old hand-kept table) ${info(esc(IX.data.legacy.head_to_head_note) + " Kept as it was; it can't be recalculated because games before F24 weren't logged one by one." + (IX.data.legacy.anomalies?.length ? `<br><br><b>${esc(IX.data.legacy.anomalies[0])}</b><br>${IX.data.legacy.anomalies.slice(1).map(esc).join('<br>')}` : ''))}</h2>
  ${table('opp-leg', [{ k: 'opp', h: 'Opponent', l: 1, f: r => `${tlogo(r.opponent, 'tlogo sm')} ${tlink(r.opponent)}` }, { k: 'gp', h: 'GP' }, { k: 'rw', h: 'Reg W-L-T-OTL', f: r => `${r.regular.w}-${r.regular.l}-${r.regular.t}-${r.regular.otl}`, nosort: 1 }, { k: 'rgf', h: 'Reg GF-GA', f: r => `${r.regular.gf}-${r.regular.ga}`, nosort: 1 }, { k: 'pw', h: 'Playoff W-L-OTL', f: r => r.playoffs.w == null ? '–' : `${r.playoffs.w}-${r.playoffs.l}-${r.playoffs.otl}`, nosort: 1 }, { k: 'pgf', h: 'Playoff GF-GA', f: r => r.playoffs.gf == null ? '–' : `${r.playoffs.gf}-${r.playoffs.ga}`, nosort: 1 }], leg, { k: 'gp', asc: false })}
`;
}

// ---------- trophy case data ----------
const shortSeason = id => ({ W: 'W', S: 'S', F: 'F' }[id[0]] || '') + id.slice(1);
// every logo a team has; the Squawks have three, so their engravings take turns with them
const teamLogos = code => code === 'WSQ' ? ['img/logos/primary.png', 'img/logos/alternate.png', 'img/logos/secondary.png'] : [].concat((IX.data.team_logos || {})[code] || []);
function kegChampions() {
  const seenWins = {};
  return [...(IX.data.awards || [])].filter(a => a.stanley_keg).sort((a, b) => C.seasonSort({ id: a.season }, { id: b.season })).map(a => {
    const s = IX.seasonById[a.season], team = a.stanley_keg;
    // names: an engraving list saved with the award, otherwise (for the Squawks) the season roster, captain marked like the real Cup
    let names = (a.keg_roster || []).map(t => ({ text: t, note: t.trim().split(/\s+/).length > 4 })) /* a long line is a note, not a name */, captain = a.keg_captain ? { text: a.keg_captain } : null;
    if (!names.length && team === 'WSQ') {
      const ros = s?.roster || [], cap = ros.find(e => (e.tags || []).includes('C'));
      if (cap) captain = { text: pname(cap.player), href: `#/player/${cap.player}` };
      names = ros.filter(e => e !== cap).map(e => ({ text: pname(e.player), href: `#/player/${e.player}` }));
    }
    const logos = teamLogos(team), turn = (seenWins[team] = (seenWins[team] ?? -1) + 1), [bg, fg] = C.teamColor(IX.data, team);
    return { season: a.season, name: s?.name || a.season, short: shortSeason(a.season), team, teamName: tname(team), captain, names,
      sticker: { code: team, name: tname(team), bg, fg, logo: logos.length ? logos[turn % logos.length] : null } };
  });
}
function kegStickers(champs) {
  const seen = []; for (const c of champs) if (!seen.includes(c.team)) seen.push(c.team);
  return seen.map(code => { const [bg, fg] = C.teamColor(IX.data, code); return { code, name: tname(code), bg, fg, logo: code === 'WSQ' ? 'img/logos/primary.png' : (IX.data.team_logos || {})[code] || null }; });
}
// Art Ross / "Rocket" Richard winners, oldest to newest; a Squawks winner links to their page and shows their photo
function awardWinners(k) {
  return [...(IX.data.awards || [])].filter(a => a[k]?.name).sort((a, b) => C.seasonSort({ id: a.season }, { id: b.season })).map(a => {
    const x = a[k], p = IX.data.players.find(pl => pl.name.toLowerCase() === x.name.toLowerCase() && (x.team === 'WSQ' || !x.team));
    return { season: a.season, seasonName: IX.seasonById[a.season]?.name || a.season, short: shortSeason(a.season), name: x.name, value: x.value,
      team: x.team, teamName: tname(x.team), wsq: x.team === 'WSQ', href: p ? `#/player/${p.id}` : null,
      ...(([bg, fg]) => ({ bg, fg, rim: bg.toLowerCase() === '#ffffff' ? fg : '#121417' }))(C.teamColor(IX.data, x.team)) };
  });
}
// Squawk 🏆 winners of finished seasons, oldest to newest; a tie lists every player who shares it
function cupWinners() {
  return IX.seasons.filter(s => s.tracking === 'game-log' && (IX.gamesBySeason[s.id] || []).length && (IX.gamesBySeason[s.id] || []).every(C.final))
    .map(s => ({ s, t: seasonSummary(s).cup })).filter(x => x.t?.who?.length)
    .map(({ s, t }) => ({ id: s.id, name: s.name, who: t.who.map(pid => ({ pid, name: pname(pid), v: t.v })) }));
}
// Front pages of every Stanley Keg final the Squawks won, oldest first, for the frames on the trophy case wall
function champPapers() {
  return IX.data.games.filter(g => g.championship && g.status === 'final' && g.result === 'W' && (!g.team || g.team === 'WSQ'))
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''))
    .map((g, n) => {
      // the finals before this one, newest first: a win right before makes it back-to-back; a run of losses to the
      // same team makes it the one where they finally beat them
      const prev = IX.data.games.filter(x => x.championship && x.status === 'final' && (x.date || '') < (g.date || '')).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      let streak = 1; while (prev[streak - 1]?.result === 'W') streak++;
      let lostTo = 0; while (streak === 1 && prev[lostTo] && prev[lostTo].result !== 'W' && prev[lostTo].opponent === g.opponent) lostTo++;
      return { id: g.id, season: IX.seasonById[g.season]?.name || g.season, date: g.date, opp: tname(g.opponent), oppCode: g.opponent, gf: g.gf, ga: g.ga, ot: g.ot || '',
        photo: g.photo?.src || null, star: g.stars?.[0] ? pname(g.stars[0]) : null, streak, lostTo, first: n === 0 };
    });
}
function trophyData() {
  const champions = kegChampions();
  return {
    champions, stickers: kegStickers(champions), wsqWins: champions.filter(c => c.team === 'WSQ').length,
    presidents: IX.seasons.filter(s => s.presidents).map(s => ({ id: s.id, name: s.name, record: C.fmt.rec4(seasonSummary(s).rec.reg) })),
    runnerUps: IX.seasons.filter(s => s.runner_up).map(s => ({ id: s.id, name: s.name })),
    artRoss: awardWinners('art_ross'), rocket: awardWinners('rocket'), cups: cupWinners(), papers: champPapers(),
  };
}
document.addEventListener('click', e => {
  if (e.target.closest('#tc-keg')) { const ch = kegChampions(); TR.openKeg(ch, kegStickers(ch)); }
  const t = e.target.closest('[data-trophy]');
  if (!t) return;
  if (t.dataset.trophy === 'ross') TR.openTrophy('ross', awardWinners('art_ross'), 'Art Ross Trophy · points leaders');
  else if (t.dataset.trophy === 'pucks') TR.openTrophy('pucks', cupWinners(), 'Squawk 🏆 winners · three-stars points');
  else if (t.dataset.trophy === 'tv') TR.openTV();
  else TR.openTrophy('rocket', awardWinners('rocket'), '"Rocket" Richard Trophy · goal leaders');
});

function pageTrophies() {
  const A = [...IX.data.awards].sort((a, b) => C.seasonSort({ id: a.season }, { id: b.season })).reverse();
  const hl = c => tchip(c);
  const cupWinners = IX.seasons.filter(s => s.tracking === 'game-log').map(s => ({ s, x: seasonSummary(s) })).filter(r => r.x.cup);
  return `<h1 class="sr-only">Trophy Room</h1>
  ${TR.trophyCase(trophyData())}
  <h2>Squawk 🏆 (three-stars points) winners</h2>${table('cupw', [{ k: 's', h: 'Season', l: 1, f: r => slink(r.s.id) }, { k: 'w', h: 'Winner', l: 1, f: r => whoList(r.x.cup) }], cupWinners.reverse(), null)}
  <h2>Division 4 awards</h2>${table('aw', [{ k: 'season', h: 'Season', l: 1 }, { k: 'p', h: "President's", l: 1, f: r => hl(r.presidents) }, { k: 'k', h: 'Stanley Keg', l: 1, f: r => hl(r.stanley_keg) }, { k: 'r', h: 'Runner-up', l: 1, f: r => hl(r.runner_up) },
    { k: 'ar', h: 'Art Ross (pts)', l: 1, f: r => `${esc(r.art_ross?.name || '')} <span class="muted">${r.art_ross?.value ?? ''}</span> ${tchip(r.art_ross?.team, true)}` }, { k: 'rr', h: '"Rocket" Richard (goals)', l: 1, f: r => `${esc(r.rocket?.name || '')} <span class="muted">${r.rocket?.value ?? ''}</span> ${tchip(r.rocket?.team, true)}` }], A, null)}`;
}

function pageAbout() {
  const d = IX.data; const byKind = {}; for (const i of d.issues) (byKind[i.kind] ||= []).push(i);
  const KL = { note: 'Notes', fixed: 'Fixes applied in migration' };
  const lb = d.livebarn;
  const verRows = IX.seasons.filter(s => s.tracking === 'game-log').map(s => ({ ...s, verification: C.verification(IX, s) })).map(s => `<tr><td class="l">${slink(s.id)}</td><td>${s.verification.goals}</td><td>${s.verification.video_linked}</td><td>${s.verification.goals ? Math.round(100 * s.verification.video_linked / s.verification.goals) + '%' : '–'}</td></tr>`).join('');
  return `<h1>About the data</h1>
  <div class="grid g2"><div class="card"><h3>Where the numbers come from</h3>
  <dl class="kv"><dt><span class="pill unv">unverified totals</span></dt><dd>W22 – S24: season totals per player, scraped by hand from the old league site (now gone). Matches both old spreadsheets.</dd>
  <dt><span class="pill ver">game log</span></dt><dd>F24 onward: every game, lineup, goal, assist and three stars. Where the old Squawk Sheet game logs and the Raw Data copy disagreed, the season tab was kept.</dd>
  <dt>▶ video</dt><dd>Goals with a link to their clip. Stats were tracked with LiveBarn video evidence from 9/27/24 to May 2026. The links are kept for reference.</dd>
  <dt>Points</dt><dd>2 per win, 1 per tie or OTL, in every season (the league used 3-point wins in F24).</dd>
  <dt>Squawk 🏆</dt><dd>Three-stars points: 4 / 2 / 1 (F24 had only a single star, worth 4).</dd>
  <dt>Goalie GA</dt><dd>Empty-net goals don't count against the goalie.</dd></dl>
  ${d.meta.notes?.length ? `<p class="small muted">${d.meta.notes.map(esc).join('<br>')}</p>` : ''}</div>
  <div class="card"><h3>Video coverage</h3><div class="tw"><table><thead><tr><th class="l">Season</th><th>Goals</th><th>▶ linked</th><th>%</th></tr></thead><tbody>${verRows}</tbody></table></div></div></div>
  <div class="grid g2"><div class="card"><h3>LiveBarn</h3><dl class="kv"><dt>Username</dt><dd>${esc(lb.username)}</dd><dt>Password</dt><dd>${esc(lb.password)}</dd>${Object.entries(lb.rink_codes).map(([k, v]) => `<dt>${esc(k)} code</dt><dd>${v}</dd>`).join('')}</dl></div>
</div>
  <h2>Migration log ${info('Every change made while merging the two old spreadsheets, with the cell it came from.')}</h2>
  ${Object.entries(KL).filter(([k]) => byKind[k]).map(([k, label]) => `<details class="card" ><summary><b>${label}</b> (${byKind[k].length})</summary><ul class="issues small">${byKind[k].map(i => `<li>${esc(i.msg)}${i.ref ? ` <span class="muted">— ${esc(i.ref)}</span>` : ''}</li>`).join('')}</ul></details>`).join('')}
  <p class="small"><a href="data/squawks.json" download>Download the full data file</a></p>`;
}
// ---------- team page: the WinterSquawks against one opponent ----------
const tlink = c => `<a class="tl" href="#/team/${esc(c)}">${tchip(c)}</a>`;
function pageTeam(code) {
  if (!IX.teams[code] || code === 'WSQ') return notFound();
  const games = IX.seasons.flatMap(s => (IX.gamesBySeason[s.id] || []).filter(g => g.opponent === code));
  const fg = games.filter(C.final), upcoming = games.filter(g => !C.final(g));
  const rec = gs => gs.reduce((a, g) => { a.gp++; a[{ W: 'w', L: 'l', T: 't', OTL: 'otl' }[g.result]]++; a.gf += g.gf; a.ga += g.ga; return a; }, { gp: 0, w: 0, l: 0, t: 0, otl: 0, gf: 0, ga: 0 });
  const reg = rec(fg.filter(g => !g.playoff)), po = rec(fg.filter(g => g.playoff)), all = rec(fg);
  const pct = r => r.gp ? C.fmt.n3((2 * r.w + r.t + r.otl) / (2 * r.gp)) : '–';
  const leg = IX.data.legacy.head_to_head.find(h => h.opponent === code);
  const [bg, fg2] = C.teamColor(IX.data, code);
  // players against this team
  const sk = {}, gk = {};
  for (const g of fg) {
    const as = C.gameAssists(g);
    for (const p of g.roster) {
      if (p === g.goalie) { const x = gk[p] ||= { pid: p, gp: 0, w: 0, l: 0, t: 0, otl: 0, ga: 0, so: 0 }; x.gp++; x[{ W: 'w', L: 'l', T: 't', OTL: 'otl' }[g.result]]++; x.ga += g.ga; if (g.ga === 0) x.so++; continue; }
      if (C.isBackupGoalie(g, p)) continue;
      const x = sk[p] ||= { pid: p, gp: 0, g: 0, a: 0, stars: 0 }; x.gp++;
      x.g += g.goals.filter(y => y.scorer === p).length; x.a += as.filter(y => y === p).length; if (g.stars.includes(p)) x.stars++;
    }
  }
  Object.values(sk).forEach(x => { x.pts = x.g + x.a; });
  const big = (sign) => [...fg].filter(g => sign * (g.gf - g.ga) > 0).sort((a, b) => sign * ((b.gf - b.ga) - (a.gf - a.ga)))[0];
  const bw = big(1), bl = big(-1);
  const kv = r => `${r.w}-${r.l}-${r.t}-${r.otl}`;
  return `<p class="small"><a href="#/opponents">← Opponents</a></p>
  <section class="hero team-hero" style="background:${bg};color:${fg2}">${tlogo(code, 'tlogo xl')}<div style="flex:1"><h1 style="color:${fg2}">${esc(tname(code))}</h1>
    <div class="sub team-trophies" style="color:${fg2}">${(() => { const aw = IX.data.awards || [];
      const keg = aw.filter(a => a.stanley_keg === code).map(a => a.season), pres = aw.filter(a => a.presidents === code).map(a => a.season);
      const line = (n, e, one, many, ss) => `<div title="${esc(many)}: ${esc(ss.join(', ') || 'none')}">${n ? e.repeat(n) : '–'} <span>${n} ${n === 1 ? one : many}</span></div>`;
      return line(keg.length, '🏆', 'Stanley Keg', 'Stanley Kegs', keg) + line(pres.length, '🥇', "President's Trophy", "President's Trophies", pres); })()}</div></div></div>
    ${fg.length ? `<div style="text-align:right"><div class="big" style="color:${fg2}">${kv(all)}</div><div class="sub" style="color:${fg2}">Squawks' W-L-T-OTL (F24 →)</div></div>` : leg ? `<div style="text-align:right"><div class="big" style="color:${fg2}">${leg.regular.w}-${leg.regular.l}-${leg.regular.t}-${leg.regular.otl}</div><div class="sub" style="color:${fg2}">Squawks' all-time regular season</div></div>` : ''}</section>
  ${fg.length ? `<div class="grid g4">
    <div class="stat"><div class="k">Regular season</div><div class="v">${kv(reg)}</div><div class="s">${reg.gf}–${reg.ga} goals · ${pct(reg)} pt%</div></div>
    <div class="stat"><div class="k">Playoffs</div><div class="v">${po.gp ? kv(po) : '–'}</div><div class="s">${po.gp ? `${po.gf}–${po.ga} goals` : 'No playoff meetings logged'}</div></div>
    <div class="stat"><div class="k">Biggest win</div><div class="v">${bw ? `${bw.gf}–${bw.ga}` : '–'}</div><div class="s">${bw ? glink(bw, C.fmt.date(bw.date)) : ''}</div></div>
    <div class="stat"><div class="k">Biggest loss</div><div class="v">${bl ? `${bl.gf}–${bl.ga}` : '–'}</div><div class="s">${bl ? glink(bl, C.fmt.date(bl.date)) : ''}</div></div>
  </div>` : ''}
  ${leg ? `<h2>All-time ${info("From the old hand-kept head-to-head table, which covers seasons before game-by-game logging began. Kept as it was.")}</h2>
  <div class="grid g3"><div class="stat"><div class="k">Regular season</div><div class="v">${leg.regular.w}-${leg.regular.l}-${leg.regular.t}-${leg.regular.otl}</div><div class="s">${leg.regular.gf}–${leg.regular.ga} goals</div></div>
  <div class="stat"><div class="k">Playoffs</div><div class="v">${leg.playoffs.w == null ? '–' : `${leg.playoffs.w}-${leg.playoffs.l}-${leg.playoffs.otl}`}</div><div class="s">${leg.playoffs.gf == null ? '' : `${leg.playoffs.gf}–${leg.playoffs.ga} goals`}</div></div></div>` : ''}
  ${Object.keys(sk).length ? `<h2>Skaters vs ${esc(tname(code))} (F24 →)</h2>${table('ts-' + code, [{ k: 'name', h: 'Skater', l: 1, f: r => plink(r.pid), v: r => pname(r.pid) }, { k: 'gp', h: 'GP' }, { k: 'g', h: 'G' }, { k: 'a', h: 'A' }, { k: 'pts', h: 'PTS' }, { k: 'ppg', h: 'P/GP', f: r => C.fmt.n2(ppg(r.pts, r.gp)), v: r => ppg(r.pts, r.gp) }, { k: 'stars', h: '⭐', title: 'Times named one of the three stars' }], Object.values(sk), { k: 'pts', asc: false })}` : ''}
  ${Object.keys(gk).length ? `<h2>Goalies vs ${esc(tname(code))} (F24 →)</h2>${table('tg-' + code, [{ k: 'name', h: 'Goalie', l: 1, f: r => plink(r.pid), v: r => pname(r.pid) }, { k: 'gp', h: 'GP' }, { k: 'w', h: 'W' }, { k: 'l', h: 'L' }, { k: 't', h: 'T' }, { k: 'otl', h: 'OTL' }, { k: 'ga', h: 'GA' }, { k: 'gaa', h: 'GAA', f: r => C.fmt.n2(r.ga / r.gp), v: r => r.ga / r.gp }, { k: 'so', h: 'SO' }], Object.values(gk), { k: 'gp', asc: false })}` : ''}
  ${games.length ? `<h2>Games</h2>${table('tm-' + code, [{ k: 'date', h: 'Date', l: 1, f: g => glink(g, C.fmt.date(g.date) || '–'), v: g => g.date }, { k: 'season', h: 'Season', l: 1, f: g => slink(g.season) }, { k: 'type', h: '', l: 1, f: g => g.playoff ? `<span class="pill champ">${g.championship ? 'Final' : 'Playoff'}</span>` : '', nosort: 1 }, { k: 'res', h: 'Result', f: g => resPill(g), nosort: 1 }, { k: 'score', h: 'Score', f: g => glink(g, score(g)), nosort: 1 }, { k: 'st', h: '⭐ 1st star', l: 1, f: g => g.stars[0] ? plink(g.stars[0]) : '', nosort: 1 }], games, { k: 'date', asc: false })}` : '<p class="muted">No logged games against this team. Game-by-game logs start in Fall 2024.</p>'}`;
}
const notFound = () => `<h1>Not found</h1><p><a href="#/">Home</a></p>`;

// ---------- router ----------
function route() {
  const h = location.hash.replace(/^#\/?/, '');
  const [page, arg, extra] = h.split('/'); let focusEl = null;
  const map = { '': pageHome, seasons: pageSeasons, season: pageSeason, game: pageGame, players: pagePlayers, player: pagePlayer, team: pageTeam, records: pageRecords, opponents: pageOpponents, trophies: pageTrophies, about: pageAbout };
  const fn = map[page] || notFound;
  try { $app.innerHTML = fn(decodeURIComponent(arg || '')); if (page === 'player' && P(arg)) loadPlayerPhoto(P(arg));
    if (page === 'game' && /^v\d+$/.test(extra || '')) { const li = document.getElementById('goal-' + extra.slice(1)); const b = li?.querySelector('.vidbtn'); if (b) { openVideo(b); focusEl = li; } } }
  catch (err) { console.error(err); $app.innerHTML = `<h1>Something broke</h1><pre>${esc(err.stack)}</pre>`; }
  document.querySelectorAll('#nav a').forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#/' + (page === 'season' ? 'seasons' : page === 'player' ? 'players' : page === 'team' ? 'opponents' : page)));
  if (focusEl) focusEl.scrollIntoView({ block: 'center' }); else if (!h.includes('#')) window.scrollTo(0, 0);
}
window.addEventListener('hashchange', route);

fetch('data/squawks.json', { cache: 'no-cache' }).then(r => r.json()).then(data => {
  IX = C.index(data);
  document.getElementById('foot-meta').textContent = `${data.games.filter(C.final).length} logged games · ${data.players.length} players · data updated ${data.meta.updated || data.meta.migrated}`;
  route();
}).catch(err => { $app.innerHTML = `<h1>Couldn't load data</h1><p>${esc(err)}</p><p class="muted">If you opened this file straight from disk, serve the folder instead (see README).</p>`; });

// Hovering an abbreviated column header shows its full name after a second (see .has-tip in style.css).
function headerTips(root) {
  for (const th of root.querySelectorAll ? root.querySelectorAll('th:not([data-tip])') : []) {
    const tip = th.getAttribute('title') || C.HEADER_TIPS[th.textContent.trim()];
    th.removeAttribute('title'); if (!tip) continue;
    th.dataset.tip = tip; th.classList.add('has-tip');
  }
}
new MutationObserver(ms => { for (const m of ms) for (const n of m.addedNodes) if (n.nodeType === 1) headerTips(n.tagName === 'TH' ? n.parentNode : n); })
  .observe(document.body, { childList: true, subtree: true });
