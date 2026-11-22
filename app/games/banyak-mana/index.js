// Banyak Mana?: perbandingan kuantiti ("rasa nombor" / approximate number sense).
// Dua dulang rambutan; anak pilih yang lebih banyak (atau lebih sedikit). Tahap tinggi: ditutup kain → menganggar, bukan mengira.
import { pick, shuffle, balanced, pct, meter } from '../../kit/util.js';
import { RAMBUTAN_SVG } from '../../kit/objects.js';

const TRIALS = 8;
// ratio = nisbah minimum besar/kecil (lebih kecil = lebih sukar). cover = ms sebelum kain menutup (0 = tiada).
const LEVELS = [null,
  { lo: 1, hi: 5, ratio: 2, both: false, cover: 0 },
  { lo: 1, hi: 6, ratio: 1.5, both: true, cover: 0 },
  { lo: 2, hi: 9, ratio: 1.34, both: true, cover: 2500 },
  { lo: 4, hi: 10, ratio: 1.25, both: true, cover: 2000 },
];
const MAX_LEVEL = 4;
const AGE_LEVEL = { 3: 1, 4: 2, 5: 2, 6: 3 };
const UP_AT = 7, DOWN_AT = 4; // daripada 8
const REMIND_MS = 8000, REMINDERS = 2;
const PRAISE = ['betul', 'hebat', 'bagus', 'pandainya'];
// Kedudukan calon buah dalam dulang (% dulang), dipilih rawak supaya susunan berbeza setiap kali.
const SPOTS = [[41, 12], [20, 22], [62, 22], [8, 42], [30, 38], [52, 38], [74, 42], [18, 60], [41, 58], [63, 60], [30, 76], [52, 76]];

function makePair(L) {
  for (;;) {
    const a = L.lo + Math.floor(Math.random() * (L.hi - L.lo + 1)), b = L.lo + Math.floor(Math.random() * (L.hi - L.lo + 1));
    if (a === b) continue;
    const r = Math.max(a, b) / Math.min(a, b);
    if (r >= L.ratio && (L.ratio >= 1.5 || r <= L.ratio * 1.6)) return [a, b];
  }
}

const TRAY_SVG = `<svg viewBox="0 0 100 100" aria-hidden="true">
  <circle cx="50" cy="52" r="48" fill="#0B2A1C" opacity=".18"/>
  <circle cx="50" cy="49" r="48" fill="#B8803F" stroke="#7A4E26" stroke-width="2.5"/>
  <circle cx="50" cy="49" r="41" fill="#D9A867"/>
  <g fill="none" stroke="#C08C4E" stroke-width="1.6" opacity=".8"><circle cx="50" cy="49" r="34"/><circle cx="50" cy="49" r="26"/><circle cx="50" cy="49" r="18"/><circle cx="50" cy="49" r="10"/></g>
</svg>`;
const CLOTH_SVG = `<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
  <rect x="2" y="2" width="96" height="96" rx="14" fill="#2F6FB0" stroke="#1E4B7A" stroke-width="3"/>
  <g fill="#F5B82E" opacity=".9"><circle cx="25" cy="25" r="6"/><circle cx="75" cy="25" r="6"/><circle cx="50" cy="50" r="8"/><circle cx="25" cy="75" r="6"/><circle cx="75" cy="75" r="6"/></g>
  <g fill="none" stroke="#FFFDF5" stroke-width="2" opacity=".7"><circle cx="50" cy="50" r="15"/><path d="M10 50 h20 M70 50 h20 M50 10 v20 M50 70 v20"/></g>
</svg>`;

export default {
  id: 'banyak-mana',
  title: 'Banyak Mana?',
  stageLabel: 'Dua dulang rambutan. Tekan dulang yang lebih banyak atau lebih sedikit, ikut soalan.',
  lines: {
    intro: 'Jom tengok dulang rambutan! Dengar soalan, kemudian tekan dulang.',
    'tanya-banyak': 'Mana lebih banyak?',
    'tanya-sedikit': 'Mana lebih sedikit?',
    'ini-banyak': 'Yang ni lebih banyak.',
    'ini-sedikit': 'Yang ni lebih sedikit.',
    cepat: 'Tengok cepat-cepat!',
  },
  recorded: ['intro', 'tanya-banyak', 'tanya-sedikit', 'ini-banyak', 'ini-sedikit', 'cepat'],

  css: `.bm-trays { inset: 0; }
.bm-tray { position: absolute; top: 38%; width: 44%; aspect-ratio: 1; padding: 0; z-index: 3; border-radius: 50%; }
.bm-tray > svg { width: 100%; height: auto; display: block; }
.bm-tray:disabled { cursor: default; }
.bm-tray:not(:disabled) { animation: wiggle 1.4s ease-in-out infinite; }
.bm-tray:not(:disabled):nth-child(2) { animation-delay: .5s; }
.bm-tray.right { box-shadow: 0 0 0 calc(var(--u) * 1.4) var(--kuning), 0 0 calc(var(--u) * 6) var(--kuning); }
.bm-item { position: absolute; width: 18%; pointer-events: none; }
.bm-item svg { width: 100%; height: auto; display: block; }
.bm-cloth { position: absolute; inset: -4%; z-index: 2; transform: translateY(-140%); opacity: 0; transition: transform .45s cubic-bezier(.3,1.3,.5,1), opacity .2s; pointer-events: none; }
.bm-cloth svg { width: 100%; height: 100%; display: block; }
.bm-tray.covered .bm-cloth { transform: translateY(0); opacity: 1; }
@media (prefers-reduced-motion: reduce) { .bm-tray:not(:disabled) { animation: none; } .bm-cloth { transition: none; } }`,

  stageHtml: () => `<svg class="bg" viewBox="0 0 200 300" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <pattern id="bm-weave" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="12" height="12" fill="#E8CF94"/><rect width="6" height="12" fill="#D9BC7C"/><rect y="6" width="12" height="1.4" fill="#C9A867" opacity=".6"/></pattern>
      </defs>
      <rect width="200" height="96" fill="#E9D7B4"/>
      <rect x="62" y="14" width="76" height="58" rx="4" fill="#9FD8EE" stroke="#8A5A32" stroke-width="5"/>
      <path d="M100 14 V72 M62 43 H138" stroke="#8A5A32" stroke-width="3"/>
      <g fill="#5DB36A" opacity=".8"><circle cx="76" cy="62" r="9"/><circle cx="124" cy="60" r="11"/></g>
      <rect y="92" width="200" height="8" fill="#8A5A32"/>
      <rect y="100" width="200" height="200" fill="#B5793F"/>
      <g stroke="#9C6634" stroke-width="1.4" opacity=".8"><path d="M0 130 H200 M0 162 H200 M0 194 H200 M0 226 H200 M0 258 H200 M0 290 H200"/><path d="M60 100 V130 M140 130 V162 M40 162 V194 M120 194 V226 M70 226 V258 M160 258 V290"/></g>
      <rect x="6" y="104" width="188" height="122" rx="4" fill="url(#bm-weave)" stroke="#B8954F" stroke-width="2"/>
      <rect x="6" y="104" width="188" height="122" rx="4" fill="none" stroke="#C0392B" stroke-width="3" stroke-dasharray="10 6" opacity=".55"/>
    </svg>
    <div class="bm-trays"></div>`,

  initState: (age) => ({ age, level: AGE_LEVEL[age], rounds: [] }),
  normalize(s, age) {
    if (s.age !== age) { s.age = age; s.level = AGE_LEVEL[age]; }
    if (!Number.isInteger(s.level) || s.level < 1 || s.level > MAX_LEVEL) s.level = AGE_LEVEL[age];
    return s;
  },

  async round(ctx) {
    const { stage, state, say, sfx } = ctx;
    const traysEl = stage.querySelector('.bm-trays');
    const level = state.level, L = LEVELS[level];
    const qs = L.both ? balanced(TRIALS).map((v) => (v ? 'sedikit' : 'banyak')) : Array(TRIALS).fill('banyak');

    const trayHtml = (n, i) => `<button class="bm-tray" type="button" data-i="${i}" style="left:${i ? 52 : 4}%" aria-label="Dulang ${i ? 'kanan' : 'kiri'}: ${n} rambutan" disabled>${TRAY_SVG}${
      shuffle(SPOTS).slice(0, n).map(([x, y]) => `<span class="bm-item" style="left:${x + (Math.random() * 4 - 2)}%;top:${y + (Math.random() * 4 - 2)}%">${RAMBUTAN_SVG}</span>`).join('')
    }<span class="bm-cloth">${CLOTH_SVG}</span></button>`;

    async function trial(q, demo) {
      const [a, b] = makePair(L);
      traysEl.innerHTML = trayHtml(a, 0) + trayHtml(b, 1);
      const trays = [...traysEl.querySelectorAll('.bm-tray')];
      const big = a > b ? 0 : 1, ok = q === 'banyak' ? big : 1 - big;
      sfx.pop();
      if (L.cover) {
        await ctx.wait(Math.max(900, say('cepat')));
        await ctx.wait(L.cover);
        trays.forEach((t) => t.classList.add('covered'));
        await ctx.wait(500);
      }
      await ctx.wait(Math.max(900, say('tanya-' + q) + 100));
      trays.forEach((t) => { t.disabled = false; }); // aktif selepas soalan
      if (demo) { const r = ctx.toPct(trays[ok].getBoundingClientRect()); ctx.hand.show(r.left + r.width * .4, r.top + r.width * .3); }
      const t0 = performance.now();
      let t = null;
      for (let r = 0; r <= REMINDERS && !t; r++) {
        t = await ctx.tap({ selector: '.bm-tray', ms: REMIND_MS });
        if (!t && r < REMINDERS) say('tanya-' + q);
      }
      ctx.hand.hide();
      trays.forEach((tr) => { tr.disabled = true; tr.classList.remove('covered'); });
      const chosen = t ? Number(t.el.dataset.i) : -1;
      const rec = { q, a, b, correct: chosen === ok, rt: t ? Math.round(performance.now() - t0) : null };
      trays[ok].classList.add('right');
      if (rec.correct) { sfx.good(); await ctx.wait(Math.max(1100, say(pick(PRAISE)) + 300)); }
      else {
        sfx.soft();
        const r = ctx.toPct(trays[ok].getBoundingClientRect()); ctx.hand.show(r.left + r.width * .4, r.top + r.width * .3);
        await ctx.wait(Math.max(1600, say('ini-' + q) + 400));
        ctx.hand.hide();
      }
      return rec;
    }

    ctx.progress(TRIALS);
    await ctx.ready(); ctx.alive();
    if (ctx.first) await ctx.wait(Math.max(1800, say('intro') + 200));
    const recs = [];
    for (let i = 0; i < TRIALS; i++) {
      recs.push(await trial(qs[i], ctx.first && i === 0 && level <= 2));
      ctx.mark(i);
      await ctx.wait(350);
    }

    const correct = recs.filter((r) => r.correct).length;
    if (correct >= UP_AT) state.level = Math.min(MAX_LEVEL, level + 1);
    else if (correct <= DOWN_AT) state.level = Math.max(1, level - 1);
    // Beza paling dekat yang dijawab betul (contoh 4 lwn 5): penunjuk ketajaman rasa nombor.
    const closest = recs.filter((r) => r.correct).sort((x, y) => Math.max(x.a, x.b) / Math.min(x.a, x.b) - Math.max(y.a, y.b) / Math.min(y.a, y.b))[0];
    return {
      record: { level, correct, n: recs.length, closest: closest ? [Math.min(closest.a, closest.b), Math.max(closest.a, closest.b)] : null },
      foundHtml: RAMBUTAN_SVG.repeat(correct),
      text: correct >= 6
        ? `Adik betul <span class="big-num">${correct}</span> daripada ${recs.length}! Mata adik tajam.`
        : `Adik betul <span class="big-num">${correct}</span> daripada ${recs.length}. Membanding memang perlu latihan. Main lagi, ya!`,
    };
  },

  parent: {
    stats(s) {
      const last = s.rounds.slice(-7);
      const okP = pct(last.reduce((a, r) => a + (r.correct || 0), 0), last.reduce((a, r) => a + (r.n || 0), 0));
      const best = s.rounds.map((r) => r.closest).filter(Boolean).sort((x, y) => x[1] / x[0] - y[1] / y[0])[0];
      return [
        { v: okP === null ? '–' : okP + '%', label: 'Betul' },
        { v: `${s.level}<small>/${MAX_LEVEL}</small>`, label: 'Tahap' },
        { v: best ? `${best[0]}<small> lwn </small>${best[1]}` : '–', label: 'Beza terkecil betul' },
      ];
    },
    cols: ['Tahap', 'Betul', 'Beza terkecil'],
    row: (r) => [r.level, meter(pct(r.correct, r.n)), r.closest ? `${r.closest[0]} lwn ${r.closest[1]}` : '–'],
    explain: `<span><b>Rasa nombor</b>: kebolehan membanding kuantiti tanpa mengira. Penyelidikan menunjukkan kemahiran ini membantu pembelajaran matematik di sekolah.</span>
      <span>Tahap 1: "lebih banyak", beza besar · Tahap 2: tambah "lebih sedikit" · Tahap 3–4: rambutan ditutup kain selepas 2–2.5 saat, jadi anak menganggar, dan bezanya makin kecil (contoh 4 lwn 5). Naik bila 7/8 betul, turun bila 4/8 atau kurang.</span>`,
  },

  mission: {
    title: 'Main "Mana Lebih Banyak?" di rumah',
    steps: [
      'Letak dua longgok kecil biskut, guli atau kancing. Tanya: <b>"Mana lebih banyak?"</b>',
      'Tukar soalan: <b>"Mana lebih sedikit?"</b> Perkataan "sedikit" selalunya lebih sukar.',
      'Bila dah senang, buat beza kecil (5 dan 6) dan minta anak teka dulu, kemudian kira untuk semak.',
      'Semasa makan: <b>"Pinggan siapa lebih banyak nasi?"</b>',
    ],
    why: 'Kenapa? Membanding kuantiti setiap hari membina "rasa nombor", asas untuk faham tambah, tolak dan nilai wang.',
  },
};
