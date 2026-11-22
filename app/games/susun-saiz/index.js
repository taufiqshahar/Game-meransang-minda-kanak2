// Susun Ikut Saiz: seriasi (menyusun ikut saiz), asas pengukuran dan perbandingan dalam matematik awal.
// Kenderaan sama jenis, saiz berbeza. Seret (atau tekan) ikut turutan: kecil → besar; tahap 4 juga besar → kecil.
// Salah letak = kenderaan kembali ke tempat asal dengan petunjuk; tiada kalah.
import { VEHICLES, vehicleIcon } from '../../kit/vehicles.js';
import { pick, shuffle, pct, meter } from '../../kit/util.js';

const TRIALS = 4;
// n = bilangan kenderaan, ghost = bayang tempat setiap saiz, alt = selang-seli arah (besar → kecil).
const LEVELS = [null,
  { n: 3, ghost: true, alt: false },
  { n: 4, ghost: true, alt: false },
  { n: 5, ghost: false, alt: false },
  { n: 4, ghost: false, alt: true },
];
const MAX_LEVEL = 4;
const AGE_LEVEL = { 3: 1, 4: 2, 5: 3, 6: 3 };
const UP_AT = 3, DOWN_AT = 1;       // percubaan tanpa silap daripada 4
// Lebar (% pentas) mengikut bilangan; nisbah ~1.25–1.45 antara jiran supaya beza saiz jelas untuk budak 3 tahun.
const WIDTHS = { 3: [17, 25, 36], 4: [14, 18.5, 24, 31], 5: [11, 13.5, 17, 21, 27] };
const GAP = 1.2, ROAD_Y = 47.5;     // garis jalan (% tinggi pentas) tempat kenderaan berbaris
const H = (w) => w * 0.5;           // tinggi (% pentas) bagi lebar w: SVG 4:3 dalam pentas 2:3
const IDLE_MS = 10000;
const PRAISE = ['hebat', 'bagus', 'pandainya'];

export default {
  id: 'susun-saiz',
  title: 'Susun Ikut Saiz',
  stageLabel: 'Jalan raya. Susun kenderaan di atas jalan ikut saiz, dari kecil ke besar.',
  lines: {
    intro: 'Jom susun lori! Dari yang kecil sampai yang besar.',
    'kecil-besar': 'Susun dari kecil ke besar.',
    'besar-kecil': 'Sekarang susun dari besar ke kecil.',
    siap: 'Siap! Tersusun cantik.',
  },
  recorded: ['intro', 'kecil-besar', 'besar-kecil', 'siap'],

  css: `.sz-items { inset: 0; z-index: 4; pointer-events: none; }
.sz-item { position: absolute; padding: 0; pointer-events: auto; touch-action: none; transition: left .35s ease, top .35s ease; }
.sz-item svg { width: 100%; height: auto; display: block; }
.sz-item.dragging { transition: none; z-index: 9; filter: drop-shadow(0 6px 6px rgba(0,0,0,.3)); }
.sz-item.placed { pointer-events: none; }
.sz-item:not(.placed):not(:disabled) { animation: wiggle 1.8s ease-in-out infinite; }
.sz-ghosts { inset: 0; z-index: 2; pointer-events: none; }
.sz-ghost { position: absolute; opacity: .22; filter: brightness(0); }
.sz-ghost svg { width: 100%; height: auto; display: block; }
@media (prefers-reduced-motion: reduce) { .sz-item { transition: none; } .sz-item:not(.placed):not(:disabled) { animation: none; } }`,

  stageHtml: () => `<svg class="bg" viewBox="0 0 200 300" preserveAspectRatio="none" aria-hidden="true">
      <rect width="200" height="130" fill="#BFE3F0"/>
      <g fill="#fff" opacity=".85"><ellipse cx="40" cy="62" rx="20" ry="7"/><ellipse cx="54" cy="57" rx="13" ry="7"/><ellipse cx="150" cy="78" rx="18" ry="6"/></g>
      <g fill="#7FB86A"><ellipse cx="20" cy="128" rx="34" ry="14"/><ellipse cx="180" cy="126" rx="38" ry="15"/><ellipse cx="100" cy="130" rx="30" ry="9"/></g>
      <rect y="126" width="200" height="30" fill="#5B6270"/>
      <g fill="#FFE68A">${[0, 1, 2, 3, 4, 5, 6].map((i) => `<rect x="${i * 32 + 4}" y="147" width="16" height="2.5" rx="1"/>`).join('')}</g>
      <rect y="156" width="200" height="144" fill="#A9B2BD"/>
      <g stroke="#fff" stroke-width="2" opacity=".75">${[0, 1, 2, 3].map((i) => `<path d="M${i * 66 + 2} 166 V296"/>`).join('')}<path d="M0 202 H200 M0 247 H200"/></g>
      <rect y="154" width="200" height="4" fill="#E9D7B4"/>
    </svg>
    <div class="sz-ghosts"></div>
    <div class="sz-items"></div>`,

  initState: (age) => ({ age, level: AGE_LEVEL[age], rounds: [] }),
  normalize(s, age) {
    if (s.age !== age) { s.age = age; s.level = AGE_LEVEL[age]; }
    if (!Number.isInteger(s.level) || s.level < 1 || s.level > MAX_LEVEL) s.level = AGE_LEVEL[age];
    return s;
  },

  async round(ctx) {
    const { stage, state, say, sfx, anim } = ctx;
    const itemsEl = stage.querySelector('.sz-items'), ghostsEl = stage.querySelector('.sz-ghosts');
    const level = state.level, L = LEVELS[level];

    // Petak letak di kawasan parkir (2 lajur × 3 baris), kemudian rawak.
    const CELLS = [[25, 60], [75, 60], [25, 75], [75, 75], [25, 89], [75, 89]];

    async function trial(vid, down, demo) {
      const widths = WIDTHS[L.n];
      // Turutan sasaran (ikut rank saiz): rank 0 = paling kecil.
      const order = down ? [...widths.keys()].reverse() : [...widths.keys()];
      const total = widths.reduce((a, w) => a + w, 0) + GAP * (L.n - 1);
      const x0 = (100 - total) / 2;
      // Kedudukan slot ke-k di jalan (kiri, atas) bagi kenderaan rank order[k].
      const slot = [];
      { let x = x0; order.forEach((rank) => { const w = widths[rank]; slot.push({ left: x, top: ROAD_Y - H(w), w }); x += w + GAP; }); }
      const cells = shuffle(CELLS).slice(0, L.n);
      const home = widths.map((w, rank) => ({ left: cells[rank][0] - w / 2 + (Math.random() * 4 - 2), top: cells[rank][1] - H(w) / 2 }));
      const icon = vehicleIcon(vid);
      itemsEl.innerHTML = widths.map((w, rank) => `<button class="sz-item" type="button" data-rank="${rank}" aria-label="Kenderaan saiz ${rank + 1} daripada ${L.n}" style="width:${w}%;left:${home[rank].left}%;top:${home[rank].top}%" disabled>${icon}</button>`).join('');
      ghostsEl.innerHTML = L.ghost ? slot.map((s) => `<div class="sz-ghost" style="width:${s.w}%;left:${s.left}%;top:${s.top}%">${icon}</div>`).join('') : '';
      stage.dataset.dir = down ? 'down' : 'up'; // untuk ujian automatik
      const items = [...itemsEl.querySelectorAll('.sz-item')];
      const byRank = (r) => items[r];
      let step = 0, errors = 0, wrongHere = 0, armed = false, lastAct = performance.now();
      sfx.pop();
      await ctx.wait(Math.max(1200, say(down ? 'besar-kecil' : 'kecil-besar') + 150));

      const arm = (on) => { armed = on; items.forEach((b) => { b.disabled = !on || b.classList.contains('placed'); }); };
      const goHomePos = (b) => { const h = home[Number(b.dataset.rank)]; Object.assign(b.style, { left: h.left + '%', top: h.top + '%' }); };
      const showHint = () => { const b = byRank(order[step]); const r = ctx.toPct(b.getBoundingClientRect()); ctx.hand.show(r.left + r.width * .35, r.top + 1); };

      // Satu cubaan = satu kenderaan dilepas (seret ke jalan) atau ditekan. Selesaikan janji dengan elemen itu.
      let resolveAttempt = null;
      const ctl = new AbortController();
      const onAbort = () => { ctl.abort(); resolveAttempt?.(null); };
      ctx.signal.addEventListener('abort', onAbort);
      let drag = null;
      itemsEl.addEventListener('pointerdown', (e) => {
        const b = e.target.closest('.sz-item'); if (!b || !armed || b.disabled) return;
        e.preventDefault(); b.setPointerCapture?.(e.pointerId);
        const r = stage.getBoundingClientRect(), br = b.getBoundingClientRect();
        drag = { b, x0: e.clientX, y0: e.clientY, dx: e.clientX - br.left, dy: e.clientY - br.top, r, moved: false };
        b.classList.add('dragging'); ctx.hand.hide();
      }, { signal: ctl.signal });
      itemsEl.addEventListener('pointermove', (e) => {
        if (!drag) return;
        if (Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) > 8) drag.moved = true;
        Object.assign(drag.b.style, { left: ((e.clientX - drag.dx - drag.r.left) / drag.r.width * 100) + '%', top: ((e.clientY - drag.dy - drag.r.top) / drag.r.height * 100) + '%' });
      }, { signal: ctl.signal });
      const end = (e) => {
        if (!drag) return;
        const { b, moved, r } = drag; drag = null; b.classList.remove('dragging');
        const yPct = (e.clientY - r.top) / r.height * 100;
        if (!moved || yPct < ROAD_Y + 4) { resolveAttempt?.(b); return; } // tekan, atau lepas di jalan
        goHomePos(b); // lepas di parkir: batal tanpa dikira salah
      };
      itemsEl.addEventListener('pointerup', end, { signal: ctl.signal });
      itemsEl.addEventListener('pointercancel', (e) => { if (drag) { goHomePos(drag.b); drag.b.classList.remove('dragging'); drag = null; } }, { signal: ctl.signal });
      // Papan kekunci (Enter/Space menjana click dengan detail 0).
      itemsEl.addEventListener('click', (e) => { const b = e.target.closest('.sz-item'); if (b && e.detail === 0 && armed && !b.disabled) resolveAttempt?.(b); }, { signal: ctl.signal });
      const nextAttempt = () => new Promise((res) => {
        const timer = setTimeout(() => { resolveAttempt = null; res(undefined); }, 1000);
        resolveAttempt = (b) => { clearTimeout(timer); resolveAttempt = null; res(b); };
      });

      try {
        if (demo) showHint();
        arm(true);
        while (step < L.n) {
          const b = await nextAttempt();
          ctx.alive();
          if (b === undefined) { // tiada tindakan sesaat; ingatkan selepas lama senyap
            if (!drag && performance.now() - lastAct > IDLE_MS) { lastAct = performance.now(); showHint(); say(down ? 'besar-kecil' : 'kecil-besar'); }
            continue;
          }
          if (!b) return null;
          lastAct = performance.now(); ctx.hand.hide();
          const rank = Number(b.dataset.rank);
          if (rank === order[step]) {
            arm(false);
            const s = slot[step];
            b.classList.add('placed'); b.disabled = true;
            Object.assign(b.style, { left: s.left + '%', top: s.top + '%' });
            b.setAttribute('aria-label', `Kenderaan ke-${step + 1} di jalan`);
            sfx.light();
            step++; wrongHere = 0;
            await ctx.wait(380);
            if (step < L.n) arm(true);
          } else {
            arm(false);
            errors++; wrongHere++;
            goHomePos(b); sfx.soft();
            await ctx.wait(380);
            await anim(b, [{ transform: 'translateX(0)' }, { transform: 'translateX(-8%)' }, { transform: 'translateX(8%)' }, { transform: 'translateX(0)' }], { duration: 360, fill: 'none' });
            if (wrongHere === 1) await ctx.wait(Math.max(900, say('cuba-lagi') + 100));
            else { say(down ? 'besar-kecil' : 'kecil-besar'); showHint(); }
            arm(true);
          }
        }
      } finally {
        ctl.abort(); ctx.signal.removeEventListener('abort', onAbort);
        ctx.hand.hide();
      }

      // Siap: jalan raya kenderaan bergerak ke kanan.
      ghostsEl.innerHTML = '';
      sfx.good();
      const d = say('siap');
      await ctx.wait(500);
      const sw = stage.getBoundingClientRect().width;
      await Promise.all(items.map((b) => anim(b, [{ transform: 'translateX(0)' }, { transform: `translateX(${sw}px)` }], { duration: 1300, easing: 'ease-in' })));
      ctx.alive();
      await ctx.wait(Math.max(200, d - 1600));
      if (errors === 0) await ctx.wait(Math.max(700, say(pick(PRAISE)) + 100));
      return { errors, down };
    }

    ctx.progress(TRIALS);
    await ctx.ready(); ctx.alive();
    if (ctx.first) await ctx.wait(Math.max(2600, say('intro') + 200));
    const ids = shuffle(VEHICLES.map((v) => v.id));
    if (ctx.first) { ids.splice(ids.indexOf('lori'), 1); ids.unshift('lori'); }
    const recs = [];
    for (let i = 0; i < TRIALS; i++) {
      const down = L.alt && i % 2 === 1;
      recs.push(await trial(ids[i], down, ctx.first && i === 0 && level <= 2));
      ctx.mark(i);
      await ctx.wait(250);
    }
    delete stage.dataset.dir;

    const clean = recs.filter((r) => r.errors === 0).length;
    const errors = recs.reduce((a, r) => a + r.errors, 0);
    if (clean >= UP_AT) state.level = Math.min(MAX_LEVEL, level + 1);
    else if (clean <= DOWN_AT) state.level = Math.max(1, level - 1);
    return {
      record: { level, n: L.n, trials: recs.length, clean, errors },
      foundHtml: ids.slice(0, TRIALS).map(vehicleIcon).join(''),
      text: `Adik susun <span class="big-num">${recs.length}</span> barisan kenderaan!` + (clean ? ` <span class="big-num">${clean}</span> tanpa silap.` : ' Makin lama makin pandai.'),
    };
  },

  parent: {
    stats(s) {
      const last = s.rounds.slice(-7);
      const cleanP = pct(last.reduce((a, r) => a + (r.clean || 0), 0), last.reduce((a, r) => a + (r.trials || 0), 0));
      const best = s.rounds.reduce((m, r) => (r.clean ? Math.max(m, r.n || 0) : m), 0);
      return [
        { v: cleanP === null ? '–' : cleanP + '%', label: 'Susunan tanpa silap' },
        { v: `${s.level}<small>/${MAX_LEVEL}</small>`, label: 'Tahap' },
        { v: best ? `${best}<small> saiz</small>` : '–', label: 'Barisan terpanjang' },
      ];
    },
    cols: ['Tahap', 'Tanpa silap', 'Silap'],
    row: (r) => [r.level, meter(pct(r.clean, r.trials)), r.errors],
    explain: `<span><b>Seriasi</b>: menyusun benda ikut saiz. Ini asas pengukuran ("lebih panjang", "paling besar") dan turutan nombor. Kebanyakan budak 3 tahun boleh menyusun 3 saiz dengan bantuan; budak 5–6 tahun boleh 5 saiz dan menyusun terbalik (besar ke kecil), yang memerlukan fleksibiliti.</span>
      <span>Tahap 1–2: 3–4 kenderaan dengan bayang tempat · Tahap 3: 5 kenderaan tanpa bayang · Tahap 4: selang-seli kecil→besar dan besar→kecil. Naik bila 3/4 barisan tanpa silap; turun bila ≤ 1.</span>`,
  },

  mission: {
    title: 'Main "Susun Ikut Saiz" di dapur',
    steps: [
      'Ambil 3 mangkuk atau cawan yang berlainan saiz. Minta anak susun dari kecil ke besar.',
      'Guna kata saiz: <b>"Ini kecil, ini lebih besar, ini paling besar."</b>',
      'Bila dah senang, tambah satu lagi, atau minta susun terbalik: besar ke kecil.',
      'Cuba juga dengan kasut ahli keluarga: kasut siapa paling kecil?',
    ],
    why: 'Kenapa? Menyusun ikut saiz melatih anak membanding dan membuat turutan. Inilah asas untuk memahami ukuran dan nombor kemudian nanti.',
  },
};
