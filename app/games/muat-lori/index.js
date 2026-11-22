// Muat Lori: menghasilkan kuantiti ikut nombor (lebih sukar daripada mengira set yang diberi).
// Seret (atau tekan) batu bata ke dalam lori sehingga sama dengan nombor, kemudian tekan "Jalan!" untuk semak sendiri.
import { VEHICLE } from '../../kit/vehicles.js';
import { pick, shuffle, pct, meter } from '../../kit/util.js';

const TRIALS = 5;
const LEVELS = [null, { lo: 1, hi: 3, aloud: true, dots: true }, { lo: 2, hi: 5, aloud: true, dots: true }, { lo: 3, hi: 7, aloud: false, dots: false }, { lo: 5, hi: 10, aloud: false, dots: false }];
const MAX_LEVEL = 4;
const AGE_LEVEL = { 3: 1, 4: 2, 5: 3, 6: 3 };
const UP_AT = 4, DOWN_AT = 2;
const IDLE_MS = 10000;
const PRAISE = ['hebat', 'bagus', 'pandainya', 'betul'];
// Kedudukan batu bata dalam bak lori (% kotak lori): 4 sebaris, bertimbun ke atas (bak = x 6–62%, lantai di y≈68%).
const BED = Array.from({ length: 10 }, (_, i) => [7 + (i % 4) * 14, 54 - Math.floor(i / 4) * 13]);
const BRICK = `<svg viewBox="0 0 40 22" aria-hidden="true"><rect x="1.5" y="1.5" width="37" height="19" rx="2.5" fill="#C8553D" stroke="#8A3322" stroke-width="2.5"/><path d="M1.5 11 H38.5 M14 1.5 V11 M27 11 V20.5" stroke="#8A3322" stroke-width="1.6" opacity=".7"/><rect x="5" y="4" width="7" height="2" rx="1" fill="#fff" opacity=".35"/></svg>`;
const GO = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 20V4" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M6 5h11l-3 4 3 4H6z" fill="currentColor"/></svg>`;

export default {
  id: 'muat-lori',
  title: 'Muat Lori',
  stageLabel: 'Tapak pembinaan. Masukkan batu bata ke dalam lori ikut nombor, kemudian tekan butang Jalan.',
  lines: {
    intro: 'Jom muat batu bata dalam lori! Tengok nombor, kemudian seret batu bata.',
    jalan: 'Lori jalan!',
    lebih: 'Terlebih. Keluarkan satu.',
    kurang: 'Belum cukup. Tambah lagi.',
    'tekan-jalan': 'Dah cukup? Tekan butang jalan.',
  },
  recorded: ['intro', 'jalan', 'lebih', 'kurang', 'tekan-jalan'],

  css: `.ml-truck { left: 34%; top: 46%; width: 64%; z-index: 2; pointer-events: none; }
.ml-truck > svg { width: 100%; height: auto; display: block; }
.ml-sign { left: 52%; top: 15%; width: 30%; z-index: 4; padding: calc(var(--u) * 2) 0; text-align: center;
  background: var(--kertas); border: calc(var(--u) * 1.2) solid #F28A2C; border-radius: calc(var(--u) * 4);
  font-family: var(--font-display); font-weight: 700; font-size: calc(var(--u) * 15); line-height: 1; color: var(--ink); }
.ml-sign .dots { display: flex; flex-wrap: wrap; justify-content: center; gap: calc(var(--u) * .8); width: calc(var(--u) * 15); margin: calc(var(--u) * 1.5) auto 0; }
.ml-sign .dots i { width: calc(var(--u) * 2.2); height: calc(var(--u) * 2.2); border-radius: 50%; background: #C8553D; }
.ml-bricks { inset: 0; z-index: 5; pointer-events: none; }
.ml-brick { position: absolute; width: 9%; padding: 0; pointer-events: auto; touch-action: none; }
.ml-brick svg { width: 100%; height: auto; display: block; }
.ml-brick.dragging { z-index: 9; transform: scale(1.15); filter: drop-shadow(0 4px 4px rgba(0,0,0,.3)); }
.ml-brick:disabled { pointer-events: none; }
.ml-go { left: 6%; top: 16%; width: 30%; height: 12%; z-index: 4; border-radius: calc(var(--u) * 4);
  background: var(--hijau); color: var(--kertas); box-shadow: 0 calc(var(--u) * 1.2) 0 var(--hijau-tekan);
  display: flex; align-items: center; justify-content: center; gap: calc(var(--u) * 1.5);
  font-family: var(--font-display); font-weight: 700; font-size: calc(var(--u) * 6.5); }
.ml-go svg { width: calc(var(--u) * 7); height: auto; }
.ml-go:disabled { opacity: .45; box-shadow: none; }
.ml-count { left: 34%; top: 41%; width: 64%; text-align: center; z-index: 4; pointer-events: none;
  font-family: var(--font-display); font-weight: 700; font-size: calc(var(--u) * 6); color: var(--kertas); text-shadow: 0 calc(var(--u) * .6) 0 rgba(0,0,0,.35); }`,

  stageHtml: () => `<svg class="bg" viewBox="0 0 200 300" preserveAspectRatio="none" aria-hidden="true">
      <rect width="200" height="150" fill="#BFE3F0"/>
      <g fill="#9AB3C7"><rect x="120" y="40" width="34" height="110"/><rect x="160" y="70" width="30" height="80"/></g>
      <g stroke="#F5B82E" stroke-width="3" fill="none"><path d="M40 150 V20 H110 M40 30 L60 20 M40 40 L70 20 M50 20 V150"/><path d="M104 20 V48"/></g>
      <rect x="98" y="48" width="12" height="8" fill="#C8553D"/>
      <rect y="146" width="200" height="154" fill="#C9A26B"/>
      <g fill="#B38A52" opacity=".7"><ellipse cx="40" cy="200" rx="30" ry="6"/><ellipse cx="160" cy="270" rx="34" ry="7"/><ellipse cx="90" cy="240" rx="20" ry="4"/></g>
      <path d="M0 150 H200" stroke="#9C7A45" stroke-width="2"/>
      <g><path d="M8 300 L22 262 L36 300 Z" fill="#F28A2C"/><rect x="14" y="282" width="16" height="4" fill="#fff"/><rect x="11" y="296" width="22" height="4" fill="#2B2F36"/></g>
    </svg>
    <div class="ml-truck" aria-hidden="true">${VEHICLE.lori().replace(/role="img" aria-label="[^"]*"/, 'aria-hidden="true"')}</div>
    <div class="ml-count" aria-live="polite"></div>
    <div class="ml-sign" aria-live="polite"></div>
    <button class="ml-go" type="button" disabled>${GO}<span>Jalan!</span></button>
    <div class="ml-bricks"></div>`,

  initState: (age) => ({ age, level: AGE_LEVEL[age], rounds: [] }),
  normalize(s, age) {
    if (s.age !== age) { s.age = age; s.level = AGE_LEVEL[age]; }
    if (!Number.isInteger(s.level) || s.level < 1 || s.level > MAX_LEVEL) s.level = AGE_LEVEL[age];
    return s;
  },

  async round(ctx) {
    const { stage, state, say, sfx, anim } = ctx;
    const truck = stage.querySelector('.ml-truck'), sign = stage.querySelector('.ml-sign'), go = stage.querySelector('.ml-go');
    const bricksEl = stage.querySelector('.ml-bricks'), countEl = stage.querySelector('.ml-count');
    const level = state.level, L = LEVELS[level];

    // Kedudukan (% pentas) slot ke-i dalam bak lori.
    const bedSpot = (i) => { const t = ctx.toPct(truck.getBoundingClientRect()); const th = t.width * 0.75 * (2 / 3); return { left: t.left + t.width * BED[i][0] / 100, top: t.top + th * BED[i][1] / 100 }; };
    const inBed = (x, y) => { const r = truck.getBoundingClientRect(); return x > r.left && x < r.left + r.width * .66 && y > r.top + r.height * .2 && y < r.top + r.height * .72; };

    async function trial(target, demo) {
      // Longgok batu bata: sasaran + 2–3 lebihan, disusun di kiri bawah.
      const total = Math.min(13, target + 2 + Math.floor(Math.random() * 2));
      const pile = Array.from({ length: total }, (_, i) => ({ left: 3 + (i % 3) * 10.5, top: 64 + Math.floor(i / 3) * 5 }));
      bricksEl.innerHTML = pile.map((p, i) => `<button class="ml-brick" type="button" data-i="${i}" style="left:${p.left}%;top:${p.top}%" aria-label="Batu bata">${BRICK}</button>`).join('');
      const bricks = [...bricksEl.querySelectorAll('.ml-brick')];
      const loaded = [];
      sign.innerHTML = `${target}${L.dots ? `<div class="dots">${'<i></i>'.repeat(target)}</div>` : ''}`;
      countEl.textContent = '';
      truck.getAnimations().forEach((a) => a.cancel()); truck.style.left = '34%';
      const setBricks = (on) => bricks.forEach((b) => { b.disabled = !on; });
      setBricks(false); go.disabled = true;
      await ctx.wait(Math.max(900, say('n' + target) + 200));

      const relayout = () => loaded.forEach((b, i) => { const s = bedSpot(i); Object.assign(b.style, { left: s.left + '%', top: s.top + '%' }); });
      const load = (b) => {
        if (loaded.length >= 10) return;
        loaded.push(b); b.dataset.in = '1'; relayout();
        if (L.aloud) say('n' + loaded.length); else sfx.pop();
        countEl.textContent = L.aloud ? String(loaded.length) : '';
        lastAct = performance.now();
      };
      const unload = (b) => {
        loaded.splice(loaded.indexOf(b), 1); delete b.dataset.in;
        const p = pile[Number(b.dataset.i)]; Object.assign(b.style, { left: p.left + '%', top: p.top + '%' });
        relayout(); sfx.soft();
        countEl.textContent = L.aloud && loaded.length ? String(loaded.length) : '';
        lastAct = performance.now();
      };

      // Seret (pointer) atau tekan: kawalan sendiri, dibuang bila percubaan tamat atau pusingan dibatalkan.
      const ctl = new AbortController();
      const onAbort = () => ctl.abort(); ctx.signal.addEventListener('abort', onAbort);
      let drag = null, lastAct = performance.now();
      bricksEl.addEventListener('pointerdown', (e) => {
        const b = e.target.closest('.ml-brick'); if (!b || b.disabled) return;
        e.preventDefault(); b.setPointerCapture?.(e.pointerId);
        const r = stage.getBoundingClientRect(), br = b.getBoundingClientRect();
        drag = { b, x0: e.clientX, y0: e.clientY, dx: e.clientX - br.left, dy: e.clientY - br.top, r, moved: false };
        b.classList.add('dragging');
      }, { signal: ctl.signal });
      bricksEl.addEventListener('pointermove', (e) => {
        if (!drag) return;
        if (Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) > 8) drag.moved = true;
        Object.assign(drag.b.style, { left: ((e.clientX - drag.dx - drag.r.left) / drag.r.width * 100) + '%', top: ((e.clientY - drag.dy - drag.r.top) / drag.r.height * 100) + '%' });
      }, { signal: ctl.signal });
      const end = (e) => {
        if (!drag) return;
        const { b, moved } = drag; drag = null; b.classList.remove('dragging');
        const isIn = b.dataset.in === '1';
        if (!moved) { isIn ? unload(b) : load(b); return; }            // tekan = tukar tempat
        if (inBed(e.clientX, e.clientY)) { if (isIn) relayout(); else load(b); }
        else if (isIn) unload(b);
        else { const p = pile[Number(b.dataset.i)]; Object.assign(b.style, { left: p.left + '%', top: p.top + '%' }); }
      };
      bricksEl.addEventListener('pointerup', end, { signal: ctl.signal });
      bricksEl.addEventListener('pointercancel', end, { signal: ctl.signal });

      setBricks(true); go.disabled = false;
      if (demo) { const r = ctx.toPct(bricks[0].getBoundingClientRect()); ctx.hand.show(r.left + 2, r.top + 1); }
      let presses = 0, firstOk = null, remindedAt = 0;
      try {
        for (;;) {
          const t = await ctx.tap({ selector: '.ml-go', ms: 1000 });
          ctx.hand.hide();
          if (!t) {
            const idle = performance.now() - Math.max(lastAct, remindedAt);
            if (idle > IDLE_MS) { remindedAt = performance.now(); say(loaded.length === target ? 'tekan-jalan' : (loaded.length < target ? 'kurang' : 'lebih')); }
            continue;
          }
          presses++;
          const ok = loaded.length === target;
          if (firstOk === null) firstOk = ok;
          if (ok) break;
          setBricks(false); go.disabled = true; sfx.soft();
          await anim(truck, [{ transform: 'translateX(0)' }, { transform: 'translateX(-2%)' }, { transform: 'translateX(2%)' }, { transform: 'translateX(0)' }], { duration: 360, fill: 'none' });
          await ctx.wait(Math.max(1200, say(loaded.length > target ? 'lebih' : 'kurang') + 200));
          if (L.aloud === false && presses >= 2) { // tahap senyap: bantu kira selepas 2 cubaan
            for (let i = 0; i < loaded.length; i++) { await ctx.wait(Math.max(600, say('n' + (i + 1)) + 60)); }
          }
          setBricks(true); go.disabled = false; lastAct = performance.now();
        }
      } finally {
        ctl.abort(); ctx.signal.removeEventListener('abort', onAbort);
      }
      setBricks(false); go.disabled = true;
      sfx.good();
      // Lori jalan: batu bata ikut sekali.
      const d = say('jalan');
      await Promise.all([
        anim(truck, [{ left: '34%' }, { left: '110%' }], { duration: 1400, easing: 'ease-in' }),
        ...loaded.map((b) => anim(b, [{ transform: 'translateX(0)' }, { transform: `translateX(${(110 - 34) / 9 * 100}%)` }], { duration: 1400, easing: 'ease-in' })),
      ]);
      ctx.alive();
      await ctx.wait(Math.max(300, d - 1400));
      await ctx.wait(Math.max(700, say(pick(PRAISE)) + 100));
      return { target, correct: firstOk === true, presses };
    }

    ctx.progress(TRIALS);
    await ctx.ready(); ctx.alive();
    if (ctx.first) await ctx.wait(Math.max(2000, say('intro') + 200));
    const recs = [];
    let prev = 0;
    for (let i = 0; i < TRIALS; i++) {
      let n; do { n = L.lo + Math.floor(Math.random() * (L.hi - L.lo + 1)); } while (n === prev && L.hi > L.lo);
      prev = n;
      recs.push(await trial(n, ctx.first && i === 0 && level <= 2));
      ctx.mark(i);
      await ctx.wait(300);
    }
    sign.innerHTML = '';

    const correct = recs.filter((r) => r.correct).length;
    if (correct >= UP_AT) state.level = Math.min(MAX_LEVEL, level + 1);
    else if (correct <= DOWN_AT) state.level = Math.max(1, level - 1);
    const bricks = recs.reduce((a, r) => a + r.target, 0);
    return {
      record: { level, correct, n: recs.length, maxN: Math.max(0, ...recs.filter((r) => r.correct).map((r) => r.target)) },
      foundHtml: VEHICLE.lori().replace(/role="img" aria-label="[^"]*"/, 'aria-hidden="true"').repeat(recs.length),
      text: `Adik hantar <span class="big-num">${bricks}</span> batu bata! Tepat pada kali pertama: <span class="big-num">${correct}</span> daripada ${recs.length} lori.`,
    };
  },

  parent: {
    stats(s) {
      const last = s.rounds.slice(-7);
      const okP = pct(last.reduce((a, r) => a + (r.correct || 0), 0), last.reduce((a, r) => a + (r.n || 0), 0));
      const best = s.rounds.reduce((m, r) => Math.max(m, r.maxN || 0), 0);
      return [
        { v: okP === null ? '–' : okP + '%', label: 'Tepat kali pertama' },
        { v: `${s.level}<small>/${MAX_LEVEL}</small>`, label: 'Tahap' },
        { v: best || '–', label: 'Nombor terbesar tepat' },
      ];
    },
    cols: ['Tahap', 'Tepat', 'Terbesar'],
    row: (r) => [r.level, meter(pct(r.correct, r.n)), r.maxN || '–'],
    explain: `<span><b>Menghasilkan kuantiti</b>: melihat nombor, kemudian mengambil sebanyak itu. Ini lebih sukar daripada mengira benda yang sudah ada, kerana anak mesti ingat nombor sasaran sambil mengira dan tahu bila berhenti.</span>
      <span>Tahap 1–2: nombor kecil, Hafiz kira bersama dan ada titik bantuan · Tahap 3–4: nombor sahaja, anak kira sendiri. Butang "Jalan!" melatih anak menyemak kerja sendiri sebelum selesai. Naik bila 4/5 tepat pada kali pertama.</span>`,
  },

  mission: {
    title: 'Main "Ambil Ikut Nombor" di rumah',
    steps: [
      'Tulis nombor besar pada kertas (1–5 dahulu). Minta anak masukkan sebanyak itu blok atau kereta mainan ke dalam kotak.',
      'Sebelum selesai, tanya: <b>"Dah cukup? Jom semak sama-sama."</b> Kira bersama.',
      'Semasa memasak: <b>"Tolong ambil 3 biji bawang."</b>',
      'Bila dah senang, guna nombor sehingga 10 tanpa titik bantuan.',
    ],
    why: 'Kenapa? Mengambil kuantiti yang tepat ikut nombor menunjukkan anak benar-benar faham maksud nombor, dan menyemak sebelum selesai ialah tabiat belajar yang baik.',
  },
};
