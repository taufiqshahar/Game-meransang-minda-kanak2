// Kitar Hidup: sains awal (kitar hidup haiwan dan tumbuhan). Peringkat disusun dalam BULATAN, bukan garis,
// supaya anak nampak kitar bermula semula (rama-rama bertelur lagi). Anak teka "Lepas ni jadi apa?" satu langkah demi satu langkah.
// Tahap 1–2: pengganggu dari kitar lain (berudu dalam kitar rama-rama) · Tahap 3: pengganggu dari kitar yang sama (perlu tahu turutan)
// · Tahap 4: mula di tengah kitar (cth. kepompong) dan perlu "pusing" kembali ke telur.
import { bendaIcon } from '../../kit/benda.js';
import { pick, shuffle, pct, meter } from '../../kit/util.js';

const svg = (inner) => `<svg viewBox="0 0 60 60" aria-hidden="true">${inner}</svg>`;
const soil = `<path d="M4 50 Q30 40 56 50 V58 H4 Z" fill="#9A6A3E" stroke="#5E3C1E" stroke-width="2.2" stroke-linejoin="round"/><g fill="#7A5230"><circle cx="16" cy="53" r="1.3"/><circle cx="40" cy="54" r="1.3"/><circle cx="28" cy="55" r="1"/></g>`;
const leaf = (fill = '#7CC95E') => `<path d="M6 46 Q8 14 52 10 Q54 42 14 50 Z" fill="${fill}" stroke="#2C6E1E" stroke-width="2.5" stroke-linejoin="round"/><path d="M8 48 Q28 30 50 12" stroke="#2C6E1E" stroke-width="1.6" fill="none" opacity=".7"/>`;
const water = `<ellipse cx="30" cy="36" rx="27" ry="19" fill="#BFE6F5" stroke="#6FB3D2" stroke-width="2"/>`;
const eye = (x, y, r = 2.2) => `<circle cx="${x}" cy="${y}" r="${r + 1.2}" fill="#fff"/><circle cx="${x + .4}" cy="${y + .3}" r="${r}" fill="#2B2F36"/>`;

const ART = {
  'telur-rama': leaf() + `<g fill="#FFF6D6" stroke="#B9A35A" stroke-width="1.6">${[[22, 30], [30, 25], [29, 34], [37, 29], [21, 38]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.2"/>`).join('')}</g>`,
  ulat: leaf('#9AD77E') + `<g fill="#8BD45A" stroke="#3D7A1E" stroke-width="2">${[12, 18, 24, 30, 36].map((x, i) => `<circle cx="${x}" cy="${36 - (i % 2) * 3}" r="5.4"/>`).join('')}</g>
    <g fill="#F5C531">${[12, 24, 36].map((x) => `<circle cx="${x}" cy="35" r="1.6"/>`).join('')}</g>
    <circle cx="43" cy="30" r="6.8" fill="#9BE06A" stroke="#3D7A1E" stroke-width="2"/>${eye(45, 28, 1.6)}<path d="M41 24 Q39 17 36 16 M46 24 Q48 17 51 16" stroke="#3D7A1E" stroke-width="1.8" fill="none" stroke-linecap="round"/>`,
  kepompong: `<path d="M4 9 H56" stroke="#7A4B25" stroke-width="4.5" stroke-linecap="round"/><path d="M30 10 V15" stroke="#5B7A1E" stroke-width="2.4"/>
    <path d="M30 14 Q43 22 41 37 Q39 51 30 55 Q21 51 19 37 Q17 22 30 14 Z" fill="#A6C85A" stroke="#5B7A1E" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M24 26 Q30 30 36 26 M22 36 Q30 40 38 36 M24 46 Q30 49 36 46" stroke="#5B7A1E" stroke-width="1.6" fill="none" opacity=".7"/><g fill="#F5C531"><circle cx="26" cy="31" r="1.3"/><circle cx="34" cy="31" r="1.3"/></g>`,
  rama: `<path d="M30 30 Q16 4 6 14 Q0 30 30 32 Z" fill="#F5A623" stroke="#8A4B0A" stroke-width="2.2" stroke-linejoin="round"/><path d="M30 30 Q44 4 54 14 Q60 30 30 32 Z" fill="#F5A623" stroke="#8A4B0A" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M30 33 Q12 34 12 46 Q20 56 30 37 Z" fill="#E5484D" stroke="#8E1F22" stroke-width="2.2" stroke-linejoin="round"/><path d="M30 33 Q48 34 48 46 Q40 56 30 37 Z" fill="#E5484D" stroke="#8E1F22" stroke-width="2.2" stroke-linejoin="round"/>
    <g fill="#FFFDF5"><circle cx="14" cy="18" r="3"/><circle cx="46" cy="18" r="3"/><circle cx="19" cy="44" r="2.2"/><circle cx="41" cy="44" r="2.2"/></g>
    <ellipse cx="30" cy="35" rx="2.8" ry="12" fill="#2B2F36"/><circle cx="30" cy="22" r="3.2" fill="#2B2F36"/><path d="M29 20 Q25 12 22 11 M31 20 Q35 12 38 11" stroke="#2B2F36" stroke-width="1.6" fill="none" stroke-linecap="round"/>`,
  'telur-katak': water + `<g>${[[18, 30], [26, 26], [34, 27], [42, 31], [22, 38], [30, 35], [38, 39], [28, 44], [16, 41], [44, 41]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#EAF7FC" stroke="#7FB8CC" stroke-width="1.3" opacity=".95"/><circle cx="${x}" cy="${y}" r="1.8" fill="#2B2F36"/>`).join('')}</g>`,
  berudu: water + `<path d="M28 34 Q38 26 44 33 Q50 40 57 32" stroke="#4E4A36" stroke-width="4.5" fill="none" stroke-linecap="round"/><ellipse cx="21" cy="34" rx="10" ry="8" fill="#4E4A36"/>${eye(17, 31, 1.6)}`,
  'katak-kecil': water + `<path d="M36 40 Q48 42 56 34" stroke="#4E8A33" stroke-width="4" fill="none" stroke-linecap="round"/>
    <ellipse cx="28" cy="38" rx="12" ry="9" fill="#6CC04E" stroke="#2C6E1E" stroke-width="2.2"/><path d="M18 44 l-6 5 M36 45 l4 6 M20 32 l-7 -3" stroke="#2C6E1E" stroke-width="2.6" stroke-linecap="round"/>
    <circle cx="22" cy="29" r="4.2" fill="#6CC04E" stroke="#2C6E1E" stroke-width="2"/><circle cx="32" cy="29" r="4.2" fill="#6CC04E" stroke="#2C6E1E" stroke-width="2"/>${eye(22, 29, 1.5)}${eye(32, 29, 1.5)}`,
  'telur-ayam': `<path d="M6 42 Q30 60 54 42 Q54 52 30 56 Q6 52 6 42 Z" fill="#C99456" stroke="#8A5A1E" stroke-width="2.4" stroke-linejoin="round"/>
    <g stroke="#E2B57A" stroke-width="1.6" fill="none">${[10, 18, 26, 34, 42, 50].map((x) => `<path d="M${x - 4} ${44 + (x % 3)} q4 -3 8 0"/>`).join('')}</g>
    <ellipse cx="24" cy="34" rx="9" ry="12" fill="#F1D3AE" stroke="#A9773E" stroke-width="2.2"/><ellipse cx="38" cy="36" rx="8.5" ry="11" fill="#FFF6E8" stroke="#A9773E" stroke-width="2.2"/><ellipse cx="21" cy="29" rx="2.4" ry="3.6" fill="#fff" opacity=".6"/>`,
  'anak-ayam': `<ellipse cx="30" cy="54" rx="16" ry="3" fill="#000" opacity=".15"/><path d="M24 50 v5 M34 50 v5" stroke="#F28A2C" stroke-width="2.6" stroke-linecap="round"/>
    <ellipse cx="30" cy="40" rx="16" ry="13" fill="#F7D23E" stroke="#A07A0A" stroke-width="2.5"/><circle cx="30" cy="22" r="11" fill="#F7D23E" stroke="#A07A0A" stroke-width="2.5"/>
    <path d="M36 40 Q42 36 44 42" stroke="#D9A514" stroke-width="2.4" fill="none" stroke-linecap="round"/>${eye(26, 20, 1.8)}${eye(35, 20, 1.8)}<path d="M28 25 L31 29 L34 25 Z" fill="#F28A2C" stroke="#A3511A" stroke-width="1.4" stroke-linejoin="round"/>
    <path d="M28 11 q2 -5 4 0" stroke="#A07A0A" stroke-width="2" fill="none"/>`,
  ayam: `<ellipse cx="30" cy="55" rx="18" ry="3" fill="#000" opacity=".15"/><path d="M26 47 v8 M34 47 v8 M23 55 h6 M31 55 h6" stroke="#F28A2C" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M44 34 Q56 16 50 10 Q54 26 44 28 Z" fill="#2F6E3A" stroke="#1D4724" stroke-width="2" stroke-linejoin="round"/><path d="M46 36 Q60 26 56 18 Q56 32 44 32 Z" fill="#C0392B" stroke="#7A1F14" stroke-width="2" stroke-linejoin="round"/>
    <ellipse cx="32" cy="38" rx="17" ry="12" fill="#C8662E" stroke="#7A3A12" stroke-width="2.5"/><path d="M24 36 Q32 44 42 36" stroke="#9A4A1E" stroke-width="2" fill="none"/>
    <path d="M14 34 Q10 20 18 14 Q26 12 26 22 L24 34 Z" fill="#C8662E" stroke="#7A3A12" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M14 14 q2 -6 4 -2 q2 -6 4 0 q3 -5 4 2 Z" fill="#E5484D" stroke="#8E1F22" stroke-width="1.6" stroke-linejoin="round"/>${eye(19, 19, 1.6)}
    <path d="M12 20 L6 22 L12 24 Z" fill="#F5B82E" stroke="#A07A0A" stroke-width="1.4" stroke-linejoin="round"/><path d="M13 25 q-1 5 2 6 q2 -3 0 -6 Z" fill="#E5484D"/>`,
  biji: soil + `<ellipse cx="30" cy="44" rx="10" ry="6.5" fill="#8A5A2E" stroke="#4E2E12" stroke-width="2.2" transform="rotate(-18 30 44)"/><path d="M24 44 Q30 40 36 42" stroke="#C99456" stroke-width="1.8" fill="none" stroke-linecap="round"/>`,
  tunas: soil + `<path d="M30 50 Q29 40 30 32" stroke="#3E8A2A" stroke-width="3.4" fill="none" stroke-linecap="round"/>
    <path d="M30 34 Q20 24 12 30 Q20 40 30 34 Z" fill="#7CC95E" stroke="#2C6E1E" stroke-width="2.2" stroke-linejoin="round"/><path d="M30 34 Q40 24 48 30 Q40 40 30 34 Z" fill="#7CC95E" stroke="#2C6E1E" stroke-width="2.2" stroke-linejoin="round"/>`,
  'anak-pokok': soil + `<path d="M30 50 V12" stroke="#7A4B25" stroke-width="3.6" stroke-linecap="round"/>
    ${[[14, -1], [24, 1], [34, -1], [44, 1]].map(([y, d]) => `<path d="M30 ${y + 4} Q${30 + d * 14} ${y - 6} ${30 + d * 20} ${y + 2} Q${30 + d * 12} ${y + 10} 30 ${y + 4} Z" fill="#6CC04E" stroke="#2C6E1E" stroke-width="2" stroke-linejoin="round"/>`).join('')}
    <path d="M30 13 Q24 4 30 2 Q36 4 30 13 Z" fill="#8BD45A" stroke="#2C6E1E" stroke-width="2"/>`,
  pokok: `<path d="M4 54 H56" stroke="#5E3C1E" stroke-width="3" stroke-linecap="round"/><path d="M26 54 Q28 40 26 30 H34 Q32 40 34 54 Z" fill="#8A5A2E" stroke="#4E2E12" stroke-width="2.4" stroke-linejoin="round"/>
    <g fill="#4FAE3E" stroke="#22681A" stroke-width="2.4">${[[30, 16, 13], [16, 24, 10], [44, 24, 10], [22, 32, 9], [38, 32, 9]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('')}</g>
    <path d="M18 22 Q30 30 42 22" stroke="#4FAE3E" stroke-width="8" fill="none"/>
    <g fill="#E0353E" stroke="#9E1F24" stroke-width="1.4">${[[20, 20], [34, 12], [42, 28], [26, 32], [14, 30], [36, 24]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.2"/>`).join('')}</g>`,
};

const CYCLES = {
  rama: { stages: ['telur-rama', 'ulat', 'kepompong', 'rama'], name: 'Rama-rama' },
  katak: { stages: ['telur-katak', 'berudu', 'katak-kecil', 'katak'], name: 'Katak' },
  ayam: { stages: ['telur-ayam', 'anak-ayam', 'ayam'], name: 'Ayam' },
  pokok: { stages: ['biji', 'tunas', 'anak-pokok', 'pokok'], name: 'Pokok' },
};
const CYCLE_IDS = Object.keys(CYCLES);
const CYCLE_OF = Object.fromEntries(CYCLE_IDS.flatMap((c) => CYCLES[c].stages.map((s) => [s, c])));
// Kunci suara bagi setiap peringkat (telur rama-rama dan telur ayam berkongsi satu rakaman).
const VOICE = { 'telur-rama': 's-telur', 'telur-ayam': 's-telur', ulat: 's-ulat', kepompong: 's-kepompong', rama: 's-rama', 'telur-katak': 's-telurkatak', berudu: 's-berudu', 'katak-kecil': 's-katakkecil', katak: 's-katak', 'anak-ayam': 's-anakayam', ayam: 's-ayam', biji: 's-biji', tunas: 's-tunas', 'anak-pokok': 's-anakpokok', pokok: 's-pokok' };
const NAME = { 'telur-rama': 'Telur rama-rama', 'telur-ayam': 'Telur ayam', ulat: 'Ulat', kepompong: 'Kepompong', rama: 'Rama-rama', 'telur-katak': 'Telur katak', berudu: 'Berudu', 'katak-kecil': 'Katak kecil', katak: 'Katak', 'anak-ayam': 'Anak ayam', ayam: 'Ayam', biji: 'Biji benih', tunas: 'Tunas', 'anak-pokok': 'Anak pokok', pokok: 'Pokok berbuah' };
const icon = (s) => (s === 'katak' ? bendaIcon('katak') : svg(ART[s]));

// same = pengganggu dari kitar yang sama · mid = boleh mula di tengah kitar · opts = bilangan pilihan maksimum
const LEVELS = [null,
  { opts: 2, same: false, mid: false },
  { opts: 3, same: false, mid: false },
  { opts: 3, same: true, mid: false },
  { opts: 4, same: true, mid: true },
];
const MAX_LEVEL = 4;
const AGE_LEVEL = { 3: 1, 4: 2, 5: 3, 6: 3 };
const UP_P = 80, DOWN_P = 50;  // % betul kali pertama
const IDLE_MS = 10000;
// Bulatan: pusat (50%, 37%), jejari 30% lebar. Pentas 2:3 → jejari menegak = 30/1.5 = 20% tinggi.
const CX = 50, CY = 37, R = 30, SLOT = 27;
const ANGLES = { 3: [-90, 30, 150], 4: [-90, 0, 90, 180] };
const posOf = (n, i) => { const a = ANGLES[n][i] * Math.PI / 180; return { x: CX + R * Math.cos(a), y: CY + (R / 1.5) * Math.sin(a) }; };

export default {
  id: 'kitar-hidup',
  title: 'Kitar Hidup',
  stageLabel: 'Bulatan kitar hidup. Teka apa jadi selepas setiap peringkat, contohnya telur jadi ulat.',
  lines: {
    intro: 'Jom tengok haiwan dan pokok membesar!',
    tanya: 'Lepas ni jadi apa?',
    'k-rama': 'Kitar hidup rama-rama.', 'k-katak': 'Kitar hidup katak.', 'k-ayam': 'Kitar hidup ayam.', 'k-pokok': 'Kitar hidup pokok.',
    lengkap: 'Lengkap! Dan ia mula semula.',
    's-telur': 'Telur.', 's-ulat': 'Ulat.', 's-kepompong': 'Kepompong.', 's-rama': 'Rama-rama!',
    's-telurkatak': 'Telur katak.', 's-berudu': 'Berudu.', 's-katakkecil': 'Katak kecil.', 's-katak': 'Katak.',
    's-anakayam': 'Anak ayam.', 's-ayam': 'Ayam.', 's-biji': 'Biji benih.', 's-tunas': 'Tunas.', 's-anakpokok': 'Anak pokok.', 's-pokok': 'Pokok berbuah!',
  },
  recorded: ['intro', 'tanya', 'k-rama', 'k-katak', 'k-ayam', 'k-pokok', 'lengkap', 's-telur', 's-ulat', 's-kepompong', 's-rama', 's-telurkatak', 's-berudu', 's-katakkecil', 's-katak', 's-anakayam', 's-ayam', 's-biji', 's-tunas', 's-anakpokok', 's-pokok'],

  css: `.kh-ring { inset: 0; z-index: 2; pointer-events: none; }
.kh-ring svg { width: 100%; height: 100%; display: block; }
.kh-arc { fill: none; stroke: rgba(255,255,255,.45); stroke-width: 1.6; stroke-dasharray: 2.2 2.2; transition: stroke .4s; }
.kh-arc.on { stroke: var(--kuning); stroke-dasharray: none; stroke-width: 2.2; }
.kh-slots { inset: 0; z-index: 3; pointer-events: none; }
.kh-slot { position: absolute; width: ${SLOT}%; aspect-ratio: 1; border-radius: 50%; transform: translate(-50%, -50%); background: rgba(255,253,245,.25); border: calc(var(--u) * .7) dashed rgba(255,255,255,.6); display: grid; place-items: center; }
.kh-slot svg { width: 78%; height: 78%; display: block; }
.kh-slot.full { background: #FFFDF5; border: calc(var(--u) * .7) solid #FFFDF5; box-shadow: 0 calc(var(--u) * 1) 0 rgba(0,0,0,.2); }
.kh-slot.next { border-color: var(--kuning); animation: kh-pulse 1.2s ease-in-out infinite; }
.kh-slot.next::after { content: '?'; font: 700 calc(var(--u) * 11)/1 Fredoka, sans-serif; color: var(--kuning); }
@keyframes kh-pulse { 50% { transform: translate(-50%, -50%) scale(1.07); } }
.kh-title { left: 30%; right: 30%; top: 32%; z-index: 2; text-align: center; font: 700 calc(var(--u) * 4.6)/1.15 Fredoka, sans-serif; color: #FFFDF5; opacity: .9; }
.kh-opts { left: 3%; right: 3%; top: 69%; bottom: 4%; z-index: 4; display: flex; justify-content: center; align-items: center; gap: calc(var(--u) * 2.5); }
.kh-opt { width: 30%; aspect-ratio: 1; padding: 3%; border-radius: calc(var(--u) * 5); background: #FFFDF5; box-shadow: 0 calc(var(--u) * 1.2) 0 rgba(0,0,0,.2); transition: opacity .3s; }
.kh-opts[data-n="4"] .kh-opt { width: 23%; }
.kh-opt svg { width: 100%; height: 100%; display: block; }
.kh-opt.dim { opacity: .3; }
.kh-opt:disabled { cursor: default; }
@media (prefers-reduced-motion: reduce) { .kh-slot.next { animation: none; } }`,

  // Taman: langit, rumput dan bulatan cahaya untuk kitar.
  stageHtml: () => `<svg class="bg" viewBox="0 0 200 300" preserveAspectRatio="none" aria-hidden="true">
      <rect width="200" height="300" fill="#4FA36B"/>
      <rect width="200" height="196" fill="#5DB37A"/>
      <ellipse cx="100" cy="111" rx="96" ry="88" fill="#6CC08A"/>
      <g fill="#3F8E58" opacity=".7">${[[14, 210], [44, 228], [170, 214], [140, 232], [100, 216]].map(([x, y]) => `<path d="M${x} ${y} q3 -10 6 0 q3 -12 6 0" />`).join('')}</g>
      <rect y="196" width="200" height="104" fill="#3F8E58"/>
    </svg>
    <div class="kh-ring"></div><div class="kh-title"></div><div class="kh-slots"></div><div class="kh-opts"></div>`,

  initState: (age) => ({ age, level: AGE_LEVEL[age], rounds: [] }),
  normalize(s, age) {
    if (s.age !== age) { s.age = age; s.level = AGE_LEVEL[age]; }
    if (!Number.isInteger(s.level) || s.level < 1 || s.level > MAX_LEVEL) s.level = AGE_LEVEL[age];
    return s;
  },

  async round(ctx) {
    const { stage, state, say, sfx, anim } = ctx;
    const ringEl = stage.querySelector('.kh-ring'), slotsEl = stage.querySelector('.kh-slots'), optsEl = stage.querySelector('.kh-opts'), titleEl = stage.querySelector('.kh-title');
    const level = state.level, L = LEVELS[level];

    function drawRing(n) {
      // Lengkung antara peringkat bersebelahan (termasuk yang terakhir → pertama). Koordinat 100×150 = nisbah pentas.
      const arcs = [];
      for (let i = 0; i < n; i++) {
        const a0 = ANGLES[n][i] + (n === 3 ? 34 : 30), a1 = ANGLES[n][i] + 360 / n - (n === 3 ? 34 : 30);
        const p = (a) => [CX + R * Math.cos(a * Math.PI / 180), CY * 1.5 + R * Math.sin(a * Math.PI / 180)];
        const [x0, y0] = p(a0), [x1, y1] = p(a1);
        arcs.push(`<path class="kh-arc" data-i="${i}" d="M${x0.toFixed(1)} ${y0.toFixed(1)} A${R} ${R} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}" marker-end="url(#kh-head)"/>`);
      }
      ringEl.innerHTML = `<svg viewBox="0 0 100 150" aria-hidden="true"><defs><marker id="kh-head" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="3.2" markerHeight="3.2" orient="auto"><path d="M0 0 L6 3 L0 6 Z" fill="#F5B82E"/></marker></defs>${arcs.join('')}</svg>`;
    }

    function distractors(cyc, correct, shown) {
      const own = CYCLES[cyc].stages.filter((s) => s !== correct && s !== shown);
      const others = shuffle(CYCLE_IDS.filter((c) => c !== cyc)).map((c) => pick(CYCLES[c].stages));
      const out = L.same ? shuffle(own) : [];
      for (const o of others) if (out.length < L.opts - 1) out.push(o);
      return out.slice(0, L.opts - 1);
    }

    async function trial(cyc, demo) {
      const C = CYCLES[cyc], n = C.stages.length;
      drawRing(n);
      titleEl.textContent = C.name;
      slotsEl.innerHTML = C.stages.map((s, i) => { const p = posOf(n, i); return `<div class="kh-slot" data-i="${i}" style="left:${p.x}%;top:${p.y}%"></div>`; }).join('');
      optsEl.innerHTML = '';
      const slots = [...slotsEl.querySelectorAll('.kh-slot')];
      const arcs = [...ringEl.querySelectorAll('.kh-arc')];
      const start = L.mid ? Math.floor(Math.random() * n) : 0;
      const fill = (i) => { slots[i].classList.remove('next'); slots[i].classList.add('full'); slots[i].innerHTML = icon(C.stages[i]); slots[i].setAttribute('aria-label', NAME[C.stages[i]]); };

      await ctx.wait(Math.max(1300, say(`k-${cyc}`) + 150));
      fill(start); sfx.pop();
      anim(slots[start], [{ transform: 'translate(-50%, -50%) scale(.4)' }, { transform: 'translate(-50%, -50%) scale(1)' }], { duration: 350, fill: 'none' });
      await ctx.wait(Math.max(800, say(VOICE[C.stages[start]]) + 250));

      let firstOk = 0, picks = 0;
      for (let step = 1; step < n; step++) {
        const prev = (start + step - 1) % n, idx = (start + step) % n;
        const correct = C.stages[idx];
        const opts = shuffle([correct, ...distractors(cyc, correct, C.stages[prev])]);
        slots[idx].classList.add('next');
        optsEl.dataset.n = String(opts.length);
        optsEl.innerHTML = opts.map((s) => `<button class="kh-opt" type="button" data-s="${s}" aria-label="${NAME[s]}" disabled>${icon(s)}</button>`).join('');
        stage.dataset.answer = correct; // untuk ujian automatik
        const cards = [...optsEl.querySelectorAll('.kh-opt')];
        const right = cards.find((c) => c.dataset.s === correct);
        const arm = (on) => cards.forEach((c) => { if (!c.classList.contains('dim')) c.disabled = !on; });
        const hint = () => { const r = ctx.toPct(right.getBoundingClientRect()); ctx.hand.show(r.left + r.width * .45, r.top + r.width * .35); };
        await ctx.wait(Math.max(900, say('tanya') + 100));

        let wrong = 0;
        for (;;) {
          if (demo && step === 1 && wrong === 0) hint();
          arm(true);
          const tap = await ctx.tap({ selector: '.kh-opt:not(.dim)', ms: IDLE_MS });
          arm(false); ctx.hand.hide();
          if (!tap) { hint(); await ctx.wait(Math.max(900, say('tanya') + 100)); continue; }
          const el = tap.el;
          if (el === right) {
            sfx.good();
            optsEl.innerHTML = '';
            fill(idx);
            arcs[prev].classList.add('on');
            anim(slots[idx], [{ transform: 'translate(-50%, -50%) scale(.4)' }, { transform: 'translate(-50%, -50%) scale(1.1)' }, { transform: 'translate(-50%, -50%) scale(1)' }], { duration: 420, fill: 'none' });
            await ctx.wait(Math.max(900, say(VOICE[correct]) + 300));
            break;
          }
          wrong++;
          sfx.soft();
          anim(el, [{ transform: 'translateX(0)' }, { transform: 'translateX(-6%)' }, { transform: 'translateX(6%)' }, { transform: 'translateX(0)' }], { duration: 340, fill: 'none' });
          await ctx.wait(Math.max(800, say(VOICE[el.dataset.s]) + 250));
          el.classList.add('dim'); el.disabled = true;
          if (wrong >= 2) hint();
          await ctx.wait(Math.max(800, say('cuba-lagi') + 100));
        }
        picks++; if (wrong === 0) firstOk++;
      }

      // Kitar lengkap: lengkung terakhir menyala, peringkat bercahaya satu demi satu mengikut pusingan.
      arcs[(start + n - 1) % n].classList.add('on');
      sfx.good();
      const d = say('lengkap');
      for (let k = 0; k <= n; k++) {
        const i = (start + k) % n;
        anim(slots[i], [{ transform: 'translate(-50%, -50%) scale(1)' }, { transform: 'translate(-50%, -50%) scale(1.14)' }, { transform: 'translate(-50%, -50%) scale(1)' }], { duration: 380, fill: 'none' });
        await ctx.wait(300);
      }
      await ctx.wait(Math.max(300, d - 300 * (n + 1) + 200));
      return { cyc, picks, firstOk, mid: start !== 0 };
    }

    const order = shuffle(CYCLE_IDS);
    if (ctx.first) { order.splice(order.indexOf('rama'), 1); order.unshift('rama'); }
    ctx.progress(order.length);
    await ctx.ready(); ctx.alive();
    if (ctx.first) await ctx.wait(Math.max(2600, say('intro') + 200));
    const recs = [];
    for (let i = 0; i < order.length; i++) {
      recs.push(await trial(order[i], ctx.first && i === 0 && level === 1));
      ctx.mark(i);
      await ctx.wait(300);
    }
    delete stage.dataset.answer;

    const picks = recs.reduce((a, r) => a + r.picks, 0), firstOk = recs.reduce((a, r) => a + r.firstOk, 0);
    const p = pct(firstOk, picks);
    if (p >= UP_P) state.level = Math.min(MAX_LEVEL, level + 1);
    else if (p <= DOWN_P) state.level = Math.max(1, level - 1);
    return {
      record: { level, picks, firstOk, miss: recs.filter((r) => r.firstOk < r.picks).map((r) => r.cyc) },
      foundHtml: ['rama', 'katak-kecil', 'anak-ayam', 'pokok'].map(icon).join(''),
      text: `Adik lengkapkan <span class="big-num">${recs.length}</span> kitar hidup!` + (firstOk ? ` <span class="big-num">${firstOk}</span> teka betul kali pertama.` : ''),
    };
  },

  parent: {
    stats(s) {
      const last = s.rounds.slice(-7);
      const okP = pct(last.reduce((a, r) => a + (r.firstOk || 0), 0), last.reduce((a, r) => a + (r.picks || 0), 0));
      const misses = {};
      last.forEach((r) => (r.miss || []).forEach((c) => { misses[c] = (misses[c] || 0) + 1; }));
      const hardest = Object.entries(misses).sort((a, b) => b[1] - a[1])[0];
      return [
        { v: okP === null ? '–' : okP + '%', label: 'Teka betul kali pertama' },
        { v: `${s.level}<small>/${MAX_LEVEL}</small>`, label: 'Tahap' },
        { v: hardest && CYCLES[hardest[0]] ? CYCLES[hardest[0]].name : '–', label: 'Kitar paling mencabar' },
      ];
    },
    cols: ['Tahap', 'Betul', 'Tersilap'],
    row: (r) => [r.level, meter(pct(r.firstOk, r.picks)), (r.miss || []).filter((c) => CYCLES[c]).map((c) => CYCLES[c].name).join(', ') || '–'],
    explain: `<span><b>Kitar hidup</b> (Sains Awal KSPK): memahami bahawa haiwan dan tumbuhan membesar melalui peringkat yang tetap, dan kitar itu berulang. Ini juga melatih <b>turutan</b> dan membuat ramalan ("lepas ni jadi apa?").</span>
      <span>Tahap 1–2: pilihan salah dari kitar lain (mudah dikesan) · Tahap 3: pilihan salah dari kitar yang sama, jadi anak mesti tahu turutan sebenar · Tahap 4: kitar bermula di tengah (cth. kepompong) dan anak perlu pusing kembali ke telur. Naik bila ≥ 80% betul kali pertama.</span>`,
  },

  mission: {
    title: 'Jadi saintis kecil di halaman',
    steps: [
      'Tanam satu biji kacang hijau dalam kapas basah atau tanah. Letak di tepi tingkap.',
      'Setiap pagi, tengok bersama: <b>"Dah keluar tunas belum?"</b>',
      'Bila nampak rama-rama, katak atau ayam, tanya: <b>"Masa kecil dia rupa apa?"</b>',
      'Lukis peringkat yang anak nampak dalam bulatan, macam dalam game.',
    ],
    why: 'Kenapa? Melihat sendiri benda membesar membuatkan konsep kitar hidup lebih kekal dalam ingatan, dan melatih anak memerhati dengan sabar.',
  },
};
