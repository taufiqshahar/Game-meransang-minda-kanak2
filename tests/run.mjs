// Pelari ujian. Guna:
//   npm test                  statik + asap (40 game) + PWA/luar talian + main penuh (game yang ada pemandu)
//   npm test -- --quick       statik + asap + PWA (~2 minit)
//   npm test -- --only <id>   satu game sahaja
//   npm test -- --shots <dir> simpan tangkapan skrin main penuh
import { createRequire } from 'node:module';
import { serve } from './serve.mjs';
import { runStatic } from './static.mjs';
import { runSmoke } from './smoke.mjs';
import { runPlay } from './play.mjs';
import { runPwa } from './pwa.mjs';

// require (bukan import): sama ada node_modules tempatan atau pemasangan global (NODE_PATH) boleh digunakan.
const { chromium } = createRequire(import.meta.url)('playwright');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const quick = process.argv.includes('--quick'), only = arg('--only'), shots = arg('--shots');

const results = [];
const report = (r) => { results.push(r); console.log(`${r.ok ? '✓' : '✗'} ${r.name}`); r.detail.forEach((d) => console.log(`    ${d}`)); };

report(await runStatic());
const srv = await serve();
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
try {
  report(await runSmoke(browser, srv.url, only));
  if (!only) report(await runPwa(browser, srv.url));
  if (!quick) { console.log('main penuh…'); report(await runPlay(browser, srv.url, only, shots)); }
} finally {
  await browser.close(); srv.close();
}
const failed = results.filter((r) => !r.ok);
console.log(failed.length ? `\nGAGAL: ${failed.map((r) => r.name).join(', ')}` : '\nSEMUA LULUS');
process.exit(failed.length ? 1 : 0);
