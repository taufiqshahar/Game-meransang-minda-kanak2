// Ujian main penuh: bot main satu pusingan lengkap sehingga skrin keputusan.
// Dua larian setiap game: umur 4 dengan 2 kesilapan sengaja (laluan bantuan/petunjuk), dan tahap 4 tanpa silap.
import { DRIVERS } from './drivers.mjs';
import { pool } from './smoke.mjs';

const LIMIT_MS = 300000;

async function playOne(browser, base, id, { age, mistakes, level, shots }) {
  const g = DRIVERS[id];
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  p.on('response', (r) => { if (!r.ok()) errs.push(`HTTP ${r.status()} ${r.url().replace(base, '')}`); });
  const tag = `${id} umur ${age}${level ? ` tahap ${level}` : ''}`;
  try {
    await p.goto(base + 'index.html');
    await p.click(`#age-chips [data-age="${age}"]`);
    if (level) {
      await p.evaluate(([id, age, lv]) => { const d = JSON.parse(localStorage.getItem('rangsang-minda.v1') || '{}'); d.games = d.games || {}; d.games[id] = { age, level: lv, rounds: [] }; localStorage.setItem('rangsang-minda.v1', JSON.stringify(d)); }, [id, age, level]);
      await p.reload();
    }
    await p.click(`.gcard[data-id="${id}"]`);
    const t0 = Date.now();
    let made = 0, acts = 0, done = false;
    while (Date.now() - t0 < LIMIT_MS) {
      await p.waitForFunction((sel) => document.querySelector('#stage ' + sel) || !document.querySelector('#scr-result').hidden, g.armed, { timeout: 30000 }).catch(() => {});
      if (await p.$eval('#scr-result', (e) => !e.hidden)) { done = true; break; }
      if (!(await p.$('#stage ' + g.armed))) { await p.waitForTimeout(200); continue; }
      const res = await g.act(p, made < mistakes);
      if (res.wrong) made++;
      acts++;
      if (shots && [2, 5].includes(acts)) await p.screenshot({ path: `${shots}/${id}${level ? '-L' + level : ''}-${acts}.png` });
      await p.waitForTimeout(450);
    }
    if (!done) errs.push(`tidak sampai skrin keputusan dalam ${LIMIT_MS / 1000}s (${acts} tindakan)`);
    const st = await p.evaluate((id) => JSON.parse(localStorage.getItem('rangsang-minda.v1') || 'null')?.games?.[id], id);
    if (done && !st?.rounds?.length) errs.push('rekod pusingan tidak disimpan');
    if (shots && done) await p.screenshot({ path: `${shots}/${id}${level ? '-L' + level : ''}-result.png` });
    await ctx.close();
    return { tag, ok: !errs.length, msg: errs.length ? errs.join(' | ') : `${Math.round((Date.now() - t0) / 1000)}s, ${acts} tindakan, ${made} silap sengaja` };
  } catch (e) {
    await ctx.close();
    return { tag, ok: false, msg: e.message.split('\n')[0] };
  }
}

export async function runPlay(browser, base, only, shots) {
  const ids = Object.keys(DRIVERS).filter((id) => !only || id === only);
  const jobs = ids.flatMap((id) => [{ id, age: 4, mistakes: 2 }, { id, age: 6, mistakes: 0, level: 4 }]);
  const out = [];
  await pool(jobs, 6, async (j) => {
    const r = await playOne(browser, base, j.id, { ...j, shots });
    out.push(r);
    console.log(`  ${r.ok ? '✓' : '✗'} ${r.tag}: ${r.msg}`);
  });
  const bad = out.filter((r) => !r.ok);
  return { name: 'main penuh', ok: !bad.length, detail: bad.length ? bad.map((r) => `${r.tag}: ${r.msg}`) : [`${out.length} larian (${ids.length} game) lulus`] };
}
