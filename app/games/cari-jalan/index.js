// Cari Jalan: perancangan + fleksibiliti kognitif. Anak bina jalan petak demi petak untuk membawa kereta bomba ke rumah.
// Tahap 2–4: di tengah perjalanan satu petak di laluan terpendek tiba-tiba DITUTUP, jadi anak mesti buang rancangan
// asal dan cari jalan lain (menukar strategi bila keadaan berubah). "Langkah lebih" = langkah melebihi laluan terbaik.
import { vehicleIcon } from '../../kit/vehicles.js';
import { pick, pct } from '../../kit/util.js';

// C×R grid · obs = halangan (pokok/kolam) · blocks = jalan ditutup setiap teka-teki · from = mula ditutup dari teka-teki ke-n
// glow = petak yang boleh ditekan bercahaya (bantuan)
const LEVELS = [null,
  { C: 3, R: 4, obs: 2, blocks: 0, from: 9, glow: true },
  { C: 4, R: 5, obs: 3, blocks: 1, from: 1, glow: true },
  { C: 4, R: 5, obs: 4, blocks: 1, from: 0, glow: false },
  { C: 5, R: 6, obs: 6, blocks: 2, from: 0, glow: false },
];
const MAX_LEVEL = 4;
const AGE_LEVEL = { 3: 1, 4: 1, 5: 2, 6: 3 };
const PUZZLES = 3;
const IDLE_MS = 9000;
const TREE = '<svg viewBox="0 0 40 40" aria-hidden="true"><rect x="17" y="24" width="6" height="12" rx="2" fill="#8A5A2E"/><circle cx="20" cy="17" r="13" fill="#3E9E4A" stroke="#246B2E" stroke-width="2"/><circle cx="15" cy="13" r="3" fill="#6CC04E"/></svg>';
const POND = '<svg viewBox="0 0 40 40" aria-hidden="true"><ellipse cx="20" cy="22" rx="16" ry="11" fill="#40A0DC" stroke="#1F6FA8" stroke-width="2"/><path d="M10 21 q4 -3 8 0 M22 25 q4 -3 8 0" stroke="#BDE8F7" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';
const BLOCK = '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M8 34 V18 M32 34 V18" stroke="#6B7684" stroke-width="3" stroke-linecap="round"/><rect x="3" y="12" width="34" height="11" rx="2" fill="#FFFDF5" stroke="#C0392B" stroke-width="2"/><path d="M8 12 L13 23 M18 12 L23 23 M28 12 L33 23" stroke="#E5484D" stroke-width="4"/><circle cx="6" cy="9" r="3" fill="#F28A2C"/><circle cx="34" cy="9" r="3" fill="#F28A2C"/></svg>';
const HOUSE = '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M6 19 L20 6 L34 19 Z" fill="#E5484D" stroke="#8E1F22" stroke-width="2" stroke-linejoin="round"/><rect x="9" y="18" width="22" height="17" fill="#FFE9A8" stroke="#A9773E" stroke-width="2"/><rect x="17" y="24" width="7" height="11" fill="#8A5A2E"/><rect x="11" y="21" width="5" height="5" fill="#A9DBF3"/></svg>';

function bfs(C, R, start, goal, bad) {
  const prev = new Array(C * R).fill(-1), seen = new Uint8Array(C * R), q = [start];
  seen[start] = 1;
  while (q.length) {
    const i = q.shift();
    if (i === goal) break;
    for (const j of nbrs(C, R, i)) if (!seen[j] && !bad.has(j)) { seen[j] = 1; prev[j] = i; q.push(j); }
  }
  if (!seen[goal]) return null;
  const path = [goal];
  while (path[0] !== start) path.unshift(prev[path[0]]);
  return path; // termasuk mula dan sasaran
}
function nbrs(C, R, i) {
  const c = i % C, r = Math.floor(i / C), out = [];
  if (r > 0) out.push(i - C); if (r < R - 1) out.push(i + C); if (c > 0) out.push(i - 1); if (c < C - 1) out.push(i + 1);
  return out;
}
function makePuzzle(L) {
  for (let tries = 0; tries < 200; tries++) {
    const start = (L.R - 1) * L.C + Math.floor(Math.random() * L.C), goal = Math.floor(Math.random() * L.C);
    const obs = new Set();
    while (obs.size < L.obs) { const i = Math.floor(Math.random() * L.C * L.R); if (i !== start && i !== goal) obs.add(i); }
    const p = bfs(L.C, L.R, start, goal, obs);
    // Mesti ada jalan, dan untuk tahap dengan jalan ditutup mesti ada laluan lain juga.
    if (!p) continue;
    if (L.blocks && !p.slice(1, -1).some((b) => bfs(L.C, L.R, start, goal, new Set([...obs, b])))) continue;
    return { start, goal, obs };
  }
  return { start: (L.R - 1) * L.C, goal: L.C - 1, obs: new Set() };
}

export default {
  id: 'cari-jalan',
  title: 'Cari Jalan',
  stageLabel: 'Peta petak dengan kereta bomba di bawah dan rumah di atas. Tekan petak di sebelah kereta satu demi satu untuk membina jalan ke rumah.',
  lines: { intro: 'Tolong kereta bomba sampai ke rumah! Tekan jalan satu-satu.', tutup: 'Alamak, jalan tutup! Cari jalan lain.', sampai: 'Sampai!' },
  recorded: ['intro', 'tutup', 'sampai'],

  css: `.cj-grid { z-index: 2; }
.cj-cell { position: absolute; padding: 0; border-radius: 16%; background: rgba(255,253,245,.32); box-shadow: inset 0 0 0 calc(var(--u) * .5) rgba(21,48,42,.18); transition: background .2s, box-shadow .2s; }
.cj-cell svg { position: absolute; inset: 8%; width: 84%; height: 84%; }
.cj-cell.road { background: #7D8794; box-shadow: inset 0 0 0 calc(var(--u) * .6) #5C6570; }
.cj-cell.road::after { content: ''; position: absolute; left: 44%; right: 44%; top: 30%; bottom: 30%; border-radius: 99px; background: #FFFDF5; opacity: .7; }
.cj-cell.can { box-shadow: inset 0 0 0 calc(var(--u) * 1) var(--kuning); background: rgba(255,226,122,.45); }
.cj-cell.obs, .cj-cell.blk { background: transparent; box-shadow: none; }
.cj-cell.goal { background: rgba(255,253,245,.6); }
.cj-cell.goal.can { background: rgba(255,226,122,.7); }
.cj-cell:disabled { cursor: default; }
.cj-truck { position: absolute; z-index: 3; pointer-events: none; transition: left .32s ease-in-out, top .32s ease-in-out; }
.cj-truck svg { position: absolute; inset: 4%; width: 92%; height: 92%; transition: transform .2s; }
.cj-truck.left svg { transform: scaleX(-1); }`,

  stageHtml: () => `<svg class="bg" viewBox="0 0 200 300" preserveAspectRatio="none" aria-hidden="true">
      <rect width="200" height="300" fill="#8FD16A"/><circle cx="40" cy="40" r="60" fill="#9ED97B"/><circle cx="170" cy="260" r="70" fill="#82C45E"/>
      ${[[14, 70], [186, 120], [20, 270], [176, 30]].map(([x, y]) => `<g transform="translate(${x} ${y})"><circle r="3" fill="#FFFDF5"/><circle r="1.3" fill="#F5B82E"/></g>`).join('')}
    </svg>
    <div class="cj-grid"></div>`,

  initState: (age) => ({ age, level: AGE_LEVEL[age], rounds: [] }),
  normalize(s, age) {
    if (s.age !== age) { s.age = age; s.level = AGE_LEVEL[age]; }
    if (!Number.isInteger(s.level) || s.level < 1 || s.level > MAX_LEVEL) s.level = AGE_LEVEL[age];
    return s;
  },

  async round(ctx) {
    const { stage, state, say, sfx, anim } = ctx;
    const level = state.level, L = LEVELS[level], { C, R } = L;
    const grid = stage.querySelector('.cj-grid');
    // Saiz petak (unit pentas: lebar 100, tinggi 150), grid di tengah kawasan bawah kapsyen.
    const s = Math.min(88 / C, 110 / R), gw = s * C, gh = s * R, gy = 28 + (112 - gh) / 2;
    Object.assign(grid.style, { left: (100 - gw) / 2 + '%', width: gw + '%', top: gy / 1.5 + '%', height: gh / 1.5 + '%' });

    async function puzzle(pi, demo) {
      const P = makePuzzle(L), bad = new Set(P.obs);
      grid.innerHTML = Array.from({ length: C * R }, (_, i) => {
        const c = i % C, r = Math.floor(i / C), o = P.obs.has(i);
        const cls = o ? 'obs' : i === P.start ? 'road' : i === P.goal ? 'goal' : '';
        const art = o ? (Math.random() < .7 ? TREE : POND) : i === P.goal ? HOUSE : '';
        return `<button class="cj-cell ${cls}" type="button" data-i="${i}" style="left:${c / C * 100}%;top:${r / R * 100}%;width:${100 / C}%;height:${100 / R}%" aria-label="${o ? 'Halangan' : i === P.goal ? 'Rumah' : `Petak baris ${r + 1} lajur ${c + 1}`}"${o ? ' disabled' : ''}>${art}</button>`;
      }).join('') + `<div class="cj-truck" style="width:${100 / C}%;height:${100 / R}%">${vehicleIcon('bomba')}</div>`;
      const cells = [...grid.querySelectorAll('.cj-cell')], truck = grid.querySelector('.cj-truck');
      let pos = P.start;
      const put = (i) => { truck.style.left = (i % C) / C * 100 + '%'; truck.style.top = Math.floor(i / C) / R * 100 + '%'; };
      put(pos);
      const path = () => bfs(C, R, pos, P.goal, bad);
      let ideal = path().length - 1, steps = 0, invalid = 0, streak = 0, blocksLeft = pi >= L.from ? L.blocks : 0, blocked = 0;
      let nextBlockAt = 1 + Math.floor(Math.random() * 2);
      const best = () => path()[1];
      const can = (i) => nbrs(C, R, pos).includes(i) && !bad.has(i);
      const showGlow = (on) => cells.forEach((c, i) => c.classList.toggle('can', on && can(i)));
      const handAt = (i) => { const r = ctx.toPct(cells[i].getBoundingClientRect()); ctx.hand.show(r.left + r.width * .45, r.top + r.width * .3); };

      async function block() {
        // Tutup petak di laluan terpendek (1–3 langkah di hadapan) yang paling memanjangkan perjalanan, asalkan masih ada jalan.
        const p = path(), cand = p.slice(1, Math.min(4, p.length - 1));
        let pickI = -1, bestLen = -1;
        for (const b of cand) { const q = bfs(C, R, pos, P.goal, new Set([...bad, b])); if (q && q.length > bestLen) { bestLen = q.length; pickI = b; } }
        if (pickI < 0) return false;
        bad.add(pickI);
        const el = cells[pickI];
        el.classList.remove('road', 'can'); el.classList.add('blk'); el.disabled = true; el.innerHTML = BLOCK; el.setAttribute('aria-label', 'Jalan ditutup');
        anim(el.firstElementChild, [{ transform: 'translateY(-60%) scale(.6)', opacity: 0 }, { transform: 'translateY(8%) scale(1.05)', opacity: 1 }, { transform: 'none', opacity: 1 }], { duration: 450 });
        sfx.soft();
        await ctx.wait(Math.max(1800, say('tutup') + 200));
        ideal = steps + bestLen - 1; blocked++;
        return true;
      }

      sfx.pop();
      for (;;) {
        const nb = best();
        stage.dataset.answer = String(nb); // untuk ujian automatik
        showGlow(L.glow);
        if (demo && steps === 0) handAt(nb);
        const tap = await ctx.tap({ selector: '.cj-cell', ms: IDLE_MS });
        showGlow(false); ctx.hand.hide();
        if (!tap) { handAt(nb); if (L.glow || steps === 0) say('intro'); await ctx.wait(1200); continue; }
        const i = Number(tap.el.dataset.i);
        if (i === pos) continue;
        if (!can(i)) {
          // Bukan petak bersebelahan: goyang, tunjuk petak yang boleh ditekan.
          invalid++; streak++; sfx.soft();
          anim(tap.el, [{ transform: 'translateX(0)' }, { transform: 'translateX(-8%)' }, { transform: 'translateX(8%)' }, { transform: 'translateX(0)' }], { duration: 300, fill: 'none' });
          showGlow(true); await ctx.wait(900); showGlow(false);
          if (streak >= 3) { handAt(best()); await ctx.wait(900); }
          continue;
        }
        streak = 0; steps++;
        const prevC = pos % C;
        pos = i;
        if (i % C < prevC) truck.classList.add('left'); else if (i % C > prevC) truck.classList.remove('left');
        if (i !== P.goal) cells[i].classList.add('road');
        put(pos); sfx.light();
        await ctx.wait(340);
        if (pos === P.goal) break;
        if (blocksLeft > 0 && steps >= nextBlockAt && path().length - 1 >= 2) {
          if (await block()) { blocksLeft--; nextBlockAt = steps + 2; }
        }
      }
      delete stage.dataset.answer;
      sfx.good();
      anim(cells[P.goal].firstElementChild, [{ transform: 'scale(1)' }, { transform: 'scale(1.18)' }, { transform: 'scale(1)' }], { duration: 500, fill: 'none' });
      await ctx.wait(Math.max(1200, say('sampai') + 300));
      return { extra: Math.max(0, steps - ideal), invalid, blocked };
    }

    ctx.progress(PUZZLES);
    await ctx.ready(); ctx.alive();
    if (ctx.first) await ctx.wait(Math.max(3600, say('intro') + 200));
    const recs = [];
    for (let i = 0; i < PUZZLES; i++) {
      recs.push(await puzzle(i, ctx.first && i === 0));
      ctx.mark(i);
      await ctx.wait(300);
    }
    const extra = recs.reduce((a, r) => a + r.extra, 0), invalid = recs.reduce((a, r) => a + r.invalid, 0), blocks = recs.reduce((a, r) => a + r.blocked, 0);
    const perfect = recs.filter((r) => r.extra === 0).length;
    if (extra <= 2 && invalid <= 2) state.level = Math.min(MAX_LEVEL, level + 1);
    else if (extra >= 9 || invalid >= 8) state.level = Math.max(1, level - 1);
    return {
      record: { level, n: recs.length, perfect, extra, invalid, blocks },
      foundHtml: vehicleIcon('bomba') + HOUSE,
      text: blocks
        ? `Jalan tutup ${blocks} kali, tapi adik tetap jumpa jalan lain! <span class="big-num">${perfect}</span> daripada ${recs.length} ikut jalan paling pendek.`
        : `Kereta bomba sampai <span class="big-num">${recs.length}</span> kali! <span class="big-num">${perfect}</span> ikut jalan paling pendek.`,
    };
  },

  parent: {
    stats(s) {
      const last = s.rounds.slice(-7);
      const shortP = pct(last.reduce((a, r) => a + (r.perfect || 0), 0), last.reduce((a, r) => a + (r.n || 0), 0));
      const n = last.reduce((a, r) => a + (r.n || 0), 0);
      const extraAvg = n ? (last.reduce((a, r) => a + (r.extra || 0), 0) / n).toFixed(1) : null;
      return [
        { v: shortP === null ? '–' : shortP + '%', label: 'Ikut jalan paling pendek' },
        { v: extraAvg === null ? '–' : extraAvg, label: 'Purata langkah lebih' },
        { v: `${s.level}<small>/${MAX_LEVEL}</small>`, label: 'Tahap' },
      ];
    },
    cols: ['Tahap', 'Jalan pendek', 'Langkah lebih', 'Ditutup'],
    row: (r) => [r.level, `${r.perfect}/${r.n}`, r.extra, r.blocks || '–'],
    explain: `<span><b>Perancangan dan fleksibiliti kognitif</b>: merancang beberapa langkah ke hadapan, dan bila rancangan tidak menjadi (jalan ditutup), cepat menukar ke rancangan baharu tanpa kecewa. Kemahiran fungsi eksekutif ini meramal kesediaan sekolah.</span>
      <span>Tahap 1: peta kecil, petak yang boleh ditekan bercahaya · Tahap 2: jalan ditutup sekali · Tahap 3: tanpa cahaya bantuan · Tahap 4: peta besar, jalan ditutup dua kali. "Langkah lebih" dikira daripada jalan terbaik selepas jalan ditutup, jadi anak tidak dihukum kerana penutupan itu.</span>`,
  },

  mission: {
    title: 'Main "Jalan Tutup"',
    steps: [
      'Susun bantal atau kotak sebagai "jalan" dari bilik ke dapur. Minta anak bawa kereta mainan ikut jalan itu.',
      'Di tengah jalan, letak satu kotak dan kata <b>"Alamak, jalan tutup!"</b> Tanya: "Nak ikut jalan mana sekarang?"',
      'Dalam kereta atau semasa berjalan, tanya: "Kalau jalan ni tutup, kita boleh ikut jalan mana lagi?"',
    ],
    why: 'Kenapa? Anak yang biasa menukar rancangan dengan tenang lebih mudah menyesuaikan diri bila sesuatu tidak berjalan seperti yang dijangka, di sekolah dan dalam hidup.',
  },
};
