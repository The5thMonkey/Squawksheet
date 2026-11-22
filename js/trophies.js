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
  const pts = a => a.map(p => p.join(' ')).join(' L');

  // ---------------- the cup: two flat, flared chrome panels opened out like a V, the skater in the gap ----------------
  // drawn as the left panel; the right panel is its mirror image with different reflections
  const face = 'M18 30 L154 46 L166 198 L150 198 L118 139 L112 141 L90 112 L84 114 Z';            // front face, stepped outer edge
  const edge = 'M154 46 L162 41 L174 196 L166 198 Z';                                                // the panel's thickness, seen in the gap
  const lip = 'M18 30 L24 25 L162 41 L154 46 Z';                                                     // top edge
  const half = (refl, mir) => `<g${mir ? ` transform="translate(${W} 0) scale(-1 1)"` : ''}>
      <path d="${face}" fill="${B('cf')}" ${ink(2.6)}/>
      <g clip-path="url(#${id}cfc)">${refl.map(([a, b, c, o]) => `<path d="M${a} 20 L${b} 20 L168 260 Z" fill="${c}" opacity="${o}"/>`).join('')}
        <path d="M18 30 L154 46" stroke="#fff" stroke-width="5" opacity=".9"/><path d="M84 114 L90 112 L112 141 L118 139" stroke="#fff" stroke-width="3" fill="none"/></g>
      <path d="${edge}" fill="${B('ce')}" ${ink(2)}/>
      <path d="${lip}" fill="${B('rim')}" ${ink(1.8)}/>
    </g>`;
  const reflL = [[30, 44, '#ffffff', .9], [58, 74, '#56626e', .55], [80, 86, '#2f3842', .5], [100, 122, '#6b7783', .45], [126, 130, '#ffffff', .95], [138, 150, '#3b4550', .5]];
  const reflR = [[22, 30, '#3b4550', .45], [40, 62, '#ffffff', .85], [70, 92, '#4a5561', .6], [104, 108, '#ffffff', .9], [116, 140, '#7f8b96', .45], [146, 152, '#ffffff', .7]];

  // ---------------- the skater: bronze, facing out, knees bent, stick held across his body down to the dish ----------------
  const fill = (d, f = B('br'), w = 2) => `<path d="${d}" fill="${f}" ${ink(w)}/>`;
  const shade = (d, o = .75) => `<path d="${d}" fill="${B('brD')}" opacity="${o}"/>`;
  const shine = (d, w = 1.8, o = .8) => `<path d="${d}" fill="none" stroke="#fff4d2" stroke-width="${w}" stroke-linecap="round" opacity="${o}"/>`;
  const line = (d, w = 1.3, c = '#5a3a10') => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" opacity=".85"/>`;
  const legL = 'M145 146 C140 156 133 164 133 173 C133 182 137 188 139 193 L154 193 C154 186 152 179 152 173 C153 163 158 155 161 148 Z';
  const legR = 'M195 146 C200 156 207 164 207 173 C207 182 203 188 201 193 L186 193 C186 186 188 179 188 173 C187 163 182 155 179 148 Z';
  const skater = `<g>
    <!-- legs: knees bent and turned out -->
    ${fill(legL)}${fill(legR)}
    ${shade('M152 173 C152 179 154 186 154 193 L148 193 C148 186 146 180 146 173 C147 165 151 157 155 151 L161 148 C158 155 153 163 152 173 Z')}
    ${shade('M207 173 C207 182 203 188 201 193 L195 193 C197 187 201 181 201 173 C201 165 196 157 192 150 L195 146 C200 156 207 164 207 173 Z')}
    ${line('M134 176 C140 178 147 178 152.5 176 M135 181 C141 183 147 183 153 181')}${line('M188 176 C193 178 200 178 206 176 M187.5 181 C193 183 199 183 205.5 181')}
    ${shine('M139 168 C139 160 143 155 147 151')}
    <!-- skates, toes toward us -->
    ${fill('M137 189 C135 196 138 201 146.5 201 C155 201 157 196 155 189 Z', B('brD'), 1.8)}
    ${fill('M185 189 C183 196 186 201 194 201 C202.5 201 205 196 203 189 Z', B('brD'), 1.8)}
    <path d="M140 204.5 L153 204.5 M187 204.5 L200 204.5" stroke="${INK}" stroke-width="4" stroke-linecap="round"/><path d="M140 204.5 L153 204.5 M187 204.5 L200 204.5" stroke="#eef2f5" stroke-width="1.5" stroke-linecap="round"/>
    <!-- breezers -->
    ${fill('M148 121 C162 125 178 125 192 121 C198 131 200 141 198 150 C190 154 182 152 178 146 C174 143 166 143 162 146 C158 152 150 154 142 150 C140 141 142 131 148 121 Z', B('brD'))}
    ${line('M146 130 C162 133 178 133 194 130')}${line('M170 133 L170 143')}
    ${shine('M146 138 C147 132 150 128 156 127', 1.6, .55)}
    <!-- jersey -->
    ${fill('M146 80 C152 73 161 71 170 71 C179 71 188 73 194 80 C200 87 200 97 196 108 L193 123 C178 127 162 127 147 123 L144 108 C140 97 140 87 146 80 Z')}
    ${shade('M186 74 C192 76 196 80 198 88 C199 97 197 104 195 110 L193 123 C188 124 184 125 181 125 C188 108 190 88 186 74 Z')}
    <path d="M145.5 110 C162 114 178 114 195 110 L194.3 116 C178 120 162 120 146.3 116 Z" fill="#6e4410" ${ink(1.2)}/>
    <path d="M162 72 C165 78 175 78 178 72" fill="none" stroke="${INK}" stroke-width="1.6"/>
    ${line('M158 86 C162 94 162 102 160 108')}${line('M182 86 C178 94 178 102 180 108')}
    ${shine('M150 82 C155 76 161 74 166 74', 2.4)}
    <!-- arms -->
    ${fill('M150 79 C138 81 130 92 129 105 L140 109 C141 99 145 93 152 89 Z')}
    ${fill('M129 103 C130 112 136 117 145 118 L149 109 C143 109 140 106 140 102 Z')}
    ${line('M132 92 L143 97 M130.5 97 L141.5 101.5', 1.8, '#6e4410')}
    ${fill('M190 79 C202 81 210 93 210 107 L200 111 C198 101 194 94 188 89 Z')}
    ${shade('M198 82 C205 88 209 96 210 107 L205 109 C204 99 201 91 196 86 Z')}
    ${fill('M210 105 C210 121 201 138 193 148 L183 142 C190 131 198 120 200 109 Z')}
    ${line('M198 92 L208 97 M196.5 96.5 L207.5 101', 1.8, '#6e4410')}
    <ellipse cx="135" cy="106" rx="6" ry="4.6" fill="${B('brD')}" ${ink(1.4)}/><ellipse cx="205" cy="109" rx="6" ry="4.6" fill="${B('brD')}" ${ink(1.4)}/>
    <!-- the stick: top hand at his left hip, bottom hand low on his right, blade flat on the dish -->
    <path d="M141 103 L226 189" stroke="${INK}" stroke-width="6.5" stroke-linecap="round"/><path d="M141 103 L226 189" stroke="${B('br')}" stroke-width="3.2" stroke-linecap="round"/>
    <path d="M214 177 L221 184" stroke="#3b2507" stroke-width="3.6"/>
    ${fill('M224 186 C232 194 244 197 256 196 C259 200 256 203 251 203 C238 204 228 200 220 192 Z', B('br'), 1.8)}
    <!-- gloves -->
    <ellipse cx="147" cy="111" rx="7.5" ry="6.5" fill="${B('brD')}" ${ink(1.8)}/>${line('M142 108 L151 107 M141.5 112 L151.5 111')}
    <ellipse cx="188" cy="147" rx="7.5" ry="6.5" fill="${B('brD')}" ${ink(1.8)}/>${line('M183 144 L192 143 M182.5 148 L192.5 147')}
    <!-- head, looking straight out -->
    ${fill('M165 64 L175 64 L176 73 L164 73 Z', B('brD'), 1.6)}
    <ellipse cx="160" cy="57.5" rx="2.4" ry="3.6" fill="${B('br')}" ${ink(1.3)}/><ellipse cx="180" cy="57.5" rx="2.4" ry="3.6" fill="${B('br')}" ${ink(1.3)}/>
    ${fill('M160.5 55 C160.5 45 164.5 41 170 41 C175.5 41 179.5 45 179.5 55 C179.5 63 175.5 69 170 69 C164.5 69 160.5 63 160.5 55 Z')}
    ${shade('M174 42.5 C178 45 179.5 49 179.5 55 C179.5 63 175.5 69 170 69 C175 63 176.5 52 174 42.5 Z', .6)}
    <path d="M159.5 53 C158.5 42 163 37 170 37 C177 37 181.5 42 180.5 53 C178.5 46 175 44 170 44.5 C165 44 161.5 46 159.5 53 Z" fill="#5a3a10" ${ink(1.5)}/>
    ${line('M164 40.5 C168 39 173 39 176.5 41')}
    <path d="M164 52.2 C165.5 51 167 51 168 52 M172 52 C173 51 174.5 51 176 52.2" stroke="${INK}" stroke-width="1.3" fill="none" stroke-linecap="round"/>
    <circle cx="166" cy="55" r="1.1" fill="${INK}"/><circle cx="174" cy="55" r="1.1" fill="${INK}"/>
    <path d="M170 56 L169 60.5 C169.5 61.3 170.5 61.3 171 60.5" stroke="#5a3a10" stroke-width="1.1" fill="none" stroke-linecap="round"/>
    <path d="M166.5 64 C168.5 65.2 171.5 65.2 173.5 64" stroke="${INK}" stroke-width="1.3" fill="none" stroke-linecap="round"/>
    ${shine('M163 49 C164 45 166.5 43.5 169 43.5', 1.5)}
  </g>`;

  // ---------------- base: a tapered, eight-sided black column in three tiers with silver plaques ----------------
  // faces seen from the front: far edge, diagonal, front, diagonal, far edge. Winners fill left→right, top→bottom.
  const n = winners.length, r2 = Math.max(1, Math.ceil(n / 9)), r3 = Math.max(1, Math.ceil(Math.max(0, n - 4 * r2) / 5));
  const FR = [.07, .2, .46, .2, .07];
  const tiers = [{ wt: 104, wb: 112, h: 52, cols: 0, rows: 1 }, { wt: 150, wb: 166, h: 16 + r2 * 30, cols: 2, rows: r2 }, { wt: 196, wb: 220, h: 16 + r3 * 30, cols: 3, rows: r3 }];
  let y = 220, k = 0, base = '';
  const screws = (x, yy, w, h) => [[x + 2.2, yy + 2.2], [x + w - 2.2, yy + 2.2], [x + 2.2, yy + h - 2.2], [x + w - 2.2, yy + h - 2.2]].map(([a, b]) => `<circle cx="${a}" cy="${b}" r=".9" fill="#6b7681"/>`).join('');
  const label = (w, px, py, pw, dim) => {
    const parts = w.name.split(' '), first = parts[0], rest = parts.slice(1).join(' '), mx = px + pw / 2;
    const t = (s, yy) => `<text x="${mx}" y="${yy}" font-size="4.6" font-weight="800" textLength="${Math.min(pw - 4, s.length * 3.4)}" lengthAdjust="spacingAndGlyphs">${svgText(s.toUpperCase())}</text>`;
    return `<g font-family="'Copperplate','Copperplate Gothic Bold','Arial Narrow',sans-serif" text-anchor="middle" fill="${dim ? '#384350' : '#2c3540'}"><title>${svgText(w.name)}, ${svgText(w.teamName)}: ${w.value ?? '?'} goals (${svgText(w.seasonName)})</title>
      ${rest ? t(first, py + 8) + t(rest, py + 14) : t(first, py + 11.5)}
      <text x="${mx}" y="${py + 20.5}" font-size="4" textLength="${Math.min(pw - 4, (w.short.length + 6) * 2.3)}" lengthAdjust="spacingAndGlyphs">${svgText(w.short)} · ${w.value ?? '?'} G</text></g>`;
  };
  tiers.forEach((t, ti) => {
    const yb = y + t.h, xAt = (wid, f) => cx - wid / 2 + wid * f;
    const cum = [0]; FR.forEach(f => cum.push(cum[cum.length - 1] + f));
    // ledge: the top of this tier, with a silver trim on its front edge
    base += `<path d="M${cx - t.wt / 2 - 10} ${y - 1} L${cx - t.wt / 2 + 6} ${y - 8} H${cx + t.wt / 2 - 6} L${cx + t.wt / 2 + 10} ${y - 1} Z" fill="#2a2f36" ${ink(1.8)}/>`;
    base += `<rect x="${cx - t.wt / 2 - 11}" y="${y - 2}" width="${t.wt + 22}" height="5" rx="1.5" fill="${B('g')}" ${ink(1.8)}/>`;
    const fills = ['#08090b', B('sideL'), B('blk'), B('sideR'), '#060708'];
    FR.forEach((f, i) => {
      const q = [[xAt(t.wt, cum[i]), y + 3], [xAt(t.wt, cum[i + 1]), y + 3], [xAt(t.wb, cum[i + 1]), yb], [xAt(t.wb, cum[i]), yb]];
      base += `<path d="M${pts(q)} Z" fill="${fills[i]}" ${ink(2.2)}/>`;
    });
    base += `<path d="M${xAt(t.wt, .3)} ${y + 4} L${xAt(t.wb, .3)} ${yb - 1}" stroke="#fff" stroke-width="5" opacity=".07"/><path d="M${xAt(t.wt, .36)} ${y + 4} L${xAt(t.wb, .36)} ${yb - 1}" stroke="#fff" stroke-width="1.2" opacity=".12"/>`;
    // a face's left/right edge at height yy, inset by m
    const span = (i, yy, m) => { const s = (yy - y) / t.h, w = t.wt + (t.wb - t.wt) * s; return [xAt(w, cum[i]) + m, xAt(w, cum[i + 1]) - m]; };
    for (let r = 0; r < t.rows; r++) {
      const py = ti === 0 ? y + 9 : y + 10 + r * 30, ph = ti === 0 ? t.h - 16 : 24;
      // diagonal faces: plaques drawn on the slant, as perspective trapezoids
      const side = (i, w) => {
        const [a, b] = span(i, py, 3.5), [c, d] = span(i, py + ph, 3.5), sk = i === 1 ? 1 : -1;
        const q = [[a, py + (sk > 0 ? 1.5 : 0)], [b, py + (sk > 0 ? 0 : 1.5)], [d, py + ph - (sk > 0 ? 0 : 1.5)], [c, py + ph - (sk > 0 ? 1.5 : 0)]];
        let s = `<path d="M${pts(q)} Z" fill="${B('pl2')}" stroke="${w?.wsq ? '#912522' : INK}" stroke-width="${w?.wsq ? 1.6 : .9}"/>`;
        const [m1, m2] = span(i, py + ph / 2, 5);
        if (w) s += label(w, m1, py, m2 - m1, true);
        return s;
      };
      if (ti === 0) {
        base += side(1) + side(3);
        const [a, b] = span(2, py, 4), pw = b - a;
        base += `<rect x="${a}" y="${py}" width="${pw}" height="${ph}" rx="1.5" fill="${B('pl')}" ${ink(1.6)}/>${screws(a, py, pw, ph)}
          <g font-family="'Copperplate','Copperplate Gothic Bold','Times New Roman',serif" text-anchor="middle" fill="#2c3540">
          <text x="${cx}" y="${py + 8}" font-size="4.2" letter-spacing=".8">TROPHÉE</text>
          <text x="${cx}" y="${py + 15.5}" font-size="6.6" font-weight="800">Maurice</text>
          <text x="${cx}" y="${py + 22.5}" font-size="5.4" font-weight="800">“Rocket”</text>
          <text x="${cx}" y="${py + 29.5}" font-size="6.6" font-weight="800">Richard</text>
          <text x="${cx}" y="${py + 34.5}" font-size="3.4" letter-spacing=".8">TROPHY</text></g>`;
        continue;
      }
      base += side(1, winners[k++]);
      const [a, b] = span(2, py + 12, 4), pw = (b - a - (t.cols - 1) * 3) / t.cols;
      for (let c = 0; c < t.cols; c++) {
        const px = a + c * (pw + 3), w = winners[k++];
        base += `<rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="1.5" fill="${B('pl')}" stroke="${w?.wsq ? '#912522' : INK}" stroke-width="${w?.wsq ? 1.8 : 1}"/>${screws(px, py, pw, ph)}`;
        if (w) base += label(w, px, py, pw);
      }
      base += side(3, winners[k++]);
    }
    y = yb + 9;
  });
  // round black plinth with a silver band
  base += `<rect x="${cx - 128}" y="${y - 8}" width="256" height="6" rx="2" fill="${B('g')}" ${ink(2)}/>
    <path d="M${cx - 126} ${y - 2} H${cx + 126} V${y + 12} Q${cx} ${y + 28} ${cx - 126} ${y + 12} Z" fill="${B('blk')}" ${ink(2.6)}/>
    <path d="M${cx - 118} ${y + 8} Q${cx} ${y + 22} ${cx + 118} ${y + 8}" stroke="#fff" stroke-width="1.2" opacity=".25" fill="none"/>`;
  const H = y + 34;

  return `<svg viewBox="0 0 ${W} ${H}" class="tc-svg rr-svg" role="img" aria-label="Maurice Rocket Richard Trophy">
  <defs>${chrome(id + 'g')}
    <linearGradient id="${id}br" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fbe3a6"/><stop offset=".3" stop-color="#e6b35a"/><stop offset=".65" stop-color="#b87d2c"/><stop offset="1" stop-color="#7a4c12"/></linearGradient>
    <linearGradient id="${id}brD" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b37a2c"/><stop offset="1" stop-color="#5a3a10"/></linearGradient>
    <linearGradient id="${id}cf" gradientUnits="userSpaceOnUse" x1="18" y1="40" x2="166" y2="120"><stop offset="0" stop-color="#cfd7de"/><stop offset=".2" stop-color="#f7f9fb"/><stop offset=".45" stop-color="#aab5be"/><stop offset=".7" stop-color="#e9eef2"/><stop offset="1" stop-color="#7d8994"/></linearGradient>
    <linearGradient id="${id}ce" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9eef2"/><stop offset=".5" stop-color="#7f8b96"/><stop offset="1" stop-color="#3b4550"/></linearGradient>
    <linearGradient id="${id}rim" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#e3e9ee"/><stop offset="1" stop-color="#9aa6b0"/></linearGradient>
    <linearGradient id="${id}blk" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#15181c"/><stop offset=".35" stop-color="#30353c"/><stop offset=".6" stop-color="#22262c"/><stop offset="1" stop-color="#121519"/></linearGradient>
    <linearGradient id="${id}sideL" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0c0e11"/><stop offset="1" stop-color="#22262c"/></linearGradient>
    <linearGradient id="${id}sideR" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#08090b"/><stop offset="1" stop-color="#1b1e23"/></linearGradient>
    <linearGradient id="${id}pl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#d2dae0"/><stop offset="1" stop-color="#97a3ad"/></linearGradient>
    <linearGradient id="${id}pl2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c9d2d9"/><stop offset=".6" stop-color="#a3afb9"/><stop offset="1" stop-color="#7c8893"/></linearGradient>
    <radialGradient id="${id}dish" cx=".5" cy=".35" r=".7"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#c9d2d9"/><stop offset="1" stop-color="#6f7c87"/></radialGradient>
    <clipPath id="${id}cfc"><path d="${face}"/></clipPath></defs>
  <ellipse cx="${cx}" cy="${H - 5}" rx="140" ry="7" fill="#000" opacity=".3"/>
  ${base}
  <!-- cup panels (behind the skater) -->
  ${half(reflL)}${half(reflR, true)}
  <!-- the round silver collar the skater stands on -->
  <path d="M${cx - 64} 202 V212 Q${cx} 226 ${cx + 64} 212 V202" fill="${B('g')}" ${ink(2.6)}/>
  <ellipse cx="${cx}" cy="202" rx="64" ry="10" fill="${B('dish')}" ${ink(2.6)}/>
  <ellipse cx="${cx}" cy="201" rx="52" ry="6" fill="#5b6772"/><ellipse cx="${cx}" cy="200.5" rx="52" ry="5.5" fill="none" stroke="#c7d0d7" stroke-width="1.1"/>
  <path d="M${cx - 60} 214 Q${cx} 226 ${cx + 60} 214" stroke="#fff" stroke-width="1.4" opacity=".6" fill="none"/>
  <ellipse cx="${cx + 4}" cy="203" rx="40" ry="3.5" fill="#000" opacity=".25"/>
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
        ${ctx.artRoss.length ? `<button class="tc-item tc-mini" type="button" data-trophy="ross" aria-label="Art Ross Trophy: see the winners">
          <div class="tc-mini-ross">${artRoss(ctx.artRoss, false)}</div><div class="tc-card">Art Ross Trophy<br><b>Points leaders</b></div></button>` : '<div></div>'}
        <button class="tc-item tc-keg" id="tc-keg" type="button" aria-label="The Stanley Keg: read the engravings">
          ${kegSVG({ wins: ctx.wsqWins, stickers: ctx.stickers })}
          <div class="tc-card">The Stanley Keg<br><b>${ctx.champions.filter(c => c.team === 'WSQ').map(c => c.short).join(' · ') || 'Not yet…'}</b></div></button>
        ${ctx.rocket.length ? `<button class="tc-item tc-mini" type="button" data-trophy="rocket" aria-label="Rocket Richard Trophy: see the winners">
          <div class="tc-mini-rocket">${rocketSVG(ctx.rocket)}</div><div class="tc-card">"Rocket" Richard Trophy<br><b>Goal leaders</b></div></button>` : '<div></div>'}
      </div>
      <div class="tc-board"></div>
      <div class="tc-shelf tc-level2">${pres}${ctx.cups.length ? `<button class="tc-item tc-pucks" type="button" data-trophy="pucks" aria-label="Squawk Cup winners: look at the pucks">${puckPileSVG(ctx.cups, true)}<div class="tc-card">Squawk 🏆 winners<br><b>${ctx.cups.length} season${ctx.cups.length === 1 ? '' : 's'}</b></div></button>` : ''}</div>
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
