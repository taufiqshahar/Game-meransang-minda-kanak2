// Tangkap Rama-rama: koordinasi mata-tangan dengan sasaran BERGERAK (lebih sukar daripada sasaran pegun).
// Tahap 1–2: rama-rama besar dan perlahan, kemudian lebih laju · Tahap 3–4: lebah turut terbang; jangan tangkap lebah
// (kawalan diri: tahan tekanan pada sasaran yang salah walaupun ia sama-sama bergerak).
import { pick, pct, meter } from '../../kit/util.js';

const WINGS = [['#F28A2C', '#FFD84D'], ['#2F7DE1', '#A9DBF3'], ['#E86FA6', '#FFD1E6'], ['#7A4FD8', '#D9C8FF'], ['#22B26A', '#C8F0A8']];
const butterflySVG = ([a, b]) => `<svg viewBox="-30 -24 60 48" aria-hidden="true">
  <g class="tr-w"><path d="M-2 -2 C-10 -26 -30 -22 -27 -6 C-25 4 -12 4 -2 0 Z M2 -2 C10 -26 30 -22 27 -6 C25 4 12 4 2 0 Z" fill="${a}" stroke="#2B2F36" stroke-width="2"/>
  <path d="M-2 2 C-14 4 -22 18 -12 21 C-6 22 -2 12 -2 4 Z M2 2 C14 4 22 18 12 21 C6 22 2 12 2 4 Z" fill="${b}" stroke="#2B2F36" stroke-width="2"/>
  <circle cx="-15" cy="-10" r="4" fill="${b}"/><circle cx="15" cy="-10" r="4" fill="${b}"/></g>
  <ellipse cx="0" cy="2" rx="3" ry="13" fill="#2B2F36"/><path d="M-1 -10 Q-5 -20 -9 -21 M1 -10 Q5 -20 9 -21" stroke="#2B2F36" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>`;
const BEE = `<svg viewBox="-30 -24 60 48" aria-hidden="true">
  <g class="tr-w" opacity=".85"><ellipse cx="-8" cy="-13" rx="9" ry="12" fill="#DDF3FF" stroke="#2B2F36" stroke-width="1.6" transform="rotate(-20 -8 -13)"/><ellipse cx="8" cy="-13" rx="9" ry="12" fill="#DDF3FF" stroke="#2B2F36" stroke-width="1.6" transform="rotate(20 8 -13)"/></g>
  <ellipse cx="0" cy="4" rx="19" ry="13" fill="#FFC928" stroke="#2B2F36" stroke-width="2"/>
  <path d="M-6 -8 Q-9 4 -6 16 M4 -8 Q1 4 4 16" stroke="#2B2F36" stroke-width="5" fill="none"/>
  <path d="M19 4 L27 4" stroke="#2B2F36" stroke-width="2.4" stroke-linecap="round"/>
  <circle cx="-12" cy="0" r="2.4" fill="#2B2F36"/><path d="M-16 7 Q-13 10 -10 8" stroke="#2B2F36" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>`;

// n = rama-rama perlu ditangkap · on = rama-rama serentak · bees = lebah serentak · v = laju (unit/s) · size = % lebar
const LEVELS = [null,
  { n: 6, on: 2, bees: 0, v: 13, size: 24 },
  { n: 8, on: 3, bees: 0, v: 19, size: 20 },
  { n: 8, on: 2, bees: 1, v: 18, size: 20 },
  { n: 10, on: 3, bees: 2, v: 24, size: 17 },
];
const MAX_LEVEL = 4;
const AGE_LEVEL = { 3: 1, 4: 1, 5: 2, 6: 3 };
const IDLE_MS = 8000;
const FAST_MS = 3200, SLOW_MS = 7500; // purata masa setiap tangkapan untuk naik / turun tahap
// Kawasan terbang (unit pentas: lebar 100, tinggi 150).
const BOX = { x0: 10, x1: 90, y0: 26, y1: 138 };

export default {
  id: 'tangkap-rama',
  title: 'Tangkap Rama-rama',
  stageLabel: 'Rama-rama terbang di taman. Tekan rama-rama untuk menangkapnya dengan jaring. Jangan tekan lebah.',
  lines: { intro: 'Tangkap rama-rama dengan jaring! Tekan rama-rama yang terbang.', lebah: 'Eh, itu lebah! Jangan tangkap lebah.' },
  recorded: ['intro', 'lebah'],

  css: `.tr-sky { inset: 0; z-index: 2; overflow: hidden; touch-action: none; }
.tr-bug { position: absolute; padding: 0; background: none; border-radius: 50%; transform: translate(-50%, -50%); }
.tr-bug svg { width: 100%; height: 100%; display: block; overflow: visible; pointer-events: none; }
.tr-bug .tr-w { transform-box: fill-box; transform-origin: center; animation: tr-flap .22s ease-in-out infinite alternate; }
.tr-bug[data-kind="lebah"] .tr-w { animation-duration: .07s; }
.tr-bug.caught { pointer-events: none; transition: left .6s ease-in, top .6s ease-in, opacity .6s; opacity: 0; }
.tr-bug.shoo { pointer-events: none; }
@keyframes tr-flap { to { transform: scaleX(.35); } }
.tr-net { position: absolute; width: 22%; aspect-ratio: 1; transform: translate(-30%, -70%) rotate(-25deg); pointer-events: none; z-index: 4; animation: tr-swoop .45s ease-out forwards; }
@keyframes tr-swoop { from { transform: translate(-30%, -70%) rotate(-60deg); opacity: 1; } 70% { opacity: 1; } to { transform: translate(-30%, -70%) rotate(10deg); opacity: 0; } }
.tr-jar { left: 3%; top: 83%; width: 14%; z-index: 3; pointer-events: none; }
.tr-jar b { position: absolute; left: 0; right: 0; top: 46%; text-align: center; font: 700 calc(var(--u) * 5)/1 Fredoka, sans-serif; color: #15302A; }
@media (prefers-reduced-motion: reduce) { .tr-bug .tr-w { animation: none; } }`,

  stageHtml: () => `<svg class="bg" viewBox="0 0 200 300" preserveAspectRatio="none" aria-hidden="true">
      <rect width="200" height="300" fill="#BDE8F7"/><circle cx="168" cy="34" r="18" fill="#FFE27A"/>
      <path d="M0 236 Q60 214 120 232 T200 226 V300 H0 Z" fill="#8FD16A"/><path d="M0 262 Q70 244 140 262 T200 258 V300 H0 Z" fill="#6CC04E"/>
      ${[[24, 250, '#E5484D'], [62, 270, '#FFD84D'], [104, 252, '#E86FA6'], [150, 272, '#FFFDF5'], [182, 246, '#7A4FD8']].map(([x, y, c]) => `<g transform="translate(${x} ${y})"><path d="M0 0 V14" stroke="#3E8E2E" stroke-width="2"/><circle r="5" fill="${c}"/><circle r="2" fill="#F5B82E"/></g>`).join('')}
    </svg>
    <div class="tr-jar" aria-hidden="true"><svg viewBox="0 0 40 48"><rect x="8" y="2" width="24" height="6" rx="2" fill="#C99456"/><path d="M6 10 H34 V42 Q34 46 30 46 H10 Q6 46 6 42 Z" fill="#FFFDF5" fill-opacity=".7" stroke="#15302A" stroke-width="2"/></svg><b>0</b></div>
    <div class="tr-sky"></div>`,

  initState: (age) => ({ age, level: AGE_LEVEL[age], rounds: [] }),
  normalize(s, age) {
    if (s.age !== age) { s.age = age; s.level = AGE_LEVEL[age]; }
    if (!Number.isInteger(s.level) || s.level < 1 || s.level > MAX_LEVEL) s.level = AGE_LEVEL[age];
    return s;
  },

  async round(ctx) {
    const { stage, state, say, sfx } = ctx;
    const level = state.level, L = LEVELS[level];
    const sky = stage.querySelector('.tr-sky'), jarNum = stage.querySelector('.tr-jar b');
    const bugs = new Set();
    let uid = 0, raf = 0, last = performance.now(), slow = 1;

    function spawn(kind) {
      const el = document.createElement('button');
      el.type = 'button'; el.className = 'tr-bug'; el.dataset.kind = kind; el.dataset.id = String(++uid);
      el.setAttribute('aria-label', kind === 'lebah' ? 'Lebah' : 'Rama-rama');
      el.innerHTML = kind === 'lebah' ? BEE : butterflySVG(pick(WINGS));
      const sz = kind === 'lebah' ? L.size * .85 : L.size;
      el.style.width = sz + '%'; el.style.height = (sz / 1.5) * .8 + '%';
      // Masuk dari tepi kiri atau kanan.
      const fromLeft = Math.random() < .5;
      const b = { el, kind, x: fromLeft ? BOX.x0 - 6 : BOX.x1 + 6, y: BOX.y0 + Math.random() * (BOX.y1 - BOX.y0), a: fromLeft ? 0 : Math.PI, turn: 0, t: Math.random() * 10 };
      b.a += (Math.random() - .5) * .8;
      bugs.add(b); sky.appendChild(el); place(b);
      return b;
    }
    function place(b) {
      b.el.style.left = b.x + '%'; b.el.style.top = (b.y / 1.5) + '%';
      b.el.style.transform = `translate(-50%, -50%) scaleX(${Math.cos(b.a) < 0 ? -1 : 1})`;
    }
    // Gerakan: arah berubah perlahan (laluan melengkung), melantun di dalam kotak, sedikit naik-turun seperti mengepak.
    function step(now) {
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      for (const b of bugs) {
        if (b.el.classList.contains('caught')) continue;
        const shoo = b.el.classList.contains('shoo');
        const v = L.v * (shoo ? 2.4 : slow * (b.kind === 'lebah' ? 1.15 : 1));
        b.t += dt;
        if (shoo) { b.x += Math.cos(b.a) * v * dt; place(b); continue; }
        b.turn += (Math.random() - .5) * dt * 6; b.turn = Math.max(-1.6, Math.min(1.6, b.turn * .98));
        b.a += b.turn * dt;
        b.x += Math.cos(b.a) * v * dt; b.y += Math.sin(b.a) * v * dt + Math.sin(b.t * 7) * dt * 6;
        if (b.x < BOX.x0 && Math.cos(b.a) < 0) b.a = Math.PI - b.a;
        if (b.x > BOX.x1 && Math.cos(b.a) > 0) b.a = Math.PI - b.a;
        if (b.y < BOX.y0 && Math.sin(b.a) < 0) b.a = -b.a;
        if (b.y > BOX.y1 && Math.sin(b.a) > 0) b.a = -b.a;
        place(b);
      }
      raf = requestAnimationFrame(step);
    }
    const count = (k) => [...bugs].filter((b) => b.kind === k && !b.el.classList.contains('caught')).length;
    const fill = () => { while (count('rama') < Math.min(L.on, L.n - caught)) spawn('rama'); while (count('lebah') < L.bees) spawn('lebah'); };
    const net = (b) => { const n = document.createElement('div'); n.className = 'tr-net'; n.style.left = b.x + '%'; n.style.top = (b.y / 1.5) + '%'; n.innerHTML = `<svg viewBox="0 0 40 40"><path d="M30 30 L40 40" stroke="#8A5A2E" stroke-width="4" stroke-linecap="round"/><circle cx="18" cy="18" r="14" fill="#FFFDF5" fill-opacity=".5" stroke="#15302A" stroke-width="2.4"/><path d="M8 10 L28 26 M10 26 L26 8 M18 4 V32 M4 18 H32" stroke="#15302A" stroke-width=".8" opacity=".5"/></svg>`; sky.appendChild(n); setTimeout(() => n.remove(), 500); };
    const nearest = () => [...bugs].find((b) => b.kind === 'rama' && !b.el.classList.contains('caught'));

    let caught = 0, beeTaps = 0, lastBeeSay = 0, beeSeen = 0;
    const times = [];
    ctx.progress(L.n);
    await ctx.ready(); ctx.alive();
    const onAbort = () => cancelAnimationFrame(raf);
    ctx.signal.addEventListener('abort', onAbort);
    try {
      if (ctx.first) say('intro');
      fill(); beeSeen = L.bees;
      last = performance.now(); raf = requestAnimationFrame(step);
      if (ctx.first && level === 1) { slow = .35; const b = nearest(); if (b) setTimeout(() => { const r = ctx.toPct(b.el.getBoundingClientRect()); ctx.hand.show(r.left + r.width * .45, r.top + r.width * .25); }, 1200); }
      let t0 = performance.now(), idle = 0;
      while (caught < L.n) {
        const tap = await ctx.tap({ selector: '.tr-bug', event: 'pointerdown', ms: IDLE_MS });
        ctx.hand.hide();
        if (!tap) {
          // Lama tiada tangkapan: perlahankan dan tunjuk satu rama-rama.
          idle++; slow = Math.max(.4, slow - .25);
          const b = nearest(); if (b) { const r = ctx.toPct(b.el.getBoundingClientRect()); ctx.hand.show(r.left + r.width * .45, r.top + r.width * .25); }
          if (idle === 1) say('intro');
          continue;
        }
        idle = 0;
        const b = [...bugs].find((x) => x.el === tap.el);
        if (!b || b.el.classList.contains('caught') || b.el.classList.contains('shoo')) continue;
        if (b.kind === 'lebah') {
          beeTaps++; sfx.soft();
          if (tap.t - lastBeeSay > 5000) { lastBeeSay = tap.t; say('lebah'); }
          // Lebah lari ke tepi dan masuk semula kemudian.
          b.el.classList.add('shoo'); b.a = b.x < 50 ? Math.PI : 0; b.turn = 0;
          setTimeout(() => { b.el.remove(); bugs.delete(b); if (caught < L.n) { spawn('lebah'); beeSeen++; } }, 1400);
          continue;
        }
        // Tangkap: jaring menghayun, rama-rama terbang masuk ke balang.
        net(b); sfx.good();
        b.el.classList.add('caught'); b.el.style.left = '10%'; b.el.style.top = '89%';
        setTimeout(() => { b.el.remove(); bugs.delete(b); }, 650);
        times.push(tap.t - t0); t0 = tap.t;
        caught++; jarNum.textContent = String(caught); ctx.mark(caught - 1);
        if (slow < 1) slow = Math.min(1, slow + .2);
        setTimeout(() => { if (caught < L.n) fill(); }, 500);
      }
    } finally {
      cancelAnimationFrame(raf); ctx.signal.removeEventListener('abort', onAbort);
    }
    await ctx.wait(700);
    for (const b of bugs) b.el.remove();
    bugs.clear();
    sfx.good();
    const avg = Math.round(times.reduce((a, t) => a + t, 0) / Math.max(1, times.length));
    // Naik: cepat (dan tiada lebah ditangkap bila ada lebah). Turun: terlalu perlahan atau kerap menangkap lebah.
    if (avg <= FAST_MS && (L.bees === 0 || beeTaps === 0)) state.level = Math.min(MAX_LEVEL, level + 1);
    else if (avg >= SLOW_MS || beeTaps >= 3) state.level = Math.max(1, level - 1);
    return {
      record: { level, caught, avg, bees: L.bees ? beeTaps : null, beeSeen: L.bees ? beeSeen : 0 },
      foundHtml: Array.from({ length: Math.min(caught, 6) }, (_, i) => butterflySVG(WINGS[i % WINGS.length])).join(''),
      text: L.bees && beeTaps === 0
        ? `Adik tangkap <span class="big-num">${caught}</span> rama-rama dan tak tangkap lebah langsung!`
        : `Adik tangkap <span class="big-num">${caught}</span> rama-rama!`,
    };
  },

  parent: {
    stats(s) {
      const last = s.rounds.slice(-7);
      const avgs = last.map((r) => r.avg).filter((v) => v > 0);
      const avg = avgs.length ? (avgs.reduce((a, v) => a + v, 0) / avgs.length / 1000).toFixed(1) : null;
      const beeR = last.filter((r) => r.bees !== null && r.bees !== undefined);
      const beeOk = beeR.length ? pct(beeR.filter((r) => r.bees === 0).length, beeR.length) : null;
      return [
        { v: avg ? `${avg}<small> s</small>` : '–', label: 'Purata masa setiap tangkapan' },
        { v: `${s.level}<small>/${MAX_LEVEL}</small>`, label: 'Tahap' },
        { v: beeOk === null ? '–' : beeOk + '%', label: 'Pusingan tanpa tangkap lebah' },
      ];
    },
    cols: ['Tahap', 'Masa/tangkapan', 'Lebah'],
    row: (r) => [r.level, r.avg ? (r.avg / 1000).toFixed(1) + ' s' : '–', r.bees === null || r.bees === undefined ? '–' : r.bees === 0 ? '✓ 0' : String(r.bees)],
    explain: `<span><b>Koordinasi mata-tangan</b> dengan sasaran bergerak: mata menjejak, otak meramal ke mana rama-rama akan pergi, jari menekan tepat pada masanya. Ini asas kemahiran seperti menangkap bola dan menulis.</span>
      <span>Tahap 1: rama-rama besar dan perlahan · Tahap 2: lebih laju · Tahap 3–4: lebah turut terbang; anak mesti <b>menahan</b> diri daripada menekan lebah (kawalan diri). Jika lama tiada tangkapan, rama-rama terbang lebih perlahan dan tangan menunjuk.</span>`,
  },

  mission: {
    title: 'Main "Tangkap Buih"',
    steps: [
      'Tiup buih sabun. Minta anak tepuk buih dengan dua tangan.',
      'Cabaran: tangkap buih dengan satu jari sahaja, atau hanya buih yang besar.',
      'Gulung bola perlahan-lahan ke arah anak untuk ditangkap; makin lama makin laju.',
    ],
    why: 'Kenapa? Menjejak benda bergerak melatih mata dan tangan bekerjasama, kemahiran yang diperlukan untuk bersukan, menulis dan menyalin dari papan.',
  },
};
