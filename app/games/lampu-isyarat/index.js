// Lampu Isyarat Haiwan: kawalan diri (inhibisi), berasaskan tugasan Go/No-Go.
// Lampu hijau → tekan supaya haiwan melintas; lampu merah → tunggu, kereta lalu.
import { ART, ANIMALS, iconOf } from '../../kit/art.js';
import { pick, shuffle, pct, meter } from '../../kit/util.js';

const LEVEL_MS = [3200, 2700, 2300, 1900, 1600, 1300]; // tetingkap respons per tahap
const AGE_LEVEL = { 3: 0, 4: 1, 5: 2, 6: 3 };
const TRIALS = 12, NOGO = 3;
const LEVEL_UP_AT = 0.85, LEVEL_DOWN_AT = 0.6;
// Koleksi: 3 haiwan awal; selebihnya dibuka ikut jumlah pusingan tamat (diterbitkan daripada rounds).
const STARTER = ['kancil', 'harimau', 'gajah'];
const UNLOCKS = [{ id: 'orangutan', rounds: 1 }, { id: 'tapir', rounds: 3 }, { id: 'enggang', rounds: 5 }];
const STAR_AT = [3, 10, 25]; // bintang ikut bilangan percubaan betul dengan haiwan itu
const PRAISE_GO = ['bagus', 'pandainya', 'go3', 'go4'];
const PRAISE_WAIT = ['wait1', 'wait2', 'wait3'];

const unlockedIds = (s) => new Set([...STARTER, ...UNLOCKS.filter((u) => s.rounds.length >= u.rounds).map((u) => u.id)]);
const starsOf = (s, id) => { const n = Number(s.helped[id]) || 0; return STAR_AT.filter((t) => n >= t).length; };

const CAR_SVG = `<svg viewBox="0 0 170 86" aria-hidden="true">
  <ellipse cx="85" cy="80" rx="70" ry="5" fill="#000" opacity=".22"/>
  <path d="M44 34 C52 12 64 8 80 8 H104 C122 8 132 16 142 34 Z" fill="url(#ag-car)" stroke="#155A82" stroke-width="3" stroke-linejoin="round"/>
  <path d="M55 32 C60 18 68 15 80 15 H90 V32 Z" fill="url(#ag-glass)"/><path d="M96 15 H104 C116 15 124 20 131 32 H96 Z" fill="url(#ag-glass)"/>
  <path d="M62 30 l10 -13" stroke="#fff" stroke-width="3" opacity=".6" stroke-linecap="round"/>
  <rect x="8" y="32" width="154" height="34" rx="15" fill="url(#ag-car)" stroke="#155A82" stroke-width="3"/>
  <path d="M14 46 H156" stroke="#7CCBF0" stroke-width="2.4" opacity=".7"/>
  <rect x="146" y="39" width="12" height="8" rx="3.5" fill="#FFE68A"/><rect x="11" y="39" width="10" height="8" rx="3.5" fill="#FF6B6B"/>
  <rect x="86" y="44" width="10" height="3" rx="1.5" fill="#155A82"/>
  <circle cx="47" cy="66" r="14" fill="#1E2328"/><circle cx="47" cy="66" r="6.5" fill="#C9D1D9"/><circle cx="47" cy="66" r="2.4" fill="#6B7684"/>
  <circle cx="124" cy="66" r="14" fill="#1E2328"/><circle cx="124" cy="66" r="6.5" fill="#C9D1D9"/><circle cx="124" cy="66" r="2.4" fill="#6B7684"/></svg>`;
const PAW = (cls, cy) => `<g class="paw ${cls}" fill="#fff"><ellipse cx="30" cy="${cy + 5}" rx="6.5" ry="5"/><circle cx="22" cy="${cy - 2}" r="2.8"/><circle cx="27.2" cy="${cy - 6.3}" r="2.8"/><circle cx="32.8" cy="${cy - 6.3}" r="2.8"/><circle cx="38" cy="${cy - 2}" r="2.8"/></g>`;
const LIGHT_SVG = `<svg viewBox="0 0 60 176" aria-hidden="true">
  <rect x="25.5" y="98" width="9" height="78" rx="3" fill="#3D4650"/><rect x="25.5" y="98" width="3" height="78" fill="#57616D"/>
  <circle class="glow glow-r" cx="30" cy="30" r="30" fill="url(#ag-glow-r)"/>
  <circle class="glow glow-g" cx="30" cy="76" r="30" fill="url(#ag-glow-g)"/>
  <rect x="6" y="4" width="48" height="98" rx="14" fill="url(#ag-housing)" stroke="#161A1F" stroke-width="2.5"/>
  <path d="M10 14 q20 -10 40 0 v4 q-20 -8 -40 0 z" fill="#161A1F"/><path d="M10 60 q20 -10 40 0 v4 q-20 -8 -40 0 z" fill="#161A1F"/>
  <circle class="lamp lamp-r" cx="30" cy="30" r="16"/>${PAW('paw-r', 30)}
  <circle class="lamp lamp-g" cx="30" cy="76" r="16"/>${PAW('paw-g', 76)}</svg>`;

// No-Go tidak pada 2 percubaan pertama dan tidak berturut-turut.
function makeTrials() {
  let pos;
  do {
    pos = shuffle([...Array(TRIALS - 2).keys()].map((i) => i + 2)).slice(0, NOGO).sort((a, b) => a - b);
  } while (pos.some((p, i) => i > 0 && p - pos[i - 1] < 2));
  return Array.from({ length: TRIALS }, (_, i) => ({ go: !pos.includes(i) }));
}

function collectionHtml(s) {
  const ok = unlockedIds(s);
  return `<div class="li-coll">${ANIMALS.map((a) => {
    if (!ok.has(a.id)) return `<figure class="secret" aria-label="Haiwan rahsia">${iconOf(a.id)}<figcaption>?</figcaption></figure>`;
    const n = starsOf(s, a.id);
    return `<figure>${ART[a.id]()}<span class="stars" role="img" aria-label="${n} daripada ${STAR_AT.length} bintang"><b>${'★'.repeat(n)}</b>${'★'.repeat(STAR_AT.length - n)}</span></figure>`;
  }).join('')}</div>`;
}

export default {
  id: 'lampu-isyarat',
  title: 'Lampu Isyarat Haiwan',
  stageLabel: 'Jalan hutan. Tekan bila lampu hijau, tunggu bila lampu merah.',
  lines: {
    intro: 'Jom, kita tolong haiwan melintas jalan!',
    'prac-go': 'Lampu hijau! Tekan haiwan tu, biar dia melintas.',
    'prac-nogo': 'Lampu merah… tunggu dulu. Jangan tekan, ya.',
    go3: 'Yeay, dia dah sampai seberang!', go4: 'Terima kasih, adik!',
    wait1: 'Pandai adik tunggu!', wait2: 'Bagus, adik sabar!', wait3: 'Kereta dah lalu. Selamat!',
    miss: 'Lampu dah hijau. Tekan haiwan tu, ya!',
    oops: 'Alamak, lampu masih merah. Kita tunggu dulu, ya.',
    end: 'Syabas! Semua haiwan dah selamat melintas.',
    'baru-orangutan': 'Wah, kawan baharu! Orang utan nak ikut melintas!',
    'baru-tapir': 'Wah, kawan baharu! Tapir nak ikut melintas!',
    'baru-enggang': 'Wah, kawan baharu! Burung enggang nak ikut melintas!',
  },
  // Baris yang rakamannya sepadan dengan teks semasa. Buang kunci jika teks diubah sebelum dirakam semula.
  recorded: ['intro', 'prac-go', 'prac-nogo', 'go3', 'go4', 'wait1', 'wait2', 'wait3', 'miss', 'oops', 'end', 'baru-orangutan', 'baru-tapir', 'baru-enggang'],

  css: `.li-light { right: 2.5%; top: 25%; width: 15.5%; z-index: 3; pointer-events: none; }
.li-light svg { width: 100%; height: auto; display: block; }
.li-light .lamp-r { fill: #4A2426; }
.li-light .lamp-g { fill: #193A2B; }
.li-light .paw { opacity: .14; transition: opacity .15s; }
.li-light .glow { opacity: 0; transition: opacity .15s; }
.li-light.red .lamp-r { fill: url(#ag-lamp-r); }
.li-light.red .paw-r, .li-light.red .glow-r { opacity: 1; }
.li-light.green .lamp-g { fill: url(#ag-lamp-g); }
.li-light.green .paw-g, .li-light.green .glow-g { opacity: 1; }
.li-car { left: -40%; top: 43.5%; width: 36%; z-index: 2; pointer-events: none; }
.li-car svg { width: 100%; height: auto; display: block; }
.li-animal { left: -35%; top: 64%; width: 30%; z-index: 4; transform-origin: 50% 100%; pointer-events: none; }
.li-animal .li-bob { width: 100%; }
.li-animal svg { width: 100%; height: auto; display: block; }
.li-animal.walking .li-bob { animation: li-bob .32s ease-in-out infinite alternate; }
@keyframes li-bob { from { transform: translateY(0) rotate(-2deg); } to { transform: translateY(-5%) rotate(2deg); } }
.li-new {
  display: flex; align-items: center; gap: 12px; text-align: left;
  background: var(--kertas); color: var(--ink); border-radius: 20px; padding: 10px 18px 10px 10px;
  box-shadow: 0 6px 0 var(--kuning-tekan); border: 3px solid var(--kuning); margin-bottom: 14px;
}
.li-new svg { width: 76px; height: auto; flex: none; }
.li-new small { display: block; font-size: 12px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; color: var(--muted); }
.li-new b { font-family: var(--font-display); font-size: 24px; font-weight: 700; }
.li-coll { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 4px; width: min(100%, 360px); margin-inline: auto; }
.li-coll figure { margin: 0; display: flex; flex-direction: column; align-items: center; gap: 2px; }
.li-coll svg { width: 100%; height: auto; }
.li-coll figure.secret svg { filter: brightness(0); opacity: .3; }
.li-coll figcaption { font-family: var(--font-display); font-size: 16px; color: rgba(255, 253, 245, .7); }
.li-coll .stars { font-size: 12px; letter-spacing: 1px; line-height: 1; color: rgba(255, 253, 245, .25); white-space: nowrap; }
.li-coll .stars b { color: var(--kuning); font-weight: 400; }
@media (prefers-reduced-motion: reduce) { .li-animal.walking .li-bob { animation: none; } }`,

  stageHtml: () => `<svg class="bg" viewBox="0 0 200 300" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id="bg-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9FD8EE"/><stop offset=".7" stop-color="#D2EFE9"/><stop offset="1" stop-color="#E3F5E4"/></linearGradient>
                <radialGradient id="bg-sun"><stop offset="0" stop-color="#FFF6C8"/><stop offset=".45" stop-color="#FFE48A"/><stop offset="1" stop-color="#FFE48A" stop-opacity="0"/></radialGradient>
                <linearGradient id="bg-road" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3A4350"/><stop offset="1" stop-color="#454F5D"/></linearGradient>
                <linearGradient id="bg-grass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7CC879"/><stop offset="1" stop-color="#5EAE62"/></linearGradient>
                <linearGradient id="bg-haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7DB996"/><stop offset="1" stop-color="#5E9F7A"/></linearGradient>
                <pattern id="bg-kerb" width="16" height="7" patternUnits="userSpaceOnUse"><rect width="8" height="7" fill="#F4F2EA"/><rect x="8" width="8" height="7" fill="#22262B"/></pattern>
              </defs>
              <rect width="200" height="115" fill="url(#bg-sky)"/>
              <circle cx="160" cy="24" r="22" fill="url(#bg-sun)"/>
              <g fill="#FFFFFF" opacity=".85">
                <path d="M22 30 a7 7 0 0 1 12 -4 a8 8 0 0 1 14 3 a5 5 0 0 1 1 10 h-27 a5 5 0 0 1 0 -9z"/>
                <path d="M104 18 a5 5 0 0 1 9 -3 a6 6 0 0 1 11 2 a4 4 0 0 1 1 8 h-21 a4 4 0 0 1 0 -7z" opacity=".8"/>
              </g>
              <path d="M0 64 C20 50 34 52 50 60 C66 46 86 44 104 56 C122 44 146 44 162 56 C176 50 190 52 200 58 V110 H0Z" fill="#A9D5BC" opacity=".9"/>
              <path d="M0 76 C18 64 36 66 54 74 C74 62 96 62 114 72 C134 62 160 62 178 72 C186 68 194 68 200 70 V110 H0Z" fill="url(#bg-haze)"/>
              <g>
                <rect x="27" y="40" width="5" height="70" fill="#6B4A2E"/>
                <ellipse cx="29.5" cy="40" rx="22" ry="10" fill="#2E7A4C"/><ellipse cx="24" cy="36" rx="12" ry="6" fill="#3E9660"/>
                <ellipse cx="38" cy="45" rx="13" ry="6" fill="#2A6E45"/>
              </g>
              <g>
                <g fill="#2C744A"><circle cx="8" cy="88" r="15"/><circle cx="52" cy="84" r="16"/><circle cx="78" cy="90" r="13"/><circle cx="124" cy="86" r="15"/><circle cx="150" cy="82" r="17"/><circle cx="188" cy="88" r="15"/></g>
                <g fill="#3B8F5B"><circle cx="5" cy="83" r="9"/><circle cx="48" cy="78" r="10"/><circle cx="75" cy="85" r="8"/><circle cx="120" cy="80" r="9"/><circle cx="145" cy="76" r="10"/><circle cx="184" cy="83" r="9"/></g>
                <g fill="#2A6A44"><circle cx="30" cy="98" r="13"/><circle cx="64" cy="100" r="11"/><circle cx="100" cy="96" r="14"/><circle cx="136" cy="99" r="12"/><circle cx="170" cy="98" r="13"/></g>
                <g fill="#47A066"><circle cx="26" cy="94" r="7"/><circle cx="96" cy="91" r="8"/><circle cx="166" cy="93" r="7"/></g>
                <path d="M88 108 q2 -8 12 -8 q10 0 12 8z" fill="#C9A86A" opacity=".9"/>
              </g>
              <rect y="107" width="200" height="7" fill="url(#bg-kerb)"/>
              <rect y="113.5" width="200" height="1" fill="#000" opacity=".25"/>
              <rect y="114" width="200" height="72" fill="url(#bg-road)"/>
              <rect y="117" width="200" height="1.6" fill="#F5C842"/><rect y="182" width="200" height="1.6" fill="#F5C842"/>
              <g fill="#F2F2EA" opacity=".92">
                <rect x="4" y="149" width="14" height="2.4" rx="1"/><rect x="26" y="149" width="14" height="2.4" rx="1"/><rect x="48" y="149" width="12" height="2.4" rx="1"/>
                <rect x="140" y="149" width="12" height="2.4" rx="1"/><rect x="160" y="149" width="14" height="2.4" rx="1"/><rect x="182" y="149" width="14" height="2.4" rx="1"/>
              </g>
              <g fill="#F7F7F0">
                <rect x="69" y="121" width="6.5" height="58" rx="1.2"/><rect x="79.5" y="121" width="6.5" height="58" rx="1.2"/><rect x="90" y="121" width="6.5" height="58" rx="1.2"/>
                <rect x="100.5" y="121" width="6.5" height="58" rx="1.2"/><rect x="111" y="121" width="6.5" height="58" rx="1.2"/><rect x="121.5" y="121" width="6.5" height="58" rx="1.2"/>
              </g>
              <rect y="186" width="200" height="7" fill="url(#bg-kerb)"/>
              <rect y="192.5" width="200" height="1.2" fill="#000" opacity=".18"/>
              <rect y="193.5" width="200" height="106.5" fill="url(#bg-grass)"/>
              <g fill="#8ED48A" opacity=".8"><ellipse cx="30" cy="232" rx="26" ry="7"/><ellipse cx="172" cy="252" rx="30" ry="8"/><ellipse cx="98" cy="288" rx="44" ry="9"/></g>
              <g fill="#4E9B57">
                <path d="M0 300 C4 280 12 268 26 262 C18 274 14 286 14 300Z"/><path d="M8 300 C14 286 24 278 38 276 C28 284 22 292 22 300Z" fill="#5BAA60"/>
                <path d="M200 300 C196 280 188 268 174 262 C182 274 186 286 186 300Z"/><path d="M192 300 C186 286 176 278 162 276 C172 284 178 292 178 300Z" fill="#5BAA60"/>
              </g>
              <g><circle cx="46" cy="262" r="3" fill="#F5B82E"/><circle cx="46" cy="262" r="1.2" fill="#FFF3C4"/>
                <circle cx="150" cy="216" r="3" fill="#F06A9A"/><circle cx="150" cy="216" r="1.2" fill="#FFE1EC"/>
                <circle cx="164" cy="282" r="3" fill="#F5B82E"/><circle cx="164" cy="282" r="1.2" fill="#FFF3C4"/>
                <circle cx="24" cy="212" r="2.6" fill="#F06A9A"/><circle cx="24" cy="212" r="1" fill="#FFE1EC"/>
                <circle cx="120" cy="296" r="2.6" fill="#FFFFFF"/><circle cx="120" cy="296" r="1" fill="#F5B82E"/></g>
              <g transform="translate(16 196)">
                <rect x="9" y="22" width="3" height="40" rx="1.2" fill="#8C96A1"/>
                <rect x="0" y="1" width="21" height="21" rx="3" transform="rotate(45 10.5 11.5)" fill="#F7C62F" stroke="#1C1C1C" stroke-width="1.6"/>
                <g fill="#1C1C1C"><ellipse cx="9.6" cy="12.6" rx="4.6" ry="3.1"/><circle cx="14.4" cy="10.6" r="2.7"/><path d="M16.4 11.2 q1.6 2.2 .6 4.6" stroke="#1C1C1C" stroke-width="1.3" fill="none" stroke-linecap="round"/><ellipse cx="13.2" cy="10.8" rx="1.5" ry="2" fill="#F7C62F" opacity=".55"/><rect x="5.9" y="14" width="1.6" height="3.4" rx=".5"/><rect x="8.4" y="14" width="1.6" height="3.4" rx=".5"/><rect x="10.9" y="14" width="1.6" height="3.4" rx=".5"/><rect x="12.9" y="13.6" width="1.6" height="3.8" rx=".5"/><path d="M5.2 11.6 q-1.2 1 -.8 2.6" stroke="#1C1C1C" stroke-width=".7" fill="none"/></g>
              </g>
            </svg>
    <div class="li-car" aria-hidden="true">${CAR_SVG}</div>
    <div class="li-light off" aria-hidden="true">${LIGHT_SVG}</div>
    <div class="li-animal" aria-hidden="true"><div class="li-bob"></div></div>`,

  initState: (age) => ({ age, level: AGE_LEVEL[age], helped: {}, rounds: [] }),
  normalize(s, age) {
    if (s.age !== age) { s.age = age; s.level = AGE_LEVEL[age]; }
    if (!Number.isInteger(s.level) || s.level < 0 || s.level >= LEVEL_MS.length) s.level = AGE_LEVEL[age];
    if (!s.helped || typeof s.helped !== 'object' || Array.isArray(s.helped)) s.helped = {};
    return s;
  },

  async round(ctx) {
    const { stage, state, say, sfx, anim } = ctx;
    const q = (sel) => stage.querySelector(sel);
    const animal = q('.li-animal'), bob = q('.li-bob'), car = q('.li-car'), light = q('.li-light');
    const ok = unlockedIds(state);
    let queue = [];
    const next = () => { if (!queue.length) queue = shuffle(ANIMALS.filter((a) => ok.has(a.id))); return queue.pop(); };
    const setLight = (st) => { light.className = 'li-light ' + st; };
    const reset = (a) => {
      animal.getAnimations().forEach((x) => x.cancel());
      bob.innerHTML = ART[a.id]();
      Object.assign(animal.style, { left: '-35%', top: '64%', transform: 'scale(1)', opacity: '1' });
    };
    const enter = async () => {
      animal.classList.add('walking');
      await anim(animal, [{ left: '-35%', top: '64%' }, { left: '35%', top: '64%' }], { duration: 900, easing: 'ease-out' });
      animal.classList.remove('walking');
    };
    const cross = async () => {
      animal.classList.add('walking');
      await anim(animal, [
        { left: '35%', top: '64%', transform: 'scale(1)', opacity: 1 },
        { left: '35%', top: '23.5%', transform: 'scale(.62)', opacity: 1, offset: .85 },
        { left: '35%', top: '21%', transform: 'scale(.58)', opacity: 0 },
      ], { duration: 1300 });
      animal.classList.remove('walking');
    };
    const shake = () => anim(bob, [{ transform: 'translateX(0)' }, { transform: 'translateX(-6%) rotate(-4deg)' }, { transform: 'translateX(6%) rotate(4deg)' }, { transform: 'translateX(-3%)' }, { transform: 'translateX(0)' }], { duration: 480, fill: 'none' });
    const carPass = (ms) => {
      car.getAnimations().forEach((x) => x.cancel());
      sfx.car(ms / 1000);
      return anim(car, [{ left: '-40%' }, { left: '110%' }], { duration: ms, easing: 'linear' });
    };
    const tapWithin = (ms) => ctx.tap({ event: 'pointerdown', keys: ['Space', 'Enter'], ms });

    async function trial(tr, practice) {
      const who = next();
      reset(who); setLight('off');
      await enter(); ctx.alive();
      if (practice) say(tr.go ? 'prac-go' : 'prac-nogo');
      await ctx.wait(300);
      setLight(tr.go ? 'green' : 'red'); sfx.light();
      const W = practice ? (tr.go ? 8000 : 3200) : LEVEL_MS[state.level];
      const carP = tr.go ? null : carPass(Math.max(1200, Math.round(W * .9)));
      if (practice && tr.go) ctx.hand.show(54, 74);
      const t0 = performance.now();
      const r = await tapWithin(W);
      ctx.hand.hide();
      const rec = { go: tr.go, tapped: !!r, rt: r ? Math.round(r.t - t0) : null, animal: who.id };
      rec.correct = tr.go ? rec.tapped : !rec.tapped;
      if (tr.go) {
        if (rec.tapped) { sfx.good(); say(pick(PRAISE_GO)); await cross(); }
        else {
          say('miss'); ctx.hand.show(54, 74);
          await tapWithin(3000);
          ctx.hand.hide(); sfx.pop(); await cross();
        }
      } else {
        if (rec.tapped) { sfx.soft(); say('oops'); await shake(); }
        if (carP) await carP;
        ctx.alive();
        if (!rec.tapped) { sfx.good(); say(pick(PRAISE_WAIT)); }
        setLight('green'); sfx.light();
        await ctx.wait(350);
        await cross();
      }
      ctx.alive();
      return rec;
    }

    ctx.progress(TRIALS);
    setLight('off'); reset(next()); animal.style.opacity = '0';
    await ctx.ready(); ctx.alive();
    if (ctx.first) {
      await ctx.wait(Math.max(1700, say('intro') + 200));
      await trial({ go: true }, true);
      await trial({ go: false }, true);
      await ctx.wait(Math.max(1600, say('start') + 200));
    }
    const recs = [];
    const trials = makeTrials();
    for (let i = 0; i < trials.length; i++) {
      recs.push(await trial(trials[i], false));
      ctx.mark(i);
      await ctx.wait(250);
    }

    // Keputusan, tahap, koleksi.
    const go = recs.filter((r) => r.go), nogo = recs.filter((r) => !r.go);
    const goHit = go.filter((r) => r.tapped).length;
    const nogoHold = nogo.filter((r) => !r.tapped).length;
    const rts = go.filter((r) => r.tapped).map((r) => r.rt);
    const rtAvg = rts.length ? Math.round(rts.reduce((a, b) => a + b, 0) / rts.length) : null;
    const acc = (goHit + nogoHold) / recs.length;
    const levelPlayed = state.level;
    if (acc >= LEVEL_UP_AT) state.level = Math.min(LEVEL_MS.length - 1, state.level + 1);
    else if (acc < LEVEL_DOWN_AT) state.level = Math.max(0, state.level - 1);
    recs.forEach((r) => { if (r.correct) state.helped[r.animal] = (Number(state.helped[r.animal]) || 0) + 1; });
    // Shell menambah pusingan ini ke rounds selepas round() selesai, jadi kira buka kunci dengan +1.
    const after = new Set([...STARTER, ...UNLOCKS.filter((u) => state.rounds.length + 1 >= u.rounds).map((u) => u.id)]);
    const fresh = ANIMALS.find((a) => after.has(a.id) && !ok.has(a.id));
    const collState = { ...state, rounds: [...state.rounds, null] };

    return {
      record: { level: levelPlayed, goHit, goN: go.length, nogoHold, nogoN: nogo.length, rtAvg },
      extraHtml: (fresh ? `<div class="li-new">${ART[fresh.id]()}<div><small>Kawan baharu!</small><b>${fresh.name}</b></div></div>` : '') + collectionHtml(collState),
      text: `Adik tolong <span class="big-num">${recs.length}</span> haiwan melintas, dan sabar <span class="big-num">${nogoHold}</span> kali masa lampu merah.`,
      followUp: fresh ? 'baru-' + fresh.id : null,
      onShow(root) {
        const nf = root.querySelector('.li-new');
        if (nf) anim(nf, [{ transform: 'scale(.4)', opacity: 0 }, { transform: 'scale(1.08)', opacity: 1, offset: .7 }, { transform: 'scale(1)', opacity: 1 }], { duration: 600, delay: 400, fill: 'backwards' });
      },
    };
  },

  parent: {
    stats(s) {
      const last = s.rounds.slice(-7);
      const sum = (k) => last.reduce((a, r) => a + (r[k] || 0), 0);
      const goP = pct(sum('goHit'), sum('goN')), waitP = pct(sum('nogoHold'), sum('nogoN'));
      return [
        { v: goP === null ? '–' : goP + '%', label: 'Tekan tepat' },
        { v: waitP === null ? '–' : waitP + '%', label: 'Sabar' },
        { v: `${s.level + 1}<small>/${LEVEL_MS.length}</small>`, label: 'Tahap kelajuan' },
      ];
    },
    cols: ['Tahap', 'Tekan tepat', 'Sabar', 'Reaksi'],
    row: (r) => [r.level + 1, meter(pct(r.goHit, r.goN)), meter(pct(r.nogoHold, r.nogoN)), r.rtAvg ? (r.rtAvg / 1000).toFixed(2) + ' s' : '–'],
    explain: `<span><b>Tekan tepat</b>: anak tekan bila lampu hijau (tumpuan). <b>Sabar</b>: anak tak tekan bila lampu merah (kawalan diri). Berasaskan tugasan <i>Go/No-Go</i> yang digunakan penyelidik untuk mengukur kawalan diri kanak-kanak.</span>
      <span>Tahap kelajuan naik bila anak betul 85% atau lebih, dan turun bila bawah 60%. <b>Koleksi</b>: haiwan baharu dibuka selepas pusingan ke-1, 3 dan 5; bintang diberi bila anak betul dengan haiwan itu 3, 10 dan 25 kali. Tiada streak, tiada apa-apa yang hilang.</span>`,
  },

  mission: {
    title: 'Main "Lampu Isyarat" di rumah',
    steps: [
      'Ibu atau ayah sebut <b>"HIJAU!"</b>: anak berjalan atau melompat macam kancil.',
      'Sebut <b>"MERAH!"</b>: anak berhenti dan jadi patung.',
      'Sebut cepat dan perlahan bersilih ganti. Sesekali sebut "Merah" dua kali berturut-turut.',
      'Bergilir-gilir: biar anak pula jadi lampu isyarat.',
    ],
    why: 'Kenapa? Kanak-kanak bawah 6 tahun belajar lebih baik bila kemahiran dari skrin diulang di dunia sebenar. Permainan ini melatih kawalan diri, iaitu kemahiran menahan diri sebelum bertindak.',
  },
};
