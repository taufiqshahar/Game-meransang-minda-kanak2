// Cuaca Hari Ini: sains awal (cuaca) + penaakulan sebab-akibat. Langit berubah (hujan, panas terik, berangin, sejuk);
// anak "pakaikan" kawan dengan barang yang sesuai. Barang yang betul terus dipakai (payung di tangan, topi di kepala),
// jadi anak nampak hasilnya. Salah pilih = Sayf namakan barang itu dan "tak sesuai untuk cuaca ni"; tiada kalah.
import { bendaIcon } from '../../kit/benda.js';
import { shuffle, pct, meter } from '../../kit/util.js';

const svg = (inner) => `<svg viewBox="0 0 60 60" aria-hidden="true">${inner}</svg>`;
const ART = {
  bajuhujan: `<path d="M18 10 Q30 2 42 10 L46 20 Q52 24 54 36 L50 38 L46 30 V54 H14 V30 L10 38 L6 36 Q8 24 14 20 Z" fill="#F7D23E" stroke="#A07A0A" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M20 12 Q30 22 40 12" stroke="#A07A0A" stroke-width="2.2" fill="none"/><path d="M30 20 V54" stroke="#A07A0A" stroke-width="2"/>
    <g fill="#2F7DE1"><circle cx="34" cy="28" r="1.8"/><circle cx="34" cy="37" r="1.8"/><circle cx="34" cy="46" r="1.8"/></g>`,
  but: `<path d="M8 10 H22 V40 Q30 42 30 50 V54 H8 Z" fill="#F7D23E" stroke="#A07A0A" stroke-width="2.5" stroke-linejoin="round"/><path d="M8 48 H30" stroke="#A07A0A" stroke-width="2"/>
    <path d="M32 10 H46 V40 Q54 42 54 50 V54 H32 Z" fill="#F7D23E" stroke="#A07A0A" stroke-width="2.5" stroke-linejoin="round"/><path d="M32 48 H54" stroke="#A07A0A" stroke-width="2"/>
    <path d="M8 14 H22 M32 14 H46" stroke="#E2A812" stroke-width="3"/>`,
  cermin: `<path d="M6 26 Q6 20 12 20 H25 Q28 20 28 24 Q28 38 18 38 Q8 38 6 28 Z" fill="#2B2F36" stroke="#15181C" stroke-width="2"/>
    <path d="M54 26 Q54 20 48 20 H35 Q32 20 32 24 Q32 38 42 38 Q52 38 54 28 Z" fill="#2B2F36" stroke="#15181C" stroke-width="2"/>
    <path d="M28 25 Q30 22 32 25" stroke="#15181C" stroke-width="2.4" fill="none"/><path d="M6 24 L2 20 M54 24 L58 20" stroke="#15181C" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M11 25 L17 25 M37 25 L43 25" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".55"/>`,
  kipas: `<path d="M30 46 L6 22 Q30 0 54 22 Z" fill="#F28C8C" stroke="#A8262B" stroke-width="2.4" stroke-linejoin="round"/>
    <g stroke="#A8262B" stroke-width="1.6">${[-36, -18, 0, 18, 36].map((a) => { const r = Math.PI / 180 * (a - 90); return `<path d="M30 46 L${(30 + 30 * Math.cos(r)).toFixed(1)} ${(46 + 30 * Math.sin(r)).toFixed(1)}"/>`; }).join('')}</g>
    <path d="M12 24 Q30 12 48 24" stroke="#FFFDF5" stroke-width="2.4" fill="none" opacity=".8"/><path d="M30 46 V57" stroke="#7A4B25" stroke-width="4" stroke-linecap="round"/>`,
  // Wau (gaya wau bulan dipermudah): kepala, sayap lebar, ekor bulan sabit.
  wau: `<path d="M30 4 L40 14 L56 18 L40 24 L36 34 Q46 36 50 46 Q40 42 30 46 Q20 42 10 46 Q14 36 24 34 L20 24 L4 18 L20 14 Z" fill="#2F7DE1" stroke="#1A4F99" stroke-width="2.4" stroke-linejoin="round"/>
    <path d="M30 6 V46 M8 18 H52" stroke="#F5B82E" stroke-width="2.2"/><circle cx="30" cy="18" r="4" fill="#E5484D" stroke="#8E1F22" stroke-width="1.6"/>
    <path d="M30 46 Q26 52 30 58" stroke="#2B2F36" stroke-width="1.6" fill="none"/>`,
  kincir: `<path d="M30 30 V58" stroke="#7A4B25" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M30 30 L30 6 Q42 10 30 30 Z" fill="#E5484D" stroke="#8E1F22" stroke-width="2" stroke-linejoin="round"/>
    <path d="M30 30 L54 30 Q50 42 30 30 Z" fill="#2F7DE1" stroke="#1A4F99" stroke-width="2" stroke-linejoin="round"/>
    <path d="M30 30 L30 54 Q18 50 30 30 Z" fill="#F5B82E" stroke="#9A7208" stroke-width="2" stroke-linejoin="round"/>
    <path d="M30 30 L6 30 Q10 18 30 30 Z" fill="#22B26A" stroke="#13703F" stroke-width="2" stroke-linejoin="round"/><circle cx="30" cy="30" r="2.6" fill="#FFFDF5" stroke="#2B2F36" stroke-width="1.4"/>`,
  jaket: `<path d="M20 8 H40 L50 14 Q56 26 54 44 H48 L46 30 V54 H14 V30 L12 44 H6 Q4 26 10 14 Z" fill="#2F7DE1" stroke="#1A4F99" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M20 8 Q30 16 40 8" fill="#A9CBF2" stroke="#1A4F99" stroke-width="2"/><path d="M30 14 V54" stroke="#FFFDF5" stroke-width="2.2"/>
    <path d="M14 26 H46 M14 40 H46" stroke="#1A4F99" stroke-width="1.6" opacity=".6"/><rect x="6" y="40" width="7" height="5" rx="2" fill="#A9CBF2"/><rect x="47" y="40" width="7" height="5" rx="2" fill="#A9CBF2"/>`,
  sarung: `<path d="M8 50 V26 Q8 14 18 14 Q28 14 28 26 V50 Z" fill="#E5484D" stroke="#8E1F22" stroke-width="2.4" stroke-linejoin="round"/><path d="M8 26 Q2 22 4 16 Q8 14 10 20" fill="#E5484D" stroke="#8E1F22" stroke-width="2.2"/>
    <path d="M32 50 V26 Q32 14 42 14 Q52 14 52 26 V50 Z" fill="#E5484D" stroke="#8E1F22" stroke-width="2.4" stroke-linejoin="round"/><path d="M52 26 Q58 22 56 16 Q52 14 50 20" fill="#E5484D" stroke="#8E1F22" stroke-width="2.2"/>
    <path d="M8 44 H28 M32 44 H52" stroke="#FFFDF5" stroke-width="4"/>`,
};
const icon = (id) => (id in ART ? svg(ART[id]) : bendaIcon(id === 'airpanas' ? 'kopi' : id));

const ITEMS = {
  payung: { name: 'Payung', w: 'hujan' }, bajuhujan: { name: 'Baju hujan', w: 'hujan' }, but: { name: 'Kasut but', w: 'hujan' },
  topi: { name: 'Topi', w: 'panas' }, cermin: { name: 'Cermin mata hitam', w: 'panas' }, kipas: { name: 'Kipas', w: 'panas' },
  wau: { name: 'Wau', w: 'berangin' }, kincir: { name: 'Kincir angin', w: 'berangin' },
  jaket: { name: 'Jaket', w: 'sejuk' }, sarung: { name: 'Sarung tangan', w: 'sejuk' }, airpanas: { name: 'Air panas', w: 'sejuk' },
};
const IDS = Object.keys(ITEMS);
// Barang yang JELAS tak sesuai bagi setiap cuaca (barang yang boleh diperdebatkan, seperti topi semasa hujan, tidak ditawarkan).
const WRONG = {
  hujan: ['cermin', 'kipas', 'wau', 'kincir'],
  panas: ['bajuhujan', 'but', 'jaket', 'sarung'],
  berangin: ['payung', 'but', 'bajuhujan'],
  sejuk: ['cermin', 'kipas'],
};
const WEATHER = { hujan: 'Hujan', panas: 'Panas terik', berangin: 'Berangin', sejuk: 'Sejuk' };
const W_IDS = Object.keys(WEATHER);

// Kedudukan barang yang dipakai, dalam koordinat lukisan budak (viewBox 0 -24 100 184). [x, y, lebar] + garis tali/batang jika perlu.
const WEAR = {
  topi: [26, -9, 48], cermin: [31, 18, 38], kipas: [2, 72, 30],
  payung: [40, -24, 62, 'M74 31 L81 96'], bajuhujan: [14, 45, 72], but: [25, 118, 50],
  wau: [58, -22, 40, 'M78 18 Q90 60 81 96'], kincir: [4, 64, 32],
  jaket: [14, 45, 72], airpanas: [66, 82, 30],
  sarung: null, // dilukis sebagai dua sarung kecil di tangan
};
const MITTENS = `<g fill="#E5484D" stroke="#8E1F22" stroke-width="2"><rect x="12" y="92" width="16" height="18" rx="7"/><rect x="72" y="92" width="16" height="18" rx="7"/></g>`;

// need = bilangan barang betul yang perlu dipilih (0 = semua) · opts = bilangan pilihan
const LEVELS = [null,
  { opts: 2, need: 1 },
  { opts: 3, need: 1 },
  { opts: 4, need: 2 },
  { opts: 5, need: 0 },
];
const MAX_LEVEL = 4;
const AGE_LEVEL = { 3: 1, 4: 2, 5: 3, 6: 3 };
const TRIALS = 4, UP_AT = 3, DOWN_AT = 1;
const IDLE_MS = 10000;

const SKIN = '#D9A06F', INK = '#2B2F36';
function kidSVG() {
  return `<svg viewBox="0 -24 100 184" role="img" aria-label="Kawan kita">
    <ellipse cx="50" cy="154" rx="26" ry="4" fill="#000" opacity=".18"/>
    <path d="M40 106 V146 M60 106 V146" stroke="#3B4A6B" stroke-width="11" stroke-linecap="round"/>
    <g fill="#FFFDF5" stroke="${INK}" stroke-width="2"><ellipse cx="38" cy="149" rx="8" ry="5"/><ellipse cx="62" cy="149" rx="8" ry="5"/></g>
    <path d="M32 62 Q22 76 20 100 M68 62 Q78 76 80 100" stroke="${SKIN}" stroke-width="9" stroke-linecap="round" fill="none"/>
    <circle cx="20" cy="101" r="6" fill="${SKIN}"/><circle cx="80" cy="101" r="6" fill="${SKIN}"/>
    <path d="M30 58 Q50 52 70 58 L72 108 H28 Z" fill="#22B26A" stroke="#13703F" stroke-width="2.5" stroke-linejoin="round"/>
    <circle cx="50" cy="36" r="21" fill="${SKIN}"/>
    <path d="M29 34 Q28 12 50 12 Q72 12 71 34 Q64 22 50 22 Q36 22 29 34 Z" fill="#2B2420"/>
    <g class="cu-eyes"><circle cx="42" cy="37" r="2.6" fill="${INK}"/><circle cx="58" cy="37" r="2.6" fill="${INK}"/></g>
    <path class="cu-sad" d="M43 48 q7 -4 14 0" stroke="${INK}" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    <path class="cu-happy" d="M41 45 Q50 55 59 45 Z" fill="#8E2A2A" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
    <g class="cu-fx-hujan" fill="#6EC1F0" stroke="#2F7DE1" stroke-width="1"><path d="M30 10 q-3 5 0 7 q3 -2 0 -7z"/><path d="M68 6 q-3 5 0 7 q3 -2 0 -7z"/><path d="M50 2 q-3 5 0 7 q3 -2 0 -7z"/></g>
    <g class="cu-fx-panas" fill="#A9DBF3" stroke="#2F7DE1" stroke-width="1"><path d="M72 28 q-3 5 0 7 q3 -2 0 -7z"/><path d="M27 30 q-3 5 0 7 q3 -2 0 -7z"/></g>
    <g class="cu-fx-sejuk" stroke="#A9CBF2" stroke-width="2" stroke-linecap="round"><path d="M14 56 l-4 -3 M14 64 l-5 0 M86 56 l4 -3 M86 64 l5 0"/></g>
    <g class="cu-fx-berangin" stroke="#FFFDF5" stroke-width="2" stroke-linecap="round" fill="none" opacity=".9"><path d="M2 20 q10 -4 18 0 M0 30 q8 -3 14 0"/></g>
    <g class="cu-wear"></g>
  </svg>`;
}
function wornSVG(id) {
  if (id === 'sarung') return MITTENS;
  const [x, y, w, line] = WEAR[id];
  const s = icon(id).replace('<svg ', `<svg x="${x}" y="${y}" width="${w}" height="${w}" `);
  return (line ? `<path d="${line}" stroke="${id === 'wau' ? '#FFFDF5' : '#2B2F36'}" stroke-width="${id === 'wau' ? 1.4 : 3}" fill="none" stroke-linecap="round"/>` : '') + s;
}

export default {
  id: 'cuaca',
  title: 'Cuaca Hari Ini',
  stageLabel: 'Seorang kanak-kanak di luar rumah. Langit menunjukkan cuaca. Pilih barang yang sesuai untuk dipakai.',
  lines: {
    intro: 'Jom tengok cuaca! Tolong kawan kita bersiap ikut cuaca.',
    'c-hujan': 'Hari ni hujan!', 'c-panas': 'Hari ni panas terik!', 'c-berangin': 'Hari ni berangin!', 'c-sejuk': 'Hari ni sejuk!',
    satu: 'Apa dia perlu?', dua: 'Pilih dua barang.', semua: 'Pilih semua yang dia perlu.',
    'tak-sesuai': 'Hmm, tak sesuai untuk cuaca ni.', siap: 'Siap! Jom keluar main!',
    ...Object.fromEntries(IDS.map((id) => [`b-${id}`, ITEMS[id].name + '.'])),
  },
  recorded: ['intro', 'c-hujan', 'c-panas', 'c-berangin', 'c-sejuk', 'satu', 'dua', 'semua', 'tak-sesuai', 'siap', ...IDS.map((id) => `b-${id}`)],

  css: `.cu-sky > g { display: none; }
.stage[data-w="hujan"] .cu-sky .w-hujan, .stage[data-w="panas"] .cu-sky .w-panas, .stage[data-w="berangin"] .cu-sky .w-berangin, .stage[data-w="sejuk"] .cu-sky .w-sejuk { display: inline; }
.cu-rain path { animation: cu-fall 0.9s linear infinite; }
.cu-rain path:nth-child(3n) { animation-delay: -.3s; } .cu-rain path:nth-child(3n+1) { animation-delay: -.6s; }
@keyframes cu-fall { from { transform: translateY(-20px); } to { transform: translateY(30px); } }
.cu-sway { animation: cu-sway 1.6s ease-in-out infinite alternate; transform-origin: 50% 100%; transform-box: fill-box; }
@keyframes cu-sway { from { transform: rotate(-4deg); } to { transform: rotate(7deg); } }
.cu-kid { left: 27%; width: 46%; top: 17%; z-index: 3; }
.cu-kid svg { width: 100%; height: auto; display: block; overflow: visible; }
.cu-kid [class^="cu-fx-"], .cu-kid .cu-happy { display: none; }
.stage[data-w="hujan"] .cu-kid:not(.happy) .cu-fx-hujan, .stage[data-w="panas"] .cu-kid:not(.happy) .cu-fx-panas,
.stage[data-w="sejuk"] .cu-kid:not(.happy) .cu-fx-sejuk, .stage[data-w="berangin"] .cu-kid:not(.happy) .cu-fx-berangin { display: inline; }
.cu-kid.happy .cu-happy { display: inline; } .cu-kid.happy .cu-sad { display: none; }
.stage[data-w="sejuk"] .cu-kid:not(.happy) { animation: cu-shiver .18s linear infinite; }
@keyframes cu-shiver { 50% { transform: translateX(.8%); } }
.cu-opts { left: 2%; right: 2%; top: 76%; bottom: 3%; z-index: 4; display: flex; justify-content: center; align-items: center; gap: calc(var(--u) * 2); }
.cu-opt { width: 30%; aspect-ratio: 1; padding: 3%; border-radius: calc(var(--u) * 4.5); background: #FFFDF5; box-shadow: 0 calc(var(--u) * 1.2) 0 rgba(0,0,0,.2); transition: opacity .3s, transform .3s; }
.cu-opts[data-n="3"] .cu-opt { width: 27%; } .cu-opts[data-n="4"] .cu-opt { width: 22%; } .cu-opts[data-n="5"] .cu-opt { width: 18%; padding: 2%; }
.cu-opt svg { width: 100%; height: 100%; display: block; }
.cu-opt.dim { opacity: .3; } .cu-opt.used { opacity: 0; transform: scale(.4); }
.cu-opt:disabled { cursor: default; }
@media (prefers-reduced-motion: reduce) { .cu-rain path, .cu-sway, .stage[data-w="sejuk"] .cu-kid:not(.happy) { animation: none; } }`,

  stageHtml: () => `<svg class="bg cu-sky" viewBox="0 0 200 300" preserveAspectRatio="none" aria-hidden="true">
      <g class="w-hujan"><rect width="200" height="300" fill="#7E8C9C"/>
        <g fill="#5F6B78"><ellipse cx="50" cy="40" rx="44" ry="20"/><ellipse cx="90" cy="30" rx="36" ry="20"/><ellipse cx="150" cy="44" rx="48" ry="20"/></g>
        <g class="cu-rain" stroke="#CFE6F5" stroke-width="2" stroke-linecap="round">${Array.from({ length: 22 }, (_, i) => `<path d="M${(i * 37) % 196 + 4} ${70 + (i * 53) % 130} l-3 10"/>`).join('')}</g></g>
      <g class="w-panas"><rect width="200" height="300" fill="#7FCBF2"/>
        <circle cx="160" cy="40" r="22" fill="#FFD84D"/><g stroke="#FFD84D" stroke-width="4" stroke-linecap="round">${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => { const r = a * Math.PI / 180; return `<path d="M${(160 + 30 * Math.cos(r)).toFixed(1)} ${(40 + 30 * Math.sin(r)).toFixed(1)} L${(160 + 40 * Math.cos(r)).toFixed(1)} ${(40 + 40 * Math.sin(r)).toFixed(1)}"/>`; }).join('')}</g></g>
      <g class="w-berangin"><rect width="200" height="300" fill="#A6D8F0"/>
        <g fill="#fff" opacity=".9"><ellipse cx="40" cy="40" rx="26" ry="9"/><ellipse cx="150" cy="70" rx="30" ry="9"/></g>
        <g stroke="#fff" stroke-width="2.5" stroke-linecap="round" fill="none" opacity=".85"><path d="M10 100 q30 -10 60 0 q14 4 20 -4"/><path d="M110 120 q30 -10 70 0"/><path d="M30 150 q24 -8 50 0"/></g>
        <g class="cu-sway"><path d="M176 240 V170" stroke="#7A4B25" stroke-width="6"/><ellipse cx="176" cy="164" rx="22" ry="18" fill="#4FAE3E"/></g>
        <g fill="#5DBB46">${[[60, 130], [96, 112], [140, 140]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="5" ry="2.6" transform="rotate(-30 ${x} ${y})"/>`).join('')}</g></g>
      <g class="w-sejuk"><rect width="200" height="300" fill="#C9DCEB"/>
        <path d="M0 150 L50 80 L90 130 L140 60 L200 140 V240 H0 Z" fill="#8FA8BF"/><path d="M40 94 L50 80 L60 94 Z M130 74 L140 60 L150 74 Z" fill="#FFFDF5"/>
        <g fill="#fff" opacity=".6"><ellipse cx="60" cy="150" rx="70" ry="12"/><ellipse cx="160" cy="166" rx="60" ry="10"/></g></g>
      <rect y="240" width="200" height="60" fill="#6CB26A"/><rect y="236" width="200" height="6" fill="#5AA058"/>
    </svg>
    <div class="cu-kid">${kidSVG()}</div>
    <div class="cu-opts"></div>`,

  initState: (age) => ({ age, level: AGE_LEVEL[age], rounds: [] }),
  normalize(s, age) {
    if (s.age !== age) { s.age = age; s.level = AGE_LEVEL[age]; }
    if (!Number.isInteger(s.level) || s.level < 1 || s.level > MAX_LEVEL) s.level = AGE_LEVEL[age];
    return s;
  },

  async round(ctx) {
    const { stage, state, say, sfx, anim } = ctx;
    const kidEl = stage.querySelector('.cu-kid'), optsEl = stage.querySelector('.cu-opts');
    const level = state.level, L = LEVELS[level];

    async function trial(w, demo) {
      const good = IDS.filter((id) => ITEMS[id].w === w);
      const need = L.need || good.length;
      const nGood = L.need === 0 ? good.length : need;
      const goodPick = shuffle(good).slice(0, nGood);
      const bad = shuffle(WRONG[w]).slice(0, Math.max(1, L.opts - nGood));
      const opts = shuffle([...goodPick, ...bad]);

      kidEl.classList.remove('happy');
      kidEl.querySelector('.cu-wear').innerHTML = '';
      stage.dataset.w = w;
      stage.dataset.answer = goodPick.join(','); // untuk ujian automatik
      optsEl.dataset.n = String(opts.length);
      optsEl.innerHTML = opts.map((id) => `<button class="cu-opt" type="button" data-id="${id}" aria-label="${ITEMS[id].name}" disabled>${icon(id)}</button>`).join('');
      const cards = [...optsEl.querySelectorAll('.cu-opt')];
      const live = () => cards.filter((c) => !c.classList.contains('dim') && !c.classList.contains('used'));
      const arm = (on) => cards.forEach((c) => { c.disabled = !on || !live().includes(c); });
      const hint = () => { const c = live().find((x) => goodPick.includes(x.dataset.id)); if (!c) return; const r = ctx.toPct(c.getBoundingClientRect()); ctx.hand.show(r.left + r.width * .45, r.top + r.width * .35); };
      const ask = L.need === 1 ? 'satu' : L.need === 2 ? 'dua' : 'semua';

      sfx.pop();
      await ctx.wait(Math.max(1300, say(`c-${w}`) + 200));
      await ctx.wait(Math.max(900, say(ask) + 100));

      let got = 0, wrong = 0, wrongHere = 0;
      while (got < need) {
        if (demo && got === 0 && wrong === 0) hint();
        arm(true);
        const tap = await ctx.tap({ selector: '.cu-opt:not(.dim):not(.used)', ms: IDLE_MS });
        arm(false); ctx.hand.hide();
        if (!tap) { hint(); await ctx.wait(Math.max(900, say(ask) + 100)); continue; }
        const el = tap.el, id = el.dataset.id;
        if (ITEMS[id].w === w) {
          got++; wrongHere = 0;
          el.classList.add('used');
          sfx.light();
          const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          g.innerHTML = wornSVG(id);
          kidEl.querySelector('.cu-wear').appendChild(g);
          anim(g, [{ opacity: 0 }, { opacity: 1 }], { duration: 300 });
          await ctx.wait(Math.max(700, say(`b-${id}`) + 200));
          continue;
        }
        wrong++; wrongHere++;
        sfx.soft();
        anim(el, [{ transform: 'translateX(0)' }, { transform: 'translateX(-7%)' }, { transform: 'translateX(7%)' }, { transform: 'translateX(0)' }], { duration: 340, fill: 'none' });
        await ctx.wait(Math.max(700, say(`b-${id}`) + 150));
        el.classList.add('dim');
        await ctx.wait(Math.max(1200, say('tak-sesuai') + 100));
        if (wrongHere >= 2) hint();
      }
      // Siap: muka gembira, budak melompat.
      cards.forEach((c) => { if (!c.classList.contains('used')) c.classList.add('dim'); });
      kidEl.classList.add('happy');
      sfx.good();
      const d = say('siap');
      await anim(kidEl, [{ transform: 'translateY(0)' }, { transform: 'translateY(-6%)' }, { transform: 'translateY(0)' }, { transform: 'translateY(-4%)' }, { transform: 'translateY(0)' }], { duration: 900, fill: 'none' });
      ctx.alive();
      await ctx.wait(Math.max(400, d - 800));
      return { w, wrong, got };
    }

    const order = shuffle(W_IDS);
    if (ctx.first) { order.splice(order.indexOf('hujan'), 1); order.unshift('hujan'); }
    ctx.progress(TRIALS);
    await ctx.ready(); ctx.alive();
    stage.dataset.w = order[0];
    if (ctx.first) await ctx.wait(Math.max(3200, say('intro') + 200));
    const recs = [];
    for (let i = 0; i < TRIALS; i++) {
      recs.push(await trial(order[i], ctx.first && i === 0 && level === 1));
      ctx.mark(i);
      await ctx.wait(300);
    }
    delete stage.dataset.answer;

    const clean = recs.filter((r) => r.wrong === 0).length;
    if (clean >= UP_AT) state.level = Math.min(MAX_LEVEL, level + 1);
    else if (clean <= DOWN_AT) state.level = Math.max(1, level - 1);
    return {
      record: { level, n: recs.length, clean, errors: recs.reduce((a, r) => a + r.wrong, 0), miss: recs.filter((r) => r.wrong).map((r) => r.w) },
      foundHtml: ['payung', 'topi', 'wau', 'jaket'].map(icon).join(''),
      text: `Adik siapkan kawan untuk <span class="big-num">${recs.length}</span> jenis cuaca!` + (clean ? ` <span class="big-num">${clean}</span> tanpa silap.` : ''),
    };
  },

  parent: {
    stats(s) {
      const last = s.rounds.slice(-7);
      const okP = pct(last.reduce((a, r) => a + (r.clean || 0), 0), last.reduce((a, r) => a + (r.n || 0), 0));
      const misses = {};
      last.forEach((r) => (r.miss || []).forEach((w) => { misses[w] = (misses[w] || 0) + 1; }));
      const hardest = Object.entries(misses).sort((a, b) => b[1] - a[1])[0];
      return [
        { v: okP === null ? '–' : okP + '%', label: 'Cuaca tanpa silap' },
        { v: `${s.level}<small>/${MAX_LEVEL}</small>`, label: 'Tahap' },
        { v: hardest && WEATHER[hardest[0]] ? WEATHER[hardest[0]] : '–', label: 'Cuaca paling mencabar' },
      ];
    },
    cols: ['Tahap', 'Tanpa silap', 'Tersilap'],
    row: (r) => [r.level, meter(pct(r.clean, r.n)), (r.miss || []).filter((w) => WEATHER[w]).map((w) => WEATHER[w]).join(', ') || '–'],
    explain: `<span><b>Cuaca dan keperluan diri</b> (Sains Awal & Keterampilan Diri KSPK): mengenal cuaca dari petanda di langit, dan menaakul <b>sebab-akibat</b>: hujan → basah → perlu payung. Ini juga melatih anak bersiap sendiri.</span>
      <span>Tahap 1: pilih 1 daripada 2 · Tahap 2: 1 daripada 3 · Tahap 3: pilih 2 barang · Tahap 4: pilih semua barang yang sesuai daripada 5 (anak mesti tahu bila cukup). Hanya barang yang jelas salah ditawarkan sebagai pengganggu. Naik bila 3/4 cuaca tanpa silap.</span>`,
  },

  mission: {
    title: 'Jadi "pembaca cuaca" pagi ini',
    steps: [
      'Pagi ini, buka tingkap bersama anak dan tanya: <b>"Cuaca hari ni macam mana?"</b>',
      'Minta anak pilih sendiri apa perlu dibawa: payung, topi atau botol air.',
      'Bila hujan turun tiba-tiba, tanya: <b>"Apa kita perlu sekarang?"</b>',
      'Petang nanti, semak: <b>"Betul tak teka pagi tadi?"</b>',
    ],
    why: 'Kenapa? Bila anak sendiri memutuskan apa yang perlu dibawa, dia belajar memerhati, merancang dan menjaga diri, bukan sekadar menghafal nama cuaca.',
  },
};
