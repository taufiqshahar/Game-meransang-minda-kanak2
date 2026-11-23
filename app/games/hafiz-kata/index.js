// Hafiz Kata: kawalan diri auditori (versi "Simon Says"). Tekan bentuk hanya bila arahan bermula dengan "Hafiz kata…".
// Berbeza daripada Lampu Isyarat (isyarat visual): di sini peraturan datang daripada bahasa, jadi anak mesti mendengar
// keseluruhan ayat dan menahan diri bila awalan tiada. Tahap rendah: muka Hafiz bercahaya sebagai bantuan visual.
import { faceSVG } from '../../kit/faces.js';
import { shuffle, pct, meter } from '../../kit/util.js';

const SHAPES = {
  bintang: { line: 'tekan-bintang', name: 'Bintang', svg: `<svg viewBox="0 0 60 60" aria-hidden="true"><path d="M30 5 L37 22 L55 23 L41 35 L46 53 L30 43 L14 53 L19 35 L5 23 L23 22 Z" fill="#F5B82E" stroke="#B7860F" stroke-width="3" stroke-linejoin="round"/></svg>` },
  bulat: { line: 'tekan-bulat', name: 'Bulatan', svg: `<svg viewBox="0 0 60 60" aria-hidden="true"><circle cx="30" cy="30" r="23" fill="#2F7DE1" stroke="#1A4F99" stroke-width="3"/></svg>` },
  hati: { line: 'tekan-hati', name: 'Hati', svg: `<svg viewBox="0 0 60 60" aria-hidden="true"><path d="M30 52 Q6 36 6 21 Q6 9 18 9 Q26 9 30 17 Q34 9 42 9 Q54 9 54 21 Q54 36 30 52 Z" fill="#E5484D" stroke="#8E1F22" stroke-width="3" stroke-linejoin="round"/></svg>` },
  segitiga: { line: 'tekan-segitiga', name: 'Segi tiga', svg: `<svg viewBox="0 0 60 60" aria-hidden="true"><path d="M30 6 L55 52 H5 Z" fill="#22B26A" stroke="#178A50" stroke-width="3" stroke-linejoin="round"/></svg>` },
};
const IDS = Object.keys(SHAPES);
// shapes = bilangan bentuk, win = tetingkap jawapan (ms), cue = muka Hafiz bercahaya bila "Hafiz kata".
const LEVELS = [null,
  { shapes: 2, win: 4500, cue: true },
  { shapes: 3, win: 4000, cue: true },
  { shapes: 4, win: 3500, cue: false },
  { shapes: 4, win: 3000, cue: false },
];
const MAX_LEVEL = 4;
const AGE_LEVEL = { 3: 1, 4: 1, 5: 2, 6: 3 };
const GO = 6, NOGO = 4;

export default {
  id: 'hafiz-kata',
  title: 'Hafiz Kata',
  stageLabel: 'Bentuk berwarna. Tekan bentuk hanya bila Hafiz kata "Hafiz kata". Kalau tidak, jangan tekan.',
  lines: {
    intro: 'Jom main Hafiz Kata! Tekan hanya bila Hafiz kata.',
    hk: 'Hafiz kata…',
    'tekan-bintang': 'Tekan bintang!',
    'tekan-bulat': 'Tekan bulatan!',
    'tekan-hati': 'Tekan hati!',
    'tekan-segitiga': 'Tekan segi tiga!',
    'tak-kata': 'Eh, Hafiz tak kata. Jangan tekan, ya.',
    'pandai-tahan': 'Pandai tahan!',
  },
  recorded: ['intro', 'hk', 'tekan-bintang', 'tekan-bulat', 'tekan-hati', 'tekan-segitiga', 'tak-kata', 'pandai-tahan'],

  css: `.hk-face { left: 36%; width: 28%; top: 13%; aspect-ratio: 1; z-index: 3; border-radius: 50%; background: #FFFDF5; padding: 1%;
  box-shadow: 0 calc(var(--u) * 1.2) 0 rgba(0,0,0,.2); transition: box-shadow .2s, transform .2s; }
.hk-face svg { width: 100%; height: 100%; display: block; }
.hk-face.on { box-shadow: 0 0 0 calc(var(--u) * 2) var(--kuning), 0 0 calc(var(--u) * 8) var(--kuning); transform: scale(1.08); }
.hk-grid { left: 5%; right: 5%; top: 40%; bottom: 4%; z-index: 3; display: flex; flex-wrap: wrap; justify-content: center; align-content: center; gap: calc(var(--u) * 3.5); }
.hk-shape { width: 40%; aspect-ratio: 1; border-radius: calc(var(--u) * 5); background: #FFFDF5; padding: 5%; box-shadow: 0 calc(var(--u) * 1.3) 0 rgba(0,0,0,.22); }
.hk-grid[data-n="3"] .hk-shape, .hk-grid[data-n="4"] .hk-shape { width: 38%; }
.hk-shape svg { width: 100%; height: 100%; display: block; }
.hk-shape.hit { box-shadow: 0 0 0 calc(var(--u) * 1.4) var(--kuning), 0 calc(var(--u) * 1.3) 0 rgba(0,0,0,.22); }
.hk-shape.show { animation: hk-pulse .5s ease-in-out 3; }
@keyframes hk-pulse { 50% { transform: scale(1.08); } }
.hk-timer { left: 10%; right: 10%; top: 37%; height: 1.2%; z-index: 3; border-radius: 99px; background: rgba(255,255,255,.35); overflow: hidden; }
.hk-timer i { display: block; height: 100%; width: 100%; background: var(--kertas); transform-origin: left; }
@media (prefers-reduced-motion: reduce) { .hk-shape.show { animation: none; } }`,

  stageHtml: () => `<svg class="bg" viewBox="0 0 200 300" preserveAspectRatio="none" aria-hidden="true">
      <rect width="200" height="300" fill="#2B8A6E"/>
      <g fill="#33997B">${[0, 1, 2, 3, 4, 5, 6].map((i) => `<circle cx="${i * 34}" cy="${i % 2 ? 40 : 100}" r="26"/>`).join('')}</g>
      <rect y="108" width="200" height="192" fill="#24785F"/>
    </svg>
    <div class="hk-face" aria-hidden="true">${faceSVG(0, 'gembira')}</div>
    <div class="hk-timer" aria-hidden="true"><i></i></div>
    <div class="hk-grid"></div>`,

  initState: (age) => ({ age, level: AGE_LEVEL[age], rounds: [] }),
  normalize(s, age) {
    if (s.age !== age) { s.age = age; s.level = AGE_LEVEL[age]; }
    if (!Number.isInteger(s.level) || s.level < 1 || s.level > MAX_LEVEL) s.level = AGE_LEVEL[age];
    return s;
  },

  async round(ctx) {
    const { stage, state, say, sfx, anim } = ctx;
    const face = stage.querySelector('.hk-face'), grid = stage.querySelector('.hk-grid'), bar = stage.querySelector('.hk-timer i');
    const level = state.level, L = LEVELS[level];
    const shapes = shuffle(IDS).slice(0, L.shapes);
    grid.dataset.n = String(L.shapes);
    grid.innerHTML = shapes.map((id) => `<button class="hk-shape" type="button" data-id="${id}" aria-label="${SHAPES[id].name}" disabled>${SHAPES[id].svg}</button>`).join('');
    const btns = [...grid.querySelectorAll('.hk-shape')];
    const arm = (on) => btns.forEach((b) => { b.disabled = !on; });

    // Turutan: latihan (2 "Hafiz kata" dahulu bila kali pertama), kemudian campuran tanpa > 2 tahan berturut-turut.
    let seq;
    do { seq = shuffle([...Array(GO).fill(true), ...Array(NOGO).fill(false)]); }
    while (seq.some((g, i) => i > 1 && !g && !seq[i - 1] && !seq[i - 2]) || (ctx.first && (!seq[0] || !seq[1])));

    async function trial(go, demo) {
      const id = shapes[Math.floor(Math.random() * shapes.length)];
      const target = btns.find((b) => b.dataset.id === id);
      stage.dataset.cmd = `${go ? 1 : 0}:${id}`; // untuk ujian automatik
      btns.forEach((b) => b.classList.remove('hit', 'show'));
      bar.getAnimations().forEach((a) => a.cancel()); bar.style.transform = 'scaleX(1)';
      await ctx.wait(500);
      if (go) {
        if (L.cue) face.classList.add('on');
        await ctx.wait(say('hk') + 60);
      }
      const d = say(SHAPES[id].line);
      ctx.caption(`${go ? 'Hafiz kata… ' : ''}Tekan ${SHAPES[id].name.toLowerCase()}!`);
      await ctx.wait(Math.max(500, d - 150));
      if (demo) { const r = ctx.toPct(target.getBoundingClientRect()); ctx.hand.show(r.left + r.width * .45, r.top + r.width * .25); }
      // Tetingkap jawapan: bar masa mengecil.
      arm(true);
      bar.animate([{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }], { duration: L.win, fill: 'forwards' });
      const t0 = performance.now();
      const t = await ctx.tap({ selector: '.hk-shape', ms: L.win });
      arm(false); ctx.hand.hide(); face.classList.remove('on');
      bar.getAnimations().forEach((a) => a.pause());
      const rt = t ? Math.round(t.t - t0) : null;

      if (go) {
        if (t && t.el === target) { t.el.classList.add('hit'); sfx.good(); await ctx.wait(650); return { go, ok: true, rt }; }
        if (t) { sfx.soft(); }
        // Terlepas atau bentuk lain: tunjuk bentuk yang betul tanpa teguran.
        target.classList.add('show');
        await ctx.wait(Math.max(900, say('tengok') + 300));
        return { go, ok: false, wrongShape: !!t };
      }
      if (!t) { sfx.light(); await ctx.wait(Math.max(900, say('pandai-tahan') + 150)); return { go, ok: true }; }
      sfx.soft();
      await ctx.wait(Math.max(1800, say('tak-kata') + 200));
      return { go, ok: false };
    }

    ctx.progress(seq.length);
    await ctx.ready(); ctx.alive();
    if (ctx.first) await ctx.wait(Math.max(2800, say('intro') + 200));
    const recs = [];
    for (let i = 0; i < seq.length; i++) {
      recs.push(await trial(seq[i], ctx.first && i === 0 && level === 1));
      ctx.mark(i);
    }
    ctx.caption('');
    delete stage.dataset.cmd;

    const goR = recs.filter((r) => r.go), noR = recs.filter((r) => !r.go);
    const hits = goR.filter((r) => r.ok).length, holds = noR.filter((r) => r.ok).length;
    const hitP = hits / goR.length, holdP = holds / noR.length;
    if (hitP >= .8 && holdP >= .75) state.level = Math.min(MAX_LEVEL, level + 1);
    else if (hitP < .5 || holdP < .5) state.level = Math.max(1, level - 1);
    const rts = goR.filter((r) => r.ok && r.rt).map((r) => r.rt);
    return {
      record: { level, hits, go: goR.length, holds, nogo: noR.length, rt: rts.length ? Math.round(rts.reduce((a, b) => a + b, 0) / rts.length) : null },
      foundHtml: shapes.map((id) => `<span style="display:inline-block;width:44px">${SHAPES[id].svg}</span>`).join(''),
      text: `Adik ikut <span class="big-num">${hits}</span> arahan dan berjaya tahan <span class="big-num">${holds}</span> kali daripada ${noR.length}!`,
    };
  },

  parent: {
    stats(s) {
      const last = s.rounds.slice(-7);
      const holdP = pct(last.reduce((a, r) => a + (r.holds || 0), 0), last.reduce((a, r) => a + (r.nogo || 0), 0));
      const hitP = pct(last.reduce((a, r) => a + (r.hits || 0), 0), last.reduce((a, r) => a + (r.go || 0), 0));
      return [
        { v: holdP === null ? '–' : holdP + '%', label: 'Berjaya menahan diri' },
        { v: hitP === null ? '–' : hitP + '%', label: 'Ikut arahan "Hafiz kata"' },
        { v: `${s.level}<small>/${MAX_LEVEL}</small>`, label: 'Tahap' },
      ];
    },
    cols: ['Tahap', 'Tahan', 'Ikut'],
    row: (r) => [r.level, meter(pct(r.holds, r.nogo)), meter(pct(r.hits, r.go))],
    explain: `<span><b>Kawalan diri auditori</b>: mendengar keseluruhan ayat dan menahan diri bila peraturan tidak dipenuhi. Ini kemahiran yang sama digunakan bila cikgu berkata "Tunggu sampai cikgu kata mula." Budak 3 tahun biasanya sukar menahan; kemajuan besar berlaku antara umur 4 dan 6.</span>
      <span>Tahap 1–2: 2–3 bentuk, muka Hafiz bercahaya bila "Hafiz kata" · Tahap 3–4: 4 bentuk, dengar sahaja, masa menjawab lebih singkat. Naik bila ≥ 80% ikut dan ≥ 75% berjaya tahan.</span>`,
  },

  mission: {
    title: 'Main "Ibu Kata" sekeluarga',
    steps: [
      'Bergilir jadi ketua: <b>"Ibu kata, sentuh hidung!"</b> → buat. <b>"Sentuh kepala!"</b> → jangan buat.',
      'Mula perlahan, dengan banyak "Ibu kata". Bila anak dah biasa, tambah arahan tanpa "Ibu kata".',
      'Kalau tersilap, ketawa bersama. Tiada siapa yang "kalah".',
      'Biar anak pula jadi ketua; mereka belajar peraturan dengan lebih mendalam bila mengajar.',
    ],
    why: 'Kenapa? Permainan ini melatih anak berhenti seketika dan berfikir sebelum bertindak, kemahiran utama untuk belajar di dalam kelas.',
  },
};
