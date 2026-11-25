// Tarik Nafas Naga: strategi menenangkan diri (regulasi emosi). Naga sedang marah / sedih / takut; anak TEKAN DAN TAHAN
// butang sambil tarik nafas (perut naga mengembang, Sayf mengira), kemudian lepas dan hembus perlahan (naga meniup buih).
// Selepas 3 nafas, warna naga bertukar tenang. Tahap = tempoh tahan nafas: 3 → 4 → 5 → 6 saat.
// Lepas terlalu awal bukan "salah": Sayf dengan lembut minta cuba tahan sedikit lagi.
import { pct, meter } from '../../kit/util.js';

const EMOS = ['marah', 'sedih', 'takut'];
const EMO_NAME = { marah: 'Marah', sedih: 'Sedih', takut: 'Takut' };
const COLOR = { marah: '#E8705A', sedih: '#7FA6D9', takut: '#A98BD9', tenang: '#6CC04E' };
const BREATHS = 3;
const HOLD = [null, 3, 4, 5, 6];
const MAX_LEVEL = 4;
const AGE_LEVEL = { 3: 1, 4: 1, 5: 2, 6: 2 };
const IDLE_MS = 10000;
const INK = '#2B2F36';

const mix = (a, b, t) => '#' + [1, 3, 5].map((i) => Math.round(parseInt(a.slice(i, i + 2), 16) * (1 - t) + parseInt(b.slice(i, i + 2), 16) * t).toString(16).padStart(2, '0')).join('');
// Muka naga ikut perasaan (kening + mulut), koordinat lukisan 200×200.
const FACE = {
  marah: `<path d="M84 62 L100 70 M132 62 L116 70" stroke="${INK}" stroke-width="4" stroke-linecap="round"/><circle cx="96" cy="76" r="4.5" fill="${INK}"/><circle cx="120" cy="76" r="4.5" fill="${INK}"/><path d="M98 96 Q108 90 118 96" stroke="${INK}" stroke-width="3.4" fill="none" stroke-linecap="round"/>`,
  sedih: `<path d="M86 70 L100 64 M130 70 L116 64" stroke="${INK}" stroke-width="3.4" stroke-linecap="round"/><circle cx="96" cy="78" r="4.5" fill="${INK}"/><circle cx="120" cy="78" r="4.5" fill="${INK}"/><path d="M98 98 Q108 90 118 98" stroke="${INK}" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="M92 86 q-3 6 0 9 q3 -3 0 -9z" fill="#6EC1F0"/>`,
  takut: `<path d="M86 64 Q94 58 102 62 M114 62 Q122 58 130 64" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="96" cy="77" r="7" fill="#fff" stroke="${INK}" stroke-width="2"/><circle cx="120" cy="77" r="7" fill="#fff" stroke="${INK}" stroke-width="2"/><circle cx="96" cy="78" r="3" fill="${INK}"/><circle cx="120" cy="78" r="3" fill="${INK}"/><path d="M97 98 q3.7 -4 7.4 0 q3.7 4 7.4 0 q3.7 -4 7.4 0" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>`,
  tenang: `<path d="M90 78 Q96 72 102 78 M114 78 Q120 72 126 78" stroke="${INK}" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="M98 92 Q108 102 118 92" stroke="${INK}" stroke-width="3.4" fill="none" stroke-linecap="round"/><ellipse cx="88" cy="90" rx="6" ry="3.5" fill="#F28C8C" opacity=".6"/><ellipse cx="128" cy="90" rx="6" ry="3.5" fill="#F28C8C" opacity=".6"/>`,
};
const dragon = () => `<svg viewBox="0 0 200 200" role="img" aria-label="Naga">
  <path class="ng-c" d="M60 150 Q20 150 18 120 Q16 100 34 104 Q30 124 60 128 Z" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
  <path class="ng-c" d="M70 92 Q40 60 52 44 Q62 70 82 80 Z" stroke="${INK}" stroke-width="3" stroke-linejoin="round" opacity=".85"/>
  <ellipse class="ng-c" cx="100" cy="132" rx="46" ry="44" stroke="${INK}" stroke-width="3"/>
  <ellipse class="ng-belly" cx="100" cy="140" rx="28" ry="28" fill="#FFE9A8" stroke="${INK}" stroke-width="2.4"/>
  <g stroke="#E0C070" stroke-width="2" fill="none" class="ng-belly-lines"><path d="M80 128 Q100 134 120 128 M78 142 Q100 148 122 142 M82 156 Q100 162 118 156"/></g>
  <path d="M76 176 v10 M124 176 v10" stroke="${INK}" stroke-width="10" stroke-linecap="round"/>
  <path class="ng-c" d="M84 36 L90 18 L98 34 Z M118 34 L126 18 L132 36 Z" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>
  <ellipse class="ng-c" cx="108" cy="78" rx="36" ry="32" stroke="${INK}" stroke-width="3"/>
  <ellipse cx="136" cy="88" rx="14" ry="11" fill="#FFE9A8" stroke="${INK}" stroke-width="2.4"/><circle cx="133" cy="86" r="2" fill="${INK}"/><circle cx="141" cy="86" r="2" fill="${INK}"/>
  <g class="ng-face"></g>
</svg>`;

export default {
  id: 'tarik-nafas-naga',
  title: 'Tarik Nafas Naga',
  stageLabel: 'Seekor naga yang sedang beremosi. Tekan dan tahan butang sambil tarik nafas, kemudian lepas dan hembus perlahan.',
  lines: {
    intro: 'Bila kita marah atau sedih, tarik nafas dalam-dalam. Jom ajar naga!',
    tekan: 'Tekan dan tahan butang ni sambil tarik nafas.',
    awal: 'Eh, awal lagi. Tahan sikit lagi, ya.',
    'naga-marah': 'Alamak, naga tengah marah!', 'naga-sedih': 'Naga tengah sedih.', 'naga-takut': 'Naga rasa takut.',
    tenang: 'Naga dah tenang. Terima kasih, adik!',
  },
  recorded: ['intro', 'tekan', 'awal', 'naga-marah', 'naga-sedih', 'naga-takut', 'tenang'],

  css: `.ng-dragon { left: 16%; width: 68%; top: 12%; aspect-ratio: 1; z-index: 2; --naga: #E8705A; }
.ng-dragon svg { width: 100%; height: 100%; display: block; overflow: visible; }
.ng-dragon .ng-c { fill: var(--naga); transition: fill 1.2s; }
.ng-belly, .ng-belly-lines { transform-origin: 100px 140px; transform-box: view-box; transition: transform var(--t, .6s) ease-in-out; }
.ng-dragon.full .ng-belly, .ng-dragon.full .ng-belly-lines { transform: scale(1.45); }
.ng-bubbles { inset: 0; z-index: 3; pointer-events: none; }
.ng-bubble { position: absolute; width: 5%; aspect-ratio: 1; border-radius: 50%; border: calc(var(--u) * .6) solid rgba(255,255,255,.9); background: rgba(169,219,243,.35); animation: ng-up 2.6s ease-out forwards; }
@keyframes ng-up { to { transform: translate(var(--dx), -260%) scale(1.6); opacity: 0; } }
.ng-btn { left: 32%; width: 36%; top: 70%; aspect-ratio: 1; z-index: 4; border-radius: 50%; padding: 0; background: #FFFDF5; box-shadow: 0 calc(var(--u) * 1.4) 0 rgba(0,0,0,.25); touch-action: none; user-select: none; -webkit-user-select: none; }
.ng-btn svg { position: absolute; inset: 0; width: 100%; height: 100%; }
.ng-ring { fill: none; stroke: var(--kuning); stroke-width: 7; stroke-linecap: round; transform: rotate(-90deg); transform-origin: 50px 50px; }
.ng-btn b { position: absolute; left: 0; right: 0; top: 50%; transform: translateY(-50%); font: 700 calc(var(--u) * 6)/1 Fredoka, sans-serif; color: #15302A; }
.ng-btn.hold { background: #FFF3CF; transform: scale(.96); }
.ng-btn:disabled, .ng-btn[aria-disabled="true"] { opacity: .6; cursor: default; }
@media (prefers-reduced-motion: reduce) { .ng-bubble { animation-duration: .01s; } }`,

  stageHtml: () => `<svg class="bg" viewBox="0 0 200 300" preserveAspectRatio="none" aria-hidden="true">
      <rect width="200" height="300" fill="#2E5A7A"/><rect y="0" width="200" height="190" fill="#3E7096"/>
      <g fill="#FFFDF5" opacity=".7">${[[20, 30], [176, 22], [150, 70], [34, 96], [100, 14]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.6"/>`).join('')}</g>
      <ellipse cx="100" cy="196" rx="110" ry="22" fill="#4A8A5C"/><rect y="196" width="200" height="104" fill="#3F7A50"/>
    </svg>
    <div class="ng-dragon">${dragon()}</div><div class="ng-bubbles"></div>
    <button class="ng-btn" type="button" aria-label="Tekan dan tahan untuk tarik nafas" disabled>
      <svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="44" fill="none" stroke="#E9DFC6" stroke-width="7"/><circle class="ng-ring" cx="50" cy="50" r="44" stroke-dasharray="276.5" stroke-dashoffset="276.5"/></svg><b>Tahan</b>
    </button>`,

  initState: (age) => ({ age, level: AGE_LEVEL[age], rounds: [], next: 0 }),
  normalize(s, age) {
    if (s.age !== age) { s.age = age; s.level = AGE_LEVEL[age]; }
    if (!Number.isInteger(s.level) || s.level < 1 || s.level > MAX_LEVEL) s.level = AGE_LEVEL[age];
    if (!Number.isInteger(s.next)) s.next = 0;
    return s;
  },

  async round(ctx) {
    const { stage, state, say, sfx } = ctx;
    const dragonEl = stage.querySelector('.ng-dragon'), faceEl = stage.querySelector('.ng-face'), btn = stage.querySelector('.ng-btn'), ring = stage.querySelector('.ng-ring'), label = btn.querySelector('b'), bubblesEl = stage.querySelector('.ng-bubbles');
    const level = state.level, hold = HOLD[level];
    const emo = EMOS[state.next % EMOS.length];
    state.next = (state.next + 1) % EMOS.length;
    const setColor = (t) => dragonEl.style.setProperty('--naga', mix(COLOR[emo], COLOR.tenang, t));
    setColor(0);
    faceEl.innerHTML = FACE[emo];
    stage.dataset.hold = String(hold * 1000); // untuk ujian automatik
    const RING = 276.5;
    const setRing = (p, ms = 0) => { ring.style.transition = ms ? `stroke-dashoffset ${ms}ms linear` : 'none'; ring.style.strokeDashoffset = String(RING * (1 - p)); };

    // Tekan & lepas (tetikus, sentuhan, atau papan kekunci Space/Enter).
    let pressed = false, armed = false, onChange = null;
    btn.disabled = false;
    const ctl = new AbortController();
    const down = (e) => { if (!armed || pressed) return; e.preventDefault?.(); pressed = true; btn.classList.add('hold'); onChange?.(true); };
    const up = () => { if (!pressed) return; pressed = false; btn.classList.remove('hold'); onChange?.(false); };
    btn.addEventListener('pointerdown', (e) => { btn.setPointerCapture?.(e.pointerId); down(e); }, { signal: ctl.signal });
    btn.addEventListener('pointerup', up, { signal: ctl.signal });
    btn.addEventListener('pointercancel', up, { signal: ctl.signal });
    btn.addEventListener('contextmenu', (e) => e.preventDefault(), { signal: ctl.signal });
    document.addEventListener('keydown', (e) => { if ((e.code === 'Space' || e.code === 'Enter') && !e.repeat && document.activeElement === btn) down(e); }, { signal: ctl.signal });
    document.addEventListener('keyup', (e) => { if (e.code === 'Space' || e.code === 'Enter') up(); }, { signal: ctl.signal });
    const onAbort = () => { ctl.abort(); onChange?.(null); };
    ctx.signal.addEventListener('abort', onAbort);
    // Tunggu perubahan tekan (true/false) atau tamat masa (undefined).
    const waitChange = (ms) => new Promise((res) => {
      const t = ms ? setTimeout(() => { onChange = null; res(undefined); }, ms) : null;
      onChange = (v) => { clearTimeout(t); onChange = null; res(v); };
    });

    function bubbles() {
      for (let i = 0; i < 7; i++) setTimeout(() => {
        const b = document.createElement('i');
        b.className = 'ng-bubble';
        b.style.left = `${66 + Math.random() * 6}%`; b.style.top = `${34 + Math.random() * 4}%`;
        b.style.setProperty('--dx', `${40 + Math.random() * 120}%`);
        bubblesEl.appendChild(b); setTimeout(() => b.remove(), 2700);
      }, i * (hold * 140));
    }

    let early = 0;
    try {
      ctx.progress(BREATHS);
      await ctx.ready(); ctx.alive();
      if (ctx.first) await ctx.wait(Math.max(4800, say('intro') + 200));
      await ctx.wait(Math.max(1600, say(`naga-${emo}`) + 300));
      for (let i = 0; i < BREATHS; i++) {
        let prompt = i === 0 ? 'tekan' : 'breath-in';
        for (;;) {
          label.textContent = 'Tahan';
          armed = true; btn.setAttribute('aria-disabled', 'false');
          // Arahan disebut, tetapi anak boleh mula tekan bila-bila masa (kiraan bermula serta-merta).
          const pd = say(prompt);
          const v = pressed ? true : await waitChange(IDLE_MS + pd);
          ctx.alive();
          if (v === undefined) { const r = ctx.toPct(btn.getBoundingClientRect()); ctx.hand.show(r.left + r.width * .4, r.top + r.height * .3); prompt = 'tekan'; continue; }
          ctx.hand.hide();
          if (!v) continue;
          // Tarik nafas: perut mengembang, cincin penuh, Sayf mengira 1..hold.
          dragonEl.style.setProperty('--t', `${hold}s`);
          dragonEl.classList.add('full');
          setRing(1, hold * 1000);
          let ok = true;
          for (let k = 1; k <= hold; k++) {
            say(`n${k}`);
            const r = await waitChange(1000);
            ctx.alive();
            if (r === false) { ok = false; break; }
          }
          if (!ok) {
            early++;
            dragonEl.style.setProperty('--t', '.5s');
            dragonEl.classList.remove('full'); setRing(0);
            sfx.soft();
            prompt = 'awal';
            continue;
          }
          break;
        }
        // Tahan cukup lama: hembus.
        armed = false; btn.setAttribute('aria-disabled', 'true'); label.textContent = 'Lepas';
        sfx.light();
        const d = say('breath-out');
        if (pressed) await waitChange(4000);
        ctx.alive();
        pressed = false; btn.classList.remove('hold');
        dragonEl.style.setProperty('--t', `${hold + 1}s`);
        dragonEl.classList.remove('full');
        setRing(0, (hold + 1) * 1000);
        bubbles();
        setColor((i + 1) / BREATHS);
        await ctx.wait(Math.max((hold + 1) * 1000, d + 200));
        ctx.mark(i);
      }
    } finally {
      ctl.abort(); ctx.signal.removeEventListener('abort', onAbort);
      btn.disabled = true; btn.classList.remove('hold'); ctx.hand.hide();
    }
    faceEl.innerHTML = FACE.tenang;
    sfx.good();
    await ctx.wait(Math.max(2200, say('tenang') + 300));
    delete stage.dataset.hold;

    if (early === 0) state.level = Math.min(MAX_LEVEL, level + 1);
    else if (early >= 3) state.level = Math.max(1, level - 1);
    return {
      record: { level, hold, emo, early, breaths: BREATHS },
      foundHtml: '',
      text: `Adik bantu naga bertenang dengan <span class="big-num">${BREATHS}</span> tarikan nafas ${hold} saat!`,
    };
  },

  parent: {
    stats(s) {
      const last = s.rounds.slice(-7);
      const steady = pct(last.filter((r) => !r.early).length, last.length);
      const best = s.rounds.reduce((m, r) => (!r.early ? Math.max(m, r.hold || 0) : m), 0);
      return [
        { v: steady === null ? '–' : steady + '%', label: 'Sesi tanpa lepas awal' },
        { v: best ? `${best}<small> saat</small>` : '–', label: 'Tahan nafas terpanjang' },
        { v: `${s.level}<small>/${MAX_LEVEL}</small>`, label: 'Tahap' },
      ];
    },
    cols: ['Perasaan naga', 'Tempoh', 'Lepas awal'],
    row: (r) => [EMO_NAME[r.emo] || '–', `${r.hold || '–'} s`, r.early || 0],
    explain: `<span><b>Regulasi emosi</b> (Kerohanian, Sikap & Nilai KSPK): pernafasan perlahan ialah strategi menenangkan diri yang paling mudah diajar kepada kanak-kanak. Menekan dan menahan butang memberi badan "sesuatu untuk dibuat" semasa menarik nafas, dan perut naga yang mengembang menjadi gambaran nafas dalam.</span>
      <span>Tempoh tahan: 3 saat (Tahap 1) hingga 6 saat (Tahap 4); hembus 1 saat lebih lama. Naik bila 3 nafas tanpa lepas awal. Gunakan juga di luar game: bila anak marah, ajak "nafas naga" bersama.</span>`,
  },

  mission: {
    title: '"Nafas Naga" bila marah',
    steps: [
      'Pada waktu tenang, berlatih bersama: tarik nafas dari hidung (perut kembang macam naga), kira 1-2-3.',
      'Hembus perlahan dari mulut seperti meniup buih sabun.',
      'Bila anak marah atau sedih nanti, bisik: <b>"Jom buat nafas naga?"</b> dan buat bersama-sama.',
      'Puji usahanya, bukan hasilnya: <b>"Adik cuba bertenang. Hebat!"</b>',
    ],
    why: 'Kenapa? Strategi yang dilatih semasa tenang lebih mudah digunakan semasa emosi memuncak. Bila ibu bapa buat bersama, anak belajar melalui contoh.',
  },
};
