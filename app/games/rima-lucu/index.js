// Rima Lucu: kesedaran fonologi (rima). Sayf sebut satu perkataan; anak cari gambar yang bunyinya sama di hujung
// (ayam–jam, topi–kopi). Setiap pilihan disebut kuat supaya anak bergantung pada bunyi, bukan meneka dari gambar.
import { itemIcon } from '../../kit/pasar.js';
import { bendaIcon } from '../../kit/benda.js';
import { pick, shuffle, pct, meter } from '../../kit/util.js';

// Pasangan berima (rima berbeza antara pasangan supaya pengganggu tidak pernah berima secara kebetulan).
const PAIRS = [['ayam', 'jam'], ['ikan', 'bulan'], ['jagung', 'payung'], ['topi', 'kopi'], ['bantal', 'kapal'], ['pintu', 'batu'], ['katak', 'kotak']];
const FROM_PASAR = new Set(['ayam', 'ikan', 'jagung']);
const icon = (w) => (FROM_PASAR.has(w) ? itemIcon(w) : bendaIcon(w));
const NAME = { ayam: 'Ayam', jam: 'Jam', ikan: 'Ikan', bulan: 'Bulan', jagung: 'Jagung', payung: 'Payung', topi: 'Topi', kopi: 'Kopi', bantal: 'Bantal', kapal: 'Kapal', pintu: 'Pintu', batu: 'Batu', katak: 'Katak', kotak: 'Kotak' };
const WORDS = Object.keys(NAME);

const TRIALS = 6;
// opts = bilangan pilihan, twice = sebut perkataan sasaran dua kali.
const LEVELS = [null, { opts: 2, twice: true }, { opts: 3, twice: true }, { opts: 3, twice: false }, { opts: 4, twice: false }];
const MAX_LEVEL = 4;
const AGE_LEVEL = { 3: 1, 4: 1, 5: 2, 6: 3 };
const UP_AT = 5, DOWN_AT = 3;
const IDLE_MS = 10000;

export default {
  id: 'rima-lucu',
  title: 'Rima Lucu',
  stageLabel: 'Satu gambar di atas, beberapa pilihan di bawah. Tekan gambar yang bunyinya sama di hujung.',
  lines: {
    intro: 'Jom main rima! Cari perkataan yang bunyinya sama di hujung.',
    tanya: 'Mana yang bunyinya sama?',
    sama: 'Betul! Bunyinya sama!',
    ...Object.fromEntries(WORDS.map((w) => [`w-${w}`, NAME[w] + '.'])),
  },
  recorded: ['intro', 'tanya', 'sama', ...WORDS.map((w) => `w-${w}`)],

  css: `.rl-target { left: 30%; width: 40%; top: 12%; aspect-ratio: 1; z-index: 3; padding: 4%; border-radius: 50%; background: #FFFDF5;
  box-shadow: 0 0 0 calc(var(--u) * 1.4) #F5B82E, 0 calc(var(--u) * 1.4) 0 rgba(0,0,0,.2); }
.rl-target svg, .rl-opt svg { width: 100%; height: 100%; display: block; }
.rl-target:disabled { cursor: default; }
.rl-ear { position: absolute; right: -4%; bottom: -2%; width: 30%; aspect-ratio: 1; border-radius: 50%; background: var(--kuning); display: grid; place-items: center; color: var(--ink); }
.rl-ear svg { width: 60%; height: auto; }
.rl-opts { left: 4%; right: 4%; top: 52%; bottom: 6%; z-index: 3; display: flex; flex-wrap: wrap; justify-content: center; align-content: center; gap: calc(var(--u) * 3); }
.rl-opt { width: 40%; aspect-ratio: 1; padding: 4%; border-radius: calc(var(--u) * 5); background: #FFFDF5; box-shadow: 0 calc(var(--u) * 1.2) 0 rgba(0,0,0,.2);
  transition: transform .2s, opacity .3s; }
.rl-opts[data-n="4"] .rl-opt { width: 38%; }
.rl-opt.speak { transform: scale(1.08); box-shadow: 0 0 0 calc(var(--u) * 1.2) #2F7DE1, 0 calc(var(--u) * 1.2) 0 rgba(0,0,0,.2); }
.rl-opt.ok { box-shadow: 0 0 0 calc(var(--u) * 1.4) var(--kuning), 0 calc(var(--u) * 1.2) 0 rgba(0,0,0,.2); }
.rl-opt.dim { opacity: .35; }
.rl-opt.hidden { visibility: hidden; }
.rl-opt:disabled { cursor: default; }`,

  stageHtml: () => `<svg class="bg" viewBox="0 0 200 300" preserveAspectRatio="none" aria-hidden="true">
      <rect width="200" height="300" fill="#CDB3F0"/>
      <g fill="#BFA0EA">${[[20, 40, 14], [180, 70, 20], [30, 250, 22], [170, 270, 16], [100, 150, 10]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('')}</g>
      <g fill="none" stroke="#FFFDF5" stroke-width="2.5" stroke-linecap="round" opacity=".7"><path d="M18 120 q6 -6 12 0 t12 0"/><path d="M158 128 q6 -6 12 0 t12 0"/></g>
      <rect y="148" width="200" height="152" fill="#B79BE6" opacity=".55"/>
    </svg>
    <button class="rl-target" type="button" aria-label="Dengar perkataan" disabled></button>
    <div class="rl-opts"></div>`,

  initState: (age) => ({ age, level: AGE_LEVEL[age], rounds: [] }),
  normalize(s, age) {
    if (s.age !== age) { s.age = age; s.level = AGE_LEVEL[age]; }
    if (!Number.isInteger(s.level) || s.level < 1 || s.level > MAX_LEVEL) s.level = AGE_LEVEL[age];
    return s;
  },

  async round(ctx) {
    const { stage, state, say, sfx, anim } = ctx;
    const targetEl = stage.querySelector('.rl-target'), optsEl = stage.querySelector('.rl-opts');
    const level = state.level, L = LEVELS[level];
    const EAR = `<span class="rl-ear" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg></span>`;
    const sayWord = async (w, extra = 250) => ctx.wait(Math.max(650, say(`w-${w}`) + extra));

    // Sasaran seimbang: setiap pasangan sekali dahulu sebelum berulang; perkataan sasaran dari mana-mana hujung pasangan.
    const pairOrder = shuffle(PAIRS).slice(0, TRIALS);

    async function trial([a, b], demo) {
      const [target, answer] = Math.random() < .5 ? [a, b] : [b, a];
      const others = shuffle(WORDS.filter((w) => w !== a && w !== b)).slice(0, L.opts - 1);
      const opts = shuffle([answer, ...others]);
      targetEl.innerHTML = icon(target) + EAR;
      targetEl.setAttribute('aria-label', `${NAME[target]}. Tekan untuk dengar lagi`);
      optsEl.dataset.n = String(opts.length);
      optsEl.innerHTML = opts.map((w) => `<button class="rl-opt hidden" type="button" data-w="${w}" aria-label="${NAME[w]}" disabled>${icon(w)}</button>`).join('');
      stage.dataset.answer = answer; // untuk ujian automatik
      const cards = [...optsEl.querySelectorAll('.rl-opt')];
      const correctBtn = cards.find((c) => c.dataset.w === answer);
      const arm = (on) => { cards.forEach((c) => { c.disabled = !on; }); targetEl.disabled = !on; };
      const hint = () => { const r = ctx.toPct(correctBtn.getBoundingClientRect()); ctx.hand.show(r.left + r.width * .45, r.top + r.width * .3); };

      // Perkenalkan: sasaran, kemudian setiap pilihan muncul dan disebut.
      sfx.pop();
      await anim(targetEl, [{ transform: 'scale(.6)' }, { transform: 'scale(1)' }], { duration: 300, fill: 'none' });
      await sayWord(target, 350);
      if (L.twice) await sayWord(target, 450);
      const present = async () => {
        for (const c of cards) {
          c.classList.remove('hidden'); c.classList.add('speak');
          await sayWord(c.dataset.w, 300);
          c.classList.remove('speak');
        }
      };
      await present();
      await ctx.wait(Math.max(900, say('tanya') + 100));

      let wrong = 0;
      for (;;) {
        if (demo && wrong === 0) hint();
        arm(true);
        const t = await ctx.tap({ selector: '.rl-opt, .rl-target', ms: IDLE_MS });
        arm(false); ctx.hand.hide();
        if (!t) { await sayWord(target, 400); await ctx.wait(Math.max(900, say('tanya') + 100)); continue; }
        if (t.el === targetEl) { await sayWord(target, 200); continue; }   // dengar lagi, tiada penalti
        const w = t.el.dataset.w;
        if (w === answer) {
          t.el.classList.add('ok'); cards.forEach((c) => { if (c !== t.el) c.classList.add('dim'); });
          sfx.good();
          // Dengarkan pasangan rima bersama: "Ayam… jam!"
          await sayWord(target, 150);
          await sayWord(answer, 300);
          await ctx.wait(Math.max(1000, say(wrong === 0 ? 'sama' : 'betul') + 200));
          break;
        }
        wrong++;
        sfx.soft();
        await anim(t.el, [{ transform: 'translateX(0)' }, { transform: 'translateX(-6%)' }, { transform: 'translateX(6%)' }, { transform: 'translateX(0)' }], { duration: 340, fill: 'none' });
        // Bandingkan bunyi: sebut pilihan anak, kemudian sasaran, supaya anak dengar bezanya.
        await sayWord(w, 300);
        await sayWord(target, 400);
        if (wrong >= 2) hint();
        else await ctx.wait(Math.max(800, say('cuba-lagi') + 100));
      }
      return { target, answer, correct: wrong === 0 };
    }

    ctx.progress(TRIALS);
    await ctx.ready(); ctx.alive();
    if (ctx.first) await ctx.wait(Math.max(2800, say('intro') + 200));
    const recs = [];
    for (let i = 0; i < TRIALS; i++) {
      recs.push(await trial(pairOrder[i % pairOrder.length], ctx.first && i === 0 && level === 1));
      ctx.mark(i);
      await ctx.wait(300);
    }
    delete stage.dataset.answer;

    const correct = recs.filter((r) => r.correct).length;
    if (correct >= UP_AT) state.level = Math.min(MAX_LEVEL, level + 1);
    else if (correct <= DOWN_AT) state.level = Math.max(1, level - 1);
    const shown = recs.slice(0, 3);
    return {
      record: { level, correct, n: recs.length, opts: L.opts },
      foundHtml: shown.map((r) => icon(r.target) + icon(r.answer)).join(''),
      text: `Adik jumpa <span class="big-num">${recs.length}</span> pasangan rima! Betul pada kali pertama: <span class="big-num">${correct}</span>.`,
    };
  },

  parent: {
    stats(s) {
      const last = s.rounds.slice(-7);
      const okP = pct(last.reduce((a, r) => a + (r.correct || 0), 0), last.reduce((a, r) => a + (r.n || 0), 0));
      const best = s.rounds.reduce((m, r) => (r.correct >= UP_AT ? Math.max(m, r.opts || 0) : m), 0);
      return [
        { v: okP === null ? '–' : okP + '%', label: 'Betul kali pertama' },
        { v: `${s.level}<small>/${MAX_LEVEL}</small>`, label: 'Tahap' },
        { v: best ? `${best}<small> pilihan</small>` : '–', label: 'Paling sukar dikuasai' },
      ];
    },
    cols: ['Tahap', 'Betul', 'Pilihan'],
    row: (r) => [r.level, meter(pct(r.correct, r.n)), r.opts || '–'],
    explain: `<span><b>Kesedaran rima</b>: mendengar bahawa dua perkataan berakhir dengan bunyi yang sama (ay<b>am</b> – j<b>am</b>). Ini salah satu peramal terkuat kesediaan membaca. Kebanyakan kanak-kanak mula mengesan rima sekitar umur 4, dan menguasainya pada umur 5–6. Skor rendah pada umur 3 adalah normal.</span>
      <span>Tahap 1: 2 pilihan, perkataan disebut dua kali · Tahap 2: 3 pilihan · Tahap 3: 3 pilihan, sekali sebut · Tahap 4: 4 pilihan. Bila salah, Sayf sebut kedua-dua perkataan bersebelahan supaya anak dengar bezanya. Naik bila 5/6 betul.</span>`,
  },

  mission: {
    title: 'Main "Cari Rima" dalam kereta',
    steps: [
      'Sebut satu perkataan dan cari yang berima bersama: <b>"Topi… kopi! Batu… pintu!"</b>',
      'Main "Mana yang tak sama?": <b>"Jam, ayam, bola."</b> Biar anak teka.',
      'Perkataan lucu pun boleh: <b>"Kucing… bucing!"</b> Yang penting bunyi hujungnya sama.',
      'Nyanyi lagu kanak-kanak dan berhenti sebelum perkataan berima; biar anak sambung.',
    ],
    why: 'Kenapa? Bermain rima melatih telinga anak memecahkan perkataan kepada bunyi. Inilah asas kepada membaca dan mengeja.',
  },
};
