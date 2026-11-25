// Ikut Bunyi: ingatan kerja urutan (audio + visual), gaya "Simon". Empat gendang berwarna, setiap satu bernada.
// Hafiz main urutan; anak ulang. Betul → urutan bertambah satu; silap → urutan baharu yang lebih pendek. Panjang urutan
// diingat merentas sesi (sama seperti Sorok-Sorok).
import { pct, meter } from '../../kit/util.js';

const PADS = [
  { c: '#E5484D', d: '#9E1F24', f: 261.63, n: 'merah' },
  { c: '#F5C531', d: '#9A7208', f: 329.63, n: 'kuning' },
  { c: '#2F7DE1', d: '#1A4F99', f: 392.0, n: 'biru' },
  { c: '#22B26A', d: '#13703F', f: 523.25, n: 'hijau' },
];
const TRIALS = 6;
const SPAN_MIN = 2, SPAN_MAX = 7;
const AGE_SPAN = { 3: 2, 4: 2, 5: 3, 6: 3 };
const IDLE_MS = 9000;
const rndPad = () => Math.floor(Math.random() * PADS.length);

function play(mix, f, ms) {
  if (!mix) return;
  const { ac, out } = mix, t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain();
  o.type = 'triangle'; o.frequency.setValueAtTime(f, t);
  g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.28, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + ms / 1000);
  o.connect(g); g.connect(out); o.start(t); o.stop(t + ms / 1000 + .05);
}

export default {
  id: 'ikut-bunyi',
  title: 'Ikut Bunyi',
  stageLabel: 'Empat gendang berwarna. Gendang menyala dan berbunyi mengikut urutan; tekan semula ikut urutan yang sama.',
  lines: {
    intro: 'Dengar dan tengok gendang menyala. Kemudian tekan ikut urutan!',
    giliran: 'Giliran adik!', lagi: 'Tambah satu lagi!',
  },
  recorded: ['intro', 'giliran', 'lagi'],

  css: `.ib-pads { left: 8%; right: 8%; top: 22%; aspect-ratio: 1; z-index: 2; display: grid; grid-template-columns: 1fr 1fr; gap: 6%; }
.ib-pad { border-radius: 50%; padding: 0; background: var(--c); box-shadow: inset 0 calc(var(--u) * -1.6) 0 var(--d), 0 calc(var(--u) * 1.4) 0 rgba(0,0,0,.25); filter: brightness(.72) saturate(.8); transition: filter .12s, transform .12s; }
.ib-pad.on { filter: brightness(1.25) saturate(1.1); transform: scale(1.06); box-shadow: 0 0 calc(var(--u) * 5) var(--c), inset 0 calc(var(--u) * -1.6) 0 var(--d); }
.ib-pad:disabled { cursor: default; }
.ib-dots { left: 0; right: 0; top: 13%; z-index: 2; display: flex; justify-content: center; gap: calc(var(--u) * 1.6); }
.ib-dots i { width: calc(var(--u) * 4); aspect-ratio: 1; border-radius: 50%; background: rgba(255,253,245,.3); }
.ib-dots i.on { background: var(--kuning); }
.ib-mode { left: 0; right: 0; top: 84%; z-index: 2; text-align: center; font: 700 calc(var(--u) * 5.5)/1.2 Fredoka, sans-serif; color: #FFFDF5; }`,

  stageHtml: () => `<svg class="bg" viewBox="0 0 200 300" preserveAspectRatio="none" aria-hidden="true">
      <rect width="200" height="300" fill="#24305E"/><circle cx="100" cy="150" r="96" fill="#2E3C72"/>
      <g fill="#FFFDF5" opacity=".5">${[[20, 30], [178, 40], [30, 270], [170, 262]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.6"/>`).join('')}</g>
    </svg>
    <div class="ib-dots" aria-hidden="true"></div>
    <div class="ib-pads">${PADS.map((p, i) => `<button class="ib-pad" type="button" data-i="${i}" style="--c:${p.c};--d:${p.d}" aria-label="Gendang ${p.n}" disabled></button>`).join('')}</div>
    <div class="ib-mode" aria-live="polite"></div>`,

  initState: (age) => ({ age, span: AGE_SPAN[age], rounds: [] }),
  normalize(s, age) {
    if (s.age !== age) { s.age = age; s.span = AGE_SPAN[age]; }
    if (!Number.isInteger(s.span) || s.span < SPAN_MIN || s.span > SPAN_MAX) s.span = AGE_SPAN[age];
    return s;
  },

  async round(ctx) {
    const { stage, state, say, sfx, anim } = ctx;
    const pads = [...stage.querySelectorAll('.ib-pad')], dots = stage.querySelector('.ib-dots'), mode = stage.querySelector('.ib-mode');
    const mix = ctx.mixer ? ctx.mixer() : null;
    const arm = (on) => pads.forEach((p) => { p.disabled = !on; });
    const flash = async (i, ms) => { pads[i].classList.add('on'); play(mix, PADS[i].f, ms); await ctx.wait(ms); pads[i].classList.remove('on'); };
    const showDots = (n, done) => { dots.innerHTML = Array.from({ length: n }, (_, i) => `<i${i < done ? ' class="on"' : ''}></i>`).join(''); };

    let k = state.span, seq = Array.from({ length: k }, rndPad), maxK = 0, correct = 0;
    ctx.progress(TRIALS);
    await ctx.ready(); ctx.alive();
    if (ctx.first) await ctx.wait(Math.max(4600, say('intro') + 300));
    for (let t = 0; t < TRIALS; t++) {
      // Hafiz main urutan (lebih perlahan untuk urutan pendek).
      const ms = k <= 3 ? 620 : 480, gap = k <= 3 ? 260 : 180;
      arm(false); showDots(k, 0); mode.textContent = 'Dengar…';
      await ctx.wait(500);
      for (const i of seq) { await flash(i, ms); await ctx.wait(gap); }
      mode.textContent = '';
      await ctx.wait(Math.max(700, say('giliran') + 100));
      stage.dataset.seq = seq.join(','); // untuk ujian automatik
      let ok = true;
      for (let s = 0; s < seq.length; s++) {
        arm(true);
        let tap = await ctx.tap({ selector: '.ib-pad', ms: IDLE_MS });
        if (!tap) { arm(false); for (let j = 0; j < s; j++) { await flash(seq[j], 380); await ctx.wait(120); } await flash(seq[s], 600); arm(true); tap = await ctx.tap({ selector: '.ib-pad', ms: IDLE_MS }); }
        arm(false);
        const i = tap ? Number(tap.el.dataset.i) : -1;
        if (i >= 0) { pads[i].classList.add('on'); play(mix, PADS[i].f, 260); setTimeout(() => pads[i].classList.remove('on'), 220); }
        if (i !== seq[s]) { ok = false; break; }
        showDots(k, s + 1);
        await ctx.wait(160);
      }
      delete stage.dataset.seq;
      if (ok) {
        correct++; maxK = Math.max(maxK, k);
        sfx.good();
        await ctx.wait(600);
        if (k < SPAN_MAX) { k++; seq.push(rndPad()); if (t < TRIALS - 1) await ctx.wait(Math.max(900, say('lagi') + 100)); }
        else seq = Array.from({ length: k }, rndPad);
      } else {
        sfx.soft();
        anim(stage.querySelector('.ib-pads'), [{ transform: 'translateX(0)' }, { transform: 'translateX(-3%)' }, { transform: 'translateX(3%)' }, { transform: 'translateX(0)' }], { duration: 360, fill: 'none' });
        // Tunjuk urutan sebenar perlahan-lahan, kemudian mula urutan baharu yang lebih pendek.
        await ctx.wait(500);
        for (const i of seq) { await flash(i, 420); await ctx.wait(140); }
        await ctx.wait(Math.max(700, say('cuba-lagi') + 100));
        k = Math.max(SPAN_MIN, k - 1);
        seq = Array.from({ length: k }, rndPad);
      }
      state.span = k; ctx.save();
      ctx.mark(t);
    }
    arm(false); dots.innerHTML = '';
    return {
      record: { correct, n: TRIALS, maxK, span: state.span },
      foundHtml: '',
      text: maxK ? `Adik ingat urutan <span class="big-num">${maxK}</span> gendang sekali gus!` : 'Adik dah cuba dengar dan ikut. Makin kerap main, makin panjang urutan!',
    };
  },

  parent: {
    stats(s) {
      const last = s.rounds.slice(-7);
      const okP = pct(last.reduce((a, r) => a + (r.correct || 0), 0), last.reduce((a, r) => a + (r.n || 0), 0));
      const best = s.rounds.reduce((m, r) => Math.max(m, r.maxK || 0), 0);
      return [
        { v: best ? `${best}<small> bunyi</small>` : '–', label: 'Urutan terpanjang' },
        { v: `${s.span}`, label: 'Panjang urutan sekarang' },
        { v: okP === null ? '–' : okP + '%', label: 'Urutan betul' },
      ];
    },
    cols: ['Terpanjang', 'Betul'],
    row: (r) => [r.maxK || '–', meter(pct(r.correct, r.n))],
    explain: `<span><b>Ingatan kerja urutan</b>: menyimpan siri bunyi dan warna mengikut susunan, kemahiran yang sama digunakan untuk mengingat arahan berlapis, nombor telefon dan ejaan. Budak 3–4 tahun biasanya boleh 2–3; budak 6 tahun 4–5.</span>
      <span>Urutan bertambah satu setiap kali betul dan berkurang satu bila tersilap (tidak kurang daripada 2). Panjang urutan disimpan untuk sesi seterusnya.</span>`,
  },

  mission: {
    title: 'Main "Ikut Tepuk"',
    steps: [
      'Tepuk satu corak ringkas: <b>tepuk – tepuk – hentak kaki</b>. Minta anak ulang.',
      'Bila betul, tambah satu langkah lagi.',
      'Tukar peranan: anak buat corak, ibu bapa ulang (sengaja silap sekali-sekala!).',
      'Cuba juga dengan periuk dan sudu sebagai gendang.',
    ],
    why: 'Kenapa? Mengulang corak bunyi melatih tumpuan pendengaran dan ingatan urutan, asas penting untuk belajar membaca dan mengikut arahan.',
  },
};
