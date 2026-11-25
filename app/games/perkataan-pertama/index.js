// Perkataan Pertama: pra-membaca (kenal perkataan BM). Gambar + perkataan; anak pilih perkataan yang betul.
// Tahap 1: padankan bentuk perkataan yang SAMA (tidak perlu tahu membaca, hanya memerhati huruf) · Tahap 2: tiada contoh,
// pilihan bermula dengan huruf berbeza (cukup kenal huruf pertama) · Tahap 3: semua pilihan bermula dengan huruf sama
// (perlu baca huruf seterusnya) · Tahap 4: tiada gambar, dengar sahaja kemudian baca.
// Bila betul, perkataan dibesarkan dan suku kata menyala satu demi satu semasa Sayf menyebutnya (ba-tu).
import { bendaIcon } from '../../kit/benda.js';
import { itemIcon } from '../../kit/pasar.js';
import { pick, shuffle, pct, meter } from '../../kit/util.js';

// perkataan → suku kata. Semua ada gambar dalam kit dan rakaman suara (kebanyakannya disalin dari Rima Lucu / Pasar Malam).
const WORDS = {
  ayam: ['a', 'yam'], batu: ['ba', 'tu'], bola: ['bo', 'la'], bulan: ['bu', 'lan'], bantal: ['ban', 'tal'], daun: ['da', 'un'],
  ikan: ['i', 'kan'], jagung: ['ja', 'gung'], jam: ['jam'], kapal: ['ka', 'pal'], katak: ['ka', 'tak'], kopi: ['ko', 'pi'],
  kotak: ['ko', 'tak'], kunci: ['kun', 'ci'], nanas: ['na', 'nas'], payung: ['pa', 'yung'], pintu: ['pin', 'tu'], pisang: ['pi', 'sang'],
  roti: ['ro', 'ti'], sudu: ['su', 'du'], telur: ['te', 'lur'], topi: ['to', 'pi'],
};
const IDS = Object.keys(WORDS);
const FROM_PASAR = new Set(['ayam', 'ikan', 'jagung', 'nanas', 'pisang', 'roti', 'telur']);
const pic = (w) => (FROM_PASAR.has(w) ? itemIcon(w) : bendaIcon(w));
// Perkataan yang ada sekurang-kurangnya 2 rakan dengan huruf pertama sama (untuk Tahap 3–4).
const byFirst = (w) => IDS.filter((x) => x !== w && x[0] === w[0]);
const RICH = IDS.filter((w) => byFirst(w).length >= 2);

// opts = bilangan pilihan · model = tunjuk perkataan contoh · same = pilihan huruf pertama sama · picture = tunjuk gambar
const LEVELS = [null,
  { opts: 2, model: true, same: false, picture: true },
  { opts: 3, model: false, same: false, picture: true },
  { opts: 3, model: false, same: true, picture: true },
  { opts: 4, model: false, same: true, picture: false },
];
const MAX_LEVEL = 4;
const AGE_LEVEL = { 3: 1, 4: 1, 5: 2, 6: 3 };
const TRIALS = 6, UP_AT = 5, DOWN_AT = 3;
const IDLE_MS = 10000;
const GAP = 220; // potong jeda hujung "Cari perkataan..." supaya perkataan menyusul rapat

export default {
  id: 'perkataan-pertama',
  title: 'Perkataan Pertama',
  stageLabel: 'Gambar di atas dan beberapa perkataan di bawah. Tekan perkataan yang sepadan dengan gambar.',
  lines: {
    intro: 'Jom baca! Tengok gambar, kemudian cari perkataannya.',
    sama: 'Cari perkataan yang sama.',
    cari: 'Cari perkataan...',
    itu: 'Itu...',
    ...Object.fromEntries(IDS.map((w) => [`w-${w}`, w[0].toUpperCase() + w.slice(1) + '.'])),
  },
  recorded: ['intro', 'sama', 'cari', 'itu', ...IDS.map((w) => `w-${w}`)],

  css: `.pp-pic { left: 28%; width: 44%; top: 10%; aspect-ratio: 1; z-index: 2; border-radius: calc(var(--u) * 5); background: #FFFDF5; box-shadow: 0 calc(var(--u) * 1.2) 0 rgba(0,0,0,.18); display: grid; place-items: center; transition: opacity .3s; }
.pp-pic svg { width: 84%; height: 84%; display: block; }
.pp-pic.hide { opacity: 0; }
.pp-pic.ask::after { content: '?'; position: absolute; font: 700 calc(var(--u) * 22)/1 Fredoka, sans-serif; color: #C9A46E; }
.pp-model { left: 20%; right: 20%; top: 40%; z-index: 2; text-align: center; font: 700 calc(var(--u) * 10)/1.2 Fredoka, sans-serif; color: #15302A; letter-spacing: .04em; }
.pp-model span { padding: 0 .06em; border-radius: calc(var(--u) * 1.5); transition: background .2s, color .2s; }
.pp-model span.on { background: var(--kuning); }
.pp-opts { left: 14%; right: 14%; top: 51%; bottom: 5%; z-index: 3; display: flex; flex-direction: column; justify-content: center; gap: calc(var(--u) * 2.6); }
.pp-opt { min-height: 0; padding: calc(var(--u) * 2.2) 0; border-radius: calc(var(--u) * 4); background: #FFFDF5; box-shadow: 0 calc(var(--u) * 1.2) 0 rgba(0,0,0,.18); font: 700 calc(var(--u) * 9)/1.1 Fredoka, sans-serif; color: #15302A; letter-spacing: .04em; transition: opacity .3s, transform .2s; }
.pp-opts[data-n="4"] .pp-opt { padding: calc(var(--u) * 1.6) 0; font-size: calc(var(--u) * 8); }
.pp-opt.ok { background: var(--kuning); }
.pp-opt.dim { opacity: .3; }
.pp-opt:disabled { cursor: default; }`,

  // Papan kapur kelas tadika.
  stageHtml: () => `<svg class="bg" viewBox="0 0 200 300" preserveAspectRatio="none" aria-hidden="true">
      <rect width="200" height="300" fill="#F7E7C6"/>
      <rect x="0" y="0" width="200" height="146" fill="#2F6B4F"/>
      <rect x="0" y="140" width="200" height="8" fill="#B07A44"/>
      <g fill="#FFFDF5" opacity=".18" font-family="Fredoka, sans-serif" font-weight="700" font-size="18"><text x="12" y="34">a</text><text x="170" y="40">b</text><text x="20" y="124">c</text><text x="168" y="118">d</text></g>
      <g fill="#E9D3A6">${[[30, 200], [170, 230], [40, 280], [150, 290]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3"/>`).join('')}</g>
    </svg>
    <div class="pp-pic"></div><div class="pp-model" aria-live="polite"></div><div class="pp-opts"></div>`,

  initState: (age) => ({ age, level: AGE_LEVEL[age], rounds: [] }),
  normalize(s, age) {
    if (s.age !== age) { s.age = age; s.level = AGE_LEVEL[age]; }
    if (!Number.isInteger(s.level) || s.level < 1 || s.level > MAX_LEVEL) s.level = AGE_LEVEL[age];
    return s;
  },

  async round(ctx) {
    const { stage, state, say, sfx, anim } = ctx;
    const picEl = stage.querySelector('.pp-pic'), modelEl = stage.querySelector('.pp-model'), optsEl = stage.querySelector('.pp-opts');
    const level = state.level, L = LEVELS[level];
    // Sebut "Cari perkataan..." + perkataan (rantai dua rakaman).
    const sayChain = async (first, w) => { await ctx.wait(Math.max(300, say(first) - GAP)); return say(`w-${w}`); };
    const syl = (w) => WORDS[w].map((s) => `<span>${s}</span>`).join('');

    function distractors(w) {
      const n = L.opts - 1;
      if (L.same) {
        const same = shuffle(byFirst(w));
        const fill = shuffle(IDS.filter((x) => x !== w && !same.includes(x)));
        return [...same, ...fill].slice(0, n);
      }
      // Huruf pertama berbeza antara SEMUA pilihan; Tahap 1 juga panjang berbeza.
      const out = [];
      for (const x of shuffle(IDS)) {
        if (out.length >= n) break;
        if (x === w || [w, ...out].some((y) => y[0] === x[0])) continue;
        if (L.model && Math.abs(x.length - w.length) < 2) continue;
        out.push(x);
      }
      for (const x of shuffle(IDS)) if (out.length < n && x !== w && !out.includes(x) && ![w, ...out].some((y) => y[0] === x[0])) out.push(x);
      return out;
    }

    async function trial(w, demo) {
      const opts = shuffle([w, ...distractors(w)]);
      picEl.classList.toggle('hide', false);
      picEl.classList.toggle('ask', !L.picture);
      picEl.innerHTML = L.picture ? pic(w) : '';
      picEl.setAttribute('aria-label', L.picture ? w : 'Gambar tersembunyi');
      modelEl.innerHTML = L.model ? syl(w) : '';
      optsEl.dataset.n = String(opts.length);
      optsEl.innerHTML = opts.map((x) => `<button class="pp-opt" type="button" data-w="${x}" disabled>${x}</button>`).join('');
      stage.dataset.answer = w; // untuk ujian automatik
      const cards = [...optsEl.querySelectorAll('.pp-opt')];
      const right = cards.find((c) => c.dataset.w === w);
      const arm = (on) => cards.forEach((c) => { c.disabled = !on || c.classList.contains('dim'); });
      const hint = () => { const r = ctx.toPct(right.getBoundingClientRect()); ctx.hand.show(r.left + r.width * .5, r.top + 1); };
      const ask = async () => { const d = L.model ? say('sama') : await sayChain('cari', w); await ctx.wait(d + 150); };

      sfx.pop();
      anim(picEl, [{ transform: 'scale(.6)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { duration: 320, fill: 'none' });
      if (L.model) await ctx.wait(Math.max(700, say(`w-${w}`) + 250));
      await ask();

      let wrong = 0;
      for (;;) {
        if (demo && wrong === 0) hint();
        arm(true);
        const tap = await ctx.tap({ selector: '.pp-opt', ms: IDLE_MS });
        arm(false); ctx.hand.hide();
        if (!tap) { hint(); await ask(); continue; }
        if (tap.el === right) break;
        wrong++;
        sfx.soft();
        anim(tap.el, [{ transform: 'translateX(0)' }, { transform: 'translateX(-4%)' }, { transform: 'translateX(4%)' }, { transform: 'translateX(0)' }], { duration: 320, fill: 'none' });
        // Namakan perkataan yang dipilih ("Itu... bola"), kemudian tanya semula.
        await ctx.wait((await sayChain('itu', tap.el.dataset.w)) + 250);
        tap.el.classList.add('dim');
        if (wrong >= 2) hint();
        await ask();
      }
      // Betul: perkataan dibesarkan, suku kata menyala semasa Sayf menyebutnya.
      right.classList.add('ok');
      cards.forEach((c) => { if (c !== right) c.classList.add('dim'); });
      sfx.good();
      if (!L.picture) { picEl.classList.remove('ask'); picEl.innerHTML = pic(w); anim(picEl, [{ transform: 'scale(.6)' }, { transform: 'scale(1)' }], { duration: 300, fill: 'none' }); }
      modelEl.innerHTML = syl(w);
      const spans = [...modelEl.querySelectorAll('span')];
      const d = say(`w-${w}`);
      const per = Math.max(260, (d - 150) / spans.length);
      for (const s of spans) { s.classList.add('on'); await ctx.wait(per); s.classList.remove('on'); }
      await ctx.wait(450);
      return { w, wrong };
    }

    const pool = L.same ? RICH : IDS;
    const words = shuffle(pool).slice(0, TRIALS);
    ctx.progress(TRIALS);
    await ctx.ready(); ctx.alive();
    if (ctx.first) await ctx.wait(Math.max(3000, say('intro') + 200));
    const recs = [];
    for (let i = 0; i < TRIALS; i++) {
      recs.push(await trial(words[i], ctx.first && i === 0 && level === 1));
      ctx.mark(i);
      await ctx.wait(250);
    }
    delete stage.dataset.answer;

    const correct = recs.filter((r) => r.wrong === 0).length;
    if (correct >= UP_AT) state.level = Math.min(MAX_LEVEL, level + 1);
    else if (correct <= DOWN_AT) state.level = Math.max(1, level - 1);
    return {
      record: { level, correct, n: recs.length, miss: recs.filter((r) => r.wrong).map((r) => r.w) },
      foundHtml: recs.slice(0, 4).map((r) => pic(r.w)).join(''),
      text: `Adik baca <span class="big-num">${recs.length}</span> perkataan!` + (correct ? ` <span class="big-num">${correct}</span> betul kali pertama.` : ''),
    };
  },

  parent: {
    stats(s) {
      const last = s.rounds.slice(-7);
      const okP = pct(last.reduce((a, r) => a + (r.correct || 0), 0), last.reduce((a, r) => a + (r.n || 0), 0));
      const misses = {};
      last.forEach((r) => (r.miss || []).forEach((w) => { misses[w] = (misses[w] || 0) + 1; }));
      const hard = Object.entries(misses).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([w]) => w);
      return [
        { v: okP === null ? '–' : okP + '%', label: 'Betul kali pertama' },
        { v: `${s.level}<small>/${MAX_LEVEL}</small>`, label: 'Tahap' },
        { v: hard.length ? hard.join(', ') : '–', label: 'Perkataan untuk diulang' },
      ];
    },
    cols: ['Tahap', 'Betul', 'Perlu ulang'],
    row: (r) => [r.level, meter(pct(r.correct, r.n)), (r.miss || []).join(', ') || '–'],
    explain: `<span><b>Pra-membaca</b> (Komunikasi KSPK): menyedari bahawa perkataan bertulis mewakili benda, dan setiap perkataan ada bentuk tersendiri. Perkataan dipilih dari suku kata terbuka BM (ba-tu, to-pi) yang mudah dibatang.</span>
      <span>Tahap 1: padankan perkataan yang sama dengan contoh (memerhati bentuk huruf) · Tahap 2: pilihan bermula dengan huruf berbeza (cukup kenal huruf pertama) · Tahap 3: semua pilihan bermula dengan huruf sama (kopi, kotak, kunci), jadi anak mesti baca lebih daripada huruf pertama · Tahap 4: tiada gambar, dengar dan baca sahaja. Suku kata menyala semasa disebut untuk mengajar membatang.</span>`,
  },

  mission: {
    title: 'Label rumah dengan perkataan',
    steps: [
      'Tulis 3 perkataan besar pada kertas: <b>pintu</b>, <b>jam</b>, <b>meja</b>. Tampal pada benda itu.',
      'Setiap kali lalu, tunjuk dan baca bersama sambil tepuk suku kata: <b>"pin-tu"</b>.',
      'Selepas beberapa hari, cabut satu label dan minta anak tampal semula di tempat yang betul.',
      'Tambah perkataan baharu bila anak sudah kenal semua.',
    ],
    why: 'Kenapa? Melihat perkataan yang sama setiap hari pada benda sebenar membantu anak faham bahawa tulisan ada makna, langkah pertama sebelum membaca.',
  },
};
