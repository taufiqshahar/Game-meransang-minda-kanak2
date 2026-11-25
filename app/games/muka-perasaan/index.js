// Muka Perasaan: mengenal ekspresi emosi asas (literasi emosi, asas kawalan emosi dan empati).
// Sayf tanya "Mana muka X?"; anak tekan muka. Betul → Sayf namakan perasaan itu. Salah → Sayf namakan muka yang dipilih
// (tetap belajar), kemudian tanya semula. Turutan kesukaran ikut perkembangan: gembira/sedih → marah → terkejut → takut.
import { EMOTIONS, EMOTION_NAME, KIDS, faceSVG } from '../../kit/faces.js';
import { shuffle, pct, meter } from '../../kit/util.js';

const TRIALS = 6;
const LEVELS = [null,
  { emos: ['gembira', 'sedih'], cols: 2 },
  { emos: ['gembira', 'sedih', 'marah'], cols: 2 },
  { emos: ['gembira', 'sedih', 'marah', 'terkejut'], cols: 2 },
  { emos: EMOTIONS, cols: 3 },
];
const MAX_LEVEL = 4;
const AGE_LEVEL = { 3: 1, 4: 2, 5: 3, 6: 3 };
const UP_AT = 5, DOWN_AT = 3;
const IDLE_MS = 10000;

export default {
  id: 'muka-perasaan',
  title: 'Muka Perasaan',
  stageLabel: 'Muka kawan-kawan dengan perasaan berbeza. Tekan muka yang Sayf sebut.',
  lines: {
    intro: 'Jom kenal perasaan! Tengok muka kawan-kawan.',
    ...Object.fromEntries(EMOTIONS.map((e) => [`tanya-${e}`, `Mana muka ${e}?`])),
    ...Object.fromEntries(EMOTIONS.map((e) => [`ini-${e}`, `Ini muka ${e}${e === 'gembira' || e === 'terkejut' ? '!' : '.'}`])),
  },
  recorded: ['intro', ...EMOTIONS.map((e) => `tanya-${e}`), ...EMOTIONS.map((e) => `ini-${e}`)],

  css: `.mp-grid { left: 5%; right: 5%; top: 15%; bottom: 5%; z-index: 3; display: flex; flex-wrap: wrap; justify-content: center; align-content: center; gap: calc(var(--u) * 3); }
.mp-face { padding: 2%; border-radius: 50%; background: #FFFDF5; box-shadow: 0 calc(var(--u) * 1.2) 0 rgba(0,0,0,.18); aspect-ratio: 1; }
.mp-face svg { width: 100%; height: 100%; display: block; }
.mp-face:disabled { cursor: default; }
.mp-face.ok { box-shadow: 0 0 0 calc(var(--u) * 1.4) var(--kuning), 0 calc(var(--u) * 1.2) 0 rgba(0,0,0,.18); }
.mp-face.dim { opacity: .35; transition: opacity .3s; }
.mp-grid[data-n="2"] .mp-face { width: 44%; }
.mp-grid[data-n="3"] .mp-face, .mp-grid[data-n="4"] .mp-face { width: 41%; }
.mp-grid[data-n="5"] .mp-face { width: 29%; }`,

  stageHtml: () => `<svg class="bg" viewBox="0 0 200 300" preserveAspectRatio="none" aria-hidden="true">
      <rect width="200" height="300" fill="#FCE9B8"/>
      <rect y="232" width="200" height="68" fill="#E7B877"/>
      <g stroke="#D29A55" stroke-width="2">${[0, 1, 2, 3, 4].map((i) => `<path d="M0 ${246 + i * 13} H200"/>`).join('')}</g>
      <path d="M0 34 Q50 52 100 34 Q150 52 200 34" stroke="#8A5A1E" stroke-width="1.5" fill="none"/>
      ${[...Array(9)].map((_, i) => { const x = 8 + i * 23, y = 34 + Math.sin((i / 8) * Math.PI * 2) * 0 + (i % 4 === 1 || i % 4 === 2 ? 6 : 2); return `<path d="M${x} ${y} l7 0 -3.5 10 z" fill="${['#E5484D', '#22B26A', '#2F7DE1', '#F5B82E'][i % 4]}"/>`; }).join('')}
    </svg>
    <div class="mp-grid" aria-live="off"></div>`,

  initState: (age) => ({ age, level: AGE_LEVEL[age], rounds: [] }),
  normalize(s, age) {
    if (s.age !== age) { s.age = age; s.level = AGE_LEVEL[age]; }
    if (!Number.isInteger(s.level) || s.level < 1 || s.level > MAX_LEVEL) s.level = AGE_LEVEL[age];
    return s;
  },

  async round(ctx) {
    const { stage, state, say, sfx, anim } = ctx;
    const grid = stage.querySelector('.mp-grid');
    const level = state.level, L = LEVELS[level];

    // Sasaran seimbang: setiap perasaan muncul hampir sama kerap, tiada ulangan berturut-turut.
    const targets = [];
    while (targets.length < TRIALS) {
      const batch = shuffle(L.emos);
      if (targets.length && batch[0] === targets[targets.length - 1]) batch.push(batch.shift());
      targets.push(...batch);
    }
    targets.length = TRIALS;

    async function trial(target, demo) {
      const kids = shuffle(KIDS.map((_, i) => i));
      const emos = shuffle(L.emos);
      grid.dataset.n = String(emos.length);
      grid.innerHTML = emos.map((e, i) => `<button class="mp-face" type="button" data-emo="${e}" aria-label="Muka ${EMOTION_NAME[e].toLowerCase()}" disabled>${faceSVG(kids[i], e)}</button>`).join('');
      const faces = [...grid.querySelectorAll('.mp-face')];
      const correctBtn = faces.find((f) => f.dataset.emo === target);
      const arm = (on) => faces.forEach((f) => { f.disabled = !on; });
      const hint = () => { const r = ctx.toPct(correctBtn.getBoundingClientRect()); ctx.hand.show(r.left + r.width * .45, r.top + r.width * .35); };
      stage.dataset.target = target; // untuk ujian automatik
      sfx.pop();
      await ctx.wait(450);
      await ctx.wait(Math.max(1000, say(`tanya-${target}`) + 100));

      let wrong = 0;
      for (;;) {
        if (demo && wrong === 0) hint();
        arm(true);
        const t = await ctx.tap({ selector: '.mp-face', ms: IDLE_MS });
        arm(false); ctx.hand.hide();
        if (!t) { hint(); await ctx.wait(Math.max(1000, say(`tanya-${target}`) + 100)); continue; }
        const picked = t.el.dataset.emo;
        if (picked === target) {
          t.el.classList.add('ok'); faces.forEach((f) => { if (f !== t.el) f.classList.add('dim'); });
          sfx.good();
          anim(t.el, [{ transform: 'scale(1)' }, { transform: 'scale(1.1)' }, { transform: 'scale(1)' }], { duration: 450, fill: 'none' });
          await ctx.wait(Math.max(1100, say(`ini-${target}`) + 200));
          break;
        }
        wrong++;
        sfx.soft();
        anim(t.el, [{ transform: 'translateX(0)' }, { transform: 'translateX(-5%)' }, { transform: 'translateX(5%)' }, { transform: 'translateX(0)' }], { duration: 360, fill: 'none' });
        // Namakan muka yang dipilih: salah pun tetap belajar satu perkataan perasaan.
        await ctx.wait(Math.max(1000, say(`ini-${picked}`) + 250));
        if (wrong >= 2) hint();
        await ctx.wait(Math.max(1000, say(`tanya-${target}`) + 100));
      }
      return { target, correct: wrong === 0 };
    }

    ctx.progress(TRIALS);
    await ctx.ready(); ctx.alive();
    if (ctx.first) await ctx.wait(Math.max(2400, say('intro') + 200));
    const recs = [];
    for (let i = 0; i < TRIALS; i++) {
      recs.push(await trial(targets[i], ctx.first && i === 0 && level === 1));
      ctx.mark(i);
      await ctx.wait(300);
    }
    delete stage.dataset.target;

    const correct = recs.filter((r) => r.correct).length;
    if (correct >= UP_AT) state.level = Math.min(MAX_LEVEL, level + 1);
    else if (correct <= DOWN_AT) state.level = Math.max(1, level - 1);
    const seen = [...new Set(recs.map((r) => r.target))];
    return {
      record: { level, correct, n: recs.length, miss: recs.filter((r) => !r.correct).map((r) => r.target) },
      foundHtml: seen.map((e, i) => faceSVG(i, e)).join(''),
      text: `Adik kenal <span class="big-num">${seen.length}</span> perasaan! Betul pada kali pertama: <span class="big-num">${correct}</span> daripada ${recs.length}.`,
    };
  },

  parent: {
    stats(s) {
      const last = s.rounds.slice(-7);
      const okP = pct(last.reduce((a, r) => a + (r.correct || 0), 0), last.reduce((a, r) => a + (r.n || 0), 0));
      const misses = {};
      last.forEach((r) => (r.miss || []).forEach((e) => { misses[e] = (misses[e] || 0) + 1; }));
      const hardest = Object.entries(misses).sort((a, b) => b[1] - a[1])[0];
      return [
        { v: okP === null ? '–' : okP + '%', label: 'Betul kali pertama' },
        { v: `${s.level}<small>/${MAX_LEVEL}</small>`, label: 'Tahap' },
        { v: hardest && EMOTION_NAME[hardest[0]] ? EMOTION_NAME[hardest[0]] : '–', label: 'Perasaan paling mencabar' },
      ];
    },
    cols: ['Tahap', 'Betul', 'Tersilap'],
    row: (r) => [r.level, meter(pct(r.correct, r.n)), (r.miss || []).filter((e) => EMOTION_NAME[e]).map((e) => EMOTION_NAME[e]).join(', ') || '–'],
    explain: `<span><b>Literasi emosi</b>: mengenal dan menamakan perasaan pada muka. Ini langkah pertama untuk mengawal emosi sendiri dan memahami kawan. Kanak-kanak biasanya kenal <i>gembira</i> dan <i>sedih</i> dahulu (umur 2–3), kemudian <i>marah</i>, dan <i>takut</i>/<i>terkejut</i> paling lewat (sering keliru sehingga umur 5–6).</span>
      <span>Tahap 1: gembira, sedih · Tahap 2: + marah · Tahap 3: + terkejut · Tahap 4: + takut. Bila anak tersilap, Sayf menamakan muka yang dipilih supaya anak tetap belajar. Naik bila 5/6 betul kali pertama.</span>`,
  },

  mission: {
    title: 'Main "Muka Cermin"',
    steps: [
      'Duduk depan cermin bersama anak. Buat muka gembira, kemudian sedih, dan minta anak tiru.',
      'Tanya: <b>"Bila adik rasa sedih?"</b> Dengar tanpa membetulkan.',
      'Semasa membaca buku atau menonton, berhenti dan tanya: <b>"Kawan ni rasa apa?"</b>',
      'Namakan perasaan anak sendiri: <b>"Adik nampak marah sebab mainan jatuh."</b>',
    ],
    why: 'Kenapa? Anak yang boleh menamakan perasaan lebih mudah menenangkan diri dan berkawan. Menamakan perasaan ("name it to tame it") membantu otak anak mengawal emosi.',
  },
};
