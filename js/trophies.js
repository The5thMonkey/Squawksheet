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
// Ice heaped in a bowl with drinks poking out. cx/cy/rx/ry: the bowl's opening. kind: 'cans' (blue beer cans and bottles)
// or 'minis' (little paper-wrapped bitters bottles). Plain, unbranded designs.
function iceFill(cx, cy, rx, ry, kind) {
  const ice = (x, y, s, r) => `<rect x="${x - s / 2}" y="${y - s / 2}" width="${s}" height="${s}" rx="${s * .22}" transform="rotate(${r} ${x} ${y})" fill="#eaf6fc" stroke="#7fa8bd" stroke-width=".9"/><path d="M${x - s * .3} ${y - s * .15} l${s * .25} -${s * .15}" stroke="#fff" stroke-width="${s * .12}" stroke-linecap="round" transform="rotate(${r} ${x} ${y})"/>`;
  const can = (x, y, r, h = 26) => `<g transform="translate(${x} ${y}) rotate(${r})">
      <rect x="-7" y="${-h}" width="14" height="${h}" rx="2" fill="#1c55b5" stroke="${INK}" stroke-width="1.6"/>
      <path d="M-7 ${-h * .62} L7 ${-h * .48} L7 ${-h * .36} L-7 ${-h * .5} Z" fill="#fff"/>
      <rect x="-4.5" y="${-h + 3}" width="2.4" height="${h - 6}" rx="1.2" fill="#fff" opacity=".35"/>
      <ellipse cx="0" cy="${-h}" rx="7" ry="2.2" fill="#d7dee3" stroke="${INK}" stroke-width="1.3"/></g>`;
  const bottle = (x, y, r) => `<g transform="translate(${x} ${y}) rotate(${r})">
      <path d="M-6 0 V-17 Q-6 -21 -2.5 -23 V-31 H2.5 V-23 Q6 -21 6 -17 V0 Z" fill="#7a3f10" stroke="${INK}" stroke-width="1.5"/>
      <rect x="-6" y="-14" width="12" height="9" fill="#1c55b5"/><path d="M-6 -11 H6" stroke="#fff" stroke-width="1.6"/>
      <rect x="-3" y="-34" width="6" height="3.5" rx="1" fill="#c9a227" stroke="${INK}" stroke-width="1"/>
      <rect x="-4" y="-21" width="1.6" height="16" rx=".8" fill="#fff" opacity=".35"/></g>`;
  const mini = (x, y, r) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(1.45)">
      <path d="M-4.2 0 V-11 Q-4.2 -14 -1.8 -15 V-20 H1.8 V-15 Q4.2 -14 4.2 -11 V0 Z" fill="#a9824f" stroke="${INK}" stroke-width="1.2"/>
      <path d="M-4.2 -3 L4.2 -5 M-4.2 -7 L4.2 -8.6" stroke="#7d5a2e" stroke-width=".7"/>
      <rect x="-4.2" y="-10" width="8.4" height="3.6" fill="#f1e6c8"/>
      <rect x="-2.3" y="-22.5" width="4.6" height="2.8" rx=".6" fill="#2f6b34" stroke="${INK}" stroke-width=".8"/></g>`;
  const k = rx / 74;   // scale positions to the bowl
  const X = f => cx + f * rx, Y = f => cy + f * ry;
  const mound = `<path d="M${cx - rx * .92} ${cy + ry * .2} Q${cx - rx * .5} ${cy - ry * 1.6} ${cx} ${cy - ry * 1.5} Q${cx + rx * .5} ${cy - ry * 1.6} ${cx + rx * .92} ${cy + ry * .2} Z" fill="#d7ecf6"/>`;
  const drinks = kind === 'cans'
    ? [bottle(X(-.55), Y(.3), -18), can(X(-.22), Y(-.1), -7, 28 * k), bottle(X(.12), Y(-.2), 9), can(X(.42), Y(.2), 16, 26 * k), can(X(-.02), Y(.6), 3, 22 * k)]
    : [-.62, -.36, -.1, .16, .42, .66].map((f, i) => mini(X(f), Y(.35 - (i % 2) * .4), [-16, 8, -6, 12, -10, 18][i]));
  const cubes = [[-.75, .1, 8, 12], [-.45, .35, 9, -20], [-.15, .5, 8, 30], [.18, .45, 9, -8], [.5, .35, 8, 22], [.78, .05, 7, -15],
    [-.6, -.25, 7, 40], [-.28, .05, 7, 5], [.05, .15, 7, -30], [.32, -.05, 7, 15], [.62, -.2, 6, -40]].map(([a, b, sz, r]) => ice(X(a), Y(b), sz * Math.min(1.2, k * 1.1), r));
  return mound + drinks.join('') + cubes.join('');
}
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
    <text x="120" y="283" font-size="6.4" font-weight="700" textLength="100" lengthAdjust="spacingAndGlyphs">WINTERHAWKS SKATING CENTER</text>
    <text x="120" y="295" font-size="10" font-weight="800" letter-spacing=".6">STANLEY KEG</text>
    <text x="120" y="304" font-size="7" font-weight="700" letter-spacing="1.4">DIVISION 4</text></g>
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
  ${iceFill(120, 46, 64, 8, 'cans')}
  <path d="M46 46 A74 12 0 0 0 194 46 A74 12 0 0 1 46 46" fill="none"/><path d="M46 46 A74 12 0 0 0 194 46" fill="none" stroke="${INK}" stroke-width="3"/>
  <path d="M56 49 A64 8 0 0 0 184 49" fill="none" stroke="#e9eef2" stroke-width="4"/>
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
    : `<span class="aw-eng" style="color:${w.fg}"><small>${svgText(w.short)}</small><b>${svgText(w.value ?? '')}</b><small>${unit}</small></span>`;
}
const wTitle = (w, unit) => `${w.name}, ${w.teamName}: ${w.value ?? '?'} ${unit === 'PTS' ? 'points' : 'goals'} (${w.seasonName})`;
const wTag = (w, inner) => w.href ? `<a class="${inner[0]}" href="${w.href}" title="${svgText(inner[1])}">` : `<div class="${inner[0]}" title="${svgText(inner[1])}">`;
const wEnd = w => w.href ? '</a>' : '</div>';

export function artRossSVG() {
  const id = 'a' + (++uid);
  return `<svg viewBox="0 -22 260 142" class="tc-svg aw-top" aria-hidden="true">
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
  ${iceFill(130, 22, 76, 7, 'minis')}
  <path d="M44 22 A86 12 0 0 0 216 22" fill="none" stroke="${INK}" stroke-width="3"/><path d="M55 25 A76 7 0 0 0 205 25" fill="none" stroke="#eef3f6" stroke-width="4"/>
  <!-- lion-head handles with rings -->
  <g stroke="${INK}" stroke-width="2.5"><circle cx="40" cy="36" r="10" fill="url(#${id}g)"/><circle cx="220" cy="36" r="10" fill="url(#${id}g)"/>
    <circle cx="38" cy="54" r="7" fill="none"/><circle cx="222" cy="54" r="7" fill="none"/></g>
  <circle cx="37" cy="34" r="2" fill="${INK}"/><circle cx="43" cy="34" r="2" fill="${INK}"/><circle cx="217" cy="34" r="2" fill="${INK}"/><circle cx="223" cy="34" r="2" fill="${INK}"/>
  <path d="M70 34 Q96 60 128 66" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".85"/>
  <text x="130" y="40" text-anchor="middle" font-family="'Copperplate','Copperplate Gothic Bold','Arial Black',sans-serif" font-size="7.5" font-weight="800" fill="#4f5b66" letter-spacing="1">ART ROSS TROPHY</text>
  </svg>`;
}
// The Maurice "Rocket" Richard Trophy, drawn face-on from photos of the real one: a chrome funnel split into two
// faceted halves, a bronze skater on the silver collar, and a tapered eight-sided black base in three tiers. The real
// trophy's winners are engraved on stacks of small plaques on the base's angled faces, so ours are too.
export function rocketSVG(winners = []) {
  const id = 'r' + (++uid), W = 400, cx = W / 2;
  const B = n => `url(#${id}${n})`;
  const P = a => 'M' + a.map(p => p.map(v => +v.toFixed(2)).join(' ')).join(' L') + ' Z';
  const mir = a => a.map(([x, y]) => [W - x, y]);
  const lg = (name, x1, x2, stops, y1 = 0, y2 = 0) => `<linearGradient id="${id}${name}" gradientUnits="userSpaceOnUse" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</linearGradient>`;
  let defs = '';

  // ---------------- cup: two halves, three flat facets each; the gap between them is a V ----------------
  const topY = x => 10 + (x - 14) / 172 * 13;                        // the rim falls a little toward the middle
  const neck = 226;
  const fA = [[14, topY(14)], [74, topY(74)], [160, neck], [146, neck], [117, 158.5], [114, 159.5], [99, 135], [96, 136]];   // outer facet, stepped edge
  const fB = [[74, topY(74)], [138, topY(138)], [180, neck], [160, neck]];
  const fC = [[138, topY(138)], [186, topY(186)], [199, neck], [180, neck]];
  // left half is lit, right half's outer facet turns away from the light
  defs += lg('cA', 14, 150, [[0, '#a8b3bc'], [.12, '#f7f9fa'], [.28, '#cdd5db'], [.5, '#626e79'], [.66, '#9eaab3'], [.85, '#eef2f4'], [1, '#bcc6cd']], 20, 60);
  defs += lg('cB', 74, 180, [[0, '#ffffff'], [.35, '#eef2f4'], [.55, '#b3bec6'], [.7, '#fafcfd'], [1, '#d5dde2']], 20, 40);
  defs += lg('cC', 138, 199, [[0, '#7d8994'], [.35, '#2b333b'], [.7, '#56626d'], [1, '#a3aeb7']]);
  defs += lg('cA2', W - 14, W - 150, [[0, '#56626d'], [.2, '#9aa6af'], [.45, '#e4e9ed'], [.6, '#79858f'], [.85, '#4a5560'], [1, '#8e9aa4']], 20, 60);
  defs += lg('cB2', W - 74, W - 180, [[0, '#d7dee3'], [.3, '#ffffff'], [.5, '#9ca8b1'], [.65, '#f3f6f8'], [1, '#c2cbd2']], 20, 40);
  defs += lg('cC2', W - 138, W - 199, [[0, '#f3f6f8'], [.4, '#ffffff'], [.7, '#c3ccd3'], [1, '#8794a0']]);
  defs += `<linearGradient id="${id}cv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#0b1015" stop-opacity=".45"/></linearGradient>`;
  const apex = [cx, 330];
  const streaks = (f, xs) => xs.map(([x, w, c, o]) => `<path d="${P([[x, 0], [x + w, 0], apex])}" fill="${c}" opacity="${o}" clip-path="url(#${id}${f})"/>`).join('');
  const facet = (pts, g, key, st) => `<clipPath id="${id}${key}"><path d="${P(pts)}"/></clipPath>
    <path d="${P(pts)}" fill="${B(g)}"/>${streaks(key, st)}<path d="${P(pts)}" fill="${B('cv')}"/>`;
  const cup = facet(fA, 'cA', 'kA', [[44, 2, '#fff', .5]])
    + facet(fB, 'cB', 'kB', [[118, 5, '#fff', .6]])
    + facet(fC, 'cC', 'kC', [[156, 3, '#fff', .35]])
    + facet(mir(fA), 'cA2', 'kA2', [[W - 52, 3, '#fff', .4]])
    + facet(mir(fB), 'cB2', 'kB2', [[W - 122, 4, '#fff', .6]])
    + facet(mir(fC), 'cC2', 'kC2', [])
    // creases between facets, rim thickness, edge highlights
    + [[74, 160], [138, 180]].map(([t, b]) => `<path d="M${t} ${topY(t)} L${b} ${neck}" stroke="#fff" stroke-width=".9" opacity=".7"/><path d="M${W - t} ${topY(t)} L${W - b} ${neck}" stroke="#4b5661" stroke-width=".9" opacity=".7"/>`).join('')
    + `<path d="M14 ${topY(14)} L186 ${topY(186)}" stroke="#fff" stroke-width="2.6"/><path d="M14.5 ${topY(14) + 2} L186 ${topY(186) + 2}" stroke="#6b7782" stroke-width=".8"/>
       <path d="M${W - 14} ${topY(14)} L${W - 186} ${topY(186)}" stroke="#f3f6f8" stroke-width="2.6"/><path d="M${W - 14.5} ${topY(14) + 2} L${W - 186} ${topY(186) + 2}" stroke="#4b5661" stroke-width=".8"/>
       <path d="${'M' + fA.slice(3).concat([fA[0]]).reverse().map(p => p.join(' ')).join(' L')}" fill="none" stroke="#fff" stroke-width="1.2" opacity=".8"/>
       <path d="${'M' + mir(fA).slice(3).concat([mir(fA)[0]]).reverse().map(p => p.join(' ')).join(' L')}" fill="none" stroke="#2b333b" stroke-width="1.2" opacity=".6"/>
       <path d="M186 ${topY(186)} L199 ${neck}" stroke="#1c2228" stroke-width="1.2" opacity=".6"/><path d="M${W - 186} ${topY(186)} L${W - 199} ${neck}" stroke="#fff" stroke-width="1.2" opacity=".7"/>`;

  // ---------------- bronze skater: smooth shapes lit by an SVG light, leaning toward us ----------------
  defs += `<filter id="${id}bz" x="-30%" y="-30%" width="160%" height="160%" color-interpolation-filters="sRGB">
      <feGaussianBlur in="SourceAlpha" stdDeviation="1.3" result="b"/>
      <feDiffuseLighting in="b" surfaceScale="2.6" diffuseConstant="1" result="d"><feDistantLight azimuth="225" elevation="48"/></feDiffuseLighting>
      <feComposite in="SourceGraphic" in2="d" operator="arithmetic" k1="1.3" result="lit"/>
      <feSpecularLighting in="b" surfaceScale="2.6" specularConstant="1" specularExponent="26" lighting-color="#fff0c2" result="s"><feDistantLight azimuth="225" elevation="48"/></feSpecularLighting>
      <feComposite in="s" in2="SourceAlpha" operator="in" result="s2"/>
      <feComposite in="lit" in2="s2" operator="arithmetic" k2="1" k3=".85" result="all"/>
      <feComposite in="all" in2="SourceAlpha" operator="in" result="body"/>
      <feGaussianBlur in="SourceAlpha" stdDeviation="1"/><feOffset dx="1" dy="1.6" result="so"/>
      <feFlood flood-color="#1c1004" flood-opacity=".7"/><feComposite in2="so" operator="in" result="sh"/>
      <feMerge><feMergeNode in="sh"/><feMergeNode in="body"/></feMerge></filter>`;
  defs += `<linearGradient id="${id}bzc" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d6a24c"/><stop offset=".55" stop-color="#a66f27"/><stop offset="1" stop-color="#7a4d15"/></linearGradient>`;
  const part = (d, f = B('bzc')) => `<path d="${d}" fill="${f}" filter="url(#${id}bz)"/>`;
  const dk = '#6a4312', hair = '#4f3410';
  const det = (d, w = 1, c = '#3f2808', o = .7) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" opacity="${o}"/>`;
  const hi = (d, w = 1.1, o = .55) => det(d, w, '#ffe9b0', o);
  const skater = `<g>
    <!-- back leg (pushing off) and skate -->
    ${part('M220 154 C232 152 243 160 247 172 C249 178 248 184 246 188 C247 194 249 201 251 208 L241 210 C239 202 236 196 234 190 C228 184 220 176 214 166 Z')}
    ${det('M241.5 190 L249 188 M242.5 194.5 L249.8 192.5', 1.6, dk, .9)}
    ${part('M238 205 C245 203 253 203 258 207 C260 213 257 217 250 217 L236 217 C233 213 234 208 238 205 Z', dk)}
    <path d="M233 220.5 L262 220.5" stroke="#e9eef2" stroke-width="1.8" stroke-linecap="round"/><path d="M234 222 L261 222" stroke="#59646e" stroke-width=".7"/>
    <!-- front leg, knee bent toward us, and skate -->
    ${part('M189 154 C202 153 210 162 207 173 C205 181 198 186 197 193 C196 200 196 206 197 212 L182 213 C180 205 179 197 180 190 C181 179 183 166 186 158 Z')}
    ${part('M183 177 C186 171 194 170 200 173 C205 176 205 183 201 187 C196 190 187 190 183 186 C181 183 181 180 183 177 Z')}
    ${det('M181 198 L196.5 199 M181 203 L196.5 204', 1.6, dk, .9)}${hi('M186 176 C189 173 193 172.5 197 173.5', 1.2, .7)}
    ${part('M178 208 L197 208 C201 214 200 221 194 223 L173 223 C168 223 168 218 173 215 Z', dk)}
    ${det('M176 213 L195 213', .8, '#2a1a05', .8)}
    <path d="M168 226.5 L201 226.5" stroke="#e9eef2" stroke-width="2" stroke-linecap="round"/><path d="M169 228 L200 228" stroke="#59646e" stroke-width=".7"/>
    <!-- breezers -->
    ${part('M187 130 C201 126 223 126 239 130 C244 142 244 154 240 162 C230 166 220 165 213 159 C206 165 195 167 185 162 C181 152 182 140 187 130 Z', dk)}
    ${det('M213 140 L213 157')}${det('M194 150 C198 146 204 146 208 150', .8)}${hi('M193 137 C196 133 201 132 206 132', 1)}
    <!-- jersey -->
    ${part('M186 86 C194 80 204 78 212 79 C222 78 232 80 240 86 C244 94 242 106 238 118 L236 132 C224 136 202 136 190 132 L187 118 C183 106 182 94 186 86 Z')}
    ${part('M188 122 C202 126 224 126 237 122 L236 129 C223 133 202 133 189 129 Z', dk)}
    ${det('M205 80 L212 88 L219 80', 1.1)}${det('M212 88 L212 92', .9)}
    ${det('M196 96 C200 104 200 112 197 118')}${det('M228 96 C225 104 225 112 228 118')}${det('M203 109 C208 112 216 112 221 109', .8, '#3f2808', .5)}
    ${hi('M190 90 C195 84 202 81 208 81', 1.4, .6)}
    <!-- head -->
    ${part('M206 69 L218 69 L219 80 L205 80 Z', dk)}
    <g transform="rotate(-4 212 60)">
      ${part('M202.5 59 C202.5 50 206.5 46 212 46 C217.5 46 221.5 50 221.5 59 C221.5 67 217.5 72.5 212 72.5 C206.5 72.5 202.5 67 202.5 59 Z')}
      ${part('M201.5 57 C200.5 47 205 42.5 212 42.5 C219 42.5 223.5 47 222.5 57 C220.5 51.5 217 49 212 49.2 C207 49 203.5 51.5 201.5 57 Z', hair)}
      ${det('M204.5 46.5 C208 44.5 215 44.5 219.5 47', .7, '#22160a', .6)}
      <ellipse cx="201.8" cy="60" rx="1.6" ry="2.8" fill="${B('bzc')}" filter="url(#${id}bz)"/><ellipse cx="222.2" cy="60" rx="1.6" ry="2.8" fill="${B('bzc')}" filter="url(#${id}bz)"/>
      ${det('M206 56.2 C207.4 55.2 209 55.2 210.2 56.2 M213.8 56.2 C215 55.2 216.6 55.2 218 56.2', 1.1, '#2a1a05', .9)}
      ${det('M206.6 58.6 h3 M214.4 58.6 h3', 1, '#2a1a05', .85)}
      ${det('M212 59 L211 64 L213 64.3', .9, '#3f2808', .8)}${hi('M212.6 59.5 L212.2 63', .8, .6)}
      ${det('M208.8 67.4 C210.6 68.2 213.4 68.2 215.2 67.4', 1, '#2a1a05', .85)}
    </g>
    <!-- lower arm (his left), reaching across to the stick -->
    ${part('M231 83 C244 85 255 96 257 110 C258 117 254 123 247 124 C244 114 238 105 227 98 Z')}
    ${part('M257 116 C251 130 237 142 221 150 L212 142 C226 135 237 126 243 114 Z')}
    ${det('M244 110.5 L256 114 M243 115 L255 119', 1.8, dk, .9)}
    <!-- stick: butt by his right shoulder, across the body to the blade on the collar -->
    <path d="M170 92 L257 212" stroke="${B('bzc')}" stroke-width="4.2" stroke-linecap="round" filter="url(#${id}bz)"/>
    <path d="M249 201 L256 210.5" stroke="#3a2608" stroke-width="4.6" stroke-linecap="round"/>
    ${part('M255 209 C262 216 272 219 284 218.5 C287 222 284 225 279 225 C266 226 257 222 250 215 Z')}
    <!-- upper arm (his right), elbow out, hand high on the stick -->
    ${part('M193 85 C180 85 166 95 158 107 C154 114 157 121 164 122 C171 114 180 106 195 100 Z')}
    ${part('M157 114 C161 106 166 99 172 94 L182 101 C176 107 171 114 167 121 Z')}
    ${det('M163 103 L173 110.5 M160.5 107.5 L170 114.5', 1.8, dk, .9)}
    <!-- gloves -->
    ${part('M170 96 C170 91 174 88 179 89 C184 90 186 95 184 100 C182 105 176 106 172.5 103.5 C170.5 102 170 99 170 96 Z', dk)}
    ${det('M173 93.5 L182 95 M172.5 97.5 L181.5 99', .7, '#1e1204', .8)}
    ${part('M207 143 C207 138 211 135 216 136 C221 137 223 142 221 147 C219 152 213 153 209.5 150.5 C207.5 149 207 146 207 143 Z', dk)}
    ${det('M210 140.5 L219 142 M209.5 144.5 L218.5 146', .7, '#1e1204', .8)}
  </g>`;

  // ---------------- collar the skater stands on ----------------
  defs += lg('col', cx - 76, cx + 76, [[0, '#6f7c87'], [.18, '#f4f7f9'], [.4, '#aeb9c1'], [.62, '#ffffff'], [.85, '#8f9ba5'], [1, '#56626d']]);
  defs += `<radialGradient id="${id}dish" cx=".42" cy=".35" r=".75"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#cfd7dd"/><stop offset="1" stop-color="#7d8994"/></radialGradient>`;
  const collar = `<path d="M${cx - 66} 238 L${cx - 58} 250 L${cx + 58} 250 L${cx + 66} 238 Z" fill="#14171b"/>
    <path d="M${cx - 76} 228 L${cx - 76} 238 C${cx - 50} 248 ${cx + 50} 248 ${cx + 76} 238 L${cx + 76} 228 Z" fill="${B('col')}"/>
    <path d="M${cx - 76} 238 C${cx - 50} 248 ${cx + 50} 248 ${cx + 76} 238" stroke="#3b4550" stroke-width="1" fill="none"/>
    <ellipse cx="${cx}" cy="228" rx="76" ry="10" fill="${B('dish')}"/>
    <ellipse cx="${cx}" cy="227.5" rx="64" ry="6.5" fill="none" stroke="#8a96a0" stroke-width="1"/>
    <ellipse cx="${cx + 6}" cy="228" rx="46" ry="4" fill="#1c1004" opacity=".22"/>`;

  // ---------------- base: tapered octagon, three tiers, seen face-on (front face + two angled faces) ----------------
  const FRONT = 1 / (1 + Math.SQRT2);       // share of the width taken by the front face; each angled face is .707 of it
  const n = winners.length, R = Math.max(8, Math.ceil(n / 2)), rA = Math.ceil(R / 2), rB = R - rA;
  const SL = 15;                             // slat pitch
  const tiers = [{ wt: 136, wb: 144, h: 86 }, { wt: 160, wb: 170, h: 12 + rA * SL }, { wt: 186, wb: 198, h: 12 + rB * SL }];
  defs += lg('bkF', 0, 0, [[0, '#2a2f35'], [.5, '#15181c'], [1, '#0c0e10']], 0, 1).replace('gradientUnits="userSpaceOnUse" ', '').replace('x2="0" y2="0"', 'x2="0" y2="1"');
  defs += `<linearGradient id="${id}bkL" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3a4048"/><stop offset=".25" stop-color="#22272d"/><stop offset="1" stop-color="#121519"/></linearGradient>
    <linearGradient id="${id}bkR" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0d0f12"/><stop offset="1" stop-color="#050607"/></linearGradient>
    <linearGradient id="${id}pl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fbfcfd"/><stop offset=".45" stop-color="#d9e0e5"/><stop offset=".7" stop-color="#eef2f4"/><stop offset="1" stop-color="#a7b2bb"/></linearGradient>
    <linearGradient id="${id}plL" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#eef2f4"/><stop offset=".6" stop-color="#c4cdd4"/><stop offset="1" stop-color="#9aa6af"/></linearGradient>
    <linearGradient id="${id}plR" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b4bec6"/><stop offset=".6" stop-color="#8e9aa4"/><stop offset="1" stop-color="#6c7883"/></linearGradient>`;
  const serif = `font-family="'Times New Roman',Georgia,serif" text-anchor="middle" fill="#3a434c"`;
  let y = 250, k = 0, base = '';
  tiers.forEach((t, ti) => {
    const yb = y + t.h, edges = w => { const f = w * FRONT, d = f / Math.SQRT2; return [cx - w / 2, cx - w / 2 + d, cx + f / 2, cx + w / 2 - d, cx + w / 2].map((v, i) => i === 2 ? cx - f / 2 : v).concat(); };
    // x positions: left, left/front, (front left), front/right, right — computed per width
    const xs = w => { const f = w * FRONT, d = f / Math.SQRT2; return [cx - w / 2, cx - f / 2, cx + f / 2, cx + w / 2]; };
    const at = (yy, i, m = 0) => { const s = (yy - y) / t.h, w = t.wt + (t.wb - t.wt) * s, e = xs(w); return [e[i] + m, e[i + 1] - m]; };
    // the ledge on top of this tier
    const lw = t.wt + 8, uw = ti ? tiers[ti - 1].wb : t.wt - 30;
    base += `<path d="${P([[cx - lw / 2, y + 1], [cx - uw / 2, y - 6], [cx + uw / 2, y - 6], [cx + lw / 2, y + 1]])}" fill="#2a2f36"/>
      <path d="M${cx - lw / 2} ${y + 1} L${cx + lw / 2} ${y + 1}" stroke="#8c98a2" stroke-width="1.3"/>`;
    const [T, Bt] = [xs(t.wt), xs(t.wb)];
    base += `<path d="${P([[T[0], y + 1], [T[1], y + 1], [Bt[1], yb], [Bt[0], yb]])}" fill="${B('bkL')}"/>
      <path d="${P([[T[1], y + 1], [T[2], y + 1], [Bt[2], yb], [Bt[1], yb]])}" fill="${B('bkF')}"/>
      <path d="${P([[T[2], y + 1], [T[3], y + 1], [Bt[3], yb], [Bt[2], yb]])}" fill="${B('bkR')}"/>
      <path d="M${T[0] + 4} ${y + 2} L${Bt[0] + 4} ${yb}" stroke="#fff" stroke-width="1.4" opacity=".12"/>`;
    const plaque = (i, yy, h, fillN, m = 3.5) => { const [a, b] = at(yy, i, m), [c, d] = at(yy + h, i, m); return `<path d="${P([[a, yy], [b, yy], [d, yy + h], [c, yy + h]])}" fill="${B(fillN)}" stroke="#0a0c0e" stroke-width=".7"/>`; };
    if (ti === 0) {
      base += plaque(0, y + 7, t.h - 13, 'plL') + plaque(2, y + 7, t.h - 13, 'plR') + plaque(1, y + 7, t.h - 13, 'pl', 4);
      base += `<g ${serif}><text x="${cx}" y="${y + 21}" font-size="5">Trophée</text>
        <text x="${cx}" y="${y + 36}" font-size="13" font-weight="700">Maurice</text>
        <text x="${cx}" y="${y + 47}" font-size="8" font-style="italic">“Rocket”</text>
        <text x="${cx}" y="${y + 61}" font-size="13" font-weight="700">Richard</text>
        <text x="${cx}" y="${y + 72}" font-size="5">Trophy</text></g>`;
    } else {
      // front: dedication plaque
      const ph = t.h - 12;
      base += plaque(1, y + 6, ph, 'pl', 4);
      base += ti === 1
        ? `<g ${serif} font-size="5"><text x="${cx}" y="${y + ph / 2 - 4}">Awarded to the</text><text x="${cx}" y="${y + ph / 2 + 3.5}" font-weight="700" font-size="5.6">WSC Division 4</text><text x="${cx}" y="${y + ph / 2 + 11}">goal-scoring leader</text></g>`
        : `<g ${serif} font-size="4.6"><text x="${cx}" y="${y + ph / 2 - 3}">Presented in honour of</text><text x="${cx}" y="${y + ph / 2 + 4}" font-weight="700" font-size="5.2">Maurice “Rocket” Richard</text></g>`;
      // angled faces: stacks of small plaques, one winner each, read left then right, top to bottom
      const rows = ti === 1 ? rA : rB;
      for (let r = 0; r < rows; r++) for (const i of [0, 2]) {
        const yy = y + 6 + r * SL, w = winners[k++];
        base += plaque(i, yy, SL - 2.4, i === 0 ? 'plL' : 'plR', 3);
        if (w) {
          const [a, b] = at(yy + 6, i, 3), pw = b - a, mx = (a + b) / 2;
          const nm = w.name.toUpperCase(), det = `${w.short} · ${w.value ?? '?'} G`;
          base += `<g font-family="'Times New Roman',Georgia,serif" text-anchor="middle" fill="${w.wsq ? '#7a1714' : '#2a3138'}"><title>${svgText(w.name)}, ${svgText(w.teamName)}: ${w.value ?? '?'} goals (${svgText(w.seasonName)})</title>
            <text x="${mx}" y="${yy + 5.6}" font-size="4.6" font-weight="700" textLength="${Math.min(pw - 4, nm.length * 3)}" lengthAdjust="spacingAndGlyphs">${svgText(nm)}</text>
            <text x="${mx}" y="${yy + 10.8}" font-size="3.7" textLength="${Math.min(pw - 6, det.length * 1.9)}" lengthAdjust="spacingAndGlyphs">${svgText(det)}</text></g>`;
        }
      }
    }
    y = yb + 6;
  });
  y -= 2;
  // round black plinth
  defs += lg('pln', cx - 116, cx + 116, [[0, '#08090b'], [.25, '#30363d'], [.45, '#1a1d21'], [1, '#060708']]);
  base += `<path d="M${cx - 116} ${y} L${cx - 116} ${y + 24} C${cx - 70} ${y + 36} ${cx + 70} ${y + 36} ${cx + 116} ${y + 24} L${cx + 116} ${y} Z" fill="${B('pln')}"/>
    <ellipse cx="${cx}" cy="${y}" rx="116" ry="9" fill="#1d2126"/><ellipse cx="${cx}" cy="${y}" rx="116" ry="9" fill="none" stroke="#9aa6b0" stroke-width="1.2" opacity=".8"/>
    <path d="M${cx - 112} ${y + 17} C${cx - 70} ${y + 28} ${cx + 70} ${y + 28} ${cx + 112} ${y + 17}" stroke="#c9d2d9" stroke-width="1" opacity=".45" fill="none"/>`;
  const H = y + 42;

  return `<svg viewBox="0 0 ${W} ${H}" class="tc-svg rr-svg" role="img" aria-label="Maurice Rocket Richard Trophy">
  <defs>${defs}</defs>
  <ellipse cx="${cx}" cy="${H - 8}" rx="130" ry="7" fill="#000" opacity=".35"/>
  ${base}
  ${cup}
  ${collar}
  ${skater}
  </svg>`;
}

function artRoss(winners, links = true) {
  if (!links) winners = winners.map(w => ({ ...w, href: null }));
  const pucks = winners.map(w => `${wTag(w, ['ar-puck' + (w.wsq ? ' wsq' : ''), wTitle(w, 'PTS')])}<span class="ar-face" style="${w.photo ? '' : `background:${w.bg};border-color:${w.rim}`}">${winnerFace(w, 'PTS')}</span>
      <span class="ar-name">${svgText(w.name)}</span><span class="ar-sub">${svgText(w.short)} · ${w.value ?? '?'} pts</span>${wEnd(w)}`).join('');
  return `<div class="aw-trophy aw-ross">${artRossSVG()}<div class="ar-base"><div class="ar-grid">${pucks}</div></div></div>`;
}
function rocket(winners) {
  return `<div class="aw-trophy aw-rocket">${rocketSVG(winners)}</div>`;
}

// ---------------------------------------------------------------- Squawk 🏆 puck pile
// One puck per Squawk Cup winner: the player's name is written in Sharpie on the white stick tape wrapped around its
// edge, and the season and points are written in white on the black rubber top. A tie is two pucks stacked: one
// name on each puck's tape, with the shared season and points on the top puck. Newest winners sit on top.
// cups: oldest → newest, each { name (season), who: [{ name, v }] }
// pyramid: the trophy-case view stacks them in a loose pyramid (oldest on the bottom row, newest on top);
// otherwise (the close-up) they're spread out in a zig-zag so every puck can be read.
export function puckPileSVG(cups, pyramid = false) {
  const id = 'pk' + (++uid), marker = `font-family="'Permanent Marker','Marker Felt',cursive" filter="url(#${id}ink)"`;
  const RX = 66, RY = 30, T = 26;
  const puck = (key, name, top, rot) => {
    // the tape's writing follows the front of the band, so it curves around the puck like it does in real life
    const fs = 13.5, est = name.length * fs * .62, len = 150;
    return `<g transform="rotate(${rot})">
      <path d="M${-RX} 0 V${T} A${RX} ${RY} 0 0 0 ${RX} ${T} V0 Z" fill="#111" stroke="${INK}" stroke-width="2.5"/>
      <path d="M${-RX} 3 V${T - 3} A${RX} ${RY} 0 0 0 ${RX} ${T - 3} V3 A${RX} ${RY} 0 0 1 ${-RX} 3 Z" fill="url(#${id}tapeS)" stroke="#9c998f" stroke-width=".8"/>
      <path d="M-44 ${T + 17} v-13 M18 ${T + 24} v-15" stroke="#cdc9bd" stroke-width=".8"/>
      <path id="${id}e${key}" d="M${-RX + 2} ${T / 2 + 5} A${RX - 2} ${RY} 0 0 0 ${RX - 2} ${T / 2 + 5}" fill="none"/>
      <text font-size="${fs}" fill="#141414" ${marker} text-anchor="middle"${est > len ? ` textLength="${len}" lengthAdjust="spacingAndGlyphs"` : ''}><textPath href="#${id}e${key}" startOffset="50%">${svgText(name)}</textPath></text>
      <ellipse cx="0" cy="0" rx="${RX}" ry="${RY}" fill="url(#${id}rub)" stroke="${INK}" stroke-width="2.5"/>
      <ellipse cx="0" cy="0" rx="${RX - 9}" ry="${RY - 5}" fill="none" stroke="#2a2a2a" stroke-width="1"/>
      ${top ? `<g transform="scale(1 .8) rotate(-6)" text-anchor="middle" fill="#f7f7f2" ${marker}>
        <text x="0" y="-6" font-size="12.5">${svgText(top[0])}</text>
        <text x="2" y="15" font-size="15" transform="rotate(3)">${svgText(top[1])}</text></g>` : ''}
    </g>`;
  };
  let body = '', minY = 999;
  const jit = (k, m, n) => ((k * m) % n) - (n - 1) / 2;
  let placed;
  if (pyramid) {
    // smallest bottom row that holds everyone in a triangle; each puck rests on the taller of the two stacks under it
    let m = 1; while (m * (m + 1) / 2 < cups.length) m++;
    const rows = []; let k = 0;
    for (let size = m; size > 0 && k < cups.length; size--) { rows.push(cups.slice(k, k + size).map((c, j) => ({ c, k: k + j }))); k += size; }
    const S = 124; placed = [];
    rows.forEach((row, r) => row.forEach((it, j) => {
      const under = r ? [rows[r - 1][j], rows[r - 1][j + 1]].filter(Boolean) : [];
      const support = under.length ? Math.max(...under.map(u => u.top)) : 0;
      it.top = support + it.c.who.length;
      const x = 300 + (j - (rows[r].length - 1) / 2) * S + (r ? jit(it.k, 29, 13) : jit(it.k, 17, 9));
      placed.push({ ...it, x, y: 330 - support * (T + 1) + jit(it.k, 13, 5), rot: jit(it.k, 37, 15) });
    }));
  } else {
    // pucks alternate back (higher) and front (lower) so every face and taped edge stays readable;
    // more than 6 winners start another line further back. Drawn back to front so nearer pucks overlap farther ones.
    const per = 6, lines = Math.ceil(cups.length / per);
    placed = cups.map((c, k) => {
      const line = Math.floor(k / per), j = k % per, inLine = Math.min(per, cups.length - line * per), depth = lines - 1 - line;
      const x = 300 + (j - (inLine - 1) / 2) * 86 + ((k * 29) % 11) - 5;
      const y = 318 - depth * 175 - (j % 2 ? 0 : 92) + ((k * 13) % 5) - 2;
      return { c, x, y, rot: ((k * 37) % 13) - 6, k };
    }).sort((p, q) => p.y - q.y);
  }
  let minX = 999, maxX = -999;
  for (const { c, x, y, rot, k } of placed) {
    const [a, b] = c.who, top = [c.name, `${a.v} pts`];
    if (!b) body += `<g class="pk" transform="translate(${x} ${y})"><title>${svgText(c.name)}: ${svgText(a.name)}, ${a.v} pts</title>${puck(k + 'a', a.name, top, rot)}</g>`;
    else body += `<g class="pk" transform="translate(${x} ${y})"><title>${svgText(c.name)}: ${svgText(a.name)} and ${svgText(b.name)}, ${a.v} pts each (tie)</title>
        ${puck(k + 'a', a.name, null, rot)}
        <g transform="translate(${((k * 7) % 9) - 4} ${-T - 2})">${puck(k + 'b', b.name, top, rot + 3)}</g></g>`;
    minY = Math.min(minY, y - (b ? T + 2 : 0) - RY); minX = Math.min(minX, x - RX - 10); maxX = Math.max(maxX, x + RX + 10);
  }
  const top = Math.max(0, minY - 14);
  const l = Math.min(0, minX), w = Math.max(600, maxX) - l;
  return `<svg viewBox="${l} ${top} ${w} ${390 - top}" class="tc-svg pk-svg${pyramid ? ' pk-pyr' : ''}" role="img" aria-label="Squawk Cup winners: a pile of taped pucks">
    <defs><filter id="${id}ink" x="-5%" y="-20%" width="110%" height="140%"><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="1.3"/><feGaussianBlur stdDeviation=".18"/></filter>
      <radialGradient id="${id}rub" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#2b2b2b"/><stop offset=".6" stop-color="#161616"/><stop offset="1" stop-color="#0b0b0b"/></radialGradient>
      <linearGradient id="${id}tapeS" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#bdb9ad"/><stop offset=".3" stop-color="#ffffff"/><stop offset=".7" stop-color="#f1efe8"/><stop offset="1" stop-color="#a8a499"/></linearGradient></defs>
    <ellipse cx="300" cy="376" rx="280" ry="14" fill="#000" opacity=".3"/>
    ${body}</svg>`;
}

// ---------------------------------------------------------------- the case
// ctx: { champions, wsqWins, presidents: [{id,name,record}], runnerUps: [{id,name}], stickers }
// A framed front page of the Beer League Telegraph for one Stanley Keg title, hung on the case's back wall
const pEsc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function paperFrame(p, i) {
  const d = p.date ? new Date(p.date + 'T12:00:00') : null;
  const when = d ? d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : '';
  const extra = p.ot === 'SO' ? ' in a shootout' : p.ot ? ' in overtime' : '';
  const nick = { AMW: 'the Cats' }[p.oppCode] || p.opp, times = ['', '', 'two', 'three', 'four', 'five'][p.lostTo] || p.lostTo;
  const runs = { 2: 'back to back', 3: 'a three-peat', 4: 'four straight' };
  const head = p.streak >= 2 ? (p.streak === 2 ? 'SQUAWKS GO BACK TO BACK!' : `SQUAWKS WIN ${(runs[p.streak] || p.streak + ' straight').toUpperCase()}!`)
    : p.lostTo >= 1 ? `SQUAWKS FINALLY BEAT ${nick.toUpperCase()}!` : 'SQUAWKS WIN THE STANLEY KEG!';
  const score = `${p.gf}–${p.ga}${extra}`;
  const deck = p.streak >= 2 ? `Stanley Keg champions again: beat ${p.opp} ${score} in the final`
    : p.lostTo >= 2 ? `Beat ${p.opp} ${score} for the Stanley Keg after losing the last ${times} finals to them`
    : p.lostTo === 1 ? `Beat ${p.opp} ${score} for the Stanley Keg, a year after losing the final to them`
    : `Beat ${p.opp} ${score} in the final`;
  const lines = n => Array.from({ length: n }, (_, k) => `<i style="width:${[100, 96, 100, 88, 100, 93, 70][k % 7]}%"></i>`).join('');
  return `<a class="tc-paper p${i}" href="#/game/${pEsc(p.id)}" aria-label="${pEsc(p.season)} Stanley Keg final: front page">
    <span class="tp-frame"><span class="tp-mat"><span class="tp-page">
      <span class="tp-top"><span>${pEsc(p.season)}</span><span>Championship Extra</span><span>25¢</span></span>
      <span class="tp-mh">The Beer League Telegraph</span>
      <span class="tp-date">${pEsc(when)}</span>
      <span class="tp-head">${pEsc(head)}</span>
      <span class="tp-deck">${pEsc(deck)}${p.star ? ` · ${pEsc(p.star)} first star` : ''}</span>
      ${p.photo ? `<span class="tp-photo" style="background-image:url('${pEsc(p.photo)}')"></span>` : ''}
      <span class="tp-cols"><span>${lines(9)}</span><span>${lines(9)}</span><span>${lines(9)}</span></span>
    </span></span></span></a>`;
}
// The oval pedestal the Keg stands on, draped with a white sheet
function pedestalSVG() {
  const id = 'pd' + (++uid);
  const hem = 'Q28 100 42 94 Q56 104 72 97 Q90 107 108 98 Q128 108 150 99 Q172 108 192 98 Q210 107 228 97 Q244 104 258 94 Q272 100 286 92';
  return `<svg viewBox="0 0 300 122" class="tc-ped" aria-hidden="true">
  <defs><linearGradient id="${id}s" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#cfd6dc"/><stop offset=".18" stop-color="#ffffff"/><stop offset=".4" stop-color="#eef1f4"/><stop offset=".55" stop-color="#ffffff"/><stop offset=".8" stop-color="#e2e7eb"/><stop offset="1" stop-color="#b9c2ca"/></linearGradient>
    <linearGradient id="${id}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a3418"/><stop offset="1" stop-color="#2e1a0a"/></linearGradient></defs>
  <ellipse cx="150" cy="114" rx="150" ry="7" fill="#000" opacity=".3"/>
  <path d="M24 92 V104 Q150 124 276 104 V92 Z" fill="url(#${id}w)" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <path d="M12 24 C9 48 11 72 14 92 ${hem} C289 72 291 48 288 24 Z" fill="url(#${id}s)" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <g fill="none" stroke="#b7c0c8" stroke-width="1.6" stroke-linecap="round">
    <path d="M42 40 Q40 70 42 94"/><path d="M72 44 Q76 72 72 97"/><path d="M108 46 Q104 74 108 98"/><path d="M150 46 Q153 74 150 99"/>
    <path d="M192 46 Q196 74 192 98"/><path d="M228 44 Q224 72 228 97"/><path d="M258 40 Q260 70 258 94"/></g>
  <g fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".9"><path d="M56 42 Q58 70 56 95"/><path d="M128 46 Q126 74 128 100"/><path d="M210 46 Q213 74 210 100"/></g>
  <ellipse cx="150" cy="24" rx="138" ry="20" fill="#fbfcfd" stroke="${INK}" stroke-width="3"/>
  <path d="M14 26 Q150 58 286 26" fill="none" stroke="#d3dae0" stroke-width="2"/>
  </svg>`;
}
// The real Squawk Cup: a beat-up plastic stadium cup with a black rim, scratched-up print, a hockey-net pattern,
// stickers, and a base wrapped in layers of grubby stick tape with CHAMPIONS written on it in marker.
function squawkCupSVG() {
  const id = 'sc' + (++uid);
  const body = 'M10 14 L26 212 Q60 221 94 212 L110 14 Z';
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const scratches = Array.from({ length: 70 }, () => { const x = 12 + rnd() * 96, y = 18 + rnd() * 108, a = rnd() * 3.14, l = 2 + rnd() * 9;
    return `M${x.toFixed(1)} ${y.toFixed(1)} l${(Math.cos(a) * l).toFixed(1)} ${(Math.sin(a) * l).toFixed(1)}`; }).join(' ');
  const specks = Array.from({ length: 40 }, () => `<circle cx="${(14 + rnd() * 92).toFixed(1)}" cy="${(132 + rnd() * 80).toFixed(1)}" r="${(.4 + rnd() * 1.3).toFixed(1)}" fill="#5b4a2e" opacity="${(.15 + rnd() * .35).toFixed(2)}"/>`).join('');
  const rainbow = ['#ff4d4d', '#ff9f1c', '#ffd23f', '#3ecf6e', '#3aa0ff', '#8b5cf6', '#ff5fa2'];
  const sq = [...'SQUAWKS'].map((c, i) => `<tspan fill="${rainbow[i]}">${c}</tspan>`).join('');
  // tape bands: y, height, colour, writing, x shift of the writing (it runs round the cup, so it's cut off at the edges)
  // the top half of the tape has SQUAWKS written right round the cup, so only part of it faces us; CHAMPIONS below
  const tape = [[128, 17, '#cbb68c', '', 0], [145, 16, '#d6c49d', '', 0], [160, 17, '#c9b48a', 'CHAMPIONS', -14], [176, 17, '#e4dccb', 'CHAMPIONS', 9], [192, 22, '#ebe6da', 'CHAMPIONS', 0]];
  const band = ([y, h, c, txt, dx], i) => {
    const jag = Array.from({ length: 12 }, (_, k) => `L${(8 + k * 9.5).toFixed(1)} ${(y + (k % 2 ? 1.2 : -.6) + (i % 2 ? .8 : 0)).toFixed(1)}`).join(' ');
    return `<path d="M4 ${y} ${jag} L116 ${y} L116 ${y + h} Q60 ${y + h + 5} 4 ${y + h} Z" fill="${c}"/>
      <path d="M4 ${y + h} Q60 ${y + h + 5} 116 ${y + h}" stroke="#8d7a55" stroke-width=".9" fill="none" opacity=".8"/>
      <path d="M4 ${y + 3} Q60 ${y + 7} 116 ${y + 3}" stroke="#fff" stroke-width="1" fill="none" opacity=".35"/>
      ${txt ? `<text x="${60 + dx}" y="${y + h * .78}" text-anchor="middle" font-family="'Permanent Marker','Marker Felt',cursive" font-size="${h * .82}" fill="#1b1b1b" opacity=".82" letter-spacing="1">${txt}</text>` : ''}`;
  };
  return `<svg viewBox="0 0 120 226" class="sc-svg" role="img" aria-label="The Squawk Cup">
  <defs><clipPath id="${id}c"><path d="${body}"/></clipPath>
    <linearGradient id="${id}sh" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".25" stop-color="#fff" stop-opacity=".05"/><stop offset=".7" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".45"/></linearGradient></defs>
  <ellipse cx="60" cy="216" rx="40" ry="6" fill="#000" opacity=".35"/>
  <g clip-path="url(#${id}c)">
    <rect x="0" y="0" width="120" height="226" fill="#1d1f23"/>
    <rect x="0" y="14" width="120" height="16" fill="#3a3f47"/>
    <!-- hockey-net pattern -->
    <g stroke="#e9e9e9" stroke-linecap="round" fill="none"><path d="M6 30 L70 120 M6 96 L56 30 M40 18 L100 104" stroke-width="5" stroke-dasharray="2.5 1.6" opacity=".9"/><path d="M6 30 L70 120 M6 96 L56 30 M40 18 L100 104" stroke-width="1.4" stroke="#b9b9b9"/></g>
    <!-- worn white-and-red print -->
    <path d="M62 52 C74 40 98 42 108 58 C112 72 104 92 92 102 C84 110 70 108 64 98 C70 90 66 84 58 82 C64 72 56 64 62 52 Z" fill="#f2f2f2" opacity=".92"/>
    <path d="M58 50 C72 34 104 36 112 60" stroke="#c8302c" stroke-width="3" fill="none"/><path d="M56 84 C50 100 58 116 76 120" stroke="#c8302c" stroke-width="2.4" fill="none"/>
    <path d="${scratches}" stroke="#ffffff" stroke-width=".9" opacity=".55" stroke-linecap="round"/>
    <text x="60" y="27" text-anchor="middle" font-family="'Arial Black',Impact,sans-serif" font-size="12" letter-spacing="2">${sq}</text>
    <text transform="translate(19 40) rotate(90)" font-family="'Arial Black',Impact,sans-serif" font-size="8" fill="#f08a24" letter-spacing="1.5" opacity=".9">SQUAWKS</text>
    <!-- stickers -->
    <g transform="translate(48 48)"><circle r="13" fill="#9fd3f2" stroke="#fff" stroke-width="2.4" stroke-dasharray=".1 3.2" stroke-linecap="round"/><circle r="11.5" fill="#9fd3f2"/>
      <path d="M-7 4 A7 7 0 0 1 7 4" stroke="#ff4d4d" stroke-width="1.6" fill="none"/><path d="M-5.4 4 A5.4 5.4 0 0 1 5.4 4" stroke="#ffd23f" stroke-width="1.6" fill="none"/><path d="M-3.8 4 A3.8 3.8 0 0 1 3.8 4" stroke="#3ecf6e" stroke-width="1.6" fill="none"/>
      <path d="M-1 -2 l3 -8" stroke="#f5d76e" stroke-width="1.4" stroke-linecap="round"/><circle cx="-2" cy="0" r="3" fill="#fff"/></g>
    <g transform="translate(22 66) rotate(-6)"><path d="M-6 -8 H6 V-3 Q6 4 0 5 Q-6 4 -6 -3 Z" fill="#e0a526" stroke="#8a5a12" stroke-width=".8"/><rect x="-1.5" y="5" width="3" height="4" fill="#c88a1c"/><rect x="-4.5" y="9" width="9" height="3.5" fill="#a5651c"/></g>
    <g transform="translate(97 44)"><path d="M-7 -6 H7 V4 H0 L-4 8 V4 H-7 Z" fill="#fff"/><path d="M0 1.5 L-2.4 -1 A1.4 1.4 0 0 1 0 -2.6 A1.4 1.4 0 0 1 2.4 -1 Z" fill="#e0303c"/></g>
    <g transform="translate(32 114) rotate(-7)"><rect x="-12" y="-6" width="24" height="11" rx="1.5" fill="#9a4a24" stroke="#5a2a10" stroke-width=".8"/><text y="2.6" text-anchor="middle" font-family="'Arial Black',Impact,sans-serif" font-size="6.6" fill="#f3d9b5">SPORT</text></g>
    <!-- the tape -->
    ${tape.map(band).join('')}
    <text x="62" y="156" text-anchor="middle" font-family="'Permanent Marker','Marker Felt',cursive" font-size="29" fill="#1b1b1b" opacity=".82" letter-spacing="2">SQUAWKS</text>${specks}
    <rect x="0" y="0" width="120" height="226" fill="url(#${id}sh)"/>
  </g>
  <path d="${body}" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>
  <ellipse cx="60" cy="14" rx="50.5" ry="6.5" fill="#26292e" stroke="${INK}" stroke-width="2.6"/><ellipse cx="60" cy="14.6" rx="46" ry="4.4" fill="#0d0e10"/>
  <path d="M16 12.5 Q36 8.5 54 8.4" stroke="#fff" stroke-width="1.2" opacity=".5" fill="none"/>
  </svg>`;
}
export function trophyCase(ctx) {
  const pres = ctx.presidents.map(p => `<a class="tc-item tc-pres" href="#/season/${p.id}" title="${svgText(p.name)}: ${svgText(p.record)}">
      ${presidentsSVG({ season: p.name, record: p.record })}<div class="tc-card">President's Trophy<br><b>${svgText(p.name)}</b></div></a>`).join('');
  const medals = ctx.runnerUps.map(r => `<a class="tc-medal" href="#/season/${r.id}" title="Runner-up, ${svgText(r.name)}">
      <span class="tc-hook"></span>${medalSVG({ season: r.name })}</a>`).join('');
  return `<section class="tcase" aria-label="Trophy case">
    <div class="tc-crown"><span>WinterSquawks</span> Trophy Case</div>
    <div class="tc-frame"><div class="tc-inner">
      <div class="tc-spots" aria-hidden="true"><i></i><i></i><i></i></div>
      ${ctx.runnerUps.length ? `<div class="tc-rail-wrap"><div class="tc-rail"></div><div class="tc-medals">${medals}</div>
        </div>` : ''}
      <div class="tc-shelf tc-top">
        ${ctx.papers?.length ? `<div class="tc-papers" aria-label="Front pages">${ctx.papers.map(paperFrame).join('')}</div>` : ''}
        ${ctx.artRoss.length ? `<button class="tc-item tc-mini" type="button" data-trophy="ross" aria-label="Art Ross Trophy: see the winners">
          <div class="tc-mini-ross">${artRoss(ctx.artRoss, false)}</div><div class="tc-card">Art Ross Trophy<br><b>Points leaders</b></div></button>` : '<div></div>'}
        <button class="tc-item tc-keg" id="tc-keg" type="button" aria-label="The Stanley Keg: read the engravings">
          ${kegSVG({ wins: ctx.wsqWins, stickers: ctx.stickers })}
          ${pedestalSVG()}</button>
        ${ctx.rocket.length ? `<button class="tc-item tc-mini" type="button" data-trophy="rocket" aria-label="Rocket Richard Trophy: see the winners">
          <div class="tc-mini-rocket">${rocketSVG(ctx.rocket)}</div><div class="tc-card">"Rocket" Richard Trophy<br><b>Goal leaders</b></div></button>` : '<div></div>'}
      </div>
      <div class="tc-board"></div>
      <div class="tc-shelf tc-level2">${pres}${ctx.cups.length ? `<button class="tc-item tc-pucks" type="button" data-trophy="pucks" aria-label="Squawk Cup winners: look at the pucks">${puckPileSVG(ctx.cups, true)}<div class="tc-card">Squawk 🏆 winners<br><b>${ctx.cups.length} season${ctx.cups.length === 1 ? '' : 's'}</b></div></button>` : ''}
        <div class="tc-squawkcup has-tip" title="The Squawk Cup">${squawkCupSVG()}</div></div>
      <div class="tc-board"></div>
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
      ${c.sticker ? `<span class="kv-slot kv-on-panel" style="--rot:${(i * 37) % 26 - 13}deg">${sticker(c.sticker)}</span>` : ''}
      <div class="kv-head"><div class="kv-team">${esc(c.teamName)} <span>${esc(c.name)}</span></div>
        ${c.captain ? `<div class="kv-capt">Captain: ${c.captain.href ? `<a href="${c.captain.href}">${esc(c.captain.text)}</a>` : esc(c.captain.text)}</div>` : ''}</div>
      <div class="kv-names">${c.names.length ? c.names.map(n => n.href ? `<a href="${n.href}">${esc(n.text)}</a>` : `<span${n.note ? ' class="kv-note"' : ''}>${esc(n.text)}</span>`).join('')
        : '<span class="kv-blank"></span><span class="kv-blank"></span><span class="kv-blank short"></span><span class="kv-blank"></span><span class="kv-blank short"></span>'}</div></div>`;
  let idx = 0;
  const sticker = s => s.logo ? `<span class="kv-sticker" title="${esc(s.name)}"><img src="${esc(s.logo)}" alt=""></span>`
    : `<span class="kv-sticker" title="${esc(s.name)}" style="background:${s.bg};color:${s.fg}">${esc(s.code)}</span>`;
  const band = () => '<div class="kv-band"></div>';
  const surface = `<div class="kv-surface">${band()}${rings.map((ring, r) => `<div class="kv-ring">${ring.map(c => panel(c, idx++)).join('')}${'<div class="kv-panel empty"></div>'.repeat(6 - ring.length)}</div>${band()}`).join('')}</div>`;
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

// ---------------------------------------------------------------- trophy viewer (Art Ross, Rocket Richard)
// Opens the trophy large, zooming in from the shelf. Click (or tap) to zoom closer at that spot, drag to look around.
export function openTrophy(kind, winners, title) {
  const html = kind === 'ross' ? artRoss(winners, true) : kind === 'pucks' ? puckPileSVG(winners) : rocketSVG(winners);
  const ov = document.createElement('div'); ov.className = 'kv tv'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', title);
  ov.innerHTML = `<div class="kv-stage"><div class="tv-piece tv-${kind}">${html}</div></div>
    <div class="kv-bar"><div class="kv-cap"><b>${title}</b><span>Click to zoom in · drag to look around</span></div>
      <button class="kv-btn" data-tv="in" aria-label="Zoom in">＋</button><button class="kv-btn" data-tv="out" aria-label="Zoom out">－</button>
      <button class="kv-btn kv-x" data-tv="close" aria-label="Close">✕</button></div>`;
  document.body.appendChild(ov); document.body.classList.add('kv-open');
  const stage = ov.querySelector('.kv-stage'), piece = ov.querySelector('.tv-piece');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let s = 1, tx = 0, ty = 0, fit = 1;
  const apply = animate => { piece.style.transition = animate && !reduce ? 'transform .7s cubic-bezier(.2,.8,.2,1)' : 'none'; piece.style.transform = `translate(${tx}px,${ty}px) scale(${s})`; };
  const fitView = animate => { const W = stage.clientWidth, H = stage.clientHeight, w = piece.offsetWidth, h = piece.offsetHeight;
    fit = Math.min(W * .92 / w, H * .92 / h); s = fit; tx = (W - w * s) / 2; ty = (H - h * s) / 2; apply(animate); };
  const zoomAt = (px, py, factor) => { const ns = Math.min(fit * 4, Math.max(fit, s * factor)); tx = px - (px - tx) * ns / s; ty = py - (py - ty) * ns / s; s = ns; apply(true); };
  // start small, then grow into view
  fitView(false); const s0 = s; s = s0 * .35; tx += piece.offsetWidth * (s0 - s) / 2; ty += piece.offsetHeight * (s0 - s) / 2; apply(false);
  requestAnimationFrame(() => requestAnimationFrame(() => fitView(true)));
  let drag = null, moved = false;
  stage.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, tx, ty }; moved = false; stage.setPointerCapture(e.pointerId); });
  stage.addEventListener('pointermove', e => { if (!drag) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y; if (Math.abs(dx) + Math.abs(dy) > 4) moved = true; if (moved && s > fit) { tx = drag.tx + dx; ty = drag.ty + dy; apply(false); } });
  stage.addEventListener('pointerup', e => { const d = drag; drag = null; if (!d || moved) return;
    if (e.target.closest('a')) return close();
    const r = stage.getBoundingClientRect(); if (s >= fit * 3.9) fitView(true); else zoomAt(e.clientX - r.left, e.clientY - r.top, 2); });
  stage.addEventListener('wheel', e => { e.preventDefault(); const r = stage.getBoundingClientRect(); zoomAt(e.clientX - r.left, e.clientY - r.top, e.deltaY < 0 ? 1.25 : .8); }, { passive: false });
  const close = () => { ov.classList.add('closing'); document.body.classList.remove('kv-open'); removeEventListener('keydown', key); removeEventListener('resize', rs); setTimeout(() => ov.remove(), reduce ? 0 : 250); };
  const key = e => { if (e.key === 'Escape') close(); else if (e.key === '+' || e.key === '=') zoomAt(stage.clientWidth / 2, stage.clientHeight / 2, 1.5); else if (e.key === '-') zoomAt(stage.clientWidth / 2, stage.clientHeight / 2, .66); };
  const rs = () => fitView(false);
  ov.addEventListener('click', e => { const b = e.target.closest('[data-tv]'); if (!b) return; const a = b.dataset.tv;
    if (a === 'close') close(); else if (a === 'in') zoomAt(stage.clientWidth / 2, stage.clientHeight / 2, 1.6); else fitView(true); });
  addEventListener('keydown', key); addEventListener('resize', rs);
  ov.querySelector('[data-tv="close"]').focus();
}
