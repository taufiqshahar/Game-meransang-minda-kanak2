// Tenggelam atau Timbul: sains awal (meramal, memerhati, mengelas). Anak teka dahulu, kemudian benda dijatuhkan ke dalam
// akuarium. Benda kekal di tempatnya, jadi akhirnya akuarium menunjukkan dua kumpulan: timbul di atas, tenggelam di bawah.
// Tekaan salah bukan "salah": Hafiz kata "Wah, tak sangka!" kerana kejutan itulah saat belajar dalam sains.
import { bendaIcon, NAMES } from '../../kit/benda.js';
import { shuffle, pct, meter } from '../../kit/util.js';

// floats = timbul? Benda "mengejutkan" (bercanggah dengan gerak hati) ditanda tricky.
const OBJ = {
  batu: { floats: false }, bola: { floats: true }, itik: { floats: true }, kunci: { floats: false }, syiling: { floats: false }, daun: { floats: true },
  sudu: { floats: false }, kayu: { floats: true, tricky: true }, epal: { floats: true, tricky: true }, botol: { floats: true, tricky: true },
};
const TRIALS = 6;
const LEVELS = [null,
  { pool: ['batu', 'bola', 'itik', 'kunci', 'syiling', 'daun'] },
  { pool: ['batu', 'bola', 'itik', 'kunci', 'syiling', 'daun', 'sudu', 'kayu'] },
  { pool: ['batu', 'itik', 'kunci', 'syiling', 'daun', 'sudu', 'kayu', 'epal', 'botol'], tricky: 2 },
  { pool: ['kunci', 'syiling', 'sudu', 'kayu', 'epal', 'botol', 'daun', 'batu'], tricky: 3 },
];
const MAX_LEVEL = 4;
const AGE_LEVEL = { 3: 1, 4: 1, 5: 2, 6: 3 };
const UP_AT = 5, DOWN_AT = 2;
const IDLE_MS = 12000;
// Akuarium (% pentas): permukaan air dan dasar. Saiz benda dalam akuarium.
const SURFACE = 42, BOTTOM = 70, OW = 13, OH = OW * 2 / 3;
const SLOTS = [25, 35, 45, 55, 65, 75];
const UP = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4 L19 12 H15 V20 H9 V12 H5 Z" fill="currentColor"/></svg>`;
const DOWN = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20 L19 12 H15 V4 H9 V12 H5 Z" fill="currentColor"/></svg>`;

export default {
  id: 'tenggelam-timbul',
  title: 'Tenggelam atau Timbul',
  stageLabel: 'Akuarium air. Teka sama ada benda akan tenggelam atau timbul, kemudian tengok apa yang berlaku.',
  lines: {
    intro: 'Jom buat eksperimen! Teka dulu, tenggelam atau timbul?',
    tanya: 'Tenggelam atau timbul?',
    tenggelam: 'Tenggelam!',
    timbul: 'Timbul!',
    'teka-betul': 'Tekaan adik betul!',
    'tak-sangka': 'Wah, tak sangka!',
  },
  recorded: ['intro', 'tanya', 'tenggelam', 'timbul', 'teka-betul', 'tak-sangka'],

  css: `.tt-tank { left: 14%; width: 72%; top: 32%; height: 40%; z-index: 2; border: calc(var(--u) * 1.2) solid #CFE6F2; border-top: 0;
  border-radius: 0 0 calc(var(--u) * 5) calc(var(--u) * 5); background: rgba(255,255,255,.18); }
.tt-water { left: calc(14% + var(--u) * 1.2); width: calc(72% - var(--u) * 2.4); top: ${SURFACE}%; height: calc(${72 - SURFACE}% - var(--u) * 1.2); z-index: 4;
  background: rgba(64, 160, 220, .42); border-radius: 0 0 calc(var(--u) * 4) calc(var(--u) * 4); pointer-events: none; }
.tt-water::before { content: ''; position: absolute; left: 0; right: 0; top: 0; height: calc(var(--u) * 1.2); background: rgba(255,255,255,.55); }
.tt-objs { inset: 0; z-index: 3; pointer-events: none; }
.tt-obj { position: absolute; }
.tt-obj svg { width: 100%; height: 100%; display: block; }
.tt-ring { position: absolute; z-index: 5; border: calc(var(--u) * .8) solid #fff; border-radius: 50%; pointer-events: none; }
.tt-btns { left: 5%; right: 5%; top: 77%; height: 19%; z-index: 5; display: flex; gap: 5%; }
.tt-btn { flex: 1; border-radius: calc(var(--u) * 5); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: calc(var(--u) * 1);
  font-family: var(--font-display); font-weight: 700; font-size: calc(var(--u) * 5.4); color: var(--kertas); }
.tt-btn svg { width: calc(var(--u) * 11); height: auto; }
.tt-btn.up { background: #2FA7DF; box-shadow: 0 calc(var(--u) * 1.3) 0 #1C7AA8; }
.tt-btn.down { background: #1F4E79; box-shadow: 0 calc(var(--u) * 1.3) 0 #12304D; }
.tt-btn.picked { outline: calc(var(--u) * 1.4) solid var(--kuning); outline-offset: calc(var(--u) * .6); }
.tt-btn:disabled { opacity: .5; }
.tt-btn.picked:disabled { opacity: 1; }`,

  stageHtml: () => `<svg class="bg" viewBox="0 0 200 300" preserveAspectRatio="none" aria-hidden="true">
      <rect width="200" height="300" fill="#F4EBD9"/>
      <g fill="#E8DCC2">${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<rect x="${i * 28}" y="0" width="14" height="216"/>`).join('')}</g>
      <rect y="214" width="200" height="86" fill="#B07A44"/>
      <rect y="214" width="200" height="6" fill="#8A5A2E"/>
      <g stroke="#F4EBD9" stroke-width="1.4" opacity=".5">${[0, 1, 2, 3].map((i) => `<path d="M0 ${232 + i * 18} H200"/>`).join('')}</g>
    </svg>
    <div class="tt-tank" aria-hidden="true"></div>
    <div class="tt-objs"></div>
    <div class="tt-water" aria-hidden="true"></div>
    <div class="tt-btns">
      <button class="tt-btn up" type="button" data-guess="timbul" disabled>${UP}<span>Timbul</span></button>
      <button class="tt-btn down" type="button" data-guess="tenggelam" disabled>${DOWN}<span>Tenggelam</span></button>
    </div>`,

  initState: (age) => ({ age, level: AGE_LEVEL[age], rounds: [] }),
  normalize(s, age) {
    if (s.age !== age) { s.age = age; s.level = AGE_LEVEL[age]; }
    if (!Number.isInteger(s.level) || s.level < 1 || s.level > MAX_LEVEL) s.level = AGE_LEVEL[age];
    return s;
  },

  async round(ctx) {
    const { stage, state, say, sfx, anim } = ctx;
    const objs = stage.querySelector('.tt-objs');
    const btns = [...stage.querySelectorAll('.tt-btn')];
    const level = state.level, L = LEVELS[level];
    objs.innerHTML = '';

    // Pilih benda: campuran timbul/tenggelam, dengan bilangan benda "mengejutkan" yang ditetapkan pada tahap tinggi.
    const pool = shuffle(L.pool);
    const tricky = pool.filter((id) => OBJ[id].tricky).slice(0, L.tricky || 0);
    const rest = pool.filter((id) => !tricky.includes(id));
    let list = [...tricky];
    for (const id of rest) if (list.length < TRIALS) list.push(id);
    list = shuffle(list);
    const slots = shuffle(SLOTS);

    const arm = (on) => btns.forEach((b) => { b.disabled = !on; });

    async function trial(id, i, demo) {
      const floats = OBJ[id].floats;
      const el = document.createElement('div');
      el.className = 'tt-obj'; el.innerHTML = bendaIcon(id);
      el.setAttribute('role', 'img'); el.setAttribute('aria-label', NAMES[id]);
      // Mula: besar di atas akuarium.
      Object.assign(el.style, { left: '38%', top: '11%', width: '24%', height: (24 * 2 / 3) + '%' });
      objs.appendChild(el);
      stage.dataset.floats = floats ? '1' : '0'; // untuk ujian automatik
      btns.forEach((b) => b.classList.remove('picked'));
      sfx.pop();
      await anim(el, [{ transform: 'scale(.4)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { duration: 320, fill: 'none' });
      ctx.caption(NAMES[id]);
      await ctx.wait(500);
      await ctx.wait(Math.max(900, say('tanya') + 100));

      let t;
      for (;;) {
        if (demo) { const r = ctx.toPct(btns[floats ? 0 : 1].getBoundingClientRect()); ctx.hand.show(r.left + r.width * .45, r.top + r.width * .15); }
        arm(true);
        t = await ctx.tap({ selector: '.tt-btn', ms: IDLE_MS });
        arm(false); ctx.hand.hide();
        if (t) break;
        await ctx.wait(Math.max(900, say('tanya') + 100));
      }
      const guess = t.el.dataset.guess === 'timbul';
      t.el.classList.add('picked'); sfx.light();
      await ctx.wait(450);

      // Jatuhkan ke dalam air.
      const x = slots[i] - OW / 2;
      const surfTop = SURFACE - OH * .55;
      await anim(el, [{ left: '38%', top: '11%', width: '24%', height: (24 * 2 / 3) + '%' }, { left: x + '%', top: (SURFACE - OH - 2) + '%', width: OW + '%', height: OH + '%' }], { duration: 450, easing: 'ease-in' });
      Object.assign(el.style, { left: x + '%', width: OW + '%', height: OH + '%' });
      // Percikan
      const ring = document.createElement('div'); ring.className = 'tt-ring';
      Object.assign(ring.style, { left: (slots[i] - 6) + '%', top: (SURFACE - 1.5) + '%', width: '12%', height: '3%' });
      stage.appendChild(ring);
      anim(ring, [{ transform: 'scale(.3)', opacity: 1 }, { transform: 'scale(1.6)', opacity: 0 }], { duration: 600 }).then(() => ring.remove());
      sfx.pop();
      if (floats) {
        await anim(el, [{ top: (SURFACE - OH - 2) + '%' }, { top: (surfTop + 3) + '%' }, { top: (surfTop - 1) + '%' }, { top: surfTop + '%' }], { duration: 1100, easing: 'ease-out' });
        el.style.top = surfTop + '%';
        el.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-6%)' }, { transform: 'translateY(0)' }], { duration: 1800, iterations: Infinity, delay: i * 120 });
      } else {
        const bt = BOTTOM - OH - .5;
        await anim(el, [{ top: (SURFACE - OH - 2) + '%' }, { top: (SURFACE + 2) + '%', offset: .25 }, { top: bt + '%' }], { duration: 1500, easing: 'ease-in' });
        el.style.top = bt + '%';
      }
      ctx.alive();
      await ctx.wait(Math.max(900, say(floats ? 'timbul' : 'tenggelam') + 150));
      const right = guess === floats;
      if (right) sfx.good();
      await ctx.wait(Math.max(1100, say(right ? 'teka-betul' : 'tak-sangka') + 250));
      return { id, floats, right };
    }

    ctx.progress(TRIALS);
    await ctx.ready(); ctx.alive();
    if (ctx.first) await ctx.wait(Math.max(2800, say('intro') + 200));
    const recs = [];
    for (let i = 0; i < list.length; i++) {
      recs.push(await trial(list[i], i, ctx.first && i === 0 && level === 1));
      ctx.mark(i);
      await ctx.wait(250);
    }
    btns.forEach((b) => b.classList.remove('picked'));
    delete stage.dataset.floats;

    const right = recs.filter((r) => r.right).length;
    if (right >= UP_AT) state.level = Math.min(MAX_LEVEL, level + 1);
    else if (right <= DOWN_AT) state.level = Math.max(1, level - 1);
    const fl = recs.filter((r) => r.floats).map((r) => r.id), sk = recs.filter((r) => !r.floats).map((r) => r.id);
    return {
      record: { level, right, n: recs.length, surprise: recs.filter((r) => !r.right).map((r) => r.id) },
      extraHtml: `<div class="tt-sum" style="display:grid;grid-template-columns:auto 1fr;gap:6px 10px;align-items:center;text-align:left;max-width:320px;margin:0 auto">
        <b style="color:#7FD3F7">Timbul</b><span style="display:flex;gap:4px">${fl.map((id) => `<span style="width:36px">${bendaIcon(id)}</span>`).join('')}</span>
        <b style="color:#A9CBF2">Tenggelam</b><span style="display:flex;gap:4px">${sk.map((id) => `<span style="width:36px">${bendaIcon(id)}</span>`).join('')}</span></div>`,
      text: `Adik uji <span class="big-num">${recs.length}</span> benda! Tekaan tepat: <span class="big-num">${right}</span>.` + (right < recs.length ? ' Ada yang mengejutkan, kan?' : ''),
    };
  },

  parent: {
    stats(s) {
      const last = s.rounds.slice(-7);
      const okP = pct(last.reduce((a, r) => a + (r.right || 0), 0), last.reduce((a, r) => a + (r.n || 0), 0));
      const sur = {};
      last.forEach((r) => (r.surprise || []).forEach((id) => { sur[id] = (sur[id] || 0) + 1; }));
      const top = Object.entries(sur).sort((a, b) => b[1] - a[1])[0];
      return [
        { v: okP === null ? '–' : okP + '%', label: 'Ramalan tepat' },
        { v: `${s.level}<small>/${MAX_LEVEL}</small>`, label: 'Tahap' },
        { v: top && NAMES[top[0]] ? NAMES[top[0]] : '–', label: 'Paling mengejutkan anak' },
      ];
    },
    cols: ['Tahap', 'Tepat', 'Mengejutkan'],
    row: (r) => [r.level, meter(pct(r.right, r.n)), (r.surprise || []).filter((id) => NAMES[id]).map((id) => NAMES[id]).join(', ') || '–'],
    explain: `<span><b>Pemikiran saintifik awal</b>: membuat ramalan, memerhati hasil, dan mengemas kini kefahaman. Kanak-kanak kecil biasanya fikir "besar = tenggelam" dan "kecil = timbul"; benda seperti kayu besar, epal dan syiling kecil mencabar idea itu. Ramalan salah ialah peluang belajar, bukan kegagalan.</span>
      <span>Tahap 1–2: benda yang jelas · Tahap 3–4: lebih banyak benda "mengejutkan" (kayu, epal, botol kosong). Di akhir, akuarium menunjukkan dua kumpulan: anak melihat pengelasan sendiri. Naik bila 5/6 ramalan tepat.</span>`,
  },

  mission: {
    title: 'Eksperimen besen air di rumah',
    steps: [
      'Isi besen atau sinki dengan air. Kumpul 5 benda selamat: sudu, kunci, epal, span, penutup botol.',
      'Untuk setiap benda, tanya dulu: <b>"Adik rasa tenggelam atau timbul?"</b> Kemudian cuba.',
      'Asingkan kepada dua longgok: yang timbul dan yang tenggelam. Tanya: <b>"Kenapa agaknya?"</b> Terima apa saja jawapan.',
      'Cabaran: boleh tak buat bola plastisin timbul? (Bentukkan jadi bot!)',
    ],
    why: 'Kenapa? Meramal kemudian menguji ialah cara saintis berfikir. Anak belajar bahawa idea boleh diuji dan diubah, dan bahawa salah teka itu menyeronokkan.',
  },
};
