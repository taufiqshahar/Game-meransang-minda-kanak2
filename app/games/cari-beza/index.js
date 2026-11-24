// Cari Beza: perhatian visual dan perbandingan teliti. Dua gambar hampir sama (atas dan bawah); tekan beza pada mana-mana gambar.
// Beza dijana rawak setiap kali (barang yang diubah dan gambar mana yang berubah), jadi anak tidak boleh menghafal.
// Tahap 1–2: barang hilang (mudah dilihat) · Tahap 3: + tukar warna · Tahap 4: + beza kecil (kelapa, kon, ketam).
// Tekan tempat yang tiada beza = bunyi lembut sahaja; 3 kali tersilap berturut-turut atau senyap lama → tangan menunjuk.
import { vehicleIcon } from '../../kit/vehicles.js';
import { bendaIcon } from '../../kit/benda.js';
import { shuffle, pct, meter } from '../../kit/util.js';

const inner = (s) => s.replace(/<\/?svg[^>]*>/g, '');
const at = (s, x, y, sc, style = '') => `<g transform="translate(${x} ${y}) scale(${sc})"${style ? ` style="${style}"` : ''}>${inner(s)}</g>`;
const sun = (x, y, r = 5.5, rays = true) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#FFD84D" stroke="#E0A800" stroke-width=".8"/>${rays ? `<g stroke="#FFD84D" stroke-width="1.4" stroke-linecap="round">${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => { const t = a * Math.PI / 180; return `<path d="M${(x + (r + 1.6) * Math.cos(t)).toFixed(1)} ${(y + (r + 1.6) * Math.sin(t)).toFixed(1)} L${(x + (r + 4) * Math.cos(t)).toFixed(1)} ${(y + (r + 4) * Math.sin(t)).toFixed(1)}"/>`; }).join('')}</g>` : ''}`;
const cloud = (x, y, s = 1) => `<g fill="#fff" transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="0" rx="8" ry="4"/><ellipse cx="5" cy="-2.5" rx="5.5" ry="4"/><ellipse cx="-5" cy="-1.5" rx="4.5" ry="3.4"/></g>`;
const birds = (x, y) => `<g stroke="#2B2F36" stroke-width=".9" fill="none" stroke-linecap="round"><path d="M${x - 5} ${y} q2.5 -2.5 5 0 q2.5 -2.5 5 0"/><path d="M${x + 1} ${y + 5} q2 -2 4 0 q2 -2 4 0"/></g>`;
const hen = (x, y) => `<g transform="translate(${x} ${y})"><path d="M-1 4 v3 M2 4 v3" stroke="#F28A2C" stroke-width=".9"/><ellipse cx="0" cy="0" rx="5.5" ry="4.2" fill="#FFFDF5" stroke="#8A9199" stroke-width=".8"/><path d="M4 -1 Q8 -5 6 -8 Q9 -4 5 1 Z" fill="#FFFDF5" stroke="#8A9199" stroke-width=".7"/><circle cx="-4.5" cy="-4" r="2.6" fill="#FFFDF5" stroke="#8A9199" stroke-width=".7"/><path d="M-6 -6.5 q1 -2 2 0 q1 -2 2 0" fill="#E5484D"/><path d="M-7 -4 l-2 .8 2 .8z" fill="#F5B82E"/><circle cx="-5" cy="-4.4" r=".5" fill="#2B2F36"/></g>`;
const cone = (x, y) => `<g transform="translate(${x} ${y})"><path d="M-3 0 L-1 -8 H1 L3 0 Z" fill="#F28A2C" stroke="#A3511A" stroke-width=".7" stroke-linejoin="round"/><path d="M-2 -3 H2" stroke="#FFFDF5" stroke-width="1.2"/><rect x="-4" y="0" width="8" height="1.4" fill="#A3511A"/></g>`;

// Setiap barang: id, jenis beza, hit [x, y, jejari] dalam koordinat 100×64, dan lukisan (alt = versi yang diubah).
const SCENES = {
  kampung: {
    name: 'Kampung',
    bg: `<rect width="100" height="64" fill="#BFE6F5"/><path d="M0 40 Q20 30 45 38 Q70 28 100 36 V64 H0 Z" fill="#9FD28A"/><rect y="44" width="100" height="20" fill="#8BCB6E"/>
      <path d="M44 64 Q50 52 62 44" stroke="#E2C48E" stroke-width="5" fill="none"/>
      <g stroke="#6E4520" stroke-width="1.6"><path d="M10 36 V46 M18 36 V46 M28 36 V46 M36 36 V46"/></g>
      <rect x="7" y="34" width="32" height="2.4" fill="#8A5A2E"/><rect x="9" y="22" width="28" height="12" fill="#D9A766" stroke="#8A5A1E" stroke-width=".8"/>
      <path d="M5 23 L23 8 L41 23 Z" fill="#B0412E" stroke="#7A1F14" stroke-width=".9" stroke-linejoin="round"/>
      <rect x="12" y="25" width="7" height="6" fill="#A9DBF3" stroke="#8A5A1E" stroke-width=".7"/>
      <path d="M33 36 L38 46 M35 36 L40 46" stroke="#8A5A2E" stroke-width=".8"/>
      <path d="M90 60 Q88 40 86 26" stroke="#8A5A2E" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      <g fill="#4FAE3E" stroke="#22681A" stroke-width=".6">${[[-24, 10], [-6, 14], [14, 12], [26, 4], [-18, -2]].map(([dx, dy]) => `<path d="M86 25 Q${86 + dx / 2} ${25 - 8 + dy / 3} ${86 + dx} ${25 + dy / 2} Q${86 + dx / 2} ${25 - 3 + dy / 3} 86 25 Z"/>`).join('')}</g>`,
    items: [
      { id: 'matahari', kind: 'hilang', hit: [88, 9, 9], draw: (alt) => (alt ? '' : sun(88, 9)) },
      { id: 'awan', kind: 'hilang', hit: [60, 10, 10], draw: (alt) => (alt ? '' : cloud(60, 10, 1.1)) },
      { id: 'ayam', kind: 'hilang', hit: [53, 52, 8], draw: (alt) => (alt ? '' : hen(53, 52)) },
      { id: 'basikal', kind: 'hilang', hit: [74, 48, 11], draw: (alt) => (alt ? '' : at(vehicleIcon('basikal'), 62, 38, .15)) },
      { id: 'pintu', kind: 'warna', hit: [29.5, 29, 7], draw: (alt) => `<rect x="26" y="24" width="7" height="10" fill="${alt ? '#2F7DE1' : '#8A5A2E'}" stroke="#5E3C1E" stroke-width=".7"/>` },
      { id: 'bunga', kind: 'warna', hit: [14, 54, 7], draw: (alt) => `<path d="M14 62 V55" stroke="#2C6E1E" stroke-width=".9"/><g fill="${alt ? '#7B4FC9' : '#E5484D'}">${[0, 72, 144, 216, 288].map((a) => { const t = a * Math.PI / 180; return `<circle cx="${(14 + 2.4 * Math.cos(t)).toFixed(1)}" cy="${(53 + 2.4 * Math.sin(t)).toFixed(1)}" r="1.8"/>`; }).join('')}</g><circle cx="14" cy="53" r="1.3" fill="#F5C531"/>` },
      { id: 'kelapa', kind: 'kecil', hit: [86, 28, 6], draw: (alt) => `<g fill="#7A4B25">${(alt ? [[85, 28]] : [[84, 28], [87.5, 28.5], [85.8, 31]]).map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.7"/>`).join('')}</g>` },
    ],
  },
  binaan: {
    name: 'Tapak binaan',
    bg: `<rect width="100" height="64" fill="#CFE9F5"/><rect y="42" width="100" height="22" fill="#C9A06A"/><path d="M0 42 H100" stroke="#A9773E" stroke-width=".8"/>
      <g fill="#B08452" opacity=".6"><ellipse cx="30" cy="58" rx="5" ry="1"/><ellipse cx="80" cy="60" rx="6" ry="1"/></g>
      ${cone(40, 61)}${cone(52, 61)}`,
    items: [
      { id: 'matahari', kind: 'hilang', hit: [88, 9, 9], draw: (alt) => (alt ? '' : sun(88, 9)) },
      { id: 'awan', kind: 'hilang', hit: [24, 8, 9], draw: (alt) => (alt ? '' : cloud(24, 8)) },
      { id: 'burung', kind: 'hilang', hit: [52, 13, 8], draw: (alt) => (alt ? '' : birds(51, 11)) },
      { id: 'lori', kind: 'hilang', hit: [73, 44, 13], draw: (alt) => (alt ? '' : at(vehicleIcon('lori'), 53, 30, .25)) },
      { id: 'bata', kind: 'hilang', hit: [9, 58, 7], draw: (alt) => (alt ? '' : `<g fill="#C8563A" stroke="#7A2E1A" stroke-width=".5">${[[3, 59], [8, 59], [13, 59], [5.5, 56.6], [10.5, 56.6], [8, 54.2]].map(([x, y]) => `<rect x="${x}" y="${y}" width="5" height="2.4"/>`).join('')}</g>`) },
      { id: 'jengkaut', kind: 'warna', hit: [22, 38, 13], draw: (alt) => at(vehicleIcon('jengkaut'), 2, 22, .25, alt ? 'filter:hue-rotate(160deg) saturate(1.3)' : '') },
      { id: 'kon', kind: 'kecil', hit: [46, 57, 5], draw: (alt) => (alt ? '' : cone(46, 61)) },
    ],
  },
  pantai: {
    name: 'Pantai',
    bg: `<rect width="100" height="64" fill="#A6DCF5"/><rect y="28" width="100" height="14" fill="#4FA8DC"/>
      <g stroke="#fff" stroke-width=".8" fill="none" opacity=".7"><path d="M8 33 q3 -2 6 0 M30 37 q3 -2 6 0 M80 34 q3 -2 6 0"/></g>
      <path d="M0 42 Q50 38 100 42 V64 H0 Z" fill="#F3D9A4"/><g fill="#E2C48E">${[[20, 50], [70, 60], [90, 48], [8, 60]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".8"/>`).join('')}</g>`,
    items: [
      { id: 'perahu', kind: 'hilang', hit: [68, 28, 9], draw: (alt) => (alt ? '' : `<path d="M60 32 H76 L73 36 H63 Z" fill="#B07A44" stroke="#6E4520" stroke-width=".7"/><path d="M68 32 V20" stroke="#6E4520" stroke-width=".8"/><path d="M68.5 20 L76 30 H68.5 Z" fill="#FFFDF5" stroke="#8A9199" stroke-width=".6"/><path d="M67.5 22 L62 30 H67.5 Z" fill="#E5484D"/>`) },
      { id: 'burung', kind: 'hilang', hit: [40, 11, 8], draw: (alt) => (alt ? '' : birds(40, 9)) },
      { id: 'istana', kind: 'hilang', hit: [56, 52, 8], draw: (alt) => (alt ? '' : `<g fill="#E2B57A" stroke="#A9773E" stroke-width=".7"><rect x="50" y="50" width="12" height="7"/><rect x="49" y="45" width="4" height="6"/><rect x="59" y="45" width="4" height="6"/><rect x="54" y="43" width="4" height="8"/></g><path d="M56 43 V39 l3 1 -3 1" stroke="#E5484D" stroke-width=".7" fill="#E5484D"/>`) },
      { id: 'bola', kind: 'hilang', hit: [84, 55, 7], draw: (alt) => (alt ? '' : at(bendaIcon('bola'), 78, 49, .2)) },
      { id: 'payung', kind: 'warna', hit: [24, 42, 10], draw: (alt) => `<path d="M24 40 V58" stroke="#6E4520" stroke-width="1"/><path d="M12 42 Q24 30 36 42 Z" fill="${alt ? '#22B26A' : '#E5484D'}" stroke="#2B2F36" stroke-width=".6"/><path d="M18 42 Q22 33 24 32 Q26 33 30 42" fill="none" stroke="#FFFDF5" stroke-width="1.6"/>` },
      { id: 'matahari', kind: 'kecil', hit: [14, 10, 8], draw: (alt) => sun(14, 10, 5, !alt) },
      { id: 'ketam', kind: 'kecil', hit: [38, 58, 5.5], draw: (alt) => (alt ? '' : `<g transform="translate(38 58)"><ellipse cx="0" cy="0" rx="3" ry="2" fill="#E5484D" stroke="#9E1F24" stroke-width=".5"/><path d="M-3 -1 l-2 -2 M3 -1 l2 -2 M-2 1.5 l-1.5 1.5 M2 1.5 l1.5 1.5" stroke="#9E1F24" stroke-width=".6"/><circle cx="-5" cy="-3.2" r="1" fill="#E5484D"/><circle cx="5" cy="-3.2" r="1" fill="#E5484D"/></g>`) },
    ],
  },
};
const SCENE_IDS = Object.keys(SCENES);

// n = bilangan beza · kinds = jenis beza yang dibenarkan · must = jenis yang mesti ada sekurang-kurangnya satu
const LEVELS = [null,
  { n: 2, kinds: ['hilang'], big: true },
  { n: 3, kinds: ['hilang'] },
  { n: 4, kinds: ['hilang', 'warna'], must: 'warna' },
  { n: 5, kinds: ['hilang', 'warna', 'kecil'], must: 'kecil' },
];
const MAX_LEVEL = 4;
const AGE_LEVEL = { 3: 1, 4: 2, 5: 3, 6: 3 };
const IDLE_MS = 12000;
const MISS_HINT = 3;
const UP_MISS = 3, DOWN_HINTS = 3; // naik jika jumlah tersilap ≤ 3 tanpa bantuan; turun jika bantuan ≥ 3

export default {
  id: 'cari-beza',
  title: 'Cari Beza',
  stageLabel: 'Dua gambar hampir sama, satu di atas dan satu di bawah. Tekan tempat yang berbeza.',
  lines: {
    intro: 'Dua gambar ni nampak sama. Tapi ada yang berbeza! Jom cari.',
    'cari-2': 'Cari dua beza.', 'cari-3': 'Cari tiga beza.', 'cari-4': 'Cari empat beza.', 'cari-5': 'Cari lima beza.',
    semua: 'Semua beza dah jumpa!',
  },
  recorded: ['intro', 'cari-2', 'cari-3', 'cari-4', 'cari-5', 'semua'],

  css: `.cb-pic { left: 3%; width: 94%; aspect-ratio: 100 / 64; z-index: 2; border-radius: calc(var(--u) * 3); overflow: hidden; border: calc(var(--u) * .8) solid #FFFDF5; box-shadow: 0 calc(var(--u) * 1) 0 rgba(0,0,0,.2); }
.cb-pic.top { top: 10%; } .cb-pic.bot { top: 56%; }
.cb-pic > svg { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
.cb-hit { position: absolute; transform: translate(-50%, -50%); aspect-ratio: 1; padding: 0; border-radius: 50%; background: transparent; border: calc(var(--u) * .9) solid transparent; }
.cb-hit.found { border-color: var(--kuning); box-shadow: 0 0 0 calc(var(--u) * .6) rgba(21,48,42,.5); }
.cb-hit:disabled { cursor: default; }
.cb-count { left: 0; right: 0; top: 50.8%; height: 4.6%; z-index: 2; display: flex; justify-content: center; align-items: center; gap: calc(var(--u) * 1.6); }
.cb-count i { width: calc(var(--u) * 5.4); aspect-ratio: 1; border-radius: 50%; background: rgba(255,253,245,.35); border: calc(var(--u) * .5) solid rgba(255,253,245,.7); }
.cb-count i.on { background: var(--kuning); border-color: #FFFDF5; }`,

  stageHtml: () => `<svg class="bg" viewBox="0 0 200 300" preserveAspectRatio="none" aria-hidden="true"><rect width="200" height="300" fill="#3D7F6A"/><rect y="100" width="200" height="14" fill="#356F5C"/></svg>
    <div class="cb-pic top"></div><div class="cb-count"></div><div class="cb-pic bot"></div>`,

  initState: (age) => ({ age, level: AGE_LEVEL[age], rounds: [] }),
  normalize(s, age) {
    if (s.age !== age) { s.age = age; s.level = AGE_LEVEL[age]; }
    if (!Number.isInteger(s.level) || s.level < 1 || s.level > MAX_LEVEL) s.level = AGE_LEVEL[age];
    return s;
  },

  async round(ctx) {
    const { stage, state, say, sfx, anim } = ctx;
    const tops = stage.querySelector('.cb-pic.top'), bots = stage.querySelector('.cb-pic.bot'), countEl = stage.querySelector('.cb-count');
    const level = state.level, L = LEVELS[level];

    function chooseDiffs(S) {
      let pool = S.items.filter((it) => L.kinds.includes(it.kind));
      if (L.big) pool = pool.filter((it) => it.hit[2] >= 9).concat(pool.filter((it) => it.hit[2] < 9)); // utamakan barang besar
      const picks = L.big ? pool.slice(0, Math.max(L.n, 4)) : pool;
      let out = shuffle(picks).slice(0, L.n);
      if (L.must && !out.some((it) => it.kind === L.must)) {
        const m = shuffle(pool.filter((it) => it.kind === L.must))[0];
        if (m) out = [m, ...out.slice(0, L.n - 1)];
      }
      return out;
    }

    async function trial(sid, demo) {
      const S = SCENES[sid];
      const diffs = chooseDiffs(S);
      const altTop = Object.fromEntries(diffs.map((d) => [d.id, Math.random() < .5]));
      const isDiff = (id) => diffs.some((d) => d.id === id);
      const render = (top) => `<svg viewBox="0 0 100 64" aria-hidden="true">${S.bg}${S.items.map((it) => it.draw(isDiff(it.id) && altTop[it.id] === top)).join('')}</svg>`
        + diffs.map((d) => `<button class="cb-hit" type="button" data-id="${d.id}" aria-label="Beza" style="left:${d.hit[0]}%;top:${d.hit[1] / 64 * 100}%;width:${d.hit[2] * 2}%" disabled></button>`).join('');
      tops.innerHTML = render(true); bots.innerHTML = render(false);
      tops.setAttribute('aria-label', `${S.name}, gambar atas`); bots.setAttribute('aria-label', `${S.name}, gambar bawah`);
      countEl.innerHTML = diffs.map(() => '<i></i>').join('');
      const hits = [...stage.querySelectorAll('.cb-hit')];
      const left = () => diffs.filter((d) => !tops.querySelector(`.cb-hit[data-id="${d.id}"]`).classList.contains('found'));
      const arm = (on) => hits.forEach((h) => { h.disabled = !on || h.classList.contains('found'); });
      const hint = () => { const d = left()[0]; if (!d) return; const r = ctx.toPct(bots.querySelector(`.cb-hit[data-id="${d.id}"]`).getBoundingClientRect()); ctx.hand.show(r.left + r.width * .3, r.top + r.height * .4); };
      sfx.pop();
      anim(bots, [{ opacity: 0 }, { opacity: 1 }], { duration: 400, fill: 'none' });
      await ctx.wait(Math.max(1100, say(`cari-${diffs.length}`) + 150));

      let found = 0, misses = 0, missRun = 0, hints = 0;
      while (found < diffs.length) {
        stage.dataset.answer = left().map((d) => d.id).join(','); // untuk ujian automatik
        if (demo && found === 0 && misses === 0) hint();
        arm(true);
        const tap = await ctx.tap({ selector: '.cb-hit, .cb-pic', ms: IDLE_MS });
        arm(false);
        if (!tap) { hints++; hint(); await ctx.wait(Math.max(900, say('tengok') + 100)); continue; }
        if (tap.el.classList.contains('cb-hit')) {
          ctx.hand.hide();
          const id = tap.el.dataset.id;
          stage.querySelectorAll(`.cb-hit[data-id="${id}"]`).forEach((h) => { h.classList.add('found'); anim(h, [{ transform: 'translate(-50%, -50%) scale(1.6)', opacity: 0 }, { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 }], { duration: 350, fill: 'none' }); });
          found++; missRun = 0;
          countEl.children[found - 1].classList.add('on');
          sfx.good();
          await ctx.wait(Math.max(500, say(`n${found}`) - 100));
        } else {
          misses++; missRun++;
          sfx.soft();
          if (missRun >= MISS_HINT) { missRun = 0; hints++; hint(); await ctx.wait(Math.max(900, say('tengok') + 100)); }
          else await ctx.wait(250);
        }
      }
      ctx.hand.hide();
      await ctx.wait(Math.max(1300, say('semua') + 300));
      return { sid, n: diffs.length, misses, hints, kinds: diffs.map((d) => d.kind) };
    }

    const order = shuffle(SCENE_IDS);
    ctx.progress(order.length);
    await ctx.ready(); ctx.alive();
    if (ctx.first) await ctx.wait(Math.max(4000, say('intro') + 200));
    const recs = [];
    for (let i = 0; i < order.length; i++) {
      recs.push(await trial(order[i], ctx.first && i === 0 && level === 1));
      ctx.mark(i);
      await ctx.wait(300);
    }
    delete stage.dataset.answer;

    const found = recs.reduce((a, r) => a + r.n, 0), misses = recs.reduce((a, r) => a + r.misses, 0), hints = recs.reduce((a, r) => a + r.hints, 0);
    if (misses <= UP_MISS && hints === 0) state.level = Math.min(MAX_LEVEL, level + 1);
    else if (hints >= DOWN_HINTS) state.level = Math.max(1, level - 1);
    return {
      record: { level, found, misses, hints },
      foundHtml: '',
      text: `Adik jumpa <span class="big-num">${found}</span> beza dalam ${recs.length} gambar!` + (hints === 0 ? ' Semuanya sendiri, tanpa bantuan.' : ''),
    };
  },

  parent: {
    stats(s) {
      const last = s.rounds.slice(-7);
      const acc = pct(last.reduce((a, r) => a + (r.found || 0), 0), last.reduce((a, r) => a + (r.found || 0) + (r.misses || 0), 0));
      const helped = last.reduce((a, r) => a + (r.hints || 0), 0);
      return [
        { v: acc === null ? '–' : acc + '%', label: 'Ketepatan tekanan' },
        { v: `${s.level}<small>/${MAX_LEVEL}</small>`, label: 'Tahap' },
        { v: String(helped), label: 'Bantuan (7 sesi lepas)' },
      ];
    },
    cols: ['Tahap', 'Ketepatan', 'Bantuan'],
    row: (r) => [r.level, meter(pct(r.found, (r.found || 0) + (r.misses || 0))), r.hints || 0],
    explain: `<span><b>Perhatian visual dan perbandingan</b>: membanding dua gambar bahagian demi bahagian melatih fokus, kesabaran dan imbasan teratur (kiri ke kanan, atas ke bawah), kemahiran yang sama digunakan untuk membaca dan menyemak kerja.</span>
      <span>Tahap 1: 2 barang hilang (besar) · Tahap 2: 3 barang hilang · Tahap 3: 4 beza termasuk tukar warna · Tahap 4: 5 beza termasuk beza kecil. Ketepatan = beza dijumpai berbanding tekanan rawak; anak yang meneka secara rawak akan dibantu dan tahap diturunkan.</span>`,
  },

  mission: {
    title: 'Main "Apa yang berubah?"',
    steps: [
      'Susun 4–5 barang di atas meja (cawan, sudu, kereta mainan). Biar anak tengok 10 saat.',
      'Minta anak tutup mata. Alihkan atau sorok <b>satu</b> barang.',
      'Tanya: <b>"Apa yang berubah?"</b> Kemudian bertukar peranan.',
      'Bila dah pandai, ubah dua benda sekaligus atau tukar warna (cawan merah → biru).',
    ],
    why: 'Kenapa? Permainan ini melatih anak memerhati dengan teliti dan mengingat apa yang dilihat, asas untuk fokus di sekolah.',
  },
};
