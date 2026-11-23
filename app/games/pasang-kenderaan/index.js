// Pasang Kenderaan: puzzle kepingan (hubungan bahagian-keseluruhan, visual-ruang).
// Gambar kenderaan dipotong 2–6 keping. Seret kepingan ke bayangnya; atau tekan kepingan, kemudian tekan tempatnya.
// Siap = kenderaan bergerak dan Hafiz sebut namanya. Tiada kalah: salah letak hanya kembali ke tempat asal.
import { VEHICLES, vehicleIcon } from '../../kit/vehicles.js';
import { pick, shuffle, pct, meter } from '../../kit/util.js';

// cols × rows = potongan, puzzles = bilangan puzzle setiap pusingan, tol = jarak lekat (% pentas), grid = garis bantuan.
const LEVELS = [null,
  { cols: 2, rows: 1, puzzles: 3, tol: 14, grid: true },
  { cols: 3, rows: 1, puzzles: 3, tol: 12, grid: true },
  { cols: 2, rows: 2, puzzles: 2, tol: 10, grid: true },
  { cols: 3, rows: 2, puzzles: 2, tol: 9, grid: false },
];
const MAX_LEVEL = 4;
const AGE_LEVEL = { 3: 1, 4: 2, 5: 3, 6: 3 };
// Kenderaan yang padat (basikal dan helikopter banyak ruang kosong; kepingannya sukar dikenali).
const POOL = ['lori', 'bas', 'bomba', 'ambulans', 'keretaapi', 'jengkaut'];
// Papan (gambar penuh, nisbah 4:3): % pentas. Tinggi = lebar × 0.5 kerana pentas 2:3.
const BX = 12, BW = 76, BY = 18.5, BH = BW * 0.5;
// Kawasan longgok kepingan di bawah.
const ZX = 3, ZW = 94, ZY = 61, ZH = 37;
const IDLE_MS = 11000;

export default {
  id: 'pasang-kenderaan',
  title: 'Pasang Kenderaan',
  stageLabel: 'Puzzle kenderaan. Seret setiap kepingan ke bayangnya, atau tekan kepingan kemudian tekan tempatnya.',
  lines: {
    intro: 'Jom pasang kenderaan! Seret kepingan ke tempatnya.',
    siap: 'Wah, dah siap!',
    seret: 'Cari tempatnya, kemudian seret ke situ.',
  },
  recorded: ['intro', 'siap', 'seret'],

  css: `.pv-board { left: ${BX}%; top: ${BY}%; width: ${BW}%; height: ${BH}%; z-index: 2; border-radius: calc(var(--u) * 4);
  background: #FFFDF5; box-shadow: 0 0 0 calc(var(--u) * 1.2) #E9D7B4, 0 calc(var(--u) * 1.4) 0 rgba(0,0,0,.18); }
.pv-ghost { position: absolute; inset: 0; opacity: .16; filter: brightness(0); transition: opacity .3s; }
.pv-ghost svg, .pv-in svg { width: 100%; height: 100%; display: block; }
.pv-lines { position: absolute; inset: 0; }
.pv-lines svg { width: 100%; height: 100%; display: block; }
.pv-hint { position: absolute; border-radius: calc(var(--u) * 2); box-shadow: inset 0 0 0 calc(var(--u) * 1.2) var(--kuning); animation: pv-blink .8s ease-in-out 4; opacity: 0; pointer-events: none; }
@keyframes pv-blink { 50% { opacity: 1; } }
.pv-pieces { inset: 0; z-index: 4; pointer-events: none; }
.pv-piece { position: absolute; padding: 0; overflow: hidden; pointer-events: auto; touch-action: none; border-radius: calc(var(--u) * 1.5);
  background: #FFFDF5; box-shadow: 0 calc(var(--u) * 1) 0 rgba(0,0,0,.22), inset 0 0 0 calc(var(--u) * .5) #E9D7B4; transition: left .3s ease, top .3s ease, box-shadow .2s; }
.pv-in { position: absolute; }
.pv-piece.dragging { transition: none; z-index: 9; box-shadow: 0 calc(var(--u) * 2.5) calc(var(--u) * 2) rgba(0,0,0,.3); }
.pv-piece.sel { box-shadow: 0 0 0 calc(var(--u) * 1.2) var(--kuning), 0 calc(var(--u) * 1) 0 rgba(0,0,0,.22); z-index: 8; }
.pv-piece.placed { pointer-events: none; box-shadow: none; border-radius: 0; background: transparent; }
.pv-piece:disabled { cursor: default; }
@media (prefers-reduced-motion: reduce) { .pv-piece { transition: none; } .pv-hint { animation: none; opacity: 1; } }`,

  stageHtml: () => `<svg class="bg" viewBox="0 0 200 300" preserveAspectRatio="none" aria-hidden="true">
      <rect width="200" height="300" fill="#7DB7D6"/>
      <g fill="#6AA6C7">${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => `<rect x="${i * 22 - 4}" y="0" width="10" height="300"/>`).join('')}</g>
      <rect y="176" width="200" height="124" fill="#C9A26B"/>
      <rect y="176" width="200" height="5" fill="#9C7A45"/>
      <g fill="#B38A52" opacity=".55">${[[30, 200], [150, 230], [90, 270], [180, 285], [20, 260]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="18" ry="4"/>`).join('')}</g>
    </svg>
    <div class="pv-board"><div class="pv-ghost"></div><div class="pv-lines"></div></div>
    <div class="pv-pieces"></div>`,

  initState: (age) => ({ age, level: AGE_LEVEL[age], rounds: [] }),
  normalize(s, age) {
    if (s.age !== age) { s.age = age; s.level = AGE_LEVEL[age]; }
    if (!Number.isInteger(s.level) || s.level < 1 || s.level > MAX_LEVEL) s.level = AGE_LEVEL[age];
    return s;
  },

  async round(ctx) {
    const { stage, state, say, sfx, anim } = ctx;
    const board = stage.querySelector('.pv-board'), ghost = stage.querySelector('.pv-ghost'), lines = stage.querySelector('.pv-lines');
    const piecesEl = stage.querySelector('.pv-pieces');
    const level = state.level, L = LEVELS[level];
    const PW = BW / L.cols, PH = BH / L.rows;
    const N = L.cols * L.rows;

    async function puzzle(vid, demo) {
      const icon = vehicleIcon(vid);
      // Sasaran kepingan k (baris r, lajur c) di papan, dan kedudukan asal di longgok (petak dikocok, bukan susunan asal).
      const target = Array.from({ length: N }, (_, k) => ({ left: BX + (k % L.cols) * PW, top: BY + Math.floor(k / L.cols) * PH }));
      let order; do { order = shuffle([...Array(N).keys()]); } while (N > 1 && order.every((v, i) => v === i));
      const cw = ZW / L.cols, ch = ZH / L.rows;
      const home = order.map((cell) => ({ left: ZX + (cell % L.cols) * cw + (cw - PW) / 2 + (Math.random() * 3 - 1.5), top: ZY + Math.floor(cell / L.cols) * ch + (ch - PH) / 2 + (Math.random() * 2 - 1) }));
      ghost.innerHTML = icon; ghost.style.opacity = '';
      // Garis bantuan putus-putus di sempadan kepingan.
      const seg = (d) => `<path d="${d}" stroke="#2F7DE1" stroke-width="2" stroke-dasharray="6 5" vector-effect="non-scaling-stroke" opacity=".55"/>`;
      lines.innerHTML = L.grid ? `<svg viewBox="0 0 ${L.cols} ${L.rows}" preserveAspectRatio="none" aria-hidden="true">${[...Array(L.cols - 1)].map((_, i) => seg(`M${i + 1} 0 V${L.rows}`)).join('')}${[...Array(L.rows - 1)].map((_, i) => seg(`M0 ${i + 1} H${L.cols}`)).join('')}</svg>` : '';
      piecesEl.innerHTML = target.map((_, k) => {
        const c = k % L.cols, r = Math.floor(k / L.cols);
        return `<button class="pv-piece" type="button" data-k="${k}" aria-label="Kepingan ${k + 1} daripada ${N}" style="left:${home[k].left}%;top:${home[k].top}%;width:${PW}%;height:${PH}%" disabled><span class="pv-in" style="width:${L.cols * 100}%;height:${L.rows * 100}%;left:${-c * 100}%;top:${-r * 100}%">${icon}</span></button>`;
      }).join('');
      stage.dataset.vehicle = vid; // untuk ujian automatik
      const pieces = [...piecesEl.querySelectorAll('.pv-piece')];
      let placed = 0, misses = 0, armed = false, sel = null, lastAct = performance.now();
      const missOf = new Array(N).fill(0);
      const arm = (on) => { armed = on; pieces.forEach((p) => { p.disabled = !on || p.classList.contains('placed'); }); };
      const setPos = (p, pos) => Object.assign(p.style, { left: pos.left + '%', top: pos.top + '%' });
      const select = (p) => { if (sel) sel.classList.remove('sel'); sel = p; if (p) p.classList.add('sel'); };
      const flashTarget = (k) => {
        const h = document.createElement('div'); h.className = 'pv-hint';
        Object.assign(h.style, { left: ((k % L.cols) / L.cols * 100) + '%', top: (Math.floor(k / L.cols) / L.rows * 100) + '%', width: (100 / L.cols) + '%', height: (100 / L.rows) + '%' });
        board.appendChild(h); setTimeout(() => h.remove(), 3400);
      };
      // Tangan: dari kepingan ke tempatnya (dua kali), kemudian hilang.
      const showMove = async (k) => {
        const p = pieces[k];
        for (let i = 0; i < 2; i++) {
          ctx.hand.show(parseFloat(p.style.left) + PW * .35, parseFloat(p.style.top) + PH * .3);
          await ctx.wait(900);
          ctx.hand.show(target[k].left + PW * .35, target[k].top + PH * .3);
          await ctx.wait(900);
        }
        ctx.hand.hide();
      };

      // Cuba letak kepingan p dengan pusatnya di (x, y) % pentas.
      let resolveAct = null;
      const tryPlace = (p, x, y) => {
        const k = Number(p.dataset.k), t = target[k];
        const d = Math.hypot(x - (t.left + PW / 2), (y - (t.top + PH / 2)) * 1.5); // 1.5: tukar % tinggi ke unit lebar
        const onBoard = x > BX && x < BX + BW && y > BY && y < BY + BH;
        resolveAct?.({ p, ok: d < L.tol, onBoard });
      };

      const ctl = new AbortController();
      const onAbort = () => { ctl.abort(); resolveAct?.(null); };
      ctx.signal.addEventListener('abort', onAbort);
      let drag = null;
      piecesEl.addEventListener('pointerdown', (e) => {
        const p = e.target.closest('.pv-piece'); if (!p || !armed || p.disabled) return;
        e.preventDefault(); p.setPointerCapture?.(e.pointerId);
        const r = stage.getBoundingClientRect(), pr = p.getBoundingClientRect();
        drag = { p, x0: e.clientX, y0: e.clientY, dx: e.clientX - pr.left, dy: e.clientY - pr.top, r, moved: false };
        p.classList.add('dragging'); ctx.hand.hide();
      }, { signal: ctl.signal });
      piecesEl.addEventListener('pointermove', (e) => {
        if (!drag) return;
        if (Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) > 8) drag.moved = true;
        Object.assign(drag.p.style, { left: ((e.clientX - drag.dx - drag.r.left) / drag.r.width * 100) + '%', top: ((e.clientY - drag.dy - drag.r.top) / drag.r.height * 100) + '%' });
      }, { signal: ctl.signal });
      piecesEl.addEventListener('pointerup', () => {
        if (!drag) return;
        const { p, moved } = drag; drag = null; p.classList.remove('dragging');
        lastAct = performance.now();
        if (!moved) { select(sel === p ? null : p); sfx.pop(); return; }   // tekan = pilih
        select(null);
        tryPlace(p, parseFloat(p.style.left) + PW / 2, parseFloat(p.style.top) + PH / 2);
      }, { signal: ctl.signal });
      piecesEl.addEventListener('pointercancel', () => { if (drag) { drag.p.classList.remove('dragging'); setPos(drag.p, home[Number(drag.p.dataset.k)]); drag = null; } }, { signal: ctl.signal });
      // Mod tekan-tekan: kepingan dipilih, kemudian tekan tempat di papan.
      board.addEventListener('pointerdown', (e) => {
        if (!sel || !armed) return;
        const r = stage.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width * 100, y = (e.clientY - r.top) / r.height * 100;
        const p = sel; select(null); lastAct = performance.now();
        tryPlace(p, x, y);
      }, { signal: ctl.signal });
      const nextAct = () => new Promise((res) => {
        const timer = setTimeout(() => { resolveAct = null; res(undefined); }, 1000);
        resolveAct = (v) => { clearTimeout(timer); resolveAct = null; res(v); };
      });

      sfx.pop();
      try {
        await ctx.wait(500);
        if (demo) await showMove(0);
        arm(true);
        while (placed < N) {
          const a = await nextAct();
          ctx.alive();
          if (a === undefined) {
            if (!drag && performance.now() - lastAct > IDLE_MS) {
              lastAct = performance.now();
              const k = Number(pick(pieces.filter((p) => !p.classList.contains('placed'))).dataset.k);
              say('seret'); flashTarget(k); showMove(k).catch(() => {});
            }
            continue;
          }
          if (!a) return null;
          const k = Number(a.p.dataset.k);
          if (a.ok) {
            setPos(a.p, target[k]); a.p.classList.add('placed'); a.p.disabled = true;
            a.p.setAttribute('aria-label', `Kepingan ${k + 1} di tempatnya`);
            placed++; sfx.light();
            continue;
          }
          setPos(a.p, home[k]);
          if (!a.onBoard) continue;           // dilepas di luar papan: bukan cubaan
          misses++; missOf[k]++;
          sfx.soft();
          if (missOf[k] >= 2) { flashTarget(k); missOf[k] = 0; }
        }
      } finally {
        ctl.abort(); ctx.signal.removeEventListener('abort', onAbort);
        ctx.hand.hide(); arm(false);
      }

      // Siap: garis bantuan hilang, kenderaan "hidup" dan bergerak keluar.
      lines.innerHTML = ''; ghost.style.opacity = '0';
      await ctx.wait(350);
      sfx.good();
      await ctx.wait(Math.max(1000, say('siap') + 100));
      await ctx.wait(Math.max(900, say('v-' + vid) + 200));
      const sw = stage.getBoundingClientRect().width;
      await Promise.all(pieces.map((p) => anim(p, [{ transform: 'translateX(0)' }, { transform: `translateX(${sw}px)` }], { duration: 1200, easing: 'ease-in' })));
      ctx.alive();
      return { misses, pieces: N };
    }

    ctx.progress(L.puzzles);
    await ctx.ready(); ctx.alive();
    if (ctx.first) await ctx.wait(Math.max(2600, say('intro') + 200));
    const ids = shuffle(POOL);
    const recs = [];
    for (let i = 0; i < L.puzzles; i++) {
      recs.push(await puzzle(ids[i], ctx.first && i === 0 && level <= 2));
      ctx.mark(i);
      if (i < L.puzzles - 1) await ctx.wait(Math.max(500, recs[i].misses === 0 ? say(pick(['hebat', 'bagus', 'pandainya'])) + 100 : 400));
    }
    delete stage.dataset.vehicle;

    const misses = recs.reduce((a, r) => a + r.misses, 0), pieces = recs.reduce((a, r) => a + r.pieces, 0);
    if (misses <= 1) state.level = Math.min(MAX_LEVEL, level + 1);
    else if (misses >= pieces) state.level = Math.max(1, level - 1);
    return {
      record: { level, puzzles: recs.length, pieces, misses },
      foundHtml: ids.slice(0, recs.length).map(vehicleIcon).join(''),
      text: `Adik pasang <span class="big-num">${recs.length}</span> kenderaan daripada <span class="big-num">${pieces}</span> kepingan!` + (misses <= 1 ? ' Tepat sekali!' : ''),
    };
  },

  parent: {
    stats(s) {
      const last = s.rounds.slice(-7);
      const acc = pct(last.reduce((a, r) => a + (r.pieces || 0), 0), last.reduce((a, r) => a + (r.pieces || 0) + (r.misses || 0), 0));
      const best = s.rounds.reduce((m, r) => (r.misses <= 1 ? Math.max(m, (r.pieces || 0) / (r.puzzles || 1)) : m), 0);
      return [
        { v: acc === null ? '–' : acc + '%', label: 'Ketepatan letak' },
        { v: `${s.level}<small>/${MAX_LEVEL}</small>`, label: 'Tahap' },
        { v: best ? `${best}<small> keping</small>` : '–', label: 'Puzzle terbesar (tepat)' },
      ];
    },
    cols: ['Tahap', 'Ketepatan', 'Silap'],
    row: (r) => [r.level, meter(pct(r.pieces, (r.pieces || 0) + (r.misses || 0))), r.misses],
    explain: `<span><b>Visual-ruang (bahagian-keseluruhan)</b>: melihat sekeping gambar dan tahu di mana tempatnya dalam keseluruhan. Kemahiran puzzle pada umur prasekolah dikaitkan dengan kemahiran geometri dan matematik kemudian.</span>
      <span>Tahap 1: 2 keping · Tahap 2: 3 jalur · Tahap 3: 4 keping (2×2) · Tahap 4: 6 keping tanpa garis bantuan. Anak boleh seret, atau tekan kepingan kemudian tekan tempatnya. <b>Ketepatan</b> = kepingan ÷ (kepingan + letak silap di papan). Naik bila silap ≤ 1 dalam satu pusingan.</span>`,
  },

  mission: {
    title: 'Buat puzzle sendiri daripada kotak bijirin',
    steps: [
      'Potong muka hadapan kotak bijirin atau gambar majalah kepada 2 keping. Minta anak cantumkan.',
      'Bila dah senang, potong 3 atau 4 keping.',
      'Tanya semasa main: <b>"Bahagian ni ada roda. Roda selalunya kat mana?"</b>',
      'Biar anak potong (dengan gunting kanak-kanak) dan anda pula yang cantumkan.',
    ],
    why: 'Kenapa? Puzzle melatih anak melihat bentuk, memutar gambaran dalam kepala dan sabar mencuba. Membuat puzzle sendiri juga melatih motor halus.',
  },
};
