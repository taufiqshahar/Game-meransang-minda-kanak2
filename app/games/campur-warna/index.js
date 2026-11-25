// Campur Warna: sains awal (warna primer → sekunder) + meramal. Dua tin cat dituang ke dalam mangkuk.
// Tahap 1: tuang dahulu, kemudian padankan warna yang terhasil · Tahap 2–3: TEKA dahulu, kemudian tuang untuk menguji
// · Tahap 3–4: songsang: "Nak dapat hijau, campur apa?" anak pilih dua tin daripada tiga.
import { shuffle, pick, pct, meter } from '../../kit/util.js';

const COL = { merah: '#E5484D', kuning: '#F5C531', biru: '#2F7DE1', jingga: '#F28A2C', hijau: '#22B26A', ungu: '#7B4FC9' };
const NAME = { merah: 'Merah', kuning: 'Kuning', biru: 'Biru', jingga: 'Jingga', hijau: 'Hijau', ungu: 'Ungu' };
const PRIM = ['merah', 'kuning', 'biru'];
const MIX = { jingga: ['merah', 'kuning'], hijau: ['kuning', 'biru'], ungu: ['merah', 'biru'] };
const SEC = Object.keys(MIX);
const mixOf = (a, b) => SEC.find((k) => MIX[k].includes(a) && MIX[k].includes(b));
// modes = jenis soalan bagi 4 percubaan · opts = pilihan jawapan untuk soalan "teka"
const LEVELS = [null,
  { modes: ['tengok', 'tengok', 'tengok', 'tengok'], opts: 2 },
  { modes: ['teka', 'teka', 'teka', 'teka'], opts: 3 },
  { modes: ['teka', 'balik', 'teka', 'balik'], opts: 3 },
  { modes: ['balik', 'teka', 'balik', 'teka'], opts: 4 },
];
const MAX_LEVEL = 4;
const AGE_LEVEL = { 3: 1, 4: 1, 5: 2, 6: 3 };
const UP_AT = 4, DOWN_AT = 2;
const IDLE_MS = 10000;
const GAP = 200;

const tin = (c) => `<svg viewBox="0 0 60 70" aria-hidden="true"><path d="M10 16 H50 V62 Q50 66 46 66 H14 Q10 66 10 62 Z" fill="#C9D1D9" stroke="#6B7684" stroke-width="2.4"/>
  <rect x="10" y="28" width="40" height="22" fill="${COL[c]}"/><ellipse cx="30" cy="16" rx="20" ry="5" fill="${COL[c]}" stroke="#6B7684" stroke-width="2.4"/>
  <path d="M16 12 Q30 -2 44 12" stroke="#6B7684" stroke-width="2" fill="none"/><path d="M14 34 V46" stroke="#fff" stroke-width="2.4" opacity=".5"/></svg>`;
const blob = (c) => `<svg viewBox="0 0 60 60" aria-hidden="true"><path d="M30 6 Q48 8 52 26 Q56 46 36 52 Q14 58 8 38 Q4 16 30 6 Z" fill="${COL[c]}" stroke="rgba(0,0,0,.25)" stroke-width="2"/><ellipse cx="22" cy="20" rx="6" ry="4" fill="#fff" opacity=".35"/></svg>`;

export default {
  id: 'campur-warna',
  title: 'Campur Warna',
  stageLabel: 'Tin cat dan sebuah mangkuk. Campurkan dua warna dan teka warna baharu yang terhasil.',
  lines: {
    intro: 'Jom campur warna! Teka dulu, jadi warna apa?',
    tambah: 'tambah...', jadi: 'jadi warna apa?', nak: 'Nak dapat warna ini, campur apa?',
    ...Object.fromEntries(Object.keys(NAME).map((c) => [`c-${c}`, NAME[c] + (SEC.includes(c) ? '!' : '.')])),
  },
  recorded: ['intro', 'tambah', 'jadi', 'nak', ...Object.keys(NAME).map((c) => `c-${c}`)],

  css: `.cw-tins { left: 6%; right: 6%; top: 11%; height: 21%; z-index: 3; display: flex; justify-content: center; align-items: flex-end; gap: 6%; }
.cw-tin { width: 24%; aspect-ratio: 60 / 70; padding: 0; transition: transform .5s, opacity .3s; transform-origin: 80% 20%; }
.cw-tin svg { width: 100%; height: 100%; display: block; }
.cw-tin.pour { transform: translateY(70%) rotate(-55deg); }
.cw-tin.sel { filter: drop-shadow(0 0 calc(var(--u) * 1.6) var(--kuning)); }
.cw-tin.dim { opacity: .35; } .cw-tin:disabled { cursor: default; }
.cw-bowl { left: 22%; width: 56%; top: 38%; aspect-ratio: 1.6; z-index: 2; }
.cw-bowl svg { width: 100%; height: 100%; display: block; overflow: visible; }
.cw-paint { transition: fill .9s, transform .9s; transform-origin: 80px 70px; transform-box: view-box; }
.cw-paint.ghost { opacity: .38; animation: cw-pulse 1.4s ease-in-out infinite; }
@keyframes cw-pulse { 50% { opacity: .55; } }
.cw-opts { left: 6%; right: 6%; top: 72%; bottom: 5%; z-index: 3; display: flex; justify-content: center; align-items: center; gap: 4%; }
.cw-opt { width: 22%; aspect-ratio: 1; padding: 2%; border-radius: 50%; background: #FFFDF5; box-shadow: 0 calc(var(--u) * 1.2) 0 rgba(0,0,0,.2); transition: opacity .3s; }
.cw-opt svg { width: 100%; height: 100%; display: block; }
.cw-opt.ok { box-shadow: 0 0 0 calc(var(--u) * 1.4) var(--kuning), 0 calc(var(--u) * 1.2) 0 rgba(0,0,0,.2); }
.cw-opt.dim { opacity: .3; } .cw-opt:disabled { cursor: default; }
@media (prefers-reduced-motion: reduce) { .cw-paint.ghost { animation: none; } }`,

  stageHtml: () => `<svg class="bg" viewBox="0 0 200 300" preserveAspectRatio="none" aria-hidden="true">
      <rect width="200" height="300" fill="#FFF3DD"/>
      <g opacity=".35">${[['#E5484D', 18, 220], ['#2F7DE1', 176, 250], ['#F5C531', 40, 280], ['#22B26A', 160, 200]].map(([c, x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="${c}"/>`).join('')}</g>
      <rect y="100" width="200" height="8" fill="#B07A44"/>
    </svg>
    <div class="cw-tins"></div>
    <div class="cw-bowl" aria-hidden="true"><svg viewBox="0 0 160 100">
      <path d="M6 30 Q10 96 80 96 Q150 96 154 30 Z" fill="#FFFDF5" stroke="#8A9199" stroke-width="3"/>
      <path class="cw-paint" d="M14 44 Q22 88 80 88 Q138 88 146 44 Q80 56 14 44 Z" fill="#FFFDF5"/>
      <ellipse cx="80" cy="30" rx="74" ry="14" fill="#E9EEF3" stroke="#8A9199" stroke-width="3"/>
    </svg></div>
    <div class="cw-opts"></div>`,

  initState: (age) => ({ age, level: AGE_LEVEL[age], rounds: [] }),
  normalize(s, age) {
    if (s.age !== age) { s.age = age; s.level = AGE_LEVEL[age]; }
    if (!Number.isInteger(s.level) || s.level < 1 || s.level > MAX_LEVEL) s.level = AGE_LEVEL[age];
    return s;
  },

  async round(ctx) {
    const { stage, state, say, sfx, anim } = ctx;
    const tinsEl = stage.querySelector('.cw-tins'), optsEl = stage.querySelector('.cw-opts'), paint = stage.querySelector('.cw-paint');
    const level = state.level, L = LEVELS[level];
    const chain = async (...keys) => { for (let i = 0; i < keys.length; i++) await ctx.wait(Math.max(250, say(keys[i]) - (i < keys.length - 1 ? GAP : -100))); };
    const setPaint = (c, level01, ghost = false) => { paint.classList.toggle('ghost', ghost); paint.style.fill = c ? COL[c] : '#FFFDF5'; paint.style.transform = `scaleY(${level01})`; };
    async function pour(a, b) {
      const [ta, tb] = [a, b].map((c) => tinsEl.querySelector(`.cw-tin[data-c="${c}"]`));
      ta.classList.add('pour'); sfx.pop(); await ctx.wait(600); setPaint(a, .55); await ctx.wait(700); ta.classList.remove('pour');
      tb.classList.add('pour'); sfx.pop(); await ctx.wait(600); setPaint(b, .8); await ctx.wait(500);
      setPaint(mixOf(a, b), 1); tb.classList.remove('pour');
      anim(paint, [{ transform: 'scaleY(1) rotate(0)' }, { transform: 'scaleY(1) rotate(4deg)' }, { transform: 'scaleY(1) rotate(-4deg)' }, { transform: 'scaleY(1) rotate(0)' }], { duration: 900, fill: 'none' });
      await ctx.wait(1000);
    }
    async function choose(selector, answer, demo, ask) {
      const els = [...stage.querySelectorAll(selector)];
      const right = els.find((e) => e.dataset.c === answer);
      const arm = (on) => els.forEach((e) => { e.disabled = !on || e.classList.contains('dim'); });
      const hint = () => { const r = ctx.toPct(right.getBoundingClientRect()); ctx.hand.show(r.left + r.width * .4, r.top + r.width * .3); };
      for (;;) {
        if (demo) hint();
        arm(true);
        const tap = await ctx.tap({ selector, ms: IDLE_MS });
        arm(false); ctx.hand.hide();
        if (tap) return tap.el;
        hint(); await ask();
      }
    }

    async function trial(mode, demo) {
      setPaint(null, .001); optsEl.innerHTML = '';
      if (mode === 'balik') {
        const goal = pick(SEC);
        tinsEl.innerHTML = shuffle(PRIM).map((c) => `<button class="cw-tin" type="button" data-c="${c}" aria-label="Cat ${NAME[c]}" disabled>${tin(c)}</button>`).join('');
        setPaint(goal, 1, true); // warna sasaran sebagai "bayang" cat dalam mangkuk
        stage.dataset.answer = MIX[goal].join(','); // untuk ujian automatik
        const ask = () => chain('nak', `c-${goal}`);
        await ask();
        // Pilih dua tin; tin yang salah ditolak serta-merta.
        const picked = [];
        let wrong = 0;
        while (picked.length < 2) {
          const need = MIX[goal].filter((c) => !picked.includes(c));
          const el = await choose('.cw-tin:not(.sel)', need[0], demo && wrong === 0 && !picked.length, ask);
          const c = el.dataset.c;
          if (MIX[goal].includes(c)) { picked.push(c); el.classList.add('sel'); sfx.light(); await ctx.wait(Math.max(500, say(`c-${c}`))); }
          else { wrong++; sfx.soft(); el.classList.add('dim'); await ctx.wait(Math.max(700, say(`c-${c}`) + 150)); await ctx.wait(Math.max(700, say('cuba-lagi') + 100)); }
        }
        tinsEl.querySelectorAll('.cw-tin').forEach((t) => t.classList.remove('sel'));
        setPaint(null, .001);
        await pour(picked[0], picked[1]);
        sfx.good();
        await ctx.wait(Math.max(900, say(`c-${goal}`) + 300));
        return { mode, ok: wrong === 0 };
      }
      // "tengok" dan "teka": dua tin warna primer ditentukan.
      const [a, b] = shuffle(PRIM).slice(0, 2), res = mixOf(a, b);
      tinsEl.innerHTML = [a, b].map((c) => `<button class="cw-tin" type="button" data-c="${c}" aria-label="Cat ${NAME[c]}" disabled>${tin(c)}</button>`).join('');
      // Pengganggu: warna sekunder lain; Tahap 4 juga satu warna primer (anak mesti tahu warna berubah bila dicampur).
      const distract = [...shuffle(SEC.filter((x) => x !== res)), ...(L.opts === 4 ? [pick([a, b])] : [])];
      const opts = shuffle([res, ...distract.slice(0, L.opts - 1)]);
      const ask = () => chain(`c-${a}`, 'tambah', `c-${b}`, 'jadi');
      const showOpts = () => { optsEl.innerHTML = opts.map((c) => `<button class="cw-opt" type="button" data-c="${c}" aria-label="${NAME[c]}" disabled>${blob(c)}</button>`).join(''); };
      stage.dataset.answer = res;
      if (mode === 'tengok') {
        await pour(a, b);
        showOpts();
        await ask();
        let wrong = 0;
        for (;;) {
          const el = await choose('.cw-opt:not(.dim)', res, demo && wrong === 0, ask);
          if (el.dataset.c === res) { el.classList.add('ok'); break; }
          wrong++; sfx.soft(); el.classList.add('dim');
          await ctx.wait(Math.max(700, say(`c-${el.dataset.c}`) + 150));
        }
        sfx.good();
        await ctx.wait(Math.max(900, say(`c-${res}`) + 300));
        return { mode, ok: wrong === 0 };
      }
      // "teka": ramal dahulu (sekali sahaja), kemudian tuang untuk menguji.
      showOpts();
      await ask();
      const el = await choose('.cw-opt', res, demo, ask);
      const ok = el.dataset.c === res;
      el.classList.add('ok'); [...optsEl.children].forEach((x) => { if (x !== el) x.classList.add('dim'); });
      sfx.light();
      await pour(a, b);
      if (ok) sfx.good(); else { sfx.soft(); el.classList.remove('ok'); el.classList.add('dim'); optsEl.querySelector(`[data-c="${res}"]`)?.classList.replace('dim', 'ok'); }
      await ctx.wait(Math.max(900, say(`c-${res}`) + 300));
      return { mode, ok };
    }

    ctx.progress(L.modes.length);
    await ctx.ready(); ctx.alive();
    if (ctx.first) await ctx.wait(Math.max(4000, say('intro') + 200));
    const recs = [];
    for (let i = 0; i < L.modes.length; i++) {
      recs.push(await trial(L.modes[i], ctx.first && i === 0 && level <= 2));
      ctx.mark(i);
      await ctx.wait(400);
    }
    delete stage.dataset.answer;
    const correct = recs.filter((r) => r.ok).length;
    if (correct >= UP_AT) state.level = Math.min(MAX_LEVEL, level + 1);
    else if (correct <= DOWN_AT) state.level = Math.max(1, level - 1);
    const teka = recs.filter((r) => r.mode === 'teka');
    return {
      record: { level, correct, n: recs.length, teka: teka.length, tekaOk: teka.filter((r) => r.ok).length },
      foundHtml: SEC.map(blob).join(''),
      text: `Adik campur <span class="big-num">${recs.length}</span> warna!` + (teka.length ? ` Ramalan betul: <span class="big-num">${teka.filter((r) => r.ok).length}</span>/${teka.length}.` : ''),
    };
  },

  parent: {
    stats(s) {
      const last = s.rounds.slice(-7);
      const okP = pct(last.reduce((a, r) => a + (r.correct || 0), 0), last.reduce((a, r) => a + (r.n || 0), 0));
      const tkP = pct(last.reduce((a, r) => a + (r.tekaOk || 0), 0), last.reduce((a, r) => a + (r.teka || 0), 0));
      return [
        { v: okP === null ? '–' : okP + '%', label: 'Betul kali pertama' },
        { v: tkP === null ? '–' : tkP + '%', label: 'Ramalan betul' },
        { v: `${s.level}<small>/${MAX_LEVEL}</small>`, label: 'Tahap' },
      ];
    },
    cols: ['Tahap', 'Betul', 'Ramalan'],
    row: (r) => [r.level, meter(pct(r.correct, r.n)), r.teka ? `${r.tekaOk || 0}/${r.teka}` : '–'],
    explain: `<span><b>Sains awal + meramal</b>: warna primer (merah, kuning, biru) bercampur menjadi warna sekunder (jingga, hijau, ungu). Anak belajar meramal dahulu, kemudian menguji, asas kaedah saintifik. Juga mengukuhkan nama warna.</span>
      <span>Tahap 1: tuang dahulu, kemudian padankan · Tahap 2: teka sebelum tuang · Tahap 3: teka + songsang ("nak dapat hijau, campur apa?") · Tahap 4: lebih banyak soalan songsang dan pilihan pengganggu.</span>`,
  },

  mission: {
    title: 'Makmal warna di dapur',
    steps: [
      'Sediakan 3 gelas air jernih dan pewarna makanan merah, kuning, biru (atau cat air).',
      'Sebelum campur, tanya: <b>"Kuning tambah biru jadi warna apa?"</b> Biar anak teka.',
      'Campur dan tengok bersama. Betul tak tekaan tadi?',
      'Cabaran: "Macam mana nak dapat ungu?" Biar anak cuba sendiri.',
    ],
    why: 'Kenapa? Meramal kemudian menguji mengajar anak berfikir seperti saintis, dan ia sangat seronok!',
  },
};
