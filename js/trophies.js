// Trophy room: a high-school trophy case drawn in a bright, outlined video-game style,
// and the Stanley Keg engraving viewer (zooms into each champion's etching).
// Everything is SVG/HTML generated from the data; nothing here is hand-placed per season.

const INK = '#16212b';   // outline colour for the cartoon look
let uid = 0;             // unique ids for SVG gradients/clips (several trophies on one page)

// ---------------------------------------------------------------- helpers
const svgText = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function chrome(id, dark = '#56616b') {
  return `<linearGradient id="${id}" x1="0" x2="1" y1="0" y2="0">
    <stop offset="0" stop-color="${dark}"/><stop offset=".14" stop-color="#b9c4cc"/><stop offset=".33" stop-color="#f3f7fa"/>
    <stop offset=".42" stop-color="#ffffff"/><stop offset=".58" stop-color="#c4ced6"/><stop offset=".84" stop-color="#8a97a2"/><stop offset="1" stop-color="${dark}"/></linearGradient>`;
}

// ---------------------------------------------------------------- the Stanley Keg
// A silver keg on a wooden base with a bowl on top (as in the championship photos), team-logo stickers, and a brass plaque.
export function kegSVG({ wins, stickers }) {
  const id = 'k' + (++uid);
  const spots = [[84, 122, -14], [150, 118, 11], [104, 178, 8], [158, 186, -9], [80, 228, 12], [134, 232, -6], [118, 120, 4], [96, 150, -4], [150, 152, 14], [126, 206, -12]];
  const st = stickers.slice(0, spots.length).map((s, i) => {
    const [x, y, r] = spots[i], cid = `${id}c${i}`;
    const inner = s.logo
      ? `<clipPath id="${cid}"><circle cx="0" cy="0" r="11"/></clipPath><circle r="11" fill="#fff"/><image href="${svgText(s.logo)}" x="-11" y="-11" width="22" height="22" preserveAspectRatio="xMidYMid meet" clip-path="url(#${cid})"/>`
      : `<circle r="11" fill="${s.bg}"/><text y="3.2" text-anchor="middle" font-size="8" font-weight="800" fill="${s.fg}" font-family="system-ui,sans-serif">${svgText(s.code)}</text>`;
    return `<g transform="translate(${x} ${y}) rotate(${r})"><circle r="13.5" fill="#fff" stroke="${INK}" stroke-width="2"/>${inner}<title>${svgText(s.name)}</title></g>`;
  }).join('');
  const plaque = wins === 1 ? ['', 'STANLEY KEG', 'CHAMPIONS'] : [`${wins}-TIME`, 'STANLEY KEG', 'CHAMPIONS'];
  return `<svg viewBox="0 0 240 340" class="tc-svg" role="img" aria-label="The Stanley Keg">
  <defs>${chrome(id + 'g')}${chrome(id + 'r', '#3d474f')}
    <linearGradient id="${id}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a8642c"/><stop offset="1" stop-color="#6b3815"/></linearGradient>
    <linearGradient id="${id}wt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d08a44"/><stop offset="1" stop-color="#b06a2c"/></linearGradient>
    <linearGradient id="${id}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe9a3"/><stop offset=".5" stop-color="#e0b453"/><stop offset="1" stop-color="#b8862a"/></linearGradient>
    <radialGradient id="${id}bowl" cx=".5" cy=".2" r=".8"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#c7d1d8"/><stop offset="1" stop-color="#7d8994"/></radialGradient></defs>
  <ellipse cx="120" cy="322" rx="98" ry="9" fill="#000" opacity=".28"/>
  <!-- wooden base -->
  <path d="M52 250 L188 250 L200 262 L40 262 Z" fill="url(#${id}wt)" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <rect x="40" y="262" width="160" height="56" rx="3" fill="url(#${id}w)" stroke="${INK}" stroke-width="3"/>
  <path d="M46 268 H194" stroke="#ffffff" stroke-opacity=".18" stroke-width="2"/>
  <rect x="62" y="270" width="116" height="40" rx="3" fill="url(#${id}b)" stroke="${INK}" stroke-width="2.5"/>
  <rect x="66" y="274" width="108" height="32" rx="2" fill="none" stroke="#8a6416" stroke-width="1"/>
  <g font-family="'Copperplate','Copperplate Gothic Bold','Arial Black',sans-serif" fill="#4a3208" text-anchor="middle">
    ${plaque[0] ? `<text x="120" y="282" font-size="7" font-weight="700" letter-spacing="1.2">${plaque[0]}</text>` : ''}
    <text x="120" y="${plaque[0] ? 293 : 288}" font-size="10" font-weight="800" letter-spacing=".6">${plaque[1]}</text>
    <text x="120" y="${plaque[0] ? 303 : 300}" font-size="7" font-weight="700" letter-spacing="1.4">${plaque[2]}</text></g>
  <!-- keg body -->
  <rect x="62" y="96" width="116" height="156" rx="6" fill="url(#${id}g)" stroke="${INK}" stroke-width="3"/>
  <rect x="98" y="100" width="9" height="148" rx="4" fill="#fff" opacity=".55"/>
  <rect x="112" y="100" width="3" height="148" rx="1.5" fill="#fff" opacity=".45"/>
  <g stroke="${INK}" stroke-width="2.5">
    <rect x="57" y="138" width="126" height="10" rx="5" fill="url(#${id}r)"/>
    <rect x="57" y="200" width="126" height="10" rx="5" fill="url(#${id}r)"/></g>
  <path d="M60 141 H180 M60 203 H180" stroke="#fff" stroke-opacity=".6" stroke-width="1.5"/>
  ${st}
  <!-- chime with hand holes -->
  <rect x="58" y="78" width="124" height="22" rx="5" fill="url(#${id}r)" stroke="${INK}" stroke-width="3"/>
  <rect x="76" y="84" width="28" height="10" rx="5" fill="${INK}"/><rect x="136" y="84" width="28" height="10" rx="5" fill="${INK}"/>
  <!-- bowl -->
  <rect x="110" y="62" width="20" height="18" fill="url(#${id}g)" stroke="${INK}" stroke-width="2.5"/>
  <path d="M46 46 Q120 98 194 46 Z" fill="url(#${id}bowl)" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <ellipse cx="120" cy="46" rx="74" ry="12" fill="#e9eef2" stroke="${INK}" stroke-width="3"/>
  <ellipse cx="120" cy="47" rx="64" ry="8" fill="#9aa6b0"/>
  <path d="M62 54 Q90 70 118 72" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".8"/>
  <!-- sparkle -->
  <path d="M190 112 l3 -9 l3 9 l9 3 l-9 3 l-3 9 l-3 -9 l-9 -3 z" fill="#fff" class="tc-sparkle"/>
  </svg>`;
}

// ---------------------------------------------------------------- President's Trophy
// Glass bowl, crossed sticks, three chrome posts, black base; the plaque carries the team, season and record.
export function presidentsSVG({ season, record }) {
  const id = 'p' + (++uid);
  return `<svg viewBox="0 0 170 300" class="tc-svg" role="img" aria-label="President's Trophy, ${svgText(season)}">
  <defs>${chrome(id + 'g')}
    <linearGradient id="${id}glass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9fbff" stop-opacity=".85"/><stop offset="1" stop-color="#8fd3e8" stop-opacity=".55"/></linearGradient>
    <linearGradient id="${id}gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff0b3"/><stop offset=".5" stop-color="#e3b44e"/><stop offset="1" stop-color="#a8781d"/></linearGradient></defs>
  <ellipse cx="85" cy="292" rx="66" ry="6" fill="#000" opacity=".28"/>
  <!-- crossed sticks -->
  <g stroke="${INK}" stroke-width="2.5" stroke-linejoin="round">
    <path d="M44 50 L124 100" stroke-width="7" stroke="${INK}"/><path d="M44 50 L124 100" stroke-width="4" stroke="url(#${id}gold)"/>
    <path d="M126 50 L46 100" stroke-width="7" stroke="${INK}"/><path d="M126 50 L46 100" stroke-width="4" stroke="url(#${id}gold)"/>
    <path d="M124 100 l14 -4 l3 6 l-15 4 z" fill="url(#${id}gold)"/><path d="M46 100 l-14 -4 l-3 6 l15 4 z" fill="url(#${id}gold)"/></g>
  <!-- glass bowl -->
  <path d="M8 40 Q85 76 162 40 Z" fill="url(#${id}glass)" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <ellipse cx="85" cy="40" rx="78" ry="11" fill="#f2fdff" fill-opacity=".75" stroke="${INK}" stroke-width="3"/>
  <ellipse cx="85" cy="40" rx="66" ry="6" fill="none" stroke="#bfe9f5" stroke-width="2"/>
  <path d="M26 46 Q55 60 86 63" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity=".9"/>
  <!-- platform -->
  <path d="M36 104 H134 L128 118 H42 Z" fill="url(#${id}g)" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M78 104 h14 v9 q-7 6 -14 0 z" fill="#fff" stroke="${INK}" stroke-width="1.8"/>
  <path d="M85 106.5 l1.4 2.8 l3 .4 l-2.2 2.1 l.5 3 l-2.7 -1.4 l-2.7 1.4 l.5 -3 l-2.2 -2.1 l3 -.4 z" fill="#912522"/>
  <!-- three posts -->
  <g stroke="${INK}" stroke-width="2.5">
    <rect x="78" y="118" width="14" height="104" fill="url(#${id}g)" opacity=".85"/>
    <rect x="48" y="118" width="13" height="108" rx="2" fill="url(#${id}g)"/>
    <rect x="109" y="118" width="13" height="108" rx="2" fill="url(#${id}g)"/></g>
  <path d="M52 122 V222 M113 122 V222" stroke="#fff" stroke-width="2.5" opacity=".8"/>
  <path d="M30 226 H140 L146 236 H24 Z" fill="url(#${id}g)" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <!-- black base and plaque -->
  <rect x="20" y="236" width="130" height="52" rx="3" fill="#25292e" stroke="${INK}" stroke-width="3"/>
  <path d="M24 241 H146" stroke="#fff" stroke-opacity=".15" stroke-width="2"/>
  <rect x="31" y="243" width="108" height="38" rx="2" fill="url(#${id}g)" stroke="${INK}" stroke-width="2"/>
  <g font-family="'Copperplate','Copperplate Gothic Bold','Arial Black',sans-serif" text-anchor="middle" fill="#2d3740">
    <text x="85" y="255" font-size="8.5" font-weight="800" textLength="94" lengthAdjust="spacingAndGlyphs">WINTERSQUAWKS</text>
    <path d="M44 258 H126" stroke="#2d3740" stroke-width=".8"/>
    <text x="85" y="268" font-size="7.5" font-weight="700" letter-spacing="1">${svgText(season.toUpperCase())}</text>
    <text x="85" y="278" font-size="8" font-weight="800" letter-spacing="1.2">${svgText(record)}</text></g>
  </svg>`;
}

// ---------------------------------------------------------------- runner-up medal
export function medalSVG({ season }) {
  const id = 'm' + (++uid);
  const [term, year] = season.split(' ');
  return `<svg viewBox="0 0 80 150" class="tc-svg" role="img" aria-label="Runner-up medal, ${svgText(season)}">
  <defs><radialGradient id="${id}s" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#ffffff"/><stop offset=".45" stop-color="#d5dde3"/><stop offset="1" stop-color="#7c8892"/></radialGradient></defs>
  <g stroke="${INK}" stroke-width="2.5" stroke-linejoin="round">
    <path d="M14 0 H34 L46 70 H34 Z" fill="#a6c1da"/><path d="M46 0 H66 L46 70 H34 Z" fill="#912522"/>
    <path d="M22 0 L38 66" stroke="#fff" stroke-width="2" opacity=".7"/></g>
  <circle cx="40" cy="74" r="6" fill="none" stroke="${INK}" stroke-width="3"/><circle cx="40" cy="74" r="6" fill="none" stroke="#c3ccd3" stroke-width="1.5"/>
  <circle cx="40" cy="108" r="30" fill="url(#${id}s)" stroke="${INK}" stroke-width="3"/>
  <circle cx="40" cy="108" r="23" fill="none" stroke="#8592a0" stroke-width="1.5"/>
  <path d="M24 96 a18 18 0 0 1 12 -10" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".9"/>
  <g font-family="'Copperplate','Copperplate Gothic Bold','Arial Black',sans-serif" text-anchor="middle" fill="#3b4652">
    <text x="40" y="106" font-size="9.5" font-weight="800">${svgText((term || '').toUpperCase())}</text>
    <text x="40" y="119" font-size="11" font-weight="800">${svgText(year || '')}</text></g>
  </svg>`;
}

// ---------------------------------------------------------------- Art Ross and "Rocket" Richard
// winners: oldest → newest, each { season, short, name, value, team, teamName, photo, href, wsq }
function winnerFace(w, unit) {
  return w.photo ? `<img src="${svgText(w.photo)}" alt="">`
    : `<span class="aw-eng"><small>${svgText(w.short)}</small><b>${svgText(w.value ?? '')}</b><small>${unit}</small></span>`;
}
const wTitle = (w, unit) => `${w.name}, ${w.teamName}: ${w.value ?? '?'} ${unit === 'PTS' ? 'points' : 'goals'} (${w.seasonName})`;
const wTag = (w, inner) => w.href ? `<a class="${inner[0]}" href="${w.href}" title="${svgText(inner[1])}">` : `<div class="${inner[0]}" title="${svgText(inner[1])}">`;
const wEnd = w => w.href ? '</a>' : '</div>';

export function artRossSVG() {
  const id = 'a' + (++uid);
  return `<svg viewBox="0 0 260 120" class="tc-svg aw-top" aria-hidden="true">
  <defs>${chrome(id + 'g')}
    <radialGradient id="${id}b" cx=".4" cy=".25" r=".9"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#cdd6dd"/><stop offset="1" stop-color="#76838e"/></radialGradient></defs>
  <!-- foot -->
  <path d="M92 106 H168 L176 118 H84 Z" fill="#2a2d31" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M100 92 H160 L166 106 H94 Z" fill="url(#${id}g)" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <rect x="112" y="80" width="36" height="14" fill="url(#${id}g)" stroke="${INK}" stroke-width="2.5"/>
  <!-- bowl -->
  <path d="M46 22 Q48 74 130 84 Q212 74 214 22 Z" fill="url(#${id}b)" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M58 44 Q130 58 202 44" fill="none" stroke="#8c99a4" stroke-width="2"/>
  <path d="M60 52 Q66 62 76 58 Q86 66 96 58 Q108 68 118 60 M142 60 Q152 68 164 58 Q174 66 184 58 Q194 62 200 52" fill="none" stroke="#6f7c87" stroke-width="2" stroke-linecap="round"/>
  <ellipse cx="130" cy="22" rx="86" ry="12" fill="#eef3f6" stroke="${INK}" stroke-width="3"/>
  <ellipse cx="130" cy="23" rx="76" ry="7" fill="#9aa6b0"/>
  <!-- lion-head handles with rings -->
  <g stroke="${INK}" stroke-width="2.5"><circle cx="40" cy="36" r="10" fill="url(#${id}g)"/><circle cx="220" cy="36" r="10" fill="url(#${id}g)"/>
    <circle cx="38" cy="54" r="7" fill="none"/><circle cx="222" cy="54" r="7" fill="none"/></g>
  <circle cx="37" cy="34" r="2" fill="${INK}"/><circle cx="43" cy="34" r="2" fill="${INK}"/><circle cx="217" cy="34" r="2" fill="${INK}"/><circle cx="223" cy="34" r="2" fill="${INK}"/>
  <path d="M70 34 Q96 60 128 66" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".85"/>
  <text x="130" y="40" text-anchor="middle" font-family="'Copperplate','Copperplate Gothic Bold','Arial Black',sans-serif" font-size="7.5" font-weight="800" fill="#4f5b66" letter-spacing="1">ART ROSS TROPHY</text>
  </svg>`;
}
export function rocketSVG() {
  const id = 'r' + (++uid);
  return `<svg viewBox="0 0 260 150" class="tc-svg aw-top" aria-hidden="true">
  <defs>${chrome(id + 'g')}
    <linearGradient id="${id}gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe9a3"/><stop offset=".5" stop-color="#d9a441"/><stop offset="1" stop-color="#8f611a"/></linearGradient>
    <linearGradient id="${id}w" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7d8994"/><stop offset=".35" stop-color="#ffffff"/><stop offset=".7" stop-color="#b8c3cb"/><stop offset="1" stop-color="#5c6772"/></linearGradient></defs>
  <!-- the split, flared cup -->
  <path d="M22 10 L64 4 L118 128 L104 132 Z" fill="url(#${id}w)" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M238 10 L196 4 L142 128 L156 132 Z" fill="url(#${id}w)" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M30 12 L106 126 M230 12 L154 126" stroke="#fff" stroke-width="2.5" opacity=".8"/>
  <!-- the skater -->
  <g fill="url(#${id}gold)" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round">
    <path d="M122 46 Q140 38 152 52 L148 78 Q136 84 124 78 Z"/>
    <circle cx="140" cy="34" r="9"/>
    <path d="M124 54 L108 70 L116 76 L130 64"/><path d="M150 56 L160 72 L150 80"/>
    <path d="M128 78 L114 108 L124 112 L138 84"/><path d="M144 80 L156 104 L168 104 L152 76"/>
    <path d="M152 80 L132 126 L122 126" fill="none" stroke-width="4"/><path d="M152 80 L132 126 L122 126" fill="none" stroke="url(#${id}gold)" stroke-width="2"/></g>
  <!-- collar -->
  <ellipse cx="130" cy="132" rx="58" ry="9" fill="url(#${id}g)" stroke="${INK}" stroke-width="3"/>
  <path d="M74 132 V142 Q130 156 186 142 V132" fill="url(#${id}g)" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  </svg>`;
}
function artRoss(winners) {
  const pucks = winners.map(w => `${wTag(w, ['ar-puck' + (w.wsq ? ' wsq' : ''), wTitle(w, 'PTS')])}<span class="ar-face">${winnerFace(w, 'PTS')}</span>
      <span class="ar-name">${svgText(w.name)}</span><span class="ar-sub">${svgText(w.short)} · ${w.value ?? '?'} pts</span>${wEnd(w)}`).join('');
  return `<div class="aw-trophy aw-ross">${artRossSVG()}<div class="ar-base"><div class="ar-grid">${pucks}</div></div>
    <div class="tc-card">Art Ross Trophy<br><b>Division points leaders</b></div></div>`;
}
function rocket(winners) {
  const plaques = winners.map(w => `${wTag(w, ['rr-plaque' + (w.wsq ? ' wsq' : ''), wTitle(w, 'G')])}${w.photo ? `<img src="${svgText(w.photo)}" alt="">` : ''}
      <span class="rr-txt"><span class="rr-name">${svgText(w.name)}</span><span class="rr-sub">${svgText(w.short)} · ${w.value ?? '?'} goals</span></span>${wEnd(w)}`).join('');
  return `<div class="aw-trophy aw-rocket">${rocketSVG()}<div class="rr-base"><div class="rr-grid">${plaques}</div></div>
    <div class="tc-card">"Rocket" Richard Trophy<br><b>Division goal leaders</b></div></div>`;
}

// ---------------------------------------------------------------- the case
// ctx: { champions, wsqWins, presidents: [{id,name,record}], runnerUps: [{id,name}], stickers }
export function trophyCase(ctx) {
  const pres = ctx.presidents.map(p => `<a class="tc-item tc-pres" href="#/season/${p.id}" title="${svgText(p.name)}: ${svgText(p.record)}">
      ${presidentsSVG({ season: p.name, record: p.record })}<div class="tc-card">President's Trophy<br><b>${svgText(p.name)}</b></div></a>`).join('');
  const medals = ctx.runnerUps.map(r => `<a class="tc-medal" href="#/season/${r.id}" title="Runner-up, ${svgText(r.name)}">
      <span class="tc-hook"></span>${medalSVG({ season: r.name })}</a>`).join('');
  return `<section class="tcase" aria-label="Trophy case">
    <div class="tc-crown"><span>WinterSquawks</span> Trophy Case</div>
    <div class="tc-frame"><div class="tc-inner">
      <div class="tc-spots" aria-hidden="true"><i></i><i></i><i></i></div>
      <div class="tc-shelf tc-top">
        <button class="tc-item tc-keg" id="tc-keg" type="button" aria-label="The Stanley Keg: read the engravings">
          ${kegSVG({ wins: ctx.wsqWins, stickers: ctx.stickers })}
          <div class="tc-card">The Stanley Keg<br><b>${ctx.champions.filter(c => c.team === 'WSQ').map(c => c.short).join(' · ') || 'Not yet…'}</b></div>
          <span class="tc-hint">Click to read the engravings</span></button>
      </div>
      <div class="tc-glass-shelf"></div>
      <div class="tc-shelf">${pres}</div>
      ${ctx.artRoss.length || ctx.rocket.length ? `<div class="tc-glass-shelf"></div>
      <div class="tc-shelf tc-awards">${ctx.artRoss.length ? artRoss(ctx.artRoss) : ''}${ctx.rocket.length ? rocket(ctx.rocket) : ''}</div>` : ''}
      <div class="tc-glass-shelf"></div>
      <div class="tc-rail-wrap"><div class="tc-rail"></div><div class="tc-medals">${medals}</div>
        <div class="tc-card tc-rail-card">Runner-up finishes · ${ctx.runnerUps.length}</div></div>
    </div><div class="tc-glass" aria-hidden="true"></div></div>
    <div class="tc-plinth"></div>
  </section>`;
}

// ---------------------------------------------------------------- engraving viewer
// champions: oldest → newest, each { season, name, short, team, teamName, names: [{text, href}] }
// 6 champions per ring, rings top to bottom; opens zoomed out, then zooms into the latest champion.
export function openKeg(champions, stickers) {
  if (!champions.length) return;
  const rings = []; for (let i = 0; i < champions.length; i += 6) rings.push(champions.slice(i, i + 6));
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let k = 0; const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const panel = (c, i) => `<div class="kv-panel${c.team === 'WSQ' ? ' wsq' : ''}" data-i="${i}">
      <div class="kv-head"><div class="kv-team">${esc(c.teamName)} <span>${esc(c.name)}</span></div>
        ${c.captain ? `<div class="kv-capt">Captain: ${c.captain.href ? `<a href="${c.captain.href}">${esc(c.captain.text)}</a>` : esc(c.captain.text)}</div>` : ''}</div>
      <div class="kv-names">${c.names.length ? c.names.map(n => n.href ? `<a href="${n.href}">${esc(n.text)}</a>` : `<span>${esc(n.text)}</span>`).join('')
        : '<span class="kv-blank"></span><span class="kv-blank"></span><span class="kv-blank short"></span><span class="kv-blank"></span><span class="kv-blank short"></span>'}</div></div>`;
  let idx = 0;
  const sticker = s => s.logo ? `<span class="kv-sticker" title="${esc(s.name)}"><img src="${esc(s.logo)}" alt=""></span>`
    : `<span class="kv-sticker" title="${esc(s.name)}" style="background:${s.bg};color:${s.fg}">${esc(s.code)}</span>`;
  const band = r => `<div class="kv-band">${[0, 1, 2].map(j => { const s = stickers[(r * 3 + j) % stickers.length]; return s ? `<span class="kv-slot" style="left:${12 + j * 33 + ((r * 7 + j * 11) % 9)}%;--rot:${((r * 13 + j * 29) % 30) - 15}deg">${sticker(s)}</span>` : ''; }).join('')}</div>`;
  const surface = `<div class="kv-surface">${band(-1 + 1)}${rings.map((ring, r) => `<div class="kv-ring">${ring.map(c => panel(c, idx++)).join('')}${'<div class="kv-panel empty"></div>'.repeat(6 - ring.length)}</div>${band(r + 1)}`).join('')}</div>`;
  const ov = document.createElement('div'); ov.className = 'kv'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', 'Stanley Keg engravings');
  ov.innerHTML = `<div class="kv-stage">${surface}</div>
    <div class="kv-bar"><button class="kv-btn" data-kv="prev" aria-label="Previous champion">◀</button>
      <div class="kv-cap"><b></b><span></span></div>
      <button class="kv-btn" data-kv="next" aria-label="Next champion">▶</button>
      <button class="kv-btn kv-all" data-kv="all">Whole keg</button><button class="kv-btn kv-x" data-kv="close" aria-label="Close">✕</button></div>`;
  document.body.appendChild(ov); document.body.classList.add('kv-open');
  const stage = ov.querySelector('.kv-stage'), surf = ov.querySelector('.kv-surface'), panels = [...ov.querySelectorAll('.kv-panel[data-i]')];
  const place = (sx, tx, ty, animate) => { surf.style.transition = animate && !reduce ? 'transform .95s cubic-bezier(.2,.8,.2,1)' : 'none'; surf.style.transform = `translate(${tx}px,${ty}px) scale(${sx})`; };
  const fitAll = animate => { const W = stage.clientWidth, H = stage.clientHeight, w = surf.offsetWidth, h = surf.offsetHeight; const s = Math.min(W * .94 / w, H * .9 / h); place(s, (W - w * s) / 2, (H - h * s) / 2, animate); };
  const caption = () => { const c = champions[k]; ov.querySelector('.kv-cap b').textContent = `${c.teamName} · ${c.name}`; ov.querySelector('.kv-cap span').textContent = `${k + 1} of ${champions.length}`;
    ov.querySelector('[data-kv="prev"]').disabled = k === 0; ov.querySelector('[data-kv="next"]').disabled = k === champions.length - 1; panels.forEach((p, i) => p.classList.toggle('on', i === k)); };
  const zoomTo = (i, animate = true) => {
    k = Math.max(0, Math.min(champions.length - 1, i)); const p = panels[k];
    const W = stage.clientWidth, H = stage.clientHeight, pw = p.offsetWidth, ph = p.offsetHeight;
    const px = p.offsetLeft + p.offsetParent.offsetLeft, py = p.offsetTop + p.offsetParent.offsetTop;
    const s = Math.min(W * (W < 700 ? .92 : .62) / pw, H * .8 / ph, 2.6);   // the champion fills the view, with the neighbours showing at the sides
    place(s, W / 2 - (px + pw / 2) * s, H / 2 - (py + ph / 2) * s, animate); caption(); ov.classList.add('zoomed');
  };
  const close = () => { ov.classList.add('closing'); document.body.classList.remove('kv-open'); removeEventListener('keydown', key); removeEventListener('resize', rs); setTimeout(() => ov.remove(), reduce ? 0 : 250); document.getElementById('tc-keg')?.focus(); };
  const key = e => { if (e.key === 'Escape') close(); else if (e.key === 'ArrowLeft') zoomTo(k - 1); else if (e.key === 'ArrowRight') zoomTo(k + 1); };
  const rs = () => ov.classList.contains('zoomed') ? zoomTo(k, false) : fitAll(false);
  ov.addEventListener('click', e => {
    const b = e.target.closest('[data-kv]'); const pn = e.target.closest('.kv-panel[data-i]');
    if (b) { const a = b.dataset.kv; if (a === 'close') close(); else if (a === 'prev') zoomTo(k - 1); else if (a === 'next') zoomTo(k + 1); else if (a === 'all') { fitAll(true); ov.classList.remove('zoomed'); panels.forEach(p => p.classList.remove('on')); } }
    else if (e.target.closest('a')) close();   // a name links to the player's page
    else if (pn) zoomTo(+pn.dataset.i);
    else if (e.target === ov) close();
  });
  addEventListener('keydown', key); addEventListener('resize', rs);
  k = champions.length - 1; caption(); panels.forEach(p => p.classList.remove('on'));
  fitAll(false);
  setTimeout(() => zoomTo(champions.length - 1, true), reduce ? 0 : 650);   // the first look: whole keg, then zoom into the latest winners
  ov.querySelector('[data-kv="next"]').focus();
}
