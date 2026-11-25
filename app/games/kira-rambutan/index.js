// Kira Rambutan: membilang 1–10 (prinsip padanan satu-satu dan kardinaliti).
// Anak tekan rambutan satu-satu (Sayf kira bersama pada tahap 1–2), kemudian jawab "Berapa rambutan semua?".
import { pick, shuffle, pct, meter } from '../../kit/util.js';
import { RAMBUTAN_SVG } from '../../kit/objects.js';

const TRIALS = 5;
const LEVELS = [null, [1, 3], [2, 5], [4, 7], [6, 10]]; // julat bilangan rambutan setiap tahap
const MAX_LEVEL = 4;
const AGE_LEVEL = { 3: 1, 4: 2, 5: 3, 6: 3 };
const SILENT_FROM = 3;                    // tahap 3+: anak kira sendiri (Sayf tidak sebut nombor semasa petik)
const UP_AT = 4, DOWN_AT = 2;             // per pusingan 5 soalan: ≥4 betul naik, ≤2 turun
const REMIND_MS = 9000;
const PRAISE = ['betul', 'hebat', 'bagus', 'pandainya'];
// 10 kedudukan buah dalam kanopi (% pentas, penjuru kiri atas butang).
const SLOTS = [[30, 15], [48, 13], [64, 17], [22, 25], [40, 24], [57, 26], [72, 28], [30, 35], [48, 35], [64, 37]];

// Titik untuk kad nombor (bantuan visual): baris 5.
const dots = (n) => `<span class="kr-dots">${'<i></i>'.repeat(n)}</span>`;

export default {
  id: 'kira-rambutan',
  title: 'Kira Rambutan',
  stageLabel: 'Pokok rambutan. Tekan setiap rambutan untuk mengira, kemudian pilih jumlahnya.',
  lines: {
    intro: 'Jom petik rambutan! Tekan rambutan satu-satu, kita kira sama-sama.',
    'kira-sendiri': 'Sekarang adik kira sendiri, ya.',
    tanya: 'Berapa rambutan semua?',
    'kira-sama': 'Jom kira sama-sama.',
  },
  recorded: ['intro', 'kira-sendiri', 'tanya', 'kira-sama'],

  css: `.kr-fruits, .kr-opts { inset: 0; }
.kr-fruit { position: absolute; width: 11%; aspect-ratio: 1; padding: 0; z-index: 4; border-radius: 50%; }
.kr-fruit svg { width: 100%; height: auto; display: block; }
.kr-fruit:not(:disabled) { animation: kr-sway 1.6s ease-in-out infinite; }
.kr-fruit:nth-child(2n):not(:disabled) { animation-delay: .4s; }
@keyframes kr-sway { 0%, 100% { transform: rotate(-6deg); } 50% { transform: rotate(6deg); } }
.kr-fruit.picked { width: 8%; z-index: 5; animation: none; }
.kr-fruit.picked:disabled { cursor: default; }
.kr-fruit.hop { animation: kr-hop .45s ease-out; }
@keyframes kr-hop { 0% { transform: translateY(0) scale(1); } 40% { transform: translateY(-35%) scale(1.25); } 100% { transform: translateY(0) scale(1); } }
.kr-basket { left: 26%; top: 60%; width: 48%; z-index: 3; pointer-events: none; }
.kr-basket svg { width: 100%; height: auto; display: block; }
.kr-opts { pointer-events: none; }
.kr-opt {
  position: absolute; top: 82%; width: 26%; height: 14%; pointer-events: auto;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: calc(var(--u) * .8);
  background: var(--kertas); color: var(--ink); border-radius: calc(var(--u) * 4); box-shadow: 0 calc(var(--u) * 1) 0 rgba(0, 0, 0, .2);
  font-family: var(--font-display); font-weight: 700; font-size: calc(var(--u) * 9); line-height: 1;
}
.kr-opt:disabled { cursor: default; }
.kr-opt:not(:disabled) { animation: wiggle 1.4s ease-in-out infinite; }
.kr-opt.right { background: var(--hijau); color: var(--kertas); }
.kr-opt.dim { opacity: .35; }
.kr-dots { display: flex; flex-wrap: wrap; justify-content: center; gap: calc(var(--u) * .7); width: calc(var(--u) * 12.6); } /* 5 sebaris, macam jari */
.kr-dots i { width: calc(var(--u) * 1.8); height: calc(var(--u) * 1.8); border-radius: 50%; background: #C8303A; }
.kr-big { left: 50%; top: 30%; transform: translate(-50%, -50%); z-index: 6; pointer-events: none;
  font-family: var(--font-display); font-weight: 700; font-size: calc(var(--u) * 26); color: var(--kertas);
  text-shadow: 0 calc(var(--u) * 1) 0 rgba(0, 0, 0, .25); }
@media (prefers-reduced-motion: reduce) { .kr-fruit:not(:disabled), .kr-opt:not(:disabled), .kr-fruit.hop { animation: none; } }`,

  stageHtml: () => `<svg class="bg" viewBox="0 0 200 300" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="kr-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9FD8EE"/><stop offset="1" stop-color="#DDF2E6"/></linearGradient>
        <linearGradient id="kr-grass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#86CF80"/><stop offset="1" stop-color="#5EAE62"/></linearGradient>
        <radialGradient id="kr-leaf" cx=".4" cy=".3" r=".9"><stop offset="0" stop-color="#5FBF62"/><stop offset="1" stop-color="#2E7D45"/></radialGradient>
      </defs>
      <rect width="200" height="170" fill="url(#kr-sky)"/>
      <g fill="#FFFFFF" opacity=".85"><path d="M150 22 a6 6 0 0 1 10 -3 a7 7 0 0 1 12 3 a4 4 0 0 1 1 8 h-23 a4 4 0 0 1 0 -8z"/></g>
      <path d="M0 150 C30 136 60 138 90 146 C120 134 160 134 200 144 V172 H0Z" fill="#A9D5BC"/>
      <rect y="160" width="200" height="140" fill="url(#kr-grass)"/>
      <path d="M92 190 C90 160 94 130 88 104 L112 104 C106 130 110 160 108 190 Z" fill="#7A5232"/>
      <path d="M96 140 q-14 -10 -26 -8 M106 128 q14 -10 26 -8" stroke="#7A5232" stroke-width="6" stroke-linecap="round" fill="none"/>
      <g fill="#245F37"><circle cx="100" cy="66" r="62"/><circle cx="48" cy="84" r="34"/><circle cx="152" cy="86" r="34"/></g>
      <g fill="url(#kr-leaf)"><circle cx="100" cy="62" r="58"/><circle cx="50" cy="80" r="30"/><circle cx="150" cy="82" r="30"/></g>
      <g fill="#8EDB86" opacity=".35"><ellipse cx="80" cy="32" rx="18" ry="9"/><ellipse cx="40" cy="70" rx="9" ry="5"/></g>
      <g fill="#8ED48A" opacity=".8"><ellipse cx="30" cy="220" rx="24" ry="6"/><ellipse cx="172" cy="250" rx="26" ry="7"/></g>
    </svg>
    <div class="kr-basket" aria-hidden="true"><svg viewBox="0 0 120 70">
      <ellipse cx="60" cy="66" rx="52" ry="4" fill="#0B2A1C" opacity=".2"/>
      <path d="M8 18 L18 62 Q60 72 102 62 L112 18 Z" fill="#C98A4B" stroke="#7A4E26" stroke-width="3" stroke-linejoin="round"/>
      <g stroke="#9C6634" stroke-width="2" opacity=".8"><path d="M12 30 Q60 40 108 30"/><path d="M15 43 Q60 53 105 43"/><path d="M30 20 L36 64 M48 20 L50 67 M72 20 L70 67 M90 20 L84 64"/></g>
      <ellipse cx="60" cy="18" rx="52" ry="8" fill="#8A5A2E" stroke="#7A4E26" stroke-width="3"/>
    </svg></div>
    <div class="kr-fruits"></div>
    <div class="kr-opts"></div>`,

  initState: (age) => ({ age, level: AGE_LEVEL[age], rounds: [] }),
  normalize(s, age) {
    if (s.age !== age) { s.age = age; s.level = AGE_LEVEL[age]; }
    if (!Number.isInteger(s.level) || s.level < 1 || s.level > MAX_LEVEL) s.level = AGE_LEVEL[age];
    return s;
  },

  async round(ctx) {
    const { stage, state, say, sfx, anim } = ctx;
    const fruitsEl = stage.querySelector('.kr-fruits'), optsEl = stage.querySelector('.kr-opts'), basket = stage.querySelector('.kr-basket');
    const level = state.level;
    const silent = level >= SILENT_FROM;
    const [lo, hi] = LEVELS[level];
    const num = (n) => say('n' + n);

    // Kedudukan rambutan dalam bakul: 2 baris di mulut bakul.
    const basketSpot = (i) => {
      const b = ctx.toPct(basket.getBoundingClientRect());
      const col = i % 5, row = Math.floor(i / 5);
      return { left: b.left + b.width * (.12 + col * .155), top: b.top - b.width * .02 + row * 4.2 };
    };

    async function trial(n, demo) {
      fruitsEl.innerHTML = shuffle(SLOTS).slice(0, n).map(([x, y], i) => `<button class="kr-fruit" type="button" data-i="${i}" style="left:${x}%;top:${y}%" aria-label="Rambutan">${RAMBUTAN_SVG}</button>`).join('');
      optsEl.innerHTML = '';
      const fruits = [...fruitsEl.querySelectorAll('.kr-fruit')];
      // Petik: setiap tekanan pindahkan satu rambutan ke bakul dan (tahap 1–2) Sayf sebut nombornya.
      for (let c = 0; c < n; c++) {
        const left = fruits.filter((f) => !f.classList.contains('picked'));
        if (demo) { const r = ctx.toPct(left[0].getBoundingClientRect()); ctx.hand.show(r.left + 2, r.top + 4); }
        let t = null;
        while (!t) {
          t = await ctx.tap({ selector: '.kr-fruit:not(.picked)', ms: REMIND_MS });
          if (!t) say(c === 0 && !silent ? 'intro' : 'tengok');
        }
        ctx.hand.hide();
        const f = t.el, to = basketSpot(c);
        f.classList.add('picked'); f.disabled = true;
        if (silent) sfx.pop(); else num(c + 1);
        await anim(f, [{ left: f.style.left, top: f.style.top }, { left: to.left + '%', top: to.top + '%' }], { duration: 420, easing: 'cubic-bezier(.4,1.4,.6,1)' });
        Object.assign(f.style, { left: to.left + '%', top: to.top + '%' });
        f.getAnimations().forEach((x) => x.cancel());
        ctx.alive();
      }
      await ctx.wait(500);

      // Tanya jumlah: 3 pilihan (jawapan + 2 pengganggu dekat).
      const near = shuffle([n - 2, n - 1, n + 1, n + 2].filter((v) => v >= 1 && v <= 10)).slice(0, 2);
      const opts = shuffle([n, ...near]);
      optsEl.innerHTML = opts.map((v, i) => `<button class="kr-opt" type="button" data-v="${v}" style="left:${5 + i * 32}%" aria-label="${v}" disabled>${v}${v <= 10 ? dots(v) : ''}</button>`).join('');
      const optBtns = [...optsEl.querySelectorAll('.kr-opt')];
      const rightBtn = optBtns.find((b) => Number(b.dataset.v) === n);
      await ctx.wait(Math.max(900, say('tanya') + 100));
      optBtns.forEach((b) => { b.disabled = false; }); // aktif hanya selepas soalan: tekanan awal tidak hilang tanpa disedari
      if (demo) { const r = ctx.toPct(rightBtn.getBoundingClientRect()); ctx.hand.show(r.left + r.width * .4, r.top + 4); }
      const t0 = performance.now();
      let t = null;
      for (let r = 0; r < 3 && !t; r++) { t = await ctx.tap({ selector: '.kr-opt', ms: REMIND_MS }); if (!t && r < 2) say('tanya'); }
      ctx.hand.hide();
      const pickV = t ? Number(t.el.dataset.v) : null;
      const rec = { n, correct: pickV === n, rt: t ? Math.round(performance.now() - t0) : null };
      optBtns.forEach((b) => { b.disabled = true; });
      if (rec.correct) {
        rightBtn.classList.add('right'); sfx.good();
        await ctx.wait(Math.max(700, num(n) + 100));
        await ctx.wait(Math.max(800, say(pick(PRAISE)) + 150));
      } else {
        // Kira semula bersama: setiap rambutan melompat sambil Sayf kira, kemudian jawapan ditunjuk.
        sfx.soft();
        optBtns.forEach((b) => { if (b !== rightBtn) b.classList.add('dim'); });
        await ctx.wait(Math.max(1200, say('kira-sama') + 200));
        for (let c = 0; c < n; c++) {
          const f = fruits[c]; f.classList.remove('hop'); void f.offsetWidth; f.classList.add('hop');
          await ctx.wait(Math.max(650, num(c + 1) + 80));
        }
        rightBtn.classList.add('right'); sfx.pop();
        await ctx.wait(1200);
      }
      return rec;
    }

    ctx.progress(TRIALS);
    await ctx.ready(); ctx.alive();
    if (ctx.first) await ctx.wait(Math.max(1800, say('intro') + 200));
    if (silent) await ctx.wait(Math.max(1500, say('kira-sendiri') + 200));
    // Bilangan: rawak dalam julat, tiada sama berturut-turut.
    const recs = [];
    let prev = 0;
    for (let i = 0; i < TRIALS; i++) {
      let n; do { n = lo + Math.floor(Math.random() * (hi - lo + 1)); } while (n === prev && hi > lo);
      prev = n;
      recs.push(await trial(n, ctx.first && i === 0 && !silent)); // demo hanya bila Sayf kira bersama
      ctx.mark(i);
      await ctx.wait(300);
    }

    const correct = recs.filter((r) => r.correct).length;
    if (correct >= UP_AT) state.level = Math.min(MAX_LEVEL, level + 1);
    else if (correct <= DOWN_AT) state.level = Math.max(1, level - 1);
    const total = recs.reduce((a, r) => a + r.n, 0);
    return {
      record: { level, correct, n: recs.length, maxN: Math.max(...recs.filter((r) => r.correct).map((r) => r.n), 0) },
      foundHtml: RAMBUTAN_SVG.repeat(Math.min(total, 30)),
      text: `Adik petik <span class="big-num">${total}</span> biji rambutan, dan jawab betul <span class="big-num">${correct}</span> daripada ${recs.length}!`,
    };
  },

  parent: {
    stats(s) {
      const last = s.rounds.slice(-7);
      const okP = pct(last.reduce((a, r) => a + (r.correct || 0), 0), last.reduce((a, r) => a + (r.n || 0), 0));
      const best = s.rounds.reduce((m, r) => Math.max(m, r.maxN || 0), 0);
      return [
        { v: okP === null ? '–' : okP + '%', label: 'Jumlah betul' },
        { v: `${s.level}<small>/${MAX_LEVEL}</small>`, label: 'Tahap' },
        { v: best || '–', label: 'Kiraan terbesar betul' },
      ];
    },
    cols: ['Tahap', 'Betul', 'Terbesar'],
    row: (r) => [r.level, meter(pct(r.correct, r.n)), r.maxN || '–'],
    explain: `<span><b>Membilang</b>: padanan satu-satu (satu rambutan, satu nombor) dan <b>kardinaliti</b> (nombor terakhir ialah jumlah semua). Ini asas nombor sebelum tambah dan tolak.</span>
      <span>Tahap 1: 1–3 · Tahap 2: 2–5 (Sayf kira bersama) · Tahap 3: 4–7 · Tahap 4: 6–10 (anak kira sendiri). Naik bila 4/5 betul, turun bila 2/5 atau kurang. Biasa: kanak-kanak 3 tahun boleh kira 1–3; kebanyakan 5 tahun boleh kira hingga 10.</span>`,
  },

  mission: {
    title: 'Main "Kira Apa Saja" di rumah',
    steps: [
      'Semasa makan, kira bersama: <b>"Berapa ketul ayam? Satu, dua, tiga!"</b>',
      'Selepas mengira, tanya <b>"Jadi, ada berapa semua?"</b> Anak patut sebut nombor terakhir.',
      'Minta anak ambil bilangan tertentu: <b>"Tolong ambil 4 sudu."</b>',
      'Bila dah senang, kira benda yang tak boleh disentuh: burung atas wayar, kereta lalu.',
    ],
    why: 'Kenapa? Mengira benda sebenar dan menyentuhnya satu-satu membantu anak faham bahawa nombor mewakili kuantiti, bukan sekadar lagu yang dihafal.',
  },
};
