// Pemandu bot untuk ujian main penuh. Setiap game: `armed` = pemilih yang menandakan game menunggu tekanan,
// `act(page, wrongOk)` = buat satu tindakan (sengaja salah bila wrongOk). Game membantu ujian melalui
// stage.dataset.answer / seq / path / fill / hold (lihat kod game).
export const pickAct = (cls, attr, multi) => ({
  armed: `.${cls}:not(:disabled)`,
  async act(p, wrongOk) {
    const ans = (await p.evaluate(() => document.querySelector('#stage').dataset.answer)).split(',');
    const vals = await p.$$eval(`#stage .${cls}:not(.dim):not(.used):not(.gone)`, (e, a) => e.map((x) => x.dataset[a]), attr);
    const w = vals.find((x) => !ans.includes(x));
    const id = wrongOk && w ? w : vals.find((x) => ans.includes(x));
    await p.click(`#stage .${cls}[data-${attr}="${id}"]`, { force: true });
    return { r: id, wrong: !ans.includes(id) };
  },
});

export const DRIVERS = {
  'kitar-hidup': pickAct('kh-opt', 's'),
  'cuaca': pickAct('cu-opt', 'id'),
  'susun-cerita': pickAct('sc-card', 'id'),
  'perkataan-pertama': pickAct('pp-opt', 'w'),
  'sambung-titik': {
    armed: '.st-dot:not(:disabled)',
    async act(p, wrongOk) {
      const ans = await p.evaluate(() => document.querySelector('#stage').dataset.answer);
      const vals = await p.$$eval('#stage .st-dot:not(.done)', (e) => e.map((x) => x.dataset.i));
      const w = vals.find((x) => x !== ans);
      const id = wrongOk && w ? w : ans;
      await p.click(`#stage .st-dot[data-i="${id}"]`, { force: true });
      return { r: 'titik ' + (Number(id) + 1), wrong: id !== ans };
    },
  },
  'cari-beza': {
    armed: '.cb-hit:not(:disabled)',
    async act(p, wrongOk) {
      const ans = (await p.evaluate(() => document.querySelector('#stage').dataset.answer)).split(',');
      if (wrongOk) { await p.click('#stage .cb-pic.bot', { position: { x: 4, y: 4 }, force: true }); return { r: 'tekan kosong', wrong: true }; }
      const side = Math.random() < .5 ? 'top' : 'bot';
      await p.click(`#stage .cb-pic.${side} .cb-hit[data-id="${ans[0]}"]`, { force: true });
      return { r: ans[0], wrong: false };
    },
  },
  'hari-terbalik': pickAct('ht-opt', 'w'),
  'timbang': pickAct('tm-item', 'id'),
  'arahan': {
    armed: '.ar-obj:not(:disabled)',
    async act(p, wrongOk) {
      const ans = await p.evaluate(() => document.querySelector('#stage').dataset.answer);
      const [kind, list] = ans.split(':'); const want = list.split(',');
      if (kind === 'o') {
        const objs = await p.$$eval('#stage .ar-obj:not(.gone)', (e) => e.map((x) => x.dataset.o));
        const w = objs.find((x) => !want.includes(x));
        const id = wrongOk && w ? w : want[0];
        await p.click(`#stage .ar-obj[data-o="${id}"]`, { force: true });
        return { r: 'barang ' + id, wrong: id !== want[0] && !want.includes(id) };
      }
      const cons = await p.$$eval('#stage .ar-con', (e) => e.map((x) => x.dataset.c));
      const w = cons.find((x) => x !== want[0]);
      const id = wrongOk && w ? w : want[0];
      await p.click(`#stage .ar-con[data-c="${id}"]`, { force: true });
      return { r: 'bekas ' + id, wrong: id !== want[0] };
    },
  },
  'tarik-nafas-naga': {
    armed: '.ng-btn[aria-disabled="false"]',
    async act(p, wrongOk) {
      const hold = Number(await p.evaluate(() => document.querySelector('#stage').dataset.hold));
      const b = await (await p.$('#stage .ng-btn')).boundingBox();
      await p.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
      await p.mouse.down();
      await p.waitForTimeout(wrongOk ? 1200 : hold + 500);
      await p.mouse.up();
      await p.waitForTimeout(600);
      return { r: wrongOk ? 'lepas awal' : 'tahan ' + hold, wrong: wrongOk };
    },
  },
  'gendang-berhenti': {
    armed: '.gb-kompang:not(:disabled)',
    async act(p, wrongOk) {
      const ph = await p.evaluate(() => document.querySelector('#stage').dataset.phase);
      if (ph === 'main') { await p.click('#stage .gb-kompang', { force: true }); return { r: 'pukul', wrong: false }; }
      if (ph === 'senyap' && wrongOk) { await p.waitForTimeout(900); await p.click('#stage .gb-kompang', { force: true }); await p.waitForTimeout(2500); return { r: 'pukul semasa senyap', wrong: true }; }
      await p.waitForTimeout(300); return { r: 'tunggu', wrong: false };
    },
  },
  'sudu-telur': {
    armed: '.su-spoon',
    async act(p, wrongOk) {
      const d = await p.evaluate(() => { const st = document.querySelector('#stage'), sp = st.querySelector('.su-spoon'); return { path: st.dataset.path, v: Number(st.dataset.vmax), x: parseFloat(sp.style.left), y: parseFloat(sp.style.top) * 1.5 }; });
      if (!d.path) { await p.waitForTimeout(300); return { r: '-', wrong: false }; }
      const pts = d.path.split(';').map((s) => s.split(',').map(Number));
      let k = 0, bd = 1e9; pts.forEach(([x, y], i) => { const dd = Math.hypot(x - d.x, y - d.y); if (dd < bd) { bd = dd; k = i; } });
      const r = await (await p.$('#stage')).boundingBox();
      const px = ([x, y]) => [r.x + x / 100 * r.width, r.y + y / 150 * r.height];
      const sb = await (await p.$('#stage .su-spoon')).boundingBox();
      await p.mouse.move(sb.x + sb.width / 2, sb.y + sb.height / 2); await p.mouse.down();
      await p.mouse.move(...px(pts[k]));
      for (let i = k + 1; i < pts.length; i++) {
        const dist = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
        await p.mouse.move(...px(pts[i]));
        if (!wrongOk) await p.waitForTimeout(Math.max(30, dist / (d.v * .55) * 1000));
        else await p.waitForTimeout(5);
        if (wrongOk && i > k + 6) break;
      }
      await p.mouse.up(); await p.waitForTimeout(1500);
      return { r: wrongOk ? 'seret laju' : 'seret perlahan', wrong: wrongOk };
    },
  },
  'apa-hilang': pickAct('ah-opt', 'id'),
  'campur-warna': {
    armed: '.cw-opt:not(:disabled), #stage .cw-tin:not(:disabled)',
    async act(p, wrongOk) {
      const ans = (await p.evaluate(() => document.querySelector('#stage').dataset.answer)).split(',');
      const opt = await p.$('#stage .cw-opt:not(:disabled)');
      const cls = opt ? 'cw-opt' : 'cw-tin';
      const vals = await p.$$eval(`#stage .${cls}:not(.dim):not(.sel)`, (e) => e.map((x) => x.dataset.c));
      const w = vals.find((x) => !ans.includes(x));
      const id = wrongOk && w ? w : vals.find((x) => ans.includes(x));
      await p.click(`#stage .${cls}[data-c="${id}"]`, { force: true });
      return { r: cls + ' ' + id, wrong: !ans.includes(id) };
    },
  },
  'ikut-bunyi': {
    armed: '.ib-pad:not(:disabled)',
    async act(p, wrongOk) {
      const seq = await p.evaluate(() => document.querySelector('#stage').dataset.seq);
      if (!seq) { await p.waitForTimeout(200); return { r: '-', wrong: false }; }
      const q = seq.split(',').map(Number);
      for (let s = 0; s < q.length; s++) {
        await p.waitForSelector('#stage .ib-pad:not(:disabled)', { timeout: 15000 }).catch(() => {});
        const i = wrongOk && s === q.length - 1 ? (q[s] + 1) % 4 : q[s];
        await p.click(`#stage .ib-pad[data-i="${i}"]`, { force: true });
        await p.waitForTimeout(220);
      }
      await p.waitForFunction(() => !document.querySelector('#stage').dataset.seq, { timeout: 15000 }).catch(() => {});
      return { r: `urutan ${q.length}`, wrong: wrongOk };
    },
  },
  'pusing-gambar': {
    armed: '.pg-rot:not(:disabled), #stage .pg-opt:not(:disabled)',
    async act(p, wrongOk) {
      const ans = await p.evaluate(() => document.querySelector('#stage').dataset.answer);
      if (await p.$('#stage .pg-rot:not([hidden])')) {
        if (!['1', '-1'].includes(ans)) { await p.waitForTimeout(200); return { r: '-', wrong: false }; }
        const d = wrongOk ? -Number(ans) : Number(ans);
        await p.click(`#stage .pg-rot[data-d="${d}"]`, { force: true });
        return { r: 'pusing ' + d, wrong: wrongOk };
      }
      if (!(await p.$('#stage .pg-opt:not(:disabled)'))) { await p.waitForTimeout(200); return { r: '-', wrong: false }; }
      const vals = await p.$$eval('#stage .pg-opt:not(.dim)', (e) => e.map((x) => x.dataset.i));
      const w = vals.find((x) => x !== ans);
      const id = wrongOk && w ? w : ans;
      await p.click(`#stage .pg-opt[data-i="${id}"]`, { force: true });
      return { r: 'pilih ' + id, wrong: id !== ans };
    },
  },
  'dengar-perasaan': pickAct('dp-face', 'e'),
  'tangkap-rama': {
    armed: '.tr-bug[data-kind="rama"]:not(.caught):not(.shoo)',
    async act(p, wrongOk) {
      const bee = await p.$('#stage .tr-bug[data-kind="lebah"]:not(.shoo)');
      if (wrongOk && bee) { await bee.click({ force: true }).catch(() => {}); await p.waitForTimeout(300); return { r: 'lebah', wrong: true }; }
      const el = await p.$('#stage .tr-bug[data-kind="rama"]:not(.caught):not(.shoo)');
      if (!el) return { r: '-', wrong: false };
      await el.click({ force: true }).catch(() => {});
      return { r: 'rama', wrong: false };
    },
  },
  'mewarna': {
    armed: '.mw-box:not(.done)',
    async act(p, wrongOk) {
      const fill = await p.evaluate(() => document.querySelector('#stage').dataset.fill);
      if (!fill) { await p.waitForTimeout(300); return { r: '-', wrong: false }; }
      const bb = await (await p.$('#stage .mw-box')).boundingBox();
      const at = (x, y) => [bb.x + x / 100 * bb.width, bb.y + y / 100 * bb.height];
      if (wrongOk) { await p.mouse.move(...at(1, 2)); await p.mouse.down(); for (let x = 1; x <= 99; x += 4) await p.mouse.move(...at(x, 2 + (x % 8))); await p.mouse.up(); await p.waitForTimeout(400); }
      for (const row of fill.split(';')) {
        if (await p.$('#stage .mw-box.done')) break;
        const pts = row.split(' ').map((q) => q.split(',').map(Number));
        await p.mouse.move(...at(...pts[0])); await p.mouse.down();
        for (const q of pts) await p.mouse.move(...at(...q), { steps: 2 });
        await p.mouse.up();
      }
      await p.waitForTimeout(500);
      return { r: wrongOk ? 'conteng luar' : 'warna', wrong: wrongOk };
    },
  },
  'cari-jalan': {
    armed: '.cj-cell:not(:disabled)',
    async act(p, wrongOk) {
      const st = await p.evaluate(() => { const s = document.querySelector('#stage'); return { a: s.dataset.answer, n: s.querySelectorAll('.cj-cell').length, C: Math.round(100 / parseFloat(s.querySelector('.cj-cell').style.width)) }; });
      if (st.a === undefined) { await p.waitForTimeout(300); return { r: '-', wrong: false }; }
      const a = Number(st.a), C = st.C;
      if (wrongOk) {
        const free = await p.$$eval('#stage .cj-cell:not(:disabled)', (e) => e.map((x) => Number(x.dataset.i)));
        const far = free.find((i) => Math.abs(i % C - a % C) + Math.abs(Math.floor(i / C) - Math.floor(a / C)) >= 3);
        if (far !== undefined) { await p.click(`#stage .cj-cell[data-i="${far}"]`); return { r: 'petak jauh ' + far, wrong: true }; }
      }
      await p.click(`#stage .cj-cell[data-i="${a}"]`);
      return { r: 'petak ' + a, wrong: false };
    },
  },
};
