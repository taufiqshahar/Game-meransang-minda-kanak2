// Lumba Sudu Telur: kawalan motor halus + kawalan diri (perlahan dengan sengaja). Seret sudu sepanjang trek sukaneka;
// terlalu laju → telur bergoyang dan jatuh; keluar trek → jatuh. Mula semula dari bendera terakhir (tiada kalah).
// Tahap naik = trek lebih sempit, lebih berliku, had laju lebih rendah.
import { pct, meter } from '../../kit/util.js';

// Bentuk trek (titik kawalan dalam unit pentas 100 × 150).
const SHAPES = {
  s: [[16, 136], [16, 100], [50, 84], [84, 62], [84, 20]],
  sm: [[84, 136], [84, 100], [50, 84], [16, 62], [16, 20]],
  zig: [[50, 138], [18, 116], [80, 92], [20, 66], [80, 42], [50, 18]],
  ular: [[12, 136], [86, 130], [88, 100], [14, 90], [12, 58], [86, 50], [88, 18]],
  pusing: [[50, 138], [14, 112], [18, 60], [56, 36], [86, 62], [70, 98], [44, 86], [48, 62]],
};
// w = lebar trek · v = had laju (unit/saat) · flags = bilangan bendera semak
const LEVELS = [null,
  { shapes: ['s', 'sm', 'zig'], w: 17, v: 70, flags: 3 },
  { shapes: ['s', 'zig', 'ular'], w: 14, v: 58, flags: 2 },
  { shapes: ['zig', 'ular', 'pusing'], w: 12, v: 48, flags: 2 },
  { shapes: ['ular', 'pusing', 'zig'], w: 10, v: 40, flags: 1 },
];
const MAX_LEVEL = 4;
const AGE_LEVEL = { 3: 1, 4: 1, 5: 2, 6: 3 };
const UP_CLEAN = 2;
const IDLE_MS = 12000;

// Catmull-Rom → polilinear dengan jarak terkumpul.
function sample(pts) {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    for (let t = 0; t < 1; t += 1 / 24) {
      const t2 = t * t, t3 = t2 * t;
      const f = (a, b, c, d) => .5 * ((2 * b) + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push(pts[pts.length - 1]);
  let d = 0;
  return out.map((p, i) => { if (i) d += Math.hypot(p[0] - out[i - 1][0], p[1] - out[i - 1][1]); return { x: p[0], y: p[1], d }; });
}
const SPOON = `<svg viewBox="0 0 60 60" aria-hidden="true"><path d="M30 34 L30 58" stroke="#8A9199" stroke-width="5" stroke-linecap="round"/>
  <ellipse cx="30" cy="30" rx="17" ry="11" fill="#C9D1D9" stroke="#6B7684" stroke-width="2.5"/>
  <g class="st-egg"><ellipse cx="30" cy="22" rx="10" ry="13" fill="#FFFDF5" stroke="#A9773E" stroke-width="2.2"/><ellipse cx="26" cy="17" rx="3" ry="4.5" fill="#fff"/></g></svg>`;

export default {
  id: 'sudu-telur',
  title: 'Lumba Sudu Telur',
  stageLabel: 'Trek lumba dari bawah ke bendera. Seret sudu berisi telur perlahan-lahan di atas trek.',
  lines: {
    intro: 'Lumba sudu telur! Bawa telur sampai ke bendera. Perlahan-lahan, jangan jatuh!',
    laju: 'Perlahan sikit!', jatuh: 'Alamak, jatuh! Cuba lagi.', sampai: 'Sampai! Telur selamat!',
  },
  recorded: ['intro', 'laju', 'jatuh', 'sampai'],

  css: `.su-track { inset: 0; z-index: 1; pointer-events: none; }
.su-track svg { width: 100%; height: 100%; display: block; }
.su-spoon { width: 21%; aspect-ratio: 1; z-index: 4; transform: translate(-50%, -62%); touch-action: none; cursor: grab; padding: 0; }
.su-spoon svg { width: 100%; height: 100%; display: block; overflow: visible; }
.su-spoon .st-egg { transform-origin: 30px 34px; transform-box: view-box; transition: transform .08s; }
.su-spoon.drag { cursor: grabbing; filter: drop-shadow(0 4px 4px rgba(0,0,0,.3)); }
.su-spoon.fall .st-egg { transition: transform .5s ease-in, opacity .5s; transform: translate(14px, 40px) rotate(80deg); opacity: 0; }
.su-meter { left: 6%; top: 11%; width: 5%; height: 26%; z-index: 3; border-radius: 99px; background: rgba(255,253,245,.5); overflow: hidden; display: flex; align-items: flex-end; }
.su-meter i { display: block; width: 100%; height: 0%; background: #22B26A; transition: height .1s, background .2s; }
.su-meter i.warn { background: #F5B82E; } .su-meter i.bad { background: #E5484D; }`,

  stageHtml: () => `<svg class="bg" viewBox="0 0 200 300" preserveAspectRatio="none" aria-hidden="true">
      <rect width="200" height="300" fill="#7CC36A"/>
      <g fill="#6AB35A">${[[20, 40], [170, 70], [40, 200], [160, 230], [100, 280], [30, 270]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="14" ry="5"/>`).join('')}</g>
    </svg>
    <div class="su-track"></div><div class="su-meter" aria-hidden="true"><i></i></div>
    <button class="su-spoon" type="button" aria-label="Sudu berisi telur: seret perlahan di atas trek">${SPOON}</button>`,

  initState: (age) => ({ age, level: AGE_LEVEL[age], rounds: [] }),
  normalize(s, age) {
    if (s.age !== age) { s.age = age; s.level = AGE_LEVEL[age]; }
    if (!Number.isInteger(s.level) || s.level < 1 || s.level > MAX_LEVEL) s.level = AGE_LEVEL[age];
    return s;
  },

  async round(ctx) {
    const { stage, state, say, sfx, anim } = ctx;
    const trackEl = stage.querySelector('.su-track'), spoon = stage.querySelector('.su-spoon'), egg = spoon.querySelector('.st-egg'), meterBar = stage.querySelector('.su-meter i');
    const level = state.level, L = LEVELS[level];

    async function trial(shapeId, demo) {
      const P = sample(SHAPES[shapeId]), total = P[P.length - 1].d;
      const flagsAt = Array.from({ length: L.flags }, (_, i) => Math.round((i + 1) * (P.length - 1) / (L.flags + 1)));
      const path = P.map((p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' L');
      const end = P[P.length - 1];
      const flag = (p, c) => `<g transform="translate(${p.x} ${p.y})"><path d="M0 0 V-12" stroke="#6B4A2A" stroke-width="1.4"/><path d="M0 -12 L8 -9 L0 -6 Z" fill="${c}"/></g>`;
      trackEl.innerHTML = `<svg viewBox="0 0 100 150" preserveAspectRatio="none" aria-hidden="true">
        <path d="M${path}" fill="none" stroke="#C9A06A" stroke-width="${L.w + 2.4}" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M${path}" fill="none" stroke="#E9C98F" stroke-width="${L.w}" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M${path}" fill="none" stroke="#FFFDF5" stroke-width=".8" stroke-dasharray="2 3" opacity=".7"/>
        ${flagsAt.map((i) => flag(P[i], '#2F7DE1')).join('')}
        <g transform="translate(${end.x} ${end.y})"><circle r="${L.w / 2 + 1}" fill="#FFFDF5" opacity=".6"/></g>${flag(end, '#E5484D')}
      </svg>`;
      stage.dataset.path = P.filter((_, i) => i % 4 === 0 || i === P.length - 1).map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(';'); // untuk ujian automatik
      stage.dataset.vmax = String(L.v);

      let idx = 0, checkpoint = 0, falls = 0, wob = 0, lastWarn = 0, done = false, dragging = false, last = null;
      const place = (i) => { Object.assign(spoon.style, { left: P[i].x + '%', top: (P[i].y / 1.5) + '%' }); };
      place(0);
      spoon.classList.remove('fall'); egg.style.transform = '';
      const setMeter = () => { meterBar.style.height = Math.min(100, wob * 100) + '%'; meterBar.className = wob > .75 ? 'bad' : wob > .45 ? 'warn' : ''; };
      setMeter();

      let resolveEvent = null;
      const signal = (v) => { const r = resolveEvent; resolveEvent = null; r?.(v); };
      const ctl = new AbortController();
      const onAbort = () => { ctl.abort(); signal('abort'); };
      ctx.signal.addEventListener('abort', onAbort);
      const toStage = (e) => { const r = stage.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * 100, y: (e.clientY - r.top) / r.height * 150, t: performance.now() }; };

      spoon.addEventListener('pointerdown', (e) => {
        if (done || spoon.classList.contains('fall')) return;
        e.preventDefault(); spoon.setPointerCapture?.(e.pointerId);
        dragging = true; last = toStage(e); spoon.classList.add('drag'); ctx.hand.hide(); signal('grab');
      }, { signal: ctl.signal });
      const release = () => { if (!dragging) return; dragging = false; spoon.classList.remove('drag'); };
      spoon.addEventListener('pointerup', release, { signal: ctl.signal });
      spoon.addEventListener('pointercancel', release, { signal: ctl.signal });
      spoon.addEventListener('pointermove', (e) => {
        if (!dragging || done) return;
        const p = toStage(e), dt = Math.max(.008, (p.t - last.t) / 1000), sp = Math.hypot(p.x - last.x, p.y - last.y) / dt;
        last = p;
        // Cari titik trek terdekat, hanya sekitar kedudukan semasa (tak boleh "lompat" ke bahagian lain trek).
        let best = idx, bd = Infinity;
        for (let i = Math.max(0, idx - 8); i <= Math.min(P.length - 1, idx + 14); i++) { const dd = Math.hypot(P[i].x - p.x, P[i].y - p.y); if (dd < bd) { bd = dd; best = i; } }
        if (bd > L.w / 2 + 3) { signal('off'); return; }
        idx = Math.max(idx, best);
        // Goyangan telur: naik bila laju melebihi had, susut bila perlahan.
        wob = Math.max(0, wob + (sp > L.v ? (sp - L.v) / L.v * dt * 2.6 : -dt * .9));
        egg.style.transform = `rotate(${Math.sin(p.t / 70) * wob * 38}deg)`;
        setMeter();
        place(idx);
        if (wob >= 1) { signal('fast'); return; }
        if (wob > .55 && p.t - lastWarn > 2500) { lastWarn = p.t; say('laju'); }
        flagsAt.forEach((f) => { if (idx >= f && checkpoint < f) { checkpoint = f; sfx.light(); } });
        if (idx >= P.length - 2) signal('finish');
      }, { signal: ctl.signal });
      const next = (ms) => new Promise((res) => { const t = setTimeout(() => { resolveEvent = null; res('idle'); }, ms); resolveEvent = (v) => { clearTimeout(t); res(v); }; });

      const hintSpoon = () => { const r = ctx.toPct(spoon.getBoundingClientRect()); ctx.hand.show(r.left + r.width * .3, r.top + r.width * .2); };
      try {
        if (demo) hintSpoon();
        for (;;) {
          const ev = await next(IDLE_MS);
          ctx.alive();
          if (ev === 'abort') return null;
          if (ev === 'idle') { if (!dragging) hintSpoon(); continue; }
          if (ev === 'grab') continue;
          if (ev === 'finish') { done = true; break; }
          // Jatuh (terlalu laju atau keluar trek): telur jatuh, kembali ke bendera terakhir.
          falls++; dragging = false; spoon.classList.remove('drag'); spoon.classList.add('fall');
          sfx.soft();
          await ctx.wait(Math.max(1200, say('jatuh') + 150));
          idx = checkpoint; wob = 0; setMeter(); place(idx);
          spoon.classList.remove('fall'); egg.style.transform = '';
          anim(spoon, [{ opacity: 0 }, { opacity: 1 }], { duration: 300, fill: 'none' });
        }
      } finally {
        ctl.abort(); ctx.signal.removeEventListener('abort', onAbort); release(); ctx.hand.hide();
      }
      place(P.length - 1);
      sfx.good();
      await ctx.wait(Math.max(1600, say('sampai') + 250));
      return { falls, total: Math.round(total) };
    }

    ctx.progress(L.shapes.length);
    await ctx.ready(); ctx.alive();
    if (ctx.first) await ctx.wait(Math.max(6000, say('intro') + 300));
    const recs = [];
    for (let i = 0; i < L.shapes.length; i++) {
      const r = await trial(L.shapes[i], ctx.first && i === 0 && level <= 2);
      if (!r) return null;
      recs.push(r);
      ctx.mark(i);
      await ctx.wait(300);
    }
    delete stage.dataset.path; delete stage.dataset.vmax;
    const clean = recs.filter((r) => r.falls === 0).length, falls = recs.reduce((a, r) => a + r.falls, 0);
    if (clean >= UP_CLEAN) state.level = Math.min(MAX_LEVEL, level + 1);
    else if (falls >= 6) state.level = Math.max(1, level - 1);
    return {
      record: { level, clean, n: recs.length, falls },
      foundHtml: '',
      text: `Adik bawa telur sampai ke bendera <span class="big-num">${recs.length}</span> kali!` + (clean ? ` <span class="big-num">${clean}</span> kali tanpa jatuh langsung.` : ' Makin perlahan, makin selamat!'),
    };
  },

  parent: {
    stats(s) {
      const last = s.rounds.slice(-7);
      const okP = pct(last.reduce((a, r) => a + (r.clean || 0), 0), last.reduce((a, r) => a + (r.n || 0), 0));
      const avg = last.length ? (last.reduce((a, r) => a + (r.falls || 0), 0) / last.length).toFixed(1) : '–';
      return [
        { v: okP === null ? '–' : okP + '%', label: 'Trek tanpa jatuh' },
        { v: avg, label: 'Purata jatuh / sesi' },
        { v: `${s.level}<small>/${MAX_LEVEL}</small>`, label: 'Tahap' },
      ];
    },
    cols: ['Tahap', 'Tanpa jatuh', 'Jatuh'],
    row: (r) => [r.level, meter(pct(r.clean, r.n)), r.falls || 0],
    explain: `<span><b>Kawalan motor + kawalan diri</b>: menggerakkan jari dengan perlahan dan stabil di sepanjang laluan, sambil menahan keinginan untuk cepat sampai. Ini persediaan untuk memegang pensel dan menulis dengan kemas.</span>
      <span>Tahap 1: trek lebar, banyak bendera semak · Tahap 2–3: trek lebih sempit dan berliku · Tahap 4: trek paling sempit, had laju paling rendah, satu bendera sahaja. Meter di kiri menunjukkan goyangan telur. Naik bila 2/3 trek tanpa jatuh.</span>`,
  },

  mission: {
    title: 'Lumba sudu telur sebenar',
    steps: [
      'Ambil sudu dan bola ping pong (atau telur rebus). Buat garisan mula dan tamat dengan selipar.',
      'Mula berjalan perlahan. Kalau jatuh, mula semula dari tempat terakhir.',
      'Tambah cabaran: jalan berliku di antara kerusi, atau pegang sudu dengan mulut!',
      'Ajak adik-beradik atau kawan berlumba bersama.',
    ],
    why: 'Kenapa? Permainan sukaneka ini melatih keseimbangan, fokus dan kawalan badan, sambil mengajar bahawa perlahan dan berhati-hati kadang-kadang lebih baik daripada laju.',
  },
};
