// Arahan Dua Langkah: kefahaman mendengar + ingatan kerja verbal. Hafiz beri arahan ("Letak bola merah dalam bakul");
// anak tekan barang, kemudian bekas. Arahan disebut SEKALI; butang telinga untuk dengar semula (dikira sebagai bantuan).
// Tahap 1: 2 barang, 1 bekas · Tahap 2: 3 barang, 2 bekas · Tahap 3: 4 barang termasuk bola merah & biru (perlu dengar warna),
// 3 bekas · Tahap 4: dua arahan sekali gus ("Letak itik dalam baldi, dan sudu dalam kotak").
import { bendaIcon } from '../../kit/benda.js';
import { pick, shuffle, pct, meter } from '../../kit/util.js';

const svg = (inner) => `<svg viewBox="0 0 60 60" aria-hidden="true">${inner}</svg>`;
const ball = (fill, dark) => svg(`<ellipse cx="30" cy="54" rx="16" ry="3" fill="#000" opacity=".15"/><circle cx="30" cy="30" r="20" fill="${fill}" stroke="${dark}" stroke-width="2.5"/><path d="M10 30 Q30 18 50 30 M10 30 Q30 42 50 30" stroke="#FFFDF5" stroke-width="2.4" fill="none" opacity=".8"/><ellipse cx="22" cy="20" rx="5" ry="3" fill="#fff" opacity=".5"/>`);
const OBJ = {
  bolamerah: { name: 'Bola merah', icon: () => ball('#E5484D', '#9E1F24') },
  bolabiru: { name: 'Bola biru', icon: () => ball('#2F7DE1', '#1A4F99') },
  itik: { name: 'Itik', icon: () => bendaIcon('itik') },
  sudu: { name: 'Sudu', icon: () => bendaIcon('sudu') },
};
const CON = {
  kotak: { name: 'Kotak', icon: () => svg(`<path d="M6 24 L30 16 L54 24 V48 L30 56 L6 48 Z" fill="#D9A766" stroke="#8A5A1E" stroke-width="2.4" stroke-linejoin="round"/><path d="M6 24 L30 32 L54 24 M30 32 V56" stroke="#8A5A1E" stroke-width="2.2" fill="none"/><path d="M6 24 L-2 14 L22 8 L30 16 M54 24 L62 14 L38 8 L30 16" fill="#E2B57A" stroke="#8A5A1E" stroke-width="2" stroke-linejoin="round"/>`) },
  bakul: { name: 'Bakul', icon: () => svg(`<path d="M14 26 Q30 -4 46 26" stroke="#8A5A1E" stroke-width="3.4" fill="none"/><path d="M6 26 H54 L48 54 H12 Z" fill="#C99456" stroke="#8A5A1E" stroke-width="2.4" stroke-linejoin="round"/><g stroke="#8A5A1E" stroke-width="1.6" opacity=".7"><path d="M8 34 H52 M10 42 H50 M11 50 H49"/><path d="M20 26 L19 54 M30 26 V54 M40 26 L41 54"/></g>`) },
  baldi: { name: 'Baldi', icon: () => svg(`<path d="M10 22 Q30 0 50 22" stroke="#6B7684" stroke-width="2.6" fill="none"/><path d="M8 22 H52 L46 56 H14 Z" fill="#22B26A" stroke="#13703F" stroke-width="2.4" stroke-linejoin="round"/><ellipse cx="30" cy="22" rx="22" ry="4" fill="#1C9A5B" stroke="#13703F" stroke-width="2"/><path d="M14 34 H46" stroke="#13703F" stroke-width="1.6" opacity=".6"/>`) },
};
const OBJ_IDS = Object.keys(OBJ), CON_IDS = Object.keys(CON);

// objs / cons = bilangan barang / bekas · steps = arahan dalam satu ayat
const LEVELS = [null,
  { objs: 2, cons: 1, steps: 1, trials: 4 },
  { objs: 3, cons: 2, steps: 1, trials: 4 },
  { objs: 4, cons: 3, steps: 1, trials: 4, colour: true },
  { objs: 4, cons: 3, steps: 2, trials: 3, colour: true },
];
const MAX_LEVEL = 4;
const AGE_LEVEL = { 3: 1, 4: 2, 5: 2, 6: 3 };
const IDLE_MS = 12000;
const GAP = 260; // potong jeda hujung "Letak..." / "dalam..." / "dan..."

export default {
  id: 'arahan',
  title: 'Arahan Dua Langkah',
  stageLabel: 'Bilik mainan: barang di atas rak dan bekas di lantai. Dengar arahan, tekan barang, kemudian tekan bekas.',
  lines: {
    intro: 'Dengar arahan Hafiz baik-baik, kemudian buat.',
    letak: 'Letak...', dalam: 'dalam...', dan: 'dan...',
    'o-bolamerah': 'bola merah', 'o-bolabiru': 'bola biru', 'o-itik': 'itik', 'o-sudu': 'sudu',
    'c-kotak': 'kotak.', 'c-bakul': 'bakul.', 'c-baldi': 'baldi.',
  },
  recorded: ['intro', 'letak', 'dalam', 'dan', 'o-bolamerah', 'o-bolabiru', 'o-itik', 'o-sudu', 'c-kotak', 'c-bakul', 'c-baldi'],

  css: `.ar-shelf { left: 4%; right: 4%; top: 12%; height: 24%; z-index: 2; display: flex; justify-content: center; align-items: flex-end; gap: 3%; padding-bottom: 2%; }
.ar-obj { width: 23%; aspect-ratio: 1; padding: 2%; border-radius: calc(var(--u) * 3); background: transparent; transition: transform .25s, opacity .3s; }
.ar-obj svg, .ar-con svg { width: 100%; height: 100%; display: block; }
.ar-obj.sel { transform: translateY(-12%) scale(1.08); background: rgba(255,253,245,.7); box-shadow: 0 0 0 calc(var(--u) * 1) var(--kuning); }
.ar-obj.gone { opacity: 0; pointer-events: none; }
.ar-floor { left: 4%; right: 4%; top: 58%; height: 26%; z-index: 2; display: flex; justify-content: center; align-items: flex-end; gap: 4%; }
.ar-con { position: relative; width: 28%; aspect-ratio: 1; padding: 1%; border-radius: calc(var(--u) * 3); background: transparent; }
.ar-con .in { position: absolute; left: 22%; top: -6%; width: 56%; display: flex; justify-content: center; }
.ar-con .in svg { width: 70%; height: auto; }
.ar-obj:disabled, .ar-con:disabled { cursor: default; }
.ar-ear { right: 5%; top: 44%; width: 14%; aspect-ratio: 1; z-index: 3; border-radius: 50%; padding: 2.5%; background: #FFFDF5; box-shadow: 0 calc(var(--u) * 1) 0 rgba(0,0,0,.2); }
.ar-ear svg { width: 100%; height: 100%; display: block; }
.ar-ear:disabled { opacity: .45; }`,

  // Bilik mainan: dinding, rak kayu, lantai.
  stageHtml: () => `<svg class="bg" viewBox="0 0 200 300" preserveAspectRatio="none" aria-hidden="true">
      <rect width="200" height="300" fill="#FBE3C6"/>
      <rect y="0" width="200" height="150" fill="#CDEBFA"/>
      <g fill="#FFFDF5" opacity=".6">${[[30, 140], [90, 128], [160, 142]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5"/>`).join('')}</g>
      <rect x="8" y="106" width="184" height="8" rx="2" fill="#B07A44"/><path d="M20 114 V124 M180 114 V124" stroke="#8A5A2E" stroke-width="4"/>
      <rect y="150" width="200" height="150" fill="#E8C69A"/>
      <g stroke="#D9B48A" stroke-width="2">${[176, 206, 236, 266].map((y) => `<path d="M0 ${y} H200"/>`).join('')}</g>
    </svg>
    <div class="ar-shelf"></div><div class="ar-floor"></div>
    <button class="ar-ear" type="button" aria-label="Dengar arahan lagi" disabled><svg viewBox="0 0 40 40"><path d="M8 16 H14 L22 9 V31 L14 24 H8 Z" fill="#15302A"/><path d="M27 14 Q31 20 27 26 M31 10 Q38 20 31 30" stroke="#15302A" stroke-width="3" fill="none" stroke-linecap="round"/></svg></button>`,

  initState: (age) => ({ age, level: AGE_LEVEL[age], rounds: [] }),
  normalize(s, age) {
    if (s.age !== age) { s.age = age; s.level = AGE_LEVEL[age]; }
    if (!Number.isInteger(s.level) || s.level < 1 || s.level > MAX_LEVEL) s.level = AGE_LEVEL[age];
    return s;
  },

  async round(ctx) {
    const { stage, state, say, sfx, anim } = ctx;
    const shelfEl = stage.querySelector('.ar-shelf'), floorEl = stage.querySelector('.ar-floor'), earEl = stage.querySelector('.ar-ear');
    const level = state.level, L = LEVELS[level];

    // Rantai klip: "Letak... bola merah... dalam... bakul." (+ "dan... itik... dalam... kotak.")
    async function speak(tasks) {
      for (let i = 0; i < tasks.length; i++) {
        const { o, c } = tasks[i];
        await ctx.wait(Math.max(250, say(i ? 'dan' : 'letak') - GAP));
        await ctx.wait(say(`o-${o}`) + 60);
        await ctx.wait(Math.max(250, say('dalam') - GAP));
        await ctx.wait(say(`c-${c}`) + (i < tasks.length - 1 ? 150 : 0));
      }
    }

    async function trial(demo) {
      let objs = shuffle(OBJ_IDS);
      if (L.colour) objs = ['bolamerah', 'bolabiru', ...objs.filter((x) => !x.startsWith('bola'))];
      objs = shuffle(objs.slice(0, L.objs));
      const cons = shuffle(CON_IDS).slice(0, L.cons);
      // Tugasan: barang berbeza; bekas boleh sama hanya jika satu bekas sahaja.
      const tObjs = shuffle(L.colour ? [pick(['bolamerah', 'bolabiru']), ...objs.filter((x) => !x.startsWith('bola'))] : objs).slice(0, L.steps);
      const tasks = tObjs.map((o, i) => ({ o, c: L.cons === 1 ? cons[0] : shuffle(cons)[i % cons.length] }));
      if (L.steps === 2 && tasks[0].c === tasks[1].c) tasks[1].c = cons.find((c) => c !== tasks[0].c);
      shelfEl.innerHTML = objs.map((o) => `<button class="ar-obj" type="button" data-o="${o}" aria-label="${OBJ[o].name}" disabled>${OBJ[o].icon()}</button>`).join('');
      floorEl.innerHTML = cons.map((c) => `<button class="ar-con" type="button" data-c="${c}" aria-label="${CON[c].name}" disabled>${CON[c].icon()}<span class="in"></span></button>`).join('');
      const objEls = [...shelfEl.querySelectorAll('.ar-obj')], conEls = [...floorEl.querySelectorAll('.ar-con')];
      const all = [...objEls, ...conEls, earEl];
      const arm = (on) => all.forEach((b) => { b.disabled = !on || b.classList.contains('gone'); });
      sfx.pop();
      await ctx.wait(400);
      await speak(tasks);

      const done = new Set();
      let sel = null, errors = 0, replays = 0, wrongRun = 0;
      const nextTask = () => tasks.find((t) => !done.has(t.o));
      const setAnswer = () => { const t = sel ? tasks.find((x) => x.o === sel.dataset.o) : null; stage.dataset.answer = t ? `c:${t.c}` : `o:${tasks.filter((x) => !done.has(x.o)).map((x) => x.o).join(',')}`; };
      const hint = () => {
        const t = sel ? tasks.find((x) => x.o === sel.dataset.o) || nextTask() : nextTask();
        const el = sel && tasks.some((x) => x.o === sel.dataset.o) ? conEls.find((c) => c.dataset.c === t.c) : objEls.find((b) => b.dataset.o === t.o);
        const r = ctx.toPct(el.getBoundingClientRect()); ctx.hand.show(r.left + r.width * .4, r.top + r.height * .3);
      };
      while (done.size < tasks.length) {
        setAnswer();
        if (demo && errors === 0 && done.size === 0) hint();
        arm(true);
        const tap = await ctx.tap({ selector: '.ar-obj, .ar-con, .ar-ear', ms: IDLE_MS });
        arm(false); ctx.hand.hide();
        if (!tap) { replays++; hint(); await speak(tasks.filter((t) => !done.has(t.o))); continue; }
        const el = tap.el;
        if (el === earEl) { replays++; await speak(tasks.filter((t) => !done.has(t.o))); continue; }
        if (el.classList.contains('ar-obj')) {
          objEls.forEach((b) => b.classList.remove('sel'));
          if (!tasks.some((t) => t.o === el.dataset.o && !done.has(t.o))) {
            // Barang yang tiada dalam arahan: goyang, kemudian ulang arahan.
            errors++; wrongRun++; sel = null;
            sfx.soft();
            await anim(el, [{ transform: 'translateX(0)' }, { transform: 'translateX(-8%)' }, { transform: 'translateX(8%)' }, { transform: 'translateX(0)' }], { duration: 340, fill: 'none' });
            if (wrongRun >= 2) hint();
            await speak(tasks.filter((t) => !done.has(t.o)));
            continue;
          }
          sel = el; el.classList.add('sel'); sfx.light();
          continue;
        }
        // Tekan bekas.
        if (!sel) { sfx.soft(); continue; } // pilih barang dahulu
        const task = tasks.find((t) => t.o === sel.dataset.o && !done.has(t.o));
        if (task && task.c === el.dataset.c) {
          done.add(task.o); wrongRun = 0;
          sel.classList.remove('sel'); sel.classList.add('gone');
          el.querySelector('.in').insertAdjacentHTML('beforeend', OBJ[task.o].icon());
          anim(el, [{ transform: 'scale(1)' }, { transform: 'scale(1.1)' }, { transform: 'scale(1)' }], { duration: 300, fill: 'none' });
          sfx.good();
          sel = null;
          await ctx.wait(500);
          continue;
        }
        // Salah barang atau salah bekas: barang kembali, arahan diulang.
        errors++; wrongRun++;
        sfx.soft();
        anim(sel, [{ transform: 'translateY(-12%) translateX(0)' }, { transform: 'translateY(-12%) translateX(-8%)' }, { transform: 'translateY(-12%) translateX(8%)' }, { transform: 'translateY(0)' }], { duration: 380, fill: 'none' });
        sel.classList.remove('sel'); sel = null;
        await ctx.wait(450);
        if (wrongRun >= 2) hint();
        await speak(tasks.filter((t) => !done.has(t.o)));
      }
      await ctx.wait(Math.max(700, say(pick(['bagus', 'hebat', 'pandainya'])) + 200));
      return { errors, replays };
    }

    ctx.progress(L.trials);
    await ctx.ready(); ctx.alive();
    if (ctx.first) await ctx.wait(Math.max(3400, say('intro') + 200));
    const recs = [];
    for (let i = 0; i < L.trials; i++) {
      recs.push(await trial(ctx.first && i === 0 && level === 1));
      ctx.mark(i);
      await ctx.wait(300);
    }
    delete stage.dataset.answer;

    const clean = recs.filter((r) => r.errors === 0 && r.replays === 0).length;
    if (clean >= L.trials - 1) state.level = Math.min(MAX_LEVEL, level + 1);
    else if (clean <= 1) state.level = Math.max(1, level - 1);
    return {
      record: { level, n: recs.length, clean, errors: recs.reduce((a, r) => a + r.errors, 0), replays: recs.reduce((a, r) => a + r.replays, 0) },
      foundHtml: [OBJ.bolamerah.icon(), CON.bakul.icon()].join(''),
      text: `Adik ikut <span class="big-num">${recs.length}</span> arahan!` + (clean ? ` <span class="big-num">${clean}</span> dengan sekali dengar.` : ''),
    };
  },

  parent: {
    stats(s) {
      const last = s.rounds.slice(-7);
      const okP = pct(last.reduce((a, r) => a + (r.clean || 0), 0), last.reduce((a, r) => a + (r.n || 0), 0));
      const rep = last.reduce((a, r) => a + (r.replays || 0), 0);
      return [
        { v: okP === null ? '–' : okP + '%', label: 'Betul sekali dengar' },
        { v: `${s.level}<small>/${MAX_LEVEL}</small>`, label: 'Tahap' },
        { v: String(rep), label: 'Dengar semula (7 sesi)' },
      ];
    },
    cols: ['Tahap', 'Sekali dengar', 'Silap'],
    row: (r) => [r.level, meter(pct(r.clean, r.n)), r.errors],
    explain: `<span><b>Kefahaman mendengar + ingatan kerja verbal</b> (Komunikasi KSPK): menyimpan arahan dalam kepala dan melaksanakannya mengikut urutan. Budak 3 tahun biasanya boleh ikut arahan 1 langkah; 4–5 tahun 2 langkah; 6 tahun arahan berganda.</span>
      <span>Tahap 1: 2 barang, 1 bekas · Tahap 2: 3 barang, 2 bekas · Tahap 3: bola merah dan biru (perlu dengar warna) · Tahap 4: dua arahan dalam satu ayat. Butang telinga memainkan arahan semula dan dikira sebagai bantuan.</span>`,
  },

  mission: {
    title: 'Main "Robot Ikut Arahan"',
    steps: [
      'Anak jadi robot. Beri arahan 2 langkah: <b>"Ambil sudu, kemudian letak dalam sinki."</b>',
      'Sebut sekali sahaja. Kalau terlupa, minta robot "tekan butang ulang" (tepuk tangan).',
      'Bila dah pandai, cuba 3 langkah: <b>"Ambil buku, letak atas meja, kemudian duduk."</b>',
      'Tukar peranan: anak beri arahan kepada ibu bapa.',
    ],
    why: 'Kenapa? Mengikut arahan berlapis ialah kemahiran harian di tadika (kemas, beratur, ambil buku). Latihan ini menguatkan pendengaran dan ingatan.',
  },
};
