// Gendang Berhenti: kawalan diri (inhibisi motor), versi "patung cendana". Bila muzik main, pukul kompang;
// bila muzik berhenti, BERHENTI serta-merta. Anak mesti menahan tangan yang sedang laju memukul.
// Tahap 1: Hafiz sebut "Berhenti!" dan kompang malap · Tahap 2: kompang malap sahaja · Tahap 3: muzik sahaja
// · Tahap 4: muzik lebih laju, hentian lebih kerap, dan muzik kadang-kadang perlahan seketika (umpan) tanpa berhenti.
import { pct, meter } from '../../kit/util.js';

const STOPS = 6;
const GRACE_MS = 400;           // tekanan sejurus selepas muzik berhenti masih dimaafkan
// play = julat masa muzik (ms) · quiet = masa senyap · say = Hafiz sebut "Berhenti!" · dim = kompang malap · tempo = saat/not · lure = muzik perlahan seketika
const LEVELS = [null,
  { play: [3000, 5000], quiet: 3200, say: true, dim: true, tempo: .26 },
  { play: [2500, 4500], quiet: 3000, say: false, dim: true, tempo: .24 },
  { play: [2200, 4200], quiet: 2800, say: false, dim: false, tempo: .22 },
  { play: [1600, 3600], quiet: 2600, say: false, dim: false, tempo: .18, lure: true },
];
const MAX_LEVEL = 4;
const AGE_LEVEL = { 3: 1, 4: 1, 5: 2, 6: 3 };
const UP_AT = 5, DOWN_AT = 3;
const rnd = ([a, b]) => a + Math.random() * (b - a);

// Muzik pentatonik ringkas yang boleh dihentikan serta-merta. Tanpa audio (senyap / tiada AudioContext): muzik "bisu",
// tetapi not muzik di radio tetap bergerak sebagai petanda visual.
function makeMusic(mix) {
  const NOTES = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];
  let bus = null, timer = null, next = 0, step = 0, idx = 2;
  const note = (t, f, dur, type, g) => {
    const { ac } = mix, o = ac.createOscillator(), v = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    v.gain.setValueAtTime(.0001, t); v.gain.exponentialRampToValueAtTime(g, t + .015); v.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(v); v.connect(bus); o.start(t); o.stop(t + dur + .05);
  };
  return {
    start(tempo) {
      if (!mix) return;
      const { ac, out } = mix;
      bus = ac.createGain(); bus.gain.value = .9; bus.connect(out);
      next = ac.currentTime + .05;
      timer = setInterval(() => {
        while (bus && next < ac.currentTime + .25) {
          idx = Math.max(0, Math.min(NOTES.length - 1, idx + [-1, 1, 1, -1, 2, -2, 0][Math.floor(Math.random() * 7)]));
          note(next, NOTES[idx], tempo * .9, 'triangle', .11);
          if (step % 2 === 0) note(next, NOTES[idx] / 4, tempo * 1.7, 'sine', .16);
          step++; next += tempo;
        }
      }, 60);
    },
    stop() {
      clearInterval(timer); timer = null;
      if (bus && mix) { const b = bus; b.gain.setTargetAtTime(0, mix.ac.currentTime, .015); setTimeout(() => b.disconnect(), 300); }
      bus = null;
    },
    dip() { if (bus && mix) { const b = bus; b.gain.setTargetAtTime(.2, mix.ac.currentTime, .05); setTimeout(() => { if (bus === b) b.gain.setTargetAtTime(.9, mix.ac.currentTime, .08); }, 900); } },
  };
}
function drum(mix) {
  if (!mix) return;
  const { ac, out } = mix, t = ac.currentTime;
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = 'sine'; o.frequency.setValueAtTime(180, t); o.frequency.exponentialRampToValueAtTime(70, t + .18);
  g.gain.setValueAtTime(.5, t); g.gain.exponentialRampToValueAtTime(.0001, t + .25);
  o.connect(g); g.connect(out); o.start(t); o.stop(t + .3);
  const len = Math.floor(ac.sampleRate * .04), buf = ac.createBuffer(1, len, ac.sampleRate), ch = buf.getChannelData(0);
  for (let i = 0; i < len; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const n = ac.createBufferSource(), ng = ac.createGain(); n.buffer = buf; ng.gain.value = .25; n.connect(ng); ng.connect(out); n.start(t);
}

export default {
  id: 'gendang-berhenti',
  title: 'Gendang Berhenti',
  stageLabel: 'Kompang besar dan radio. Tekan kompang bila muzik main; berhenti bila muzik berhenti.',
  lines: {
    intro: 'Bila muzik main, pukul kompang! Bila muzik berhenti, berhenti!',
    mula: 'Sedia... mula!', berhenti: 'Berhenti!', tahan: 'Shh... tunggu muzik, ya.',
  },
  recorded: ['intro', 'mula', 'berhenti', 'tahan'],

  css: `.gb-radio { left: 34%; width: 32%; top: 11%; aspect-ratio: 1.3; z-index: 2; }
.gb-radio svg { width: 100%; height: 100%; display: block; overflow: visible; }
.gb-notes { left: 30%; width: 40%; top: 5%; height: 14%; z-index: 2; pointer-events: none; }
.gb-notes i { position: absolute; bottom: 0; font: 700 calc(var(--u) * 7)/1 Fredoka, sans-serif; color: #FFFDF5; opacity: 0; font-style: normal; }
.stage.gb-playing .gb-notes i { animation: gb-note 1.2s linear infinite; }
.gb-notes i:nth-child(2) { left: 40%; animation-delay: -.4s !important; } .gb-notes i:nth-child(3) { left: 80%; animation-delay: -.8s !important; }
@keyframes gb-note { 0% { transform: translateY(0); opacity: 0; } 20% { opacity: 1; } 100% { transform: translateY(-120%) rotate(12deg); opacity: 0; } }
.gb-kompang { left: 14%; width: 72%; top: 40%; aspect-ratio: 1; z-index: 3; padding: 0; border-radius: 50%; touch-action: manipulation; transition: filter .25s, transform .08s; }
.gb-kompang svg { width: 100%; height: 100%; display: block; }
.gb-kompang:active { transform: scale(.97); }
.gb-kompang.dim { filter: grayscale(.8) brightness(.6); }
.gb-ripple { position: absolute; left: 50%; top: 50%; width: 60%; aspect-ratio: 1; border-radius: 50%; border: calc(var(--u) * 1) solid rgba(255,255,255,.8); transform: translate(-50%, -50%) scale(.3); opacity: 0; pointer-events: none; animation: gb-ripple .45s ease-out; }
@keyframes gb-ripple { 0% { opacity: 1; } 100% { transform: translate(-50%, -50%) scale(1.3); opacity: 0; } }
.gb-oops { left: 0; right: 0; top: 33%; z-index: 4; text-align: center; font: 700 calc(var(--u) * 6)/1 Fredoka, sans-serif; color: #FFD27A; opacity: 0; transition: opacity .2s; }
.gb-oops.on { opacity: 1; }
@media (prefers-reduced-motion: reduce) { .stage.gb-playing .gb-notes i { animation: none; opacity: 1; } .gb-ripple { animation: none; } }`,

  stageHtml: () => `<svg class="bg" viewBox="0 0 200 300" preserveAspectRatio="none" aria-hidden="true">
      <rect width="200" height="300" fill="#6B3FA0"/><rect y="0" width="200" height="110" fill="#7B4FC9"/>
      <g fill="#F5B82E" opacity=".5">${[[16, 20], [180, 36], [24, 96], [176, 104]].map(([x, y]) => `<path d="M${x} ${y - 5} l1.6 3.4 3.4 1.6 -3.4 1.6 -1.6 3.4 -1.6 -3.4 -3.4 -1.6 3.4 -1.6 z"/>`).join('')}</g>
      <rect y="250" width="200" height="50" fill="#5A3388"/>
    </svg>
    <div class="gb-notes" aria-hidden="true"><i>♪</i><i>♫</i><i>♪</i></div>
    <div class="gb-radio" aria-hidden="true"><svg viewBox="0 0 130 100">
      <path d="M30 22 L80 4" stroke="#2B2F36" stroke-width="3" stroke-linecap="round"/>
      <rect x="6" y="22" width="118" height="72" rx="12" fill="#E5484D" stroke="#8E1F22" stroke-width="3"/>
      <circle cx="40" cy="58" r="24" fill="#2B2F36"/><circle cx="40" cy="58" r="14" fill="#4A4F57"/><circle cx="40" cy="58" r="5" fill="#2B2F36"/>
      <rect x="74" y="36" width="40" height="16" rx="3" fill="#FFF3CF"/><circle cx="84" cy="74" r="7" fill="#F5B82E"/><circle cx="104" cy="74" r="7" fill="#F5B82E"/>
    </svg></div>
    <div class="gb-oops" aria-live="polite"></div>
    <button class="gb-kompang" type="button" aria-label="Kompang: tekan untuk pukul" disabled><svg viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r="48" fill="#8A5A2E" stroke="#4E2E12" stroke-width="2"/>
      <circle cx="50" cy="50" r="41" fill="#F3DDB0" stroke="#C9A46E" stroke-width="2"/>
      <circle cx="50" cy="50" r="30" fill="none" stroke="#E2C48E" stroke-width="1.5"/>
      <g fill="#F5B82E" stroke="#8A5A1E" stroke-width=".8">${Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6; return `<circle cx="${(50 + 44.5 * Math.cos(a)).toFixed(1)}" cy="${(50 + 44.5 * Math.sin(a)).toFixed(1)}" r="2.2"/>`; }).join('')}</g>
    </svg></button>`,

  initState: (age) => ({ age, level: AGE_LEVEL[age], rounds: [] }),
  normalize(s, age) {
    if (s.age !== age) { s.age = age; s.level = AGE_LEVEL[age]; }
    if (!Number.isInteger(s.level) || s.level < 1 || s.level > MAX_LEVEL) s.level = AGE_LEVEL[age];
    return s;
  },

  async round(ctx) {
    const { stage, state, say, sfx } = ctx;
    const btn = stage.querySelector('.gb-kompang'), oops = stage.querySelector('.gb-oops');
    const level = state.level, L = LEVELS[level];
    const mix = ctx.mixer ? ctx.mixer() : null;
    const music = makeMusic(mix);

    // Rekod setiap pukulan (masa) — dinilai ikut tetingkap main / senyap.
    const hits = [];
    const ctl = new AbortController();
    btn.addEventListener('pointerdown', (e) => {
      if (btn.disabled) return;
      e.preventDefault();
      hits.push(performance.now());
      drum(mix);
      const r = document.createElement('span'); r.className = 'gb-ripple'; btn.appendChild(r); setTimeout(() => r.remove(), 500);
    }, { signal: ctl.signal });
    btn.addEventListener('keydown', (e) => { if ((e.code === 'Space' || e.code === 'Enter') && !e.repeat) { e.preventDefault(); btn.dispatchEvent(new PointerEvent('pointerdown')); } }, { signal: ctl.signal });
    const onAbort = () => { music.stop(); ctl.abort(); stage.classList.remove('gb-playing'); };
    ctx.signal.addEventListener('abort', onAbort);
    const countIn = (a, b) => hits.filter((t) => t >= a && t < b).length;

    const recs = [];
    let warned = false;
    try {
      ctx.progress(STOPS);
      await ctx.ready(); ctx.alive();
      if (ctx.first) await ctx.wait(Math.max(4800, say('intro') + 300));
      btn.disabled = false;
      if (ctx.first && level === 1) { const r = ctx.toPct(btn.getBoundingClientRect()); ctx.hand.show(r.left + r.width * .45, r.top + r.width * .4); }
      await ctx.wait(Math.max(1600, say('mula') + 150));
      for (let i = 0; i < STOPS; i++) {
        // Muzik main.
        btn.classList.remove('dim'); oops.classList.remove('on');
        stage.classList.add('gb-playing');
        music.start(L.tempo);
        const playMs = rnd(L.play), t0 = performance.now();
        stage.dataset.phase = 'main'; // untuk ujian automatik
        if (L.lure && Math.random() < .5) { await ctx.wait(playMs * .45); music.dip(); await ctx.wait(playMs * .55); } else await ctx.wait(playMs);
        ctx.hand.hide();
        const played = countIn(t0, performance.now());
        // Muzik berhenti.
        music.stop();
        stage.classList.remove('gb-playing');
        stage.dataset.phase = 'senyap';
        const tStop = performance.now();
        if (L.dim) btn.classList.add('dim');
        if (L.say) say('berhenti');
        await ctx.wait(L.quiet);
        const slips = countIn(tStop + GRACE_MS, performance.now());
        if (slips) {
          sfx.soft();
          oops.textContent = 'Eh, muzik dah berhenti!'; oops.classList.add('on');
          if (!warned) { warned = true; await ctx.wait(Math.max(1500, say('tahan') + 150)); }
          else await ctx.wait(700);
        } else { sfx.light(); }
        recs.push({ slips, played });
        ctx.mark(i);
      }
    } finally {
      music.stop(); ctl.abort(); ctx.signal.removeEventListener('abort', onAbort);
      stage.classList.remove('gb-playing'); btn.disabled = true; delete stage.dataset.phase; ctx.hand.hide();
    }
    const clean = recs.filter((r) => r.slips === 0).length;
    const joined = recs.filter((r) => r.played > 0).length;
    sfx.good();
    if (clean >= UP_AT) state.level = Math.min(MAX_LEVEL, level + 1);
    else if (clean <= DOWN_AT) state.level = Math.max(1, level - 1);
    return {
      record: { level, clean, n: recs.length, joined, slips: recs.reduce((a, r) => a + r.slips, 0) },
      foundHtml: '',
      text: `Adik berhenti tepat pada masanya <span class="big-num">${clean}</span> daripada ${recs.length} kali!` + (joined < recs.length / 2 ? ' Lain kali pukul kompang kuat-kuat bila muzik main!' : ''),
    };
  },

  parent: {
    stats(s) {
      const last = s.rounds.slice(-7);
      const okP = pct(last.reduce((a, r) => a + (r.clean || 0), 0), last.reduce((a, r) => a + (r.n || 0), 0));
      const joinP = pct(last.reduce((a, r) => a + (r.joined || 0), 0), last.reduce((a, r) => a + (r.n || 0), 0));
      return [
        { v: okP === null ? '–' : okP + '%', label: 'Berhenti tepat' },
        { v: joinP === null ? '–' : joinP + '%', label: 'Ikut main bila muzik' },
        { v: `${s.level}<small>/${MAX_LEVEL}</small>`, label: 'Tahap' },
      ];
    },
    cols: ['Tahap', 'Berhenti tepat', 'Terlepas'],
    row: (r) => [r.level, meter(pct(r.clean, r.n)), r.slips || 0],
    explain: `<span><b>Kawalan diri (inhibisi motor)</b>: menghentikan pergerakan yang sedang laju bila isyarat berubah, sama seperti permainan "patung cendana" atau "freeze dance". Ini lebih sukar daripada tidak bermula langsung, kerana badan sudah dalam rentak.</span>
      <span>Tahap 1: Hafiz sebut "Berhenti!" dan kompang malap · Tahap 2: kompang malap sahaja · Tahap 3: muzik sahaja · Tahap 4: muzik lebih laju dan kadang-kadang perlahan seketika tanpa berhenti. Pukulan dalam 0.4 saat pertama selepas muzik berhenti dimaafkan. Naik bila 5/6 hentian tepat.</span>`,
  },

  mission: {
    title: 'Main "Patung Cendana" di rumah',
    steps: [
      'Pasang lagu kegemaran anak. Bila lagu main, menari atau ketuk periuk dengan sudu kayu.',
      'Hentikan lagu tiba-tiba: <b>"Patung!"</b> Semua mesti kaku.',
      'Bila dah pandai, hentikan tanpa sebut apa-apa, hanya muzik berhenti.',
      'Tukar peranan: biar anak yang kawal muzik.',
    ],
    why: 'Kenapa? Menahan badan yang sedang bergerak melatih "brek" dalam otak, kemahiran yang sama diperlukan untuk menunggu giliran dan tidak menyampuk.',
  },
};
