// Timbang-Timbang: ukuran awal (berat). Dua barang di atas neraca pasar; anak teka mana lebih berat (atau ringan),
// kemudian neraca dilepaskan dan barang berat turun. Anak MERAMAL dahulu, kemudian MENGUJI (kaedah saintifik awal).
// Tahap 1: barang berat juga lebih besar (gerak hati betul) · Tahap 2: soalan "berat" dan "ringan" bercampur
// · Tahap 3–4: barang kecil tetapi berat lwn besar tetapi ringan (batu lwn bantal), mencabar andaian "besar = berat".
import { itemIcon } from '../../kit/pasar.js';
import { bendaIcon } from '../../kit/benda.js';
import { pick, shuffle, pct, meter } from '../../kit/util.js';

// w = berat relatif · s = saiz lukisan (0–1) · src = ikon
const ITEMS = {
  tembikai: { w: 5, s: 1, icon: () => itemIcon('tembikai'), name: 'Tembikai' },
  batu: { w: 4, s: .5, icon: () => bendaIcon('batu'), name: 'Batu' },
  nanas: { w: 3, s: .85, icon: () => itemIcon('nanas'), name: 'Nanas' },
  pisang: { w: 1.5, s: .7, icon: () => itemIcon('pisang'), name: 'Pisang' },
  bola: { w: .8, s: .8, icon: () => bendaIcon('bola'), name: 'Bola' },
  bantal: { w: .6, s: 1, icon: () => bendaIcon('bantal'), name: 'Bantal' },
  kunci: { w: .3, s: .45, icon: () => bendaIcon('kunci'), name: 'Kunci' },
  sudu: { w: .3, s: .5, icon: () => bendaIcon('sudu'), name: 'Sudu' },
  daun: { w: .05, s: .65, icon: () => bendaIcon('daun'), name: 'Daun' },
};
const IDS = Object.keys(ITEMS);
// Semua pasangan yang beratnya jelas berbeza (nisbah ≥ 2.5).
const PAIRS = IDS.flatMap((a, i) => IDS.slice(i + 1).map((b) => [a, b])).filter(([a, b]) => Math.max(ITEMS[a].w, ITEMS[b].w) / Math.min(ITEMS[a].w, ITEMS[b].w) >= 2.5);
const heavy = ([a, b]) => (ITEMS[a].w > ITEMS[b].w ? a : b);
const light = ([a, b]) => (ITEMS[a].w > ITEMS[b].w ? b : a);
const intuitive = (p) => ITEMS[heavy(p)].s > ITEMS[light(p)].s + .1;
const tricky = (p) => ITEMS[heavy(p)].s < ITEMS[light(p)].s - .1;

// pool = jenis pasangan · ringan = kebarangkalian soalan "ringan"
const LEVELS = [null,
  { pool: PAIRS.filter(intuitive), ringan: 0 },
  { pool: PAIRS.filter(intuitive), ringan: .5 },
  { pool: PAIRS.filter((p) => !intuitive(p)), mix: true, ringan: .4 },
  { pool: PAIRS.filter(tricky), ringan: .5 },
];
const MAX_LEVEL = 4;
const AGE_LEVEL = { 3: 1, 4: 2, 5: 2, 6: 3 };
const TRIALS = 6, UP_AT = 5, DOWN_AT = 3;
const IDLE_MS = 10000;
const TILT = 15;
const GAP = 150;

const PAN = `<svg viewBox="0 0 80 90" aria-hidden="true" preserveAspectRatio="none"><path d="M40 2 L10 74 M40 2 L70 74" stroke="#6B7684" stroke-width="1.6"/><circle cx="40" cy="3" r="3" fill="#6B7684"/>
  <path d="M4 74 H76 Q72 88 40 88 Q8 88 4 74 Z" fill="#C9D1D9" stroke="#6B7684" stroke-width="2.4" stroke-linejoin="round"/></svg>`;

export default {
  id: 'timbang',
  title: 'Timbang-Timbang',
  stageLabel: 'Neraca pasar dengan dua barang. Tekan barang yang anda rasa lebih berat atau lebih ringan; kemudian neraca menunjukkan jawapannya.',
  lines: {
    intro: 'Jom timbang! Barang yang berat akan turun ke bawah.',
    berat: 'Mana lebih berat?', ringan: 'Mana lebih ringan?',
    'lebih-berat': 'lebih berat!', 'lebih-ringan': 'lebih ringan!',
    ...Object.fromEntries(IDS.map((id) => [`i-${id}`, ITEMS[id].name + '.'])),
  },
  recorded: ['intro', 'berat', 'ringan', 'lebih-berat', 'lebih-ringan', ...IDS.map((id) => `i-${id}`)],

  css: `.tm-post { left: 47%; width: 6%; top: 40%; height: 48%; z-index: 1; border-radius: calc(var(--u) * 1.5) calc(var(--u) * 1.5) 0 0; background: #8A5A2E; box-shadow: inset calc(var(--u) * -.8) 0 0 rgba(0,0,0,.2); }
.tm-base { left: 30%; width: 40%; top: 86%; height: 4%; z-index: 1; border-radius: calc(var(--u) * 2); background: #6E4520; }
.tm-beam { left: 20%; width: 60%; top: 39%; height: 2.2%; z-index: 2; border-radius: 99px; background: #F5B82E; border: calc(var(--u) * .5) solid #B7860F; transition: transform 1s cubic-bezier(.4,1.6,.5,1); }
.tm-pivot { left: 47.5%; width: 5%; top: 38.2%; aspect-ratio: 1; z-index: 3; border-radius: 50%; background: #B7860F; }
.tm-pan { width: 40%; top: 40%; height: 30%; z-index: 2; transition: transform 1s cubic-bezier(.4,1.6,.5,1); }
.tm-pan.l { left: 0%; } .tm-pan.r { left: 60%; }
.tm-pan > svg { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
.tm-item { position: absolute; left: 50%; bottom: 14%; transform: translateX(-50%); aspect-ratio: 1; padding: 0; border-radius: calc(var(--u) * 3); background: transparent; transition: box-shadow .2s; }
.tm-item svg { width: 100%; height: 100%; display: block; }
.tm-item.pick { box-shadow: 0 0 0 calc(var(--u) * 1.2) var(--kuning); background: rgba(255,253,245,.5); }
.tm-item:disabled { cursor: default; }
.tm-lock { left: 45%; width: 10%; top: 50%; aspect-ratio: 1; z-index: 3; transition: opacity .3s; }
.tm-lock svg { width: 100%; height: 100%; display: block; }
.tm-lock.off { opacity: 0; }`,

  // Gerai pasar: kanopi berjalur.
  stageHtml: () => `<svg class="bg" viewBox="0 0 200 300" preserveAspectRatio="none" aria-hidden="true">
      <rect width="200" height="300" fill="#FCE9C8"/>
      <g>${Array.from({ length: 8 }, (_, i) => `<path d="M${i * 25} 0 h25 v34 q-12.5 10 -25 0 z" fill="${i % 2 ? '#FFFDF5' : '#E5484D'}"/>`).join('')}</g>
      <rect y="262" width="200" height="38" fill="#B07A44"/><rect y="258" width="200" height="6" fill="#8A5A2E"/>
    </svg>
    <div class="tm-post"></div><div class="tm-base"></div><div class="tm-beam"></div><div class="tm-pivot"></div>
    <div class="tm-pan l">${PAN}</div><div class="tm-pan r">${PAN}</div>
    <div class="tm-lock" aria-hidden="true"><svg viewBox="0 0 40 40"><rect x="8" y="18" width="24" height="18" rx="3" fill="#6B7684"/><path d="M13 18 V12 a7 7 0 0 1 14 0 V18" stroke="#6B7684" stroke-width="4" fill="none"/><circle cx="20" cy="26" r="3" fill="#FFFDF5"/></svg></div>`,

  initState: (age) => ({ age, level: AGE_LEVEL[age], rounds: [] }),
  normalize(s, age) {
    if (s.age !== age) { s.age = age; s.level = AGE_LEVEL[age]; }
    if (!Number.isInteger(s.level) || s.level < 1 || s.level > MAX_LEVEL) s.level = AGE_LEVEL[age];
    return s;
  },

  async round(ctx) {
    const { stage, state, say, sfx, anim } = ctx;
    const beam = stage.querySelector('.tm-beam'), panL = stage.querySelector('.tm-pan.l'), panR = stage.querySelector('.tm-pan.r'), lock = stage.querySelector('.tm-lock');
    const level = state.level, L = LEVELS[level];

    // Kedudukan neraca: -1 = kiri turun, 0 = rata, 1 = kanan turun.
    function tilt(dir) {
      beam.style.transform = `rotate(${dir * TILT}deg)`;
      const dy = Math.tan(TILT * Math.PI / 180) * 30 / .45; // hujung rasuk (30% lebar) dalam % tinggi pan (30% × 1.5 lebar)
      panL.style.transform = `translateY(${dir * -dy}%)`;
      panR.style.transform = `translateY(${dir * dy}%)`;
    }

    async function trial(pair, q, demo) {
      tilt(0); lock.classList.remove('off');
      const [a, b] = Math.random() < .5 ? pair : [pair[1], pair[0]];
      const put = (pan, id) => { pan.querySelectorAll('.tm-item').forEach((e) => e.remove()); pan.insertAdjacentHTML('beforeend', `<button class="tm-item" type="button" data-id="${id}" aria-label="${ITEMS[id].name}" style="width:${34 + ITEMS[id].s * 44}%" disabled>${ITEMS[id].icon()}</button>`); };
      put(panL, a); put(panR, b);
      const answer = q === 'berat' ? heavy(pair) : light(pair);
      stage.dataset.answer = answer; // untuk ujian automatik
      const items = [...stage.querySelectorAll('.tm-item')];
      const right = items.find((x) => x.dataset.id === answer);
      const hint = () => { const r = ctx.toPct(right.getBoundingClientRect()); ctx.hand.show(r.left + r.width * .4, r.top + r.height * .3); };
      sfx.pop();
      items.forEach((x) => anim(x, [{ transform: 'translateX(-50%) translateY(-30%)', opacity: 0 }, { transform: 'translateX(-50%) translateY(0)', opacity: 1 }], { duration: 350, fill: 'none' }));
      await ctx.wait(Math.max(1100, say(q) + 150));

      let tap = null;
      for (;;) {
        if (demo) hint();
        items.forEach((x) => { x.disabled = false; });
        tap = await ctx.tap({ selector: '.tm-item', ms: IDLE_MS });
        items.forEach((x) => { x.disabled = true; });
        ctx.hand.hide();
        if (tap) break;
        await ctx.wait(Math.max(1000, say(q) + 150));
      }
      tap.el.classList.add('pick');
      sfx.light();
      await ctx.wait(500);
      // Lepaskan neraca: yang berat turun.
      lock.classList.add('off');
      const h = heavy(pair);
      tilt(h === a ? -1 : 1);
      await ctx.wait(1100);
      const ok = tap.el === right;
      if (ok) sfx.good(); else sfx.soft();
      // "Batu... lebih berat!" (atau ringan, ikut soalan).
      const named = q === 'berat' ? h : light(pair);
      await ctx.wait(Math.max(400, say(`i-${named}`) - GAP));
      await ctx.wait(say(q === 'berat' ? 'lebih-berat' : 'lebih-ringan') + 450);
      tap.el.classList.remove('pick');
      return { ok, q, trick: tricky(pair) };
    }

    // Soalan: pasangan tidak berulang, pilih soalan ikut tahap.
    let pool = shuffle(L.pool);
    if (L.mix) pool = shuffle([...shuffle(PAIRS.filter(tricky)).slice(0, 3), ...shuffle(PAIRS.filter(intuitive)).slice(0, 3)]);
    const qs = pool.slice(0, TRIALS).map((p) => ({ p, q: Math.random() < L.ringan ? 'ringan' : 'berat' }));
    if (level === 1 || ctx.first) qs[0].q = 'berat';
    ctx.progress(TRIALS);
    await ctx.ready(); ctx.alive();
    if (ctx.first) await ctx.wait(Math.max(3600, say('intro') + 200));
    const recs = [];
    for (let i = 0; i < TRIALS; i++) {
      recs.push(await trial(qs[i].p, qs[i].q, ctx.first && i === 0 && level === 1));
      ctx.mark(i);
      await ctx.wait(300);
    }
    delete stage.dataset.answer;
    tilt(0);

    const correct = recs.filter((r) => r.ok).length;
    if (correct >= UP_AT) state.level = Math.min(MAX_LEVEL, level + 1);
    else if (correct <= DOWN_AT) state.level = Math.max(1, level - 1);
    const trick = recs.filter((r) => r.trick);
    return {
      record: { level, correct, n: recs.length, trick: trick.length, trickOk: trick.filter((r) => r.ok).length },
      foundHtml: ['batu', 'bantal', 'tembikai', 'daun'].map((id) => ITEMS[id].icon()).join(''),
      text: `Adik teka betul <span class="big-num">${correct}</span> daripada ${recs.length} timbangan!`,
    };
  },

  parent: {
    stats(s) {
      const last = s.rounds.slice(-7);
      const okP = pct(last.reduce((a, r) => a + (r.correct || 0), 0), last.reduce((a, r) => a + (r.n || 0), 0));
      const trP = pct(last.reduce((a, r) => a + (r.trickOk || 0), 0), last.reduce((a, r) => a + (r.trick || 0), 0));
      return [
        { v: okP === null ? '–' : okP + '%', label: 'Ramalan betul' },
        { v: trP === null ? '–' : trP + '%', label: 'Betul bila "besar tapi ringan"' },
        { v: `${s.level}<small>/${MAX_LEVEL}</small>`, label: 'Tahap' },
      ];
    },
    cols: ['Tahap', 'Betul', 'Soalan helah'],
    row: (r) => [r.level, meter(pct(r.correct, r.n)), r.trick ? `${r.trickOk || 0}/${r.trick}` : '–'],
    explain: `<span><b>Ukuran (berat) + ramalan</b> (Matematik & Sains Awal KSPK): membanding berat, menggunakan kata "lebih berat / lebih ringan", dan belajar bahawa saiz tidak semestinya menentukan berat. Anak meramal dahulu, kemudian neraca menguji ramalan itu.</span>
      <span>Tahap 1: barang berat juga lebih besar · Tahap 2: soalan "berat" dan "ringan" bercampur · Tahap 3: separuh soalan helah (kecil tapi berat) · Tahap 4: semua soalan helah, cth. batu kecil lwn bantal besar.</span>`,
  },

  mission: {
    title: 'Buat neraca penyangkut baju',
    steps: [
      'Gantung dua beg plastik pada hujung penyangkut baju, kemudian gantung penyangkut itu.',
      'Masukkan dua barang (cth. sebiji epal dan seikat kunci). Tanya dahulu: <b>"Mana lebih berat?"</b>',
      'Lepaskan dan tengok bersama: yang berat turun ke bawah.',
      'Cabar dengan barang besar tapi ringan (span, bantal kecil) lwn barang kecil tapi berat (batu).',
    ],
    why: 'Kenapa? Bila anak meramal kemudian menguji sendiri, dia belajar cara saintis berfikir, dan kata "berat / ringan" menjadi lebih bermakna.',
  },
};
