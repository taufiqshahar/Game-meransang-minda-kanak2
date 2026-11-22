// Corak Kuih: mengenal dan menyambung corak berulang (AB, AAB, ABB, ABC), asas algebra awal dan ramalan.
// Satu baris kuih atas dulang dengan satu tempat kosong; anak pilih kuih yang sepatutnya. Tahap 4: tempat kosong di tengah.
import { KUIH, kuihIcon } from '../../kit/kuih.js';
import { pick, shuffle, pct, meter } from '../../kit/util.js';

const TRIALS = 5, CELLS = 6;
// units = jenis corak (indeks huruf: 0=A,1=B,2=C), opts = bilangan pilihan, mid = tempat kosong di tengah.
const LEVELS = [null,
  { units: ['AB'], opts: 2, mid: false },
  { units: ['AB', 'AAB', 'ABB'], opts: 3, mid: false },
  { units: ['ABC', 'AAB', 'ABB'], opts: 3, mid: false },
  { units: ['AB', 'ABC', 'AAB', 'ABB', 'AABB'], opts: 3, mid: true },
];
const MAX_LEVEL = 4;
const AGE_LEVEL = { 3: 1, 4: 2, 5: 2, 6: 3 };
const UP_AT = 4, DOWN_AT = 2;
const IDLE_MS = 10000;
const CELL_W = 13.5, CELL_GAP = 1.5, ROW_Y = 34; // ROW_Y = tengah baris (% tinggi), di tengah dulang
const ROW_X = (100 - (CELLS * CELL_W + (CELLS - 1) * CELL_GAP)) / 2;
const BLANK = `<svg viewBox="0 0 60 60" aria-hidden="true"><circle cx="30" cy="31" r="20" fill="#FFFDF5" fill-opacity=".55" stroke="#8A5A1E" stroke-width="2.5" stroke-dasharray="5 4"/><text x="30" y="40" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="26" fill="#8A5A1E">?</text></svg>`;

export default {
  id: 'corak-kuih',
  title: 'Corak Kuih',
  stageLabel: 'Dulang kuih dengan corak berulang dan satu tempat kosong. Pilih kuih yang menyambung corak.',
  lines: {
    intro: 'Jom sambung corak kuih! Apa yang datang seterusnya?',
    'apa-lagi': 'Kuih apa seterusnya?',
    cantik: 'Coraknya cantik!',
  },
  recorded: ['intro', 'apa-lagi', 'cantik'],

  css: `.ck-row { inset: 0; z-index: 3; pointer-events: none; }
.ck-cell { position: absolute; width: ${CELL_W}%; aspect-ratio: 1; }
.ck-cell svg { width: 100%; height: 100%; display: block; }
.ck-cell.blank svg { animation: wiggle 1.4s ease-in-out infinite; }
.ck-opts { left: 6%; right: 6%; top: 62%; height: 22%; z-index: 4; display: flex; justify-content: center; align-items: center; gap: 5%; }
.ck-opt { width: 27%; aspect-ratio: 1; padding: 4%; border-radius: 50%; background: #FFFDF5; box-shadow: 0 calc(var(--u) * 1.2) 0 rgba(0,0,0,.22), inset 0 0 0 calc(var(--u) * 1) #E9D7B4; }
.ck-opt svg { width: 100%; height: 100%; display: block; }
.ck-opt:disabled { cursor: default; }
.ck-opt.gone { visibility: hidden; }
@media (prefers-reduced-motion: reduce) { .ck-cell.blank svg { animation: none; } }`,

  stageHtml: () => `<svg class="bg" viewBox="0 0 200 300" preserveAspectRatio="none" aria-hidden="true">
      <rect width="200" height="300" fill="#C8553D"/>
      <g fill="#B2462F">${Array.from({ length: 8 }, (_, r) => Array.from({ length: 6 }, (_, c) => `<path d="M${c * 36 + (r % 2) * 18} ${r * 40 + 10} l9 9 -9 9 -9 -9 z"/>`).join('')).join('')}</g>
      <g fill="#E8B04B" opacity=".35">${Array.from({ length: 8 }, (_, r) => Array.from({ length: 6 }, (_, c) => `<circle cx="${c * 36 + (r % 2) * 18}" cy="${r * 40 + 19}" r="2"/>`).join('')).join('')}</g>
      <ellipse cx="100" cy="106" rx="100" ry="32" fill="#9A6512"/>
      <ellipse cx="100" cy="102" rx="98" ry="30" fill="#D9A441"/>
      <ellipse cx="100" cy="102" rx="88" ry="24" fill="#E8BF5E"/>
      <ellipse cx="100" cy="222" rx="86" ry="38" fill="#7E3626" opacity=".35"/>
    </svg>
    <div class="ck-row"></div>
    <div class="ck-opts"></div>`,

  initState: (age) => ({ age, level: AGE_LEVEL[age], rounds: [] }),
  normalize(s, age) {
    if (s.age !== age) { s.age = age; s.level = AGE_LEVEL[age]; }
    if (!Number.isInteger(s.level) || s.level < 1 || s.level > MAX_LEVEL) s.level = AGE_LEVEL[age];
    return s;
  },

  async round(ctx) {
    const { stage, state, say, sfx, anim } = ctx;
    const rowEl = stage.querySelector('.ck-row'), optsEl = stage.querySelector('.ck-opts');
    const level = state.level, L = LEVELS[level];
    const cellTop = ROW_Y - CELL_W * (2 / 3) / 2; // sel segi empat: tinggi = lebar × 2/3 dalam pentas 2:3

    // Tunjuk ritma corak: setiap kuih melompat ikut turutan, unit berulang diberi jeda.
    async function sing(cells, unitLen, upto) {
      for (let i = 0; i < upto; i++) {
        anim(cells[i], [{ transform: 'translateY(0)' }, { transform: 'translateY(-22%)' }, { transform: 'translateY(0)' }], { duration: 300, fill: 'none' });
        sfx.pop();
        await ctx.wait((i + 1) % unitLen === 0 ? 380 : 220);
      }
    }

    async function trial(unitStr, demo) {
      const unitLen = unitStr.length;
      const letters = [...new Set(unitStr)].length;
      const kinds = shuffle(KUIH.map((k) => k.id)).slice(0, Math.max(letters, L.opts));
      const seq = Array.from({ length: CELLS }, (_, i) => kinds[unitStr.charCodeAt(i % unitLen) - 65]);
      const blank = L.mid ? 2 + Math.floor(Math.random() * 3) : CELLS - 1;
      const answer = seq[blank];
      const options = shuffle(kinds.slice(0, L.opts));
      rowEl.innerHTML = seq.map((id, i) => `<div class="ck-cell${i === blank ? ' blank' : ''}" data-i="${i}" style="left:${ROW_X + i * (CELL_W + CELL_GAP)}%;top:${cellTop}%">${i === blank ? BLANK : kuihIcon(id)}</div>`).join('');
      optsEl.innerHTML = options.map((id) => `<button class="ck-opt" type="button" data-id="${id}" aria-label="${KUIH.find((k) => k.id === id).name}" disabled>${kuihIcon(id)}</button>`).join('');
      stage.dataset.answer = answer; // untuk ujian automatik
      const cells = [...rowEl.querySelectorAll('.ck-cell')], opts = [...optsEl.querySelectorAll('.ck-opt')];
      const arm = (on) => opts.forEach((b) => { b.disabled = !on || b.classList.contains('gone'); });
      const correctBtn = opts.find((b) => b.dataset.id === answer);
      const hint = () => { const r = ctx.toPct(correctBtn.getBoundingClientRect()); ctx.hand.show(r.left + r.width * .4, r.top + r.width * .25); };

      sfx.pop();
      await ctx.wait(300);
      await sing(cells, unitLen, L.mid ? CELLS : blank);
      await ctx.wait(Math.max(900, say('apa-lagi') + 100));

      let wrong = 0;
      for (;;) {
        if (demo && wrong === 0) hint();
        arm(true);
        const t = await ctx.tap({ selector: '.ck-opt', ms: IDLE_MS });
        arm(false); ctx.hand.hide();
        if (!t) { hint(); say('apa-lagi'); await ctx.wait(1500); continue; }
        if (t.el.dataset.id === answer) {
          const cell = cells[blank];
          cell.classList.remove('blank'); cell.innerHTML = kuihIcon(answer);
          t.el.classList.add('gone');
          sfx.good();
          await anim(cell, [{ transform: 'scale(.2)' }, { transform: 'scale(1.2)' }, { transform: 'scale(1)' }], { duration: 380, fill: 'none' });
          await ctx.wait(200);
          await sing(cells, unitLen, CELLS);
          break;
        }
        wrong++;
        sfx.soft();
        await anim(t.el, [{ transform: 'translateX(0)' }, { transform: 'translateX(-8%)' }, { transform: 'translateX(8%)' }, { transform: 'translateX(0)' }], { duration: 360, fill: 'none' });
        if (wrong === 1) await ctx.wait(Math.max(900, say('cuba-lagi') + 100));
        else { await sing(cells, unitLen, L.mid ? CELLS : blank); hint(); }
      }
      await ctx.wait(Math.max(800, say(wrong === 0 ? pick(['cantik', 'hebat', 'bagus', 'pandainya']) : 'cantik') + 150));
      return { unit: unitStr, correct: wrong === 0, wrong };
    }

    ctx.progress(TRIALS);
    await ctx.ready(); ctx.alive();
    if (ctx.first) await ctx.wait(Math.max(2600, say('intro') + 200));
    const recs = [];
    const units = shuffle(Array.from({ length: TRIALS }, (_, i) => L.units[i % L.units.length]));
    for (let i = 0; i < TRIALS; i++) {
      recs.push(await trial(units[i], ctx.first && i === 0 && level === 1));
      ctx.mark(i);
      await ctx.wait(300);
    }
    delete stage.dataset.answer;

    const correct = recs.filter((r) => r.correct).length;
    if (correct >= UP_AT) state.level = Math.min(MAX_LEVEL, level + 1);
    else if (correct <= DOWN_AT) state.level = Math.max(1, level - 1);
    const hardest = recs.filter((r) => r.correct).reduce((m, r) => Math.max(m, r.unit.length), 0);
    return {
      record: { level, correct, n: recs.length, hardest },
      foundHtml: shuffle(KUIH.map((k) => k.id)).slice(0, 3).map(kuihIcon).join(''),
      text: `Adik sambung <span class="big-num">${recs.length}</span> corak kuih! Betul pada kali pertama: <span class="big-num">${correct}</span>.`,
    };
  },

  parent: {
    stats(s) {
      const last = s.rounds.slice(-7);
      const okP = pct(last.reduce((a, r) => a + (r.correct || 0), 0), last.reduce((a, r) => a + (r.n || 0), 0));
      const best = s.rounds.reduce((m, r) => Math.max(m, r.level || 0), 0);
      return [
        { v: okP === null ? '–' : okP + '%', label: 'Betul kali pertama' },
        { v: `${s.level}<small>/${MAX_LEVEL}</small>`, label: 'Tahap' },
        { v: best ? ['', 'AB', 'AAB', 'ABC', 'Tengah'][best] : '–', label: 'Corak tersukar dicuba' },
      ];
    },
    cols: ['Tahap', 'Betul', 'Corak'],
    row: (r) => [r.level, meter(pct(r.correct, r.n)), r.hardest === 4 ? 'AABB' : r.hardest === 3 ? 'ABC/AAB' : r.hardest === 2 ? 'AB' : '–'],
    explain: `<span><b>Corak berulang</b>: melihat unit yang berulang (cth. lapis-onde, lapis-onde) dan meramal yang seterusnya. Kajian menunjukkan kemahiran corak pada umur 4–5 tahun meramal pencapaian matematik kemudian, kerana ia melatih mencari peraturan.</span>
      <span>Tahap 1: AB dengan 2 pilihan · Tahap 2: AB, AAB, ABB · Tahap 3: ABC · Tahap 4: tempat kosong di tengah (mesti lihat kedua-dua belah). Kuih melompat ikut ritma untuk menonjolkan unit. Naik bila 4/5 betul kali pertama.</span>`,
  },

  mission: {
    title: 'Buat corak di meja makan',
    steps: [
      'Susun sudu dan garpu berselang-seli: <b>sudu, garpu, sudu, garpu…</b> Tanya: "Lepas ni apa?"',
      'Tepuk corak: <b>tepuk, tepuk, hentak</b>. Minta anak sambung.',
      'Biar anak cipta corak sendiri dengan blok atau kuih, dan anda pula yang teka.',
      'Bila dah pandai, cuba corak tiga: merah, kuning, biru.',
    ],
    why: 'Kenapa? Mengenal corak ialah asas berfikir secara matematik: mencari peraturan dan meramal apa yang berlaku seterusnya.',
  },
};
