// Hari Terbalik: fleksibiliti kognitif (tukar peraturan) + kawalan diri. Sayf sebut satu perkataan ("Besar!").
// Matahari = tekan apa yang disebut. Bulan = tekan LAWANNYA. Anak mesti menahan jawapan automatik dan menukar peraturan.
// Tahap 1: satu tukaran (4 matahari, kemudian 4 bulan) · Tahap 2: tukar setiap 3 · Tahap 3: bertukar rawak
// · Tahap 4: rawak dengan had masa. Juga mengajar kosa kata berlawanan (besar–kecil, atas–bawah, penuh–kosong).
import { vehicleIcon } from '../../kit/vehicles.js';
import { pick, shuffle, pct, meter } from '../../kit/util.js';

const inner = (s) => s.replace(/<\/?svg[^>]*>/g, '');
const OPP = { besar: 'kecil', kecil: 'besar', atas: 'bawah', bawah: 'atas', penuh: 'kosong', kosong: 'penuh' };
const PAIRS = [['besar', 'kecil'], ['atas', 'bawah'], ['penuh', 'kosong']];
const ball = (cx, cy) => `<circle cx="${cx}" cy="${cy}" r="7" fill="#E5484D" stroke="#9E1F24" stroke-width="1.6"/><path d="M${cx - 7} ${cy} Q${cx} ${cy - 4} ${cx + 7} ${cy}" stroke="#FFFDF5" stroke-width="1.6" fill="none"/>`;
const shelf = `<rect x="8" y="6" width="44" height="50" rx="2" fill="#E2B57A" stroke="#8A5A1E" stroke-width="2"/><rect x="11" y="9" width="38" height="20" fill="#F7E2B8"/><rect x="11" y="33" width="38" height="20" fill="#F7E2B8"/><path d="M8 31 H52" stroke="#8A5A1E" stroke-width="2.4"/>`;
const glass = (full) => `<path d="M16 10 H44 L40 52 H20 Z" fill="#EAF7FC" stroke="#6FB3D2" stroke-width="2" stroke-linejoin="round"/>${full ? `<path d="M17.4 18 H42.6 L40 51 H20 Z" fill="#F5A623"/><path d="M20 22 H40" stroke="#FFD27A" stroke-width="2"/>` : ''}<path d="M21 14 V46" stroke="#fff" stroke-width="2" opacity=".7"/>`;
const CARD = {
  besar: `<g transform="translate(2 12) scale(.35)">${inner(vehicleIcon('lori'))}</g>`,
  kecil: `<g transform="translate(19 30) scale(.14)">${inner(vehicleIcon('lori'))}</g>`,
  atas: shelf + ball(30, 21),
  bawah: shelf + ball(30, 45),
  penuh: glass(true),
  kosong: glass(false),
};
const NAME = { besar: 'Lori besar', kecil: 'Lori kecil', atas: 'Bola di atas', bawah: 'Bola di bawah', penuh: 'Gelas penuh', kosong: 'Gelas kosong' };

// modes(n) = senarai 'b' (biasa) / 't' (terbalik) · limit = had masa jawapan (ms) selepas perkataan
const LEVELS = [null,
  { n: 8, modes: () => 'bbbbtttt'.split('') },
  { n: 10, modes: () => 'bbbtttbbbt'.split('') },
  { n: 10, modes: randomModes },
  { n: 10, modes: randomModes, limit: 3500 },
];
function randomModes() {
  for (;;) {
    const m = ['b']; for (let i = 1; i < 10; i++) m.push(Math.random() < .45 ? (m[i - 1] === 'b' ? 't' : 'b') : m[i - 1]);
    const sw = m.filter((x, i) => i && x !== m[i - 1]).length;
    if (sw >= 3 && sw <= 5 && m.includes('t')) return m;
  }
}
const MAX_LEVEL = 4;
const AGE_LEVEL = { 3: 1, 4: 1, 5: 2, 6: 3 };
const IDLE_MS = 9000;

export default {
  id: 'hari-terbalik',
  title: 'Hari Terbalik',
  stageLabel: 'Matahari atau bulan di langit. Matahari: tekan gambar yang Sayf sebut. Bulan: tekan gambar yang berlawanan.',
  lines: {
    intro: 'Jom main Hari Terbalik!',
    biasa: 'Matahari! Tekan apa yang Sayf sebut.',
    terbalik: 'Bulan! Sekarang tekan yang terbalik.',
    'w-besar': 'Besar!', 'w-kecil': 'Kecil!', 'w-atas': 'Atas!', 'w-bawah': 'Bawah!', 'w-penuh': 'Penuh!', 'w-kosong': 'Kosong!',
  },
  recorded: ['intro', 'biasa', 'terbalik', 'w-besar', 'w-kecil', 'w-atas', 'w-bawah', 'w-penuh', 'w-kosong'],

  css: `.ht-sky { inset: 0; z-index: 0; transition: background .6s; background: linear-gradient(#7FCBF2, #CDEBFA 60%, #9FD28A 60%); }
.stage[data-mode="t"] .ht-sky { background: linear-gradient(#24305E, #3E4A82 60%, #4E7A5A 60%); }
.ht-cue { left: 36%; width: 28%; top: 10%; aspect-ratio: 1; z-index: 1; transition: transform .5s; }
.ht-cue svg { width: 100%; height: 100%; display: block; }
.ht-cue .moon, .stage[data-mode="t"] .ht-cue .sun { display: none; }
.stage[data-mode="t"] .ht-cue .moon { display: inline; }
.ht-opts { left: 4%; right: 4%; top: 40%; height: 32%; z-index: 3; display: flex; justify-content: center; align-items: center; gap: 5%; }
.ht-opt { width: 44%; aspect-ratio: 1; padding: 4%; border-radius: calc(var(--u) * 5); background: #FFFDF5; box-shadow: 0 calc(var(--u) * 1.2) 0 rgba(0,0,0,.25); transition: opacity .3s, box-shadow .2s; }
.ht-opt svg { width: 100%; height: 100%; display: block; }
.ht-opt.ok { box-shadow: 0 0 0 calc(var(--u) * 1.4) var(--kuning), 0 calc(var(--u) * 1.2) 0 rgba(0,0,0,.25); }
.ht-opt.show { box-shadow: 0 0 0 calc(var(--u) * 1.4) #FFFDF5, 0 calc(var(--u) * 1.2) 0 rgba(0,0,0,.25); animation: ht-blink .5s 2; }
@keyframes ht-blink { 50% { opacity: .5; } }
.ht-opt.dim { opacity: .35; }
.ht-opt:disabled { cursor: default; }
.ht-timer { left: 20%; right: 20%; top: 77%; height: 1.6%; z-index: 2; border-radius: 99px; background: rgba(255,253,245,.3); overflow: hidden; }
.ht-timer i { display: block; height: 100%; width: 100%; background: var(--kuning); transform-origin: left; }
.ht-word { left: 0; right: 0; top: 82%; z-index: 2; text-align: center; font: 700 calc(var(--u) * 9)/1 Fredoka, sans-serif; color: #FFFDF5; text-shadow: 0 2px 0 rgba(0,0,0,.3); }`,

  stageHtml: () => `<div class="ht-sky"></div>
    <div class="ht-cue" aria-hidden="true"><svg viewBox="0 0 60 60">
      <g class="sun"><circle cx="30" cy="30" r="14" fill="#FFD84D" stroke="#E0A800" stroke-width="2"/>${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => { const t = a * Math.PI / 180; return `<path d="M${(30 + 19 * Math.cos(t)).toFixed(1)} ${(30 + 19 * Math.sin(t)).toFixed(1)} L${(30 + 27 * Math.cos(t)).toFixed(1)} ${(30 + 27 * Math.sin(t)).toFixed(1)}" stroke="#FFD84D" stroke-width="4" stroke-linecap="round"/>`; }).join('')}
        <circle cx="25" cy="28" r="1.8" fill="#8A5A1E"/><circle cx="35" cy="28" r="1.8" fill="#8A5A1E"/><path d="M24 34 Q30 39 36 34" stroke="#8A5A1E" stroke-width="2" fill="none" stroke-linecap="round"/></g>
      <g class="moon"><path d="M36 6 A24 24 0 1 0 54 42 A19 19 0 1 1 36 6 Z" fill="#F5E6A8" stroke="#C9B25A" stroke-width="2" stroke-linejoin="round"/><circle cx="26" cy="30" r="1.8" fill="#6B5A1E"/><path d="M22 37 Q27 40 31 37" stroke="#6B5A1E" stroke-width="2" fill="none" stroke-linecap="round"/>
        <g fill="#FFFDF5">${[[52, 12], [8, 18], [48, 54]].map(([x, y]) => `<path d="M${x} ${y - 3} l.9 2.1 2.1 .9 -2.1 .9 -.9 2.1 -.9 -2.1 -2.1 -.9 2.1 -.9z"/>`).join('')}</g></g>
    </svg></div>
    <div class="ht-opts"></div><div class="ht-timer" hidden><i></i></div><div class="ht-word" aria-hidden="true"></div>`,

  initState: (age) => ({ age, level: AGE_LEVEL[age], rounds: [] }),
  normalize(s, age) {
    if (s.age !== age) { s.age = age; s.level = AGE_LEVEL[age]; }
    if (!Number.isInteger(s.level) || s.level < 1 || s.level > MAX_LEVEL) s.level = AGE_LEVEL[age];
    return s;
  },

  async round(ctx) {
    const { stage, state, say, sfx, anim } = ctx;
    const optsEl = stage.querySelector('.ht-opts'), cueEl = stage.querySelector('.ht-cue'), timerEl = stage.querySelector('.ht-timer'), wordEl = stage.querySelector('.ht-word');
    const level = state.level, L = LEVELS[level];
    const modes = L.modes();
    timerEl.hidden = !L.limit;

    async function setMode(m, announce) {
      stage.dataset.mode = m;
      anim(cueEl, [{ transform: 'scale(.4) rotate(-40deg)' }, { transform: 'scale(1) rotate(0)' }], { duration: 500, fill: 'none' });
      if (announce) await ctx.wait(Math.max(1600, say(m === 'b' ? 'biasa' : 'terbalik') + 150));
    }

    async function trial(i, prevMode) {
      const m = modes[i], switched = i > 0 && m !== prevMode;
      if (i === 0 || switched) await setMode(m, true);
      const pair = shuffle(pick(PAIRS));
      const word = pick(pair);
      const answer = m === 'b' ? word : OPP[word];
      optsEl.innerHTML = pair.map((w) => `<button class="ht-opt" type="button" data-w="${w}" aria-label="${NAME[w]}" disabled><svg viewBox="0 0 60 60" aria-hidden="true">${CARD[w]}</svg></button>`).join('');
      stage.dataset.answer = answer; // untuk ujian automatik
      const cards = [...optsEl.querySelectorAll('.ht-opt')];
      const right = cards.find((c) => c.dataset.w === answer);
      sfx.pop();
      await ctx.wait(250);
      wordEl.textContent = word;
      const d = say(`w-${word}`);
      cards.forEach((c) => { c.disabled = false; });
      const t0 = performance.now();
      let timerAnim = null;
      if (L.limit) { timerAnim = timerEl.firstElementChild.animate([{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }], { duration: L.limit + d, fill: 'forwards' }); }
      const tap = await ctx.tap({ selector: '.ht-opt', ms: L.limit ? L.limit + d : IDLE_MS });
      timerAnim?.cancel();
      cards.forEach((c) => { c.disabled = true; });
      wordEl.textContent = '';
      const rt = Math.round(performance.now() - t0);
      const ok = !!tap && tap.el === right;
      if (ok) {
        right.classList.add('ok'); cards.forEach((c) => { if (c !== right) c.classList.add('dim'); });
        sfx.good();
        await ctx.wait(600);
      } else {
        sfx.soft();
        if (tap) anim(tap.el, [{ transform: 'translateX(0)' }, { transform: 'translateX(-5%)' }, { transform: 'translateX(5%)' }, { transform: 'translateX(0)' }], { duration: 320, fill: 'none' });
        right.classList.add('show');
        await ctx.wait(1100);
        // Tersilap dalam mod terbalik: ingatkan peraturan.
        if (m === 't') await ctx.wait(Math.max(1500, say('terbalik') + 100));
      }
      return { m, switched, ok, rt, timeout: !tap };
    }

    ctx.progress(L.n);
    await ctx.ready(); ctx.alive();
    if (ctx.first) await ctx.wait(Math.max(1600, say('intro') + 200));
    const recs = [];
    for (let i = 0; i < L.n; i++) {
      recs.push(await trial(i, i ? modes[i - 1] : null));
      ctx.mark(i);
      await ctx.wait(250);
    }
    delete stage.dataset.answer;
    stage.dataset.mode = 'b';

    const correct = recs.filter((r) => r.ok).length;
    const swErr = recs.filter((r) => r.switched && !r.ok).length, revErr = recs.filter((r) => r.m === 't' && !r.ok).length;
    if (correct >= L.n - 1) state.level = Math.min(MAX_LEVEL, level + 1);
    else if (correct <= Math.floor(L.n * .6)) state.level = Math.max(1, level - 1);
    return {
      record: { level, correct, n: recs.length, swErr, revErr, rev: recs.filter((r) => r.m === 't').length },
      foundHtml: '',
      text: `Adik betul <span class="big-num">${correct}</span> daripada ${recs.length}!` + (revErr === 0 ? ' Hari terbalik pun tak terkeliru!' : ''),
    };
  },

  parent: {
    stats(s) {
      const last = s.rounds.slice(-7);
      const okP = pct(last.reduce((a, r) => a + (r.correct || 0), 0), last.reduce((a, r) => a + (r.n || 0), 0));
      const revP = pct(last.reduce((a, r) => a + ((r.rev || 0) - (r.revErr || 0)), 0), last.reduce((a, r) => a + (r.rev || 0), 0));
      return [
        { v: okP === null ? '–' : okP + '%', label: 'Betul keseluruhan' },
        { v: revP === null ? '–' : revP + '%', label: 'Betul semasa "terbalik"' },
        { v: `${s.level}<small>/${MAX_LEVEL}</small>`, label: 'Tahap' },
      ];
    },
    cols: ['Tahap', 'Betul', 'Silap selepas tukar'],
    row: (r) => [r.level, meter(pct(r.correct, r.n)), r.swErr || 0],
    explain: `<span><b>Fleksibiliti kognitif + kawalan diri</b>: menukar peraturan ("sekarang terbalik!") dan menahan jawapan automatik. Kesilapan biasanya berlaku tepat selepas peraturan bertukar. Kebolehan ini berkembang pesat antara umur 4 dan 6 tahun dan meramalkan kesediaan sekolah.</span>
      <span>Tahap 1: satu tukaran (separuh matahari, separuh bulan) · Tahap 2: tukar setiap 3 soalan · Tahap 3: bertukar secara rawak · Tahap 4: rawak dengan had masa. Juga mengajar kata berlawanan: besar–kecil, atas–bawah, penuh–kosong.</span>`,
  },

  mission: {
    title: 'Main "Hari Terbalik" di rumah',
    steps: [
      'Umumkan: <b>"Sekarang Hari Terbalik!"</b> Bila ibu kata "duduk", adik berdiri. Bila ibu kata "senyap", adik bising.',
      'Mula dengan 2 arahan sahaja. Tambah lagi bila anak dah pandai.',
      'Tukar balik: <b>"Hari biasa!"</b> dan lihat sama ada anak dapat ikut semula.',
      'Ketawa bersama bila terkeliru. Tukar peranan supaya anak pula yang beri arahan.',
    ],
    why: 'Kenapa? Menukar peraturan dalam kepala melatih otak menjadi fleksibel, kemahiran penting bila rutin berubah di sekolah.',
  },
};
