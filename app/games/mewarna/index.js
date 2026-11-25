// Mewarna: motor halus (kawalan jari) + perancangan. Anak mewarna gambar dengan jari; berus makin kecil dan
// toleransi garisan makin ketat ikut tahap. Liputan dan ketepatan diukur pada grid 100×100:
// liputan = bahagian dalam yang sudah diwarna · ketepatan = warna di dalam ÷ (dalam + jauh di luar garisan).
import { pick, shuffle, pct, meter } from '../../kit/util.js';

const COLORS = [['merah', '#E5484D'], ['jingga', '#F28A2C'], ['kuning', '#F5C531'], ['hijau', '#22B26A'], ['biru', '#2F7DE1'], ['ungu', '#7A4FD8']];
const circ = (cx, cy, r) => `M${cx - r} ${cy} a${r} ${r} 0 1 0 ${r * 2} 0 a${r} ${r} 0 1 0 ${-r * 2} 0 Z`;
const star = (() => { let d = ''; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 19 : 44; d += `${i ? 'L' : 'M'}${(50 + r * Math.cos(a)).toFixed(1)} ${(54 + r * Math.sin(a)).toFixed(1)} `; } return d + 'Z'; })();
// shape = kawasan untuk diwarna · deco = garisan hiasan (tidak dikira)
const SHAPES = {
  bola: { name: 'Bola', shape: circ(50, 50, 40), deco: 'M12 42 Q50 60 88 42 M30 14 Q42 50 30 86' },
  epal: { name: 'Epal', shape: 'M50 30 C34 16 8 22 10 52 C12 80 32 94 50 88 C68 94 88 80 90 52 C92 22 66 16 50 30 Z', deco: 'M50 30 Q52 16 58 8 M56 18 Q70 6 78 14 Q68 24 56 18 Z' },
  hati: { name: 'Hati', shape: 'M50 88 C20 66 6 50 8 32 C10 14 34 8 50 28 C66 8 90 14 92 32 C94 50 80 66 50 88 Z', deco: '' },
  bintang: { name: 'Bintang', shape: star, deco: '' },
  ikan: { name: 'Ikan', shape: 'M12 50 C24 22 60 22 72 50 C60 78 24 78 12 50 Z M68 50 L94 28 L88 50 L94 72 Z', deco: `${circ(28, 44, 3)} M44 34 Q50 50 44 66` },
  awan: { name: 'Awan', shape: 'M24 72 C6 72 6 48 24 48 C22 28 46 24 54 38 C62 22 88 28 82 48 C98 50 96 72 80 72 Z', deco: '' },
  rumah: { name: 'Rumah', shape: 'M16 48 L50 14 L84 48 L80 48 L80 90 L20 90 L20 48 Z', deco: 'M42 90 V66 H58 V90 M28 56 H38 V66 H28 Z M62 56 H72 V66 H62 Z' },
  bunga: { name: 'Bunga', shape: [0, 1, 2, 3, 4].map((k) => { const a = -Math.PI / 2 + k * 2 * Math.PI / 5; return circ(+(50 + 23 * Math.cos(a)).toFixed(1), +(46 + 23 * Math.sin(a)).toFixed(1), 15); }).join(' ') + ' ' + circ(50, 46, 14), deco: `${circ(50, 46, 9)} M50 76 V98` },
};
// shapes = pilihan gambar · r = jejari berus (unit gambar 0–100) · tol = toleransi luar garisan · goal = liputan untuk siap
const LEVELS = [null,
  { shapes: ['bola', 'epal', 'hati'], r: 9, tol: 4, goal: .6 },
  { shapes: ['bintang', 'ikan', 'awan', 'rumah'], r: 7, tol: 3, goal: .65 },
  { shapes: ['bunga', 'ikan', 'bintang', 'rumah'], r: 5.5, tol: 2, goal: .7 },
  { shapes: ['bunga', 'bintang', 'rumah', 'ikan'], r: 4.5, tol: 1, goal: .75 },
];
const MAX_LEVEL = 4;
const AGE_LEVEL = { 3: 1, 4: 1, 5: 2, 6: 3 };
const PICS = 2;
const IDLE_MS = 10000;
const N = 100; // grid ukuran

function maskOf(path, tol) {
  const c = document.createElement('canvas'); c.width = N; c.height = N;
  const g = c.getContext('2d'); g.fill(new Path2D(path));
  const a = g.getImageData(0, 0, N, N).data, inside = new Uint8Array(N * N), far = new Uint8Array(N * N);
  for (let i = 0; i < N * N; i++) inside[i] = a[i * 4 + 3] > 127 ? 1 : 0;
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    if (inside[y * N + x]) continue;
    let near = false;
    for (let dy = -tol; dy <= tol && !near; dy++) for (let dx = -tol; dx <= tol; dx++) {
      const xx = x + dx, yy = y + dy;
      if (xx >= 0 && yy >= 0 && xx < N && yy < N && inside[yy * N + xx]) { near = true; break; }
    }
    far[y * N + x] = near ? 0 : 1;
  }
  return { inside, far, total: inside.reduce((s, v) => s + v, 0) };
}

export default {
  id: 'mewarna',
  title: 'Mewarna',
  stageLabel: 'Gambar bergaris di tengah dan kotak warna di bawah. Pilih warna, kemudian warnakan gambar dengan jari di dalam garisan.',
  lines: { intro: 'Jom mewarna! Warnakan di dalam garisan.', siap: 'Cantiknya! Dah siap.', luar: 'Cuba warna di dalam garisan, ya.' },
  recorded: ['intro', 'siap', 'luar'],

  css: `.mw-box { left: 8%; width: 84%; top: 15%; aspect-ratio: 1; z-index: 2; border-radius: calc(var(--u) * 5); background: #FFFDF5; box-shadow: 0 calc(var(--u) * 1.4) 0 rgba(0,0,0,.15); touch-action: none; overflow: hidden; }
.mw-box canvas { position: absolute; inset: 0; width: 100%; height: 100%; }
.mw-box .mw-line { pointer-events: none; }
.mw-box.done { box-shadow: 0 0 0 calc(var(--u) * 1.4) var(--kuning), 0 calc(var(--u) * 1.4) 0 rgba(0,0,0,.15); }
.mw-pal { left: 4%; right: 4%; top: 77%; z-index: 3; display: flex; justify-content: center; gap: 2.4%; }
.mw-sw { width: 14%; aspect-ratio: 1; padding: 0; border-radius: 50%; background: var(--c); box-shadow: inset 0 calc(var(--u) * -1) 0 rgba(0,0,0,.18), 0 calc(var(--u) * .8) 0 rgba(0,0,0,.2); transition: transform .15s; }
.mw-sw.on { transform: translateY(-14%) scale(1.12); box-shadow: 0 0 0 calc(var(--u) * 1) #FFFDF5, 0 0 0 calc(var(--u) * 1.8) #15302A; }
.mw-meter { left: 20%; right: 20%; top: 91%; height: 2.2%; z-index: 2; border-radius: 99px; background: rgba(255,253,245,.55); overflow: hidden; }
.mw-meter i { display: block; height: 100%; width: 0; background: var(--kuning); border-radius: 99px; transition: width .2s; }`,

  stageHtml: () => `<svg class="bg" viewBox="0 0 200 300" preserveAspectRatio="none" aria-hidden="true">
      <rect width="200" height="300" fill="#F3D9C4"/><rect y="226" width="200" height="74" fill="#E7C3A6"/>
      <g opacity=".35">${[[18, 20, '#E5484D'], [182, 28, '#2F7DE1'], [14, 210, '#22B26A'], [186, 206, '#F5C531']].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="7" fill="${c}"/>`).join('')}</g>
    </svg>
    <div class="mw-box"><canvas class="mw-paint"></canvas><canvas class="mw-line"></canvas></div>
    <div class="mw-pal">${COLORS.map(([n, c]) => `<button class="mw-sw" type="button" data-c="${n}" style="--c:${c}" aria-label="Warna ${n}"></button>`).join('')}</div>
    <div class="mw-meter" aria-hidden="true"><i></i></div>`,

  initState: (age) => ({ age, level: AGE_LEVEL[age], rounds: [] }),
  normalize(s, age) {
    if (s.age !== age) { s.age = age; s.level = AGE_LEVEL[age]; }
    if (!Number.isInteger(s.level) || s.level < 1 || s.level > MAX_LEVEL) s.level = AGE_LEVEL[age];
    return s;
  },

  async round(ctx) {
    const { stage, state, say, sfx } = ctx;
    const level = state.level, L = LEVELS[level];
    const box = stage.querySelector('.mw-box'), paint = box.querySelector('.mw-paint'), line = box.querySelector('.mw-line');
    const sws = [...stage.querySelectorAll('.mw-sw')], bar = stage.querySelector('.mw-meter i');
    const hex = Object.fromEntries(COLORS);
    let color = pick(COLORS)[0];
    const setColor = (c) => { color = c; sws.forEach((s) => s.classList.toggle('on', s.dataset.c === c)); };
    setColor(color);

    await ctx.ready(); ctx.alive();
    const rect = box.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
    const px = Math.max(100, Math.round(rect.width * dpr));
    for (const c of [paint, line]) { c.width = px; c.height = px; }
    const gp = paint.getContext('2d'), gl = line.getContext('2d');
    const k = px / 100;

    async function picture(id, demo) {
      const S = SHAPES[id], path = new Path2D(S.shape), M = maskOf(S.shape, L.tol);
      // Garisan luar sahaja (bahagian bertindih dalam bentuk dibuang), kemudian garisan hiasan.
      gp.setTransform(1, 0, 0, 1, 0, 0); gp.clearRect(0, 0, px, px); gp.setTransform(k, 0, 0, k, 0, 0);
      gl.setTransform(1, 0, 0, 1, 0, 0); gl.clearRect(0, 0, px, px); gl.setTransform(k, 0, 0, k, 0, 0);
      gl.lineJoin = 'round'; gl.lineCap = 'round'; gl.strokeStyle = '#15302A';
      gl.lineWidth = 5; gl.stroke(path); gl.globalCompositeOperation = 'destination-out'; gl.fill(path); gl.globalCompositeOperation = 'source-over';
      if (S.deco) { gl.lineWidth = 1.8; gl.stroke(new Path2D(S.deco)); }
      box.classList.remove('done'); box.setAttribute('aria-label', `Gambar ${S.name.toLowerCase()} untuk diwarna`);
      const painted = new Uint8Array(N * N), use = {};
      let inP = 0, outF = 0, lastWarnOut = 0, lastWarnT = 0, strokes = 0;
      bar.style.width = '0%';
      // Titik dalam untuk ujian automatik (baris zigzag).
      const pts = [];
      for (let y = 6; y < N; y += Math.max(4, Math.round(L.r * 1.3))) {
        const row = []; for (let x = 2; x < N; x += 3) if (M.inside[y * N + x]) row.push(`${x},${y}`);
        if (row.length) pts.push((pts.length % 2 ? row.reverse() : row).join(' '));
      }
      stage.dataset.fill = pts.join(';');

      const mark = (x, y) => {
        const r = L.r;
        for (let yy = Math.max(0, Math.floor(y - r)); yy <= Math.min(N - 1, Math.ceil(y + r)); yy++) {
          for (let xx = Math.max(0, Math.floor(x - r)); xx <= Math.min(N - 1, Math.ceil(x + r)); xx++) {
            const i = yy * N + xx;
            if (painted[i] || (xx - x) ** 2 + (yy - y) ** 2 > r * r) continue;
            painted[i] = 1;
            if (M.inside[i]) { inP++; use[color] = (use[color] || 0) + 1; } else if (M.far[i]) outF++;
          }
        }
      };
      const cov = () => inP / M.total;

      let resolveEvent = null;
      const signal = (v) => { const r = resolveEvent; resolveEvent = null; r?.(v); };
      const next = (ms) => new Promise((res) => { const t = setTimeout(() => { resolveEvent = null; res('idle'); }, ms); resolveEvent = (v) => { clearTimeout(t); res(v); }; });
      const ctl = new AbortController();
      const onAbort = () => { ctl.abort(); signal('abort'); };
      ctx.signal.addEventListener('abort', onAbort);
      const toPic = (e) => { const r = box.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * 100, y: (e.clientY - r.top) / r.height * 100 }; };
      let down = false, last = null, done = false;
      const dot = (a, b) => {
        gp.strokeStyle = hex[color]; gp.lineWidth = L.r * 2; gp.lineCap = 'round'; gp.lineJoin = 'round';
        gp.beginPath(); gp.moveTo(a.x, a.y); gp.lineTo(b.x, b.y); gp.stroke();
        const d = Math.hypot(b.x - a.x, b.y - a.y), n = Math.max(1, Math.ceil(d));
        for (let i = 0; i <= n; i++) mark(a.x + (b.x - a.x) * i / n, a.y + (b.y - a.y) * i / n);
      };
      const after = () => {
        bar.style.width = Math.min(100, cov() / L.goal * 100) + '%';
        // Terlalu banyak warna jauh di luar garisan: peringatan lembut (tidak terlalu kerap).
        const now = performance.now();
        if (outF - lastWarnOut >= 40 && now - lastWarnT > 6000) { lastWarnOut = outF; lastWarnT = now; say('luar'); }
        if (!done && cov() >= L.goal) { done = true; signal('done'); }
      };
      box.addEventListener('pointerdown', (e) => {
        if (done) return;
        e.preventDefault(); box.setPointerCapture?.(e.pointerId);
        down = true; last = toPic(e); strokes++; dot(last, last); ctx.hand.hide(); after(); signal('paint');
      }, { signal: ctl.signal });
      box.addEventListener('pointermove', (e) => {
        if (!down || done) return;
        const p = toPic(e); dot(last, p); last = p; after();
      }, { signal: ctl.signal });
      const up = () => { down = false; };
      box.addEventListener('pointerup', up, { signal: ctl.signal });
      box.addEventListener('pointercancel', up, { signal: ctl.signal });
      for (const s of sws) s.addEventListener('pointerdown', (e) => { e.preventDefault(); setColor(s.dataset.c); sfx.light(); }, { signal: ctl.signal });

      const hint = () => {
        // Tunjuk satu kawasan dalam yang belum diwarna.
        const cand = []; for (let i = 0; i < N * N; i += 7) if (M.inside[i] && !painted[i]) cand.push(i);
        if (!cand.length) return;
        const i = pick(cand), r = ctx.toPct(box.getBoundingClientRect());
        ctx.hand.show(r.left + r.width * (i % N) / 100, r.top + r.width / 1.5 * Math.floor(i / N) / 100);
      };
      const t0 = performance.now();
      let idles = 0;
      try {
        if (demo) hint();
        for (;;) {
          const ev = await next(IDLE_MS);
          ctx.alive();
          if (ev === 'abort') return null;
          if (ev === 'done') break;
          if (ev === 'idle' && !down) {
            idles++;
            // Anak sudah warna sebahagian besar dan berhenti: terima sebagai siap.
            if (cov() >= Math.max(.35, L.goal - .25)) break;
            hint();
            if (idles === 1) say('intro');
          }
        }
      } finally {
        ctl.abort(); ctx.signal.removeEventListener('abort', onAbort); down = false; ctx.hand.hide();
      }
      // Siap: isi ruang kosong di dalam dengan warna yang paling banyak digunakan.
      const main = Object.entries(use).sort((a, b) => b[1] - a[1])[0]?.[0] || color;
      gp.globalCompositeOperation = 'destination-over'; gp.fillStyle = hex[main]; gp.fill(path); gp.globalCompositeOperation = 'source-over';
      bar.style.width = '100%';
      box.classList.add('done'); sfx.good();
      const acc = pct(inP, inP + outF);
      // Gambar kecil untuk skrin keputusan.
      const snap = document.createElement('canvas'); snap.width = 120; snap.height = 120;
      const gs = snap.getContext('2d'); gs.fillStyle = '#FFFDF5'; gs.fillRect(0, 0, 120, 120); gs.drawImage(paint, 0, 0, 120, 120); gs.drawImage(line, 0, 0, 120, 120);
      let img = ''; try { img = `<img src="${snap.toDataURL('image/png')}" width="72" height="72" alt="">`; } catch { /* kanvas tercemar: abaikan */ }
      await ctx.wait(Math.max(1600, say('siap') + 300));
      return { acc, cov: Math.round(cov() * 100), strokes, ms: Math.round(performance.now() - t0), colors: Object.keys(use).length, img };
    }

    ctx.progress(PICS);
    if (ctx.first) say('intro'); // gambar pertama sudah dilukis semasa Hafiz bercakap
    const ids = shuffle(L.shapes).slice(0, PICS), recs = [];
    for (let i = 0; i < PICS; i++) {
      recs.push(await picture(ids[i], ctx.first && i === 0));
      ctx.mark(i);
      await ctx.wait(300);
    }
    delete stage.dataset.fill;
    const acc = Math.round(recs.reduce((a, r) => a + (r.acc ?? 0), 0) / recs.length);
    if (acc >= 88) state.level = Math.min(MAX_LEVEL, level + 1);
    else if (acc < 65) state.level = Math.max(1, level - 1);
    return {
      record: { level, acc, pics: recs.length, colors: Math.max(...recs.map((r) => r.colors)), ms: recs.reduce((a, r) => a + r.ms, 0) },
      foundHtml: recs.map((r) => r.img).join(''),
      text: acc >= 85 ? `Kemasnya! <span class="big-num">${acc}%</span> warna di dalam garisan.` : `Adik siap mewarna <span class="big-num">${recs.length}</span> gambar!`,
    };
  },

  parent: {
    stats(s) {
      const last = s.rounds.slice(-7);
      const accs = last.map((r) => r.acc).filter((v) => typeof v === 'number');
      const avg = accs.length ? Math.round(accs.reduce((a, v) => a + v, 0) / accs.length) : null;
      return [
        { v: avg === null ? '–' : avg + '%', label: 'Warna di dalam garisan' },
        { v: `${s.level}<small>/${MAX_LEVEL}</small>`, label: 'Tahap (berus makin kecil)' },
        { v: `${s.rounds.reduce((a, r) => a + (r.pics || 0), 0)}`, label: 'Gambar siap' },
      ];
    },
    cols: ['Tahap', 'Dalam garisan', 'Warna'],
    row: (r) => [r.level, meter(r.acc ?? null), r.colors || '–'],
    explain: `<span><b>Motor halus</b>: mengawal jari dengan tepat dan berhenti di garisan, kemahiran yang sama diperlukan untuk memegang pensel, menulis huruf dan menggunting.</span>
      <span>"Di dalam garisan" = bahagian warna yang jatuh di dalam gambar (sedikit terkeluar dekat garisan tidak dikira). Tahap 1: berus besar, gambar mudah · Tahap 4: berus kecil, toleransi ketat. Gambar siap bila kira-kira dua pertiga dalam gambar diwarna.</span>`,
  },

  mission: {
    title: 'Main "Warna dan Gunting"',
    steps: [
      'Lukis bulatan besar atas kertas dengan pen tebal. Minta anak warnakan dengan krayon di dalam garisan.',
      'Bila sudah mahir, lukis bentuk lebih kecil (bintang, rumah).',
      'Cuba juga mewarna dengan jari menggunakan cat air, atau menekap tepi bentuk dengan pensel warna.',
    ],
    why: 'Kenapa? Berhenti tepat di garisan melatih otot kecil jari dan kawalan mata-tangan, persediaan penting untuk menulis.',
  },
};
