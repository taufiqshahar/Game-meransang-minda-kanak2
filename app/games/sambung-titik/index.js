// Sambung Titik: motor halus (ketepatan jari) + turutan nombor 1–10. Tekan titik ikut nombor; garisan terbina,
// Hafiz mengira bersama. Bila bentuk tertutup, gambar sebenar muncul berwarna ("Hmm... gambar apa ni?" → "Bas sekolah!").
// Tahap 1: 5 titik besar, titik seterusnya berdenyut · Tahap 2: 7–8 titik · Tahap 3: 9–10 titik, tiada denyut
// · Tahap 4: 9–10 titik kecil, jalur nombor bantuan disorok.
import { vehicleIcon } from '../../kit/vehicles.js';
import { bendaIcon } from '../../kit/benda.js';
import { shuffle, pct, meter } from '../../kit/util.js';

const inner = (s) => s.replace(/<\/?svg[^>]*>/g, '');
// Letak ikon asal ke dalam kotak 100×100: v = viewBox asal, [x, y, s] = anjakan dan skala.
const fit = (s, x, y, sc) => `<g transform="translate(${x} ${y}) scale(${sc})">${inner(s)}</g>`;
const VEH = (id) => fit(vehicleIcon(id), 2, 14, .6);        // 160×120 → 96×72
const BEN = (id) => fit(bendaIcon(id), 5, 5, 1.5);          // 60×60 → 90×90
const vp = (pts) => pts.map(([x, y]) => [+(2 + x * .6).toFixed(1), +(14 + y * .6).toFixed(1)]);
const bp = (pts) => pts.map(([x, y]) => [+(5 + x * 1.5).toFixed(1), +(5 + y * 1.5).toFixed(1)]);

const STAR = Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 19 : 44; return [+(50 + r * Math.cos(a)).toFixed(1), +(52 + r * Math.sin(a)).toFixed(1)]; });

const PICS = {
  rumah: { voice: 'n-rumah', name: 'Rumah', pts: [[18, 88], [82, 88], [82, 46], [50, 14], [18, 46]],
    art: `<path d="M50 14 L86 48 H14 Z" fill="#C0392B" stroke="#7A1F14" stroke-width="2.5" stroke-linejoin="round"/><rect x="20" y="46" width="60" height="42" fill="#F1D3AE" stroke="#8A5A1E" stroke-width="2.5"/>
      <rect x="42" y="62" width="16" height="26" fill="#8A5A2E"/><circle cx="55" cy="76" r="1.6" fill="#F5B82E"/><rect x="26" y="54" width="12" height="12" fill="#A9DBF3" stroke="#8A5A1E" stroke-width="1.6"/><rect x="62" y="54" width="12" height="12" fill="#A9DBF3" stroke="#8A5A1E" stroke-width="1.6"/>` },
  bas: { voice: 'v-bas', name: 'Bas sekolah', pts: vp([[8, 100], [8, 28], [140, 28], [152, 40], [152, 100]]), art: VEH('bas') },
  payung: { voice: 'n-payung', name: 'Payung', pts: bp([[6, 30], [13, 13], [30, 3], [47, 13], [54, 30]]), art: BEN('payung') },
  topi: { voice: 'n-topi', name: 'Topi', pts: bp([[8, 46], [8, 40], [13, 22], [32, 14], [47, 22], [56, 40], [52, 46]]), art: BEN('topi') },
  lori: { voice: 'v-lori', name: 'Lori', pts: vp([[12, 104], [10, 44], [100, 44], [116, 40], [134, 42], [148, 64], [148, 104]]), art: VEH('lori') },
  kapal: { voice: 'n-kapal', name: 'Kapal', pts: bp([[14, 50], [46, 50], [54, 36], [42, 24], [41, 12], [34, 12], [16, 24], [6, 36]]), art: BEN('kapal') },
  ikan: { voice: 'n-ikan', name: 'Ikan', pts: [[90, 50], [66, 26], [40, 30], [26, 46], [8, 28], [8, 72], [26, 54], [40, 70], [66, 74]],
    art: `<path d="M26 50 L8 28 V72 Z" fill="#F28A2C" stroke="#A3511A" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M90 50 Q76 24 50 28 Q30 32 24 50 Q30 68 50 72 Q76 76 90 50 Z" fill="#5BB8E8" stroke="#1F6FA3" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M58 30 Q50 18 40 22 Q46 26 46 32 Z" fill="#2F7DE1" stroke="#1F6FA3" stroke-width="2" stroke-linejoin="round"/>
      <g fill="none" stroke="#1F6FA3" stroke-width="1.6" opacity=".6"><path d="M50 40 q4 10 0 20 M60 38 q4 12 0 24"/></g>
      <circle cx="76" cy="46" r="4.5" fill="#fff"/><circle cx="77" cy="46" r="2.4" fill="#2B2F36"/><path d="M84 56 q-4 3 -8 1" stroke="#1F6FA3" stroke-width="2" fill="none" stroke-linecap="round"/>` },
  bintang: { voice: 'n-bintang', name: 'Bintang', pts: STAR,
    art: `<path d="M${STAR.map((p) => p.join(' ')).join(' L')} Z" fill="#F5C531" stroke="#B7860F" stroke-width="2.5" stroke-linejoin="round"/>
      <circle cx="43" cy="52" r="2.6" fill="#2B2F36"/><circle cx="57" cy="52" r="2.6" fill="#2B2F36"/><path d="M44 60 Q50 66 56 60" stroke="#2B2F36" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <ellipse cx="38" cy="58" rx="3" ry="2" fill="#F28C8C" opacity=".6"/><ellipse cx="62" cy="58" rx="3" ry="2" fill="#F28C8C" opacity=".6"/>` },
  keretaapi: { voice: 'v-keretaapi', name: 'Kereta api', pts: vp([[6, 92], [6, 50], [64, 50], [64, 30], [98, 30], [98, 52], [116, 22], [138, 22], [148, 52], [148, 92]]), art: VEH('keretaapi') },
};
// pics = pilihan gambar · dot = saiz titik (% lebar kotak) · pulse = titik seterusnya berdenyut · strip = jalur nombor bantuan
const LEVELS = [null,
  { pics: ['rumah', 'bas', 'payung'], dot: 11, pulse: true, strip: true },
  { pics: ['topi', 'lori', 'kapal'], dot: 10, pulse: true, strip: true },
  { pics: ['ikan', 'bintang', 'keretaapi'], dot: 9.5, pulse: false, strip: true },
  { pics: ['ikan', 'bintang', 'keretaapi'], dot: 8.5, pulse: false, strip: false },
];
const MAX_LEVEL = 4;
const AGE_LEVEL = { 3: 1, 4: 2, 5: 3, 6: 3 };
const UP_AT = 2, DOWN_AT = 0;    // gambar tanpa silap daripada 3
const IDLE_MS = 9000;
const GAP = 220;
// Kotak gambar dalam pentas: kiri 4%, atas 11%, lebar 92% (segi empat sama: tinggi = 92/1.5 % pentas).
const BX = 4, BY = 11, BW = 92;

export default {
  id: 'sambung-titik',
  title: 'Sambung Titik',
  stageLabel: 'Titik bernombor membentuk gambar tersembunyi. Tekan titik ikut nombor, mula dari satu.',
  lines: {
    intro: 'Sambung titik ikut nombor. Mula dari satu!',
    cari: 'Cari nombor...',
    apa: 'Hmm... gambar apa ni?',
    'n-rumah': 'Rumah!', 'n-bintang': 'Bintang!', 'n-ikan': 'Ikan.', 'n-kapal': 'Kapal.', 'n-payung': 'Payung.', 'n-topi': 'Topi.',
  },
  recorded: ['intro', 'cari', 'apa', 'n-rumah', 'n-bintang', 'n-ikan', 'n-kapal', 'n-payung', 'n-topi'],

  css: `.st-box { left: ${BX}%; width: ${BW}%; top: ${BY}%; aspect-ratio: 1; z-index: 2; border-radius: calc(var(--u) * 4); background: #FFFDF5; box-shadow: 0 calc(var(--u) * 1.2) 0 rgba(0,0,0,.15); }
.st-box svg { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
.st-art { opacity: 0; transition: opacity .8s; }
.st-art.on { opacity: 1; }
.st-line { fill: none; stroke: #15302A; stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
.st-guide { fill: none; stroke: #15302A; stroke-width: .6; stroke-dasharray: 1.4 2; opacity: .25; }
.st-dots { inset: 0; z-index: 3; pointer-events: none; }
.st-dot { position: absolute; transform: translate(-50%, -50%); aspect-ratio: 1; border-radius: 50%; padding: 0; pointer-events: auto; background: #2F7DE1; border: calc(var(--u) * .6) solid #FFFDF5; box-shadow: 0 calc(var(--u) * .6) 0 rgba(0,0,0,.25); color: #FFFDF5; font: 700 calc(var(--u) * 4.4)/1 Fredoka, sans-serif; display: grid; place-items: center; transition: background .2s, opacity .6s; }
.st-dot.done { background: #22B26A; }
.st-dot.next.pulse { animation: st-pulse 1s ease-in-out infinite; }
@keyframes st-pulse { 50% { transform: translate(-50%, -50%) scale(1.2); box-shadow: 0 0 0 calc(var(--u) * 1.5) rgba(245,184,46,.6); } }
.st-dots.fade .st-dot { opacity: 0; }
.st-dot:disabled { cursor: default; }
.st-strip { left: 4%; right: 4%; top: 77%; z-index: 2; display: flex; justify-content: center; gap: calc(var(--u) * 1.4); }
.st-chip { width: calc(var(--u) * 7.5); aspect-ratio: 1; border-radius: 50%; display: grid; place-items: center; background: rgba(255,253,245,.6); color: #15302A; font: 700 calc(var(--u) * 3.8)/1 Fredoka, sans-serif; }
.st-chip.done { background: #22B26A; color: #FFFDF5; }
.st-chip.next { background: var(--kuning); }
@media (prefers-reduced-motion: reduce) { .st-dot.next.pulse { animation: none; } }`,

  stageHtml: () => `<svg class="bg" viewBox="0 0 200 300" preserveAspectRatio="none" aria-hidden="true">
      <rect width="200" height="300" fill="#9AD0E8"/>
      <g fill="#fff" opacity=".7"><ellipse cx="30" cy="250" rx="30" ry="9"/><ellipse cx="170" cy="266" rx="34" ry="10"/></g>
      <rect y="280" width="200" height="20" fill="#7FBF6A"/>
    </svg>
    <div class="st-box"></div><div class="st-dots"></div><div class="st-strip"></div>`,

  initState: (age) => ({ age, level: AGE_LEVEL[age], rounds: [] }),
  normalize(s, age) {
    if (s.age !== age) { s.age = age; s.level = AGE_LEVEL[age]; }
    if (!Number.isInteger(s.level) || s.level < 1 || s.level > MAX_LEVEL) s.level = AGE_LEVEL[age];
    return s;
  },

  async round(ctx) {
    const { stage, state, say, sfx, anim } = ctx;
    const boxEl = stage.querySelector('.st-box'), dotsEl = stage.querySelector('.st-dots'), stripEl = stage.querySelector('.st-strip');
    const level = state.level, L = LEVELS[level];
    const sayN = async (n) => { await ctx.wait(Math.max(300, say('cari') - GAP)); return say(`n${n}`); };

    async function trial(id, demo) {
      const P = PICS[id], pts = P.pts, n = pts.length;
      boxEl.innerHTML = `<svg viewBox="0 0 100 100" aria-hidden="true"><g class="st-art">${P.art}</g>
        <path class="st-guide" d="M${pts.map((p) => p.join(' ')).join(' L')} Z"/><path class="st-line" d=""/></svg>`;
      const artEl = boxEl.querySelector('.st-art'), lineEl = boxEl.querySelector('.st-line');
      dotsEl.classList.remove('fade');
      dotsEl.innerHTML = pts.map(([x, y], i) => `<button class="st-dot" type="button" data-i="${i}" aria-label="Titik ${i + 1}" style="left:${BX + x * BW / 100}%;top:${BY + y * BW / 150}%;width:${L.dot * BW / 100}%" disabled>${i + 1}</button>`).join('');
      stripEl.innerHTML = L.strip ? pts.map((_, i) => `<span class="st-chip">${i + 1}</span>`).join('') : '';
      const dots = [...dotsEl.querySelectorAll('.st-dot')], chips = [...stripEl.querySelectorAll('.st-chip')];
      const arm = (on) => dots.forEach((d) => { d.disabled = !on; });
      let errors = 0, path = '';
      sfx.pop();

      for (let k = 0; k < n; k++) {
        const target = dots[k];
        dots.forEach((d) => d.classList.remove('next'));
        target.classList.add('next'); if (L.pulse) target.classList.add('pulse');
        chips.forEach((c, i) => c.classList.toggle('next', i === k));
        stage.dataset.answer = String(k); // untuk ujian automatik
        const hint = () => { const r = ctx.toPct(target.getBoundingClientRect()); ctx.hand.show(r.left + r.width * .3, r.top + r.width * .4); };
        if (k === 0) await ctx.wait((await sayN(1)) + 100);
        let wrongHere = 0;
        for (;;) {
          if (demo && k === 0 && wrongHere === 0) hint();
          arm(true);
          const tap = await ctx.tap({ selector: '.st-dot', ms: IDLE_MS });
          arm(false); ctx.hand.hide();
          if (!tap) { hint(); await ctx.wait((await sayN(k + 1)) + 100); continue; }
          if (tap.el === target) break;
          if (tap.el.classList.contains('done')) continue; // tekan titik yang sudah siap: abaikan
          errors++; wrongHere++;
          sfx.soft();
          anim(tap.el, [{ transform: 'translate(-50%, -50%)' }, { transform: 'translate(-62%, -50%)' }, { transform: 'translate(-38%, -50%)' }, { transform: 'translate(-50%, -50%)' }], { duration: 300, fill: 'none' });
          if (wrongHere >= 2) hint();
          await ctx.wait((await sayN(k + 1)) + 100);
        }
        target.classList.remove('next', 'pulse'); target.classList.add('done');
        if (chips[k]) { chips[k].classList.remove('next'); chips[k].classList.add('done'); }
        path += `${k ? ' L' : 'M'}${pts[k][0]} ${pts[k][1]}`;
        lineEl.setAttribute('d', path);
        sfx.light();
        if (k > 0) await ctx.wait(Math.max(450, say(`n${k + 1}`) - 150));
      }
      // Bentuk tertutup → gambar muncul.
      lineEl.setAttribute('d', path + ' Z');
      await ctx.wait(Math.max(1300, say('apa') + 200));
      dotsEl.classList.add('fade');
      artEl.classList.add('on');
      sfx.good();
      anim(boxEl, [{ transform: 'scale(1)' }, { transform: 'scale(1.04)' }, { transform: 'scale(1)' }], { duration: 600, fill: 'none' });
      await ctx.wait(Math.max(1300, say(P.voice) + 500));
      return { id, errors };
    }

    const order = shuffle(L.pics);
    ctx.progress(order.length);
    await ctx.ready(); ctx.alive();
    if (ctx.first) await ctx.wait(Math.max(3000, say('intro') + 200));
    const recs = [];
    for (let i = 0; i < order.length; i++) {
      recs.push(await trial(order[i], ctx.first && i === 0 && level <= 2));
      ctx.mark(i);
      await ctx.wait(300);
    }
    delete stage.dataset.answer;

    const clean = recs.filter((r) => r.errors === 0).length;
    if (clean >= UP_AT) state.level = Math.min(MAX_LEVEL, level + 1);
    else if (clean <= DOWN_AT) state.level = Math.max(1, level - 1);
    return {
      record: { level, n: recs.length, clean, errors: recs.reduce((a, r) => a + r.errors, 0), dots: PICS[order[0]].pts.length },
      foundHtml: recs.map((r) => `<svg viewBox="0 0 100 100" aria-hidden="true">${PICS[r.id].art}</svg>`).join(''),
      text: `Adik sambung titik jadi <span class="big-num">${recs.length}</span> gambar!` + (clean ? ` <span class="big-num">${clean}</span> tanpa silap.` : ''),
    };
  },

  parent: {
    stats(s) {
      const last = s.rounds.slice(-7);
      const okP = pct(last.reduce((a, r) => a + (r.clean || 0), 0), last.reduce((a, r) => a + (r.n || 0), 0));
      const most = s.rounds.reduce((m, r) => (r.clean ? Math.max(m, r.dots || 0) : m), 0);
      return [
        { v: okP === null ? '–' : okP + '%', label: 'Gambar tanpa silap' },
        { v: `${s.level}<small>/${MAX_LEVEL}</small>`, label: 'Tahap' },
        { v: most ? `1–${most}` : '–', label: 'Turutan terpanjang' },
      ];
    },
    cols: ['Tahap', 'Tanpa silap', 'Silap'],
    row: (r) => [r.level, meter(pct(r.clean, r.n)), r.errors],
    explain: `<span><b>Motor halus + turutan nombor</b>: menekan sasaran kecil dengan tepat melatih kawalan jari (persediaan memegang pensel), manakala mencari nombor seterusnya melatih kenal angka 1–10 dan turutannya.</span>
      <span>Tahap 1: 5 titik besar, titik seterusnya berdenyut · Tahap 2: 7–8 titik · Tahap 3: 9–10 titik tanpa denyut · Tahap 4: titik lebih kecil dan jalur nombor bantuan disorok. Naik bila 2/3 gambar tanpa silap.</span>`,
  },

  mission: {
    title: 'Sambung titik di atas kertas',
    steps: [
      'Lukis 5 titik bernombor di atas kertas membentuk rumah atau bintang.',
      'Biar anak sambung dengan pensel warna sambil menyebut nombor: <b>"satu, dua, tiga…"</b>',
      'Bila siap, tanya: <b>"Gambar apa ni?"</b> dan biar anak mewarnakannya.',
      'Cabaran: minta anak lukis titik sendiri untuk ayah sambung!',
    ],
    why: 'Kenapa? Menyambung titik dengan pensel melatih genggaman dan kawalan garisan, kemahiran yang sama diperlukan untuk menulis huruf nanti.',
  },
};
