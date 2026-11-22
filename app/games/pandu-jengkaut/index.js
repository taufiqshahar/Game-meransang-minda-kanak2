// Pandu Jengkaut: motor halus & kawalan visual-motor (pra-menulis). Seret jengkaut ikut jalan sampai ke bendera.
// Tahap: lurus → lengkung → zig-zag → bentuk huruf; jalan makin sempit.
import { VEHICLE } from '../../kit/vehicles.js';
import { pick, shuffle, pct, meter } from '../../kit/util.js';

const TRIALS = 4;
// Laluan dalam koordinat 100 × 150 (nisbah pentas 2:3). tol = separuh lebar jalan.
const LEVELS = [null,
  { tol: 13, paths: ['M14 112 L86 112', 'M16 128 L84 44', 'M50 132 L50 40', 'M14 70 L86 92'] },
  { tol: 11, paths: ['M12 120 C30 60 70 140 88 60', 'M14 44 Q50 150 86 44', 'M12 104 Q50 20 88 104', 'M18 132 C92 122 8 54 82 34'] },
  { tol: 9, paths: ['M10 120 L35 72 L60 120 L86 72', 'M14 132 L86 112 L14 88 L86 64', 'M10 64 L30 104 L50 64 L70 104 L90 64', 'M12 132 H36 V104 H60 V76 H86 V46'] },
  { tol: 7.5, paths: ['M76 44 C40 26 18 58 50 76 C82 94 62 128 24 112', 'M76 48 C28 24 14 112 76 108', 'M20 46 H80 L20 106 H80', 'M18 112 L34 44 L50 88 L66 44 L82 112'] },
];
const MAX_LEVEL = 4;
const AGE_LEVEL = { 3: 1, 4: 1, 5: 2, 6: 3 };
const UP_ACC = 0.85, DOWN_ACC = 0.6;
const STEP = 1.2;               // jarak sampel laluan (unit)
const GRAB = 16;                // jarak maksimum dari jengkaut untuk mula menyeret
const PRAISE = ['hebat', 'bagus', 'pandainya'];
const FLAG = `<svg viewBox="0 0 30 40" aria-hidden="true"><rect x="4" y="4" width="3" height="34" rx="1.5" fill="#6B4A2E"/><path d="M7 5 H27 L22 12 L27 19 H7 Z" fill="#E5323C" stroke="#9E1F24" stroke-width="1.5" stroke-linejoin="round"/><ellipse cx="5.5" cy="38" rx="5" ry="1.6" fill="#000" opacity=".2"/></svg>`;

export default {
  id: 'pandu-jengkaut',
  title: 'Pandu Jengkaut',
  stageLabel: 'Tapak pembinaan. Seret jengkaut dengan jari ikut jalan sampai ke bendera.',
  lines: {
    intro: 'Bawa jengkaut ikut jalan sampai ke bendera!',
    ikut: 'Ikut jalan, ya.',
    sampai: 'Sampai!',
  },
  recorded: ['intro', 'ikut', 'sampai'],

  css: `.pj-road { inset: 0; width: 100%; height: 100%; z-index: 1; }
.pj-dig { width: 22%; z-index: 4; pointer-events: none; transform-origin: 50% 60%; }
.pj-dig svg { width: 100%; height: auto; display: block; }
.pj-dig.flip svg { transform: scaleX(-1); }
.pj-flag { width: 10%; z-index: 3; pointer-events: none; }
.pj-flag svg { width: 100%; height: auto; display: block; }
.pj-flag.won { animation: pj-wave .5s ease-in-out 3; transform-origin: 20% 100%; }
@keyframes pj-wave { 50% { transform: rotate(-12deg) scale(1.2); } }
.pj-touch { inset: 0; z-index: 5; touch-action: none; }
@media (prefers-reduced-motion: reduce) { .pj-flag.won { animation: none; } }`,

  stageHtml: () => `<svg class="bg" viewBox="0 0 200 300" preserveAspectRatio="none" aria-hidden="true">
      <rect width="200" height="56" fill="#BFE3F0"/>
      <path d="M0 50 C40 38 80 42 120 50 C150 44 180 44 200 48 V60 H0Z" fill="#A9C79A"/>
      <rect y="56" width="200" height="244" fill="#D7B57F"/>
      <g fill="#C49E62" opacity=".8"><ellipse cx="30" cy="90" rx="18" ry="5"/><ellipse cx="170" cy="150" rx="22" ry="6"/><ellipse cx="60" cy="230" rx="26" ry="6"/><ellipse cx="150" cy="280" rx="20" ry="5"/></g>
      <g fill="#8C96A1"><circle cx="186" cy="80" r="4"/><circle cx="12" cy="190" r="3"/><circle cx="180" cy="230" r="3.5"/><circle cx="24" cy="282" r="4"/></g>
      <g><path d="M170 300 L180 270 L190 300 Z" fill="#F28A2C"/><rect x="175" y="286" width="10" height="3" fill="#fff"/></g>
    </svg>
    <svg class="pj-road" viewBox="0 0 100 150" aria-hidden="true">
      <path class="edge" fill="none" stroke="#A07A44" stroke-linecap="round" stroke-linejoin="round"/>
      <path class="base" fill="none" stroke="#EAD5A8" stroke-linecap="round" stroke-linejoin="round"/>
      <path class="trail" fill="none" stroke="#F5B82E" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/>
      <path class="dash" fill="none" stroke="#FFFDF5" stroke-width="1.2" stroke-dasharray="3 3" stroke-linecap="round"/>
    </svg>
    <div class="pj-flag">${FLAG}</div>
    <div class="pj-dig">${VEHICLE.jengkaut().replace(/role="img" aria-label="[^"]*"/, 'aria-hidden="true"')}</div>
    <div class="pj-touch" aria-hidden="true"></div>`,

  initState: (age) => ({ age, level: AGE_LEVEL[age], rounds: [] }),
  normalize(s, age) {
    if (s.age !== age) { s.age = age; s.level = AGE_LEVEL[age]; }
    if (!Number.isInteger(s.level) || s.level < 1 || s.level > MAX_LEVEL) s.level = AGE_LEVEL[age];
    return s;
  },

  async round(ctx) {
    const { stage, state, say, sfx } = ctx;
    const road = stage.querySelector('.pj-road'), dig = stage.querySelector('.pj-dig'), flag = stage.querySelector('.pj-flag'), touch = stage.querySelector('.pj-touch');
    const [edge, base, trail, dash] = ['edge', 'base', 'trail', 'dash'].map((c) => road.querySelector('.' + c));
    const level = state.level, L = LEVELS[level];

    // Letak jengkaut / bendera berpusat pada titik (unit laluan) → % pentas.
    const place = (el, x, y, w, hRatio) => Object.assign(el.style, { left: (x - w / 2) + '%', top: ((y / 150) * 100 - w * hRatio * (2 / 3) / 2) + '%' });
    const putDig = (p) => place(dig, p.x, p.y - 4, 22, 0.75);

    async function trial(d, demo) {
      for (const el of [edge, base, trail, dash]) el.setAttribute('d', d);
      edge.setAttribute('stroke-width', L.tol * 2 + 2); base.setAttribute('stroke-width', L.tol * 2);
      const len = base.getTotalLength();
      const pts = []; for (let s = 0; s <= len; s += STEP) pts.push(base.getPointAtLength(s));
      trail.setAttribute('stroke-dasharray', `0 ${len + 1}`);
      const end = pts[pts.length - 1];
      Object.assign(flag.style, { left: (end.x - 1.5) + '%', top: ((end.y / 150) * 100 - 10 * (40 / 30) * (2 / 3)) + '%' }); // tiang di hujung jalan
      flag.classList.remove('won');
      let prog = 0; putDig(pts[0]); dig.classList.toggle('flip', pts[5].x < pts[0].x);
      sfx.pop();
      if (demo) ctx.hand.show(pts[0].x - 2, (pts[0].y / 150) * 100);

      // Seret: kemajuan = sampel terjauh (dalam tetingkap ke hadapan) yang berada dalam jalan.
      let inside = 0, total = 0, offAt = 0, done = false, dragging = false, finish;
      const finished = new Promise((r) => { finish = r; });
      const toUnits = (e) => { const r = road.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * 100, y: (e.clientY - r.top) / r.height * 150 }; };
      const ctl = new AbortController();
      const onAbort = () => { ctl.abort(); finish(); }; ctx.signal.addEventListener('abort', onAbort);
      touch.addEventListener('pointerdown', (e) => {
        const u = toUnits(e), p = pts[prog];
        if (Math.hypot(u.x - p.x, u.y - p.y) > GRAB) return; // mesti mula dari jengkaut
        e.preventDefault(); touch.setPointerCapture?.(e.pointerId); dragging = true; ctx.hand.hide();
      }, { signal: ctl.signal });
      touch.addEventListener('pointermove', (e) => {
        if (!dragging || done) return;
        const u = toUnits(e);
        let best = -1, bestD = Infinity;
        for (let i = prog; i < Math.min(pts.length, prog + 14); i++) { const dd = Math.hypot(u.x - pts[i].x, u.y - pts[i].y); if (dd < bestD) { bestD = dd; best = i; } }
        total++;
        if (bestD <= L.tol) {
          inside++;
          if (best > prog) {
            const dir = pts[best].x - pts[prog].x;
            if (Math.abs(dir) > .2) dig.classList.toggle('flip', dir < 0);
            prog = best; putDig(pts[prog]);
            trail.setAttribute('stroke-dasharray', `${prog * STEP} ${len + 1}`);
          }
          if (prog >= pts.length - 3) { done = true; finish(); }
        } else if (performance.now() - offAt > 3500) { offAt = performance.now(); say('ikut'); sfx.soft(); }
      }, { signal: ctl.signal });
      const up = () => { dragging = false; };
      touch.addEventListener('pointerup', up, { signal: ctl.signal });
      touch.addEventListener('pointercancel', up, { signal: ctl.signal });

      // Peringatan bila anak lama tidak bergerak.
      const t0 = performance.now();
      let lastProg = 0, idleSince = performance.now();
      const nudge = setInterval(() => {
        if (prog !== lastProg) { lastProg = prog; idleSince = performance.now(); return; }
        if (performance.now() - idleSince > 9000) { idleSince = performance.now(); say(prog ? 'ikut' : 'intro'); const p = pts[prog]; ctx.hand.show(p.x - 2, (p.y / 150) * 100); }
      }, 1000);
      await finished;
      clearInterval(nudge); ctl.abort(); ctx.signal.removeEventListener('abort', onAbort);
      ctx.alive();
      ctx.hand.hide();
      trail.setAttribute('stroke-dasharray', `${len + 1} 0`);
      flag.classList.add('won'); sfx.good();
      await ctx.wait(Math.max(900, say('sampai') + 150));
      await ctx.wait(Math.max(700, say(pick(PRAISE)) + 100));
      return { acc: total ? inside / total : 1, ms: Math.round(performance.now() - t0) };
    }

    ctx.progress(TRIALS);
    await ctx.ready(); ctx.alive();
    if (ctx.first) await ctx.wait(Math.max(1800, say('intro') + 200));
    const recs = [];
    const paths = shuffle(L.paths).slice(0, TRIALS);
    for (let i = 0; i < TRIALS; i++) {
      recs.push(await trial(paths[i], ctx.first && i === 0));
      ctx.mark(i);
      await ctx.wait(300);
    }
    const acc = recs.reduce((a, r) => a + r.acc, 0) / recs.length;
    if (acc >= UP_ACC) state.level = Math.min(MAX_LEVEL, level + 1);
    else if (acc < DOWN_ACC) state.level = Math.max(1, level - 1);
    const accP = Math.round(acc * 100);
    return {
      record: { level, acc: accP, n: recs.length, secs: Math.round(recs.reduce((a, r) => a + r.ms, 0) / 1000) },
      foundHtml: FLAG.repeat(recs.length),
      text: accP >= 75
        ? `Jengkaut sampai <span class="big-num">${recs.length}</span> kali! Adik ikut jalan <span class="big-num">${accP}%</span> masa. Tangan adik cekap!`
        : `Jengkaut sampai <span class="big-num">${recs.length}</span> kali! Jalan berliku memang perlu latihan. Main lagi, ya!`,
    };
  },

  parent: {
    stats(s) {
      const last = s.rounds.slice(-7);
      const avg = last.length ? Math.round(last.reduce((a, r) => a + (r.acc || 0), 0) / last.length) : null;
      const best = s.rounds.reduce((m, r) => Math.max(m, r.level || 0), 0);
      return [
        { v: avg === null ? '–' : avg + '%', label: 'Ketepatan ikut jalan' },
        { v: `${s.level}<small>/${MAX_LEVEL}</small>`, label: 'Tahap' },
        { v: best ? `${best}<small>/${MAX_LEVEL}</small>` : '–', label: 'Tahap tertinggi dimain' },
      ];
    },
    cols: ['Tahap', 'Ketepatan', 'Masa'],
    row: (r) => [r.level, meter(r.acc ?? null), (r.secs || 0) + ' s'],
    explain: `<span><b>Motor halus & koordinasi mata-tangan</b>: mengawal jari mengikut garisan ialah asas sebelum memegang pensel dan menulis huruf.</span>
      <span>Tahap 1: garis lurus, jalan lebar · Tahap 2: lengkung · Tahap 3: zig-zag dan tangga · Tahap 4: bentuk huruf (S, C, Z, M), jalan sempit. <b>Ketepatan</b> = peratus pergerakan jari yang kekal dalam jalan. Naik bila ≥ 85%, turun bila bawah 60%.</span>`,
  },

  mission: {
    title: 'Main "Jalan Jengkaut" di atas kertas',
    steps: [
      'Lukis dua garis selari di atas kertas besar (lurus, kemudian berlengkung). Itulah "jalan".',
      'Anak bawa kereta mainan atau jari ikut jalan tanpa keluar garisan.',
      'Kemudian guna krayon tebal untuk "membina jalan" di tengah-tengah garisan.',
      'Bila dah senang, buat jalan berbentuk huruf nama anak.',
    ],
    why: 'Kenapa? Kanak-kanak perlu kawalan tangan yang baik sebelum dapat menulis dengan selesa. Bermain dengan garisan besar dahulu menjadikan menulis kelak lebih mudah dan kurang mengecewakan.',
  },
};
