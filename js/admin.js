import * as C from './core.js';

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
function _render() { const pane = $('#pane'); pane.innerHTML = { game: gameTab, season: seasonTab, players: playersTab, export: exportTab }[TAB](); }

// =====================================================================
// GAME
// =====================================================================
let G = { season: null, id: null, f: null, msgs: null };
function seasonOpts(sel) { return [...IX.seasons].reverse().map(s => `<option value="${s.id}" ${s.id === sel ? 'selected' : ''}>${esc(s.name)}</option>`).join(''); }
function teamOpts(sel) { return Object.entries(DATA.teams).filter(([k]) => k !== 'WSQ').map(([k, v]) => `<option value="${k}" ${k === sel ? 'selected' : ''}>${esc(v)}</option>`).join(''); }
function newGame(season) {
  const n = (IX.gamesBySeason[season] || []).length + 1;
  let id; let k = n; do { id = `${season}-${String(k).padStart(2, '0')}`; k++; } while (DATA.games.some(g => g.id === id));
  const roster = defaultRoster(season);
  const goalies = roster.filter(p => IX.players[p]?.goalie && !IX.players[p]?.sub);
  return { id, season, date: '', time: '', opponent: '', result: null, ot: null, gf: null, ga: null, playoff: false, championship: false,
    roster, goalie: goalies[0] || null, goals: [], assists_unpaired: [], stars: [null, null, null], penalties: [],
    shots_for: null, shots_against: null, links: [], source: 'entry', status: 'scheduled', _new: true };
}
function defaultRoster(season) {
  const ros = (IX.seasonById[season]?.roster || []).filter(e => !(e.tags || []).some(t => /LTIR/i.test(t)));
  const sk = ros.filter(e => e.pos !== 'G').map(e => e.player);
  const g = ros.find(e => e.pos === 'G' && !IX.players[e.player]?.sub);
  return [...new Set([...(g ? [g.player] : []), ...sk])];
}
function loadGame(id) {
  const g = clone(DATA.games.find(x => x.id === id));
  if (g.status !== 'final' && !g.roster.length) { g.roster = defaultRoster(g.season); g.goalie = g.goalie || g.roster.find(p => IX.players[p]?.goalie && !IX.players[p]?.sub) || null; }
  g.stars = g.stars?.length ? g.stars : [null, null, null]; while (g.stars.length < 3) g.stars.push(null);
  return g;
}
function gameTab() {
  if (!G.season) G.season = C.latestSeason(IX).id;
  const gs = IX.gamesBySeason[G.season] || [];
  if (!G.f) {
    const nxt = gs.find(g => g.status !== 'final');
    if (nxt) { G.id = nxt.id; G.f = loadGame(nxt.id); } else { G.f = newGame(G.season); G.id = null; }
  }
  const f = G.f, s = IX.seasonById[f.season];
  const gameOpts = gs.map(g => `<option value="${g.id}" ${g.id === G.id ? 'selected' : ''}>${C.fmt.date(g.date) || '(no date)'} vs ${esc(DATA.teams[g.opponent] || '?')} ${g.status === 'final' ? `· ${g.result} ${g.gf}-${g.ga}` : '· scheduled'}</option>`).join('');
  // candidate players: season roster + everyone already in this game
  const cand = [...new Set([...(s.roster || []).map(e => e.player), ...f.roster])];
  const others = DATA.players.filter(p => !cand.includes(p.id)).sort((a, b) => a.name.localeCompare(b.name));
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
  <h3 style="margin-top:1rem">Lineup</h3>
  <div class="row"><label>Goalie<select data-b="goalie"><option value="">—</option>${goalieCand.map(p => `<option value="${p}" ${p === f.goalie ? 'selected' : ''}>${esc(pname(p))}</option>`).join('')}</select></label>
    <label>Add a player not on the season roster<select id="g-addp"><option value="">—</option>${others.map(p => `<option value="${p.id}">${esc(p.name)}</option>`).join('')}</select></label></div>
  <div class="chk">${cand.filter(p => p !== f.goalie).map(p => `<label><input type="checkbox" data-roster="${p}" ${f.roster.includes(p) ? 'checked' : ''}> ${esc(pname(p))}</label>`).join('')}</div>
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
  </div>`;
}
function shootoutForm(f, popts) {
  const so = f.shootout || { goals: [], goalie: f.goalie || null, saves: null, ga: null };
  const gcand = [...new Set([f.goalie, ...DATA.players.filter(p => p.goalie).map(p => p.id)].filter(Boolean))];
  return `<h3 style="margin-top:1rem">Shootout ${info('Kept separate: shootout goals, saves and goals allowed never count toward regular stats or team totals. Shootout goals are not added to the Goals list above.')}</h3>
  <div class="row"><label>Our goalie<select data-so="goalie"><option value="">—</option>${gcand.map(p => `<option value="${p}" ${p === so.goalie ? 'selected' : ''}>${esc(pname(p))}</option>`).join('')}</select></label>
    <label>Saves<input type="number" min="0" style="width:5rem" data-so="saves" value="${so.saves ?? ''}"></label>
    <label>Goals allowed<input type="number" min="0" style="width:5rem" data-so="ga" value="${so.ga ?? ''}"></label></div>
  <div class="row">${(so.goals || []).map((p, i) => `<label>Shootout goal ${i + 1}<select data-sog="${i}">${popts(p)}</select></label> <button class="x" data-delsog="${i}">✕</button>`).join('')}
    <button class="btn" id="g-addsog">+ Shootout goal</button></div>`;
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
  if (f.goalie && !f.roster.includes(f.goalie)) f.roster.unshift(f.goalie);
  f.penalties = f.penalties.filter(p => p.player);
  if (!f.notes) delete f.notes;
  if (!f.en_against) delete f.en_against;
  if (!f.forfeit) delete f.forfeit;
  if (f.ot !== 'SO') delete f.shootout;
  else if (f.shootout) { f.shootout.goals = (f.shootout.goals || []).filter(Boolean); if (!f.shootout.goals.length && f.shootout.saves == null && f.shootout.ga == null && !f.shootout.goalie) delete f.shootout; }
  delete f._new; delete f._manualResult;
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
  if (t.id === 'g-addp' && t.value) { f.roster.push(t.value); return render(); }
  if (t.dataset.b) {
    if (t.type === 'checkbox') f[t.dataset.b] = t.checked;
    else if (t.tagName === 'SELECT') {
      if (t.dataset.b === 'result') { f._manualResult = !!t.value; f.result = t.value || null; }
      else f[t.dataset.b] = t.value || null;
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
  if (t.dataset.so) { const so = f.shootout ||= { goals: [], goalie: f.goalie || null, saves: null, ga: null }; so[t.dataset.so] = t.dataset.so === 'goalie' ? (t.value || null) : (t.value === '' ? null : +t.value); return; }
  if (t.dataset.sog !== undefined) { f.shootout.goals[+t.dataset.sog] = t.value || null; return; }
  if (t.dataset.pen !== undefined && t.tagName === 'SELECT') { f.penalties[+t.dataset.pen].player = t.value || null; return; }
});
function leaveOK() {
  if (!G.f) return true;
  const base = G.id ? (() => { const b = loadGame(G.id); delete b._new; return b; })() : null;
  const same = base ? JSON.stringify(gameFromForm().goals) === JSON.stringify(base.goals) && G.f.gf === base.gf && G.f.ga === base.ga && G.f.status === base.status && JSON.stringify(G.f.roster) === JSON.stringify(base.roster) : !G.f.opponent && !G.f.date && !G.f.goals.length;
  return same || confirm('Discard the edits to this game?');
}
document.addEventListener('click', e => {
  if (TAB !== 'game' || !G.f) return;
  const t = e.target; const f = G.f;
  if (t.id === 'g-addgoal') { f.goals.push({ scorer: null, a1: null, a2: null, video: null }); render(); }
  else if (t.dataset.delgoal !== undefined) { f.goals.splice(+t.dataset.delgoal, 1); render(); }
  else if (t.id === 'g-addsog') { const so = f.shootout ||= { goals: [], goalie: f.goalie || null, saves: null, ga: null }; so.goals.push(null); render(); }
  else if (t.dataset.delsog !== undefined) { f.shootout.goals.splice(+t.dataset.delsog, 1); render(); }
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
    if (!g.roster.length && !g.forfeit) pre.push('Tick who played.');
  }
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
    <label class="inline"><input type="checkbox" data-s="champion" ${s.champion ? 'checked' : ''}> 🏆 Stanley Keg</label>
    <label class="inline"><input type="checkbox" data-s="presidents" ${s.presidents ? 'checked' : ''}> 🥇 President's</label>
    <label class="inline"><input type="checkbox" data-s="runner_up" ${s.runner_up ? 'checked' : ''}> Runner-up</label>
  </div>
  <div class="row"><label style="flex:1">Story title<input data-s="story_title" value="${esc(s.story_title || '')}"></label></div>
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
  <h3>Add schedule ${info('One game per line, e.g. <code>2027-01-08 20:40 Puck Norris</code>. They go in as scheduled games.')}</h3>
  <textarea id="s-sched" placeholder="2027-01-08 20:40 Puck Norris"></textarea>
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
      team_name: 'WinterSquawks', division: cur.division, tracking: 'game-log', in_totals: true, verification: null, standings: [], leaders: { art_ross: [], rocket: [] },
      story_title: null, story: [], roster: cur.roster.filter(r => r.pos !== 'G' || !IX.players[r.player]?.sub).map(r => ({ ...r, tags: (r.tags || []).filter(x => x === 'C'), legacy: undefined })),
      result: null, champion: false, presidents: false, runner_up: false, place: null });
    reindex(); S.id = id; S.msg = `${id} created.`; render();
  }
  if (t.dataset.delr !== undefined) { if (confirm(`Remove ${pname(s.roster[+t.dataset.delr].player)} from the ${s.name} roster? Their games stay.`)) { s.roster.splice(+t.dataset.delr, 1); reindex(); render(); } }
  if (t.id === 's-addsched') {
    const lines = $('#s-sched').value.split('\n').map(x => x.trim()).filter(Boolean); const bad = []; let n = 0;
    const byName = Object.fromEntries(Object.entries(DATA.teams).map(([k, v]) => [v.toLowerCase(), k]));
    for (const l of lines) {
      const m = l.match(/^(\d{4}-\d{2}-\d{2})\s+(\d{1,2}:\d{2})?\s*(.+)$/);
      const opp = m && (byName[m[3].trim().toLowerCase()] || (DATA.teams[m[3].trim().toUpperCase()] ? m[3].trim().toUpperCase() : null));
      if (!m || !opp) { bad.push(l); continue; }
      const g = newGame(s.id); g.date = m[1]; g.time = m[2] ? m[2].padStart(5, '0') : null; g.opponent = opp; delete g._new;
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
    <li>Drop in the downloaded <code>squawks.json</code>. It replaces the old one.</li>
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

