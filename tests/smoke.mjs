// Ujian asap: setiap game dibuka pada umur 3 dan 6, pusingan bermula, tiada ralat dan tiada fail hilang.
import { GAME_IDS } from './ids.mjs';

export async function runSmoke(browser, base, only) {
  const ids = (await GAME_IDS()).filter((id) => !only || id === only);
  const jobs = ids.flatMap((id) => [3, 6].map((age) => ({ id, age })));
  const bad = [];
  await pool(jobs, 6, async ({ id, age }) => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const p = await ctx.newPage();
    const errs = [];
    p.on('pageerror', (e) => errs.push(e.message));
    p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
    p.on('response', (r) => { if (!r.ok()) errs.push(`HTTP ${r.status()} ${r.url().replace(base, '')}`); });
    try {
      await p.goto(base + 'index.html');
      await p.click(`#age-chips [data-age="${age}"]`);
      await p.click(`.gcard[data-id="${id}"]`);
      await p.waitForFunction(() => document.querySelectorAll('#progress i').length > 0, null, { timeout: 15000 });
      await p.waitForTimeout(2500);
      if (await p.$eval('#scr-game', (e) => e.hidden)) errs.push('skrin game tidak kelihatan');
    } catch (e) { errs.push(e.message.split('\n')[0]); }
    if (errs.length) bad.push(`${id} (umur ${age}): ${errs.join(' | ')}`);
    await ctx.close();
  });
  return { name: 'asap', ok: !bad.length, detail: bad.length ? bad : [`${ids.length} game × 2 umur dibuka tanpa ralat`] };
}

export async function pool(items, n, fn) {
  const q = [...items];
  await Promise.all(Array.from({ length: n }, async () => { while (q.length) await fn(q.shift()); }));
}
