// Bunyi Apa Ni?: diskriminasi & ingatan pendengaran. Dengar bunyi kenderaan (disintesis), tekan kenderaan yang betul.
// Tahap 4: dua bunyi berturut-turut → tekan ikut urutan (ingatan pendengaran berurutan).
import { VEHICLE, VEHICLES, VEHICLE_SOUND, vehicleIcon } from '../../kit/vehicles.js';
import { pick, shuffle, pct, meter } from '../../kit/util.js';

const IDS = Object.keys(VEHICLE_SOUND);                  // kenderaan yang ada bunyi
const LEVELS = [null, { options: 2, seq: 1 }, { options: 3, seq: 1 }, { options: 4, seq: 1 }, { options: 4, seq: 2 }];
const MAX_LEVEL = 4;
const AGE_LEVEL = { 3: 1, 4: 2, 5: 3, 6: 3 };
const TRIALS = 8;
const UP_AT = 7, DOWN_AT = 4;
const REMIND_MS = 9000, REMINDERS = 2;
const PRAISE = ['betul', 'hebat', 'bagus', 'pandainya'];
const CARD_AT = { 2: [[8, 50], [52, 50]], 3: [[4, 42], [52, 42], [28, 66]], 4: [[6, 42], [52, 42], [6, 66], [52, 66]] };
const SPEAKER = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/><path d="M15.5 9a4 4 0 0 1 0 6"/><path d="M18 6.5a7.5 7.5 0 0 1 0 11"/></svg>`;

export default {
  id: 'bunyi-kenderaan',
  title: 'Bunyi Apa Ni?',
  stageLabel: 'Dengar bunyi kenderaan, kemudian tekan kenderaan yang berbunyi. Butang pembesar suara memainkan bunyi semula.',
  lines: {
    intro: 'Dengar baik-baik! Kenderaan apa yang berbunyi?',
    tanya: 'Bunyi apa ni?',
    urutan: 'Dengar semua bunyi. Tekan ikut urutan, ya.',
  },
  recorded: ['intro', 'tanya', 'urutan'],

  css: `.bk-cards { inset: 0; }
.bk-card { position: absolute; width: 42%; height: 22%; padding: 0; z-index: 3; border-radius: calc(var(--u) * 5);
  background: var(--kertas); box-shadow: 0 calc(var(--u) * 1.2) 0 rgba(0, 0, 0, .2); display: grid; place-items: center; }
.bk-card svg { width: 88%; height: auto; display: block; }
.bk-card:disabled { cursor: default; }
.bk-card:not(:disabled) { animation: wiggle 1.4s ease-in-out infinite; }
.bk-card:not(:disabled):nth-child(2n) { animation-delay: .45s; }
.bk-card.right { box-shadow: 0 0 0 calc(var(--u) * 1.4) var(--kuning), 0 calc(var(--u) * 1.2) 0 rgba(0, 0, 0, .2); }
.bk-card.dim { opacity: .35; }
.bk-card .ord { position: absolute; top: -8%; left: -4%; width: calc(var(--u) * 9); height: calc(var(--u) * 9); border-radius: 50%;
  background: var(--hijau); color: var(--kertas); font-family: var(--font-display); font-weight: 700; font-size: calc(var(--u) * 5.5); display: grid; place-items: center; }
.bk-replay { left: 50%; top: 14%; transform: translateX(-50%); width: 24%; aspect-ratio: 1; border-radius: 50%; z-index: 4;
  background: #2F7DE1; color: var(--kertas); box-shadow: 0 calc(var(--u) * 1.2) 0 #1A4F99; display: grid; place-items: center; }
.bk-replay svg { width: 58%; height: auto; }
.bk-replay.playing { animation: bk-pulse .5s ease-in-out infinite alternate; }
@keyframes bk-pulse { from { transform: translateX(-50%) scale(1); } to { transform: translateX(-50%) scale(1.1); } }
@media (prefers-reduced-motion: reduce) { .bk-card:not(:disabled), .bk-replay.playing { animation: none; } }`,

  stageHtml: () => `<svg class="bg" viewBox="0 0 200 300" preserveAspectRatio="none" aria-hidden="true">
      <rect width="200" height="300" fill="#BFE3F0"/>
      <g fill="#FFFFFF" opacity=".9"><path d="M20 30 a8 8 0 0 1 14 -4 a9 9 0 0 1 16 3 a6 6 0 0 1 1 11 h-31 a6 6 0 0 1 0 -10z"/><path d="M140 52 a6 6 0 0 1 10 -3 a7 7 0 0 1 12 2 a5 5 0 0 1 1 9 h-23 a5 5 0 0 1 0 -8z"/></g>
      <g fill="#9AB3C7"><rect x="6" y="70" width="26" height="50"/><rect x="36" y="56" width="22" height="64"/><rect x="146" y="62" width="24" height="58"/><rect x="172" y="80" width="22" height="40"/></g>
      <g fill="#DCEAF2" opacity=".9">${[0, 1, 2, 3].map((i) => `<rect x="11" y="${76 + i * 11}" width="5" height="5"/><rect x="21" y="${76 + i * 11}" width="5" height="5"/><rect x="152" y="${68 + i * 12}" width="5" height="5"/><rect x="161" y="${68 + i * 12}" width="5" height="5"/>`).join('')}</g>
      <rect y="118" width="200" height="182" fill="#5F6B78"/>
      <g fill="#F2F2EA">${[0, 1, 2, 3, 4, 5, 6].map((i) => `<rect x="${4 + i * 30}" y="206" width="18" height="3" rx="1"/>`).join('')}</g>
      <rect y="118" width="200" height="6" fill="#C9D1D9"/>
    </svg>
    <button class="bk-replay" type="button" aria-label="Dengar bunyi lagi" disabled>${SPEAKER}</button>
    <div class="bk-cards"></div>`,

  initState: (age) => ({ age, level: AGE_LEVEL[age], rounds: [] }),
  normalize(s, age) {
    if (s.age !== age) { s.age = age; s.level = AGE_LEVEL[age]; }
    if (!Number.isInteger(s.level) || s.level < 1 || s.level > MAX_LEVEL) s.level = AGE_LEVEL[age];
    return s;
  },

  async round(ctx) {
    const { stage, state, say, sfx } = ctx;
    const cardsEl = stage.querySelector('.bk-cards'), replay = stage.querySelector('.bk-replay');
    const level = state.level, L = LEVELS[level];

    async function playSeq(seq) {
      replay.classList.add('playing');
      for (const id of seq) { const ms = ctx.synth(VEHICLE_SOUND[id]) || 1500; await ctx.wait(ms + 450); }
      replay.classList.remove('playing');
    }

    async function trial(seq, demo) {
      const opts = shuffle([...seq, ...shuffle(IDS.filter((i) => !seq.includes(i))).slice(0, L.options - seq.length)]);
      cardsEl.innerHTML = opts.map((id, i) => `<button class="bk-card" type="button" data-id="${id}" style="left:${CARD_AT[L.options][i][0]}%;top:${CARD_AT[L.options][i][1]}%" aria-label="${VEHICLES.find((v) => v.id === id).name}" disabled>${VEHICLE[id]()}</button>`).join('');
      stage.dataset.answer = seq.join(','); // untuk ujian automatik; tidak dibaca pembaca skrin
      const cards = [...cardsEl.querySelectorAll('.bk-card')];
      const arm = (on) => { cards.forEach((c) => { c.disabled = !on || c.classList.contains('dim') || c.classList.contains('chosen'); }); replay.disabled = !on; };
      await ctx.wait(400);
      await playSeq(seq);
      await ctx.wait(Math.max(700, say('tanya') + 100));
      const picks = [];
      let correct = true, attempts = 0, revealed = false;
      const t0 = performance.now();
      while (picks.length < seq.length) {
        const want = seq[picks.length];
        arm(true);
        if (demo && picks.length === 0) { const r = ctx.toPct(cards.find((c) => c.dataset.id === want).getBoundingClientRect()); ctx.hand.show(r.left + r.width * .45, r.top + 10); }
        let t = null;
        for (let r = 0; r <= REMINDERS && !t; r++) {
          t = await ctx.tap({ selector: '.bk-card, .bk-replay', ms: REMIND_MS });
          if (t && t.el === replay) { arm(false); await playSeq(seq); arm(true); t = null; r--; continue; }
          if (!t && r < REMINDERS) { arm(false); await playSeq(seq); arm(true); }
        }
        arm(false); ctx.hand.hide();
        const el = t ? t.el : null;
        if (el && el.dataset.id === want) {
          picks.push(want); sfx.pop();
          if (seq.length > 1) { el.classList.add('chosen'); el.insertAdjacentHTML('beforeend', `<span class="ord">${picks.length}</span>`); }
          continue;
        }
        correct = false; attempts++;
        if (el && attempts < 2) {
          sfx.soft(); el.classList.add('dim');
          await ctx.wait(Math.max(900, say('cuba-lagi') + 100));
          await playSeq(seq.slice(picks.length));
          continue;
        }
        // Tunjuk jawapan: kad betul diserlah dan namanya disebut.
        const right = cards.find((c) => c.dataset.id === want);
        right.classList.add('right'); sfx.pop(); revealed = true;
        const r = ctx.toPct(right.getBoundingClientRect()); ctx.hand.show(r.left + r.width * .45, r.top + 10);
        await ctx.wait(Math.max(1300, say('v-' + want) + 300));
        ctx.hand.hide();
        picks.push(want);
      }
      const rec = { seq, correct, rt: Math.round(performance.now() - t0) };
      if (correct) {
        sfx.good();
        for (const id of seq) { cards.find((c) => c.dataset.id === id).classList.add('right'); await ctx.wait(Math.max(900, say('v-' + id) + 100)); }
        await ctx.wait(Math.max(700, say(pick(PRAISE)) + 150));
      } else if (!revealed) { // betul pada cubaan kedua: tetap sebut nama supaya bunyi dikaitkan dengan kenderaan
        sfx.good();
        for (const id of seq) { cards.find((c) => c.dataset.id === id).classList.add('right'); await ctx.wait(Math.max(900, say('v-' + id) + 100)); }
      }
      return rec;
    }

    const n = L.seq > 1 ? 6 : TRIALS;
    ctx.progress(n);
    await ctx.ready(); ctx.alive();
    if (ctx.first) await ctx.wait(Math.max(1800, say('intro') + 200));
    if (L.seq > 1) await ctx.wait(Math.max(1800, say('urutan') + 200));
    const recs = [];
    let last = null;
    for (let i = 0; i < n; i++) {
      let seq;
      do { seq = shuffle(IDS).slice(0, L.seq); } while (seq[0] === last);
      last = seq[0];
      recs.push(await trial(seq, ctx.first && i === 0 && level === 1));
      ctx.mark(i);
      await ctx.wait(300);
    }
    delete stage.dataset.answer;

    const correct = recs.filter((r) => r.correct).length;
    const up = Math.ceil(n * UP_AT / TRIALS), down = Math.floor(n * DOWN_AT / TRIALS);
    if (correct >= up) state.level = Math.min(MAX_LEVEL, level + 1);
    else if (correct <= down) state.level = Math.max(1, level - 1);
    const heard = [...new Set(recs.filter((r) => r.correct).flatMap((r) => r.seq))];
    return {
      record: { level, correct, n, heard },
      foundHtml: heard.map(vehicleIcon).join(''),
      text: correct >= n * .75
        ? `Adik betul <span class="big-num">${correct}</span> daripada ${n}! Telinga adik tajam.`
        : `Adik betul <span class="big-num">${correct}</span> daripada ${n}. Dengar bunyi memang perlu latihan. Main lagi, ya!`,
    };
  },

  parent: {
    stats(s) {
      const last = s.rounds.slice(-7);
      const okP = pct(last.reduce((a, r) => a + (r.correct || 0), 0), last.reduce((a, r) => a + (r.n || 0), 0));
      const known = new Set(s.rounds.flatMap((r) => r.heard || []));
      return [
        { v: okP === null ? '–' : okP + '%', label: 'Betul' },
        { v: `${s.level}<small>/${MAX_LEVEL}</small>`, label: 'Tahap' },
        { v: `${known.size}<small>/${IDS.length}</small>`, label: 'Bunyi dikenal' },
      ];
    },
    cols: ['Tahap', 'Betul', 'Bunyi'],
    row: (r) => [r.level, meter(pct(r.correct, r.n)), (r.heard || []).length],
    explain: `<span><b>Diskriminasi pendengaran</b>: membezakan bunyi yang hampir sama (siren bomba lwn ambulans, hon lori lwn hon bas). Kemahiran mendengar yang teliti membantu anak membezakan bunyi huruf kelak.</span>
      <span>Tahap 1–3: 2, 3, 4 pilihan · Tahap 4: dua bunyi berturut-turut, tekan ikut urutan (ingatan pendengaran). Anak boleh tekan butang pembesar suara untuk dengar semula. Naik bila hampir semua betul, turun bila separuh atau kurang.</span>`,
  },

  mission: {
    title: 'Main "Bunyi Apa Tu?" di luar rumah',
    steps: [
      'Semasa berjalan atau dalam kereta, berhenti sekejap dan tanya: <b>"Dengar! Bunyi apa tu?"</b>',
      'Teka bersama: hon kereta, motosikal, siren, burung, azan, tukang aiskrim.',
      'Di rumah: tutup mata anak, ketuk sudu pada cawan, periuk dan meja. <b>"Mana satu?"</b>',
      'Bila dah senang, buat dua bunyi berturut-turut dan minta anak ulang ikut urutan.',
    ],
    why: 'Kenapa? Mendengar dengan teliti dan mengingat urutan bunyi ialah asas untuk faham arahan dan membezakan bunyi huruf semasa belajar membaca.',
  },
};
