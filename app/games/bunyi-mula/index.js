// Bunyi Mula: kesedaran fonologi BM, suku kata awal ("Ga… ga… Mana mula dengan ga?" → gajah).
// Tahap 3: suku kata turut ditulis, mengaitkan bunyi dengan huruf (asas membaca).
import { ART, ANIMALS, iconOf } from '../../kit/art.js';
import { pick, shuffle, pct, meter } from '../../kit/util.js';

const TRIALS = 8;
const SYL = { kancil: 'kan', harimau: 'ha', orangutan: 'o', gajah: 'ga', tapir: 'ta', enggang: 'eng' };
const WORD = { kancil: 'kancil', harimau: 'harimau', orangutan: 'orang utan', gajah: 'gajah', tapir: 'tapir', enggang: 'enggang' }; // sama dengan rakaman
const LEVELS = [null, { options: 2, written: false }, { options: 3, written: false }, { options: 4, written: true }];
const MAX_LEVEL = 3;
const AGE_LEVEL = { 3: 1, 4: 1, 5: 2, 6: 3 };
const UP_AT = 7, DOWN_AT = 4; // daripada 8
const REMIND_MS = 8000, REMINDERS = 2;
const PRAISE = ['betul', 'hebat', 'bagus', 'pandainya'];
// Kedudukan kad (% pentas) ikut bilangan pilihan.
const CARD_AT = { 2: [[8, 52], [52, 52]], 3: [[4, 44], [52, 44], [28, 68]], 4: [[8, 42], [52, 42], [8, 68], [52, 68]] };

export default {
  id: 'bunyi-mula',
  title: 'Bunyi Mula',
  stageLabel: 'Dengar suku kata, kemudian tekan haiwan yang namanya mula dengan bunyi itu.',
  lines: {
    intro: 'Jom dengar bunyi! Tekan haiwan yang mula dengan bunyi tu.',
    ...Object.fromEntries(ANIMALS.map((a) => [`tanya-${a.id}`, `${cap(SYL[a.id])}… ${SYL[a.id]}… Mana mula dengan ${SYL[a.id]}?`])),
    ...Object.fromEntries(ANIMALS.map((a) => [`jawab-${a.id}`, `${cap(SYL[a.id])}, ${WORD[a.id]}!`])),
  },
  recorded: ['intro', ...ANIMALS.map((a) => `tanya-${a.id}`), ...ANIMALS.map((a) => `jawab-${a.id}`)],

  css: `.bmu-cards { inset: 0; }
.bmu-card { position: absolute; width: 40%; height: 22%; padding: 0; z-index: 3; border-radius: calc(var(--u) * 5);
  background: var(--kertas); box-shadow: 0 calc(var(--u) * 1.2) 0 rgba(0, 0, 0, .2); display: grid; place-items: center; }
.bmu-card svg { height: 88%; width: auto; display: block; }
.bmu-card:disabled { cursor: default; }
.bmu-card:not(:disabled) { animation: wiggle 1.4s ease-in-out infinite; }
.bmu-card:not(:disabled):nth-child(2n) { animation-delay: .45s; }
.bmu-card.right { box-shadow: 0 0 0 calc(var(--u) * 1.4) var(--kuning), 0 calc(var(--u) * 1.2) 0 rgba(0, 0, 0, .2); }
.bmu-card.dim { opacity: .35; }
.bmu-board { left: 50%; top: 14%; transform: translateX(-50%); z-index: 4; min-width: 30%; padding: calc(var(--u) * 1.5) calc(var(--u) * 5);
  background: #2E5E45; color: var(--kertas); border: calc(var(--u) * 1.2) solid #8A5A32; border-radius: calc(var(--u) * 3);
  font-family: var(--font-display); font-weight: 700; font-size: calc(var(--u) * 13); line-height: 1; text-align: center; letter-spacing: .04em; }
.bmu-board:empty { display: none; }
@media (prefers-reduced-motion: reduce) { .bmu-card:not(:disabled) { animation: none; } }`,

  stageHtml: () => `<svg class="bg" viewBox="0 0 200 300" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="bmu-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B9E2F2"/><stop offset="1" stop-color="#E6F4EC"/></linearGradient>
        <linearGradient id="bmu-grass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9AD58F"/><stop offset="1" stop-color="#6BB86A"/></linearGradient>
      </defs>
      <rect width="200" height="110" fill="url(#bmu-sky)"/>
      <g fill="#FFFFFF" opacity=".85"><path d="M24 66 a7 7 0 0 1 12 -4 a8 8 0 0 1 14 3 a5 5 0 0 1 1 10 h-27 a5 5 0 0 1 0 -9z"/><path d="M140 80 a5 5 0 0 1 9 -3 a6 6 0 0 1 11 2 a4 4 0 0 1 1 8 h-21 a4 4 0 0 1 0 -7z"/></g>
      <path d="M0 100 C30 88 64 90 96 98 C128 86 168 86 200 96 V120 H0Z" fill="#A9D5BC"/>
      <rect y="112" width="200" height="188" fill="url(#bmu-grass)"/>
      <g fill="#8ED48A" opacity=".7"><ellipse cx="40" cy="290" rx="34" ry="7"/><ellipse cx="160" cy="290" rx="34" ry="7"/></g>
      <g><circle cx="20" cy="124" r="2.6" fill="#F06A9A"/><circle cx="182" cy="128" r="3" fill="#F5B82E"/><circle cx="100" cy="292" r="2.6" fill="#FFFFFF"/></g>
    </svg>
    <div class="bmu-board" aria-live="polite"></div>
    <div class="bmu-cards"></div>`,

  initState: (age) => ({ age, level: AGE_LEVEL[age], rounds: [] }),
  normalize(s, age) {
    if (s.age !== age) { s.age = age; s.level = AGE_LEVEL[age]; }
    if (!Number.isInteger(s.level) || s.level < 1 || s.level > MAX_LEVEL) s.level = AGE_LEVEL[age];
    return s;
  },

  async round(ctx) {
    const { stage, state, say, sfx } = ctx;
    const cardsEl = stage.querySelector('.bmu-cards'), board = stage.querySelector('.bmu-board');
    const level = state.level, L = LEVELS[level];
    // Sasaran: setiap haiwan sekali, kemudian 2 rawak; tiada sasaran sama berturut-turut.
    let targets;
    do { targets = [...shuffle(ANIMALS), ...shuffle(ANIMALS).slice(0, TRIALS - ANIMALS.length)]; } while (targets.some((t, i) => i && t.id === targets[i - 1].id));

    async function trial(target, demo) {
      const others = shuffle(ANIMALS.filter((a) => a.id !== target.id)).slice(0, L.options - 1);
      const opts = shuffle([target, ...others]);
      cardsEl.innerHTML = opts.map((a, i) => `<button class="bmu-card" type="button" data-id="${a.id}" style="left:${CARD_AT[L.options][i][0]}%;top:${CARD_AT[L.options][i][1]}%" aria-label="${a.name}" disabled>${ART[a.id]()}</button>`).join('');
      const cards = [...cardsEl.querySelectorAll('.bmu-card')];
      const right = cards.find((c) => c.dataset.id === target.id);
      board.textContent = L.written ? SYL[target.id] : '';
      sfx.pop();
      await ctx.wait(Math.max(1500, say('tanya-' + target.id) + 150));
      cards.forEach((c) => { c.disabled = false; });
      const handAt = () => { const r = ctx.toPct(right.getBoundingClientRect()); ctx.hand.show(r.left + r.width * .45, r.top + 10); };
      if (demo) handAt();
      const ask = async () => {
        for (let r = 0; r <= REMINDERS; r++) {
          const t = await ctx.tap({ selector: '.bmu-card', ms: REMIND_MS });
          if (t) return t.el;
          if (r < REMINDERS) say('tanya-' + target.id);
        }
        return null;
      };
      const t0 = performance.now();
      let el = await ask();
      const rec = { target: target.id, correct: el === right, rt: el ? Math.round(performance.now() - t0) : null };
      if (el && el !== right) {
        sfx.soft(); el.classList.add('dim');
        cards.forEach((c) => { c.disabled = true; }); // tidak mendengar semasa "Cuba lagi": jangan nampak boleh ditekan
        await ctx.wait(Math.max(900, say('cuba-lagi') + 100));
        say('tanya-' + target.id);
        cards.forEach((c) => { c.disabled = c.classList.contains('dim'); });
        el = await ask();
      }
      cards.forEach((c) => { c.disabled = true; });
      ctx.hand.hide();
      right.classList.add('right');
      if (el === right) {
        sfx.good();
        await ctx.wait(Math.max(1200, say('jawab-' + target.id) + 200));
        if (rec.correct) await ctx.wait(Math.max(700, say(pick(PRAISE)) + 100));
      } else {
        sfx.pop(); handAt();
        await ctx.wait(Math.max(1600, say('jawab-' + target.id) + 400));
        ctx.hand.hide();
      }
      return rec;
    }

    ctx.progress(TRIALS);
    await ctx.ready(); ctx.alive();
    if (ctx.first) await ctx.wait(Math.max(1800, say('intro') + 200));
    const recs = [];
    for (let i = 0; i < TRIALS; i++) {
      recs.push(await trial(targets[i], ctx.first && i === 0 && level === 1));
      ctx.mark(i);
      await ctx.wait(300);
    }
    board.textContent = '';

    const correct = recs.filter((r) => r.correct).length;
    if (correct >= UP_AT) state.level = Math.min(MAX_LEVEL, level + 1);
    else if (correct <= DOWN_AT) state.level = Math.max(1, level - 1);
    const sounds = [...new Set(recs.filter((r) => r.correct).map((r) => SYL[r.target]))];
    return {
      record: { level, correct, n: recs.length, sounds },
      foundHtml: recs.filter((r) => r.correct).map((r) => iconOf(r.target)).join(''),
      text: correct >= 6
        ? `Adik betul <span class="big-num">${correct}</span> daripada ${recs.length}! Telinga adik tajam.`
        : `Adik betul <span class="big-num">${correct}</span> daripada ${recs.length}. Mendengar bunyi perlu latihan. Main lagi, ya!`,
    };
  },

  parent: {
    stats(s) {
      const last = s.rounds.slice(-7);
      const okP = pct(last.reduce((a, r) => a + (r.correct || 0), 0), last.reduce((a, r) => a + (r.n || 0), 0));
      const known = new Set(s.rounds.flatMap((r) => r.sounds || []));
      return [
        { v: okP === null ? '–' : okP + '%', label: 'Betul' },
        { v: `${s.level}<small>/${MAX_LEVEL}</small>`, label: 'Tahap' },
        { v: `${known.size}<small>/6</small>`, label: 'Bunyi dikenal' },
      ];
    },
    cols: ['Tahap', 'Betul', 'Bunyi betul'],
    row: (r) => [r.level, meter(pct(r.correct, r.n)), (r.sounds || []).join(', ') || '–'],
    explain: `<span><b>Kesedaran fonologi</b>: kebolehan mendengar bunyi dalam perkataan, peramal utama kebolehan membaca. Dalam BM, kanak-kanak belajar membaca melalui suku kata (ba-ju, ga-jah), jadi suku kata awal ialah langkah pertama.</span>
      <span>Tahap 1: 2 pilihan · Tahap 2: 3 pilihan · Tahap 3: 4 pilihan, dan suku kata turut ditulis (kaitkan bunyi dengan huruf). Naik bila 7/8 betul, turun bila 4/8 atau kurang. Salah sekali: anak boleh cuba lagi; "betul" dikira pada cubaan pertama sahaja.</span>`,
  },

  mission: {
    title: 'Main "Bunyi Apa?" di rumah',
    steps: [
      'Sebut suku kata pertama barang di rumah: <b>"Ca… ca… cawan!"</b>',
      'Tanya: <b>"Apa lagi yang mula dengan ca?"</b> (cat, cacing, cabai). Semua jawapan yang dicuba patut dipuji.',
      'Tepuk suku kata nama ahli keluarga: <b>"A-yah", "I-bu"</b>.',
      'Bila dah senang, tunjuk suku kata bertulis pada bungkusan makanan: <b>"Ni bunyi apa?"</b>',
    ],
    why: 'Kenapa? Kanak-kanak yang dapat mendengar dan bermain dengan bunyi dalam perkataan lebih mudah belajar membaca, terutamanya dalam BM yang dibaca ikut suku kata.',
  },
};

function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
