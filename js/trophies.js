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
    : `<span class="aw-eng" style="color:${w.fg}"><small>${svgText(w.short)}</small><b>${svgText(w.value ?? '')}</b><small>${unit}</small></span>`;
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
export function rocketSVG(winners = []) {
  const id = 'r' + (++uid), W = 340, cx = W / 2;
  const B = n => `url(#${id}${n})`;   // gradient reference
  const ink = (w = 2.4) => `stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

  // ---------------- the cup: a flared cone split down the middle and opened out ----------------
  // left half; the right half is its mirror image
  const outer = 'M150 188 L112 150 L118 147 L92 118 L98 114 L66 78 L72 74 L30 26 Q66 6 128 4 Z';   // outside of the half, stepped outer edge
  const inner = 'M150 188 L128 4 Q150 4 162 8 L164 184 Z';                                           // the concave inside, seen on the inner side
  const rimTop = 'M30 26 Q66 6 128 4 Q150 4 162 8 L160 13 Q148 9 128 10 Q70 12 35 31 Z';             // rolled top rim
  // reflections run along the cone, converging toward its base
  const streaks = [[40, .8, '#ffffff', 5], [58, .55, '#5d6a76', 3], [72, .9, '#ffffff', 3], [88, .5, '#7f8c97', 6], [104, .85, '#ffffff', 2.5], [116, .45, '#4f5b66', 3]]
    .map(([x, o, c, w]) => `<path d="M${x} ${26 - (x - 30) * .17} L150 186" stroke="${c}" stroke-width="${w}" opacity="${o}"/>`).join('');
  const half = `<g>
      <path d="${outer}" fill="${B('wo')}" ${ink(3)}/>
      <g clip-path="url(#${id}co)">${streaks}<path d="M30 26 L66 78 L150 188" stroke="#fff" stroke-width="10" opacity=".25" fill="none"/></g>
      <path d="${inner}" fill="${B('wi')}" ${ink(2.5)}/>
      <g clip-path="url(#${id}ci)"><path d="M138 6 L156 186 M150 6 L160 184" stroke="#fff" stroke-width="2" opacity=".45"/><path d="M132 6 L152 186" stroke="#2c353e" stroke-width="4" opacity=".35"/></g>
      <path d="${rimTop}" fill="${B('rim')}" ${ink(2)}/>
      <path d="M112 150 L118 147 M92 118 L98 114 M66 78 L72 74" stroke="#fff" stroke-width="2.2"/>
      <path d="M118 147 L150 182 M98 114 L148 176 M72 74 L146 170" stroke="#2c353e" stroke-width="1" opacity=".35"/>
    </g>`;

  // ---------------- the skater: bronze, sculpted, in stride with the stick down ----------------
  const fill = (d, f = B('br'), w = 2.4) => `<path d="${d}" fill="${f}" ${ink(w)}/>`;
  const shade = d => `<path d="${d}" fill="${B('brD')}" opacity=".85"/>`;
  const shine = (d, w = 2.2, o = .9) => `<path d="${d}" fill="none" stroke="#fff4d2" stroke-width="${w}" stroke-linecap="round" opacity="${o}"/>`;
  const skater = `<g>
    <!-- back leg (pushing off to the left) -->
    ${fill('M150 134 Q162 136 170 142 L154 170 Q146 168 138 158 Z')}
    ${fill('M138 158 L154 170 L128 190 Q120 188 116 180 Z')}
    ${shade('M154 170 L128 190 Q124 189 122 187 L146 166 Z')}
    <path d="M135 172 L144 179 M130 176 L139 183" stroke="#5a3a10" stroke-width="2.4"/>
    ${fill('M114 177 L128 184 L127 197 L98 199 Q92 198 93 193 Q95 190 102 189 L110 187 Z', B('br'), 2.2)}
    ${shade('M127 186 L127 197 L118 198 L120 188 Z')}
    <path d="M100 192 Q106 190 112 190" stroke="#fff4d2" stroke-width="1.5" fill="none" opacity=".8"/>
    <path d="M112 182 L120 186" stroke="#5a3a10" stroke-width="1.4"/>
    <path d="M90 204 L130 202" stroke="${INK}" stroke-width="4.5" fill="none" stroke-linecap="round"/><path d="M90 204 L130 202" stroke="#e9eef2" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M100 199 v4 M120 198 v4" stroke="${INK}" stroke-width="1.6"/>
    <!-- front leg (bent, carrying the weight) -->
    ${fill('M174 132 Q192 132 200 138 L210 166 Q202 172 192 170 Z')}
    ${fill('M192 168 L210 166 L206 192 L188 192 Z')}
    ${shade('M200 138 L210 166 L206 192 L200 192 L203 164 Z')}
    <path d="M190 178 L207 176 M189 183 L206 181" stroke="#5a3a10" stroke-width="2.4"/>
    ${fill('M184 190 L206 190 Q212 194 212 200 L182 200 Z', B('br'), 2.2)}
    <path d="M176 206 L218 206" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/><path d="M176 206 L218 206" stroke="#e9eef2" stroke-width="1.8" stroke-linecap="round"/>
    <!-- pants -->
    ${fill('M150 112 L196 112 Q204 124 204 140 Q194 146 182 142 L174 130 L166 142 Q154 146 144 140 Q144 124 150 112 Z', B('brD'))}
    <path d="M151 118 L195 118" stroke="${INK}" stroke-width="1.6"/>
    <path d="M152 124 Q150 132 150 140 M198 124 Q200 132 200 140" stroke="#f0c77a" stroke-width="2" opacity=".7" fill="none"/>
    ${shine('M156 128 Q160 124 166 124', 2, .6)}
    <!-- jersey -->
    ${fill('M146 70 Q172 58 200 72 L198 94 Q196 108 194 118 L152 118 Q148 106 148 94 Z')}
    ${shade('M186 64 Q200 70 198 94 Q196 108 194 118 L182 118 Q190 94 186 64 Z')}
    <path d="M150 104 Q172 110 196 104 L195 111 Q172 117 151 111 Z" fill="#6e4410" ${ink(1.5)}/>
    <path d="M164 64 L173 76 L182 64" fill="none" stroke="${INK}" stroke-width="2"/>
    <path d="M158 80 Q164 92 160 104 M182 82 Q178 94 184 104" stroke="#8a5a1c" stroke-width="1.5" fill="none"/>
    ${shine('M152 76 Q160 70 168 70', 3)}
    <!-- arms: top hand by the hip, bottom hand low by the knee -->
    ${fill('M148 70 Q136 76 130 96 L142 102 Q148 86 160 78 Z')}
    ${fill('M130 96 L142 102 L156 116 L146 124 Z')}
    <path d="M140 111 L150 103" stroke="#6e4410" stroke-width="3.5"/>
    ${fill('M196 72 Q210 78 214 100 L202 106 Q198 90 188 82 Z')}
    ${shade('M206 78 Q212 86 214 100 L208 103 Q206 90 200 82 Z')}
    ${fill('M214 100 L202 106 L194 164 L206 166 Z')}
    <path d="M196 148 L209 150" stroke="#6e4410" stroke-width="3.5"/>
    ${shine('M134 92 Q138 82 146 76', 2.2)}
    <!-- stick, then the gloves over it -->
    <path d="M136 106 L232 198" stroke="${INK}" stroke-width="7.5" stroke-linecap="round"/><path d="M136 106 L232 198" stroke="${B('br')}" stroke-width="4" stroke-linecap="round"/>
    <path d="M221 187 L229 195" stroke="#3b2507" stroke-width="4.2"/>
    ${fill('M228 196 Q244 202 266 202 Q268 208 262 210 Q240 210 226 203 Z', B('br'), 2.2)}
    ${fill('M140 112 Q146 106 154 110 Q160 116 156 124 Q148 128 142 122 Q138 118 140 112 Z', B('brD'), 2.2)}
    ${fill('M192 160 Q200 156 208 162 Q212 170 204 174 Q196 176 192 170 Q189 164 192 160 Z', B('brD'), 2.2)}
    <!-- head -->
    ${fill('M166 55 L180 55 L182 66 L164 66 Z', B('brD'), 2)}
    ${fill('M161 40 Q160 26 172 24 Q186 25 185 40 Q185 52 177 58 Q171 60 166 57 Q160 52 161 40 Z')}
    ${shade('M178 26 Q187 30 185 42 Q184 52 177 58 Q174 59 172 59 Q181 50 178 26 Z')}
    <path d="M159 38 Q157 21 172 20 Q188 20 186 37 Q183 28 174 27 Q165 27 159 38 Z" fill="#5a3a10" ${ink(1.8)}/>
    <path d="M164 28 Q170 23 178 24" stroke="#c48d2e" stroke-width="1.6" fill="none"/>
    <ellipse cx="185.5" cy="42" rx="2.6" ry="4" fill="${B('br')}" ${ink(1.5)}/>
    <path d="M164 36 Q167 34 170 36 M175 36 Q178 34 181 36" stroke="${INK}" stroke-width="1.6" fill="none"/>
    <path d="M165 39.5 h4 M176 39.5 h4" stroke="${INK}" stroke-width="2"/>
    <path d="M172.5 39 L171 46 L174 46.5" stroke="${INK}" stroke-width="1.3" fill="none"/>
    <path d="M168 51 Q173 52 178 50" stroke="${INK}" stroke-width="1.6" fill="none"/>
    ${shine('M164 30 Q166 27 170 26', 1.8)}
  </g>`;

  // ---------------- base: title tier, then winners tiers, filled left→right, top→bottom ----------------
  const n = winners.length, r2 = Math.max(1, Math.ceil(n / 9)), r3 = Math.max(1, Math.ceil(Math.max(0, n - 4 * r2) / 5));
  const tiers = [{ w: 112, h: 46, cols: 0, rows: 0 }, { w: 176, h: 16 + r2 * 30, cols: 4, rows: r2 }, { w: 224, h: 16 + r3 * 30, cols: 5, rows: r3 }];
  let y = 226, k = 0, base = '';
  const screws = (x, yy, w, h) => [[x + 2.2, yy + 2.2], [x + w - 2.2, yy + 2.2], [x + 2.2, yy + h - 2.2], [x + w - 2.2, yy + h - 2.2]].map(([a, b]) => `<circle cx="${a}" cy="${b}" r=".9" fill="#6b7681"/>`).join('');
  tiers.forEach((t, ti) => {
    const x0 = cx - t.w / 2, side = 22;
    base += `<path d="M${x0 - side - 4} ${y - 2} L${x0 - 2} ${y - 7} H${x0 + t.w + 2} L${x0 + t.w + side + 4} ${y - 2} Z" fill="#3a4048" ${ink(2)}/>`;   // top of the tier
    base += `<rect x="${x0 - side - 6}" y="${y - 3}" width="${t.w + 2 * side + 12}" height="6" rx="2" fill="${B('g')}" ${ink(2)}/>`;                // silver trim
    base += `<path d="M${x0 - side} ${y + 4} L${x0} ${y + 2} V${y + t.h} L${x0 - side} ${y + t.h + 3} Z" fill="${B('sideL')}" ${ink(2.5)}/>`;
    base += `<path d="M${x0 + t.w + side} ${y + 4} L${x0 + t.w} ${y + 2} V${y + t.h} L${x0 + t.w + side} ${y + t.h + 3} Z" fill="${B('sideR')}" ${ink(2.5)}/>`;
    base += `<rect x="${x0}" y="${y + 2}" width="${t.w}" height="${t.h - 2}" fill="${B('blk')}" ${ink(2.5)}/>`;
    base += `<rect x="${x0 + t.w * .12}" y="${y + 3}" width="${t.w * .07}" height="${t.h - 4}" fill="#fff" opacity=".07"/><rect x="${x0 + t.w * .22}" y="${y + 3}" width="${t.w * .02}" height="${t.h - 4}" fill="#fff" opacity=".1"/>`;
    for (let r = 0; r < Math.max(1, t.rows || 1); r++) for (const [sx, sk] of [[x0 - side + 5, -1], [x0 + t.w + 4, 1]]) {
      const ph = t.rows ? 22 : t.h - 18, py = y + 10 + r * 30;
      base += `<rect x="${sx}" y="${py}" width="13" height="${ph}" rx="1" fill="${B('pl')}" opacity=".5" transform="skewY(${sk * 6})" transform-origin="${sx + 6.5} ${py}" stroke="${INK}" stroke-width=".8"/>`;
    }
    if (ti === 0) {
      base += `<rect x="${cx - 46}" y="${y + 8}" width="92" height="${t.h - 14}" rx="2" fill="${B('pl')}" ${ink(1.8)}/>${screws(cx - 46, y + 8, 92, t.h - 14)}
        <g font-family="'Copperplate','Copperplate Gothic Bold','Times New Roman',serif" text-anchor="middle" fill="#2c3540">
        <text x="${cx}" y="${y + 18}" font-size="4.6" letter-spacing="1">MAURICE</text>
        <text x="${cx}" y="${y + 27.5}" font-size="8.5" font-weight="800">“Rocket”</text>
        <text x="${cx}" y="${y + 36.5}" font-size="8.5" font-weight="800">Richard</text></g>`;
    } else {
      const pw = (t.w - 10 - (t.cols - 1) * 4) / t.cols;
      for (let r = 0; r < t.rows; r++) for (let c = 0; c < t.cols; c++) {
        const px = x0 + 5 + c * (pw + 4), py = y + 10 + r * 30, w = winners[k++];
        base += `<rect x="${px}" y="${py}" width="${pw}" height="24" rx="1.5" fill="${B('pl')}" stroke="${w?.wsq ? '#912522' : INK}" stroke-width="${w?.wsq ? 1.8 : 1}"/>${screws(px, py, pw, 24)}`;
        if (w) {
          const parts = w.name.split(' '), first = parts[0], rest = parts.slice(1).join(' ');
          base += `<g font-family="'Copperplate','Copperplate Gothic Bold','Arial Narrow',sans-serif" text-anchor="middle" fill="#2c3540"><title>${svgText(w.name)}, ${svgText(w.teamName)}: ${w.value ?? '?'} goals (${svgText(w.seasonName)})</title>
            ${rest ? `<text x="${px + pw / 2}" y="${py + 8}" font-size="4.6" font-weight="800" textLength="${Math.min(pw - 5, first.length * 3.4)}" lengthAdjust="spacingAndGlyphs">${svgText(first.toUpperCase())}</text>
            <text x="${px + pw / 2}" y="${py + 14}" font-size="4.6" font-weight="800" textLength="${Math.min(pw - 5, rest.length * 3.4)}" lengthAdjust="spacingAndGlyphs">${svgText(rest.toUpperCase())}</text>`
              : `<text x="${px + pw / 2}" y="${py + 11.5}" font-size="4.6" font-weight="800">${svgText(first.toUpperCase())}</text>`}
            <text x="${px + pw / 2}" y="${py + 20.5}" font-size="4" letter-spacing=".2">${svgText(w.short)} · ${w.value ?? '?'} G</text></g>`;
        }
      }
    }
    y += t.h + 9;
  });
  // round black plinth with a silver band
  base += `<rect x="${cx - 152}" y="${y - 6}" width="304" height="6" rx="2" fill="${B('g')}" ${ink(2)}/>
    <path d="M${cx - 150} ${y} H${cx + 150} V${y + 12} Q${cx} ${y + 26} ${cx - 150} ${y + 12} Z" fill="${B('blk')}" ${ink(3)}/>
    <path d="M${cx - 140} ${y + 9} Q${cx} ${y + 21} ${cx + 140} ${y + 9}" stroke="#fff" stroke-width="1.2" opacity=".25" fill="none"/>`;
  const H = y + 34;

  return `<svg viewBox="0 0 ${W} ${H}" class="tc-svg rr-svg" role="img" aria-label="Maurice Rocket Richard Trophy">
  <defs>${chrome(id + 'g')}
    <linearGradient id="${id}br" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fbe3a6"/><stop offset=".3" stop-color="#e6b35a"/><stop offset=".65" stop-color="#b87d2c"/><stop offset="1" stop-color="#7a4c12"/></linearGradient>
    <linearGradient id="${id}brD" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b37a2c"/><stop offset="1" stop-color="#5a3a10"/></linearGradient>
    <linearGradient id="${id}wo" x1="0" y1="0" x2="1" y2=".6"><stop offset="0" stop-color="#9aa6b0"/><stop offset=".25" stop-color="#eef3f6"/><stop offset=".5" stop-color="#ffffff"/><stop offset=".75" stop-color="#b6c1c9"/><stop offset="1" stop-color="#7d8994"/></linearGradient>
    <linearGradient id="${id}wi" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4b5661"/><stop offset=".5" stop-color="#8996a1"/><stop offset="1" stop-color="#c3ccd3"/></linearGradient>
    <linearGradient id="${id}rim" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#e3e9ee"/><stop offset="1" stop-color="#9aa6b0"/></linearGradient>
    <linearGradient id="${id}blk" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#121519"/><stop offset=".35" stop-color="#2e333a"/><stop offset=".55" stop-color="#22262c"/><stop offset="1" stop-color="#101317"/></linearGradient>
    <linearGradient id="${id}sideL" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0c0e11"/><stop offset="1" stop-color="#1d2126"/></linearGradient>
    <linearGradient id="${id}sideR" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#08090b"/><stop offset="1" stop-color="#171a1e"/></linearGradient>
    <linearGradient id="${id}pl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#d2dae0"/><stop offset="1" stop-color="#97a3ad"/></linearGradient>
    <radialGradient id="${id}dish" cx=".5" cy=".35" r=".7"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#c9d2d9"/><stop offset="1" stop-color="#6f7c87"/></radialGradient>
    <clipPath id="${id}co"><path d="${outer}"/></clipPath><clipPath id="${id}ci"><path d="${inner}"/></clipPath></defs>
  <ellipse cx="${cx}" cy="${H - 5}" rx="162" ry="7" fill="#000" opacity=".3"/>
  ${base}
  <!-- cup halves (behind the skater) -->
  <g transform="translate(6 0) scale(1 1.065)">${half}</g>
  <g transform="translate(334 0) scale(-1 1.065)">${half}</g>
  <!-- the dish the skater stands on -->
  <path d="M${cx - 76} 204 V216 Q${cx} 232 ${cx + 76} 216 V204" fill="${B('g')}" ${ink(3)}/>
  <ellipse cx="${cx}" cy="204" rx="76" ry="13" fill="${B('dish')}" ${ink(3)}/>
  <ellipse cx="${cx}" cy="203" rx="62" ry="8" fill="#5b6772"/><ellipse cx="${cx}" cy="202" rx="62" ry="7" fill="none" stroke="#c7d0d7" stroke-width="1.2"/>
  ${Array.from({ length: 17 }, (_, i) => { const t = (i + .5) / 17 * Math.PI; return `<circle cx="${(cx - 74 * Math.cos(t)).toFixed(1)}" cy="${(217 + 9 * Math.sin(t)).toFixed(1)}" r="1.5" fill="#fff" stroke="${INK}" stroke-width=".6"/>`; }).join('')}
  <path d="M${cx - 6} 217 h12 v6 q-6 5 -12 0 z" fill="#fff" ${ink(1.2)}/><path d="M${cx} 219 l1 2 l2.2 .3 l-1.6 1.5 l.4 2.2 l-2 -1 l-2 1 l.4 -2.2 l-1.6 -1.5 l2.2 -.3 z" fill="#912522"/>
  <ellipse cx="${cx + 10}" cy="205" rx="40" ry="4" fill="#000" opacity=".25"/>
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
        ${ctx.artRoss.length ? `<button class="tc-item tc-mini" type="button" data-trophy="ross" aria-label="Art Ross Trophy: see the winners">
          <div class="tc-mini-ross">${artRoss(ctx.artRoss, false)}</div><div class="tc-card">Art Ross Trophy<br><b>Points leaders</b></div></button>` : '<div></div>'}
        <button class="tc-item tc-keg" id="tc-keg" type="button" aria-label="The Stanley Keg: read the engravings">
          ${kegSVG({ wins: ctx.wsqWins, stickers: ctx.stickers })}
          <div class="tc-card">The Stanley Keg<br><b>${ctx.champions.filter(c => c.team === 'WSQ').map(c => c.short).join(' · ') || 'Not yet…'}</b></div></button>
        ${ctx.rocket.length ? `<button class="tc-item tc-mini" type="button" data-trophy="rocket" aria-label="Rocket Richard Trophy: see the winners">
          <div class="tc-mini-rocket">${rocketSVG(ctx.rocket)}</div><div class="tc-card">"Rocket" Richard Trophy<br><b>Goal leaders</b></div></button>` : '<div></div>'}
      </div>
      <div class="tc-board"></div>
      ${pres ? `<div class="tc-shelf">${pres}</div><div class="tc-board"></div>` : ''}
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
      ${c.sticker ? `<span class="kv-slot kv-on-panel" style="--rot:${(i * 37) % 26 - 13}deg">${sticker(c.sticker)}</span>` : ''}
      <div class="kv-head"><div class="kv-team">${esc(c.teamName)} <span>${esc(c.name)}</span></div>
        ${c.captain ? `<div class="kv-capt">Captain: ${c.captain.href ? `<a href="${c.captain.href}">${esc(c.captain.text)}</a>` : esc(c.captain.text)}</div>` : ''}</div>
      <div class="kv-names">${c.names.length ? c.names.map(n => n.href ? `<a href="${n.href}">${esc(n.text)}</a>` : `<span>${esc(n.text)}</span>`).join('')
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
  const html = kind === 'ross' ? artRoss(winners, true) : rocketSVG(winners);
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
