// Kawan Baik: empati dan tingkah laku prososial. Setiap cerita ada dua langkah:
// (1) "Kawan rasa apa?": baca perasaan dari situasi (dan muka, di tahap rendah);
// (2) "Apa adik boleh buat?": pilih tindakan yang baik. Tindakan baik membuat muka kawan bertukar gembira.
// Tahap tinggi menyorok muka kawan, jadi anak mesti menyimpulkan perasaan dari situasi sahaja (perspektif afektif).
import { KIDS, faceSVG, EMOTION_NAME } from '../../kit/faces.js';
import { pick, shuffle, pct, meter } from '../../kit/util.js';

const INK = '#2B2F36';
const S = (inner) => `<svg viewBox="0 0 100 100" aria-hidden="true">${inner}</svg>`;

// Ilustrasi situasi (viewBox 0 0 100 100).
const SCENE_ART = {
  aiskrim: S(`<ellipse cx="50" cy="86" rx="40" ry="6" fill="#000" opacity=".12"/>
    <path d="M20 84 Q22 70 36 72 Q44 62 54 70 Q68 66 70 80 Q72 88 56 87 Q40 90 20 84 Z" fill="#F48FB1" stroke="#C2185B" stroke-width="2.4"/>
    <circle cx="40" cy="76" r="3" fill="#fff" opacity=".6"/><circle cx="58" cy="78" r="2.4" fill="#fff" opacity=".6"/>
    <path d="M60 52 L88 40 L80 68 Z" fill="#E0A458" stroke="#9C6420" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="M66 50 L82 60 M72 46 L84 52 M64 56 L78 66" stroke="#9C6420" stroke-width="1.6"/>
    <g stroke="${INK}" stroke-width="2.4" stroke-linecap="round"><path d="M24 30 l6 6 M36 22 l2 8 M14 44 l8 2"/></g>`),
  belon: S(`<path d="M62 46 Q56 64 62 78 Q66 88 58 96" stroke="#6B7684" stroke-width="1.8" fill="none"/>
    <ellipse cx="64" cy="26" rx="16" ry="19" fill="#E5484D" stroke="#A8262B" stroke-width="2.4"/>
    <path d="M60 44 h8 l-4 4 z" fill="#A8262B"/><ellipse cx="58" cy="18" rx="4" ry="7" fill="#fff" opacity=".4" transform="rotate(-20 58 18)"/>
    <g fill="#fff" stroke="#BFD6E6" stroke-width="1.6"><path d="M12 30 a7 7 0 0 1 12 -4 a8 8 0 0 1 14 4 a5 5 0 0 1 0 10 h-24 a5 5 0 0 1 -2 -10z"/></g>
    <g stroke="${INK}" stroke-width="2.2" stroke-linecap="round" opacity=".55"><path d="M84 40 l6 -6 M86 52 l8 -2 M40 56 l-6 6"/></g>`),
  jatuh: S(`<ellipse cx="50" cy="88" rx="40" ry="6" fill="#000" opacity=".12"/>
    <g transform="rotate(-24 50 54)"><rect x="18" y="42" width="64" height="24" rx="12" fill="#F6D7A7" stroke="#C49A5C" stroke-width="2.4"/>
    <rect x="38" y="42" width="24" height="24" fill="#EFC48B"/><g fill="#C49A5C">${[[44, 48], [56, 48], [50, 54], [44, 60], [56, 60]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.6"/>`).join('')}</g></g>
    <g stroke="#E5484D" stroke-width="2.6" stroke-linecap="round"><path d="M20 22 l6 8 M34 16 l2 9 M10 36 l9 3"/></g>
    <path d="M78 14 l2.4 5 5 2.4 -5 2.4 -2.4 5 -2.4 -5 -5 -2.4 5 -2.4z" fill="#F5B82E"/>`),
  blok: S(`<ellipse cx="50" cy="88" rx="42" ry="6" fill="#000" opacity=".12"/>
    <rect x="12" y="66" width="20" height="20" rx="3" fill="#2F7DE1" stroke="#1A4F99" stroke-width="2.4" transform="rotate(-12 22 76)"/>
    <rect x="40" y="70" width="18" height="18" rx="3" fill="#F5B82E" stroke="#B7860F" stroke-width="2.4" transform="rotate(18 49 79)"/>
    <rect x="66" y="64" width="20" height="20" rx="3" fill="#22B26A" stroke="#157A47" stroke-width="2.4" transform="rotate(-30 76 74)"/>
    <rect x="30" y="38" width="18" height="18" rx="3" fill="#E5484D" stroke="#A8262B" stroke-width="2.4" transform="rotate(40 39 47)"/>
    <rect x="60" y="30" width="16" height="16" rx="3" fill="#B38CEB" stroke="#7A52B8" stroke-width="2.4" transform="rotate(-20 68 38)"/>
    <g stroke="${INK}" stroke-width="2.2" stroke-linecap="round" opacity=".55"><path d="M22 30 l-4 -6 M50 20 v-8 M84 22 l5 -5"/></g>`),
  guruh: S(`<path d="M14 44 a12 12 0 0 1 16 -14 a16 16 0 0 1 30 -4 a12 12 0 0 1 22 8 a10 10 0 0 1 2 20 h-62 a10 10 0 0 1 -8 -10z" fill="#6B7684" stroke="#3E4651" stroke-width="2.4"/>
    <path d="M52 52 L40 74 H52 L44 96 L70 66 H56 L64 52 Z" fill="#F5D33B" stroke="#C99A0A" stroke-width="2.4" stroke-linejoin="round"/>
    <g stroke="#2F7DE1" stroke-width="2.4" stroke-linecap="round"><path d="M20 66 l-3 8 M30 70 l-3 8 M80 66 l-3 8"/></g>`),
  hadiah: S(`<ellipse cx="50" cy="90" rx="40" ry="5" fill="#000" opacity=".12"/>
    <rect x="16" y="54" width="52" height="34" rx="5" fill="#F7C5D8" stroke="#C2185B" stroke-width="2.4"/>
    <path d="M16 66 Q24 72 32 66 T48 66 T68 66" stroke="#fff" stroke-width="4" fill="none"/>
    <g>${[26, 42, 58].map((x) => `<rect x="${x - 2.5}" y="38" width="5" height="16" rx="1.5" fill="#2F7DE1"/><path d="M${x} 28 q4 5 0 9 q-4 -4 0 -9z" fill="#F5B82E"/>`).join('')}</g>
    <rect x="70" y="64" width="22" height="24" rx="3" fill="#22B26A" stroke="#157A47" stroke-width="2.4"/>
    <rect x="79" y="64" width="4" height="24" fill="#F5B82E"/><path d="M81 64 q-8 -10 -12 -2 q4 4 12 2 q8 -10 12 -2 q-4 4 -12 2z" fill="#F5B82E" stroke="#B7860F" stroke-width="1.4"/>`),
  seorang: S(`<ellipse cx="50" cy="90" rx="42" ry="5" fill="#000" opacity=".1"/>
    <g opacity=".55"><circle cx="62" cy="40" r="10" fill="#D9A06F"/><circle cx="84" cy="40" r="10" fill="#F1C9A5"/>
    <rect x="54" y="50" width="16" height="22" rx="7" fill="#2F7DE1"/><rect x="76" y="50" width="16" height="22" rx="7" fill="#E5484D"/>
    <path d="M70 58 H76" stroke="${INK}" stroke-width="3" stroke-linecap="round"/></g>
    <circle cx="22" cy="78" r="12" fill="#F5B82E" stroke="#B7860F" stroke-width="2.4"/><path d="M12 74 Q22 82 32 74" stroke="#B7860F" stroke-width="2" fill="none"/>
    <g fill="${INK}" opacity=".45"><circle cx="40" cy="60" r="2"/><circle cx="46" cy="60" r="2"/><circle cx="52" cy="60" r="2"/></g>`),
};

// Ikon tindakan (viewBox 0 0 100 100).
const ACTION_ART = {
  kongsi: S(`<path d="M30 48 L50 92 L70 48 Z" fill="#E0A458" stroke="#9C6420" stroke-width="3" stroke-linejoin="round"/>
    <path d="M38 56 L62 70 M42 50 L66 62 M36 64 L56 78" stroke="#9C6420" stroke-width="1.8"/>
    <circle cx="50" cy="38" r="18" fill="#F48FB1" stroke="#C2185B" stroke-width="3"/><circle cx="44" cy="32" r="4" fill="#fff" opacity=".5"/>
    <path d="M78 16 c-4 -6 -12 -2 -8 4 l8 8 8 -8 c4 -6 -4 -10 -8 -4z" fill="#E5484D"/>`),
  peluk: S(`<path d="M50 84 C20 64 12 44 24 30 C34 20 46 26 50 34 C54 26 66 20 76 30 C88 44 80 64 50 84 Z" fill="#E5484D" stroke="#A8262B" stroke-width="3"/>
    <path d="M10 56 Q24 80 50 82 Q76 80 90 56" stroke="#F1C9A5" stroke-width="10" fill="none" stroke-linecap="round"/>
    <path d="M10 56 Q24 80 50 82 Q76 80 90 56" stroke="#C49A5C" stroke-width="2" fill="none" stroke-linecap="round" opacity=".6"/>
    <ellipse cx="38" cy="38" rx="6" ry="4" fill="#fff" opacity=".4"/>`),
  tolong: S(`<g transform="rotate(-20 50 50)"><path d="M32 86 V50 a5 5 0 0 1 10 0 V30 a5 5 0 0 1 10 0 V26 a5 5 0 0 1 10 0 V32 a5 5 0 0 1 10 0 V62 Q72 86 52 88 Z" fill="#F1C9A5" stroke="#C49A5C" stroke-width="3" stroke-linejoin="round"/>
    <path d="M42 50 V60 M52 30 V58 M62 32 V58" stroke="#C49A5C" stroke-width="2" stroke-linecap="round" opacity=".6"/></g>
    <path d="M82 16 l2.4 5 5 2.4 -5 2.4 -2.4 5 -2.4 -5 -5 -2.4 5 -2.4z" fill="#F5B82E"/>`),
  bina: S(`<ellipse cx="50" cy="92" rx="26" ry="4" fill="#000" opacity=".12"/>
    <rect x="30" y="66" width="40" height="24" rx="3" fill="#2F7DE1" stroke="#1A4F99" stroke-width="3"/>
    <rect x="34" y="42" width="32" height="24" rx="3" fill="#F5B82E" stroke="#B7860F" stroke-width="3"/>
    <rect x="38" y="18" width="24" height="24" rx="3" fill="#E5484D" stroke="#A8262B" stroke-width="3"/>
    <path d="M82 22 l2.4 5 5 2.4 -5 2.4 -2.4 5 -2.4 -5 -5 -2.4 5 -2.4z M16 40 l1.8 3.6 3.6 1.8 -3.6 1.8 -1.8 3.6 -1.8 -3.6 -3.6 -1.8 3.6 -1.8z" fill="#F5B82E"/>`),
  pegang: S(`<path d="M8 62 Q20 46 40 48 L58 50 Q64 52 60 58 L44 58" fill="#D9A06F" stroke="#9C6A3C" stroke-width="3" stroke-linejoin="round"/>
    <path d="M92 50 Q80 66 60 64 L42 62 Q36 60 40 54 L56 54" fill="#F1C9A5" stroke="#C49A5C" stroke-width="3" stroke-linejoin="round"/>
    <path d="M44 58 Q50 66 58 58" stroke="#9C6A3C" stroke-width="2.4" fill="none"/>
    <path d="M50 30 c-4 -6 -12 -2 -8 4 l8 8 8 -8 c4 -6 -4 -10 -8 -4z" fill="#E5484D"/>`),
  ucap: S(`<path d="M14 20 h72 a8 8 0 0 1 8 8 v34 a8 8 0 0 1 -8 8 h-40 l-16 16 v-16 h-16 a8 8 0 0 1 -8 -8 v-34 a8 8 0 0 1 8 -8z" fill="#FFFDF5" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
    <rect x="34" y="40" width="32" height="20" rx="3" fill="#F7C5D8" stroke="#C2185B" stroke-width="2.4"/>
    <rect x="48" y="30" width="4" height="10" fill="#2F7DE1"/><path d="M50 22 q3 4 0 7 q-3 -3 0 -7z" fill="#F5B82E"/>
    <path d="M22 34 l1.6 3.2 3.2 1.6 -3.2 1.6 -1.6 3.2 -1.6 -3.2 -3.2 -1.6 3.2 -1.6z M78 34 l1.6 3.2 3.2 1.6 -3.2 1.6 -1.6 3.2 -1.6 -3.2 -3.2 -1.6 3.2 -1.6z" fill="#F5B82E"/>`),
  ajak: S(`<circle cx="50" cy="56" r="28" fill="#F5B82E" stroke="#B7860F" stroke-width="3"/>
    <path d="M26 46 Q50 66 74 46 M50 28 V84" stroke="#B7860F" stroke-width="2.6" fill="none"/>
    <path d="M78 14 c-4 -6 -12 -2 -8 4 l8 8 8 -8 c4 -6 -4 -10 -8 -4z M22 14 c-4 -6 -12 -2 -8 4 l8 8 8 -8 c4 -6 -4 -10 -8 -4z" fill="#E5484D"/>`),
  ketawa: S(`<circle cx="50" cy="52" r="34" fill="#F5D33B" stroke="#C99A0A" stroke-width="3"/>
    <path d="M32 44 l8 -5 M68 44 l-8 -5 M32 40 l8 5 M68 40 l-8 5" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
    <path d="M30 56 Q50 86 70 56 Z" fill="#8E2A2A" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>
    <path d="M78 18 l8 -6 M84 30 l10 -2" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
    <text x="16" y="22" font-family="Fredoka, sans-serif" font-weight="700" font-size="16" fill="${INK}">HA</text>`),
  abai: S(`<ellipse cx="50" cy="92" rx="22" ry="4" fill="#000" opacity=".12"/>
    <circle cx="50" cy="34" r="18" fill="#3B2A1A"/><path d="M34 40 Q50 50 66 40 V44 Q50 54 34 44 Z" fill="#3B2A1A"/>
    <circle cx="32" cy="36" r="4" fill="#D9A06F"/><circle cx="68" cy="36" r="4" fill="#D9A06F"/>
    <rect x="34" y="52" width="32" height="34" rx="12" fill="#6B7684"/>
    <g stroke="${INK}" stroke-width="2.6" stroke-linecap="round" opacity=".5"><path d="M80 46 h10 M78 58 h14 M80 70 h10"/></g>`),
};
const ACTION_KEYS = Object.keys(ACTION_ART);
const UNKIND = ['ketawa', 'abai'];

// Cerita: perasaan sasaran, perasaan lain yang juga munasabah (tidak dijadikan pengganggu), tindakan baik.
const SCENES = [
  { id: 'aiskrim', emo: 'sedih', alsoOk: ['marah'], kind: 'kongsi' },
  { id: 'belon', emo: 'sedih', alsoOk: [], kind: 'peluk' },
  { id: 'jatuh', emo: 'sedih', alsoOk: ['takut'], kind: 'tolong' },
  { id: 'blok', emo: 'marah', alsoOk: ['sedih'], kind: 'bina' },
  { id: 'guruh', emo: 'takut', alsoOk: [], kind: 'pegang' },
  { id: 'hadiah', emo: 'gembira', alsoOk: [], kind: 'ucap' },
  { id: 'seorang', emo: 'sedih', alsoOk: [], kind: 'ajak' },
];
const FEEL_SET = ['gembira', 'sedih', 'marah', 'takut'];

const TRIALS = 4;
// feels = bilangan pilihan perasaan · acts = bilangan pilihan tindakan · hide = sorok muka kawan · basic = cerita gembira/sedih sahaja
const LEVELS = [null,
  { feels: 2, acts: 2, hide: false, basic: true },
  { feels: 3, acts: 2, hide: false, basic: false },
  { feels: 3, acts: 3, hide: true, basic: false },
  { feels: 4, acts: 3, hide: true, basic: false },
];
const MAX_LEVEL = 4;
const AGE_LEVEL = { 3: 1, 4: 2, 5: 3, 6: 3 };
const UP_AT = 7, DOWN_AT = 4; // daripada 8 jawapan (2 setiap cerita)
const IDLE_MS = 10000;

const Q_HTML = `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="54" r="34" fill="#E9E2CF" stroke="#C9BC9A" stroke-width="3" stroke-dasharray="6 5"/><text x="50" y="70" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="46" fill="#8A7A55">?</text></svg>`;

const LINES = {
    intro: 'Jom jadi kawan yang baik! Tengok apa jadi pada kawan.',
    's-aiskrim': 'Alamak, aiskrim kawan jatuh.',
    's-belon': 'Oh tidak, belon kawan terbang jauh.',
    's-jatuh': 'Kawan terjatuh. Lututnya sakit.',
    's-blok': 'Ada orang robohkan menara blok kawan.',
    's-guruh': 'Bunyi guruh kuat sangat!',
    's-hadiah': 'Hari ini hari jadi kawan!',
    's-seorang': 'Kawan main seorang diri. Tiada siapa ajak dia.',
    'rasa-apa': 'Kawan rasa apa?',
    'boleh-buat': 'Apa adik boleh buat?',
    'a-kongsi': 'Kongsi aiskrim adik.',
    'a-peluk': 'Peluk dia.',
    'a-tolong': 'Tolong dia bangun.',
    'a-bina': 'Bina semula sama-sama.',
    'a-pegang': 'Pegang tangan dia.',
    'a-ucap': 'Ucap selamat hari jadi.',
    'a-ajak': 'Ajak dia main sama.',
    'a-ketawa': 'Ketawakan dia.',
    'a-abai': 'Buat tak tahu saja.',
    baik: 'Baiknya adik! Kawan rasa lebih baik.',
    'tak-suka': 'Alamak, kawan tak suka. Cuba lagi, ya.',
    ...Object.fromEntries(FEEL_SET.map((e) => [`ini-${e}`, `Ini muka ${e}${e === 'gembira' ? '!' : '.'}`])),
};

export default {
  id: 'kawan-baik',
  title: 'Kawan Baik',
  stageLabel: 'Cerita tentang kawan. Pilih perasaan kawan, kemudian pilih cara untuk membantunya.',
  lines: LINES,
  recorded: ['intro', ...SCENES.map((s) => `s-${s.id}`), 'rasa-apa', 'boleh-buat', ...ACTION_KEYS.map((a) => `a-${a}`), 'baik', 'tak-suka', ...FEEL_SET.map((e) => `ini-${e}`)],

  css: `.kb-scene { left: 6%; right: 6%; top: 11%; height: 37%; z-index: 2; background: #FFFDF5; border-radius: calc(var(--u) * 6);
  box-shadow: 0 calc(var(--u) * 1.4) 0 rgba(0,0,0,.18); display: flex; align-items: center; justify-content: space-around; padding: 0 3%; }
.kb-face { width: 44%; aspect-ratio: 1; position: relative; }
.kb-prop { width: 46%; aspect-ratio: 1; }
.kb-face svg, .kb-prop svg, .kb-opt svg { width: 100%; height: 100%; display: block; }
.kb-face.pop { animation: kb-pop .5s ease-out; }
@keyframes kb-pop { 0% { transform: scale(.85); } 60% { transform: scale(1.12); } 100% { transform: scale(1); } }
.kb-face .kb-spark { position: absolute; inset: -8%; pointer-events: none; }
.kb-opts { left: 4%; right: 4%; top: 53%; bottom: 5%; z-index: 3; display: flex; flex-wrap: wrap; justify-content: center; align-content: center; gap: calc(var(--u) * 3); }
.kb-opt { width: 40%; aspect-ratio: 1; padding: 3%; border-radius: calc(var(--u) * 5); background: #FFFDF5; box-shadow: 0 calc(var(--u) * 1.2) 0 rgba(0,0,0,.2); transition: transform .2s, opacity .3s; }
.kb-opt.face { border-radius: 50%; padding: 2%; }
.kb-opts[data-n="3"] .kb-opt { width: 30%; }
.kb-opt.speak { transform: scale(1.08); box-shadow: 0 0 0 calc(var(--u) * 1.2) #2F7DE1, 0 calc(var(--u) * 1.2) 0 rgba(0,0,0,.2); }
.kb-opt.ok { box-shadow: 0 0 0 calc(var(--u) * 1.4) var(--kuning), 0 calc(var(--u) * 1.2) 0 rgba(0,0,0,.2); }
.kb-opt.dim { opacity: .3; }
.kb-opt.hidden { visibility: hidden; }
.kb-opt:disabled { cursor: default; }`,

  stageHtml: () => `<svg class="bg" viewBox="0 0 200 300" preserveAspectRatio="none" aria-hidden="true">
      <rect width="200" height="300" fill="#F7BD98"/>
      <g fill="#F9CDAF">${[[24, 40, 18], [176, 26, 14], [16, 200, 22], [186, 230, 18], [100, 290, 30]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('')}</g>
      <g fill="#EE9F78" opacity=".8">${[[40, 156], [160, 150], [100, 160]].map(([x, y]) => `<path d="M${x} ${y + 6} c-6 -8 -14 -2 -8 4 l8 8 8 -8 c6 -6 -2 -12 -8 -4z"/>`).join('')}</g>
    </svg>
    <div class="kb-scene" role="img" aria-label="Cerita"><div class="kb-face"></div><div class="kb-prop"></div></div>
    <div class="kb-opts"></div>`,

  initState: (age) => ({ age, level: AGE_LEVEL[age], rounds: [] }),
  normalize(s, age) {
    if (s.age !== age) { s.age = age; s.level = AGE_LEVEL[age]; }
    if (!Number.isInteger(s.level) || s.level < 1 || s.level > MAX_LEVEL) s.level = AGE_LEVEL[age];
    return s;
  },

  async round(ctx) {
    const { stage, state, say, sfx, anim } = ctx;
    const faceEl = stage.querySelector('.kb-face'), propEl = stage.querySelector('.kb-prop'), optsEl = stage.querySelector('.kb-opts');
    const level = state.level, L = LEVELS[level];
    const sayW = (key, extra = 200, min = 800) => ctx.wait(Math.max(min, say(key) + extra));
    const shake = (el) => anim(el, [{ transform: 'translateX(0)' }, { transform: 'translateX(-6%)' }, { transform: 'translateX(6%)' }, { transform: 'translateX(0)' }], { duration: 340, fill: 'none' });
    const SPARK = `<svg class="kb-spark" viewBox="0 0 100 100" aria-hidden="true"><g fill="#F5B82E">${[[8, 14], [90, 10], [94, 70], [4, 76]].map(([x, y]) => `<path d="M${x} ${y - 6} l2 4 4 2 -4 2 -2 4 -2 -4 -4 -2 4 -2z"/>`).join('')}</g></svg>`;

    // Pilih cerita: tahap 1 hanya gembira/sedih; cerita gembira (hadiah) paling banyak sekali.
    const pool = SCENES.filter((s) => !L.basic || s.emo === 'gembira' || s.emo === 'sedih');
    const scenes = shuffle(pool).slice(0, TRIALS);

    const setFace = (kid, emo) => { faceEl.innerHTML = faceSVG(kid, emo); };

    // Kad pilihan; jika speak, setiap kad muncul dan disebut.
    async function present(html, n, speakKeys) {
      optsEl.dataset.n = String(n);
      optsEl.innerHTML = html;
      const cards = [...optsEl.querySelectorAll('.kb-opt')];
      if (speakKeys) {
        for (let i = 0; i < cards.length; i++) {
          cards[i].classList.remove('hidden'); cards[i].classList.add('speak');
          await sayW(speakKeys[i], 250, 700);
          cards[i].classList.remove('speak');
        }
      }
      return cards;
    }

    async function ask(cards, correctEl, demo, { onWrong, reaskKey, idle }) {
      const arm = (on) => cards.forEach((c) => { if (!c.classList.contains('dim')) c.disabled = !on; });
      const hint = () => { const r = ctx.toPct(correctEl.getBoundingClientRect()); ctx.hand.show(r.left + r.width * .45, r.top + r.width * .35); };
      let wrong = 0;
      for (;;) {
        if ((demo && wrong === 0) || wrong >= 2) hint();
        arm(true);
        const t = await ctx.tap({ selector: '.kb-opt', ms: IDLE_MS });
        arm(false); ctx.hand.hide();
        if (!t) { if (idle) await idle(); else await sayW(reaskKey, 100); continue; }
        if (t.el === correctEl) return wrong;
        wrong++;
        sfx.soft();
        shake(t.el);
        await onWrong(t.el, wrong);
      }
    }

    async function trial(sc, demo) {
      const kid = Math.floor(Math.random() * KIDS.length);
      // 1. Cerita.
      propEl.innerHTML = SCENE_ART[sc.id];
      if (L.hide) faceEl.innerHTML = Q_HTML; else setFace(kid, sc.emo);
      stage.dataset.target = sc.emo; stage.dataset.kind = sc.kind; // untuk ujian automatik
      optsEl.innerHTML = '';
      sfx.pop();
      await anim(stage.querySelector('.kb-scene'), [{ transform: 'scale(.9)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { duration: 350, fill: 'none' });
      await sayW(`s-${sc.id}`, 450, 1600);

      // 2. Perasaan.
      const others = shuffle(FEEL_SET.filter((e) => e !== sc.emo && !sc.alsoOk.includes(e)));
      const emos = shuffle([sc.emo, ...others.slice(0, L.feels - 1)]);
      const feelCards = await present(emos.map((e) => `<button class="kb-opt face" type="button" data-emo="${e}" aria-label="Muka ${EMOTION_NAME[e].toLowerCase()}" disabled>${faceSVG(kid, e)}</button>`).join(''), emos.length, null);
      await sayW('rasa-apa', 100, 900);
      const feelWrong = await ask(feelCards, feelCards.find((c) => c.dataset.emo === sc.emo), demo, {
        reaskKey: 'rasa-apa',
        onWrong: async (el) => {
          // Namakan muka yang dipilih, ulang cerita, tanya semula.
          await sayW(`ini-${el.dataset.emo}`, 250, 900);
          await sayW(`s-${sc.id}`, 250, 1400);
          await sayW('rasa-apa', 100, 900);
        },
      });
      const okFeel = feelCards.find((c) => c.dataset.emo === sc.emo);
      okFeel.classList.add('ok'); feelCards.forEach((c) => { if (c !== okFeel) c.classList.add('dim'); });
      sfx.good();
      setFace(kid, sc.emo); faceEl.classList.remove('pop'); void faceEl.offsetWidth; faceEl.classList.add('pop');
      await sayW(`ini-${sc.emo}`, 350, 1000);

      // 3. Tindakan.
      const acts = shuffle([sc.kind, ...shuffle(UNKIND).slice(0, L.acts - 1)]);
      const actCards = await present(acts.map((a) => `<button class="kb-opt hidden" type="button" data-act="${a}" aria-label="${LINES[`a-${a}`]}" disabled>${ACTION_ART[a]}</button>`).join(''), acts.length, acts.map((a) => `a-${a}`));
      await sayW('boleh-buat', 100, 900);
      const kindEl = actCards.find((c) => c.dataset.act === sc.kind);
      const actWrong = await ask(actCards, kindEl, demo, {
        reaskKey: 'boleh-buat',
        onWrong: async (el) => {
          el.classList.add('dim'); el.disabled = true;
          // Kawan bertambah sedih (atau sedih, jika tadi gembira).
          setFace(kid, sc.emo === 'gembira' ? 'sedih' : sc.emo);
          shake(faceEl);
          await sayW('tak-suka', 200, 1200);
        },
        idle: async () => {
          // Sebut semula semua pilihan yang masih ada.
          for (const c of actCards) { if (c.classList.contains('dim')) continue; c.classList.add('speak'); await sayW(`a-${c.dataset.act}`, 200, 700); c.classList.remove('speak'); }
          await sayW('boleh-buat', 100, 900);
        },
      });
      kindEl.classList.add('ok'); actCards.forEach((c) => { if (c !== kindEl) c.classList.add('dim'); });
      sfx.good();
      setFace(kid, 'gembira'); faceEl.insertAdjacentHTML('beforeend', SPARK);
      faceEl.classList.remove('pop'); void faceEl.offsetWidth; faceEl.classList.add('pop');
      await sayW('baik', 400, 1800);
      return { id: sc.id, emo: sc.emo, feelOk: feelWrong === 0, actOk: actWrong === 0 };
    }

    ctx.progress(TRIALS);
    await ctx.ready(); ctx.alive();
    if (ctx.first) await ctx.wait(Math.max(2800, say('intro') + 200));
    const recs = [];
    for (let i = 0; i < TRIALS; i++) {
      recs.push(await trial(scenes[i], ctx.first && i === 0 && level === 1));
      ctx.mark(i);
      await ctx.wait(400);
    }
    delete stage.dataset.target; delete stage.dataset.kind;

    const feelOk = recs.filter((r) => r.feelOk).length, actOk = recs.filter((r) => r.actOk).length;
    const score = feelOk + actOk;
    if (score >= UP_AT) state.level = Math.min(MAX_LEVEL, level + 1);
    else if (score <= DOWN_AT) state.level = Math.max(1, level - 1);
    return {
      record: { level, feelOk, actOk, n: recs.length, miss: recs.filter((r) => !r.feelOk).map((r) => r.emo) },
      foundHtml: [...Array(Math.min(3, recs.length))].map((_, i) => faceSVG(i, 'gembira')).join(''),
      text: `Adik dah tolong <span class="big-num">${recs.length}</span> kawan! Baca perasaan betul: <span class="big-num">${feelOk}</span>/${recs.length} · Pilih cara baik: <span class="big-num">${actOk}</span>/${recs.length}.`,
    };
  },

  parent: {
    stats(s) {
      const last = s.rounds.slice(-7);
      const n = last.reduce((a, r) => a + (r.n || 0), 0);
      const feelP = pct(last.reduce((a, r) => a + (r.feelOk || 0), 0), n);
      const actP = pct(last.reduce((a, r) => a + (r.actOk || 0), 0), n);
      return [
        { v: feelP === null ? '–' : feelP + '%', label: 'Baca perasaan kawan' },
        { v: actP === null ? '–' : actP + '%', label: 'Pilih cara baik' },
        { v: `${s.level}<small>/${MAX_LEVEL}</small>`, label: 'Tahap' },
      ];
    },
    cols: ['Tahap', 'Perasaan', 'Tindakan'],
    row: (r) => [r.level, meter(pct(r.feelOk, r.n)), meter(pct(r.actOk, r.n))],
    explain: `<span><b>Empati dan tingkah laku prososial</b>: memahami apa yang kawan rasa dalam sesuatu situasi, kemudian memilih tindakan yang membantu. Umur 3–4 biasanya boleh meneka perasaan gembira/sedih dari situasi biasa; umur 4–6 mula memahami marah dan takut, dan boleh mencadangkan cara membantu (berkongsi, memujuk, mengajak main).</span>
      <span>Tahap 1: gembira/sedih, muka kawan kelihatan · Tahap 2: + marah dan takut · Tahap 3–4: muka kawan disorok, jadi anak mesti meneka dari cerita sahaja, dengan 3 pilihan tindakan. Tindakan baik membuat muka kawan bertukar gembira, supaya anak nampak kesan perbuatannya.</span>`,
  },

  mission: {
    title: 'Main "Kalau Kawan…"',
    steps: [
      'Semasa makan atau dalam kereta, tanya: <b>"Kalau kawan adik jatuh, dia rasa apa?"</b>',
      'Kemudian: <b>"Apa adik boleh buat untuk dia?"</b> Terima apa-apa idea yang baik.',
      'Bila anak berkongsi atau menolong di rumah, namakan: <b>"Adik kongsi mainan. Tengok, adik rasa gembira!"</b>',
      'Bila anak sendiri sedih, tanya: <b>"Apa yang boleh buat adik rasa lebih baik?"</b>',
    ],
    why: 'Kenapa? Empati bermula dengan memahami perasaan orang lain, dan menjadi tabiat bila anak melihat kesan baik perbuatannya sendiri.',
  },
};
