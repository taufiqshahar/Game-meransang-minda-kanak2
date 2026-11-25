// Apa Yang Hilang?: ingatan kerja visual ("Kim's game"). Barang pasar atas dulang; kain menutup, satu barang diambil,
// kain dibuka: barang mana yang hilang? Tahap 4: barang yang tinggal juga bertukar tempat (perlu ingat APA, bukan DI MANA).
import { ITEMS, itemIcon } from '../../kit/pasar.js';
import { shuffle, pct, meter } from '../../kit/util.js';

const IDS = ITEMS.map((i) => i.id);
const NAME = Object.fromEntries(ITEMS.map((i) => [i.id, i.name]));
// n = barang atas dulang · opts = pilihan jawapan · study = masa hafal (ms) · swap = barang bertukar tempat
const LEVELS = [null,
  { n: 3, opts: 3, study: 4500 },
  { n: 4, opts: 3, study: 5000 },
  { n: 5, opts: 4, study: 5500 },
  { n: 6, opts: 4, study: 6000, swap: true },
];
const MAX_LEVEL = 4;
const AGE_LEVEL = { 3: 1, 4: 2, 5: 2, 6: 3 };
const TRIALS = 5, UP_AT = 4, DOWN_AT = 2;
const IDLE_MS = 10000;
// Kedudukan petak atas dulang (% kawasan dulang) untuk 6 barang.
const SPOTS = [[18, 30], [50, 28], [82, 30], [18, 72], [50, 74], [82, 72]];

export default {
  id: 'apa-hilang',
  title: 'Apa Yang Hilang?',
  stageLabel: 'Dulang berisi barang pasar. Hafal, kemudian teka barang yang hilang selepas dulang ditutup.',
  lines: {
    intro: 'Tengok barang atas dulang. Ingat baik-baik!',
    tutup: 'Tutup... Satu barang dah hilang!',
    tanya: 'Apa yang hilang?',
    ...Object.fromEntries(ITEMS.map((i) => [`i-${i.id}`, i.name + '.'])),
  },
  recorded: ['intro', 'tutup', 'tanya', ...IDS.map((id) => `i-${id}`)],

  css: `.ah-tray { left: 6%; width: 88%; top: 13%; height: 40%; z-index: 2; border-radius: 50% / 22%; background: #C99456; box-shadow: inset 0 0 0 calc(var(--u) * 2.4) #8A5A1E, 0 calc(var(--u) * 1.4) 0 rgba(0,0,0,.2); overflow: hidden; }
.ah-item { position: absolute; width: 25%; aspect-ratio: 1; transform: translate(-50%, -50%); transition: left .5s, top .5s, opacity .3s; }
.ah-item svg { width: 100%; height: 100%; display: block; }
.ah-item.gone { opacity: 0; }
.ah-item.shake { animation: ah-shake .4s; }
@keyframes ah-shake { 25% { transform: translate(-58%, -50%); } 75% { transform: translate(-42%, -50%); } }
.ah-item.back { animation: ah-back .6s; }
@keyframes ah-back { 0% { transform: translate(-50%, -50%) scale(.3); opacity: 0; } 70% { transform: translate(-50%, -50%) scale(1.15); opacity: 1; } }
.ah-cloth { position: absolute; inset: -2%; z-index: 3; background: repeating-linear-gradient(45deg, #E5484D 0 8%, #C73A3F 8% 16%); border-radius: inherit; transform: translateY(-110%); transition: transform .7s cubic-bezier(.5,0,.3,1); }
.ah-cloth.on { transform: translateY(0); }
.ah-opts { left: 4%; right: 4%; top: 60%; bottom: 6%; z-index: 3; display: flex; justify-content: center; align-items: center; gap: calc(var(--u) * 2.5); }
.ah-opt { width: 29%; aspect-ratio: 1; padding: 3%; border-radius: calc(var(--u) * 5); background: #FFFDF5; box-shadow: 0 calc(var(--u) * 1.2) 0 rgba(0,0,0,.2); transition: opacity .3s; }
.ah-opts[data-n="4"] .ah-opt { width: 22%; }
.ah-opt svg { width: 100%; height: 100%; display: block; }
.ah-opt.dim { opacity: .3; } .ah-opt:disabled { cursor: default; }
.ah-opt.ok { box-shadow: 0 0 0 calc(var(--u) * 1.4) var(--kuning), 0 calc(var(--u) * 1.2) 0 rgba(0,0,0,.2); }`,

  stageHtml: () => `<svg class="bg" viewBox="0 0 200 300" preserveAspectRatio="none" aria-hidden="true">
      <rect width="200" height="300" fill="#FCE9C8"/><rect y="0" width="200" height="24" fill="#E5484D"/>
      <g>${Array.from({ length: 8 }, (_, i) => `<path d="M${i * 25} 24 q12.5 10 25 0 z" fill="${i % 2 ? '#FFFDF5' : '#E5484D'}"/>`).join('')}</g>
      <rect y="168" width="200" height="132" fill="#B07A44"/><rect y="164" width="200" height="6" fill="#8A5A2E"/>
    </svg>
    <div class="ah-tray"><div class="ah-items"></div><div class="ah-cloth" aria-hidden="true"></div></div>
    <div class="ah-opts"></div>`,

  initState: (age) => ({ age, level: AGE_LEVEL[age], rounds: [] }),
  normalize(s, age) {
    if (s.age !== age) { s.age = age; s.level = AGE_LEVEL[age]; }
    if (!Number.isInteger(s.level) || s.level < 1 || s.level > MAX_LEVEL) s.level = AGE_LEVEL[age];
    return s;
  },

  async round(ctx) {
    const { stage, state, say, sfx } = ctx;
    const itemsEl = stage.querySelector('.ah-items'), cloth = stage.querySelector('.ah-cloth'), optsEl = stage.querySelector('.ah-opts');
    const level = state.level, L = LEVELS[level];

    async function trial(demo) {
      const onTray = shuffle(IDS).slice(0, L.n);
      const spots = shuffle(SPOTS).slice(0, L.n);
      itemsEl.innerHTML = onTray.map((id, i) => `<div class="ah-item" data-id="${id}" style="left:${spots[i][0]}%;top:${spots[i][1]}%" role="img" aria-label="${NAME[id]}">${itemIcon(id)}</div>`).join('');
      optsEl.innerHTML = '';
      cloth.classList.remove('on');
      sfx.pop();
      await ctx.wait(Math.max(L.study, say(demo ? 'intro' : 'tengok') + 800));
      // Tutup, ambil satu barang, (Tahap 4: tukar tempat), buka.
      cloth.classList.add('on');
      await ctx.wait(800);
      const missing = onTray[Math.floor(Math.random() * onTray.length)];
      const missEl = itemsEl.querySelector(`[data-id="${missing}"]`);
      missEl.classList.add('gone');
      if (L.swap) {
        const rest = [...itemsEl.querySelectorAll('.ah-item:not(.gone)')];
        const pos = shuffle(rest.map((e) => [e.style.left, e.style.top]));
        rest.forEach((e, i) => { e.style.transition = 'none'; e.style.left = pos[i][0]; e.style.top = pos[i][1]; });
      }
      await ctx.wait(Math.max(900, say('tutup') + 100));
      cloth.classList.remove('on');
      await ctx.wait(700);
      itemsEl.querySelectorAll('.ah-item').forEach((e) => { e.style.transition = ''; });

      // Pilihan: barang yang hilang + pengganggu (barang luar dulang dahulu, kemudian barang yang masih ada).
      const outside = shuffle(IDS.filter((x) => !onTray.includes(x)));
      const present = shuffle(onTray.filter((x) => x !== missing));
      const opts = shuffle([missing, ...[...outside, ...present].slice(0, L.opts - 1)]);
      optsEl.dataset.n = String(opts.length);
      optsEl.innerHTML = opts.map((id) => `<button class="ah-opt" type="button" data-id="${id}" aria-label="${NAME[id]}" disabled>${itemIcon(id)}</button>`).join('');
      stage.dataset.answer = missing; // untuk ujian automatik
      const cards = [...optsEl.querySelectorAll('.ah-opt')];
      const right = cards.find((c) => c.dataset.id === missing);
      const arm = (on) => cards.forEach((c) => { c.disabled = !on || c.classList.contains('dim'); });
      const hint = () => { const r = ctx.toPct(right.getBoundingClientRect()); ctx.hand.show(r.left + r.width * .45, r.top + r.width * .35); };
      await ctx.wait(Math.max(900, say('tanya') + 100));

      let wrong = 0;
      for (;;) {
        if (demo && wrong === 0) hint();
        arm(true);
        const tap = await ctx.tap({ selector: '.ah-opt', ms: IDLE_MS });
        arm(false); ctx.hand.hide();
        if (!tap) { hint(); await ctx.wait(Math.max(900, say('tanya') + 100)); continue; }
        const id = tap.el.dataset.id;
        if (tap.el === right) break;
        wrong++;
        sfx.soft();
        await ctx.wait(Math.max(700, say(`i-${id}`) + 150));
        // Barang itu masih atas dulang? Goyangkan supaya anak nampak ia masih ada.
        const still = itemsEl.querySelector(`.ah-item[data-id="${id}"]:not(.gone)`);
        if (still) { still.classList.remove('shake'); void still.offsetWidth; still.classList.add('shake'); }
        tap.el.classList.add('dim');
        if (wrong >= 2) hint();
        await ctx.wait(Math.max(800, say('cuba-lagi') + 100));
      }
      right.classList.add('ok');
      sfx.good();
      missEl.classList.remove('gone'); missEl.classList.add('back');
      await ctx.wait(Math.max(900, say(`i-${missing}`) + 400));
      return { ok: wrong === 0, n: L.n };
    }

    ctx.progress(TRIALS);
    await ctx.ready(); ctx.alive();
    const recs = [];
    for (let i = 0; i < TRIALS; i++) {
      recs.push(await trial(ctx.first && i === 0));
      ctx.mark(i);
      await ctx.wait(300);
    }
    delete stage.dataset.answer;
    const correct = recs.filter((r) => r.ok).length;
    if (correct >= UP_AT) state.level = Math.min(MAX_LEVEL, level + 1);
    else if (correct <= DOWN_AT) state.level = Math.max(1, level - 1);
    return {
      record: { level, correct, n: recs.length, items: L.n },
      foundHtml: shuffle(IDS).slice(0, 4).map(itemIcon).join(''),
      text: `Adik ingat <span class="big-num">${correct}</span> daripada ${recs.length} barang yang hilang!`,
    };
  },

  parent: {
    stats(s) {
      const last = s.rounds.slice(-7);
      const okP = pct(last.reduce((a, r) => a + (r.correct || 0), 0), last.reduce((a, r) => a + (r.n || 0), 0));
      const most = s.rounds.reduce((m, r) => (r.correct >= 4 ? Math.max(m, r.items || 0) : m), 0);
      return [
        { v: okP === null ? '–' : okP + '%', label: 'Betul kali pertama' },
        { v: most ? `${most}<small> barang</small>` : '–', label: 'Dulang paling penuh dikuasai' },
        { v: `${s.level}<small>/${MAX_LEVEL}</small>`, label: 'Tahap' },
      ];
    },
    cols: ['Tahap', 'Betul', 'Barang'],
    row: (r) => [r.level, meter(pct(r.correct, r.n)), r.items || '–'],
    explain: `<span><b>Ingatan kerja visual</b>: menyimpan gambaran beberapa benda dalam fikiran dan membandingkannya dengan apa yang dilihat sekarang. Budak 3–4 tahun biasanya boleh 3–4 barang; 5–6 tahun 5–6 barang.</span>
      <span>Tahap 1: 3 barang · Tahap 2: 4 barang · Tahap 3: 5 barang, 4 pilihan · Tahap 4: 6 barang dan barang yang tinggal bertukar tempat, jadi anak mesti ingat <i>apa</i>, bukan <i>di mana</i>. Naik bila 4/5 betul.</span>`,
  },

  mission: {
    title: 'Main "Apa Yang Hilang?" di dapur',
    steps: [
      'Letak 3–4 barang dapur atas dulang (sudu, cawan, epal, kunci). Biar anak tengok 10 saat.',
      'Tutup dengan tuala. Ambil satu barang secara senyap.',
      'Buka tuala: <b>"Apa yang hilang?"</b>',
      'Bertukar peranan: anak yang sorok, ibu bapa yang teka.',
    ],
    why: 'Kenapa? Permainan klasik ini melatih ingatan dan perhatian terhadap butiran, kemahiran yang diperlukan untuk mengingat arahan dan pelajaran di sekolah.',
  },
};
