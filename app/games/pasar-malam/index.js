// Pasar Malam: ingatan kerja verbal (span senarai). Hafiz sebut senarai beli 2–4 barang; anak ambil dari gerai.
// Tahap rendah: gambar senarai ditunjuk semasa Hafiz bercakap, kemudian disorok. Tahap tinggi: dengar sahaja.
// Butang "dengar lagi" sentiasa ada; penggunaannya direkod (sokongan, bukan hukuman).
import { ITEMS, itemIcon } from '../../kit/pasar.js';
import { shuffle, pct, meter } from '../../kit/util.js';

const TRIALS = 4;
const LEVELS = [null,
  { n: 2, show: true, stalls: 6 },
  { n: 3, show: true, stalls: 6 },
  { n: 3, show: false, stalls: 8 },
  { n: 4, show: false, stalls: 8 },
];
const MAX_LEVEL = 4;
const AGE_LEVEL = { 3: 1, 4: 2, 5: 3, 6: 3 };
const UP_AT = 3, DOWN_AT = 1;      // senarai sempurna (tiada salah, tiada dengar lagi) daripada 4
const IDLE_MS = 10000;
const EAR = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`;
const BASKET = `<svg viewBox="0 0 120 70" aria-hidden="true"><path d="M30 26 Q60 -6 90 26" stroke="#8A5A1E" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M8 26 H112 L102 66 H18 Z" fill="#D9A441" stroke="#8A5A1E" stroke-width="4" stroke-linejoin="round"/><g stroke="#B07A24" stroke-width="3">${[30, 46, 62, 78, 94].map((x) => `<path d="M${x} 28 L${x - 3} 64"/>`).join('')}<path d="M12 40 H108 M15 53 H105"/></g></svg>`;

export default {
  id: 'pasar-malam',
  title: 'Pasar Malam',
  stageLabel: 'Gerai pasar malam. Dengar senarai beli, kemudian tekan barang yang disebut.',
  lines: {
    intro: 'Jom ke pasar malam! Dengar baik-baik apa yang ibu nak beli.',
    beli: 'Tolong belikan…',
    'apa-lagi': 'Apa lagi yang ibu nak?',
    bukan: 'Hmm, itu tak ada dalam senarai.',
    cukup: 'Semua dah ada! Terima kasih, adik!',
    ...Object.fromEntries(ITEMS.map((i) => [`i-${i.id}`, i.name + '.'])),
  },
  recorded: ['intro', 'beli', 'apa-lagi', 'bukan', 'cukup', ...ITEMS.map((i) => `i-${i.id}`)],

  css: `.pm-bubble { left: 8%; right: 8%; top: 12%; height: 14%; z-index: 5; display: flex; justify-content: center; align-items: center; gap: 4%;
  background: #FFFDF5; border-radius: calc(var(--u) * 5); box-shadow: 0 calc(var(--u) * 1) 0 rgba(0,0,0,.18); transition: opacity .3s, transform .3s; }
.pm-bubble::after { content: ''; position: absolute; left: 14%; bottom: calc(var(--u) * -3); border: calc(var(--u) * 3) solid transparent; border-top-color: #FFFDF5; border-bottom: 0; }
.pm-bubble[hidden] { display: flex; opacity: 0; transform: scale(.9); }
.pm-bubble svg { height: 80%; width: auto; }
.pm-stalls { left: 4%; right: 4%; top: 30%; height: 46%; z-index: 3; display: grid; gap: calc(var(--u) * 2.4); }
.pm-item { position: relative; padding: 8%; border-radius: calc(var(--u) * 3.5); background: #FFFDF5; min-width: 0; min-height: 0;
  box-shadow: 0 calc(var(--u) * 1.1) 0 rgba(0,0,0,.22); display: grid; place-items: center; }
.pm-item svg { width: 100%; height: 100%; max-height: 100%; display: block; }
.pm-item:disabled { cursor: default; }
.pm-item.taken { visibility: hidden; }
.pm-basket { left: 4%; width: 56%; top: 79%; height: 19%; z-index: 4; pointer-events: none; }
.pm-basket > svg { position: absolute; inset: 0; width: 100%; height: 100%; }
.pm-in { position: absolute; left: 12%; right: 12%; top: 2%; height: 46%; display: flex; justify-content: center; align-items: flex-end; gap: 2%; }
.pm-in svg { height: 100%; width: auto; }
.pm-replay { right: 5%; width: 30%; top: 82%; height: 12%; z-index: 4; border-radius: calc(var(--u) * 4); background: var(--kuning); color: var(--ink);
  box-shadow: 0 calc(var(--u) * 1.1) 0 var(--kuning-tekan); display: grid; place-items: center; }
.pm-replay svg { width: 46%; height: auto; }
.pm-replay:disabled { opacity: .45; box-shadow: none; }`,

  stageHtml: () => `<svg class="bg" viewBox="0 0 200 300" preserveAspectRatio="none" aria-hidden="true">
      <rect width="200" height="300" fill="#1E2A4A"/>
      <g fill="#FFE68A">${[[20, 14], [60, 8], [110, 18], [160, 10], [185, 26], [40, 30]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.4"/>`).join('')}</g>
      <path d="M0 80 H200 V86 H0 Z" fill="#8A5A1E"/>
      <g>${[...Array(10)].map((_, i) => `<path d="M${i * 20} 86 h20 l-2 12 a8 8 0 0 1 -16 0 z" fill="${i % 2 ? '#FFFDF5' : '#E5484D'}"/>`).join('')}</g>
      <path d="M0 84 Q50 96 100 84 Q150 96 200 84" stroke="#2B2F36" stroke-width="1" fill="none"/>
      <g>${[...Array(9)].map((_, i) => `<circle cx="${12 + i * 22}" cy="${88 + (i % 2 ? 5 : 2)}" r="3" fill="${['#F5B82E', '#22B26A', '#2F7DE1'][i % 3]}"/>`).join('')}</g>
      <rect y="98" width="200" height="140" fill="#3B4A6B"/>
      <rect y="232" width="200" height="68" fill="#5B6270"/>
      <rect y="232" width="200" height="4" fill="#8A5A1E"/>
    </svg>
    <div class="pm-bubble" hidden aria-hidden="true"></div>
    <div class="pm-stalls"></div>
    <div class="pm-basket">${BASKET}<div class="pm-in"></div></div>
    <button class="pm-replay" type="button" aria-label="Dengar senarai lagi" disabled>${EAR}</button>`,

  initState: (age) => ({ age, level: AGE_LEVEL[age], rounds: [] }),
  normalize(s, age) {
    if (s.age !== age) { s.age = age; s.level = AGE_LEVEL[age]; }
    if (!Number.isInteger(s.level) || s.level < 1 || s.level > MAX_LEVEL) s.level = AGE_LEVEL[age];
    return s;
  },

  async round(ctx) {
    const { stage, state, say, sfx, anim } = ctx;
    const bubble = stage.querySelector('.pm-bubble'), stalls = stage.querySelector('.pm-stalls');
    const basketIn = stage.querySelector('.pm-in'), replay = stage.querySelector('.pm-replay');
    const level = state.level, L = LEVELS[level];

    // Sebut senarai: "Tolong belikan… ayam. Ikan." Gambar senarai ditunjuk pada tahap rendah, kemudian disorok.
    async function sayList(list, showPics) {
      if (showPics) { bubble.innerHTML = list.map(itemIcon).join(''); bubble.hidden = false; }
      await ctx.wait(Math.max(900, say('beli') + 150));
      for (const id of list) await ctx.wait(Math.max(650, say(`i-${id}`) + 350));
      if (showPics) { await ctx.wait(700); bubble.hidden = true; }
      ctx.caption('');
    }

    async function trial(list, demo) {
      const others = shuffle(ITEMS.map((i) => i.id).filter((id) => !list.includes(id))).slice(0, L.stalls - list.length);
      const shelf = shuffle([...list, ...others]);
      stalls.style.gridTemplateColumns = `repeat(${L.stalls === 6 ? 3 : 4}, 1fr)`;
      stalls.style.gridTemplateRows = 'repeat(2, 1fr)';
      stalls.innerHTML = shelf.map((id) => `<button class="pm-item" type="button" data-id="${id}" aria-label="${ITEMS.find((i) => i.id === id).name}" disabled>${itemIcon(id)}</button>`).join('');
      basketIn.innerHTML = '';
      stage.dataset.list = list.join(','); // untuk ujian automatik
      const items = [...stalls.querySelectorAll('.pm-item')];
      const got = new Set();
      let errors = 0, replays = 0, idleNudges = 0;
      const arm = (on) => { items.forEach((b) => { b.disabled = !on || b.classList.contains('taken'); }); replay.disabled = !on; };
      arm(false);
      sfx.pop();
      await ctx.wait(400);
      await sayList(list, L.show);
      if (demo) { const b = items.find((x) => x.dataset.id === list[0]); const r = ctx.toPct(b.getBoundingClientRect()); ctx.hand.show(r.left + r.width * .4, r.top + r.width * .3); }

      while (got.size < list.length) {
        arm(true);
        const t = await ctx.tap({ selector: '.pm-item, .pm-replay', ms: IDLE_MS });
        arm(false); ctx.hand.hide();
        if (!t) {
          idleNudges++;
          if (idleNudges % 2 === 1 && got.size) await ctx.wait(Math.max(900, say('apa-lagi') + 150));
          else { replays++; await sayList(list, L.show); }
          continue;
        }
        if (t.el.classList.contains('pm-replay')) { replays++; sfx.pop(); await sayList(list, L.show); continue; }
        const id = t.el.dataset.id;
        if (list.includes(id) && !got.has(id)) {
          got.add(id);
          t.el.classList.add('taken');
          basketIn.insertAdjacentHTML('beforeend', itemIcon(id));
          anim(basketIn.lastElementChild, [{ transform: 'translateY(-60%) scale(.6)' }, { transform: 'translateY(0) scale(1)' }], { duration: 320, fill: 'none' });
          sfx.good();
          await ctx.wait(Math.max(650, say(`i-${id}`) + 150));
          continue;
        }
        errors++;
        sfx.soft();
        await anim(t.el, [{ transform: 'translateX(0)' }, { transform: 'translateX(-6%)' }, { transform: 'translateX(6%)' }, { transform: 'translateX(0)' }], { duration: 360, fill: 'none' });
        await ctx.wait(Math.max(1200, say('bukan') + 150));
        if (errors % 2 === 0) { replays++; await sayList(list, L.show); }   // dua kali salah: sebut semula senarai
      }
      await ctx.wait(Math.max(1600, say('cukup') + 200));
      return { n: list.length, errors, replays, perfect: errors === 0 && replays === 0 };
    }

    ctx.progress(TRIALS);
    await ctx.ready(); ctx.alive();
    if (ctx.first) await ctx.wait(Math.max(2800, say('intro') + 200));
    const recs = [];
    let prev = [];
    for (let i = 0; i < TRIALS; i++) {
      // Elak senarai yang sama dengan sebelumnya.
      let list; do { list = shuffle(ITEMS.map((x) => x.id)).slice(0, L.n); } while (list.some((id) => prev.includes(id)) && L.n <= 3 && Math.random() < .7);
      prev = list;
      recs.push(await trial(list, ctx.first && i === 0 && level === 1));
      ctx.mark(i);
      await ctx.wait(300);
    }
    delete stage.dataset.list;
    basketIn.innerHTML = '';

    const perfect = recs.filter((r) => r.perfect).length;
    const errors = recs.reduce((a, r) => a + r.errors, 0), replays = recs.reduce((a, r) => a + r.replays, 0);
    if (perfect >= UP_AT) state.level = Math.min(MAX_LEVEL, level + 1);
    else if (perfect <= DOWN_AT) state.level = Math.max(1, level - 1);
    const total = recs.reduce((a, r) => a + r.n, 0);
    return {
      record: { level, n: L.n, trials: recs.length, perfect, errors, replays },
      foundHtml: shuffle(ITEMS.map((x) => x.id)).slice(0, 4).map(itemIcon).join(''),
      text: `Adik beli <span class="big-num">${total}</span> barang untuk ibu!` + (perfect ? ` <span class="big-num">${perfect}</span> senarai diingat dengan sempurna.` : ' Terima kasih, adik!'),
    };
  },

  parent: {
    stats(s) {
      const last = s.rounds.slice(-7);
      const okP = pct(last.reduce((a, r) => a + (r.perfect || 0), 0), last.reduce((a, r) => a + (r.trials || 0), 0));
      const best = s.rounds.reduce((m, r) => (r.perfect ? Math.max(m, r.n || 0) : m), 0);
      return [
        { v: okP === null ? '–' : okP + '%', label: 'Senarai sempurna' },
        { v: `${s.level}<small>/${MAX_LEVEL}</small>`, label: 'Tahap' },
        { v: best ? `${best}<small> barang</small>` : '–', label: 'Senarai terpanjang diingat' },
      ];
    },
    cols: ['Tahap', 'Sempurna', 'Dengar lagi'],
    row: (r) => [r.level, meter(pct(r.perfect, r.trials)), r.replays],
    explain: `<span><b>Ingatan kerja verbal</b>: menyimpan beberapa perkataan dalam kepala sambil mencari. Budak 3 tahun biasanya boleh 2 barang, budak 5–6 tahun 3–4 barang. Kemahiran ini penting untuk mengikut arahan berbilang langkah di sekolah.</span>
      <span>Tahap 1–2: 2–3 barang dengan gambar semasa mendengar · Tahap 3–4: 3–4 barang, dengar sahaja. <b>Sempurna</b> = tiada salah pilih dan tiada "dengar lagi". Menekan "dengar lagi" itu strategi yang baik, bukan kegagalan. Naik bila 3/4 senarai sempurna.</span>`,
  },

  mission: {
    title: 'Jadikan anak "pembantu beli-belah"',
    steps: [
      'Di pasar atau kedai, beri anak 2 barang untuk diingat: <b>"Tolong cari roti dan susu."</b> Jangan tulis.',
      'Ajar strategi: ulang senarai sambil berjalan, atau kira dengan jari.',
      'Bila dah senang, naik ke 3 barang.',
      'Di rumah: <b>"Ambil sudu, cawan dan pinggan."</b>',
    ],
    why: 'Kenapa? Mengingat senarai pendek melatih ingatan kerja, kemahiran yang sama digunakan untuk mengikut arahan cikgu dan menyelesaikan soalan bercerita.',
  },
};
