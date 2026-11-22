// Rumah Haiwan: fleksibiliti kognitif, berasaskan Dimensional Change Card Sort (DCCS).
// Haiwan bertopi masuk rumah ikut warna topi, kemudian ikut jenis haiwan selepas peraturan bertukar.
// Setiap kad sengaja bercanggah: warna padan satu rumah, haiwan padan rumah yang lain.
import { ANIMALS, nameOf, hattedSVG } from '../../kit/art.js';
import { pick, shuffle, balanced, pct, meter } from '../../kit/util.js';

const TRIALS_PER_BLOCK = 6, MIX_TRIALS = 8;
const AGE_LEVEL = { 3: 1, 4: 1, 5: 2, 6: 2 };
const PASS_POST = 5, FAIL_POST = 3;        // tahap 1→2 bila ≥5/6 betul selepas tukar; 2→1 bila ≤3/6
const REMIND_MS = 8000, REMINDERS = 2;
const RULE_TEXT = { warna: 'Ikut warna topi', haiwan: 'Ikut haiwan', campur: 'Dengar: warna atau haiwan?' };
const PRAISE = ['bagus', 'pandainya', 'right3'];
const SPOT = { left: '33%', top: '13%', width: '34%' };

const HOUSE_SVG = `<svg viewBox="0 0 160 150" aria-hidden="true">
  <ellipse cx="80" cy="146" rx="70" ry="4" fill="#0B2A1C" opacity=".18"/>
  <g fill="#6B4A2E"><rect x="22" y="108" width="7" height="38" rx="2"/><rect x="76.5" y="108" width="7" height="38" rx="2"/><rect x="131" y="108" width="7" height="38" rx="2"/></g>
  <g stroke="#5E3A1E" stroke-width="3" stroke-linecap="round"><path d="M68 146 L71 112 M92 146 L89 112"/><path d="M69.5 136 H90.5 M70.5 124 H89.5"/></g>
  <rect x="10" y="104" width="140" height="8" rx="2" fill="#8A5A32"/>
  <rect x="16" y="56" width="128" height="50" fill="#D49A5E" stroke="#8A5A32" stroke-width="3"/>
  <g stroke="#B57A42" stroke-width="1.6" opacity=".8"><path d="M17.5 68 H142.5 M17.5 80 H142.5 M17.5 92 H142.5"/></g>
  <rect x="68" y="70" width="24" height="36" rx="2" fill="#6B3E1F"/><circle cx="87" cy="89" r="1.6" fill="#F5B82E"/>
  <g><rect x="30" y="68" width="24" height="22" rx="2" fill="#3B2A1C"/><rect x="24" y="68" width="6" height="22" fill="#2F7A4F"/><rect x="54" y="68" width="6" height="22" fill="#2F7A4F"/>
    <rect x="106" y="68" width="24" height="22" rx="2" fill="#3B2A1C"/><rect x="100" y="68" width="6" height="22" fill="#2F7A4F"/><rect x="130" y="68" width="6" height="22" fill="#2F7A4F"/></g>
  <path d="M2 60 L80 6 L158 60 Z" fill="#B5462E" stroke="#7F2C1B" stroke-width="3" stroke-linejoin="round"/>
  <g stroke="#D9714F" stroke-width="2" opacity=".7" stroke-linecap="round"><path d="M18 52 L80 10 L142 52"/><path d="M34 52 L80 20 L126 52"/></g>
</svg>`;
const ICON = {
  warna: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 0 0 0 18c1.2 0 1.8-.8 1.8-1.7 0-1-.8-1.4-.8-2.3 0-1 .8-1.6 1.8-1.6H17a4 4 0 0 0 4-4c0-4.6-4-8.4-9-8.4z" fill="#FFFDF5" stroke="currentColor" stroke-width="1.8"/><circle cx="7.5" cy="11" r="1.7" fill="#E5484D"/><circle cx="10" cy="7" r="1.7" fill="#2F7DE1"/><circle cx="14.5" cy="7" r="1.7" fill="#F5B82E"/><circle cx="17" cy="11" r="1.7" fill="#22B26A"/></svg>`,
  haiwan: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><ellipse cx="12" cy="16" rx="5" ry="4"/><circle cx="6" cy="10" r="2.2"/><circle cx="10" cy="6.5" r="2.2"/><circle cx="14" cy="6.5" r="2.2"/><circle cx="18" cy="10" r="2.2"/></svg>`,
};
ICON.campur = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h11l-3-3M20 17H9l3 3"/></svg>`;

export default {
  id: 'rumah-haiwan',
  title: 'Rumah Haiwan',
  stageLabel: 'Kampung. Tekan rumah yang betul untuk setiap haiwan.',
  lines: {
    intro: 'Jom tolong haiwan balik rumah! Dengar baik-baik, ya.',
    'rule-warna': 'Kita main warna. Topi merah masuk rumah topi merah, topi biru masuk rumah topi biru.',
    'rule-haiwan': 'Kita main haiwan. Setiap haiwan masuk rumah haiwan yang sama, tak kira warna topi.',
    switch: 'Sekarang kita tukar permainan!',
    mix: 'Sekarang lagi mencabar! Dengar baik-baik: warna atau haiwan?',
    'cue-warna': 'Warna!', 'cue-haiwan': 'Haiwan!',
    'remind-warna': 'Ingat, ikut warna topi.', 'remind-haiwan': 'Ingat, ikut haiwan.',
    right3: 'Betul, itu rumah dia!',
    'wrong-warna': 'Hmm, tengok warna topi dia.', 'wrong-haiwan': 'Hmm, tengok haiwan apa ni.',
    end: 'Syabas! Semua haiwan dah sampai rumah.',
  },
  recorded: ['intro', 'rule-warna', 'rule-haiwan', 'switch', 'mix', 'cue-warna', 'cue-haiwan', 'remind-warna', 'remind-haiwan', 'right3', 'wrong-warna', 'wrong-haiwan', 'end'],

  css: `.rh-houses { inset: 0; }
/* Rumah: sama rupa; hanya papan tanda (haiwan + warna topi) yang berbeza. */
.rh-house { position: absolute; width: 44%; aspect-ratio: 160 / 150; top: 60%; padding: 0; z-index: 3; }
.rh-house:disabled { cursor: default; }
.rh-house .hs { position: absolute; inset: 0; transform-origin: 50% 100%; }
.rh-house .hs > svg { width: 100%; height: auto; display: block; }
.rh-house .sign {
  position: absolute; left: 50%; bottom: 84%; width: 58%; aspect-ratio: 1; transform: translateX(-50%);
  background: var(--kertas); border-radius: 50%; border: calc(var(--u) * .9) solid #8A5A32;
  box-shadow: 0 calc(var(--u) * .8) 0 rgba(0, 0, 0, .15); display: grid; place-items: center; overflow: hidden;
}
.rh-house .sign svg { height: 86%; width: auto; display: block; }
.rh-house:not(:disabled) .hs { animation: wiggle 1.4s ease-in-out infinite; }
.rh-house:not(:disabled):nth-of-type(2) .hs { animation-delay: .5s; }
.rh-card { left: 33%; top: 13%; width: 34%; z-index: 5; pointer-events: none; }
.rh-card svg { width: 100%; height: auto; display: block; }
.rh-rule {
  left: 50%; bottom: 2.4%; transform: translateX(-50%); z-index: 4; white-space: nowrap;
  display: flex; align-items: center; gap: calc(var(--u) * 1.4);
  background: rgba(21, 48, 42, .78); color: var(--kertas); font-family: var(--font-display); font-weight: 600;
  font-size: calc(var(--u) * 3.8); padding: calc(var(--u) * 1.2) calc(var(--u) * 3.2); border-radius: 999px;
}
.rh-rule svg { width: 1.3em; height: 1.3em; display: block; }
.rh-rule:empty { display: none; }
.found svg { width: 84px; }
@media (prefers-reduced-motion: reduce) { .rh-house:not(:disabled) .hs { animation: none; } }`,

  stageHtml: () => `<svg class="bg" viewBox="0 0 200 300" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id="rh-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9FD8EE"/><stop offset="1" stop-color="#DDF2E6"/></linearGradient>
                <radialGradient id="rh-sun"><stop offset="0" stop-color="#FFF6C8"/><stop offset=".45" stop-color="#FFE48A"/><stop offset="1" stop-color="#FFE48A" stop-opacity="0"/></radialGradient>
                <linearGradient id="rh-grass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#86CF80"/><stop offset="1" stop-color="#5EAE62"/></linearGradient>
              </defs>
              <rect width="200" height="90" fill="url(#rh-sky)"/>
              <circle cx="166" cy="22" r="20" fill="url(#rh-sun)"/>
              <g fill="#FFFFFF" opacity=".85"><path d="M18 26 a7 7 0 0 1 12 -4 a8 8 0 0 1 14 3 a5 5 0 0 1 1 10 h-27 a5 5 0 0 1 0 -9z"/></g>
              <path d="M0 64 C24 50 44 52 64 60 C88 46 112 46 134 58 C156 48 180 50 200 56 V96 H0Z" fill="#A9D5BC" opacity=".9"/>
              <g>
                <rect x="170" y="44" width="3" height="50" fill="#7A5A3A"/>
                <path d="M171.5 44 c-12 -2 -20 4 -24 10 c8 -5 16 -6 24 -6z M171.5 44 c12 -2 20 4 24 10 c-8 -5 -16 -6 -24 -6z M171.5 44 c-6 -10 -16 -12 -22 -10 c8 1 15 5 22 12z M171.5 44 c6 -10 16 -12 22 -10 c-8 1 -15 5 -22 12z" fill="#3E9660"/>
                <circle cx="170" cy="47" r="2.2" fill="#8A6A3A"/><circle cx="173.5" cy="47.5" r="2.2" fill="#8A6A3A"/>
                <rect x="24" y="52" width="3" height="42" fill="#7A5A3A"/>
                <path d="M25.5 52 c-10 -2 -17 3 -20 9 c7 -4 13 -5 20 -5z M25.5 52 c10 -2 17 3 20 9 c-7 -4 -13 -5 -20 -5z M25.5 52 c-5 -9 -13 -10 -18 -8 c7 1 12 4 18 10z M25.5 52 c5 -9 13 -10 18 -8 c-7 1 -12 4 -18 10z" fill="#2E7A4C"/>
              </g>
              <rect y="88" width="200" height="212" fill="url(#rh-grass)"/>
              <path d="M100 300 C96 250 60 230 54 196 L146 196 C140 230 104 250 100 300Z" fill="#E9D3A8" opacity=".55"/>
              <g fill="#8ED48A" opacity=".8"><ellipse cx="34" cy="120" rx="24" ry="6"/><ellipse cx="170" cy="134" rx="26" ry="7"/></g>
              <g><circle cx="22" cy="104" r="2.6" fill="#F06A9A"/><circle cx="22" cy="104" r="1" fill="#FFE1EC"/>
                <circle cx="182" cy="112" r="3" fill="#F5B82E"/><circle cx="182" cy="112" r="1.2" fill="#FFF3C4"/>
                <circle cx="40" cy="292" r="3" fill="#F5B82E"/><circle cx="40" cy="292" r="1.2" fill="#FFF3C4"/>
                <circle cx="164" cy="294" r="2.6" fill="#F06A9A"/><circle cx="164" cy="294" r="1" fill="#FFE1EC"/></g>
            </svg>
    <div class="rh-houses"></div>
    <div class="rh-card" hidden aria-live="polite"></div>
    <div class="rh-rule" aria-live="polite"></div>`,

  initState: (age) => ({ age, level: AGE_LEVEL[age], rounds: [] }),
  normalize(s, age) {
    if (s.age !== age) { s.age = age; s.level = AGE_LEVEL[age]; }
    if (![1, 2].includes(s.level)) s.level = AGE_LEVEL[age];
    return s;
  },

  async round(ctx) {
    const { stage, state, say, sfx, anim } = ctx;
    const housesEl = stage.querySelector('.rh-houses'), cardEl = stage.querySelector('.rh-card'), ruleEl = stage.querySelector('.rh-rule');
    const level = state.level;
    const [A, B] = shuffle(ANIMALS).slice(0, 2).map((x) => x.id);
    const [X, Y] = shuffle(['merah', 'biru']);
    const houses = [{ a: A, color: X }, { a: B, color: Y }];
    const tests = [{ a: A, color: Y }, { a: B, color: X }];
    // Peraturan pertama berselang-seli setiap pusingan supaya pertukaran sentiasa segar.
    const first = state.rounds.length % 2 ? 'haiwan' : 'warna', second = first === 'warna' ? 'haiwan' : 'warna';

    housesEl.innerHTML = houses.map((h, i) => `<button class="rh-house" type="button" data-i="${i}" style="left:${i ? 52 : 4}%" aria-label="Rumah ${nameOf(h.a)} bertopi ${h.color}" disabled><div class="hs">${HOUSE_SVG}<div class="sign">${hattedSVG(h.a, h.color, false)}</div></div></button>`).join('');
    const houseEls = [...housesEl.querySelectorAll('.rh-house')];
    const arm = (on) => houseEls.forEach((b) => { b.disabled = !on; });
    const setRule = (r) => { ruleEl.innerHTML = r ? `${ICON[r]}<span>${RULE_TEXT[r]}</span>` : ''; };
    const sideFor = (rule, c) => houses.findIndex((h) => (rule === 'warna' ? h.color === c.color : h.a === c.a));
    const handAt = (i) => { const r = ctx.toPct(houseEls[i].getBoundingClientRect()); ctx.hand.show(r.left + r.width * .42, 74); };

    async function showCard(c) {
      cardEl.innerHTML = hattedSVG(c.a, c.color, true);
      cardEl.getAnimations().forEach((x) => x.cancel());
      Object.assign(cardEl.style, SPOT);
      cardEl.hidden = false; sfx.pop();
      await anim(cardEl, [{ opacity: 0, transform: 'scale(.5)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 360, easing: 'cubic-bezier(.3,1.5,.5,1)' }); ctx.alive();
    }
    // Haiwan berjalan masuk ke pintu rumah, kemudian rumah "melambung" sedikit.
    async function goHouse(i) {
      const r = houseEls[i].getBoundingClientRect();
      const to = ctx.toPct({ left: r.left + r.width * .4, top: r.top + r.height * .3, width: r.width * .2 });
      const end = { left: to.left + '%', top: to.top + '%', width: to.width + '%' };
      await anim(cardEl, [{ ...SPOT, opacity: 1 }, { ...end, opacity: 1, offset: .85 }, { ...end, opacity: 0 }], { duration: 850 }); ctx.alive();
      cardEl.hidden = true; cardEl.getAnimations().forEach((x) => x.cancel());
      sfx.pop();
      await anim(houseEls[i].querySelector('.hs'), [{ transform: 'scale(1)' }, { transform: 'scale(1.06, .94)' }, { transform: 'scale(1)' }], { duration: 300, fill: 'none' }); ctx.alive();
    }

    let idx = 0;
    // opts: remind (ulang peraturan setiap percubaan), cue (blok campur), demo (tangan tunjuk).
    async function trial(rule, c, block, opts) {
      if (opts.cue) await ctx.wait(Math.max(900, say('cue-' + rule, ICON[rule]) + 150));
      else ctx.caption(''); // buang pujian percubaan lepas
      await showCard(c);
      if (opts.remind) say('remind-' + rule, ICON[rule]);
      const ok = sideFor(rule, c);
      arm(true);
      if (opts.demo) handAt(ok);
      const t0 = performance.now();
      let tap = -1;
      for (let r = 0; r <= REMINDERS && tap < 0; r++) {
        const t = await ctx.tap({ selector: '.rh-house', ms: REMIND_MS });
        if (t) tap = Number(t.el.dataset.i);
        else if (r < REMINDERS) say((opts.cue ? 'cue-' : 'remind-') + rule, ICON[rule]);
      }
      arm(false); ctx.hand.hide();
      const rec = { block, rule, correct: tap === ok, rt: tap >= 0 ? Math.round(performance.now() - t0) : null };
      if (rec.correct) {
        sfx.good();
        const d = say(pick(PRAISE));
        await goHouse(ok);
        await ctx.wait(Math.max(250, d - 850));
      } else {
        sfx.soft();
        if (tap >= 0) await anim(cardEl, [{ transform: 'translateX(0)' }, { transform: 'translateX(-6%) rotate(-4deg)' }, { transform: 'translateX(6%) rotate(4deg)' }, { transform: 'translateX(0)' }], { duration: 420, fill: 'none' });
        ctx.alive();
        const d = say('wrong-' + rule, ICON[rule]);
        handAt(ok);
        await ctx.wait(Math.max(1200, d));
        ctx.hand.hide();
        await goHouse(ok); // tunjuk rumah yang betul: belajar, bukan kalah
      }
      ctx.mark(idx++);
      await ctx.wait(250);
      return rec;
    }

    const recs = [];
    const block = async (rule, name, demoFirst) => {
      const seq = balanced(TRIALS_PER_BLOCK);
      for (let i = 0; i < seq.length; i++) recs.push(await trial(rule, tests[seq[i]], name, { remind: level === 1, demo: demoFirst && i === 0 }));
    };
    ctx.progress(TRIALS_PER_BLOCK * 2 + (level >= 2 ? MIX_TRIALS : 0), [TRIALS_PER_BLOCK, TRIALS_PER_BLOCK * 2]);
    await ctx.ready(); ctx.alive();
    if (ctx.first) await ctx.wait(Math.max(1700, say('intro') + 200));
    setRule(first);
    await ctx.wait(Math.max(2500, say('rule-' + first, ICON[first]) + 300));
    await block(first, 'pre', ctx.first);
    setRule(null);
    await ctx.wait(Math.max(1500, say('switch') + 200));
    setRule(second);
    await ctx.wait(Math.max(2500, say('rule-' + second, ICON[second]) + 300));
    await block(second, 'post', false);
    if (level >= 2) {
      setRule('campur');
      await ctx.wait(Math.max(2200, say('mix', ICON.campur) + 300));
      const rules = balanced(MIX_TRIALS), cards = balanced(MIX_TRIALS);
      for (let i = 0; i < MIX_TRIALS; i++) recs.push(await trial(rules[i] ? 'haiwan' : 'warna', tests[cards[i]], 'mix', { cue: true }));
    }

    const tally = (b) => { const r = recs.filter((x) => x.block === b); return r.length ? [r.filter((x) => x.correct).length, r.length] : null; };
    const pre = tally('pre'), post = tally('post'), mix = tally('mix');
    if (level === 1 && post[0] >= PASS_POST) state.level = 2;
    else if (level === 2 && post[0] <= FAIL_POST) state.level = 1;
    return {
      record: { level, first, pre, post, mix },
      foundHtml: houses.map((h) => hattedSVG(h.a, h.color, false)).join(''),
      // Nada positif: skor rendah selepas tukar ialah perkembangan biasa, bukan kegagalan.
      text: `Adik bawa <span class="big-num">${recs.length}</span> haiwan balik rumah. `
        + (post[0] >= 4 ? `Lepas peraturan bertukar, adik betul <span class="big-num">${post[0]}</span> daripada ${post[1]}!` : 'Tukar peraturan memang mencabar. Main lagi untuk berlatih, ya!'),
    };
  },

  parent: {
    stats(s) {
      const last = s.rounds.slice(-7);
      const sumOf = (k) => { const r = last.filter((x) => Array.isArray(x[k])); return r.length ? pct(r.reduce((a, x) => a + x[k][0], 0), r.reduce((a, x) => a + x[k][1], 0)) : null; };
      const postP = sumOf('post'), mixP = sumOf('mix');
      return [
        { v: postP === null ? '–' : postP + '%', label: 'Tukar peraturan' },
        { v: mixP === null ? '–' : mixP + '%', label: 'Campur' },
        { v: `${s.level}<small>/2</small>`, label: 'Tahap' },
      ];
    },
    cols: ['Sebelum tukar', 'Selepas tukar', 'Campur'],
    row: (r) => [r.pre, r.post, r.mix].map((t) => meter(t ? pct(t[0], t[1]) : null)),
    explain: `<span><b>Fleksibiliti kognitif</b>: kebolehan menukar peraturan dalam fikiran. Berasaskan tugasan <i>Dimensional Change Card Sort</i> (DCCS): setiap haiwan sepadan dengan satu rumah ikut warna dan dengan rumah lain ikut jenis haiwan.</span>
      <span><b>Tukar peraturan</b> = % betul selepas peraturan bertukar. Biasa: ramai kanak-kanak 3 tahun masih ikut peraturan lama; kebanyakan 4–5 tahun boleh tukar. <b>Campur</b> (tahap 2) mencabar walaupun untuk 6 tahun. Tahap naik bila ≥ 5/6 selepas tukar, turun bila ≤ 3/6.</span>`,
  },

  mission: {
    title: 'Main "Isih Mainan" di rumah',
    steps: [
      'Sediakan 2 bakul dan beberapa mainan dua warna, contohnya kereta dan bola merah serta biru.',
      'Mula-mula isih <b>ikut warna</b>: semua yang merah ke bakul merah.',
      'Kemudian sebut <b>"Tukar!"</b> dan isih semula <b>ikut jenis</b>: semua kereta ke satu bakul, semua bola ke bakul lain.',
      'Bila dah senang, tukar peraturan lebih kerap. Bergilir-gilir: biar anak pula beri arahan.',
    ],
    why: 'Kenapa? Permainan ini melatih fleksibiliti kognitif, iaitu kebolehan menukar cara berfikir bila peraturan berubah. Kemahiran ini membantu anak menyesuaikan diri, menyelesaikan masalah dan bermain dengan rakan.',
  },
};
