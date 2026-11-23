import * as C from './core.js?v=859e98df1a';

// Working copy of the data. Nothing leaves the browser until you download it.
let DATA = null, ORIGINAL = '', IX = null;
const DRAFT_KEY = 'squawks-draft-v1';
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clone = o => JSON.parse(JSON.stringify(o));
const slug = n => n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const pname = id => IX.players[id]?.name ?? id;
let TAB = 'game';
function info(html) { return `<span class="info" tabindex="0">i<span class="tip">${html}</span></span>`; }

function reindex() { IX = C.index(DATA); saveDraft(); updateStatus(); }
function saveDraft() { try { const s = JSON.stringify(DATA); if (s !== ORIGINAL) localStorage.setItem(DRAFT_KEY, s); else localStorage.removeItem(DRAFT_KEY); } catch { } }
function dirty() { return JSON.stringify(DATA) !== ORIGINAL; }
function updateStatus(msg) {
  const st = $('#status');
  st.innerHTML = msg || (dirty()
    ? `<b>You have unpublished changes.</b> They're kept in this browser. Go to <a href="#" data-goto="export">Save &amp; publish</a> when you're done.`
    : `Data loaded: ${DATA.games.filter(C.final).length} logged games, ${DATA.players.length} players. Changes stay in this browser until you publish them.`);
}
document.addEventListener('click', e => { const g = e.target.closest('[data-goto]'); if (g) { e.preventDefault(); switchTab(g.dataset.goto); } });

// ---------- boot ----------
fetch('data/squawks.json', { cache: 'no-cache' }).then(r => r.json()).then(d => {
  ORIGINAL = JSON.stringify(d); DATA = d;
  let draft = null; try { draft = localStorage.getItem(DRAFT_KEY); } catch { }
  if (draft && draft !== ORIGINAL) {
    if (confirm('There are unpublished changes saved in this browser from an earlier session. Resume them?\n\nOK = resume, Cancel = discard them and start from the published data.')) DATA = JSON.parse(draft);
    else try { localStorage.removeItem(DRAFT_KEY); } catch { }
  }
  reindex(); render();
}).catch(err => updateStatus(`<span style="color:var(--red)">Couldn't load data/squawks.json: ${esc(err)}</span>`));

document.getElementById('tabs').addEventListener('click', e => { const b = e.target.closest('button[data-tab]'); if (b) switchTab(b.dataset.tab); });
function switchTab(t) { TAB = t; document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === t)); render(); }
let RENDERING = false;
function render() { if (RENDERING) return; RENDERING = true; try { _render(); } finally { RENDERING = false; } }
function _render() { const pane = $('#pane'); pane.innerHTML = { game: gameTab, league: leagueTab, season: seasonTab, teams: teamsTab, players: playersTab, export: exportTab }[TAB](); }

// =====================================================================
// GAME
// =====================================================================
let G = { season: null, id: null, f: null, msgs: null };
function seasonOpts(sel) { return [...IX.seasons].reverse().map(s => `<option value="${s.id}" ${s.id === sel ? 'selected' : ''}>${esc(s.name)}</option>`).join(''); }
function teamOpts(sel) { return Object.entries(DATA.teams).filter(([k]) => k !== 'WSQ').map(([k, v]) => `<option value="${k}" ${k === sel ? 'selected' : ''}>${esc(v)}</option>`).join(''); }
function newGame(season) {
  const n = (IX.gamesBySeason[season] || []).length + 1;
  let id; let k = n; do { id = `${season}-${String(k).padStart(2, '0')}`; k++; } while (DATA.games.some(g => g.id === id));
  const g = { id, season, date: '', time: '', opponent: '', result: null, ot: null, gf: null, ga: null, playoff: false, championship: false,
    roster: [], goalie: null, lineup: emptyLineup(season), goals: [], assists_unpaired: [], stars: [null, null, null], penalties: [],
    shots_for: null, shots_against: null, links: [], source: 'entry', status: 'scheduled', _new: true, _legacyRoster: [], _legacyGoalie: null };
  syncRoster(g); return g;
}
// working fields (names starting with _) live only in the form, never in the data
const cleanGame = g => { for (const k of Object.keys(g)) if (k.startsWith('_')) delete g[k]; return g; };
// ---------- lineup builder ----------
// Starts with one forward line, one D pair and the season's starting goalie in G1.
function emptyLineup(season) {
  const g1 = (IX.seasonById[season]?.roster || []).find(e => e.pos === 'G' && !IX.players[e.player]?.sub && !(e.tags || []).some(t => /LTIR/i.test(t)));
  return { f: [[null, null, null]], d: [[null, null]], g: [g1 ? g1.player : null] };
}
// The game's roster is whoever is in the lineup; with one goalie they're the goalie of record.
function syncRoster(f) {
  if (!f.lineup) return;
  const lp = C.lineupPlayers(f.lineup);
  if (!lp.length) { f.roster = [...(f._legacyRoster || [])]; f.goalie = f._legacyGoalie ?? null; return; }
  f.roster = [...new Set(lp)];
  const gs = f.lineup.g.filter(Boolean);
  // two goalies: the goalie of record has to be picked on purpose
  if (gs.length === 1) { f.goalie = gs[0]; f._recPicked = false; } else if (gs.length === 0) f.goalie = null; else if (!f._recPicked || !gs.includes(f.goalie)) f.goalie = null;
}
function lineBuilder(f, s) {
  const pos = p => (s.roster || []).find(e => e.player === p)?.pos || (IX.players[p]?.goalie ? 'G' : (IX.players[p]?.position || '')[0] === 'D' ? 'D' : 'F');
  const pool = [...new Set([...(s.roster || []).map(e => e.player), ...(f._extra || []), ...C.lineupPlayers(f.lineup), ...(f._legacyRoster || [])])].filter(p => IX.players[p]);
  const used = new Set(C.lineupPlayers(f.lineup));
  const groups = [['F', 'Forwards'], ['D', 'Defense'], ['G', 'Goalies']];
  const sel = (key, cur) => `<select data-lu="${key}"><option value="">—</option>${groups.map(([k, label]) => {
    const ps = pool.filter(p => pos(p) === k).sort((a, b) => pname(a).localeCompare(pname(b)));
    return ps.length ? `<optgroup label="${label}">${ps.map(p => `<option value="${p}" ${p === cur ? 'selected' : ''} ${used.has(p) && p !== cur ? 'disabled' : ''}>${esc(pname(p))}</option>`).join('')}</optgroup>` : '';
  }).join('')}</select>`;
  const ord = ['1st', '2nd', '3rd', '4th'];
  const sec = (k, title, labels, unit) => {
    const lines = f.lineup[k];
    return `<div class="lb-sec"><h4>${title}</h4>${lines.map((l, i) => `<div class="lb-row" style="--n:${labels.length}"><div class="lb-lab">${k === 'g' ? 'G' + (i + 1) : ord[i] + ' ' + unit}</div>
      ${(k === 'g' ? [l] : l).map((p, c) => `<label>${labels[c]}${sel(k === 'g' ? `g:${i}` : `${k}:${i}:${c}`, p)}</label>`).join('')}
      ${lines.length > 1 ? `<button class="x" data-dellu="${k}:${i}" title="Remove">✕</button>` : '<span></span>'}</div>`).join('')}
      ${lines.length < C.LINEUP_MAX[k] ? `<button class="btn" data-addlu="${k}">+ ${k === 'f' ? 'Forward line' : k === 'd' ? 'D pair' : 'Second goalie'}</button>` : ''}</div>`;
  };
  return `<div class="lb">${sec('f', 'Forwards', ['LW', 'C', 'RW'], 'line')}${sec('d', 'Defense', ['LD', 'RD'], 'pair')}${sec('g', 'Goalies', ['G'], '')}</div>`;
}
function loadGame(id) {
  const g = clone(DATA.games.find(x => x.id === id));
  g._legacyRoster = g.lineup ? [] : [...g.roster]; g._legacyGoalie = g.lineup ? null : g.goalie;
  g._recPicked = !!(g.lineup && g.lineup.g.filter(Boolean).length > 1 && g.goalie);
  if (g.lineup) { const lu = g.lineup; if (!lu.f.length) lu.f.push([null, null, null]); if (!lu.d.length) lu.d.push([null, null]); if (!lu.g.length) lu.g.push(null); }
  else if (g.status !== 'final') { g._legacyRoster = []; g._legacyGoalie = null; g.lineup = emptyLineup(g.season); syncRoster(g); }  // upcoming games: build lines
  g.stars = g.stars?.length ? g.stars : [null, null, null]; while (g.stars.length < 3) g.stars.push(null);
  return g;
}
function gameTab() {
  if (!G.season) G.season = C.latestSeason(IX).id;
  loadSchedule(G.season);
  const gs = IX.gamesBySeason[G.season] || [];
  if (!G.f) {
    const nxt = gs.find(g => g.status !== 'final');
    if (nxt) { G.id = nxt.id; G.f = loadGame(nxt.id); } else { G.f = newGame(G.season); G.id = null; }
  }
  const f = G.f, s = IX.seasonById[f.season];
  const gameOpts = gs.map(g => `<option value="${g.id}" ${g.id === G.id ? 'selected' : ''}>${C.fmt.date(g.date) || '(no date)'} vs ${esc(DATA.teams[g.opponent] || '?')} ${g.status === 'final' ? `· ${g.result} ${g.gf}-${g.ga}` : '· scheduled'}</option>`).join('');
  // candidate players: season roster + everyone already in this game
  const cand = [...new Set([...(s.roster || []).map(e => e.player), ...f.roster])];
  const others = DATA.players.filter(p => !cand.includes(p.id) && !(f._extra || []).includes(p.id)).sort((a, b) => a.name.localeCompare(b.name));
  const inGame = f.roster.filter(p => p !== f.goalie);
  const popts = (sel, list = inGame, blank = '—') => `<option value="">${blank}</option>` + list.map(p => `<option value="${p}" ${p === sel ? 'selected' : ''}>${esc(pname(p))}</option>`).join('');
  const goalieCand = [...new Set([...cand.filter(p => IX.players[p]?.goalie), ...DATA.players.filter(p => p.goalie).map(p => p.id)])];
  const autoRes = autoResult(f);
  return `<div class="card">
  <div class="row"><label>Season<select id="g-season">${seasonOpts(f.season)}</select></label>
    <label>Game<select id="g-pick"><option value="">+ New game</option>${gameOpts}</select></label>
    ${G.id ? `<button class="btn" id="g-del" title="Remove this game">Delete game</button>` : ''}</div>
  <h2 style="margin-top:.6rem">${G.id ? 'Edit game' : 'New game'} <span class="muted small">${esc(f.id)}</span></h2>
  <div class="row">
    <label>Date<input type="date" data-b="date" value="${esc(f.date)}"></label>
    <label>Time<input type="time" data-b="time" value="${esc(f.time)}"></label>
    <label>Opponent<select data-b="opponent"><option value="">—</option>${teamOpts(f.opponent)}</select></label>
    <label class="inline"><input type="checkbox" data-b="playoff" ${f.playoff ? 'checked' : ''}> Playoff</label>
    <label class="inline"><input type="checkbox" data-b="championship" ${f.championship ? 'checked' : ''}> Championship game</label>
    <label class="inline"><input type="checkbox" data-b="forfeit" ${f.forfeit ? 'checked' : ''}> Forfeit ${info('Awarded by forfeit. No scorer or lineup needed.')}</label>
  </div>
  <div class="row">
    <label>Status<select data-b="status"><option value="scheduled" ${f.status !== 'final' ? 'selected' : ''}>Scheduled</option><option value="final" ${f.status === 'final' ? 'selected' : ''}>Final</option></select></label>
    <label>Squawks goals<input type="number" min="0" style="width:5rem" data-b="gf" data-num value="${f.gf ?? ''}"></label>
    <label>Opponent goals<input type="number" min="0" style="width:5rem" data-b="ga" data-num value="${f.ga ?? ''}"></label>
    <label>Decided in<select data-b="ot"><option value="">Regulation</option><option value="OT" ${f.ot === 'OT' ? 'selected' : ''}>Overtime</option><option value="SO" ${f.ot === 'SO' ? 'selected' : ''}>Shootout</option></select></label>
    <label>Result<select data-b="result"><option value="">${autoRes ? 'Auto: ' + autoRes : '—'}</option>${['W', 'L', 'T', 'OTL'].map(r => `<option ${f.result === r && f._manualResult ? 'selected' : ''}>${r}</option>`).join('')}</select></label>
    <label title="Goals scored into our empty net. They don't count against the goalie.">Empty-net GA<input type="number" min="0" style="width:5rem" data-b="en_against" data-num value="${f.en_against ?? ''}"></label>
    <label>Shots for<input type="number" min="0" style="width:5rem" data-b="shots_for" data-num value="${f.shots_for ?? ''}"></label>
    <label>Shots against<input type="number" min="0" style="width:5rem" data-b="shots_against" data-num value="${f.shots_against ?? ''}"></label>
  </div>
  <h3 style="margin-top:1rem">Lineup ${info('Put each player in their spot. Leave any slot blank. Everyone in the lineup is counted as having played.')}</h3>
  ${f.lineup ? lineBuilder(f, s) : `<div class="lb-legacy">Lines weren't recorded for this game. Who played: ${f.roster.filter(p => p !== f.goalie).map(p => esc(pname(p))).join(', ') || 'nobody listed'}${f.goalie ? ` · Goalie: ${esc(pname(f.goalie))}` : ''}.
    <br><button class="btn" id="g-buildlu" style="margin-top:.5rem">Build lines for this game</button> <span class="small muted">Once you place players, the lines replace this list.</span></div>`}
  <div class="row">
    ${!f.lineup ? `<label>Goalie<select data-b="goalie"><option value="">—</option>${goalieCand.map(p => `<option value="${p}" ${p === f.goalie ? 'selected' : ''}>${esc(pname(p))}</option>`).join('')}</select></label>` : ''}
    ${f.lineup && f.lineup.g.filter(Boolean).length > 1 ? `<label>Goalie of record ${info('Gets the win or loss, goals against and shutout for this game. The other goalie is listed in the lineup only.')}<select data-b="goalie"><option value="">— pick one —</option>${f.lineup.g.filter(Boolean).map(p => `<option value="${p}" ${p === f.goalie ? 'selected' : ''}>${esc(pname(p))}</option>`).join('')}</select></label>` : ''}
    <label>Add a player not on the season roster<select id="g-addp"><option value="">—</option>${others.map(p => `<option value="${p.id}">${esc(p.name)}</option>`).join('')}</select></label></div>
  <h3 style="margin-top:1rem">Goals <span class="muted small">(${f.goals.length}${f.gf != null ? ' of ' + f.gf : ''})</span></h3>
  <div class="goalrow muted small"><span>#</span><span>Scorer</span><span>Assist 1</span><span>Assist 2</span><span>Video link (optional)</span><span></span></div>
  ${f.goals.map((x, i) => `<div class="goalrow"><span>${i + 1}</span>
    <select data-goal="${i}" data-k="scorer">${popts(x.scorer)}</select>
    <select data-goal="${i}" data-k="a1">${popts(x.a1, inGame, 'unassisted')}</select>
    <select data-goal="${i}" data-k="a2">${popts(x.a2)}</select>
    <input type="url" placeholder="https://youtu.be/…" data-goal="${i}" data-k="video" value="${esc(x.video || '')}">
    <button class="x" data-delgoal="${i}" title="Remove goal">✕</button></div>`).join('')}
  <button class="btn" id="g-addgoal">+ Goal</button>
  ${f.assists_unpaired?.length ? `<p class="small" style="margin-top:.6rem"><b>Unpaired assists (old sheet):</b> ${f.assists_unpaired.map(pname).map(esc).join(', ')}<br>${info("These came from the old grid, which didn't tie assists to goals. Leave them, or clear them once you've entered assists on each goal above.")} <a href="#" id="g-clearun">clear</a></p>` : ''}
  <h3 style="margin-top:1rem">Three stars</h3>
  <div class="row">${[0, 1, 2].map(i => `<label>${['1st ⭐', '2nd ⭐⭐', '3rd ⭐⭐⭐'][i]}<select data-star="${i}">${popts(f.stars[i], f.roster)}</select></label>`).join('')}</div>
  ${f.ot === 'SO' ? shootoutForm(f, popts) : ''}
  <h3 style="margin-top:1rem">Penalties</h3>
  ${f.penalties.map((p, i) => `<div class="penrow"><select data-pen="${i}" data-k="player">${popts(p.player, f.roster)}</select>
    <input type="number" min="0" data-pen="${i}" data-k="count" value="${p.count}" title="Penalties">
    <input type="number" min="0" data-pen="${i}" data-k="pim" value="${p.pim}" title="Minutes">
    <button class="x" data-delpen="${i}">✕</button></div>`).join('')}
  <button class="btn" id="g-addpen">+ Penalty</button>
  <h3 style="margin-top:1rem">Notes / recap ${info('Optional. Shown on the game page.')}</h3>
  <textarea data-b="notes">${esc(f.notes || '')}</textarea>
  <div class="msgs" id="g-msgs">${G.msgs || ''}</div>
  <div class="sticky"><button class="btn pri" id="g-save">Save game</button><button class="btn" id="g-reset">Discard edits</button>${info("Saving checks the game, then keeps it in this browser's working copy until you publish.")}</div>
  </div>
  ${leagueNight(f)}`;
}
// The other division games played the same night, so league results go in alongside the Squawks game.
function leagueNight(f) {
  if (!f.date) return '';
  const rows = lgRows(f.season).filter(x => x.g.date === f.date);
  const sched = SCHED[f.season];
  if (!rows.length) return `<div class="card"><h3 style="margin-top:0">League results · ${esc(dayLabel(f.date))}</h3><p class="small muted">No other league games on this date${IX.seasonById[f.season]?.schedule_url ? '. Try <b>Sync schedule</b> on the League games tab.' : '.'}</p></div>`;
  return `<div class="card"><h3 style="margin-top:0">League results · ${esc(dayLabel(f.date))} ${info('The other games in the division that night. They count toward the standings. Changes here save straight into your working copy, the same as on the League games tab.')}</h3>
  ${lgTable(f.season, [{ date: f.date, rows }], sched, false)}</div>`;
}
// Every game is at night: a bare '10:05' means 10:05 PM. Stored as 24-hour 'HH:MM'.
function toPM(t, ap) { let [h, mi] = t.split(':').map(Number); ap = (ap || '').toLowerCase();
  if (ap === 'am') { if (h === 12) h = 0; } else if (h < 12) h += 12;
  return `${String(h).padStart(2, '0')}:${String(mi).padStart(2, '0')}`; }
function shootoutForm(f, popts) {
  const so = f.shootout || { goals: [], misses: [], goalie: f.goalie || null, saves: null, ga: null };
  const gcand = [...new Set([f.goalie, ...DATA.players.filter(p => p.goalie).map(p => p.id)].filter(Boolean))];
  return `<h3 style="margin-top:1rem">Shootout ${info('Kept separate: shootout goals, saves and goals allowed never count toward regular stats or team totals. Shootout goals are not added to the Goals list above. Add a miss for every one of our shooters who didn\'t score, so shooting percentages are right.')}</h3>
  <div class="row"><label>Our goalie<select data-so="goalie"><option value="">—</option>${gcand.map(p => `<option value="${p}" ${p === so.goalie ? 'selected' : ''}>${esc(pname(p))}</option>`).join('')}</select></label>
    <label>Saves<input type="number" min="0" style="width:5rem" data-so="saves" value="${so.saves ?? ''}"></label>
    <label>Goals allowed<input type="number" min="0" style="width:5rem" data-so="ga" value="${so.ga ?? ''}"></label></div>
  <div class="row">${(so.goals || []).map((p, i) => `<label>Shootout goal ${i + 1}<select data-sog="${i}">${popts(p)}</select></label> <button class="x" data-delsog="${i}">✕</button>`).join('')}
    <button class="btn" id="g-addsog">+ Shootout goal</button></div>
  <div class="row">${(so.misses || []).map((p, i) => `<label>Shootout miss ${i + 1}<select data-som="${i}">${popts(p)}</select></label> <button class="x" data-delsom="${i}">✕</button>`).join('')}
    <button class="btn" id="g-addsom">+ Shootout miss</button></div>`;
}
function autoResult(f) {
  if (f.gf == null || f.ga == null || f.gf === '' || f.ga === '') return null;
  if (f.gf > f.ga) return 'W';
  if (f.gf < f.ga) return f.ot ? 'OTL' : 'L';
  return 'T';
}
function gameFromForm() {
  const f = clone(G.f);
  if (!f._manualResult) f.result = autoResult(f);
  f.ot = f.ot || null;
  f.goals = f.goals.map(x => ({ scorer: x.scorer || null, a1: x.a1 || null, a2: x.a2 || null, video: x.video?.trim() || null, verified: !!x.video?.trim() }));
  f.stars = f.stars.map(x => x || null);
  if (f.lineup) {
    const lu = { f: f.lineup.f.filter(l => l.some(Boolean)), d: f.lineup.d.filter(l => l.some(Boolean)), g: f.lineup.g.filter(Boolean) };
    if (C.lineupPlayers(lu).length) { f.lineup = lu; f.roster = [...new Set(C.lineupPlayers(lu))]; }
    else { delete f.lineup; f.roster = [...(f._legacyRoster || [])]; f.goalie = f._legacyGoalie ?? null; }
  }
  if (f.goalie && !f.roster.includes(f.goalie)) f.roster.unshift(f.goalie);
  f.penalties = f.penalties.filter(p => p.player);
  if (!f.notes) delete f.notes;
  if (!f.en_against) delete f.en_against;
  if (!f.forfeit) delete f.forfeit;
  if (f.ot !== 'SO') delete f.shootout;
  else if (f.shootout) { f.shootout.goals = (f.shootout.goals || []).filter(Boolean); f.shootout.misses = (f.shootout.misses || []).filter(Boolean); if (!f.shootout.misses.length) delete f.shootout.misses; if (!f.shootout.goals.length && !f.shootout.misses && f.shootout.saves == null && f.shootout.ga == null && !f.shootout.goalie) delete f.shootout; }
  delete f._new; delete f._manualResult; delete f._extra; delete f._legacyRoster; delete f._legacyGoalie; delete f._recPicked;
  return f;
}
const pane = () => $('#pane');
document.addEventListener('input', e => {
  if (TAB !== 'game' || !G.f) return;
  const t = e.target;
  if (t.dataset.b && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA') && t.type !== 'checkbox') G.f[t.dataset.b] = t.dataset.num !== undefined ? (t.value === '' ? null : +t.value) : t.value;
  if (t.dataset.goal !== undefined && t.tagName === 'INPUT') G.f.goals[+t.dataset.goal][t.dataset.k] = t.value;
  if (t.dataset.pen !== undefined && t.tagName === 'INPUT') G.f.penalties[+t.dataset.pen][t.dataset.k] = +t.value || 0;
});
document.addEventListener('change', e => {
  if (TAB !== 'game' || !G.f) return;
  const t = e.target; const f = G.f;
  if (t.id === 'g-season') { if (!leaveOK()) { t.value = G.season; return; } G.season = t.value; G.f = null; G.id = null; G.msgs = null; return render(); }
  if (t.id === 'g-pick') { if (!leaveOK()) { t.value = G.id || ''; return; } G.id = t.value || null; G.f = G.id ? loadGame(G.id) : newGame(G.season); G.msgs = null; return render(); }
  if (t.id === 'g-addp' && t.value) { if (f.lineup) (f._extra ||= []).push(t.value); else f.roster.push(t.value); return render(); }
  if (t.dataset.lu) { const [k, r, c] = t.dataset.lu.split(':'); if (k === 'g') f.lineup.g[+r] = t.value || null; else f.lineup[k][+r][+c] = t.value || null; syncRoster(f); return render(); }
  if (t.dataset.b) {
    if (t.type === 'checkbox') f[t.dataset.b] = t.checked;
    else if (t.tagName === 'SELECT') {
      if (t.dataset.b === 'result') { f._manualResult = !!t.value; f.result = t.value || null; }
      else { f[t.dataset.b] = t.value || null; if (t.dataset.b === 'goalie') f._recPicked = !!t.value; }
    } else f[t.dataset.b] = t.dataset.num !== undefined ? (t.value === '' ? null : +t.value) : t.value;
    if (['gf', 'ga', 'ot', 'status', 'goalie', 'forfeit'].includes(t.dataset.b)) {
      if (t.dataset.b === 'gf' && f.gf != null && f.goals.length < f.gf && f.status === 'final') while (f.goals.length < f.gf) f.goals.push({ scorer: null, a1: null, a2: null, video: null });
      render();
    }
    return;
  }
  if (t.dataset.roster) { const p = t.dataset.roster; f.roster = t.checked ? [...f.roster, p] : f.roster.filter(x => x !== p); return render(); }
  if (t.dataset.goal !== undefined && t.tagName === 'SELECT') { f.goals[+t.dataset.goal][t.dataset.k] = t.value || null; return; }
  if (t.dataset.star !== undefined) { f.stars[+t.dataset.star] = t.value || null; return; }
  if (t.dataset.so) { const so = f.shootout ||= { goals: [], misses: [], goalie: f.goalie || null, saves: null, ga: null }; so[t.dataset.so] = t.dataset.so === 'goalie' ? (t.value || null) : (t.value === '' ? null : +t.value); return; }
  if (t.dataset.sog !== undefined) { f.shootout.goals[+t.dataset.sog] = t.value || null; return; }
  if (t.dataset.som !== undefined) { f.shootout.misses[+t.dataset.som] = t.value || null; return; }
  if (t.dataset.pen !== undefined && t.tagName === 'SELECT') { f.penalties[+t.dataset.pen].player = t.value || null; return; }
});
function leaveOK() {
  if (!G.f) return true;
  const base = G.id ? (() => { const b = loadGame(G.id); delete b._new; return b; })() : null;
  const same = base ? JSON.stringify(gameFromForm().goals) === JSON.stringify(base.goals) && G.f.gf === base.gf && G.f.ga === base.ga && G.f.status === base.status && JSON.stringify(G.f.roster) === JSON.stringify(base.roster) && JSON.stringify(G.f.lineup || null) === JSON.stringify(base.lineup || null) : !G.f.opponent && !G.f.date && !G.f.goals.length;
  return same || confirm('Discard the edits to this game?');
}
document.addEventListener('click', e => {
  if (TAB !== 'game' || !G.f) return;
  const t = e.target; const f = G.f;
  if (t.dataset.addlu) { const k = t.dataset.addlu; if (f.lineup[k].length < C.LINEUP_MAX[k]) f.lineup[k].push(k === 'f' ? [null, null, null] : k === 'd' ? [null, null] : null); render(); }
  else if (t.dataset.dellu) { const [k, i] = t.dataset.dellu.split(':'); f.lineup[k].splice(+i, 1); syncRoster(f); render(); }
  else if (t.id === 'g-buildlu') { f.lineup = { f: [[null, null, null]], d: [[null, null]], g: [f.goalie || null] }; syncRoster(f); render(); }
  else if (t.id === 'g-addgoal') { f.goals.push({ scorer: null, a1: null, a2: null, video: null }); render(); }
  else if (t.dataset.delgoal !== undefined) { f.goals.splice(+t.dataset.delgoal, 1); render(); }
  else if (t.id === 'g-addsog') { const so = f.shootout ||= { goals: [], misses: [], goalie: f.goalie || null, saves: null, ga: null }; so.goals.push(null); render(); }
  else if (t.dataset.delsog !== undefined) { f.shootout.goals.splice(+t.dataset.delsog, 1); render(); }
  else if (t.id === 'g-addsom') { const so = f.shootout ||= { goals: [], misses: [], goalie: f.goalie || null, saves: null, ga: null }; (so.misses ||= []).push(null); render(); }
  else if (t.dataset.delsom !== undefined) { f.shootout.misses.splice(+t.dataset.delsom, 1); render(); }
  else if (t.id === 'g-addpen') { f.penalties.push({ player: null, count: 1, pim: 3 }); render(); }
  else if (t.dataset.delpen !== undefined) { f.penalties.splice(+t.dataset.delpen, 1); render(); }
  else if (t.id === 'g-clearun') { e.preventDefault(); if (confirm('Remove the unpaired assists from this game?')) { f.assists_unpaired = []; render(); } }
  else if (t.id === 'g-reset') { G.f = G.id ? loadGame(G.id) : newGame(G.season); G.msgs = null; render(); }
  else if (t.id === 'g-del') {
    if (!confirm('Delete this game from the working copy?')) return;
    DATA.games = DATA.games.filter(g => g.id !== G.id); reindex(); G.f = null; G.id = null; G.msgs = '<p class="ok">Game deleted.</p>'; render();
  }
  else if (t.id === 'g-save') saveGame();
});
function saveGame() {
  const g = gameFromForm();
  const pre = [];
  if (!g.opponent) pre.push('Pick an opponent.');
  if (g.status === 'final') {
    if (g.gf == null || g.ga == null) pre.push('Enter both scores.');
    if (g.goals.some(x => !x.scorer)) pre.push('Every goal needs a scorer (remove empty goal rows).');
    if (!g.roster.length && !g.forfeit) pre.push('Add the lineup.');
  }
  if (g.lineup && g.lineup.g.length > 1 && !g.goalie) pre.push('Pick the goalie of record.');
  if (pre.length) { G.msgs = pre.map(m => `<p class="err">✕ ${esc(m)}</p>`).join(''); return render(); }
  const trial = clone(DATA);
  const i = trial.games.findIndex(x => x.id === g.id);
  if (i >= 0) trial.games[i] = g; else trial.games.push(g);
  const v = C.validate(trial);
  const mine = m => m.startsWith(g.id + ' ') || m.startsWith(g.id + ':');
  const errs = v.errs.filter(mine), warns = v.warns.filter(mine);
  if (errs.length) { G.msgs = errs.map(m => `<p class="err">✕ ${esc(m)}</p>`).join('') + warns.map(m => `<p class="warn">⚠ ${esc(m)}</p>`).join(''); return render(); }
  DATA = trial; reindex(); G.id = g.id; G.f = clone(g);
  G.msgs = `<p class="ok">✓ Saved to the working copy.</p>` + warns.map(m => `<p class="warn">⚠ ${esc(m)}</p>`).join('');
  render();
}

// =====================================================================
// SEASON & ROSTER
// =====================================================================
let S = { id: null, msg: '' };
// ---------- Division 4 awards (Trophy room) ----------
// The Squawks' own 🏆 / 🥇 / runner-up flags on the season follow these, so they can't disagree.
const awardOf = sid => (DATA.awards || []).find(a => a.season === sid);
function syncSeasonFlags(s) { const a = awardOf(s.id); s.champion = a?.stanley_keg === 'WSQ'; s.presidents = a?.presidents === 'WSQ'; s.runner_up = a?.runner_up === 'WSQ'; }
function awardsForm(s) {
  const a = awardOf(s.id);
  const head = `<h3 style="margin-top:1.2rem">Division 4 awards ${info('Shown in the Trophy room, on the season page and on team pages. Fill these in once the season is over. Picking WinterSquawks for a trophy also marks it on that WinterSquawks season.')}</h3>`;
  if (!a) return `${head}<p class="small muted">No awards entered for ${esc(s.name)} yet. <button class="btn" id="a-add">Add ${esc(s.name)} awards</button></p>`;
  const teams = (k, sel) => `<select data-a="${k}"><option value="">—</option>${Object.entries(DATA.teams).map(([c, n]) => `<option value="${c}" ${c === sel ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select>`;
  const st = s.standings_from_games ? C.computeStandings(DATA, s.id) : [];
  const lead = st[0]?.gp ? st[0].team : null;
  const person = (k, label, unit) => `<div class="aw-person"><div class="aw-lab">${label}</div>
    <label>Player<input data-a="${k}.name" list="aw-names" value="${esc(a[k]?.name || '')}"></label>
    <label>${unit}<input type="number" min="0" style="width:5rem" data-a="${k}.value" value="${a[k]?.value ?? ''}"></label>
    <label>Team${teams(k + '.team', a[k]?.team)}</label></div>`;
  return `${head}
  <div class="row aw-row">
    <label>🥇 President's Trophy${teams('presidents', a.presidents)}</label>
    <label>🏆 Stanley Keg${teams('stanley_keg', a.stanley_keg)}</label>
    <label>Runner-up (lost the final)${teams('runner_up', a.runner_up)}</label>
    ${lead && lead !== a.presidents ? `<button class="btn" id="a-lead" data-team="${lead}" title="First in the standings worked out from the games">Use standings leader: ${esc(DATA.teams[lead])}</button>` : ''}
  </div>
  <div class="aw-people">${person('art_ross', 'Art Ross (most points)', 'Points')}${person('rocket', '"Rocket" Richard (most goals)', 'Goals')}</div>
  <datalist id="aw-names">${[...new Set([...(DATA.awards || []).flatMap(x => [x.art_ross?.name, x.rocket?.name]), ...DATA.players.map(p => p.name)].filter(Boolean))].sort().map(n => `<option value="${esc(n)}">`).join('')}</datalist>
  <p class="small"><button class="x" id="a-del" title="Remove">✕</button> Remove ${esc(s.name)}'s awards</p>`;
}
function seasonTab() {
  if (!S.id) S.id = C.latestSeason(IX).id;
  const s = IX.seasonById[S.id]; const nid = C.nextSeasonId(C.latestSeason(IX).id);
  const others = DATA.players.filter(p => !(s.roster || []).some(e => e.player === p.id)).sort((a, b) => a.name.localeCompare(b.name));
  return `<div class="card">
  <div class="row"><label>Season<select id="s-pick">${seasonOpts(S.id)}</select></label>
  <button class="btn" id="s-new">+ Start ${nid} (copy current roster)</button></div>
  ${S.msg ? `<p class="small" style="color:var(--green)">${S.msg}</p>` : ''}
  <h2>${esc(s.name)}</h2>
  <div class="row">
    <label>Final place<input type="number" min="1" style="width:5rem" data-s="place" value="${C.place(s) ?? ''}"></label>
    <label style="flex:1;min-width:260px">Result text (e.g. "Championship: 2-3 OT Apuckalypse Meow")<input data-s="result" value="${esc(s.result || '')}"></label>
  </div>
  <div class="row"><label style="flex:1">Story title<input data-s="story_title" value="${esc(s.story_title || '')}"></label></div>
  <div class="row"><label style="flex:1">League schedule link ${info('The division\'s schedule page on the league site, e.g. <code>https://wicadulthockey.sportngin.com/schedule/day/division_instance/599903?subseason=964738</code>. Paste it at the start of each season and publish. The schedule and results are then fetched every morning; use <b>Sync schedule</b> on the League games tab.')}<input type="url" data-s="schedule_url" value="${esc(s.schedule_url || '')}" placeholder="https://wicadulthockey.sportngin.com/schedule/day/division_instance/…"></label></div>
  ${awardsForm(s)}
  <h3>Roster</h3>
  <div class="tw"><table><thead><tr><th class="l">Player</th><th>#</th><th class="l">Pos</th><th class="l">Notes (C, LTIR - Ankle, sub…)</th><th></th></tr></thead><tbody>
  ${(s.roster || []).map((e, i) => `<tr><td class="l">${esc(pname(e.player))}</td>
    <td><input style="width:4rem" data-r="${i}" data-k="number" value="${esc(e.number ?? '')}"></td>
    <td class="l"><select data-r="${i}" data-k="pos">${['F', 'D', 'G'].map(p => `<option ${e.pos === p ? 'selected' : ''}>${p}</option>`).join('')}</select></td>
    <td class="l"><input style="width:16rem" data-r="${i}" data-k="tags" value="${esc((e.tags || []).join(', '))}"></td>
    <td><button class="x" data-delr="${i}" title="Remove from roster">✕</button></td></tr>`).join('')}
  </tbody></table></div>
  <div class="row"><label>Add player to roster<select id="s-addp"><option value="">—</option>${others.map(p => `<option value="${p.id}">${esc(p.name)}</option>`).join('')}</select></label>
    ${info('New to the team? Add them on the Players tab first.')}</div>
  <h3>Add schedule ${info('One game per line, e.g. <code>2027-01-08 8:40 Puck Norris</code>. Times are read as PM unless you add am. They go in as scheduled games.')}</h3>
  <textarea id="s-sched" placeholder="2027-01-08 8:40 Puck Norris  (times are PM)"></textarea>
  <button class="btn" id="s-addsched">Add games</button> <span id="s-schedmsg" class="small"></span>
  <h3 style="margin-top:1rem">Add a story line ${info('Start a line with the game date (e.g. <code>1/9 Hammerheads: …</code>) and it also shows on that game\'s page.')}</h3>
  <div class="row"><label style="flex:2;min-width:280px">Text<input id="s-line"></label><label style="flex:1;min-width:200px">Link (optional)<input id="s-link" type="url"></label><button class="btn" id="s-addline">Add</button></div>
  
  </div>`;
}
document.addEventListener('change', e => {
  if (TAB !== 'season') return;
  const t = e.target; const s = IX.seasonById[S.id];
  if (t.id === 's-pick') { S.id = t.value; S.msg = ''; return render(); }
  if (t.id === 's-addp' && t.value) { const p = IX.players[t.value]; s.roster.push({ player: p.id, pos: p.goalie ? 'G' : (p.position?.[0] === 'D' ? 'D' : 'F'), number: p.number ?? null, tags: [], initials: null }); reindex(); return render(); }
  if (t.dataset.a) {
    const a = awardOf(s.id); const [k, sub] = t.dataset.a.split('.');
    if (!sub) a[k] = t.value || null;
    else { const o = a[k] ||= { name: null, value: null, team: null }; o[sub] = sub === 'value' ? (t.value === '' ? null : Math.max(0, Math.round(+t.value))) : (t.value.trim() || null); }
    syncSeasonFlags(s); reindex(); return render();
  }
  if (t.dataset.s) {
    const k = t.dataset.s;
    if (t.type === 'checkbox') s[k] = t.checked; else if (k === 'place') s.place = t.value ? +t.value : null; else s[k] = t.value || null;
    reindex(); return;
  }
  if (t.dataset.r !== undefined) {
    const e2 = s.roster[+t.dataset.r];
    if (t.dataset.k === 'tags') e2.tags = t.value.split(',').map(x => x.trim()).filter(Boolean);
    else e2[t.dataset.k] = t.value || null;
    reindex();
  }
});
document.addEventListener('click', e => {
  if (TAB !== 'season') return;
  const t = e.target; const s = IX.seasonById[S.id];
  if (t.id === 's-new') {
    const cur = C.latestSeason(IX); const id = C.nextSeasonId(cur.id); const y = 2000 + +id.slice(1);
    if (!confirm(`Create ${id} and copy the ${cur.name} roster into it?`)) return;
    DATA.seasons.push({ id, code: id.slice(1) + id[0], name: `${{ W: 'Winter', S: 'Summer', F: 'Fall' }[id[0]]} ${y}`, year: y, term: { W: 'Winter', S: 'Summer', F: 'Fall' }[id[0]],
      team_name: 'WinterSquawks', division: cur.division, tracking: 'game-log', standings_from_games: true, in_totals: true, verification: null, standings: [], leaders: { art_ross: [], rocket: [] },
      story_title: null, story: [], roster: cur.roster.filter(r => r.pos !== 'G' || !IX.players[r.player]?.sub).map(r => ({ ...r, tags: (r.tags || []).filter(x => x === 'C'), legacy: undefined })),
      result: null, champion: false, presidents: false, runner_up: false, place: null });
    reindex(); S.id = id; S.msg = `${id} created.`; render();
  }
  if (t.id === 'a-add') {
    (DATA.awards ||= []).push({ season: s.id, presidents: null, stanley_keg: null, runner_up: null, art_ross: { name: null, value: null, team: null }, rocket: { name: null, value: null, team: null } });
    DATA.awards.sort((x, y) => C.seasonSort({ id: x.season }, { id: y.season })); reindex(); render();
  }
  if (t.id === 'a-lead') { awardOf(s.id).presidents = t.dataset.team; syncSeasonFlags(s); reindex(); render(); }
  if (t.id === 'a-del') { if (confirm(`Remove all Division 4 awards for ${s.name}?`)) { DATA.awards.splice(DATA.awards.indexOf(awardOf(s.id)), 1); syncSeasonFlags(s); reindex(); render(); } }
  if (t.dataset.delr !== undefined) { if (confirm(`Remove ${pname(s.roster[+t.dataset.delr].player)} from the ${s.name} roster? Their games stay.`)) { s.roster.splice(+t.dataset.delr, 1); reindex(); render(); } }
  if (t.id === 's-addsched') {
    const lines = $('#s-sched').value.split('\n').map(x => x.trim()).filter(Boolean); const bad = []; let n = 0;
    const byName = Object.fromEntries(Object.entries(DATA.teams).map(([k, v]) => [v.toLowerCase(), k]));
    for (const l of lines) {
      const m = l.match(/^(\d{4}-\d{2}-\d{2})\s+(?:(\d{1,2}:\d{2})\s*(am|pm)?)?\s*(.+)$/i);
      const opp = m && (byName[m[4].trim().toLowerCase()] || (DATA.teams[m[4].trim().toUpperCase()] ? m[4].trim().toUpperCase() : null));
      if (!m || !opp) { bad.push(l); continue; }
      const g = cleanGame(newGame(s.id)); g.date = m[1]; g.time = m[2] ? toPM(m[2], m[3]) : null; g.opponent = opp;
      DATA.games.push(g); reindex(); n++;
    }
    $('#s-schedmsg').innerHTML = `${n} added.${bad.length ? ` <span style="color:var(--red)">Couldn't read: ${bad.map(esc).join(' | ')}</span>` : ''}`;
  }
  if (t.id === 's-addline') {
    const text = $('#s-line').value.trim(); if (!text) return;
    const row = Math.max(0, ...(s.story || []).map(l => l.row)) + 1;
    (s.story ||= []).push({ row, col: 2, text, link: $('#s-link').value.trim() || null }); reindex(); render();
  }
});

// =====================================================================
// LEAGUE GAMES (every other game in the division, for the standings)
// =====================================================================
let L = { id: null };
const lgTeams = sid => { const seen = new Set(); for (const g of DATA.league_games || []) if (g.season === sid) { if (g.home) seen.add(g.home); if (g.away) seen.add(g.away); }
  for (const g of DATA.games) if (g.season === sid && g.opponent) seen.add(g.opponent); seen.delete('WSQ'); return seen; };
function lgTeamOpts(sid, sel) {
  const cur = lgTeams(sid), all = Object.keys(DATA.teams).filter(k => k !== 'WSQ');
  const o = k => `<option value="${k}" ${k === sel ? 'selected' : ''}>${esc(DATA.teams[k])}</option>`;
  return `<option value="">—</option><optgroup label="This season">${all.filter(k => cur.has(k)).map(o).join('')}</optgroup><optgroup label="Other teams">${all.filter(k => !cur.has(k)).map(o).join('')}</optgroup>`;
}
function lgResult(g) {
  if (!C.lgFinal(g) || !g.home || !g.away) return '<span class="muted">not played</span>';
  const ot = C.lgOT(g), tag = ot === 'SO' ? ' (SO)' : ot ? ' (OT)' : '';
  if (g.home_score === g.away_score) return ot === 'OT' ? '<span style="color:var(--red)">tied, but decided in OT</span>' : `Tie${tag} · 1–1 pts`;
  const w = g.home_score > g.away_score ? g.home : g.away;
  return `${esc(DATA.teams[w])} win${tag} · 2–${ot ? 1 : 0} pts`;
}
// ---------- league schedule fetched from the league site ----------
// A GitHub job (.github/workflows/league-schedule.yml) fetches the league site every day and saves it on the
// league-schedule branch; it's read from there because the browser can't read the league site directly.
const SCHED = {}, SCHED_ERR = {}, SCHED_LOADING = new Set();
function repoName() {
  const m = location.hostname.match(/^([^.]+)\.github\.io$/i), seg = location.pathname.split('/').filter(Boolean)[0];
  return m && seg && !/\.html$/.test(seg) ? `${m[1]}/${seg}` : (DATA.meta?.repo || null);
}
function loadSchedule(sid, force) {
  const s = IX.seasonById[sid]; if (!s?.schedule_url || SCHED_LOADING.has(sid) || (SCHED[sid] && !force)) return;
  const repo = repoName(); if (!repo) { SCHED_ERR[sid] = 'Unknown repository.'; return; }
  SCHED_LOADING.add(sid);
  fetch(`https://raw.githubusercontent.com/${repo}/league-schedule/${sid}.json?t=${Date.now()}`, { cache: 'no-store' })
    .then(r => { if (r.status === 404) throw new Error('not fetched yet'); if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(j => { SCHED[sid] = j; delete SCHED_ERR[sid]; })
    .catch(e => { SCHED_ERR[sid] = e.message; })
    .finally(() => { SCHED_LOADING.delete(sid); if (TAB === 'league' || TAB === 'game') render(); });
}
const schedGames = sid => (SCHED[sid]?.games || []).map(x => x.home && x.away ? x : { ...x, home: x.home || C.teamByName(DATA, x.home_name), away: x.away || C.teamByName(DATA, x.away_name) });
const siteGame = (sid, g) => { const sc = SCHED[sid]; if (!sc) return null;
  return schedGames(sid).find(x => x.id === g.source_id) || schedGames(sid).find(x => x.date === g.date && [x.home, x.away].sort().join() === [g.home, g.away].sort().join()) || null; };
// the league site's score, oriented to this game's home/away
function siteFor(sid, g) {
  const x = siteGame(sid, g); if (!x || x.status !== 'final' || x.home_score == null) return null;
  const same = x.home === g.home; return { home_score: same ? x.home_score : x.away_score, away_score: same ? x.away_score : x.home_score, ot: x.decided };
}
const todayISO = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const dayLabel = d => d ? new Date(d + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }) : 'No date';
const needsResult = g => !C.lgFinal(g) && g.date && g.date <= todayISO();
const lgRows = sid => (DATA.league_games || []).map((g, i) => ({ g, i })).filter(x => x.g.season === sid && x.g.home !== 'WSQ' && x.g.away !== 'WSQ');
function lgGroups(sid) {
  const by = {}; for (const r of lgRows(sid)) (by[r.g.date || ''] ||= []).push(r);
  const keys = Object.keys(by).sort((a, b) => !a ? 1 : !b ? -1 : a.localeCompare(b));
  return keys.map(d => ({ date: d || null, rows: by[d].sort((a, b) => (a.g.time || '99').localeCompare(b.g.time || '99') || a.i - b.i) }));
}
function lgTable(sid, groups, sched, showHeads = true) {
  const num = (i, k, v) => `<input type="number" min="0" style="width:4rem" data-lg="${i}" data-k="${k}" value="${v ?? ''}">`;
  const today = todayISO();
  const body = groups.map(({ date, rows }) => {
    const need = rows.filter(r => needsResult(r.g)), fillable = need.filter(r => siteFor(sid, r.g));
    const state = !date ? 'nodate' : need.length ? 'need' : date > today ? 'upcoming' : 'done';
    const label = { need: `${need.length} need${need.length === 1 ? 's' : ''} results`, upcoming: 'upcoming', done: 'all results in', nodate: 'no date' }[state];
    const head = showHeads ? `<tr class="lg-day ${state}" id="lgday-${date || 'none'}"><td colspan="11"><b>${esc(dayLabel(date))}</b> <span class="lg-state">${label}</span>
      ${fillable.length ? ` <button class="btn" data-lguseday="${date}">Fill ${fillable.length} from league site</button>` : ''}</td></tr>` : '';
    return head + rows.map(({ g, i }) => {
      const site = siteFor(sid, g), siteTxt = site ? `${site.home_score}–${site.away_score}${site.ot ? ' ' + site.ot : ''}` : '';
      const differs = site && C.lgFinal(g) && (site.home_score !== g.home_score || site.away_score !== g.away_score);
      return `<tr class="${needsResult(g) ? 'lg-need' : ''}">
      <td class="small muted">${g.time ? C.fmt.time(g.time) : ''}</td>
      <td class="l"><select data-lg="${i}" data-k="home">${lgTeamOpts(sid, g.home)}</select></td>
      <td class="l"><select data-lg="${i}" data-k="away">${lgTeamOpts(sid, g.away)}</select></td>
      <td class="l"><select data-lg="${i}" data-k="ot">${[[null, 'Regulation'], ['OT', 'Overtime'], ['SO', 'Shootout']].map(([v, t]) => `<option value="${v ?? ''}" ${C.lgOT(g) === v ? 'selected' : ''}>${t}</option>`).join('')}</select></td>
      <td>${num(i, 'home_score', g.home_score)}</td><td>${num(i, 'away_score', g.away_score)}</td><td>${num(i, 'home_shots', g.home_shots)}</td><td>${num(i, 'away_shots', g.away_shots)}</td>
      <td><input type="checkbox" data-lg="${i}" data-k="playoff" ${g.playoff ? 'checked' : ''} title="Playoff games don't count in the standings"></td>
      <td class="l small">${g.home && g.home === g.away ? '<span style="color:var(--red)">same team twice</span>' : lgResult(g)}
        ${site ? `<div class="lg-site${differs ? ' differs' : ''}">League site: ${siteTxt}${!C.lgFinal(g) ? ` <button class="linkbtn" data-lguse="${i}">use</button>` : differs ? ' (differs)' : ''}</div>` : ''}</td>
      <td><button class="x" data-dellg="${i}" title="Delete game">✕</button></td></tr>`;
    }).join('');
  }).join('');
  return `<div class="tw"><table class="lg-table"><thead><tr><th class="l">Time</th><th class="l">Home</th><th class="l">Away</th><th class="l">Decided in</th><th>Home<br>score</th><th>Away<br>score</th><th>Home<br>shots</th><th>Away<br>shots</th><th>Playoff</th><th class="l">Result</th><th></th></tr></thead>
    <tbody>${body || '<tr><td colspan="11" class="muted">No games yet.</td></tr>'}</tbody></table></div>`;
}
const unknownTeams = sid => (SCHED[sid]?.unknown_teams || []).filter(n => !C.teamByName(DATA, n));
function syncBox(s) {
  if (!s.schedule_url) return `<p class="lb-legacy">No league schedule link for ${esc(s.name)}. Add it on the <b>Season &amp; roster</b> tab to fetch the schedule and the league site's results automatically.</p>`;
  loadSchedule(s.id);
  const sc = SCHED[s.id], err = SCHED_ERR[s.id];
  const ago = sc ? Math.round((Date.now() - Date.parse(sc.fetched_at)) / 3600000) : null;
  return `<div class="lg-sync"><div><b>League schedule</b> · <a href="${esc(s.schedule_url)}" target="_blank" rel="noopener">league site ↗</a>
    ${sc ? ` · fetched ${ago < 1 ? 'within the hour' : ago < 48 ? ago + ' h ago' : Math.round(ago / 24) + ' days ago'} · ${sc.games.length} games on ${sc.days.length} days` : SCHED_LOADING.has(s.id) ? ' · loading…' : err ? ` · <span style="color:var(--red)">couldn't load (${esc(err)})</span>` : ''}
    ${unknownTeams(s.id).length ? `<br><span style="color:var(--red)">Teams on the league site that aren't in the data yet: ${unknownTeams(s.id).map(n => `${esc(n)} <button class="linkbtn" data-tnew="${esc(n)}">add team</button>`).join(', ')}. Their games are skipped until they're added.</span>` : ''}</div>
    ${sc ? `<button class="btn pri" id="l-sync">Sync schedule</button>` : `<button class="btn" id="l-reload">Try again</button>`}
    ${info('A GitHub job reads the league site every morning (and right after you publish a new schedule link). <b>Sync schedule</b> adds any games that are missing and fills in dates, times and home/away. It never changes a score: the league site’s results show next to each game, and you choose whether to use them.')}</div>
    ${L.report ? `<div class="lg-report">${L.report}</div>` : ''}`;
}
function leagueTab() {
  if (!L.id) L.id = C.latestSeason(IX).id;
  const s = IX.seasonById[L.id];
  const groups = lgGroups(L.id), sched = SCHED[L.id];
  const needDays = groups.filter(gr => gr.rows.some(r => needsResult(r.g)));
  const st = C.computeStandings(DATA, L.id);
  return `<div class="card">
  <div class="row"><label>Season<select id="l-pick">${seasonOpts(L.id)}</select></label>
    <p class="small muted" style="flex:1;min-width:260px;margin:0">Every game in the division that the Squawks <b>aren't</b> in. The Squawks' own games come from the Game tab, so they're never entered twice.</p></div>
  ${syncBox(s)}
  ${s.standings_from_games ? '' : `<p class="lb-legacy">${esc(s.name)}'s standings on the site are a snapshot copied from the sheet. <button class="btn" id="l-live">Use these games for ${esc(s.name)}'s standings</button></p>`}
  <h3>Standings ${info('2 points for a win, 1 for a tie or an overtime/shootout loss. A shootout can end tied (1 point each). Order: points, then wins, goal difference, goals for. Playoff games don\'t count.')}</h3>
  <div class="tw"><table><thead><tr><th>#</th><th class="l">Team</th><th>GP</th><th>W</th><th>L</th><th>T</th><th>OTL</th><th>PTS</th><th>GF</th><th>GA</th><th>DIFF</th><th>SF</th><th>SA</th></tr></thead><tbody>
  ${st.map((r, k) => `<tr${r.team === 'WSQ' ? ' style="font-weight:700"' : ''}><td>${k + 1}</td><td class="l">${esc(DATA.teams[r.team] || r.team)}</td><td>${r.gp}</td><td>${r.w}</td><td>${r.l}</td><td>${r.t}</td><td>${r.otl}</td><td>${r.pts}</td><td>${r.gf}</td><td>${r.ga}</td><td>${r.gf - r.ga > 0 ? '+' : ''}${r.gf - r.ga}</td><td>${r.shots ? r.sf : ''}</td><td>${r.shots ? r.sa : ''}</td></tr>`).join('')}
  </tbody></table></div>
  <h3 style="margin-top:1.2rem">Games by date</h3>
  ${needDays.length ? `<p class="lg-needs">Need results: ${needDays.map(gr => `<a href="#lgday-${gr.date}">${esc(dayLabel(gr.date))} (${gr.rows.filter(r => needsResult(r.g)).length})</a>`).join(' · ')}</p>` : '<p class="small muted">Every game played so far has a result.</p>'}
  ${lgTable(L.id, groups, sched)}
  <div class="row" style="margin-top:.6rem"><label>Date<input type="date" id="l-adddate" value="${esc(needDays[0]?.date || groups.filter(g => g.date).at(-1)?.date || '')}"></label><button class="btn" id="l-add">+ Add game on this date</button></div>
  <p class="small muted">For overtime and shootout games, enter the final score the way the league reports it. A shootout can end tied: that's a tie, 1 point each.</p></div>`;
}
// league game inputs work on both the League games tab and the Game tab's "League results" section
document.addEventListener('change', e => {
  const t = e.target; if (t.dataset.lg === undefined || (TAB !== 'league' && TAB !== 'game')) return;
  const g = DATA.league_games[+t.dataset.lg], k = t.dataset.k;
  if (k === 'playoff') g.playoff = t.checked;
  else if (k === 'ot') g.ot = t.value || null;
  else if (k === 'home' || k === 'away') g[k] = t.value || null;
  else g[k] = t.value === '' ? null : Math.max(0, Math.round(+t.value));
  if (g.ot === undefined) g.ot = C.lgOT(g);
  g.winner = C.lgWinner(g); reindex(); render();
});
function useSite(i) {
  const g = DATA.league_games[i], x = siteFor(g.season, g); if (!x || C.lgFinal(g)) return false;
  g.home_score = x.home_score; g.away_score = x.away_score; g.ot = x.ot || null; g.winner = C.lgWinner(g); return true;
}
document.addEventListener('click', e => {
  const t = e.target; if (TAB !== 'league' && TAB !== 'game') return;
  if (t.dataset.lguse !== undefined) { useSite(+t.dataset.lguse); reindex(); render(); }
  if (t.dataset.lguseday !== undefined) { const sid = TAB === 'game' ? G.f.season : L.id; let n = 0; for (const r of lgRows(sid)) if (r.g.date === t.dataset.lguseday && useSite(r.i)) n++; reindex(); render(); }
  if (t.dataset.dellg !== undefined) { const g = DATA.league_games[+t.dataset.dellg]; if (confirm(`Delete ${g.home ? DATA.teams[g.home] : '?'} vs ${g.away ? DATA.teams[g.away] : '?'}?`)) { DATA.league_games.splice(+t.dataset.dellg, 1); reindex(); render(); } }
});
document.addEventListener('change', e => {
  if (TAB !== 'league') return;
  const t = e.target;
  if (t.id === 'l-pick') { L.id = t.value; L.report = ''; return render(); }
});
document.addEventListener('click', e => {
  if (TAB !== 'league') return;
  const t = e.target;
  if (t.id === 'l-add') {
    const d = $('#l-adddate').value || null;
    (DATA.league_games ||= []).push({ season: L.id, date: d, time: null, home: null, away: null, home_score: null, away_score: null, home_shots: null, away_shots: null, ot: null, winner: null, playoff: false, championship: false });
    reindex(); render(); document.getElementById('lgday-' + (d || 'none'))?.scrollIntoView({ block: 'start' });
  }
  if (t.id === 'l-live') { if (confirm(`Work out ${IX.seasonById[L.id].name}'s standings from the games instead of the sheet snapshot?`)) { IX.seasonById[L.id].standings_from_games = true; reindex(); render(); } }
  if (t.id === 'l-reload') { delete SCHED_ERR[L.id]; loadSchedule(L.id, true); render(); }
  if (t.id === 'l-sync') {
    const r = C.mergeSchedule(DATA, L.id, SCHED[L.id], sid => cleanGame(newGame(sid)));
    const n = r.leagueAdded.length + r.leagueUpdated.length + r.squawksAdded.length + r.squawksUpdated.length;
    L.report = n || r.notes.length || r.unknownTeams.length ? `<b>Synced.</b> ${[
      r.leagueAdded.length && `${r.leagueAdded.length} league game${r.leagueAdded.length === 1 ? '' : 's'} added`,
      r.leagueUpdated.length && `${r.leagueUpdated.length} league game${r.leagueUpdated.length === 1 ? '' : 's'} given dates, times or home/away`,
      r.squawksAdded.length && `${r.squawksAdded.length} Squawks game${r.squawksAdded.length === 1 ? '' : 's'} added to the schedule`,
      r.squawksUpdated.length && `${r.squawksUpdated.length} Squawks game time${r.squawksUpdated.length === 1 ? '' : 's'} updated`].filter(Boolean).join(', ') || 'Nothing to change'}. No scores were changed.
      ${r.notes.map(x => `<br>⚠ ${esc(x)}`).join('')}${r.unknownTeams.length ? `<br>⚠ Skipped games with teams not in the data: ${r.unknownTeams.map(esc).join(', ')}.` : ''}` : '<b>Already up to date.</b> Nothing to change.';
    reindex(); render();
  }
});

// =====================================================================
// TEAMS (names, colors and logos)
// =====================================================================
let T = { name: '', code: '', bg: '#e9edf1', fg: '#333f42', logo: null, msg: '' };
const used = code => DATA.games.some(g => g.opponent === code) || (DATA.league_games || []).some(g => g.home === code || g.away === code)
  || (DATA.awards || []).some(a => [a.presidents, a.stanley_keg, a.runner_up, a.art_ross?.team, a.rocket?.team].includes(code))
  || DATA.seasons.some(s => (s.standings || []).some(r => r.team === code));
function suggestCode(name) {
  const w = name.toUpperCase().replace(/[^A-Z ]/g, '').split(/\s+/).filter(Boolean);
  const tries = [w.length > 1 ? w.map(x => x[0]).join('').slice(0, 3) : '', (w[0] || '').slice(0, 3), (w.join('') || '').replace(/[AEIOU]/g, '').slice(0, 3)].filter(x => x.length >= 2);
  for (const t of tries) if (!DATA.teams[t]) return t;
  for (let i = 2; i < 10; i++) { const t = (tries[0] || 'TM').slice(0, 2) + i; if (!DATA.teams[t]) return t; }
  return '';
}
// Shrinks an uploaded logo to at most 200 px and keeps it inside the data file, so publishing stays one upload.
function readLogo(file) {
  return new Promise((ok, bad) => {
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = () => { const k = Math.min(1, 200 / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement('canvas'); c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url); ok(c.toDataURL('image/png')); };
    img.onerror = () => { URL.revokeObjectURL(url); bad(new Error("That file isn't an image this browser can read.")); };
    img.src = url;
  });
}
const logoImg = (src, code) => src ? `<img class="t-logo" src="${esc(src)}" alt="">` : `<span class="t-logo none" style="background:${C.teamColor(DATA, code)[0]};color:${C.teamColor(DATA, code)[1]}">${esc(code || '?')}</span>`;
function teamsTab() {
  const unknown = [...new Set(Object.keys(SCHED).flatMap(unknownTeams))];
  const rows = Object.keys(DATA.teams).filter(c => c !== 'WSQ').sort((a, b) => DATA.teams[a].localeCompare(DATA.teams[b]));
  const [bg, fg] = [T.bg, T.fg];
  return `<div class="card">
  <h2 style="margin-top:0">Add a team</h2>
  ${unknown.length ? `<p class="lb-legacy">On the league site but not in the data yet: ${unknown.map(n => `<button class="btn" data-tnew="${esc(n)}">${esc(n)}</button>`).join(' ')}</p>` : ''}
  <div class="row t-add">
    <label style="flex:1;min-width:200px">Team name ${info('Use the name exactly as the league site writes it, so the schedule sync recognises the team.')}<input id="t-name" value="${esc(T.name)}"></label>
    <label>Code ${info('2-4 capital letters, used inside the data (e.g. FIC). It can’t be changed later.')}<input id="t-code" style="width:5.5rem" maxlength="4" value="${esc(T.code)}"></label>
    <label>Main color<input type="color" id="t-bg" value="${esc(bg)}"></label>
    <label>Text color<input type="color" id="t-fg" value="${esc(fg)}"></label>
    <label>Logo (optional)<input type="file" id="t-logo" accept="image/*"></label>
    <div class="t-preview">${logoImg(T.logo, T.code)}<span class="team" style="background:${bg};color:${fg}">${esc(T.name || 'Team name')}</span></div>
    <button class="btn pri" id="t-add">Add team</button>
  </div>
  ${T.msg ? `<p class="small" style="color:${T.msg.startsWith('✓') ? 'var(--green)' : 'var(--red)'}">${esc(T.msg)}</p>` : ''}
  <h2>Teams</h2>
  <div class="tw"><table><thead><tr><th class="l">Logo</th><th class="l">Code</th><th class="l">Name</th><th class="l">Main color</th><th class="l">Text color</th><th class="l">Preview</th><th class="l">Change logo</th><th></th></tr></thead><tbody>
  ${rows.map(c => { const [b, f] = C.teamColor(DATA, c), lg = (DATA.team_logos || {})[c];
    return `<tr><td class="l">${logoImg(lg, c)}</td><td class="l"><code>${c}</code></td>
    <td class="l"><input data-tm="${c}" data-k="name" value="${esc(DATA.teams[c])}" style="width:13rem"></td>
    <td class="l"><input type="color" data-tm="${c}" data-k="bg" value="${b}"></td><td class="l"><input type="color" data-tm="${c}" data-k="fg" value="${f}"></td>
    <td class="l"><span class="team" style="background:${b};color:${f}">${esc(DATA.teams[c])}</span></td>
    <td class="l"><input type="file" accept="image/*" data-tm="${c}" data-k="logo" style="width:12rem">${lg ? ` <button class="linkbtn" data-tlogodel="${c}">remove logo</button>` : ''}</td>
    <td>${used(c) ? '' : `<button class="x" data-tdel="${c}" title="Delete team (it has no games)">✕</button>`}</td></tr>`; }).join('')}
  </tbody></table></div>
  <p class="small muted">The WinterSquawks' own colors and logos are part of the site design and aren't edited here. Logos are shrunk to 200 px and saved inside the data file, so publishing is still one upload.</p></div>`;
}
document.addEventListener('input', e => {
  if (TAB !== 'teams') return; const t = e.target;
  if (t.id === 't-name') { const auto = !T.code || T.code === suggestCode(T.name); T.name = t.value; if (auto) { T.code = suggestCode(T.name); const c = $('#t-code'); if (c) c.value = T.code; } }
  if (t.id === 't-code') T.code = t.value.toUpperCase().replace(/[^A-Z]/g, '');
});
document.addEventListener('change', async e => {
  if (TAB !== 'teams') return; const t = e.target;
  if (t.id === 't-bg' || t.id === 't-fg') { T[t.id.slice(2)] = t.value; return render(); }
  if (t.id === 't-name' || t.id === 't-code') return render();
  if (t.id === 't-logo' && t.files[0]) { try { T.logo = await readLogo(t.files[0]); T.msg = ''; } catch (err) { T.msg = err.message; } return render(); }
  if (t.dataset.tm) {
    const c = t.dataset.tm, k = t.dataset.k;
    if (k === 'name') { const v = t.value.trim(); const clash = C.teamByName(DATA, v); if (!v || (clash && clash !== c)) { alert(v ? `${v} is already another team's name.` : 'A team needs a name.'); return render(); } DATA.teams[c] = v; }
    else if (k === 'bg' || k === 'fg') { const cur = [...C.teamColor(DATA, c)]; cur[k === 'bg' ? 0 : 1] = t.value; (DATA.team_colors ||= {})[c] = cur; }
    else if (k === 'logo' && t.files[0]) { try { (DATA.team_logos ||= {})[c] = await readLogo(t.files[0]); } catch (err) { alert(err.message); } }
    reindex(); render();
  }
});
document.addEventListener('click', e => {
  const t = e.target;
  if (t.dataset.tnew !== undefined) { T = { ...T, name: t.dataset.tnew, code: '', msg: '' }; T.code = suggestCode(T.name); if (TAB !== 'teams') switchTab('teams'); else render(); return; }
  if (TAB !== 'teams') return;
  if (t.id === 't-add') {
    const name = T.name.trim(), code = T.code.trim();
    const err = !name ? 'Enter the team name.' : !/^[A-Z]{2,4}$/.test(code) ? 'The code must be 2-4 capital letters.' : DATA.teams[code] ? `${code} is already used by ${DATA.teams[code]}.` : C.teamByName(DATA, name) ? `${name} is already a team.` : '';
    if (err) { T.msg = err; return render(); }
    DATA.teams[code] = name; (DATA.team_colors ||= {})[code] = [T.bg, T.fg]; if (T.logo) (DATA.team_logos ||= {})[code] = T.logo;
    T = { name: '', code: '', bg: '#e9edf1', fg: '#333f42', logo: null, msg: `✓ ${name} (${code}) added. Sync the schedule to pick up its games.` }; reindex(); render();
  }
  if (t.dataset.tlogodel) { if (confirm(`Remove ${DATA.teams[t.dataset.tlogodel]}'s logo?`)) { delete DATA.team_logos[t.dataset.tlogodel]; reindex(); render(); } }
  if (t.dataset.tdel) { const c = t.dataset.tdel; if (!used(c) && confirm(`Delete ${DATA.teams[c]}? It has no games.`)) { delete DATA.teams[c]; delete (DATA.team_colors || {})[c]; delete (DATA.team_logos || {})[c]; reindex(); render(); } }
});

// =====================================================================
// PLAYERS
// =====================================================================
function playersTab() {
  return `<div class="card"><h2 style="margin-top:0">Add a player</h2>
  <div class="row"><label>Full name<input id="p-name"></label><label>Number<input id="p-num" style="width:5rem"></label>
  <label>Position<select id="p-pos"><option>W</option><option>C</option><option>D</option><option>C/W</option><option>W/D</option><option>G</option></select></label>
  <label class="inline"><input type="checkbox" id="p-sub"> Sub goalie</label><button class="btn pri" id="p-add">Add</button></div><p id="p-msg" class="small"></p></div>
  <div class="card"><h2 style="margin-top:0">Edit players ${info('Changing a name here changes it everywhere. Player IDs never change, so links and history stay intact.')}</h2>
  <div class="tw"><table><thead><tr><th class="l">ID</th><th class="l">Name</th><th>#</th><th class="l">Position</th><th class="l">Nicknames</th><th class="l">Photos ${info('Image paths, main photo first, e.g. <code>img/players/nick-berry.jpg, img/players/nick-berry-alt.jpg</code>. With an ALT photo, one is picked at random each time the page opens. Leave blank to use the default silhouette.')}</th></tr></thead><tbody>
  ${[...DATA.players].sort((a, b) => a.name.localeCompare(b.name)).map(p => `<tr><td class="l small muted">${p.id}</td><td class="l"><input data-p="${p.id}" data-k="name" value="${esc(p.name)}"></td><td><input style="width:4rem" data-p="${p.id}" data-k="number" value="${esc(p.number ?? '')}"></td><td class="l"><input style="width:5rem" data-p="${p.id}" data-k="position" value="${esc(p.position ?? '')}"></td><td class="l"><input data-p="${p.id}" data-k="nicknames" value="${esc((p.nicknames || []).join(', '))}"></td><td class="l"><input style="width:18rem" data-p="${p.id}" data-k="photos" value="${esc((p.photos || []).join(', '))}"></td></tr>`).join('')}
  </tbody></table></div></div>`;
}
document.addEventListener('click', e => {
  if (TAB !== 'players' || e.target.id !== 'p-add') return;
  const name = $('#p-name').value.trim(); if (!name) return;
  let id = slug(name); if (IX.players[id]) { $('#p-msg').innerHTML = `<span style="color:var(--red)">A player with id "${id}" already exists. If this is a different person, add a middle initial.</span>`; return; }
  const pos = $('#p-pos').value;
  DATA.players.push({ id, name, number: $('#p-num').value.trim() || null, position: pos, goalie: pos === 'G', sub: $('#p-sub').checked, nicknames: [], links: [], photos: [] });
  DATA.players.sort((a, b) => a.name.localeCompare(b.name)); reindex(); render();
  $('#p-msg').textContent = `${name} added. Put them on a season roster from the Season tab.`;
});
document.addEventListener('change', e => {
  if (TAB !== 'players' || !e.target.dataset.p) return;
  const p = IX.players[e.target.dataset.p]; const k = e.target.dataset.k; const v = e.target.value.trim();
  p[k] = (k === 'nicknames' || k === 'photos') ? v.split(',').map(x => x.trim()).filter(Boolean) : (v || null); reindex();
});

// =====================================================================
// EXPORT
// =====================================================================
function changeSummary() {
  const O = JSON.parse(ORIGINAL); const out = [];
  const og = Object.fromEntries(O.games.map(g => [g.id, JSON.stringify(g)]));
  const ng = Object.fromEntries(DATA.games.map(g => [g.id, JSON.stringify(g)]));
  for (const id in ng) if (!og[id]) out.push(`Added game ${id}`); else if (og[id] !== ng[id]) out.push(`Edited game ${id}`);
  for (const id in og) if (!ng[id]) out.push(`Deleted game ${id}`);
  const op = new Set(O.players.map(p => p.id)); for (const p of DATA.players) if (!op.has(p.id)) out.push(`Added player ${p.name}`);
  const os = Object.fromEntries(O.seasons.map(s => [s.id, JSON.stringify(s)]));
  for (const s of DATA.seasons) if (!os[s.id]) out.push(`Added season ${s.id}`); else if (os[s.id] !== JSON.stringify(s)) out.push(`Edited season ${s.id} (roster, result or story)`);
  if (JSON.stringify(O.players) !== JSON.stringify(DATA.players) && !out.some(x => x.startsWith('Added player'))) out.push('Edited player details');
  const lgBy = (arr) => arr.reduce((m, g) => ((m[g.season] ||= []).push(JSON.stringify(g)), m), {});
  const ol = lgBy(O.league_games || []), nl = lgBy(DATA.league_games || []);
  for (const sid of new Set([...Object.keys(ol), ...Object.keys(nl)])) {
    const a = ol[sid] || [], b = nl[sid] || []; if (JSON.stringify(a) === JSON.stringify(b)) continue;
    out.push(`League games ${sid}: ${b.length - a.length > 0 ? `${b.length - a.length} added` : b.length - a.length < 0 ? `${a.length - b.length} removed` : 'edited'}`);
  }
  for (const c of Object.keys(DATA.teams)) if (!O.teams[c]) out.push(`Added team ${DATA.teams[c]} (${c})`);
  for (const c of Object.keys(O.teams)) if (!DATA.teams[c]) out.push(`Deleted team ${O.teams[c]} (${c})`);
  for (const c of Object.keys(DATA.teams)) if (O.teams[c] && (O.teams[c] !== DATA.teams[c] || JSON.stringify((O.team_colors || {})[c]) !== JSON.stringify((DATA.team_colors || {})[c]) || (O.team_logos || {})[c] !== (DATA.team_logos || {})[c])) out.push(`Edited team ${DATA.teams[c]}`);
  const oa = Object.fromEntries((O.awards || []).map(a => [a.season, JSON.stringify(a)]));
  for (const a of DATA.awards || []) if (oa[a.season] !== JSON.stringify(a)) out.push(`${oa[a.season] ? 'Edited' : 'Added'} Division 4 awards for ${a.season}`);
  return out;
}
function exportTab() {
  const v = C.validate(DATA); const ch = changeSummary();
  return `<div class="card"><h2 style="margin-top:0">Save &amp; publish</h2>
  ${ch.length ? `<p><b>Changes in this browser:</b></p><ul class="small">${ch.map(c => `<li>${esc(c)}</li>`).join('')}</ul>` : '<p class="muted">No changes yet.</p>'}
  <p class="small">${v.errs.length ? `<span style="color:var(--red)">✕ ${v.errs.length} error(s) must be fixed before publishing:</span><br>${v.errs.map(esc).join('<br>')}` : '<span style="color:var(--green)">✓ The data passes every check.</span>'}
  ${v.warns.length ? `<details><summary>${v.warns.length} warning(s), which won't block publishing</summary>${v.warns.map(esc).join('<br>')}</details>` : ''}</p>
  <div class="row"><button class="btn pri" id="x-dl" ${v.errs.length || !ch.length ? 'disabled' : ''}>Download squawks.json</button>
  <button class="btn" id="x-discard" ${ch.length ? '' : 'disabled'}>Discard all changes</button>
  <label class="btn" style="cursor:pointer">Load a different data file…<input type="file" id="x-load" accept=".json" hidden></label></div>
  <h3 style="margin-top:1.2rem">Publishing (about 1 minute)</h3>
  <ol class="steps small">
    <li>Click <b>Download squawks.json</b>.</li>
    <li>On GitHub, open the site's repository, go into the <code>data</code> folder and choose <b>Add file → Upload files</b>.</li>
    <li>Drop in the downloaded file. <b>It must be named exactly <code>squawks.json</code></b> so it replaces the old one. If your browser saved it as <code>squawks(1).json</code> or similar, rename it first, or delete older copies from your Downloads folder before downloading. Otherwise GitHub adds it as a new file and the site won't change (the automatic check will flag it).</li>
    <li>Write a short note (e.g. "F26 vs Fiction 11/20") and pick <b>Create a new branch… and start a pull request</b> (if you're the owner you can also commit straight to main).</li>
    <li>The automatic check runs on the pull request. If it's green and you approve, merge it. The site updates within a minute or two.</li>
  </ol></div>`;
}
document.addEventListener('click', e => {
  if (TAB !== 'export') return;
  if (e.target.id === 'x-dl') {
    const out = clone(DATA); out.meta.updated = new Date().toLocaleDateString('en-CA');
    const blob = new Blob([JSON.stringify(out, null, 1)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'squawks.json'; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  if (e.target.id === 'x-discard' && confirm('Throw away every change in this browser and reload the published data?')) {
    DATA = JSON.parse(ORIGINAL); try { localStorage.removeItem(DRAFT_KEY); } catch { } G = { season: null, id: null, f: null, msgs: null }; reindex(); render();
  }
});
document.addEventListener('change', e => {
  if (e.target.id !== 'x-load') return;
  const file = e.target.files[0]; if (!file) return;
  file.text().then(t => { const d = JSON.parse(t); if (!d.games || !d.players) throw new Error('Not a squawks data file'); DATA = d; G = { season: null, id: null, f: null, msgs: null }; reindex(); render(); })
    .catch(err => alert("Couldn't load that file: " + err.message));
});
// Hovering an abbreviated column header shows its full name after a second.
function headerTips(root) {
  for (const th of root.querySelectorAll ? root.querySelectorAll('th:not([data-tip])') : []) {
    const tip = th.getAttribute('title') || C.HEADER_TIPS[th.textContent.trim()];
    th.removeAttribute('title'); if (!tip) continue;
    th.dataset.tip = tip; th.classList.add('has-tip');
  }
}
new MutationObserver(ms => { for (const m of ms) for (const n of m.addedNodes) if (n.nodeType === 1) headerTips(n.tagName === 'TH' ? n.parentNode : n); })
  .observe(document.body, { childList: true, subtree: true });
