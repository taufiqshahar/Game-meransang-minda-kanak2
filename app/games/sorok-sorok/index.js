// Sorok-Sorok Hutan: ingatan kerja (lokasi). Haiwan menyorok dalam semak; anak cari semula haiwan yang ditanya.
// Tangga adaptif 2-naik-1-turun (sasaran ~70% betul), 1–5 haiwan.
import { ART, ANIMALS, iconOf } from '../../kit/art.js';
import { pick, shuffle, pct, meter } from '../../kit/util.js';

const TRIALS = 8;
const SPAN_MIN = 1, SPAN_MAX = 5;
const AGE_SPAN = { 3: 1, 4: 2, 5: 3, 6: 3 };
const UP_AFTER = 2;                        // betul berturut-turut untuk tambah seekor
const PRACTICE_MAX = 3;                    // demo + sehingga 2 cubaan sendiri
const REMIND_MS = 8000, REMINDERS = 2;     // ulang soalan bila anak senyap; tiada had masa "gagal"
// Kedudukan semak (% pentas) ikut bilangan semak. Lebar semak 30%, tinggi 25% pentas.
const LAYOUTS = {
  3: [[3, 50], [35, 50], [67, 50]],
  4: [[12, 37], [58, 37], [12, 63], [58, 63]],
  5: [[3, 37], [35, 37], [67, 37], [19, 63], [51, 63]],
  6: [[3, 37], [35, 37], [67, 37], [3, 63], [35, 63], [67, 63]],
};
const SPOT = { left: 37, top: 11, width: 26 }; // tempat haiwan muncul sebelum menyorok / semasa soalan
const bushCount = (k) => Math.min(6, Math.max(3, k + 2));
const PRAISE = ['right1', 'right2', 'right3'];

const LEAF = `<g fill="#1F5230" stroke="#1F5230" stroke-width="7" stroke-linejoin="round"><circle cx="28" cy="58" r="24"/><circle cx="92" cy="58" r="24"/><circle cx="60" cy="40" r="32"/><rect x="8" y="56" width="104" height="30" rx="14"/></g>
  <g fill="url(#sb-bush)"><circle cx="28" cy="58" r="24"/><circle cx="92" cy="58" r="24"/><circle cx="60" cy="40" r="32"/><rect x="8" y="56" width="104" height="30" rx="14"/></g>
  <g fill="#8EDB86" opacity=".55"><ellipse cx="48" cy="24" rx="12" ry="6" transform="rotate(-20 48 24)"/><ellipse cx="20" cy="46" rx="8" ry="4" transform="rotate(-30 20 46)"/><ellipse cx="86" cy="44" rx="8" ry="4" transform="rotate(-25 86 44)"/></g>
  <g stroke="#246B3A" stroke-width="2.4" stroke-linecap="round" fill="none" opacity=".7"><path d="M40 62 q6 -6 12 0"/><path d="M70 52 q6 -6 12 0"/><path d="M56 74 q6 -6 12 0"/><path d="M90 70 q5 -5 10 0"/><path d="M18 70 q5 -5 10 0"/></g>
  <g><circle cx="34" cy="40" r="3.4" fill="#E5484D"/><circle cx="33" cy="39" r="1.1" fill="#fff" opacity=".7"/><circle cx="80" cy="30" r="3.4" fill="#E5484D"/><circle cx="79" cy="29" r="1.1" fill="#fff" opacity=".7"/><circle cx="100" cy="56" r="3" fill="#F5B82E"/></g>`;
const BUSH_SVG = `<svg viewBox="0 0 120 90" aria-hidden="true">${LEAF}</svg>`;

export default {
  id: 'sorok-sorok',
  title: 'Sorok-Sorok Hutan',
  stageLabel: 'Semak hutan. Tengok haiwan menyorok, kemudian tekan semak tempat haiwan yang ditanya.',
  lines: {
    intro: 'Jom main sorok-sorok! Tengok haiwan menyorok dalam semak, lepas tu cari, ya.',
    prac: 'Tengok baik-baik. Ingat dia sorok kat mana, ya.',
    watch: 'Tengok baik-baik…',
    more: 'Wah, lagi ramai kawan nak menyorok!',
    'ask-kancil': 'Mana kancil?', 'ask-harimau': 'Mana harimau?', 'ask-orangutan': 'Mana orang utan?',
    'ask-gajah': 'Mana gajah?', 'ask-tapir': 'Mana tapir?', 'ask-enggang': 'Mana burung enggang?',
    'sorok-kancil': 'Kancil menyorok!', 'sorok-harimau': 'Harimau menyorok!', 'sorok-orangutan': 'Orang utan menyorok!',
    'sorok-gajah': 'Gajah menyorok!', 'sorok-tapir': 'Tapir menyorok!', 'sorok-enggang': 'Burung enggang menyorok!',
    right1: 'Jumpa pun!', right2: 'Pandainya adik ingat!', right3: 'Betul! Dia sorok kat situ.',
    retry: 'Bukan kat situ. Cuba lagi, ya.',
    reveal: 'Oh, dia kat sini rupanya!',
    end: 'Syabas! Adik pandai ingat.',
  },
  recorded: ['intro', 'prac', 'watch', 'more', 'ask-kancil', 'ask-harimau', 'ask-orangutan', 'ask-gajah', 'ask-tapir', 'ask-enggang',
    'sorok-kancil', 'sorok-harimau', 'sorok-orangutan', 'sorok-gajah', 'sorok-tapir', 'sorok-enggang',
    'right1', 'right2', 'right3', 'retry', 'reveal', 'end'],

  css: `.ss-field { inset: 0; }
/* Semak: butang setinggi 1.25× lebar; haiwan menyorok di belakang daun dan terpotong oleh overflow. */
.ss-bush { position: absolute; width: 30%; aspect-ratio: 120 / 150; overflow: hidden; padding: 0; z-index: 3; border-radius: 0 0 28% 28%; }
.ss-bush:disabled { cursor: default; }
.ss-bush .leaf { position: absolute; left: 0; right: 0; bottom: 0; }
.ss-bush .leaf svg { width: 100%; height: auto; display: block; }
.ss-bush .hider { position: absolute; left: 15%; width: 70%; bottom: 16%; transform: translateY(145%); transition: transform .38s cubic-bezier(.3, 1.6, .5, 1); }
.ss-bush .hider.up { transform: translateY(-25%); }
.ss-bush .hider svg { width: 100%; height: auto; display: block; }
/* Isyarat "giliran adik": semak bergoyang perlahan bila boleh ditekan. */
.ss-bush:not(:disabled) .leaf { transform-origin: 50% 100%; animation: wiggle 1.4s ease-in-out infinite; }
.ss-bush:not(:disabled):nth-child(2n) .leaf { animation-delay: .35s; }
.ss-bush:not(:disabled):nth-child(3n) .leaf { animation-delay: .7s; }
.ss-instant, .ss-instant * { transition: none !important; }
.ss-walker { z-index: 5; pointer-events: none; }
.ss-walker svg { width: 100%; height: auto; display: block; }
.ss-walker.asking { animation: ss-ask 1.1s ease-in-out infinite; }
@keyframes ss-ask { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6%); } }
@media (prefers-reduced-motion: reduce) { .ss-walker.asking, .ss-bush:not(:disabled) .leaf { animation: none; } .ss-bush .hider { transition: none; } }`,

  stageHtml: () => `<svg class="bg" viewBox="0 0 200 300" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id="sb-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9FD8EE"/><stop offset="1" stop-color="#DDF2E6"/></linearGradient>
                <radialGradient id="sb-sun"><stop offset="0" stop-color="#FFF6C8"/><stop offset=".45" stop-color="#FFE48A"/><stop offset="1" stop-color="#FFE48A" stop-opacity="0"/></radialGradient>
                <linearGradient id="sb-grass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#86CF80"/><stop offset="1" stop-color="#5EAE62"/></linearGradient>
                <linearGradient id="sb-haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7DB996"/><stop offset="1" stop-color="#5E9F7A"/></linearGradient>
                <radialGradient id="sb-bush" cx=".4" cy=".25" r=".9"><stop offset="0" stop-color="#6CC46B"/><stop offset="1" stop-color="#2F8A4A"/></radialGradient>
              </defs>
              <rect width="200" height="80" fill="url(#sb-sky)"/>
              <circle cx="164" cy="20" r="20" fill="url(#sb-sun)"/>
              <g fill="#FFFFFF" opacity=".85"><path d="M18 24 a7 7 0 0 1 12 -4 a8 8 0 0 1 14 3 a5 5 0 0 1 1 10 h-27 a5 5 0 0 1 0 -9z"/></g>
              <path d="M0 50 C20 38 36 40 52 48 C70 34 92 34 110 46 C128 34 152 34 168 46 C182 40 192 42 200 46 V84 H0Z" fill="#A9D5BC" opacity=".9"/>
              <path d="M0 60 C18 50 38 52 56 60 C76 48 98 48 116 58 C136 48 160 48 178 58 C188 54 196 54 200 56 V86 H0Z" fill="url(#sb-haze)"/>
              <g fill="#2C744A"><circle cx="10" cy="72" r="14"/><circle cx="48" cy="70" r="15"/><circle cx="92" cy="74" r="13"/><circle cx="134" cy="70" r="15"/><circle cx="176" cy="72" r="15"/></g>
              <g fill="#3B8F5B"><circle cx="6" cy="67" r="8"/><circle cx="44" cy="64" r="9"/><circle cx="130" cy="64" r="9"/><circle cx="172" cy="67" r="8"/></g>
              <rect y="78" width="200" height="222" fill="url(#sb-grass)"/>
              <ellipse cx="100" cy="190" rx="96" ry="88" fill="#9BDA8F" opacity=".45"/>
              <g fill="#8ED48A" opacity=".8"><ellipse cx="34" cy="120" rx="24" ry="6"/><ellipse cx="170" cy="150" rx="26" ry="7"/><ellipse cx="100" cy="286" rx="44" ry="9"/></g>
              <g fill="#4E9B57">
                <path d="M0 300 C4 280 12 268 26 262 C18 274 14 286 14 300Z"/><path d="M8 300 C14 286 24 278 38 276 C28 284 22 292 22 300Z" fill="#5BAA60"/>
                <path d="M200 300 C196 280 188 268 174 262 C182 274 186 286 186 300Z"/><path d="M192 300 C186 286 176 278 162 276 C172 284 178 292 178 300Z" fill="#5BAA60"/>
              </g>
              <g><circle cx="22" cy="102" r="2.6" fill="#F06A9A"/><circle cx="22" cy="102" r="1" fill="#FFE1EC"/>
                <circle cx="180" cy="112" r="3" fill="#F5B82E"/><circle cx="180" cy="112" r="1.2" fill="#FFF3C4"/>
                <circle cx="60" cy="292" r="3" fill="#F5B82E"/><circle cx="60" cy="292" r="1.2" fill="#FFF3C4"/>
                <circle cx="146" cy="294" r="2.6" fill="#F06A9A"/><circle cx="146" cy="294" r="1" fill="#FFE1EC"/></g>
            </svg>
    <div class="ss-field"></div>
    <div class="ss-walker" hidden aria-hidden="true"></div>`,

  initState: (age) => ({ age, span: AGE_SPAN[age], rounds: [] }),
  normalize(s, age) {
    if (s.age !== age) { s.age = age; s.span = AGE_SPAN[age]; }
    if (!Number.isInteger(s.span) || s.span < SPAN_MIN || s.span > SPAN_MAX) s.span = AGE_SPAN[age];
    return s;
  },

  async round(ctx) {
    const { stage, state, say, sfx, anim } = ctx;
    const field = stage.querySelector('.ss-field'), walker = stage.querySelector('.ss-walker');
    const pace = ctx.age <= 3 ? 1.4 : 1; // rentak lebih perlahan untuk 3 tahun
    let bushes = [], lastAsked = null;

    const layout = (n) => {
      field.innerHTML = LAYOUTS[n].map(([x, y], i) => `<button class="ss-bush" type="button" data-i="${i}" style="left:${x}%;top:${y}%" aria-label="Semak ${i + 1}" disabled><div class="hider"></div><div class="leaf">${BUSH_SVG}</div></button>`).join('');
      bushes = [...field.querySelectorAll('.ss-bush')];
    };
    const arm = (on) => bushes.forEach((b) => { b.disabled = !on; });
    const hiderOf = (i) => bushes[i].querySelector('.hider');
    // Ukur kedudukan haiwan bila "keluar" dari semak tanpa memaparkan apa-apa.
    const upRect = (h) => {
      h.classList.add('ss-instant', 'up');
      const r = h.getBoundingClientRect();
      h.classList.remove('up'); void h.offsetWidth; h.classList.remove('ss-instant');
      return ctx.toPct(r);
    };
    const leafAnim = (i, frames, ms) => anim(bushes[i].querySelector('.leaf'), frames, { duration: ms, fill: 'none' });
    const rustle = (i) => leafAnim(i, [{ transform: 'rotate(0)' }, { transform: 'rotate(-3deg)' }, { transform: 'rotate(3deg)' }, { transform: 'rotate(0)' }], 320);
    const shake = (i) => leafAnim(i, [{ transform: 'translateX(0)' }, { transform: 'translateX(-6%)' }, { transform: 'translateX(6%)' }, { transform: 'translateX(-3%)' }, { transform: 'translateX(0)' }], 420);
    const popUp = (i, on) => hiderOf(i).classList.toggle('up', on);
    const handAt = (i) => { const r = ctx.toPct(bushes[i].getBoundingClientRect()); ctx.hand.show(r.left + r.width * .45, r.top + 14); };

    // Haiwan muncul di SPOT (nama disebut), berjalan ke semak, kemudian menyorok di belakang daun.
    async function hide(a, i) {
      const h = hiderOf(i);
      h.innerHTML = ART[a.id]();
      const to = upRect(h);
      const from = { left: SPOT.left + '%', top: SPOT.top + '%', width: SPOT.width + '%' };
      walker.innerHTML = ART[a.id]();
      walker.classList.remove('asking'); walker.hidden = false;
      const said = say('sorok-' + a.id); // anak 3 tahun belum boleh baca kapsyen
      sfx.pop();
      await anim(walker, [{ ...from, opacity: 0, transform: 'scale(.5)' }, { ...from, opacity: 1, transform: 'scale(1)' }], { duration: 380, easing: 'cubic-bezier(.3,1.5,.5,1)' }); ctx.alive();
      await ctx.wait(Math.max(500 * pace, said * .6));
      await anim(walker, [{ ...from, opacity: 1, transform: 'scale(1)' }, { left: to.left + '%', top: to.top + '%', width: to.width + '%', opacity: 1, transform: 'scale(1)' }], { duration: 700 * pace }); ctx.alive();
      h.classList.add('ss-instant', 'up'); void h.offsetWidth; h.classList.remove('ss-instant');
      walker.hidden = true; walker.getAnimations().forEach((x) => x.cancel());
      sfx.rustle(); rustle(i);
      h.classList.remove('up');
      await ctx.wait(420);
    }
    // Tunggu tekanan; ulang soalan bila anak senyap. Pulangkan -1 jika tiada jawapan langsung.
    async function askUntilTap(target) {
      for (let r = 0; r <= REMINDERS; r++) {
        const t = await ctx.tap({ selector: '.ss-bush', ms: REMIND_MS });
        if (t) return Number(t.el.dataset.i);
        if (r < REMINDERS) say('ask-' + target.id, iconOf(target.id));
      }
      return -1;
    }

    // mode: null (biasa), 'demo' (tangan tunjuk jawapan), 'solo' (latihan; tangan hanya selepas salah).
    async function trial(k, mode, announce) {
      const n = bushCount(k);
      layout(n); arm(false); ctx.hand.hide();
      const slots = shuffle([...Array(n).keys()]).slice(0, k);
      const who = shuffle(ANIMALS).slice(0, k);
      if (mode === 'demo') await ctx.wait(Math.max(1200, say('prac') + 200));
      else if (mode === 'solo') await ctx.wait(Math.max(1000, say('watch') + 200));
      else if (announce) await ctx.wait(Math.max(1000, say(announce) + 200));
      for (let j = 0; j < k; j++) { await hide(who[j], slots[j]); await ctx.wait(200); }
      ctx.caption('');
      await ctx.wait((500 + 250 * k) * pace); // jeda: maklumat mesti disimpan dalam ingatan

      // Elak tanya haiwan yang sama dua kali berturut-turut.
      const choices = [...Array(k).keys()].filter((j) => k === 1 || who[j].id !== lastAsked);
      const q = pick(choices), target = who[q], slot = slots[q];
      lastAsked = target.id;
      say('ask-' + target.id, iconOf(target.id));
      // Haiwan yang dicari muncul besar di tengah: anak tak perlu kenal nama tapir/enggang untuk menjawab.
      walker.innerHTML = iconOf(target.id);
      Object.assign(walker.style, { left: SPOT.left + '%', top: SPOT.top + '%', width: SPOT.width + '%' });
      walker.hidden = false; walker.classList.add('asking');
      anim(walker, [{ opacity: 0 }, { opacity: 1 }], { duration: 300, fill: 'none' });
      arm(true);
      if (mode === 'demo') handAt(slot);
      const t0 = performance.now();
      let tap = await askUntilTap(target);
      const rec = { k, correct: tap === slot, rt: tap >= 0 ? Math.round(performance.now() - t0) : null, animal: target.id, found: tap === slot };
      if (tap >= 0 && tap !== slot) {
        sfx.soft(); shake(tap); say('retry');
        await ctx.wait(300);
        if (mode === 'solo') handAt(slot); // latihan: bantu selepas salah
        tap = await askUntilTap(target);
        rec.found = tap === slot;
      }
      arm(false); ctx.hand.hide();
      walker.hidden = true; walker.classList.remove('asking');
      popUp(slot, true);
      if (rec.found) { sfx.good(); await ctx.wait(Math.max(1300, say(pick(PRAISE)) + 200)); }
      else { sfx.pop(); handAt(slot); await ctx.wait(Math.max(1800, say('reveal') + 300)); ctx.hand.hide(); }
      // Semua kawan keluar sekejap: penutup yang memuaskan dan semakan visual.
      slots.forEach((s, j) => { if (s !== slot) setTimeout(() => { if (bushes[s]) popUp(s, true); }, 90 * j); });
      await ctx.wait(1300);
      slots.forEach((s) => popUp(s, false));
      await ctx.wait(450);
      return rec;
    }

    ctx.progress(TRIALS);
    await ctx.ready(); ctx.alive();
    if (ctx.first) {
      await ctx.wait(Math.max(1700, say('intro') + 200));
      // Latihan sehingga faham: demo dengan tangan, kemudian cuba sendiri. Lulus bila betul tanpa bantuan.
      for (let p = 0; p < PRACTICE_MAX; p++) {
        const r = await trial(1, p === 0 ? 'demo' : 'solo');
        if (p > 0 && r.correct) break;
      }
      await ctx.wait(Math.max(1600, say('start') + 200));
    }
    const recs = [];
    let k = state.span, streak = 0, announce = 'watch';
    for (let i = 0; i < TRIALS; i++) {
      const rec = await trial(k, null, announce);
      recs.push(rec); ctx.mark(i);
      // Tangga 2-naik-1-turun.
      announce = null;
      if (rec.correct) { if (++streak >= UP_AFTER && k < SPAN_MAX) { k++; streak = 0; announce = 'more'; } }
      else { streak = 0; k = Math.max(SPAN_MIN, k - 1); }
      state.span = k; ctx.save();
      await ctx.wait(250);
    }

    const correct = recs.filter((r) => r.correct).length;
    const found = recs.filter((r) => r.found);
    const maxK = recs.reduce((m, r) => (r.correct ? Math.max(m, r.k) : m), 0);
    const avgK = Math.round((recs.reduce((a, r) => a + r.k, 0) / recs.length) * 10) / 10;
    return {
      record: { correct, n: recs.length, maxK, avgK },
      foundHtml: found.map((r) => ART[r.animal]()).join(''),
      text: `Adik jumpa <span class="big-num">${found.length}</span> kawan.` + (maxK ? ` Paling hebat: ingat <span class="big-num">${maxK}</span> haiwan sekali gus!` : ''),
    };
  },

  parent: {
    stats(s) {
      const last = s.rounds.slice(-7);
      const okP = pct(last.reduce((a, r) => a + (r.correct || 0), 0), last.reduce((a, r) => a + (r.n || 0), 0));
      const best = s.rounds.reduce((m, r) => Math.max(m, r.maxK || 0), 0);
      return [
        { v: okP === null ? '–' : okP + '%', label: 'Ingat betul' },
        { v: s.span, label: 'Haiwan sekarang' },
        { v: best || '–', label: 'Rekod terbaik' },
      ];
    },
    cols: ['Betul', 'Paling banyak', 'Purata'],
    row: (r) => [meter(pct(r.correct, r.n)), (r.maxK || '–') + ' haiwan', r.avgK],
    explain: `<span><b>Ingatan kerja</b>: berapa banyak tempat anak boleh simpan dalam fikiran sekali gus, serupa dengan ujian "ingatan lokasi" untuk kanak-kanak prasekolah.</span>
      <span>Bilangan haiwan naik seekor bila anak betul 2 kali berturut-turut, dan turun seekor bila tersilap. <b>Betul</b> dikira hanya pada cubaan pertama. <b>Umur 3 tahun</b>: main bersama 1–2 pusingan pertama; mula dengan 1 haiwan dan rentak lebih perlahan.</span>`,
  },

  mission: {
    title: 'Main "Sorok Bawah Cawan" di rumah',
    steps: [
      'Letak 3 cawan terbalik. Sorokkan 2 mainan kecil di bawahnya sambil anak tengok.',
      'Minta anak tutup mata dan kira sampai 3.',
      'Tanya: <b>"Mana kereta?"</b> Anak angkat cawan yang betul.',
      'Bila dah senang, tambah satu cawan dan satu mainan. Bergilir-gilir: biar anak pula sorok.',
    ],
    why: 'Kenapa? Permainan ini melatih ingatan kerja, iaitu kebolehan menyimpan maklumat dalam fikiran untuk seketika. Kemahiran ini penting untuk ikut arahan, mengira dan membaca.',
  },
};
