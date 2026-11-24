// Bayang Siapa?: persepsi visual (bentuk, bukan warna). Satu bayang hitam di dinding; anak cari gambar yang sama bentuknya.
// Tahap rendah: pilihan dari kategori berbeza (bentuk sangat berlainan). Tahap tinggi: semua pilihan dari kategori yang sama
// (lori lwn bas lwn ambulans), dan di Tahap 4 bayang kadang-kadang terbalik kiri-kanan (perlu "putar" dalam kepala).
import { vehicleIcon, VEHICLES } from '../../kit/vehicles.js';
import { iconOf, ANIMALS } from '../../kit/art.js';
import { itemIcon, ITEMS } from '../../kit/pasar.js';
import { bendaIcon, NAMES as BENDA_NAMES } from '../../kit/benda.js';
import { pick, shuffle, pct, meter } from '../../kit/util.js';

// Setiap kategori: senarai id, ikon, kunci suara, nama.
const BENDA = ['jam', 'bulan', 'payung', 'topi', 'kopi', 'bantal', 'kapal', 'pintu', 'katak', 'kotak'];
const CATS = {
  kenderaan: { ids: VEHICLES.map((v) => v.id), icon: vehicleIcon, key: (id) => `v-${id}`, name: (id) => VEHICLES.find((v) => v.id === id).name },
  haiwan: { ids: ANIMALS.map((a) => a.id), icon: iconOf, key: (id) => `a-${id}`, name: (id) => ANIMALS.find((a) => a.id === id).name },
  makanan: { ids: ITEMS.map((i) => i.id), icon: itemIcon, key: (id) => `i-${id}`, name: (id) => ITEMS.find((i) => i.id === id).name },
  benda: { ids: BENDA, icon: bendaIcon, key: (id) => `w-${id}`, name: (id) => BENDA_NAMES[id] },
};
const CAT_NAME = { kenderaan: 'Kenderaan', haiwan: 'Haiwan', makanan: 'Makanan', benda: 'Barang' };
const CAT_IDS = Object.keys(CATS);

const TRIALS = 6;
// opts = bilangan pilihan · same = pengganggu dari kategori yang sama · flip = kebarangkalian bayang diterbalikkan
const LEVELS = [null,
  { opts: 2, same: false, flip: 0 },
  { opts: 3, same: false, flip: 0 },
  { opts: 3, same: true, flip: 0 },
  { opts: 4, same: true, flip: .5 },
];
const MAX_LEVEL = 4;
const AGE_LEVEL = { 3: 1, 4: 2, 5: 3, 6: 3 };
const UP_AT = 5, DOWN_AT = 3;
const IDLE_MS = 10000;

const ANIMAL_LINE = { kancil: 'Kancil!', harimau: 'Harimau!', orangutan: 'Orang utan!', gajah: 'Gajah!', tapir: 'Tapir!', enggang: 'Burung enggang!' };

export default {
  id: 'bayang-siapa',
  title: 'Bayang Siapa?',
  stageLabel: 'Satu bayang hitam di dinding. Tekan gambar yang sama bentuk dengan bayang.',
  lines: {
    intro: 'Tengok bayang ini. Cari gambar yang sama dengan bayang!',
    tanya: 'Bayang siapa ni?',
    ...Object.fromEntries(ANIMALS.map((a) => [`a-${a.id}`, ANIMAL_LINE[a.id]])),
    ...Object.fromEntries(ITEMS.map((i) => [`i-${i.id}`, i.name + '.'])),
    ...Object.fromEntries(BENDA.map((w) => [`w-${w}`, BENDA_NAMES[w] + '.'])),
  },
  recorded: ['intro', 'tanya', ...ANIMALS.map((a) => `a-${a.id}`), ...ITEMS.map((i) => `i-${i.id}`), ...BENDA.map((w) => `w-${w}`)],

  css: `.bs-wall { left: 14%; width: 72%; top: 11%; height: 41%; z-index: 2; display: grid; place-items: center; }
.bs-shadow { width: 86%; height: 86%; transition: filter .6s, opacity .6s; filter: brightness(0); opacity: .82; }
.bs-shadow svg, .bs-opt svg { width: 100%; height: 100%; display: block; }
.bs-shadow.flip svg { transform: scaleX(-1); }
.bs-shadow.lit { filter: none; opacity: 1; }
.bs-opts { left: 4%; right: 4%; top: 55%; bottom: 5%; z-index: 3; display: flex; flex-wrap: wrap; justify-content: center; align-content: center; gap: calc(var(--u) * 3); }
.bs-opt { width: 42%; aspect-ratio: 1; padding: 5%; border-radius: calc(var(--u) * 5); background: #FFFDF5; box-shadow: 0 calc(var(--u) * 1.2) 0 rgba(0,0,0,.2); transition: opacity .3s; }
.bs-opts[data-n="3"] .bs-opt { width: 30%; }
.bs-opts[data-n="4"] { left: 19%; right: 19%; }
.bs-opts[data-n="4"] .bs-opt { width: 44%; padding: 3.5%; }
.bs-opt.ok { box-shadow: 0 0 0 calc(var(--u) * 1.4) var(--kuning), 0 calc(var(--u) * 1.2) 0 rgba(0,0,0,.2); }
.bs-opt.dim { opacity: .3; }
.bs-opt:disabled { cursor: default; }`,

  // Dinding dengan lampu suluh: bayang jatuh dalam bulatan cahaya.
  stageHtml: () => `<svg class="bg" viewBox="0 0 200 300" preserveAspectRatio="none" aria-hidden="true">
      <rect width="200" height="300" fill="#3E3A5C"/>
      <rect y="0" width="200" height="164" fill="#4A4570"/>
      <ellipse cx="100" cy="94" rx="92" ry="70" fill="#F8E7B8"/>
      <ellipse cx="100" cy="94" rx="80" ry="60" fill="#FFF3CF"/>
      <rect y="164" width="200" height="136" fill="#2F2B47"/>
      <g fill="#F5B82E" opacity=".75">${[[18, 22], [182, 30], [12, 140], [188, 150]].map(([x, y]) => `<path d="M${x} ${y - 5} l1.6 3.4 3.4 1.6 -3.4 1.6 -1.6 3.4 -1.6 -3.4 -3.4 -1.6 3.4 -1.6z"/>`).join('')}</g>
    </svg>
    <div class="bs-wall"><div class="bs-shadow" role="img" aria-label="Bayang"></div></div>
    <div class="bs-opts"></div>`,

  initState: (age) => ({ age, level: AGE_LEVEL[age], rounds: [] }),
  normalize(s, age) {
    if (s.age !== age) { s.age = age; s.level = AGE_LEVEL[age]; }
    if (!Number.isInteger(s.level) || s.level < 1 || s.level > MAX_LEVEL) s.level = AGE_LEVEL[age];
    return s;
  },

  async round(ctx) {
    const { stage, state, say, sfx, anim } = ctx;
    const shadowEl = stage.querySelector('.bs-shadow'), optsEl = stage.querySelector('.bs-opts');
    const level = state.level, L = LEVELS[level];

    // Sasaran: kategori bergilir (tiada kategori sama berturut-turut), item tidak berulang dalam satu pusingan.
    const catOrder = [];
    while (catOrder.length < TRIALS) {
      const batch = shuffle(CAT_IDS);
      if (catOrder.length && batch[0] === catOrder[catOrder.length - 1]) batch.push(batch.shift());
      catOrder.push(...batch);
    }
    const used = new Set();
    const targets = catOrder.slice(0, TRIALS).map((cat) => {
      const id = pick(CATS[cat].ids.filter((x) => !used.has(x)));
      used.add(id);
      return { cat, id };
    });

    function distractors(t) {
      if (L.same) return shuffle(CATS[t.cat].ids.filter((x) => x !== t.id)).slice(0, L.opts - 1).map((id) => ({ cat: t.cat, id }));
      // Kategori lain, setiap pengganggu dari kategori berbeza supaya bentuknya jelas berlainan.
      return shuffle(CAT_IDS.filter((c) => c !== t.cat)).slice(0, L.opts - 1).map((cat) => ({ cat, id: pick(CATS[cat].ids) }));
    }

    async function trial(t, demo) {
      const C = CATS[t.cat];
      const opts = shuffle([t, ...distractors(t)]);
      const flip = Math.random() < L.flip;
      shadowEl.classList.remove('lit');
      shadowEl.classList.toggle('flip', flip);
      shadowEl.innerHTML = C.icon(t.id);
      optsEl.dataset.n = String(opts.length);
      optsEl.innerHTML = opts.map((o) => `<button class="bs-opt" type="button" data-cat="${o.cat}" data-id="${o.id}" aria-label="${CATS[o.cat].name(o.id)}" disabled>${CATS[o.cat].icon(o.id)}</button>`).join('');
      stage.dataset.answer = t.id; // untuk ujian automatik
      const cards = [...optsEl.querySelectorAll('.bs-opt')];
      const correctBtn = cards.find((c) => c.dataset.id === t.id && c.dataset.cat === t.cat);
      const arm = (on) => cards.forEach((c) => { c.disabled = !on; });
      const hint = () => { const r = ctx.toPct(correctBtn.getBoundingClientRect()); ctx.hand.show(r.left + r.width * .45, r.top + r.width * .35); };

      sfx.pop();
      await anim(shadowEl, [{ transform: 'scale(.5)', opacity: 0 }, { transform: 'scale(1)', opacity: .82 }], { duration: 380, fill: 'none' });
      await ctx.wait(Math.max(900, say('tanya') + 100));

      let wrong = 0;
      for (;;) {
        if (demo && wrong === 0) hint();
        arm(true);
        const tap = await ctx.tap({ selector: '.bs-opt', ms: IDLE_MS });
        arm(false); ctx.hand.hide();
        if (!tap) { hint(); await ctx.wait(Math.max(900, say('tanya') + 100)); continue; }
        const el = tap.el;
        if (el === correctBtn) {
          el.classList.add('ok'); cards.forEach((c) => { if (c !== el) c.classList.add('dim'); });
          sfx.good();
          // Bayang "bertukar warna" menjadi gambar sebenar.
          shadowEl.classList.remove('flip');
          shadowEl.classList.add('lit');
          anim(shadowEl, [{ transform: 'scale(1)' }, { transform: 'scale(1.08)' }, { transform: 'scale(1)' }], { duration: 500, fill: 'none' });
          await ctx.wait(Math.max(1100, say(C.key(t.id)) + 350));
          break;
        }
        wrong++;
        sfx.soft();
        anim(el, [{ transform: 'translateX(0)' }, { transform: 'translateX(-6%)' }, { transform: 'translateX(6%)' }, { transform: 'translateX(0)' }], { duration: 340, fill: 'none' });
        // Namakan pilihan anak (tetap belajar kosa kata), kemudian galakkan cuba lagi.
        await ctx.wait(Math.max(800, say(CATS[el.dataset.cat].key(el.dataset.id)) + 250));
        el.classList.add('dim');
        if (wrong >= 2) hint();
        await ctx.wait(Math.max(800, say('cuba-lagi') + 100));
      }
      return { cat: t.cat, id: t.id, flip, correct: wrong === 0 };
    }

    ctx.progress(TRIALS);
    await ctx.ready(); ctx.alive();
    if (ctx.first) await ctx.wait(Math.max(2800, say('intro') + 200));
    const recs = [];
    for (let i = 0; i < TRIALS; i++) {
      recs.push(await trial(targets[i], ctx.first && i === 0 && level === 1));
      ctx.mark(i);
      await ctx.wait(350);
    }
    delete stage.dataset.answer;

    const correct = recs.filter((r) => r.correct).length;
    if (correct >= UP_AT) state.level = Math.min(MAX_LEVEL, level + 1);
    else if (correct <= DOWN_AT) state.level = Math.max(1, level - 1);
    return {
      record: { level, correct, n: recs.length, miss: recs.filter((r) => !r.correct).map((r) => r.cat), flips: recs.filter((r) => r.flip).length },
      foundHtml: recs.slice(0, 4).map((r) => CATS[r.cat].icon(r.id)).join(''),
      text: `Adik teka <span class="big-num">${correct}</span> daripada ${recs.length} bayang pada kali pertama!`,
    };
  },

  parent: {
    stats(s) {
      const last = s.rounds.slice(-7);
      const okP = pct(last.reduce((a, r) => a + (r.correct || 0), 0), last.reduce((a, r) => a + (r.n || 0), 0));
      const misses = {};
      last.forEach((r) => (r.miss || []).forEach((c) => { misses[c] = (misses[c] || 0) + 1; }));
      const hardest = Object.entries(misses).sort((a, b) => b[1] - a[1])[0];
      return [
        { v: okP === null ? '–' : okP + '%', label: 'Betul kali pertama' },
        { v: `${s.level}<small>/${MAX_LEVEL}</small>`, label: 'Tahap' },
        { v: hardest && CAT_NAME[hardest[0]] ? CAT_NAME[hardest[0]] : '–', label: 'Kategori paling mencabar' },
      ];
    },
    cols: ['Tahap', 'Betul', 'Tersilap'],
    row: (r) => [r.level, meter(pct(r.correct, r.n)), (r.miss || []).filter((c) => CAT_NAME[c]).map((c) => CAT_NAME[c]).join(', ') || '–'],
    explain: `<span><b>Persepsi visual (bentuk)</b>: mengenal objek hanya dari garis luarnya, tanpa warna atau butiran. Kemahiran ini asas untuk mengenal huruf dan nombor (yang juga hanya bentuk), membaca peta dan melukis.</span>
      <span>Tahap 1–2: pilihan dari kategori berbeza (bentuk sangat berlainan) · Tahap 3: semua pilihan dari kategori sama, jadi anak mesti teliti butiran kecil (tangga bomba, roda kereta api) · Tahap 4: 4 pilihan dan bayang kadang-kadang terbalik kiri-kanan. Naik bila 5/6 betul kali pertama.</span>`,
  },

  mission: {
    title: 'Main "Wayang Tangan"',
    steps: [
      'Malam ini, padamkan lampu dan suluh lampu telefon ke dinding.',
      'Letak satu barang (cawan, sudu, mainan) di depan lampu. Tanya: <b>"Bayang apa ni?"</b>',
      'Buat bayang tangan (arnab, burung) dan biar anak teka. Kemudian giliran anak pula.',
      'Pusing barang perlahan-lahan: <b>"Eh, bayangnya berubah! Kenapa?"</b>',
    ],
    why: 'Kenapa? Mengenal benda dari bentuk sahaja melatih mata memerhati garis luar, kemahiran yang sama diperlukan untuk membezakan huruf seperti b dan d.',
  },
};
