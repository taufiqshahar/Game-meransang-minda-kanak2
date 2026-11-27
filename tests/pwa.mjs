// Ujian PWA: service worker mengawal halaman, manifest sah, "simpan untuk luar talian" berjaya,
// dan selepas rangkaian diputuskan app dibuka dan satu game dimain dengan audio.
export async function runPwa(browser, base) {
  base = base.replace('127.0.0.1', 'localhost'); // konteks selamat untuk service worker
  const errs = [];
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  try {
    const p = await ctx.newPage();
    p.on('pageerror', (e) => errs.push(e.message));
    await p.goto(base + 'index.html');
    if (await p.evaluate(() => document.compatMode) !== 'CSS1Compat') errs.push('halaman dalam quirks mode');
    const man = await p.evaluate(async () => (await (await fetch(document.querySelector('link[rel=manifest]').href)).json()));
    if (!man.icons?.length || man.display !== 'standalone') errs.push('manifest tidak lengkap');
    await p.evaluate(() => navigator.serviceWorker.ready);
    await p.reload();
    if (!(await p.evaluate(() => !!navigator.serviceWorker.controller))) errs.push('service worker tidak mengawal halaman');
    await p.click('#btn-parent');
    const [x, y] = (await p.textContent('#gate-q')).match(/\d+/g).map(Number);
    await p.click(`#gate-answers [data-v="${x * y}"]`);
    await p.click('#btn-offline');
    await p.waitForFunction(() => { const i = document.querySelector('#offline-info'); return i.classList.contains('ok') || /gagal|Belum/.test(i.textContent); }, null, { timeout: 120000 });
    if (!(await p.$eval('#offline-info', (e) => e.classList.contains('ok')))) errs.push('simpan luar talian gagal: ' + await p.textContent('#offline-info'));
    await ctx.setOffline(true);
    const q = await ctx.newPage();
    q.on('pageerror', (e) => errs.push('luar talian: ' + e.message));
    let audio = 0; q.on('response', (r) => { if (r.url().endsWith('.mp3') && r.ok()) audio++; });
    await q.goto(base + 'index.html');
    const n = await q.$$eval('.gcard', (e) => new Set(e.map((x) => x.dataset.id)).size);
    await q.click('.gcard[data-id="cari-jalan"]');
    await q.waitForFunction(() => document.querySelectorAll('#progress i').length > 0, null, { timeout: 15000 });
    await q.waitForTimeout(2500);
    if (!audio) errs.push('luar talian: tiada audio dimuat');
    await ctx.close();
    return { name: 'pwa', ok: !errs.length, detail: errs.length ? errs : [`luar talian: ${n} kad, game dimain dengan ${audio} klip audio`] };
  } catch (e) {
    await ctx.close();
    return { name: 'pwa', ok: false, detail: [...errs, e.message.split('\n')[0]] };
  }
}
