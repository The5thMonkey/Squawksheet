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
  // a gold moose head, face on, with wide flat antlers
  const moose = `<g fill="#d9b25a" stroke="#6b5222" stroke-width=".25">
      <path d="M-1.4 -3.1 C-2.6 -3.6 -4.4 -3.8 -5.6 -5.6 L-5 -6 L-5 -7.3 L-4.3 -6.6 L-3.8 -7.8 L-3.2 -6.6 L-2.5 -7.3 L-2.3 -5.7 C-2 -4.9 -1.6 -4.2 -1.2 -3.6 Z"/>
      <path d="M1.4 -3.1 C2.6 -3.6 4.4 -3.8 5.6 -5.6 L5 -6 L5 -7.3 L4.3 -6.6 L3.8 -7.8 L3.2 -6.6 L2.5 -7.3 L2.3 -5.7 C2 -4.9 1.6 -4.2 1.2 -3.6 Z"/>
      <ellipse cx="-2.3" cy="-2.6" rx="1.1" ry=".55" transform="rotate(-20 -2.3 -2.6)"/><ellipse cx="2.3" cy="-2.6" rx="1.1" ry=".55" transform="rotate(20 2.3 -2.6)"/>
      <path d="M-1.6 -3.5 C-1.9 -1.4 -1.7 1 -1.3 2.7 C-1.1 4.1 1.1 4.1 1.3 2.7 C1.7 1 1.9 -1.4 1.6 -3.5 C1 -4.1 -1 -4.1 -1.6 -3.5 Z"/></g>
      <circle cx="-.8" cy="-1.7" r=".3" fill="#1a2a1c"/><circle cx=".8" cy="-1.7" r=".3" fill="#1a2a1c"/><path d="M-.6 3 h.4 M.2 3 h.4" stroke="#6b5222" stroke-width=".35"/>`;
  const leaf = 'M0 -4.6 L.9 -2.8 L2 -3.3 L1.6 -1.1 L3.3 -2 L2.9 -.7 L4.2 -.5 L2.9 .7 L3.3 1.3 L.9 1.1 L.45 1.3 L.45 3 L-.45 3 L-.45 1.3 L-.9 1.1 L-3.3 1.3 L-2.9 .7 L-4.2 -.5 L-2.9 -.7 L-3.3 -2 L-1.6 -1.1 L-2 -3.3 L-.9 -2.8 Z';
  const can = (x, y, r, h = 26) => `<g transform="translate(${x} ${y}) rotate(${r})">
      <rect x="-7" y="${-h}" width="14" height="${h}" rx="2" fill="#1c4a2b" stroke="${INK}" stroke-width="1.6"/>
      <rect x="-7" y="${-h}" width="5" height="${h}" fill="#2e6b40" opacity=".45"/>
      <path d="M-7 ${-h + 2.6} H7 M-7 -2.6 H7" stroke="#c9a94e" stroke-width="1"/>
      <g transform="translate(0 ${-h * .58}) scale(1.05)">${moose}</g>
      <path d="M-4.5 ${-h * .28} H4.5 M-3.4 ${-h * .2} H3.4" stroke="#d9b25a" stroke-width=".9" opacity=".8"/>
      <rect x="-5.2" y="${-h + 3}" width="1.6" height="${h - 6}" rx=".8" fill="#fff" opacity=".2"/>
      <ellipse cx="0" cy="${-h}" rx="7" ry="2.2" fill="#d7dee3" stroke="${INK}" stroke-width="1.3"/></g>`;
  const bottle = (x, y, r) => `<g transform="translate(${x} ${y}) rotate(${r})">
      <path d="M-6 0 V-17 Q-6 -21 -2.5 -23 V-31 H2.5 V-23 Q6 -21 6 -17 V0 Z" fill="#9a5418" stroke="${INK}" stroke-width="1.5"/>
      <rect x="-6" y="-15" width="12" height="11" fill="#1d3a6e"/>
      <g transform="translate(0 -12.2) scale(.42)"><path d="${leaf}" fill="#d0202a"/></g>
      <path d="M-3.6 -8.8 H3.6" stroke="#fff" stroke-width="1.8"/><path d="M-3 -6.2 H3" stroke="#9fb6dd" stroke-width=".7"/>
      <path d="M-2.5 -29 H2.5 V-25 L0 -23.6 L-2.5 -25 Z" fill="#1d3a6e"/><path d="M-1.4 -27 H1.4" stroke="#fff" stroke-width=".7"/>
      <rect x="-2.9" y="-33.6" width="5.8" height="3" rx="1" fill="#1b2433" stroke="${INK}" stroke-width=".9"/>
      <rect x="-4.6" y="-21" width="1.5" height="5" rx=".7" fill="#fff" opacity=".35"/></g>`;
  // little bitters bottle: label round the body (white with a diagonal green band), the rest wrapped in crinkled
  // yellow paper twisted to a point over the cap
  const mini = (x, y, r) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(1.45)">
      <path d="M-3.9 -8.6 C-3.9 -13 -2.6 -18 -1.5 -21 L-2 -23.4 L-.6 -22.6 L.3 -24.2 L1.3 -22.6 L1.9 -23.6 L1.5 -20.6 C2.7 -17.4 3.9 -13 3.9 -8.6 Z" fill="#e6c46e" stroke="${INK}" stroke-width=".9" stroke-linejoin="round"/>
      <path d="M-2.6 -11 L1.2 -19.5 M-.8 -9.4 L2.6 -16 M1.6 -9.6 L3.2 -12.6 M-3.2 -14 L-1.4 -17" stroke="#b48d3a" stroke-width=".5" fill="none"/>
      <path d="M-3.9 -8.6 H3.9 V-.8 Q3.9 0 3.1 0 H-3.1 Q-3.9 0 -3.9 -.8 Z" fill="#f8f6ee" stroke="${INK}" stroke-width=".9"/>
      <path d="M-3.9 -2.4 L3.9 -7.6 L3.9 -5.6 L-3.9 -.4 Z" fill="#1f7a4c"/>
      <path d="M-3.9 -1.1 H3.9" stroke="#e6c46e" stroke-width="1.1"/></g>`;
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
  return `<svg viewBox="0 0 170 290" class="tc-svg" role="img" aria-label="President's Trophy, ${svgText(season)}">
  <defs>${chrome(id + 'g')}
    <linearGradient id="${id}glass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9fbff" stop-opacity=".85"/><stop offset="1" stop-color="#8fd3e8" stop-opacity=".55"/></linearGradient>
    <linearGradient id="${id}gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff0b3"/><stop offset=".5" stop-color="#e3b44e"/><stop offset="1" stop-color="#a8781d"/></linearGradient></defs>
  <ellipse cx="85" cy="289" rx="66" ry="3" fill="#000" opacity=".28"/>
  <!-- crossed sticks -->
  <g stroke="${INK}" stroke-width="2.5" stroke-linejoin="round">
    <path d="M44 50 L124 100" stroke-width="7" stroke="${INK}"/><path d="M44 50 L124 100" stroke-width="4" stroke="url(#${id}gold)"/>
    <path d="M126 50 L46 100" stroke-width="7" stroke="${INK}"/><path d="M126 50 L46 100" stroke-width="4" stroke="url(#${id}gold)"/>
    <path d="M124 100 l14 -4 l3 6 l-15 4 z" fill="url(#${id}gold)"/><path d="M46 100 l-14 -4 l-3 6 l15 4 z" fill="url(#${id}gold)"/></g>
  <!-- glass bowl -->
  <path d="M8 40 Q85 76 162 40 Z" fill="url(#${id}glass)" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <ellipse cx="85" cy="40" rx="78" ry="11" fill="#f2fdff" fill-opacity=".75" stroke="${INK}" stroke-width="3"/>
  <ellipse cx="85" cy="40" rx="66" ry="6" fill="none" stroke="#bfe9f5" stroke-width="2"/>
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
  const H = y + 31;

  return `<svg viewBox="0 0 ${W} ${H}" class="tc-svg rr-svg" role="img" aria-label="Maurice Rocket Richard Trophy">
  <defs>${defs}</defs>
  <ellipse cx="${cx}" cy="${H - 2}" rx="124" ry="3" fill="#000" opacity=".35"/>
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
  return `<svg viewBox="${l} ${top} ${w} ${387 - top}" class="tc-svg pk-svg${pyramid ? ' pk-pyr' : ''}" role="img" aria-label="Squawk Cup winners: a pile of taped pucks">
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
    : p.lostTo >= 1 ? `SQUAWKS FINALLY BEAT ${nick.toUpperCase()}!` : p.first ? 'SQUAWKS WIN THEIR FIRST STANLEY KEG!' : 'SQUAWKS WIN THE STANLEY KEG!';
  const score = `${p.gf}–${p.ga}${extra}`;
  const deck = p.streak >= 2 ? `Stanley Keg champions again: beat ${p.opp} ${score} in the final`
    : p.lostTo >= 2 ? `Beat ${p.opp} ${score} for the Stanley Keg after losing the last ${times} finals to them`
    : p.lostTo === 1 ? `Beat ${p.opp} ${score} for the Stanley Keg, a year after losing the final to them`
    : p.first ? `The team’s first cup: beat ${p.opp} ${score} in the final` : `Beat ${p.opp} ${score} in the final`;
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
  <ellipse cx="150" cy="113" rx="146" ry="3" fill="#000" opacity=".3"/>
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
  return `<svg viewBox="0 0 120 218" class="sc-svg" role="img" aria-label="The Squawk Cup">
  <defs><clipPath id="${id}c"><path d="${body}"/></clipPath>
    <linearGradient id="${id}sh" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".25" stop-color="#fff" stop-opacity=".05"/><stop offset=".7" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".45"/></linearGradient></defs>
  <ellipse cx="60" cy="215" rx="40" ry="3" fill="#000" opacity=".35"/>
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
// A worn-out baseball lying on the shelf, with a holographic SQUAWKS sticker wrapped round it
function baseballSVG() {
  const id = 'bb' + (++uid);
  let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const scuffs = Array.from({ length: 26 }, () => { const a = rnd() * 6.28, r = rnd() * 40, x = 50 + Math.cos(a) * r, y = 50 + Math.sin(a) * r;
    return `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(1 + rnd() * 4).toFixed(1)}" ry="${(.6 + rnd() * 1.8).toFixed(1)}" transform="rotate(${(rnd() * 180).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})" fill="#7a6a4e" opacity="${(.15 + rnd() * .3).toFixed(2)}"/>`; }).join('');
  // mirror-ball tiles: a grid of little squares, each catching the light differently
  let tiles = '';
  for (let ty = 10; ty < 90; ty += 3.4) for (let tx = 10; tx < 90; tx += 3.4) {
    const v = rnd(), c = v > .82 ? '#ffffff' : v < .14 ? '#3b2f6b' : '#ffffff';
    tiles += `<rect x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" width="3" height="3" fill="${c}" opacity="${(v > .82 ? .75 : v < .14 ? .35 : v * .28).toFixed(2)}"/>`;
  }
  const glint = (x, y, r) => `<path d="M${x} ${y - r} L${x + r * .22} ${y - r * .22} L${x + r} ${y} L${x + r * .22} ${y + r * .22} L${x} ${y + r} L${x - r * .22} ${y + r * .22} L${x - r} ${y} L${x - r * .22} ${y - r * .22} Z" fill="#fff"/>`;
  const glints = glint(30, 26, 5) + glint(62, 52, 3.6) + glint(78, 80, 4.2) + glint(46, 40, 2.4);
  // a seam: a curve with V stitches along it
  const seam = (d, pts) => `<path d="${d}" fill="none" stroke="#b9a98a" stroke-width="1.2"/>` + pts.map(([x, y, a]) => `<path d="M-3 -2 L0 0 L-3 2" transform="translate(${x} ${y}) rotate(${a})" fill="none" stroke="#a63a2e" stroke-width="1.5" stroke-linecap="round"/>`).join('');
  return `<svg viewBox="0 0 100 96" class="bb-svg" role="img" aria-label="A worn-out baseball with a holographic SQUAWKS sticker">
  <defs><radialGradient id="${id}b" cx=".38" cy=".32" r=".75"><stop offset="0" stop-color="#f4efe2"/><stop offset=".55" stop-color="#ddd3bd"/><stop offset="1" stop-color="#a99a7c"/></radialGradient>
    <linearGradient id="${id}h" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff6ec7"/><stop offset=".16" stop-color="#ffd84d"/><stop offset=".33" stop-color="#5cf2b0"/><stop offset=".5" stop-color="#4fc3ff"/><stop offset=".66" stop-color="#a77bff"/><stop offset=".83" stop-color="#ff6ec7"/><stop offset="1" stop-color="#ffd84d"/></linearGradient>
    <linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="1"><stop offset=".3" stop-color="#fff" stop-opacity="0"/><stop offset=".45" stop-color="#fff" stop-opacity=".85"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <clipPath id="${id}c"><circle cx="50" cy="50" r="44"/></clipPath>
    <mask id="${id}m" maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100" style="mask-type:alpha"><image href="img/logos/secondary.png" x="11" y="12" width="78" height="74"/></mask>
    <filter id="${id}cut" x="-10%" y="-10%" width="120%" height="120%"><feMorphology in="SourceAlpha" operator="dilate" radius="1.6" result="d"/>
      <feFlood flood-color="#fbfbfd"/><feComposite in2="d" operator="in" result="w"/><feMorphology in="d" operator="dilate" radius=".5" result="d2"/>
      <feFlood flood-color="#8a8f9c"/><feComposite in2="d2" operator="in" result="e"/><feMerge><feMergeNode in="e"/><feMergeNode in="w"/></feMerge></filter></defs>
  <ellipse cx="52" cy="94" rx="34" ry="2.5" fill="#000" opacity=".35"/>
  <circle cx="50" cy="50" r="44" fill="url(#${id}b)" stroke="${INK}" stroke-width="2.6"/>
  <g clip-path="url(#${id}c)">${scuffs}
    ${seam('M18 14 C34 30 34 70 18 88', [[21, 20, 60], [27, 30, 75], [30, 42, 88], [30, 55, 98], [27, 67, 110], [22, 78, 122]])}
    ${seam('M84 12 C66 30 66 70 84 90', [[80, 19, 118], [74, 30, 104], [70, 42, 92], [70, 55, 82], [73, 67, 70], [79, 79, 58]])}
    <!-- die-cut sticker of the SQUAWKS wordmark in holographic disco foil: rainbow foil broken into mirror-ball tiles -->
    <g transform="rotate(4 50 50)">
      <image href="img/logos/secondary.png" x="11" y="12" width="78" height="74" filter="url(#${id}cut)"/>
      <g mask="url(#${id}m)">
        <rect x="8" y="8" width="84" height="84" fill="url(#${id}h)"/>
        ${tiles}
        <image href="img/logos/secondary.png" x="11" y="12" width="78" height="74" opacity=".32" style="mix-blend-mode:multiply"/>
        <rect x="8" y="8" width="84" height="84" fill="url(#${id}g)"/>
      </g>
      ${glints}
    </g>
    <circle cx="50" cy="50" r="44" fill="none" stroke="#5a4d35" stroke-width="7" opacity=".18"/>
  </g>
  <path d="M24 24 Q32 14 44 12" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".6" fill="none"/>
  </svg>`;
}
// ---------------- finishing details ----------------
// Three red cowbells bunched together
function cowbellsSVG() {
  const bell = (x, y, r, k) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${k})">
      <path d="M14 0 L10 -26 L15 -24 L19 -1 Z" fill="#9e1418" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
      <path d="M-14 0 L-10 -26 Q0 -29 10 -26 L14 0 Q0 4 -14 0 Z" fill="url(#cbR)" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="M-5 -27 V-36 Q0 -42 5 -36 V-27" fill="none" stroke="${INK}" stroke-width="4.4"/><path d="M-5 -27 V-36 Q0 -42 5 -36 V-27" fill="none" stroke="#e3262b" stroke-width="2.4"/>
      <rect x="-1.6" y="-26" width="3.2" height="3" fill="#2a0607"/>
      <path d="M-9 -21 L-11.5 -3" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".7"/><path d="M-6 -24 Q0 -26 6 -24" stroke="#fff" stroke-width="1.2" opacity=".55" fill="none"/></g>`;
  return `<svg viewBox="0 0 120 92" class="cb-svg" aria-hidden="true">
  <defs><linearGradient id="cbR" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ff5a5e"/><stop offset=".45" stop-color="#e3262b"/><stop offset="1" stop-color="#b3161b"/></linearGradient></defs>
  <ellipse cx="62" cy="90" rx="52" ry="3" fill="#000" opacity=".3"/>
  ${bell(34, 84, -10, .95)}${bell(88, 85, 12, .92)}${bell(60, 90, -2, 1.08)}
  </svg>`;
}
// The 3D-printed Squawks hawk figurine: hawk in a black jersey with red, light-blue and white stripes, red gloves,
// stick on the puck, on a round black base with an ice top
function figurineSVG() {
  const stripes = (d, w = 2) => ['#e3262b', '#8fd0f0', '#ffffff'].map((c, i) => `<path d="${d}" transform="translate(0 ${i * w})" stroke="${c}" stroke-width="${w * .8}" fill="none"/>`).join('');
  return `<svg viewBox="0 0 140 148" class="fg-svg" aria-hidden="true">
  <path d="M12 122 V134 Q70 150 128 134 V122 Z" fill="#1b1d21" stroke="${INK}" stroke-width="2.2"/>
  <ellipse cx="70" cy="122" rx="58" ry="13" fill="#f4f7f9" stroke="${INK}" stroke-width="2.2"/>
  <path d="M30 120 Q44 116 58 121 M78 126 Q92 122 108 125 M54 129 Q66 127 76 130" stroke="#c9d3da" stroke-width="1" fill="none"/>
  <ellipse cx="104" cy="124" rx="7" ry="2.6" fill="#111" stroke="${INK}" stroke-width="1"/>
  <!-- wings, out behind the head -->
  <path d="M54 52 Q36 38 16 40 L23 45 L15 49 L25 52 L19 57 Q38 62 54 60 Z" fill="#7a5a44" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>
  <path d="M16 40 L23 45 L15 49 L25 52 L19 57 L28 56 L26 50 L31 47 L26 43 Z" fill="#fff"/>
  <path d="M86 52 Q104 38 124 40 L117 45 L125 49 L115 52 L121 57 Q102 62 86 60 Z" fill="#7a5a44" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>
  <path d="M124 40 L117 45 L125 49 L115 52 L121 57 L112 56 L114 50 L109 47 L114 43 Z" fill="#fff"/>
  <!-- legs: breezers, striped socks, skates -->
  <path d="M50 84 Q42 95 39 104 L50 106 Q54 96 61 90 Z" fill="#17191c" stroke="${INK}" stroke-width="1.8"/>
  <path d="M84 86 Q94 95 99 104 L88 107 Q84 98 78 92 Z" fill="#17191c" stroke="${INK}" stroke-width="1.8"/>
  <path d="M39 102 L50 104 L48 115 L37 113 Z" fill="#17191c" stroke="${INK}" stroke-width="1.6"/>${stripes('M38.5 106 L49.5 108', 1.8)}
  <path d="M88 104 L99 102 L101 113 L90 115 Z" fill="#17191c" stroke="${INK}" stroke-width="1.6"/>${stripes('M88.5 106.5 L99.5 104.5', 1.8)}
  <path d="M31 113 L50 115 Q53 120 49 122 L29 122 Q26 117 31 113 Z" fill="#111" stroke="${INK}" stroke-width="1.6"/><path d="M38 116 l3 2 M42 115.5 l3 2" stroke="#fff" stroke-width="1"/>
  <path d="M89 113 L107 111 Q111 116 107 120 L89 121 Q86 117 89 113 Z" fill="#111" stroke="${INK}" stroke-width="1.6"/><path d="M95 114 l3 2 M99 113.5 l3 2" stroke="#fff" stroke-width="1"/>
  <!-- pants and jersey -->
  <path d="M47 74 Q70 70 92 76 L93 92 Q80 96 70 90 Q60 96 47 92 Z" fill="#17191c" stroke="${INK}" stroke-width="2"/>${stripes('M48 86 Q70 82 92 87', 1.6)}
  <path d="M45 56 Q70 47 95 56 L93 80 Q70 86 47 80 Z" fill="#17191c" stroke="${INK}" stroke-width="2"/>${stripes('M47 70 Q70 75 93 70', 2)}
  <!-- the stick, down to the puck -->
  <path d="M38 64 L104 119" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><path d="M38 64 L104 119" stroke="#2a2d33" stroke-width="2.6" stroke-linecap="round"/>
  <path d="M101 116 L121 121 L122 126 L100 122 Z" fill="#f2f2f2" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/><path d="M106 119 v4 M111 120 v4 M116 121 v4" stroke="#c9c9c9" stroke-width=".8"/>
  <!-- arms and red gloves -->
  <path d="M46 57 Q35 63 37 75 L48 77 Q47 67 54 62 Z" fill="#17191c" stroke="${INK}" stroke-width="1.8"/>${stripes('M37 70 L48 71.5', 1.6)}
  <path d="M93 58 Q102 70 93 90 L83 93 Q89 77 85 64 Z" fill="#17191c" stroke="${INK}" stroke-width="1.8"/>${stripes('M86 84 L95 86', 1.6)}
  <rect x="37" y="69" width="13" height="12" rx="4" fill="#e3262b" stroke="${INK}" stroke-width="1.8" transform="rotate(-12 43 75)"/>
  <rect x="73" y="91" width="13" height="12" rx="4" fill="#e3262b" stroke="${INK}" stroke-width="1.8" transform="rotate(-20 79 97)"/>
  <!-- head: brown feathers, white face, angry brows, hooked yellow beak -->
  <ellipse cx="70" cy="36" rx="27" ry="24" fill="#7a5a44" stroke="${INK}" stroke-width="2.2"/>
  <path d="M52 22 q3 -3 6 0 M62 16 q3 -3 6 0 M74 16 q3 -3 6 0 M84 22 q3 -3 6 0 M57 28 q3 -3 6 0 M79 28 q3 -3 6 0 M67 22 q3 -3 6 0" stroke="#5a412f" stroke-width="1.2" fill="none"/>
  <path d="M48 40 Q50 59 70 63 Q90 59 92 40 Q81 33 70 39 Q59 33 48 40 Z" fill="#fff" stroke="${INK}" stroke-width="1.6"/>
  <path d="M49 31 L67 39 L65 42.5 L49 36 Z" fill="#fff" stroke="${INK}" stroke-width="1.3"/><path d="M91 31 L73 39 L75 42.5 L91 36 Z" fill="#fff" stroke="${INK}" stroke-width="1.3"/>
  <circle cx="60" cy="44" r="4.2" fill="#f2c23a" stroke="${INK}" stroke-width="1.6"/><circle cx="80" cy="44" r="4.2" fill="#f2c23a" stroke="${INK}" stroke-width="1.6"/>
  <circle cx="61" cy="44.5" r="1.7" fill="${INK}"/><circle cx="79" cy="44.5" r="1.7" fill="${INK}"/>
  <path d="M62 47 Q70 43 78 47 Q79 56 72 63 Q69 64 68 61 Q64 55 62 47 Z" fill="#f4c430" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>
  <path d="M66 55 Q70 58 74 55" stroke="#c8302c" stroke-width="1.4" fill="none"/><path d="M71 61 Q73 58 76 53" stroke="#c99a1c" stroke-width="1.2" fill="none"/>
  </svg>`;
}
// A crumpled knit beanie lying on its side: red crown, cream and light-blue stripes, SQUAWKS on a black band, crossed
// sticks on a red band, black cuff with the primary logo patch, red/blue/black pom-pom
function beanieSVG() {
  const id = 'bn' + (++uid);
  const shape = 'M20 166 L17 134 Q12 96 28 56 Q46 22 75 18 Q104 22 122 56 Q138 96 133 134 L131 166 Q100 172 74 168 Q46 173 20 166 Z';
  const band = (y, h, c) => `<rect x="0" y="${y}" width="150" height="${h}" fill="${c}"/>`;
  const sticks = [24, 52, 80, 108].map(x => `<g transform="translate(${x} 118)" stroke="#f3ecdc" stroke-width="1.8" fill="none" stroke-linecap="round"><path d="M-6 -5 L5 5 l3 0 M6 -5 L-5 5 l-3 0"/></g>`).join('');
  const pom = Array.from({ length: 34 }, (_, k) => { const a = k * 2.39, r = 4 + (k % 5) * 2.2, x = 75 + Math.cos(a) * r, y = 13 + Math.sin(a) * r * .8;
    return `<path d="M${x.toFixed(1)} ${y.toFixed(1)} l${(Math.cos(a) * 5).toFixed(1)} ${(Math.sin(a) * 4).toFixed(1)}" stroke="${['#e3262b', '#8fc3ea', '#16181b'][k % 3]}" stroke-width="2.4" stroke-linecap="round"/>`; }).join('');
  return `<svg viewBox="0 0 200 112" class="bn-svg" aria-hidden="true">
  <defs><clipPath id="${id}c"><path d="${shape}"/></clipPath>
    <pattern id="${id}k" width="3" height="3.4" patternUnits="userSpaceOnUse"><path d="M0 0 L1.5 3 L3 0" stroke="#000" stroke-width=".5" fill="none" opacity=".25"/></pattern></defs>
  <ellipse cx="108" cy="109" rx="86" ry="3.5" fill="#000" opacity=".3"/>
  <g transform="translate(40 108) skewX(-24) scale(1.06 .62) translate(0 -168)">
    <g clip-path="url(#${id}c)">
      ${band(0, 70, '#e3262b')}${band(56, 5, '#f3ecdc')}${band(61, 2, '#16181b')}${band(63, 5, '#8fc3ea')}${band(68, 2, '#16181b')}${band(70, 5, '#f3ecdc')}${band(75, 4, '#e3262b')}
      ${band(79, 25, '#16181b')}
      <text x="75" y="98" text-anchor="middle" font-family="'Arial Black',Impact,sans-serif" font-size="15" fill="#e3262b" stroke="#f3ecdc" stroke-width=".8" letter-spacing="1.5">SQUAWKS</text>
      ${band(104, 4, '#8fc3ea')}${band(108, 20, '#e3262b')}${sticks}${band(128, 8, '#16181b')}${band(136, 40, '#1d1f23')}
      <path d="M0 136 H150" stroke="#000" stroke-width="2" opacity=".5"/>
      <image href="img/logos/primary.png" x="57" y="140" width="36" height="26.6"/>
      <rect x="0" y="0" width="150" height="180" fill="url(#${id}k)"/>
      <!-- crumples -->
      <path d="M30 60 Q50 80 44 120 Q40 140 52 166 L20 166 Q14 110 30 60 Z" fill="#000" opacity=".25"/>
      <path d="M96 30 Q86 70 98 100 Q108 128 96 166" stroke="#000" stroke-width="7" opacity=".18" fill="none"/>
      <path d="M100 30 Q90 70 102 100 Q112 128 100 166" stroke="#fff" stroke-width="2" opacity=".18" fill="none"/>
      <path d="M60 22 Q70 60 62 96" stroke="#000" stroke-width="4" opacity=".15" fill="none"/>
      <path d="M10 104 Q50 92 80 106 Q110 120 140 100" stroke="#000" stroke-width="6" opacity=".22" fill="none"/>
      <path d="M10 101 Q50 89 80 103 Q110 117 140 97" stroke="#fff" stroke-width="1.6" opacity=".18" fill="none"/>
      <path d="M14 52 Q60 70 132 48" stroke="#000" stroke-width="5" opacity=".2" fill="none"/>
    </g>
    <path d="${shape}" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>
    ${pom}<circle cx="75" cy="13" r="2" fill="#16181b"/>
  </g>
  </svg>`;
}
// A wall-mounted TV with an idle screen; clicking it zooms in and plays the video
const TV_VIDEO = 'JeRkCnOnmmc';
function tvHTML() {
  return `<button class="tc-tv" type="button" data-trophy="tv" aria-label="TV: Squawks Fan Reaction. Play the video">
    <span class="tv-mount" aria-hidden="true"></span>
    <span class="tv-bezel"><span class="tv-screen"><span class="tv-idle"><span>Squawks Fan Reaction</span></span></span><span class="tv-led"></span></span></button>`;
}
export function openTV() {
  const ov = document.createElement('div'); ov.className = 'kv kv-ov tvz-ov'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', 'Squawks Fan Reaction');
  ov.innerHTML = `<div class="kv-stage tvz-stage"><div class="tvz"><span class="tv-bezel"><span class="tv-screen">
      <iframe src="https://www.youtube-nocookie.com/embed/${TV_VIDEO}?autoplay=1&rel=0&playsinline=1" title="Squawks Fan Reaction" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>
    </span><span class="tv-led on"></span></span></div></div>
    <div class="kv-bar"><div class="kv-cap"><b>Squawks Fan Reaction</b><a class="small" href="https://www.youtube.com/watch?v=${TV_VIDEO}" target="_blank" rel="noopener">Open on YouTube ↗</a></div>
      <button class="kv-btn kv-x" data-tv="close" aria-label="Close">✕</button></div>`;
  document.body.appendChild(ov); document.body.classList.add('kv-open');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const close = () => { ov.classList.add('closing'); document.body.classList.remove('kv-open'); removeEventListener('keydown', key); setTimeout(() => ov.remove(), reduce ? 0 : 250); };
  const key = e => { if (e.key === 'Escape') close(); };
  ov.addEventListener('click', e => { if (e.target.closest('[data-tv="close"]') || e.target === ov.querySelector('.tvz-stage')) close(); });
  addEventListener('keydown', key);
  ov.querySelector('[data-tv="close"]').focus();
}
// The skeleton sitting on top of the case, as in the bar photo: Squawks beanie, white shoulder pads, head tilted with a
// grin, both hands resting on the top of the case, legs dangling over the front. The seat (the case's top edge) is at y=118.
function skeletonSVG() {
  const id = 'sk' + (++uid), bone = '#efe8d4', ink = `stroke="${INK}" stroke-linejoin="round" stroke-linecap="round"`;
  const b = (d, w = 1.8) => `<path d="${d}" fill="${bone}" ${ink} stroke-width="${w}"/>`;
  const long = (x1, y1, x2, y2, w = 5) => { const a = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI, l = Math.hypot(x2 - x1, y2 - y1);
    return `<g transform="translate(${x1} ${y1}) rotate(${a})"><path d="M0 ${-w * .75} Q${l * .12} ${-w * .4} ${l / 2} ${-w * .42} Q${l * .88} ${-w * .4} ${l} ${-w * .75} Q${l + w} 0 ${l} ${w * .75} Q${l * .88} ${w * .4} ${l / 2} ${w * .42} Q${l * .12} ${w * .4} 0 ${w * .75} Q${-w} 0 0 ${-w * .75} Z" fill="${bone}" ${ink} stroke-width="1.6"/></g>`; };
  const toes = (x, y, dir) => [0, 1, 2, 3].map(i => `<path d="M${x + dir * (i * 2.4 - 3)} ${y} l${dir * (i - 1.5) * .8} 7" stroke="${INK}" stroke-width="3.4" stroke-linecap="round"/><path d="M${x + dir * (i * 2.4 - 3)} ${y} l${dir * (i - 1.5) * .8} 7" stroke="${bone}" stroke-width="1.8" stroke-linecap="round"/>`).join('');
  const fingers = (x, y) => [0, 1, 2, 3].map(i => `<path d="M${x + i * 2.6} ${y} q1 -4 ${.5 + i * .4} -7" stroke="${INK}" stroke-width="3.2" stroke-linecap="round" fill="none"/><path d="M${x + i * 2.6} ${y} q1 -4 ${.5 + i * .4} -7" stroke="${bone}" stroke-width="1.6" stroke-linecap="round" fill="none"/>`).join('');
  const pom = Array.from({ length: 26 }, (_, k) => { const a = k * 2.39, r = 2 + (k % 4) * 1.6, x = 50 + Math.cos(a) * r, y = 7 + Math.sin(a) * r * .85;
    return `<path d="M${x.toFixed(1)} ${y.toFixed(1)} l${(Math.cos(a) * 3.4).toFixed(1)} ${(Math.sin(a) * 3).toFixed(1)}" stroke="${['#e3262b', '#8fc3ea', '#16181b'][k % 3]}" stroke-width="2" stroke-linecap="round"/>`; }).join('');
  return `<svg viewBox="0 -14 140 246" class="sk-svg" aria-hidden="true">
  <defs><clipPath id="${id}h"><path d="M30 40 Q30 12 52 10 Q74 12 74 40 Z"/></clipPath></defs>
  <!-- shadow on the case top -->
  <ellipse cx="70" cy="118" rx="44" ry="3" fill="#000" opacity=".3"/>
  <!-- legs: thighs come toward us over the edge, shins dangle down the front of the case -->
  ${long(50, 116, 46, 128, 7)}${long(88, 116, 94, 128, 7)}
  <ellipse cx="45" cy="130" rx="7" ry="5" fill="${bone}" ${ink} stroke-width="1.6"/><ellipse cx="95" cy="130" rx="7" ry="5" fill="${bone}" ${ink} stroke-width="1.6"/>
  ${long(43, 134, 38, 196, 4.4)}${long(49, 134, 45, 196, 2.6)}
  ${long(97, 134, 104, 194, 4.4)}${long(91, 134, 97, 194, 2.6)}
  ${b('M34 196 Q42 192 49 197 L47 206 Q40 208 35 204 Z', 1.5)}${toes(39, 205, 1)}
  ${b('M93 195 Q100 190 108 194 L108 203 Q102 206 95 203 Z', 1.5)}${toes(102, 202, 1)}
  <!-- pelvis on the ledge -->
  ${b('M46 104 Q56 96 70 100 Q84 96 94 104 Q96 114 88 118 Q78 112 70 117 Q62 112 52 118 Q44 114 46 104 Z')}
  <circle cx="58" cy="110" r="3" fill="#2a2620"/><circle cx="82" cy="110" r="3" fill="#2a2620"/>
  <!-- spine and ribs -->
  ${[0, 1, 2, 3].map(i => `<rect x="66.5" y="${86 + i * 4}" width="7" height="3.4" rx="1.4" fill="${bone}" ${ink} stroke-width="1.2"/>`).join('')}
  ${b('M52 58 Q70 52 88 58 Q92 74 84 84 Q70 90 56 84 Q48 74 52 58 Z')}
  ${[64, 70, 76].map(y => `<path d="M55 ${y} Q70 ${y + 5} 85 ${y}" stroke="${INK}" stroke-width="1.3" fill="none"/>`).join('')}
  <path d="M70 56 V84" stroke="${INK}" stroke-width="1.6"/>
  <!-- his right arm hangs down to the case top; his left arm reaches up and back -->
  ${long(42, 58, 36, 86, 4)}${long(36, 88, 40, 112, 3.4)}
  ${b('M35 110 Q41 108 45 112 L44 118 Q38 119 35 116 Z', 1.4)}
  ${long(98, 58, 104, 86, 4)}${long(104, 88, 100, 112, 3.4)}
  ${b('M105 110 Q99 108 95 112 L96 118 Q102 119 105 116 Z', 1.4)}
  <!-- white hockey shoulder pads -->
  <path d="M40 52 Q46 42 62 44 L70 50 L78 44 Q94 42 100 52 L100 70 Q92 76 88 70 L86 60 Q78 66 70 64 Q62 66 54 60 L52 70 Q48 76 40 70 Z" fill="#f4f6f8" ${ink} stroke-width="2"/>
  <path d="M36 50 Q36 38 50 38 Q58 40 58 50 Q56 62 48 64 Q38 62 36 50 Z" fill="#fbfcfd" ${ink} stroke-width="2"/>
  <path d="M84 48 Q84 36 96 36 Q106 38 106 48 Q104 60 96 62 Q86 60 84 48 Z" fill="#fbfcfd" ${ink} stroke-width="2"/>
  <path d="M40 46 Q46 41 54 43 M88 44 Q94 39 102 41" stroke="#fff" stroke-width="2" fill="none"/><path d="M38 56 Q46 62 56 58 M86 54 Q94 60 104 56" stroke="#b9c3cc" stroke-width="1.2" fill="none"/>
  <rect x="58" y="60" width="9" height="3" rx="1" fill="#c8302c"/>
  <!-- skull, tilted, grinning -->
  <g transform="translate(18 0) rotate(-5 52 40)">
    ${b('M33 30 Q33 12 52 12 Q71 12 71 30 Q71 40 64 44 L64 50 Q52 56 40 50 L40 44 Q33 40 33 30 Z', 2)}
    <ellipse cx="44.5" cy="31" rx="5.6" ry="5" fill="#26221c"/><ellipse cx="59.5" cy="31" rx="5.6" ry="5" fill="#26221c"/>
    <path d="M52 35 L50 40 L54 40 Z" fill="#26221c"/>
    <path d="M41 45 Q52 50 63 45" stroke="${INK}" stroke-width="1.4" fill="none"/>
    ${[43, 46.5, 50, 53.5, 57, 60.5].map(x => `<path d="M${x} 44.5 v4" stroke="${INK}" stroke-width=".9"/>`).join('')}
    <!-- Squawks beanie, pulled down to his brow -->
    <g transform="translate(0 -16)"><g clip-path="url(#${id}h)">
      <rect x="28" y="0" width="50" height="22" fill="#e3262b"/>
      <rect x="28" y="20" width="50" height="2.2" fill="#f3ecdc"/><rect x="28" y="22.2" width="50" height="1" fill="#16181b"/><rect x="28" y="23.2" width="50" height="2.2" fill="#8fc3ea"/><rect x="28" y="25.4" width="50" height="1" fill="#16181b"/>
      <rect x="28" y="26.4" width="50" height="14" fill="#16181b"/>
      <text x="52" y="35.8" text-anchor="middle" font-family="'Arial Black',Impact,sans-serif" font-size="6.4" fill="#e3262b" stroke="#f3ecdc" stroke-width=".35" letter-spacing=".4">SQUAWKS</text>
    </g>
    <path d="M30 40 Q30 12 52 10 Q74 12 74 40" fill="none" ${ink} stroke-width="2"/>
    <path d="M28 36 Q52 31 76 36 L76 45 Q52 41 28 45 Z" fill="#1d1f23" ${ink} stroke-width="2"/>
    <image href="img/logos/primary.png" x="46" y="36.4" width="12" height="8.9"/>
    ${pom}<circle cx="52" cy="8" r="1.2" fill="#16181b"/></g>
  </g>
  </svg>`;
}
// ---------------- graffiti and odds and ends ----------------
// words scratched into the wooden shelf with a key
function scratchSVG() {
  return `<svg viewBox="0 0 220 34" class="sc-scratch" aria-label="Scratched into the wood: Fuck Norris">
  <defs><filter id="scrF" x="-5%" y="-30%" width="110%" height="160%"><feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.4"/></filter></defs>
  <g filter="url(#scrF)" font-family="'Bradley Hand','Segoe Print','Comic Sans MS',cursive" font-size="25" font-style="italic" fill="none" stroke-linecap="round" stroke-linejoin="round" transform="rotate(-3 110 17)">
    <text x="110" y="25" text-anchor="middle" stroke="#3b1d08" stroke-width="1.6" opacity=".55" transform="translate(.6 .8)">Fuck Norris</text>
    <text x="110" y="25" text-anchor="middle" stroke="#ffd9a6" stroke-width="1.1" opacity=".9">Fuck Norris</text>
  </g>
  <path d="M30 29 l12 -2 M170 9 l14 -3" stroke="#ffd9a6" stroke-width=".7" opacity=".6"/>
  </svg>`;
}
// pink Sharpie on the glass, inside a heart
function squivesSVG() {
  return `<svg viewBox="0 0 230 150" class="sq-graffiti" aria-label="Written on the glass in pink marker: Squives were here">
  <g fill="none" stroke="#ff4fa8" stroke-linecap="round" stroke-linejoin="round" opacity=".92">
    <path d="M115 140 C70 108 14 86 12 46 C10 18 34 6 58 10 C84 14 104 34 115 52 C126 32 148 12 176 10 C202 9 222 26 218 54 C214 90 160 112 115 140 Z" stroke-width="4.2"/>
    <path d="M117 136 C78 110 22 88 18 50" stroke-width="1.4" opacity=".6"/>
  </g>
  <g font-family="'Permanent Marker','Marker Felt',cursive" fill="#ff4fa8" text-anchor="middle" opacity=".95" transform="rotate(-6 115 70)">
    <text x="114" y="64" font-size="25">Squives</text><text x="116" y="92" font-size="21">were here</text></g>
  </svg>`;
}
// sticky note with the Livebarn code history
function stickyHTML() {
  const strike = w => `<svg class="sn-strike" viewBox="0 0 60 14" preserveAspectRatio="none" aria-hidden="true"><path d="M2 9 L58 5 M3 4 Q18 12 30 6 T57 9" stroke="#1f2a6b" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg>`;
  return `<div class="tc-sticky" aria-label="Sticky note: Livebarn code. 6868 crossed out, 8686 crossed out, dead">
    <b>Livebarn code</b><span class="sn-x">6868${strike()}</span><span class="sn-x">8686${strike()}</span><span>dead :(</span></div>`;
}
// emergency box: red frame, glass front, a jello shot inside, a little glass-breaker hammer resting on top
function jelloBoxSVG() {
  return `<svg viewBox="0 0 120 141" class="jb-svg" role="img" aria-label="A jello shot in a glass case: break glass for goal">
  <defs><linearGradient id="jbR" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff5257"/><stop offset="1" stop-color="#b3121a"/></linearGradient>
    <linearGradient id="jbJ" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff3d6e"/><stop offset="1" stop-color="#c3123f"/></linearGradient></defs>
  <ellipse cx="60" cy="139" rx="52" ry="2" fill="#000" opacity=".35"/>
  <!-- the hammer lying on top -->
  <g transform="translate(14 22) rotate(-6)">
    <rect x="0" y="2" width="70" height="7" rx="3" fill="#e3262b" stroke="${INK}" stroke-width="2"/>
    <path d="M66 -4 L90 -4 Q94 -4 94 0 L94 15 Q94 19 90 19 L66 19 Z" fill="#c9ced3" stroke="${INK}" stroke-width="2"/>
    <path d="M94 4 L100 7.5 L94 11" fill="#c9ced3" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M70 -1 H90" stroke="#fff" stroke-width="1.6"/></g>
  <!-- the box -->
  <rect x="6" y="34" width="108" height="104" rx="5" fill="url(#jbR)" stroke="${INK}" stroke-width="2.6"/>
  <rect x="16" y="44" width="88" height="84" rx="2" fill="#0d1a2e" stroke="${INK}" stroke-width="2"/>
  <!-- jello shot: little plastic cup, wide at the top and narrow at the base, with a clear snap-on lid -->
  <ellipse cx="60" cy="121" rx="12" ry="2" fill="#000" opacity=".35"/>
  <path d="M41 95 L47 120 H73 L79 95 Z" fill="#f4f7fa" fill-opacity=".5" stroke="#9fb0bf" stroke-width="1.6" stroke-linejoin="round"/>
  <path d="M43 99 L48 118 H72 L77 99 Z" fill="url(#jbJ)"/><ellipse cx="60" cy="99" rx="17" ry="2.6" fill="#ff7a98"/>
  <path d="M46 103 L49.5 115" stroke="#fff" stroke-width="2" opacity=".6" stroke-linecap="round"/>
  <path d="M38 92 Q38 88 42 88 H78 Q82 88 82 92 L81 95 H39 Z" fill="#e9f3fa" fill-opacity=".8" stroke="#8fa3b4" stroke-width="1.6" stroke-linejoin="round"/>
  <ellipse cx="60" cy="88" rx="17" ry="2.2" fill="#f7fbfe" stroke="#8fa3b4" stroke-width="1.2"/>
  <path d="M44 90.5 H58" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/>
  <!-- glass front -->
  <rect x="16" y="44" width="88" height="84" rx="2" fill="#bfe6ff" fill-opacity=".18"/>
  <path d="M22 50 L50 50 L22 86 Z M58 50 L66 50 L26 104 L22 104 Z" fill="#fff" opacity=".28"/>
  <!-- lettering on the glass -->
  <g font-family="'Arial Black',Impact,sans-serif" font-size="12" font-weight="900" fill="#ffd84a" stroke="#b3121a" stroke-width="2.4" stroke-linejoin="round" paint-order="stroke" text-anchor="middle">
    <text x="60" y="63" textLength="80" lengthAdjust="spacingAndGlyphs">BREAK GLASS</text><text x="60" y="78" textLength="62" lengthAdjust="spacingAndGlyphs">FOR GOAL</text></g>
  </svg>`;
}
// Lindsay's goalie jersey: white, green LINDSAY over an upside-down LINDSAY, 33 on the chest.
function jerseySVG() {
  const g = '#119a6c', shirt = 'M60 30 L96 18 Q110 34 124 18 L160 30 L208 64 L190 104 L164 90 L166 214 Q110 222 54 214 L56 90 L30 104 L12 64 Z';
  const word = `font-family="'Arial Black',Impact,sans-serif" font-size="25" fill="${g}" text-anchor="middle" textLength="104" lengthAdjust="spacingAndGlyphs"`;
  const body = `
    <path d="${shirt}" fill="#fbfbf8" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>
    <path d="M96 18 Q110 52 124 18" fill="#eceae3" stroke="${INK}" stroke-width="2.2"/>
    <path d="M90 21 L110 58 L130 21" fill="none" stroke="#d9d6cc" stroke-width="2"/>
    <path d="M56 90 L58 210 M164 90 L162 210" stroke="#e6e3da" stroke-width="2"/><path d="M30 104 L48 70 M190 104 L172 70" stroke="#e6e3da" stroke-width="1.6"/>
    <text x="146" y="74" font-family="'Arial Black',Impact,sans-serif" font-size="15" fill="${g}" stroke="#fff" stroke-width=".8" paint-order="stroke" text-anchor="middle">33</text>
    <text x="110" y="116" ${word}>LINDSAY</text>
    <text x="110" y="124" ${word} transform="rotate(180 110 130)">LINDSAY</text>`;
  // on a hanger: the wooden bar is inside the jersey, seen only through the neck hole; the metal hook comes up out of
  // the bar's centre and curls over a nail
  return `<svg viewBox="0 -14 220 238" class="js-svg" role="img" aria-label="Lindsay's number 33 goalie jersey on a hanger">
    <defs><clipPath id="jsN"><path d="M96 18 Q110 52 124 18 Z"/></clipPath>
      <linearGradient id="jsW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c58a48"/><stop offset="1" stop-color="#8a5726"/></linearGradient></defs>
    ${body}
    <g clip-path="url(#jsN)">
      <rect x="90" y="16" width="40" height="40" fill="#d8d4c8"/>
      <path d="M86 26 Q110 18 134 26 L134 33 Q110 25 86 33 Z" fill="url(#jsW)" stroke="${INK}" stroke-width="1.4"/>
    </g>
    <path d="M96 18 Q110 52 124 18" fill="none" stroke="${INK}" stroke-width="2.2"/>
    <circle cx="110" cy="23" r="2.6" fill="#b9c1c8" stroke="${INK}" stroke-width="1.2"/>
    <path d="M110 22 V11 Q110 5 114.5 2 Q119 -2 116 -7 Q113 -10.5 107.5 -8" fill="none" stroke="${INK}" stroke-width="4.4" stroke-linecap="round"/>
    <path d="M110 22 V11 Q110 5 114.5 2 Q119 -2 116 -7 Q113 -10.5 107.5 -8" fill="none" stroke="#c3cad1" stroke-width="2.2" stroke-linecap="round"/>
    <circle cx="112" cy="-5" r="3.2" fill="#8a939c" stroke="${INK}" stroke-width="1.4"/>
    </svg>`;
}
// A skate sharpener (from the photo of the user's): long dark-grey body, control pad and foot on the left, two skate
// holders in the top slot, translucent smoke tray glowing red underneath. A note is taped to the front.
function sharpenerSVG() {
  return `<svg viewBox="0 -4 600 108" class="sp-svg" role="img" aria-label="A skate sharpener with a note taped to it: sharpies tonight?">
  <defs><linearGradient id="spB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a5f66"/><stop offset=".5" stop-color="#3a3e44"/><stop offset="1" stop-color="#26292d"/></linearGradient>
    <linearGradient id="spT" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1416" stop-opacity=".9"/><stop offset=".55" stop-color="#8a1a22" stop-opacity=".85"/><stop offset="1" stop-color="#2a1416" stop-opacity=".95"/></linearGradient>
    <radialGradient id="spG" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ff4a3d" stop-opacity=".55"/><stop offset="1" stop-color="#ff4a3d" stop-opacity="0"/></radialGradient></defs>
  <ellipse cx="300" cy="101" rx="286" ry="3" fill="#000" opacity=".35"/>
  <g transform="translate(0 101) scale(1 1.3) translate(0 -101)">
  <!-- smoke tray, glowing red -->
  <path d="M28 60 H572 Q578 60 577 64 L571 94 Q569 98 563 98 H38 Q31 98 30 94 L24 64 Q24 60 28 60 Z" fill="url(#spT)" stroke="${INK}" stroke-width="2.4"/>
  <ellipse cx="300" cy="78" rx="250" ry="15" fill="url(#spG)"/>
  <path d="M60 72 H520" stroke="#ff8a6a" stroke-width="2.2" opacity=".75"/>
  <path d="M120 88 Q300 92 480 88" stroke="#ff5a4a" stroke-width="1.4" opacity=".5" fill="none"/>
  <circle cx="548" cy="81" r="7" fill="none" stroke="#d98a4a" stroke-width="2.2"/>
  <!-- body -->
  <path d="M34 30 Q34 22 42 22 H558 Q572 22 572 34 V60 H28 V38 Z" fill="url(#spB)" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>
  <path d="M42 25 H558" stroke="#8a9098" stroke-width="1.5"/>
  <!-- long top slot with the two skate holders -->
  <rect x="150" y="39" width="320" height="10" rx="2.5" fill="#16181b" stroke="${INK}" stroke-width="1.6"/>
  <path d="M200 49 L205 31 L212 31 L209 49 Z M410 49 L415 31 L422 31 L419 49 Z" fill="#c9ced3" stroke="${INK}" stroke-width="1.3"/>
  <circle cx="300" cy="30" r="1.6" fill="#16181b"/>
  <!-- end caps -->
  <rect x="570" y="32" width="10" height="24" rx="2.5" fill="#2a2d31" stroke="${INK}" stroke-width="1.8"/>
  <rect x="540" y="47" width="18" height="9" rx="2.5" fill="#1d1f23" stroke="${INK}" stroke-width="1.3"/>
  <!-- control pad and foot on the left -->
  <path d="M2 44 Q2 37 9 37 H30 V52 H9 Q2 52 2 46 Z" fill="#1d1f23" stroke="${INK}" stroke-width="2"/>
  <rect x="30" y="28" width="56" height="22" rx="3.5" fill="#1b1d20" stroke="${INK}" stroke-width="2"/>
  <path d="M46 35 A11 11 0 0 1 70 35" fill="none" stroke="#9fd3f2" stroke-width="1.5"/>
  <circle cx="42" cy="44" r="1.5" fill="#d7dde2"/><circle cx="51" cy="44" r="1.5" fill="#d7dde2"/><circle cx="60" cy="44" r="1.5" fill="#d7dde2"/><circle cx="69" cy="44" r="1.5" fill="#d7dde2"/>
  </g>
  <!-- the note, taped on -->
  <g transform="translate(0 -6) rotate(-4 330 52)">
    <rect x="290" y="34" width="80" height="40" fill="#fbfbf6" stroke="#bdbbb0" stroke-width=".8"/>
    <rect x="318" y="29" width="26" height="10" fill="#efe6c4" fill-opacity=".8" transform="rotate(6 331 34)"/>
    <text x="330" y="51" text-anchor="middle" font-family="'Permanent Marker','Marker Felt',cursive" font-size="12" fill="#1b1b1b">sharpies</text>
    <text x="330" y="67" text-anchor="middle" font-family="'Permanent Marker','Marker Felt',cursive" font-size="12" fill="#1b1b1b">tonight?</text></g>
  </svg>`;
}
// Hot-dog aftermath: crumpled foil wrappers, bread crumbs and smears of ketchup and mustard
function foilPileSVG() {
  let seed = 23; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const ball = (cx, cy, r) => {
    const n = 11, pts = Array.from({ length: n }, (_, i) => { const a = i / n * 6.283, rr = r * (.8 + rnd() * .32); return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * .9]; });
    const d = 'M' + pts.map(p => p.map(v => v.toFixed(1)).join(' ')).join(' L') + ' Z';
    const facets = Array.from({ length: 7 }, () => { const a = rnd() * 6.283, b = a + 1 + rnd() * 2, r1 = r * rnd() * .8, r2 = r * (.4 + rnd() * .5);
      return `M${(cx + Math.cos(a) * r1).toFixed(1)} ${(cy + Math.sin(a) * r1).toFixed(1)} L${(cx + Math.cos(b) * r2).toFixed(1)} ${(cy + Math.sin(b) * r2).toFixed(1)}`; }).join(' ');
    return `<path d="${d}" fill="url(#flG)" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/>
      <path d="${facets}" stroke="#7d8894" stroke-width="1" fill="none"/>
      <path d="M${cx - r * .5} ${cy - r * .3} l${r * .3} ${-r * .25}" stroke="#fff" stroke-width="2" stroke-linecap="round"/>`;
  };
  const crumbs = Array.from({ length: 26 }, () => { const x = 6 + rnd() * 168, y = 62 + rnd() * 9, r = .8 + rnd() * 1.6;
    return `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(r * 1.3).toFixed(1)}" ry="${r.toFixed(1)}" fill="${rnd() > .5 ? '#d9a560' : '#c08442'}" stroke="#6b4518" stroke-width=".4"/>`; }).join('');
  return `<svg viewBox="0 0 180 74" class="fl-svg" aria-label="Crumpled foil hot-dog wrappers, crumbs, ketchup and mustard">
  <defs><radialGradient id="flG" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#ffffff"/><stop offset=".45" stop-color="#cfd6dc"/><stop offset="1" stop-color="#8c97a2"/></radialGradient></defs>
  <ellipse cx="90" cy="71" rx="86" ry="3" fill="#000" opacity=".3"/>
  <path d="M112 66 Q124 61 138 64 Q148 68 140 71 Q126 74 114 71 Q106 69 112 66 Z" fill="#d8231f" opacity=".92"/><path d="M118 65 Q126 63 132 65" stroke="#ff7a6e" stroke-width="1" fill="none"/>
  <path d="M138 70 Q150 66 166 69 Q170 71 160 72.5 Q146 73.5 138 70 Z" fill="#f2c218"/>
  <path d="M30 70 Q40 67 52 69 Q46 72 30 70 Z" fill="#f2c218" opacity=".9"/>
  <path d="M98 70 q4 -2 8 0" stroke="#d8231f" stroke-width="2" stroke-linecap="round"/>
  ${ball(40, 52, 17)}${ball(74, 56, 14)}${ball(58, 36, 13)}${ball(98, 60, 10)}
  ${crumbs}
  </svg>`;
}
// A stage microphone hanging by its cable from a hook screwed into the back wall
function micSVG() {
  return `<svg viewBox="0 0 60 190" class="mc-svg" aria-label="A stage microphone hanging from a hook">
  <defs><radialGradient id="mcG" cx=".38" cy=".35" r=".7"><stop offset="0" stop-color="#f2f4f6"/><stop offset=".55" stop-color="#9aa4ad"/><stop offset="1" stop-color="#4b545c"/></radialGradient>
    <linearGradient id="mcH" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2a2d31"/><stop offset=".35" stop-color="#55595f"/><stop offset="1" stop-color="#16181b"/></linearGradient>
    <pattern id="mcM" width="3" height="3" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r=".7" fill="#3b4148" opacity=".55"/></pattern></defs>
  <!-- hook -->
  <rect x="24" y="2" width="12" height="7" rx="2" fill="#8a939c" stroke="${INK}" stroke-width="1.4"/>
  <path d="M30 9 V18 Q30 26 37 26 Q43 26 43 20" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/><path d="M30 9 V18 Q30 26 37 26 Q43 26 43 20" fill="none" stroke="#c3cad1" stroke-width="1.8" stroke-linecap="round"/>
  <!-- cable looped over the hook and hanging down to the mic -->
  <path d="M33 25 Q38 17 41 25 Q44 40 34 58 Q24 76 32 96 L30 104" fill="none" stroke="#111" stroke-width="3.2" stroke-linecap="round"/>
  <path d="M35 25 Q28 34 26 46 Q24 58 30 66" fill="none" stroke="#111" stroke-width="3" stroke-linecap="round"/>
  <!-- the mic, hanging head-down: XLR end, tapered handle, ring, mesh ball -->
  <rect x="25" y="102" width="10" height="8" rx="1.5" fill="#9aa4ad" stroke="${INK}" stroke-width="1.4"/>
  <path d="M24 110 H36 L39 150 H21 Z" fill="url(#mcH)" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
  <path d="M27 114 L25 146" stroke="#8a9098" stroke-width="1.4" opacity=".8"/>
  <rect x="19" y="150" width="22" height="6" rx="1.5" fill="#c9ced3" stroke="${INK}" stroke-width="1.6"/>
  <circle cx="30" cy="170" r="15" fill="url(#mcG)" stroke="${INK}" stroke-width="2"/>
  <circle cx="30" cy="170" r="15" fill="url(#mcM)"/>
  <path d="M15.5 168 Q30 174 44.5 168" stroke="#6b757e" stroke-width="1.3" fill="none"/>
  <path d="M22 162 Q25 158 29 157" stroke="#fff" stroke-width="2" stroke-linecap="round" fill="none"/>
  </svg>`;
}
// A clipboard leaning in the back corner of the top shelf
function clipboardSVG() {
  return `<svg viewBox="0 0 110 150" class="cl-svg" role="img" aria-label="Clipboard: Players too good for this league: SAM">
  <ellipse cx="62" cy="148" rx="44" ry="2.4" fill="#000" opacity=".35"/>
  <g transform="rotate(8 60 148)">
    <rect x="12" y="10" width="92" height="138" rx="6" fill="#a8743c" stroke="${INK}" stroke-width="2.4"/>
    <path d="M18 16 L98 16" stroke="#c99560" stroke-width="2" opacity=".7"/>
    <rect x="20" y="22" width="76" height="118" fill="#fbfaf4" stroke="#bdbbb0" stroke-width="1"/>
    ${[56, 64, 112, 120, 128].map(y => `<path d="M26 ${y} H90" stroke="#bcd3ea" stroke-width=".8"/>`).join('')}
    <path d="M30 22 V140" stroke="#f0a8a8" stroke-width=".8"/>
    <text x="58" y="40" text-anchor="middle" font-family="'Permanent Marker','Marker Felt',cursive" font-size="7.2" fill="#1f2a6b">Players too good</text>
    <text x="58" y="50" text-anchor="middle" font-family="'Permanent Marker','Marker Felt',cursive" font-size="7.2" fill="#1f2a6b">for this league</text>
    <text x="58" y="92" text-anchor="middle" font-family="'Permanent Marker','Marker Felt',cursive" font-size="30" fill="#1f2a6b">SAM</text>
    <path d="M30 98 Q58 95 88 97 M31 103 Q60 100 87 102" stroke="#1f2a6b" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <rect x="38" y="2" width="40" height="16" rx="3" fill="#c9ced3" stroke="${INK}" stroke-width="2"/>
    <rect x="48" y="0" width="20" height="7" rx="3" fill="none" stroke="${INK}" stroke-width="2"/>
    <path d="M42 8 H74" stroke="#fff" stroke-width="1.6"/>
  </g>
  </svg>`;
}
export function trophyCase(ctx) {
  const pres = ctx.presidents.map(p => `<a class="tc-item tc-pres" href="#/season/${p.id}" title="${svgText(p.name)}: ${svgText(p.record)}">
      ${presidentsSVG({ season: p.name, record: p.record })}<div class="tc-card">President's Trophy<br><b>${svgText(p.name)}</b></div></a>`).join('');
  const medals = ctx.runnerUps.map(r => `<a class="tc-medal" href="#/season/${r.id}" title="Runner-up, ${svgText(r.name)}">
      <span class="tc-hook"></span>${medalSVG({ season: r.name })}</a>`).join('');
  return `<section class="tcase" aria-label="Trophy case">
    <div class="tc-banner" aria-hidden="true"><span class="tb-rope"></span><span class="tb-cloth"><span class="tb-text">Trophy Room</span></span></div>
    <div class="tc-crown"><span>WinterSquawks</span> Trophy Case</div>
    <div class="tc-frame"><div class="tc-skel" aria-hidden="true">${skeletonSVG()}</div><div class="tc-jello" title="Break glass for goal">${jelloBoxSVG()}</div><div class="tc-sharpener" title="Sharpies tonight?">${sharpenerSVG()}</div><div class="tc-inner">
      <div class="tc-spots" aria-hidden="true"><i></i><i></i><i></i></div>
      ${ctx.runnerUps.length ? `<div class="tc-rail-wrap"><div class="tc-rail"></div><div class="tc-medals">${medals}</div>
        </div>` : ''}
      <div class="tc-shelf tc-top"><div class="tc-clip" title="Players too good for this league">${clipboardSVG()}</div>
        ${ctx.papers?.length ? `<div class="tc-papers" aria-label="Front pages">${ctx.papers.map(paperFrame).join('')}</div>` : ''}
        ${ctx.artRoss.length ? `<button class="tc-item tc-mini" type="button" data-trophy="ross" aria-label="Art Ross Trophy: see the winners">
          <div class="tc-mini-ross">${artRoss(ctx.artRoss, false)}</div><div class="tc-card">Art Ross Trophy<br><b>Points leaders</b></div></button>` : '<div></div>'}
        <button class="tc-item tc-keg" id="tc-keg" type="button" aria-label="The Stanley Keg: read the engravings">
          ${kegSVG({ wins: ctx.wsqWins, stickers: ctx.stickers })}
          ${pedestalSVG()}<span class="tc-cowbells">${cowbellsSVG()}</span><span class="tc-figurine">${figurineSVG()}</span></button>
        ${ctx.rocket.length ? `<button class="tc-item tc-mini" type="button" data-trophy="rocket" aria-label="Rocket Richard Trophy: see the winners">
          <div class="tc-mini-rocket">${rocketSVG(ctx.rocket)}</div><div class="tc-card">"Rocket" Richard Trophy<br><b>Goal leaders</b></div></button>` : '<div></div>'}
      </div>
      <div class="tc-board"><span class="tc-scratch">${scratchSVG()}</span></div>
      <div class="tc-shelf tc-level2"><div class="tc-mic" title="Hot dogs and karaoke?">${micSVG()}</div><div class="tc-foil" title="Somebody had hot dogs">${foilPileSVG()}</div><div class="tc-jersey" aria-hidden="true">${jerseySVG()}</div>${pres}<div class="tc-pucks-wrap">${tvHTML()}${ctx.cups.length ? `<button class="tc-item tc-pucks" type="button" data-trophy="pucks" aria-label="Squawk Cup winners: look at the pucks">${puckPileSVG(ctx.cups, true)}<div class="tc-card">Squawk 🏆 winners<br><b>${ctx.cups.length} season${ctx.cups.length === 1 ? '' : 's'}</b></div></button>` : ''}</div>
        <div class="tc-squawkcup has-tip" title="The Squawk Cup">${squawkCupSVG()}<div class="tc-baseball" title="A worn-out baseball">${baseballSVG()}</div></div></div>
      <div class="tc-board"></div>
      <span class="tc-squives">${squivesSVG()}</span>${stickyHTML()}
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
  const ov = document.createElement('div'); ov.className = 'kv kv-ov'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', 'Stanley Keg engravings');
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
  const ov = document.createElement('div'); ov.className = 'kv kv-ov tv'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', title);
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
