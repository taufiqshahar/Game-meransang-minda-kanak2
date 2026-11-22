// Pasangan Kenderaan: ingatan visual-ruang (kad memori). Buka dua kad; kalau sama, kekal terbuka dan Hafiz sebut namanya.
// Tahap rendah ada pratonton semua kad sebelum ditutup.
import { VEHICLES, vehicleIcon } from '../../kit/vehicles.js';
import { pick, shuffle, pct, meter } from '../../kit/util.js';

// pairs = pasangan setiap papan, boards = papan setiap pusingan, cols × rows = susun atur, preview = ms pratonton (0 = tiada).
const LEVELS = [null,
  { pairs: 2, boards: 3, cols: 2, rows: 2, preview: 3000 },
  { pairs: 3, boards: 2, cols: 2, rows: 3, preview: 2500 },
  { pairs: 4, boards: 2, cols: 2, rows: 4, preview: 0 },
  { pairs: 6, boards: 1, cols: 3, rows: 4, preview: 0 },
];
const MAX_LEVEL = 4;
const AGE_LEVEL = { 3: 1, 4: 2, 5: 2, 6: 3 };
const UP_RATIO = 1.6, DOWN_RATIO = 3;    // cubaan ÷ pasangan: ≤1.6 naik, ≥3 turun
const IDLE_MS = 12000;
const BACK = `<svg viewBox="0 0 40 30" aria-hidden="true"><rect x="1" y="1" width="38" height="28" rx="5" fill="#2F7DE1" stroke="#1A4F99" stroke-width="2"/><circle cx="20" cy="15" r="8.5" fill="none" stroke="#FFFDF5" stroke-width="2.6"/><path d="M11.8 13.5 H28.2 M20 15 V23" stroke="#FFFDF5" stroke-width="2.6" stroke-linecap="round"/><circle cx="20" cy="15" r="2.8" fill="#F5B82E"/></svg>`; // stereng

export default {
  id: 'pasangan-kenderaan',
  title: 'Pasangan Kenderaan',
  stageLabel: 'Kad kenderaan tertutup. Buka dua kad; cari pasangan yang sama.',
  lines: {
    intro: 'Jom cari pasangan kenderaan! Buka dua kad. Kalau sama, dapat!',
    'tak-sama': 'Tak sama. Ingat tempatnya, ya.',
  },
  recorded: ['intro', 'tak-sama'],

  css: `.pk-grid { left: 4%; right: 4%; top: 15%; bottom: 4%; display: grid; gap: calc(var(--u) * 2.4); z-index: 3; }
.pk-card { position: relative; padding: 0; perspective: 600px; min-width: 0; min-height: 0; }
.pk-card:disabled { cursor: default; }
.pk-in { position: absolute; inset: 0; transform-style: preserve-3d; transition: transform .35s ease; }
.pk-card.open .pk-in { transform: rotateY(180deg); }
.pk-face { position: absolute; inset: 0; backface-visibility: hidden; -webkit-backface-visibility: hidden; border-radius: calc(var(--u) * 3.5);
  display: grid; place-items: center; box-shadow: 0 calc(var(--u) * 1) 0 rgba(0, 0, 0, .2); overflow: hidden; }
.pk-back { background: #2F7DE1; }
.pk-back svg { width: 100%; height: 100%; display: block; }
.pk-front { background: var(--kertas); transform: rotateY(180deg); }
.pk-front svg { width: 86%; height: 86%; display: block; }
.pk-card.matched .pk-front { box-shadow: 0 0 0 calc(var(--u) * 1.1) var(--kuning), 0 calc(var(--u) * 1) 0 rgba(0, 0, 0, .2); }
.pk-card.matched .pk-in { animation: pk-pop .45s ease; }
@keyframes pk-pop { 50% { transform: rotateY(180deg) scale(1.08); } }
.pk-card:not(:disabled):not(.open) .pk-back { animation: wiggle 1.6s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .pk-in { transition: none; } .pk-card.matched .pk-in, .pk-card:not(:disabled):not(.open) .pk-back { animation: none; } }`,

  stageHtml: () => `<svg class="bg" viewBox="0 0 200 300" preserveAspectRatio="none" aria-hidden="true">
      <rect width="200" height="300" fill="#E9D7B4"/>
      <rect x="0" y="0" width="200" height="40" fill="#F5B82E"/>
      <g fill="#2B2F36">${[0, 1, 2, 3, 4, 5, 6].map((i) => `<path d="M${i * 32 - 8} 40 L${i * 32 + 8} 0 H${i * 32 + 22} L${i * 32 + 6} 40 Z"/>`).join('')}</g>
      <rect y="40" width="200" height="4" fill="#B7860F"/>
      <g fill="#DCC69C" opacity=".6">${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="0" y="${60 + i * 42}" width="200" height="2"/>`).join('')}</g>
    </svg>
    <div class="pk-grid"></div>`,

  initState: (age) => ({ age, level: AGE_LEVEL[age], rounds: [] }),
  normalize(s, age) {
    if (s.age !== age) { s.age = age; s.level = AGE_LEVEL[age]; }
    if (!Number.isInteger(s.level) || s.level < 1 || s.level > MAX_LEVEL) s.level = AGE_LEVEL[age];
    return s;
  },

  async round(ctx) {
    const { stage, state, say, sfx } = ctx;
    const grid = stage.querySelector('.pk-grid');
    const level = state.level, L = LEVELS[level];
    let pairsTotal = 0, attemptsTotal = 0;
    const found = new Set();

    async function board(demo) {
      const ids = shuffle(VEHICLES.map((v) => v.id)).slice(0, L.pairs);
      const deck = shuffle([...ids, ...ids]);
      grid.style.gridTemplateColumns = `repeat(${L.cols}, 1fr)`; grid.style.gridTemplateRows = `repeat(${L.rows}, 1fr)`;
      grid.innerHTML = deck.map((id, i) => `<button class="pk-card" type="button" data-i="${i}" data-id="${id}" aria-label="Kad tertutup" disabled><span class="pk-in"><span class="pk-face pk-back">${BACK}</span><span class="pk-face pk-front">${vehicleIcon(id)}</span></span></button>`).join('');
      stage.dataset.deck = deck.join(','); // untuk ujian automatik
      const cards = [...grid.querySelectorAll('.pk-card')];
      const isDone = (c) => c.classList.contains('matched');
      const open = (c, on) => { c.classList.toggle('open', on); c.setAttribute('aria-label', on ? VEHICLES.find((v) => v.id === c.dataset.id).name : 'Kad tertutup'); };
      const arm = (on) => cards.forEach((c) => { c.disabled = !on || isDone(c) || c.classList.contains('open'); });
      sfx.pop();
      if (L.preview) {
        await ctx.wait(400);
        cards.forEach((c) => open(c, true));
        say('tengok');
        await ctx.wait(L.preview);
        cards.forEach((c) => open(c, false));
        await ctx.wait(500);
      }
      let saidMismatch = false;
      while (!cards.every(isDone)) {
        const pickOne = async () => {
          for (;;) {
            arm(true);
            const t = await ctx.tap({ selector: '.pk-card', ms: IDLE_MS });
            if (t) { arm(false); return t.el; }
            const c = pick(cards.filter((x) => !isDone(x) && !x.classList.contains('open')));
            const r = ctx.toPct(c.getBoundingClientRect()); ctx.hand.show(r.left + r.width * .4, r.top + r.width * .2);
            setTimeout(() => ctx.hand.hide(), 2500);
          }
        };
        if (demo) { const r = ctx.toPct(cards[0].getBoundingClientRect()); ctx.hand.show(r.left + r.width * .4, r.top + 4); }
        const a = await pickOne(); ctx.hand.hide(); demo = false;
        open(a, true); sfx.pop();
        await ctx.wait(250);
        const b = await pickOne();
        open(b, true); sfx.pop();
        attemptsTotal++;
        await ctx.wait(700);
        if (a.dataset.id === b.dataset.id) {
          a.classList.add('matched'); b.classList.add('matched'); pairsTotal++; found.add(a.dataset.id);
          sfx.good();
          await ctx.wait(Math.max(900, say('v-' + a.dataset.id) + 150));
        } else {
          sfx.soft();
          if (!saidMismatch) { saidMismatch = true; await ctx.wait(Math.max(1200, say('tak-sama') + 100)); }
          else await ctx.wait(700);
          open(a, false); open(b, false);
          await ctx.wait(400); // tunggu kad tertutup sebelum boleh ditekan semula
        }
      }
      await ctx.wait(Math.max(800, say(pick(['hebat', 'bagus', 'pandainya'])) + 200));
    }

    ctx.progress(L.boards);
    await ctx.ready(); ctx.alive();
    if (ctx.first) await ctx.wait(Math.max(2000, say('intro') + 200));
    for (let i = 0; i < L.boards; i++) {
      await board(ctx.first && i === 0 && level === 1);
      ctx.mark(i);
      await ctx.wait(300);
    }
    delete stage.dataset.deck;

    const ratio = attemptsTotal / pairsTotal;
    if (ratio <= UP_RATIO) state.level = Math.min(MAX_LEVEL, level + 1);
    else if (ratio >= DOWN_RATIO) state.level = Math.max(1, level - 1);
    return {
      record: { level, pairs: pairsTotal, attempts: attemptsTotal },
      foundHtml: [...found].map(vehicleIcon).join(''),
      text: `Adik jumpa <span class="big-num">${pairsTotal}</span> pasangan dengan <span class="big-num">${attemptsTotal}</span> cubaan!` + (ratio <= UP_RATIO ? ' Ingatan adik kuat!' : ''),
    };
  },

  parent: {
    stats(s) {
      const last = s.rounds.slice(-7);
      const eff = pct(last.reduce((a, r) => a + (r.pairs || 0), 0), last.reduce((a, r) => a + (r.attempts || 0), 0));
      const best = s.rounds.reduce((m, r) => Math.max(m, r.level || 0), 0);
      return [
        { v: eff === null ? '–' : eff + '%', label: 'Kecekapan ingatan' },
        { v: `${s.level}<small>/${MAX_LEVEL}</small>`, label: 'Tahap' },
        { v: best ? `${LEVELS[best].pairs * 2}<small> kad</small>` : '–', label: 'Papan terbesar' },
      ];
    },
    cols: ['Tahap', 'Kecekapan', 'Pasangan / cubaan'],
    row: (r) => [r.level, meter(pct(r.pairs, r.attempts)), `${r.pairs} / ${r.attempts}`],
    explain: `<span><b>Ingatan visual-ruang</b>: mengingat apa yang dilihat dan di mana. <b>Kecekapan</b> = pasangan ÷ cubaan (100% bermakna setiap cubaan berjaya). Meneka secara rawak memberi kecekapan rendah, jadi angka yang naik bermakna anak benar-benar mengingat.</span>
      <span>Tahap 1: 4 kad dengan pratonton · Tahap 2: 6 kad dengan pratonton · Tahap 3: 8 kad · Tahap 4: 12 kad. Naik bila cubaan ≤ 1.6 × pasangan; turun bila ≥ 3 ×.</span>`,
  },

  mission: {
    title: 'Main "Cari Pasangan" dengan stoking',
    steps: [
      'Terbalikkan 3 pasang stoking atau cawan berwarna (6 semuanya) supaya warnanya tersorok.',
      'Bergilir-gilir buka dua. Kalau sama, simpan. Kalau tak sama, tutup semula.',
      'Sebut kuat apa yang dilihat: <b>"Merah di sini, biru di sana."</b> Ini membantu anak mengingat.',
      'Bila dah senang, tambah satu pasangan lagi.',
    ],
    why: 'Kenapa? Permainan pasangan melatih anak mengingat lokasi dan menahan diri daripada meneka. Ia juga bagus untuk bergilir dan bersabar dengan keluarga.',
  },
};
