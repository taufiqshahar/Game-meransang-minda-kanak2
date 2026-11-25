// Dengar Perasaan: kenal emosi dari NADA SUARA (prosodi), bukan dari muka. Hafiz menyebut satu ayat; anak pilih muka
// yang sepadan. Tahap 1–2: isi ayat juga memberi petunjuk ("Yay! Saya dapat hadiah!") · Tahap 3–4: ayat yang SAMA
// ("Kucing saya duduk atas kerusi") disebut dengan nada gembira / sedih / marah / takut, jadi hanya nada yang membezakan.
import { faceSVG } from '../../kit/faces.js';
import { shuffle, pick, pct, meter } from '../../kit/util.js';

const EMOS = ['gembira', 'sedih', 'marah', 'takut'];
const NAME = { gembira: 'Gembira', sedih: 'Sedih', marah: 'Marah', takut: 'Takut' };
// Klip: k = isi + nada selari, a/b = ayat neutral dengan nada berbeza.
const TEXT = {
  'k-gembira': 'Yay! Saya dapat hadiah!', 'k-sedih': 'Aiskrim saya jatuh...', 'k-marah': 'Hei! Jangan ambil mainan saya!', 'k-takut': 'Eh... bunyi apa tu? Gelapnya...',
  'a-gembira': 'Kucing saya duduk atas kerusi!', 'a-sedih': 'Kucing saya duduk atas kerusi...', 'a-marah': 'Kucing saya duduk atas kerusi!', 'a-takut': 'Kucing saya... duduk atas kerusi...',
  'b-gembira': 'Hari ni kita makan nasi!', 'b-sedih': 'Hari ni kita makan nasi...', 'b-marah': 'Hari ni kita makan nasi!', 'b-takut': 'Hari ni... kita makan nasi...',
};
// Pasangan yang jelas berbeza untuk Tahap 1 (2 pilihan).
const CONTRAST = { gembira: ['sedih', 'takut'], sedih: ['gembira', 'marah'], marah: ['gembira', 'sedih'], takut: ['gembira', 'marah'] };
// sets = kumpulan klip · opts = bilangan muka · n = percubaan
const LEVELS = [null,
  { sets: ['k'], opts: 2, n: 4 },
  { sets: ['k', 'k', 'a'], opts: 3, n: 6 },
  { sets: ['a', 'b'], opts: 3, n: 6 },
  { sets: ['a', 'b'], opts: 4, n: 8 },
];
const MAX_LEVEL = 4;
const AGE_LEVEL = { 3: 1, 4: 1, 5: 2, 6: 3 };
const IDLE_MS = 12000;

export default {
  id: 'dengar-perasaan',
  title: 'Dengar Perasaan',
  stageLabel: 'Dengar suara Hafiz, kemudian pilih muka yang menunjukkan perasaan dalam suaranya. Butang telinga untuk dengar semula.',
  lines: {
    intro: 'Dengar suara Hafiz. Dia rasa apa?', tanya: 'Hafiz rasa apa?',
    ...TEXT,
    ...Object.fromEntries(EMOS.map((e) => [`ini-${e}`, `Ini muka ${e}${e === 'gembira' ? '!' : '.'}`])),
  },
  recorded: ['intro', 'tanya', ...Object.keys(TEXT), ...EMOS.map((e) => `ini-${e}`)],

  css: `.dp-speaker { left: 30%; width: 40%; top: 11%; aspect-ratio: 1; z-index: 3; padding: 0; border-radius: 50%; background: #FFFDF5; box-shadow: 0 calc(var(--u) * 1.4) 0 rgba(0,0,0,.2); display: grid; place-items: center; }
.dp-speaker svg { width: 62%; height: 62%; }
.dp-speaker .w { opacity: .25; transition: opacity .2s; }
.dp-speaker.talk .w { animation: dp-wave .9s ease-in-out infinite; }
.dp-speaker.talk .w2 { animation-delay: .15s; } .dp-speaker.talk .w3 { animation-delay: .3s; }
@keyframes dp-wave { 50% { opacity: 1; } }
.dp-speaker:disabled { cursor: default; }
.dp-hint { left: 0; right: 0; top: 41%; z-index: 2; text-align: center; font: 600 calc(var(--u) * 4)/1.2 Fredoka, sans-serif; color: #15302A; opacity: .65; }
.dp-faces { left: 4%; right: 4%; top: 50%; bottom: 6%; z-index: 3; display: flex; flex-wrap: wrap; justify-content: center; align-content: center; gap: calc(var(--u) * 3); }
.dp-face { width: 40%; aspect-ratio: 1; padding: 2%; border-radius: calc(var(--u) * 5); background: #FFFDF5; box-shadow: 0 calc(var(--u) * 1.2) 0 rgba(0,0,0,.18); transition: opacity .3s; }
.dp-faces[data-n="3"] .dp-face { width: 29%; } .dp-faces[data-n="4"] .dp-face { width: 38%; }
.dp-face svg { width: 100%; height: 100%; display: block; }
.dp-face.ok { box-shadow: 0 0 0 calc(var(--u) * 1.4) var(--kuning), 0 calc(var(--u) * 1.2) 0 rgba(0,0,0,.18); }
.dp-face.dim { opacity: .3; } .dp-face:disabled { cursor: default; }
@media (prefers-reduced-motion: reduce) { .dp-speaker.talk .w { animation: none; opacity: 1; } }`,

  stageHtml: () => `<svg class="bg" viewBox="0 0 200 300" preserveAspectRatio="none" aria-hidden="true">
      <rect width="200" height="300" fill="#F7BD98"/><circle cx="100" cy="64" r="58" fill="#F9CDB0"/>
      <rect y="140" width="200" height="160" fill="#F4AE84"/>
    </svg>
    <button class="dp-speaker" type="button" aria-label="Dengar suara Hafiz lagi" disabled><svg viewBox="0 0 48 48" aria-hidden="true">
      <path d="M8 18 H16 L26 9 V39 L16 30 H8 Z" fill="#15302A"/>
      <path class="w w1" d="M31 18 Q35 24 31 30" stroke="#15302A" stroke-width="3.4" fill="none" stroke-linecap="round"/>
      <path class="w w2" d="M35 13 Q42 24 35 35" stroke="#15302A" stroke-width="3.4" fill="none" stroke-linecap="round"/>
      <path class="w w3" d="M39 8 Q49 24 39 40" stroke="#15302A" stroke-width="3.4" fill="none" stroke-linecap="round"/></svg></button>
    <div class="dp-hint" aria-hidden="true">Tekan untuk dengar lagi</div>
    <div class="dp-faces"></div>`,

  initState: (age) => ({ age, level: AGE_LEVEL[age], rounds: [] }),
  normalize(s, age) {
    if (s.age !== age) { s.age = age; s.level = AGE_LEVEL[age]; }
    if (!Number.isInteger(s.level) || s.level < 1 || s.level > MAX_LEVEL) s.level = AGE_LEVEL[age];
    return s;
  },

  async round(ctx) {
    const { stage, state, say, sfx } = ctx;
    const speaker = stage.querySelector('.dp-speaker'), facesEl = stage.querySelector('.dp-faces');
    const level = state.level, L = LEVELS[level];
    const kid = Math.floor(Math.random() * 5);

    // Senarai klip: setiap perasaan muncul sama kerap; tiada klip yang sama berturut-turut.
    const pool = L.sets.flatMap((set) => EMOS.map((e) => ({ key: `${set}-${e}`, emo: e })));
    const clips = [];
    while (clips.length < L.n) {
      const bag = shuffle([...pool]);
      for (const c of bag) {
        if (clips.length >= L.n) break;
        const prev = clips[clips.length - 1];
        if (!prev || prev.emo !== c.emo) clips.push(c);
      }
    }

    const speak = async (key) => { speaker.classList.add('talk'); const d = say(key); await ctx.wait(d + 150); speaker.classList.remove('talk'); };

    async function trial(c, demo) {
      const others = L.opts === 2 ? [pick(CONTRAST[c.emo])] : shuffle(EMOS.filter((e) => e !== c.emo)).slice(0, L.opts - 1);
      const opts = shuffle([c.emo, ...others]);
      facesEl.dataset.n = String(opts.length);
      facesEl.innerHTML = opts.map((e) => `<button class="dp-face" type="button" data-e="${e}" aria-label="Muka ${e}" disabled>${faceSVG(kid, e)}</button>`).join('');
      stage.dataset.answer = c.emo; // untuk ujian automatik
      const cards = [...facesEl.querySelectorAll('.dp-face')];
      const right = cards.find((x) => x.dataset.e === c.emo);
      const arm = (on) => { cards.forEach((x) => { x.disabled = !on || x.classList.contains('dim'); }); speaker.disabled = !on; };
      const hint = () => { const r = ctx.toPct(right.getBoundingClientRect()); ctx.hand.show(r.left + r.width * .45, r.top + r.width * .35); };
      sfx.pop();
      await ctx.wait(300);
      await speak(c.key);
      await ctx.wait(Math.max(600, say('tanya') + 100));
      let wrong = 0, replays = 0;
      for (;;) {
        if (demo && wrong === 0) hint();
        arm(true);
        const tap = await ctx.tap({ selector: '.dp-face, .dp-speaker', ms: IDLE_MS });
        arm(false); ctx.hand.hide();
        if (!tap || tap.el === speaker) { replays += tap ? 1 : 0; await speak(c.key); continue; }
        if (tap.el === right) break;
        wrong++; sfx.soft();
        // Namakan muka yang dipilih, kemudian dengar semula ayat itu.
        await ctx.wait(Math.max(900, say(`ini-${tap.el.dataset.e}`) + 200));
        tap.el.classList.add('dim');
        if (wrong >= 2 || L.opts === 2) hint();
        await speak(c.key);
      }
      right.classList.add('ok'); sfx.good();
      cards.forEach((x) => { if (x !== right) x.classList.add('dim'); });
      await ctx.wait(Math.max(1000, say(`ini-${c.emo}`) + 300));
      return { ok: wrong === 0, emo: c.emo, neutral: !c.key.startsWith('k-'), replays };
    }

    ctx.progress(L.n);
    await ctx.ready(); ctx.alive();
    if (ctx.first) await ctx.wait(Math.max(3000, say('intro') + 200));
    const recs = [];
    for (let i = 0; i < L.n; i++) {
      recs.push(await trial(clips[i], ctx.first && i === 0 && level === 1));
      ctx.mark(i);
      await ctx.wait(300);
    }
    delete stage.dataset.answer;
    const correct = recs.filter((r) => r.ok).length;
    if (correct >= L.n - 1) state.level = Math.min(MAX_LEVEL, level + 1);
    else if (correct <= L.n / 2) state.level = Math.max(1, level - 1);
    const neu = recs.filter((r) => r.neutral);
    return {
      record: { level, correct, n: recs.length, neu: neu.length, neuOk: neu.filter((r) => r.ok).length, miss: recs.filter((r) => !r.ok).map((r) => r.emo) },
      foundHtml: EMOS.map((e) => faceSVG(kid, e)).join(''),
      text: `Adik teka perasaan dari suara <span class="big-num">${correct}</span> daripada ${recs.length} kali!`,
    };
  },

  parent: {
    stats(s) {
      const last = s.rounds.slice(-7);
      const okP = pct(last.reduce((a, r) => a + (r.correct || 0), 0), last.reduce((a, r) => a + (r.n || 0), 0));
      const neuP = pct(last.reduce((a, r) => a + (r.neuOk || 0), 0), last.reduce((a, r) => a + (r.neu || 0), 0));
      const misses = {};
      last.forEach((r) => (r.miss || []).forEach((e) => { misses[e] = (misses[e] || 0) + 1; }));
      const hard = Object.entries(misses).sort((a, b) => b[1] - a[1])[0];
      return [
        { v: okP === null ? '–' : okP + '%', label: 'Betul kali pertama' },
        { v: neuP === null ? '–' : neuP + '%', label: 'Dari nada sahaja' },
        { v: hard && NAME[hard[0]] ? NAME[hard[0]] : '–', label: 'Perasaan paling sukar' },
      ];
    },
    cols: ['Tahap', 'Betul', 'Nada sahaja'],
    row: (r) => [r.level, meter(pct(r.correct, r.n)), r.neu ? `${r.neuOk || 0}/${r.neu}` : '–'],
    explain: `<span><b>Kecerdasan emosi (membaca nada suara)</b>: memahami perasaan orang dari cara mereka bercakap, bukan hanya dari perkataan atau muka. Kemahiran ini penting untuk berkawan dan memahami bila seseorang perlukan bantuan.</span>
      <span>Tahap 1: 2 muka, ayat memberi petunjuk ("Yay! Saya dapat hadiah!") · Tahap 2: 3 muka · Tahap 3–4: ayat yang sama disebut dengan nada berbeza ("Kucing saya duduk atas kerusi"), jadi hanya nada yang membezakan. Takut dan sedih biasanya paling sukar dibezakan.</span>`,
  },

  mission: {
    title: 'Main "Teka Suara Ibu"',
    steps: [
      'Sebut satu ayat biasa, contohnya <b>"Jom makan"</b>, dengan nada gembira. Tanya: "Ibu rasa apa?"',
      'Sebut ayat yang sama dengan nada sedih, marah (pura-pura!) dan takut.',
      'Bertukar peranan: anak sebut, ibu bapa teka.',
      'Bila menonton kartun, tutup mata sekejap dan teka perasaan watak dari suaranya sahaja.',
    ],
    why: 'Kenapa? Kanak-kanak yang pandai membaca nada suara lebih mudah memahami kawan dan orang dewasa, dan lebih cepat tahu bila perlu bertenang atau menolong.',
  },
};
