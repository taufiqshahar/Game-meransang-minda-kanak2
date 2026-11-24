// Tambah Buah: tambah sebagai "menggabungkan" (asas operasi tambah). Bakul besar ada A buah, bakul kecil ada B buah.
// Anak tekan setiap buah di bakul kecil untuk memindahkannya ke bakul besar, kemudian pilih jumlah.
// Bakul besar ialah bingkai sepuluh (2 baris × 5) supaya anak nampak struktur 5 dan 10.
// Perkembangan strategi: kira semua (T1) → Hafiz kira terus dari A (T2) → anak kira sendiri (T3)
// → bakul besar ditutup, hanya nombor A kelihatan: anak mesti "kira terus" dari A (T4).
import { RAMBUTAN_SVG } from '../../kit/objects.js';
import { itemIcon } from '../../kit/pasar.js';
import { bendaIcon } from '../../kit/benda.js';
import { shuffle, pct, meter } from '../../kit/util.js';

const FRUITS = { rambutan: () => RAMBUTAN_SVG, pisang: () => itemIcon('pisang'), epal: () => bendaIcon('epal'), nanas: () => itemIcon('nanas') };
const FRUIT_IDS = Object.keys(FRUITS);

const TRIALS = 5;
// a/b = julat bilangan dalam bakul besar/kecil · max = jumlah maksimum · count = Hafiz kira semasa memindah
// countAll = Hafiz kira bakul besar satu-satu dahulu · lid = bakul besar ditutup · opts = bilangan pilihan · dots = titik pada kad
const LEVELS = [null,
  { a: [1, 2], b: [1, 2], min: 2, max: 3, count: true, countAll: true, lid: false, opts: 2, dots: true },
  { a: [1, 4], b: [1, 3], min: 3, max: 5, count: true, countAll: false, lid: false, opts: 3, dots: true },
  { a: [2, 5], b: [1, 4], min: 4, max: 7, count: false, countAll: false, lid: false, opts: 3, dots: false },
  { a: [3, 7], b: [1, 3], min: 5, max: 10, count: false, countAll: false, lid: true, opts: 3, dots: false },
];
const MAX_LEVEL = 4;
const AGE_LEVEL = { 3: 1, 4: 2, 5: 3, 6: 3 };
const UP_AT = 4, DOWN_AT = 2;
const IDLE_MS = 10000;
const PRAISE = ['hebat', 'bagus', 'pandainya'];

// Kedudukan (% pentas, penjuru kiri atas). Buah: lebar 10% (tinggi 6.7% pentas).
const FW = 10;
const A_SLOTS = [...Array(10)].map((_, i) => [5.5 + (i % 5) * 10.2, 22 + Math.floor(i / 5) * 10.5]);
const B_SLOTS = [...Array(4)].map((_, i) => [67 + (i % 2) * 13, 22 + Math.floor(i / 2) * 10.5]);
const rnd = ([lo, hi]) => lo + Math.floor(Math.random() * (hi - lo + 1));
const dots = (n) => `<span class="tb-dots">${'<i></i>'.repeat(n)}</span>`;

export default {
  id: 'tambah-buah',
  title: 'Tambah Buah',
  stageLabel: 'Dua bakul buah. Tekan buah di bakul kecil untuk masukkan ke bakul besar, kemudian pilih jumlahnya.',
  lines: {
    intro: 'Jom tambah buah! Kita campur dua bakul jadi satu.',
    ada: 'Bakul ini ada…',
    tambah: 'Tambah lagi…',
    masuk: 'Tekan buah, masukkan dalam bakul besar.',
    berapa: 'Semua ada berapa?',
    semua: 'Betul! Semua ada…',
    tutup: 'Bakul ditutup. Mula kira dari nombor ini.',
    kira: 'Jom kira sama-sama.',
  },
  recorded: ['intro', 'ada', 'tambah', 'masuk', 'berapa', 'semua', 'tutup', 'kira'],

  css: `.tb-basket { z-index: 2; pointer-events: none; }
.tb-basket svg { width: 100%; height: 100%; display: block; }
.tb-a { left: 3%; width: 56%; top: 15%; height: 33%; }
.tb-b { left: 64%; width: 33%; top: 15%; height: 33%; }
.tb-plus { left: 58.6%; top: 27%; width: 6%; z-index: 3; text-align: center; pointer-events: none;
  font-family: var(--font-display); font-weight: 700; font-size: calc(var(--u) * 10); color: var(--kertas); text-shadow: 0 calc(var(--u) * .6) 0 rgba(0,0,0,.25); }
.tb-fruits { inset: 0; pointer-events: none; }
.tb-fruit { position: absolute; pointer-events: auto; width: ${FW}%; aspect-ratio: 1; padding: 0; z-index: 4; border-radius: 50%; transition: left .45s ease-in-out, top .45s ease-in-out, opacity .3s; }
.tb-fruit svg { width: 100%; height: 100%; display: block; }
.tb-fruit:disabled { cursor: default; }
.tb-fruit.inb:not(:disabled) { animation: tb-bob 1.4s ease-in-out infinite; }
.tb-fruit.inb:nth-child(2n):not(:disabled) { animation-delay: .35s; }
@keyframes tb-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10%); } }
.tb-fruit.glow { filter: drop-shadow(0 0 calc(var(--u) * 1.4) #FFF3B0); transform: scale(1.18); transition: transform .15s; }
.tb-fruit.under { opacity: 0; }
.tb-lid { left: 3%; width: 56%; top: 15%; height: 33%; z-index: 5; display: grid; place-items: center; pointer-events: none;
  transition: transform .5s ease-in-out, opacity .5s; }
.tb-lid svg { position: absolute; inset: 0; width: 100%; height: 100%; }
.tb-lid b { position: relative; font-family: var(--font-display); font-weight: 700; font-size: calc(var(--u) * 17); color: var(--ink);
  background: var(--kertas); border-radius: 50%; width: calc(var(--u) * 24); height: calc(var(--u) * 24); display: grid; place-items: center;
  box-shadow: 0 0 0 calc(var(--u) * 1.2) #A8672E; }
.tb-lid.off { transform: translateY(-75%) rotate(-8deg); opacity: 0; }
.tb-nums { left: 5%; right: 5%; top: 60%; bottom: 9%; z-index: 3; display: flex; justify-content: center; align-items: center; gap: calc(var(--u) * 4); }
.tb-num { width: 28%; height: 100%; max-height: calc(var(--u) * 42); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: calc(var(--u) * 2);
  background: var(--kertas); color: var(--ink); border-radius: calc(var(--u) * 5); box-shadow: 0 calc(var(--u) * 1.2) 0 rgba(0,0,0,.2);
  font-family: var(--font-display); font-weight: 700; font-size: calc(var(--u) * 15); line-height: 1; transition: opacity .3s; }
.tb-nums[data-n="2"] .tb-num { width: 34%; }
.tb-num:disabled { cursor: default; }
.tb-num.right { background: var(--hijau); color: var(--kertas); }
.tb-num.right .tb-dots i { background: var(--kertas); }
.tb-num.dim { opacity: .3; }
.tb-num[hidden] { display: none; }
.tb-dots { display: flex; flex-wrap: wrap; justify-content: center; gap: calc(var(--u) * .8); width: calc(var(--u) * 14.4); }
.tb-dots i { width: calc(var(--u) * 2.1); height: calc(var(--u) * 2.1); border-radius: 50%; background: #C8303A; }
@media (prefers-reduced-motion: reduce) { .tb-fruit.inb:not(:disabled) { animation: none; } .tb-fruit, .tb-lid { transition: none; } }`,

  stageHtml: () => {
    // Bakul anyaman. Bakul besar ada 10 lekuk (bingkai sepuluh).
    const weave = (w, h) => `<rect x="2" y="2" width="${w - 4}" height="${h - 4}" rx="10" fill="#D79A55" stroke="#8C5A26" stroke-width="3"/>
      <g stroke="#B97A3A" stroke-width="1.6" opacity=".7">${[...Array(Math.floor(w / 9))].map((_, i) => `<path d="M${8 + i * 9} 6 V${h - 6}"/>`).join('')}</g>
      <rect x="2" y="2" width="${w - 4}" height="9" rx="4" fill="#A8672E"/>`;
    const frame = [...Array(10)].map((_, i) => {
      const [x, y] = A_SLOTS[i];
      // tukar % pentas ke unit kotak bakul (bakul: kiri 3%, lebar 56%; atas 15%, tinggi 33%)
      const cx = ((x + FW / 2 - 3) / 56) * 112, cy = ((y + FW / 3 - 15) / 33) * 66;
      return `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="8.4" fill="#B97A3A" opacity=".55"/>`;
    }).join('');
    return `<svg class="bg" viewBox="0 0 200 300" preserveAspectRatio="none" aria-hidden="true">
      <rect width="200" height="300" fill="#9ED7A9"/>
      <rect width="200" height="38" fill="#7CC48D"/>
      <path d="M0 38 q25 -10 50 0 t50 0 t50 0 t50 0 V0 H0z" fill="#5FAF74"/>
      <rect y="156" width="200" height="144" fill="#C98C55"/>
      <g stroke="#A86F3E" stroke-width="2">${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M0 ${168 + i * 22} H200"/>`).join('')}</g>
      <rect y="150" width="200" height="8" fill="#A86F3E"/>
    </svg>
    <div class="tb-basket tb-a" aria-hidden="true"><svg viewBox="0 0 112 66" preserveAspectRatio="none">${weave(112, 66)}${frame}</svg></div>
    <div class="tb-basket tb-b" aria-hidden="true"><svg viewBox="0 0 66 66" preserveAspectRatio="none">${weave(66, 66)}</svg></div>
    <div class="tb-plus" aria-hidden="true">+</div>
    <div class="tb-fruits"></div>
    <div class="tb-lid off" aria-hidden="true"><svg viewBox="0 0 112 66" preserveAspectRatio="none"><rect x="1" y="1" width="110" height="64" rx="11" fill="#C27B3C" stroke="#8C5A26" stroke-width="3"/><g stroke="#A8672E" stroke-width="2" opacity=".8">${[...Array(11)].map((_, i) => `<path d="M${8 + i * 9.6} 6 V60"/>`).join('')}</g></svg><b></b></div>
    <div class="tb-nums"></div>`;
  },

  initState: (age) => ({ age, level: AGE_LEVEL[age], rounds: [] }),
  normalize(s, age) {
    if (s.age !== age) { s.age = age; s.level = AGE_LEVEL[age]; }
    if (!Number.isInteger(s.level) || s.level < 1 || s.level > MAX_LEVEL) s.level = AGE_LEVEL[age];
    return s;
  },

  async round(ctx) {
    const { stage, state, say, sfx, anim } = ctx;
    const fruitsEl = stage.querySelector('.tb-fruits'), numsEl = stage.querySelector('.tb-nums'), lidEl = stage.querySelector('.tb-lid');
    const level = state.level, L = LEVELS[level];
    // Sebut "Bakul ini ada…" kemudian nombor, bersambung (rakaman berakhir dengan jeda ±0.3 s).
    const sayChain = async (key, n) => { await ctx.wait(Math.max(500, say(key) - 220)); await ctx.wait(Math.max(700, say(`n${n}`) + 250)); };
    const sayN = (n, extra = 150) => ctx.wait(Math.max(650, say(`n${n}`) + extra));

    // Soalan: utamakan pasangan (a, b) berbeza dan jumlah tidak sama berturut-turut; T1 hanya ada 3 pasangan,
    // jadi selepas beberapa cubaan syarat dilonggarkan (tetapi soalan yang sama tidak pernah berturut-turut).
    const problems = [];
    for (let guard = 0; problems.length < TRIALS && guard < 2000; guard++) {
      const a = rnd(L.a), b = rnd(L.b), s = a + b;
      if (s < L.min || s > L.max || b > 4 || s > 10) continue;
      const last = problems[problems.length - 1];
      if (last && last.a === a && last.b === b) continue;
      if (guard < 300 && (problems.some((p) => p.a === a && p.b === b) || (last && last.s === s))) continue;
      problems.push({ a, b, s });
    }
    const fruitOrder = shuffle(FRUIT_IDS);

    function options(s) {
      const pool = shuffle([s - 1, s + 1, s + 2, s - 2].filter((v) => v >= 1 && v <= 10 && v !== s));
      // Utamakan jiran terdekat (±1): kesilapan biasa ialah terlebih/terkurang satu semasa mengira.
      pool.sort((x, y) => Math.abs(x - s) - Math.abs(y - s));
      return shuffle([s, ...pool.slice(0, L.opts - 1)]);
    }

    async function countAloud(els) {
      for (let i = 0; i < els.length; i++) {
        els[i].classList.add('glow');
        await sayN(i + 1, 120);
        els[i].classList.remove('glow');
      }
    }

    async function trial(p, fruit, demo) {
      const art = FRUITS[fruit]();
      fruitsEl.innerHTML = [
        ...[...Array(p.a)].map((_, i) => `<button class="tb-fruit ina" type="button" style="left:${A_SLOTS[i][0]}%;top:${A_SLOTS[i][1]}%" aria-label="Buah di bakul besar" disabled>${art}</button>`),
        ...[...Array(p.b)].map((_, i) => `<button class="tb-fruit inb" type="button" style="left:${B_SLOTS[i][0]}%;top:${B_SLOTS[i][1]}%" aria-label="Buah di bakul kecil" disabled>${art}</button>`),
      ].join('');
      numsEl.innerHTML = '';
      lidEl.classList.add('off');
      stage.dataset.answer = String(p.s); // untuk ujian automatik
      const aEls = [...fruitsEl.querySelectorAll('.ina')], bEls = [...fruitsEl.querySelectorAll('.inb')];
      sfx.pop();
      await ctx.wait(400);

      // 1. Bakul besar.
      if (L.countAll) { await ctx.wait(Math.max(500, say('ada') - 220)); await countAloud(aEls); }
      else await sayChain('ada', p.a);
      // 2. Tutup bakul (T4): hanya nombor A kelihatan.
      if (L.lid) {
        lidEl.querySelector('b').textContent = String(p.a);
        lidEl.classList.remove('off');
        await ctx.wait(500);
        aEls.forEach((el) => el.classList.add('under'));
        await ctx.wait(Math.max(1500, say('tutup') + 200));
      }
      // 3. Bakul kecil.
      await sayChain('tambah', p.b);

      // 4. Pindahkan buah satu-satu.
      if (ctx.first || demo) await ctx.wait(Math.max(1200, say('masuk') + 150));
      let moved = 0;
      while (moved < p.b) {
        const left = bEls.filter((el) => el.classList.contains('inb'));
        const hint = () => { const r = ctx.toPct(left[0].getBoundingClientRect()); ctx.hand.show(r.left + r.width * .4, r.top + r.width * .3); };
        if (demo && moved === 0) hint();
        left.forEach((el) => { el.disabled = false; });
        const t = await ctx.tap({ selector: '.tb-fruit.inb', ms: IDLE_MS });
        left.forEach((el) => { el.disabled = true; });
        ctx.hand.hide();
        if (!t) { hint(); await ctx.wait(Math.max(1200, say('masuk') + 150)); ctx.hand.hide(); continue; }
        const el = t.el, slot = A_SLOTS[p.a + moved];
        el.classList.remove('inb'); el.classList.add('ina');
        el.style.left = slot[0] + '%'; el.style.top = slot[1] + '%';
        moved++;
        sfx.light();
        if (L.count) { await ctx.wait(250); await sayN(p.a + moved, 50); }
        else await ctx.wait(500);
        if (L.lid) el.classList.add('under');
      }
      await ctx.wait(300);

      // 5. Jawapan.
      const opts = options(p.s);
      numsEl.dataset.n = String(opts.length);
      numsEl.innerHTML = opts.map((v) => `<button class="tb-num" type="button" data-v="${v}" aria-label="${v}" disabled><span>${v}</span>${L.dots ? dots(v) : ''}</button>`).join('');
      const cards = [...numsEl.querySelectorAll('.tb-num')];
      const right = cards.find((c) => Number(c.dataset.v) === p.s);
      const arm = (on) => cards.forEach((c) => { if (!c.classList.contains('dim')) c.disabled = !on; });
      await ctx.wait(Math.max(1000, say('berapa') + 100));

      let wrong = 0;
      for (;;) {
        if (wrong >= 2 || (demo && wrong === 0)) { const r = ctx.toPct(right.getBoundingClientRect()); ctx.hand.show(r.left + r.width * .45, r.top + r.height * .3); }
        arm(true);
        const t = await ctx.tap({ selector: '.tb-num', ms: IDLE_MS });
        arm(false); ctx.hand.hide();
        if (!t) { await ctx.wait(Math.max(1000, say('berapa') + 100)); continue; }
        if (t.el === right) {
          right.classList.add('right'); cards.forEach((c) => { if (c !== right) c.classList.add('dim'); });
          sfx.good();
          if (L.lid) { lidEl.classList.add('off'); fruitsEl.querySelectorAll('.under').forEach((el) => el.classList.remove('under')); }
          anim(right, [{ transform: 'scale(1)' }, { transform: 'scale(1.12)' }, { transform: 'scale(1)' }], { duration: 450, fill: 'none' });
          await sayChain('semua', p.s);
          if (wrong === 0 && Math.random() < .4) await ctx.wait(Math.max(700, say(PRAISE[Math.floor(Math.random() * PRAISE.length)]) + 150));
          break;
        }
        wrong++;
        sfx.soft();
        t.el.classList.add('dim'); t.el.disabled = true;
        anim(t.el, [{ transform: 'translateX(0)' }, { transform: 'translateX(-6%)' }, { transform: 'translateX(6%)' }, { transform: 'translateX(0)' }], { duration: 340, fill: 'none' });
        if (wrong === 1) {
          // Ajar, bukan hukum: buka tutup dan kira semua buah bersama-sama.
          await ctx.wait(Math.max(900, say('kira') + 150));
          if (L.lid) { lidEl.classList.add('off'); fruitsEl.querySelectorAll('.under').forEach((el) => el.classList.remove('under')); await ctx.wait(400); }
          await countAloud([...fruitsEl.querySelectorAll('.tb-fruit')]);
          await ctx.wait(Math.max(900, say('berapa') + 100));
        } else {
          await ctx.wait(Math.max(800, say('cuba-lagi') + 100));
        }
      }
      return { a: p.a, b: p.b, s: p.s, correct: wrong === 0 };
    }

    ctx.progress(TRIALS);
    await ctx.ready(); ctx.alive();
    if (ctx.first) await ctx.wait(Math.max(2800, say('intro') + 200));
    const recs = [];
    for (let i = 0; i < TRIALS; i++) {
      recs.push(await trial(problems[i], fruitOrder[i % fruitOrder.length], ctx.first && i === 0 && level <= 2));
      ctx.mark(i);
      await ctx.wait(400);
    }
    delete stage.dataset.answer;

    const correct = recs.filter((r) => r.correct).length;
    if (correct >= UP_AT) state.level = Math.min(MAX_LEVEL, level + 1);
    else if (correct <= DOWN_AT) state.level = Math.max(1, level - 1);
    const best = recs.filter((r) => r.correct).sort((x, y) => y.s - x.s)[0];
    return {
      record: { level, correct, n: recs.length, miss: recs.filter((r) => !r.correct).map((r) => `${r.a}+${r.b}`), maxSum: best ? best.s : 0 },
      text: `Adik jawab <span class="big-num">${correct}</span> daripada ${recs.length} soalan tambah dengan betul!${best ? ` Paling besar: ${best.a} + ${best.b} = <span class="big-num">${best.s}</span>` : ''}`,
    };
  },

  parent: {
    stats(s) {
      const last = s.rounds.slice(-7);
      const okP = pct(last.reduce((a, r) => a + (r.correct || 0), 0), last.reduce((a, r) => a + (r.n || 0), 0));
      const maxSum = last.reduce((m, r) => Math.max(m, r.maxSum || 0), 0);
      return [
        { v: okP === null ? '–' : okP + '%', label: 'Betul kali pertama' },
        { v: `${s.level}<small>/${MAX_LEVEL}</small>`, label: 'Tahap' },
        { v: maxSum || '–', label: 'Jumlah terbesar betul' },
      ];
    },
    cols: ['Tahap', 'Betul', 'Tersilap'],
    row: (r) => [r.level, meter(pct(r.correct, r.n)), (r.miss || []).join(', ') || '–'],
    explain: `<span><b>Tambah sebagai gabungan</b>: memahami bahawa dua kumpulan digabung menjadi satu kumpulan yang lebih besar. Umur 3–4 biasanya boleh menggabung hingga 3–5 objek dengan mengira semua; umur 5–6 mula <i>kira terus</i> (mula dari nombor pertama, bukan dari 1) untuk jumlah hingga 10.</span>
      <span>Tahap 1: jumlah ≤3, Hafiz kira semua · Tahap 2: ≤5, Hafiz kira terus · Tahap 3: ≤7, anak kira sendiri · Tahap 4: ≤10, bakul besar ditutup supaya anak mesti kira terus dari nombornya. Bakul besar ialah <b>bingkai sepuluh</b> (2 × 5) yang digunakan di prasekolah. Bila tersilap, Hafiz kira semua buah bersama anak.</span>`,
  },

  mission: {
    title: 'Main "Tambah di Dapur"',
    steps: [
      'Semasa makan, letak 3 keping biskut dalam pinggan anak. Tanya: <b>"Ada berapa?"</b>',
      'Tambah 2 lagi: <b>"Mak tambah dua. Sekarang semua berapa?"</b> Biar anak kira.',
      'Untuk umur 5–6: tutup pinggan pertama dengan tangan. <b>"Bawah tangan ada 3. Tambah 2. Kira terus: empat, lima!"</b>',
      'Biar anak pula jadi "cikgu" dan beri soalan kepada ibu bapa.',
    ],
    why: 'Kenapa? Tambah lebih mudah difahami dengan benda sebenar sebelum nombor bertulis. Kira terus (counting on) ialah langkah penting dari mengira ke menambah.',
  },
};
