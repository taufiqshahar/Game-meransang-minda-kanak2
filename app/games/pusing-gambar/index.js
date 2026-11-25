// Pusing Gambar: visual-ruang (orientasi + putaran mental). Bayang di atas menunjukkan kedudukan sasaran.
// Tahap 1–2: butang ↺ / ↻ memusingkan gambar 90° sehingga sama dengan bayang; "tepat" = memilih arah yang paling dekat
// · Tahap 3: pilih gambar yang sudah dipusing sama (pusing dalam kepala) · Tahap 4: pilihan termasuk imej CERMIN, jadi
// anak mesti membezakan "dipusing" daripada "diterbalikkan", kemahiran asas membezakan b/d dan p/q.
import { VEHICLES, vehicleIcon } from '../../kit/vehicles.js';
import { bendaIcon } from '../../kit/benda.js';
import { pick, shuffle, pct, meter } from '../../kit/util.js';

// Benda yang jelas tidak simetri (supaya setiap putaran berbeza).
const ITEMS = [
  ...VEHICLES.map((v) => ({ id: v.id, name: v.name, svg: () => vehicleIcon(v.id) })),
  { id: 'kunci', name: 'Kunci', svg: () => bendaIcon('kunci') },
  { id: 'itik', name: 'Itik', svg: () => bendaIcon('itik') },
  { id: 'sudu', name: 'Sudu', svg: () => bendaIcon('sudu') },
];
const ANG = [90, 180, 270];
// mode: 'putar' (tekan untuk pusing) atau 'pilih' · start = sudut awal yang dibenarkan · opts / mirror untuk mod pilih
const LEVELS = [null,
  { mode: 'putar', start: [90, 270] },
  { mode: 'putar', start: [90, 180, 270] },
  { mode: 'pilih', opts: 3, mirror: false },
  { mode: 'pilih', opts: 3, mirror: true },
];
const MAX_LEVEL = 4;
const AGE_LEVEL = { 3: 1, 4: 1, 5: 2, 6: 3 };
const TRIALS = 6, UP_AT = 5, DOWN_AT = 3;
const IDLE_MS = 10000;
const tf = (deg, flip) => `rotate(${deg}deg)${flip ? ' scaleX(-1)' : ''}`;

export default {
  id: 'pusing-gambar',
  title: 'Pusing Gambar',
  stageLabel: 'Bayang di atas dan gambar di bawah. Pusingkan gambar dengan butang kiri atau kanan, atau pilih gambar, supaya sama dengan bayang.',
  lines: { intro: 'Pusingkan gambar sampai sama dengan bayang!', pilih: 'Mana yang sama bila dipusing?', sama: 'Sama!' },
  recorded: ['intro', 'pilih', 'sama'],

  css: `.pg-target { left: 25%; width: 50%; top: 11%; aspect-ratio: 1; z-index: 2; border-radius: 50%; background: rgba(255,253,245,.55); border: calc(var(--u) * .8) dashed rgba(21,48,42,.35); display: grid; place-items: center; }
.pg-target .pg-art { width: 76%; height: 76%; filter: brightness(0); opacity: .55; }
.pg-art svg { width: 100%; height: 100%; display: block; }
.pg-art { transition: transform .35s cubic-bezier(.4,1.4,.6,1); }
.pg-tile { left: 27%; width: 46%; top: 50%; aspect-ratio: 1; z-index: 3; padding: 5%; border-radius: calc(var(--u) * 6); background: #FFFDF5; box-shadow: 0 calc(var(--u) * 1.4) 0 rgba(0,0,0,.2); display: grid; place-items: center; }
.pg-tile .pg-art { width: 100%; height: 100%; }
.pg-tile[hidden] { display: none; }
.pg-tile.ok { box-shadow: 0 0 0 calc(var(--u) * 1.4) var(--kuning), 0 calc(var(--u) * 1.4) 0 rgba(0,0,0,.2); }
.pg-rot { top: 57.5%; width: 21%; aspect-ratio: 1; z-index: 3; padding: 0; border-radius: 50%; background: var(--kuning); display: grid; place-items: center; box-shadow: 0 calc(var(--u) * 1.2) 0 rgba(0,0,0,.22); }
.pg-rot[data-d="-1"] { left: 3%; } .pg-rot[data-d="1"] { right: 3%; }
.pg-rot[data-d="-1"] svg { transform: scaleX(-1); }
.pg-rot svg { width: 62%; height: 62%; }
.pg-rot[hidden] { display: none; }
.pg-opts { left: 4%; right: 4%; top: 57%; bottom: 8%; z-index: 3; pointer-events: none; display: flex; justify-content: center; align-items: center; gap: 4%; }
.pg-opt { pointer-events: auto; width: 29%; aspect-ratio: 1; padding: 3%; border-radius: calc(var(--u) * 5); background: #FFFDF5; box-shadow: 0 calc(var(--u) * 1.2) 0 rgba(0,0,0,.2); display: grid; place-items: center; transition: opacity .3s; }
.pg-opt .pg-art { width: 100%; height: 100%; }
.pg-opt.ok { box-shadow: 0 0 0 calc(var(--u) * 1.4) var(--kuning), 0 calc(var(--u) * 1.2) 0 rgba(0,0,0,.2); }
.pg-opt.dim { opacity: .3; }
.pg-rot:disabled, .pg-opt:disabled { cursor: default; }`,

  stageHtml: () => `<svg class="bg" viewBox="0 0 200 300" preserveAspectRatio="none" aria-hidden="true">
      <rect width="200" height="300" fill="#93DCC8"/><circle cx="100" cy="66" r="60" fill="#A9E6D5"/>
      <g fill="none" stroke="#FFFDF5" stroke-width="2" opacity=".5"><path d="M30 40 a12 12 0 1 1 -6 -10"/><path d="M174 250 a12 12 0 1 1 -6 -10"/></g>
    </svg>
    <div class="pg-target" aria-hidden="true"><div class="pg-art"></div></div>
    <div class="pg-tile" hidden><div class="pg-art"></div></div>
    <button class="pg-rot" type="button" data-d="-1" aria-label="Pusing ke kiri" hidden disabled><svg viewBox="0 0 24 24" fill="none" stroke="#15302A" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12a8 8 0 1 1-2.3-5.6"/><path d="M20 4v5h-5"/></svg></button>
    <button class="pg-rot" type="button" data-d="1" aria-label="Pusing ke kanan" hidden disabled><svg viewBox="0 0 24 24" fill="none" stroke="#15302A" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12a8 8 0 1 1-2.3-5.6"/><path d="M20 4v5h-5"/></svg></button>
    <div class="pg-opts"></div>`,

  initState: (age) => ({ age, level: AGE_LEVEL[age], rounds: [] }),
  normalize(s, age) {
    if (s.age !== age) { s.age = age; s.level = AGE_LEVEL[age]; }
    if (!Number.isInteger(s.level) || s.level < 1 || s.level > MAX_LEVEL) s.level = AGE_LEVEL[age];
    return s;
  },

  async round(ctx) {
    const { stage, state, say, sfx, anim } = ctx;
    const targetArt = stage.querySelector('.pg-target .pg-art'), tile = stage.querySelector('.pg-tile'), tileArt = tile.querySelector('.pg-art'), rots = [...stage.querySelectorAll('.pg-rot')], optsEl = stage.querySelector('.pg-opts');
    const level = state.level, L = LEVELS[level];
    const items = shuffle(ITEMS);

    async function trialPutar(item, demo) {
      const goal = pick([0, 90, 180, 270]);
      let cur = (goal + pick(L.start)) % 360, vis = cur;
      targetArt.innerHTML = item.svg(); targetArt.style.transform = tf(goal);
      tileArt.innerHTML = item.svg();
      tileArt.style.transition = 'none'; tileArt.style.transform = tf(cur); void tileArt.offsetWidth; tileArt.style.transition = '';
      tile.hidden = false; tile.classList.remove('ok'); optsEl.innerHTML = '';
      rots.forEach((b) => { b.hidden = false; });
      // Langkah ikut jam yang tinggal; arah terdekat = ↻ bila 1–2 langkah, ↺ bila 3.
      const left = () => ((goal - cur + 360) % 360) / 90;
      const best = () => (left() === 3 ? -1 : 1);
      const need = Math.min(left(), 4 - left());
      stage.dataset.answer = String(best()); // untuk ujian automatik
      sfx.pop();
      let taps = 0;
      for (;;) {
        if (demo && taps === 0) { const r = ctx.toPct(rots.find((b) => Number(b.dataset.d) === best()).getBoundingClientRect()); ctx.hand.show(r.left + r.width * .45, r.top + r.width * .4); }
        rots.forEach((b) => { b.disabled = false; });
        const tap = await ctx.tap({ selector: '.pg-rot', ms: IDLE_MS });
        rots.forEach((b) => { b.disabled = true; }); ctx.hand.hide();
        if (!tap) { await ctx.wait(Math.max(900, say('intro') + 100)); continue; }
        // Sudut paparan tidak dihadkan supaya animasi sentiasa berpusing ke arah yang ditekan (270° → 360°, bukan undur ke 0°).
        taps++; vis += 90 * Number(tap.el.dataset.d); cur = ((vis % 360) + 360) % 360;
        tileArt.style.transform = tf(vis);
        sfx.light();
        stage.dataset.answer = String(best());
        await ctx.wait(380);
        if (cur === goal) break;
      }
      rots.forEach((b) => { b.hidden = true; });
      tile.classList.add('ok'); sfx.good();
      await ctx.wait(Math.max(700, say('sama') + 200));
      return { ok: taps === need, extra: taps - need };
    }

    async function trialPilih(item, demo) {
      const goal = pick(ANG.concat(0));
      targetArt.innerHTML = item.svg(); targetArt.style.transform = tf(goal);
      tile.hidden = true;
      // Pilihan: sudut betul + sudut lain; Tahap 4 juga imej cermin pada sudut yang sama.
      const wrongAngles = shuffle([0, 90, 180, 270].filter((a) => a !== goal));
      const opts = [{ a: goal, f: false, ok: true }];
      if (L.mirror) opts.push({ a: goal, f: true });
      while (opts.length < L.opts) opts.push({ a: wrongAngles.shift(), f: false });
      const order = shuffle(opts);
      optsEl.innerHTML = order.map((o, i) => `<button class="pg-opt" type="button" data-i="${i}" data-ok="${o.ok ? 1 : 0}" aria-label="${item.name}, pilihan ${i + 1}" disabled><div class="pg-art" style="transform:${tf(o.a, o.f)}">${item.svg()}</div></button>`).join('');
      stage.dataset.answer = String(order.findIndex((o) => o.ok));
      const cards = [...optsEl.querySelectorAll('.pg-opt')];
      const right = cards.find((c) => c.dataset.ok === '1');
      const arm = (on) => cards.forEach((c) => { c.disabled = !on || c.classList.contains('dim'); });
      const hint = () => { const r = ctx.toPct(right.getBoundingClientRect()); ctx.hand.show(r.left + r.width * .45, r.top + r.width * .35); };
      sfx.pop();
      await ctx.wait(Math.max(900, say('pilih') + 100));
      let wrong = 0;
      for (;;) {
        if (demo && wrong === 0) hint();
        arm(true);
        const tap = await ctx.tap({ selector: '.pg-opt', ms: IDLE_MS });
        arm(false); ctx.hand.hide();
        if (!tap) { hint(); await ctx.wait(Math.max(900, say('pilih') + 100)); continue; }
        if (tap.el === right) break;
        wrong++; sfx.soft();
        anim(tap.el, [{ transform: 'translateX(0)' }, { transform: 'translateX(-6%)' }, { transform: 'translateX(6%)' }, { transform: 'translateX(0)' }], { duration: 320, fill: 'none' });
        tap.el.classList.add('dim');
        if (wrong >= 1) hint();
        await ctx.wait(Math.max(700, say('cuba-lagi') + 100));
      }
      right.classList.add('ok'); sfx.good();
      await ctx.wait(Math.max(700, say('sama') + 200));
      return { ok: wrong === 0, mirror: L.mirror };
    }

    ctx.progress(TRIALS);
    await ctx.ready(); ctx.alive();
    if (ctx.first) await ctx.wait(Math.max(3400, say(L.mode === 'putar' ? 'intro' : 'pilih') + 200));
    const recs = [];
    for (let i = 0; i < TRIALS; i++) {
      const it = items[i % items.length], demo = ctx.first && i === 0;
      recs.push(L.mode === 'putar' ? await trialPutar(it, demo) : await trialPilih(it, demo));
      ctx.mark(i);
      await ctx.wait(300);
    }
    delete stage.dataset.answer;
    const ok = recs.filter((r) => r.ok).length;
    if (ok >= UP_AT) state.level = Math.min(MAX_LEVEL, level + 1);
    else if (ok <= DOWN_AT) state.level = Math.max(1, level - 1);
    return {
      record: { level, ok, n: recs.length, mode: L.mode },
      foundHtml: '',
      text: L.mode === 'putar'
        ? `Adik pusing <span class="big-num">${recs.length}</span> gambar! <span class="big-num">${ok}</span> dengan pusingan paling sedikit.`
        : `Adik pilih betul kali pertama <span class="big-num">${ok}</span> daripada ${recs.length}!`,
    };
  },

  parent: {
    stats(s) {
      const last = s.rounds.slice(-7);
      const okP = pct(last.reduce((a, r) => a + (r.ok || 0), 0), last.reduce((a, r) => a + (r.n || 0), 0));
      return [
        { v: okP === null ? '–' : okP + '%', label: 'Tepat / betul kali pertama' },
        { v: `${s.level}<small>/${MAX_LEVEL}</small>`, label: 'Tahap' },
        { v: s.level >= 3 ? 'Dalam kepala' : 'Dengan tangan', label: 'Cara memusing' },
      ];
    },
    cols: ['Tahap', 'Tepat'],
    row: (r) => [r.level, meter(pct(r.ok, r.n))],
    explain: `<span><b>Visual-ruang (putaran mental)</b>: membayangkan rupa benda bila dipusing. Kemahiran ini berkait dengan matematik, membaca peta, dan membezakan huruf yang hampir sama seperti b/d dan p/q.</span>
      <span>Tahap 1–2: pusing dengan butang ↺ / ↻ (90° setiap tekan); "tepat" = memilih arah yang paling dekat, iaitu meramal pusingan sebelum menekan · Tahap 3: pilih gambar yang sudah dipusing betul · Tahap 4: pilihan termasuk imej cermin, jadi anak mesti bezakan "dipusing" daripada "diterbalikkan".</span>`,
  },

  mission: {
    title: 'Main "Pusing Mainan"',
    steps: [
      'Ambil satu kereta mainan. Letak menghadap ke kiri, kemudian minta anak pusingkan supaya menghadap ke atas.',
      'Lukis bentuk mudah (cth. huruf L) atas kertas. Pusingkan kertas dan tanya: <b>"Sekarang huruf ni rupa macam mana?"</b>',
      'Main puzzle kepingan besar bersama; biar anak pusingkan kepingan sendiri sebelum dicuba.',
    ],
    why: 'Kenapa? Memusing benda dalam kepala melatih otak "nampak" ruang, kemahiran yang kemudian membantu geometri, melukis dan membaca huruf.',
  },
};
