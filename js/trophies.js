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
  const g = `url(#${id}gold)`, gd = `url(#${id}goldD)`;
  // two-pass strokes give the cartoon outline: dark wide stroke, then the coloured stroke
  const limb = (d, w, paint = g) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w + 5}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${paint}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const wing = 'M158 182 L78 118 L84 113 L62 86 L68 81 L46 52 L52 47 L32 16 L120 4 L166 174 Z';
  // ---- base: title tier, then winners tiers (4 then 5 plaques per row), filled left→right, top→bottom
  const n = winners.length, r2 = Math.max(1, Math.ceil(n / 9)), r3 = Math.max(1, Math.ceil(Math.max(0, n - 4 * r2) / 5));
  const tiers = [{ w: 112, h: 46, cols: 0, rows: 0 }, { w: 176, h: 16 + r2 * 30, cols: 4, rows: r2 }, { w: 224, h: 16 + r3 * 30, cols: 5, rows: r3 }];
  let y = 204, k = 0, base = '';
  tiers.forEach((t, ti) => {
    const x0 = cx - t.w / 2, side = 22;
    base += `<rect x="${x0 - side - 6}" y="${y - 6}" width="${t.w + 2 * side + 12}" height="7" rx="2" fill="url(#${id}g)" stroke="${INK}" stroke-width="2"/>`;   // silver trim
    base += `<path d="M${x0 - side} ${y + 4} L${x0} ${y} V${y + t.h} L${x0 - side} ${y + t.h + 3} Z" fill="#191c20" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>`;
    base += `<path d="M${x0 + t.w + side} ${y + 4} L${x0 + t.w} ${y} V${y + t.h} L${x0 + t.w + side} ${y + t.h + 3} Z" fill="#14171a" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/>`;
    base += `<rect x="${x0}" y="${y}" width="${t.w}" height="${t.h}" fill="url(#${id}blk)" stroke="${INK}" stroke-width="2.5"/>`;
    // decorative blank plaques on the receding side faces
    for (let r = 0; r < Math.max(1, t.rows || 1); r++) for (const sx of [x0 - side + 5, x0 + t.w + 4]) base += `<rect x="${sx}" y="${y + 8 + r * 30}" width="13" height="${t.rows ? 22 : t.h - 16}" rx="1.5" fill="url(#${id}pl)" opacity=".55" stroke="${INK}" stroke-width="1"/>`;
    if (ti === 0) {
      base += `<rect x="${cx - 46}" y="${y + 6}" width="92" height="${t.h - 12}" rx="2" fill="url(#${id}pl)" stroke="${INK}" stroke-width="1.8"/>
        <g font-family="'Copperplate','Copperplate Gothic Bold','Times New Roman',serif" text-anchor="middle" fill="#2c3540">
        <text x="${cx}" y="${y + 17}" font-size="5" letter-spacing=".8">TROPHY</text>
        <text x="${cx}" y="${y + 27}" font-size="8.5" font-weight="800">“Rocket”</text>
        <text x="${cx}" y="${y + 37}" font-size="8.5" font-weight="800">Richard</text></g>`;
    } else {
      const pw = (t.w - 10 - (t.cols - 1) * 4) / t.cols;
      for (let r = 0; r < t.rows; r++) for (let c = 0; c < t.cols; c++) {
        const px = x0 + 5 + c * (pw + 4), py = y + 8 + r * 30, w = winners[k++];
        base += `<rect x="${px}" y="${py}" width="${pw}" height="24" rx="1.5" fill="url(#${id}pl)" stroke="${w?.wsq ? '#912522' : INK}" stroke-width="${w?.wsq ? 1.8 : 1}"/>`;
        if (w) base += `<g font-family="'Copperplate','Copperplate Gothic Bold','Arial Narrow',sans-serif" text-anchor="middle" fill="#2c3540"><title>${svgText(w.name)}, ${svgText(w.teamName)}: ${w.value ?? '?'} goals (${svgText(w.seasonName)})</title>
          ${w.name.split(' ').length > 1 ? `<text x="${px + pw / 2}" y="${py + 7.5}" font-size="4.6" font-weight="800" textLength="${Math.min(pw - 4, w.name.split(' ')[0].length * 3.4)}" lengthAdjust="spacingAndGlyphs">${svgText(w.name.split(' ')[0].toUpperCase())}</text>
          <text x="${px + pw / 2}" y="${py + 13.5}" font-size="4.6" font-weight="800" textLength="${Math.min(pw - 4, w.name.split(' ').slice(1).join(' ').length * 3.4)}" lengthAdjust="spacingAndGlyphs">${svgText(w.name.split(' ').slice(1).join(' ').toUpperCase())}</text>`
            : `<text x="${px + pw / 2}" y="${py + 11}" font-size="4.6" font-weight="800">${svgText(w.name.toUpperCase())}</text>`}
          <text x="${px + pw / 2}" y="${py + 20.5}" font-size="4" letter-spacing=".2">${svgText(w.short)} · ${w.value ?? '?'} G</text></g>`;
      }
    }
    y += t.h + 8;
  });
  const H = y + 22;
  base += `<path d="M${cx - 150} ${y - 2} H${cx + 150} L${cx + 158} ${y + 12} H${cx - 158} Z" fill="#202429" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
    <rect x="${cx - 150}" y="${y - 6}" width="300" height="6" rx="2" fill="url(#${id}g)" stroke="${INK}" stroke-width="2"/>`;
  return `<svg viewBox="0 0 ${W} ${H}" class="tc-svg rr-svg" role="img" aria-label="Rocket Richard Trophy">
  <defs>${chrome(id + 'g')}
    <linearGradient id="${id}gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff3c4"/><stop offset=".3" stop-color="#ecc15e"/><stop offset=".65" stop-color="#c48d2e"/><stop offset="1" stop-color="#8a5c17"/></linearGradient>
    <linearGradient id="${id}goldD" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c48d2e"/><stop offset="1" stop-color="#6b440e"/></linearGradient>
    <linearGradient id="${id}wf" x1="0" y1="0" x2="1" y2=".45">
      <stop offset="0" stop-color="#f4f7fa"/><stop offset=".12" stop-color="#ffffff"/><stop offset=".2" stop-color="#aeb9c2"/><stop offset=".34" stop-color="#eef2f5"/>
      <stop offset=".46" stop-color="#7d8a95"/><stop offset=".58" stop-color="#dfe6eb"/><stop offset=".72" stop-color="#9aa6b0"/><stop offset=".86" stop-color="#ffffff"/><stop offset="1" stop-color="#8b97a1"/></linearGradient>
    <linearGradient id="${id}wi" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3f4a54"/><stop offset=".6" stop-color="#7d8994"/><stop offset="1" stop-color="#b9c3cb"/></linearGradient>
    <linearGradient id="${id}blk" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#15181c"/><stop offset=".45" stop-color="#2f343b"/><stop offset="1" stop-color="#15181c"/></linearGradient>
    <linearGradient id="${id}pl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#d2dae0"/><stop offset="1" stop-color="#97a3ad"/></linearGradient>
    <clipPath id="${id}clip"><path d="${wing}"/></clipPath></defs>
  <ellipse cx="${cx}" cy="${H - 6}" rx="160" ry="7" fill="#000" opacity=".3"/>
  ${base}
  <!-- the split cup: two stepped silver wings, each with its inner face and top edge showing -->
  <g transform="translate(20 0)">
    ${[0, 1].map(m => `<g ${m ? `transform="translate(300 0) scale(-1 1)"` : ''}>
      <path d="${wing}" fill="url(#${id}wf)" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <g clip-path="url(#${id}clip)" opacity=".55"><path d="M20 40 L150 10 L160 22 L30 54 Z M40 96 L160 70 L166 80 L46 108 Z" fill="#fff"/><path d="M30 70 L156 40 L160 46 L34 76 Z" fill="#6f7c88"/></g>
      <path d="M120 4 L166 174 L158 182 L112 12 Z" fill="url(#${id}wi)" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
      <path d="M32 16 L120 4 L116 10 L38 21 Z" fill="#ffffff" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M52 47 L46 52 M68 81 L62 86 M84 113 L78 118" stroke="#fff" stroke-width="2"/></g>`).join('')}
  </g>
  <!-- collar the skater stands on -->
  <path d="M${cx - 74} 186 V198 Q${cx} 214 ${cx + 74} 198 V186" fill="url(#${id}g)" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <ellipse cx="${cx}" cy="186" rx="74" ry="12" fill="url(#${id}g)" stroke="${INK}" stroke-width="3"/>
  <ellipse cx="${cx}" cy="186" rx="60" ry="7" fill="#56626d"/><ellipse cx="${cx}" cy="185" rx="60" ry="6" fill="none" stroke="#c7d0d7" stroke-width="1"/>
  ${Array.from({ length: 15 }, (_, i) => { const t = (i + .5) / 15 * Math.PI; return `<circle cx="${(cx - 72 * Math.cos(t)).toFixed(1)}" cy="${(199 + 8 * Math.sin(t)).toFixed(1)}" r="1.6" fill="#fff" stroke="${INK}" stroke-width=".6"/>`; }).join('')}
  <!-- the skater -->
  <g transform="translate(20 4)" stroke-linejoin="round" stroke-linecap="round">
    <!-- back leg, pushing off -->
    ${limb('M136 122 L120 140 L104 154', 15)}
    ${limb('M126 136 L117 146', 15, gd)}
    <path d="M112 146 l10 6 M108 150 l9 6" stroke="${INK}" stroke-width="2"/>
    <path d="M96 150 L112 152 L113 161 L93 163 Q88 158 96 150 Z" fill="${g}" stroke="${INK}" stroke-width="2.5"/>
    <path d="M88 168 L118 165" stroke="${INK}" stroke-width="4"/><path d="M88 168 L118 165" stroke="#eef3f6" stroke-width="1.6"/>
    <!-- front leg, bent -->
    ${limb('M162 122 L174 142 L166 160', 16)}
    ${limb('M172 140 L168 152', 16, gd)}
    <path d="M162 148 h12 M161 153 h12" stroke="${INK}" stroke-width="2"/>
    <path d="M158 156 L176 156 L179 168 L155 168 Z" fill="${g}" stroke="${INK}" stroke-width="2.5"/>
    <path d="M150 174 L184 174" stroke="${INK}" stroke-width="4"/><path d="M150 174 L184 174" stroke="#eef3f6" stroke-width="1.6"/>
    <!-- pants -->
    <path d="M132 100 Q150 94 170 102 L176 126 Q166 132 156 124 L150 114 L145 124 Q133 132 128 124 Z" fill="${gd}" stroke="${INK}" stroke-width="3"/>
    <path d="M136 104 Q140 116 134 126" fill="none" stroke="#e8bb5a" stroke-width="2" opacity=".8"/>
    <!-- jersey -->
    <path d="M126 54 Q150 40 176 56 L172 104 Q150 112 130 104 Z" fill="${g}" stroke="${INK}" stroke-width="3"/>
    <path d="M160 52 Q176 58 172 104 Q162 108 156 106 Q164 80 160 52 Z" fill="${gd}" opacity=".7"/>
    <path d="M130 92 Q150 100 173 92" fill="none" stroke="${INK}" stroke-width="7"/><path d="M130 92 Q150 100 173 92" fill="none" stroke="#9a6a1e" stroke-width="4"/>
    <path d="M131 99 Q150 106 172 99" fill="none" stroke="${INK}" stroke-width="1.5"/>
    <path d="M140 50 Q150 58 160 50" fill="none" stroke="${INK}" stroke-width="2"/>
    <path d="M132 60 Q138 56 146 57" fill="none" stroke="#fff6d6" stroke-width="3" opacity=".9"/>
    <!-- arms -->
    ${limb('M130 60 L112 82 L122 98', 13)}
    ${limb('M172 62 L184 88 L170 114', 13)}
    <path d="M114 88 l8 -3 M178 100 l8 3" stroke="${INK}" stroke-width="5"/><path d="M114 88 l8 -3 M178 100 l8 3" stroke="#9a6a1e" stroke-width="2.5"/>
    <!-- stick, then the gloves holding it -->
    <path d="M114 84 L200 170" stroke="${INK}" stroke-width="7"/><path d="M114 84 L200 170" stroke="${g}" stroke-width="3.5"/>
    <path d="M196 166 L222 172 L220 179 L194 173 Z" fill="${g}" stroke="${INK}" stroke-width="2.5"/>
    <rect x="116" y="92" width="14" height="12" rx="4" fill="${g}" stroke="${INK}" stroke-width="2.5" transform="rotate(40 123 98)"/>
    <rect x="162" y="110" width="14" height="12" rx="4" fill="${g}" stroke="${INK}" stroke-width="2.5" transform="rotate(40 169 116)"/>
    <!-- head -->
    <path d="M145 44 h10 v8 h-10 z" fill="${gd}" stroke="${INK}" stroke-width="2"/>
    <ellipse cx="150" cy="32" rx="11.5" ry="13" fill="${g}" stroke="${INK}" stroke-width="3"/>
    <path d="M154 22 Q163 28 160 40 Q156 44 152 44 Q158 34 154 22 Z" fill="${gd}" opacity=".6"/>
    <path d="M138.5 31 Q139 16 152 18 Q163 20 161.5 31 Q157 24 149 25 Q142 26 138.5 31 Z" fill="#7d5414" stroke="${INK}" stroke-width="2"/>
    <path d="M144 34 h4 M153 34 h4" stroke="${INK}" stroke-width="1.8"/><path d="M150 35 l-1 5 h2" fill="none" stroke="${INK}" stroke-width="1.2"/>
    <path d="M146 41 q4 2 8 0" fill="none" stroke="${INK}" stroke-width="1.4"/>
    <path d="M141 26 Q144 22 149 22" fill="none" stroke="#fff6d6" stroke-width="2"/></g>
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
