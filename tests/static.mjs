// Semakan statik (tanpa pelayar): kontrak modul game, fail audio, pendaftaran.
import { readdirSync, existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

const APP = resolve(new URL('../app', import.meta.url).pathname);
// Modul game menyentuh `document` hanya dalam round(); stub minimum supaya import tidak gagal di Node.
globalThis.document ??= { createElement: () => ({ getContext: () => ({}) }) };

export async function runStatic() {
  const errs = [];
  const fail = (m) => errs.push(m);
  // 1. Sintaks semua fail JS.
  const js = execFileSync('git', ['ls-files', '*.js'], { cwd: APP, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  for (const f of js) { try { execFileSync(process.execPath, ['--check', resolve(APP, f)], { stdio: 'pipe' }); } catch (e) { fail(`sintaks ${f}: ${e.stderr}`); } }
  // 2. Baris kongsi: setiap kunci ada mp3.
  const { SHARED_LINES } = await import(resolve(APP, 'kit/voice.js'));
  for (const k of Object.keys(SHARED_LINES)) if (!existsSync(resolve(APP, `kit/audio/${k}.mp3`))) fail(`kit/audio/${k}.mp3 tiada`);
  // 3. Registry ↔ folder game ↔ kontrak.
  const reg = readFileSync(resolve(APP, 'games/registry.js'), 'utf8');
  const ids = [...reg.matchAll(/\{ id: '([a-z0-9-]+)'/g)].map((m) => m[1]);
  if (new Set(ids).size !== ids.length) fail('id berganda dalam registry');
  const dirs = readdirSync(resolve(APP, 'games'), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
  for (const d of dirs) if (!ids.includes(d)) fail(`folder games/${d} tidak didaftarkan`);
  const REQ = ['id', 'title', 'stageLabel', 'lines', 'recorded', 'css', 'stageHtml', 'initState', 'normalize', 'round', 'parent', 'mission'];
  for (const id of ids) {
    const p = resolve(APP, `games/${id}/index.js`);
    if (!existsSync(p)) { fail(`games/${id}/index.js tiada`); continue; }
    const g = (await import(p)).default;
    for (const k of REQ) if (g[k] === undefined) fail(`${id}: tiada '${k}'`);
    if (g.id !== id) fail(`${id}: id modul '${g.id}' tidak sepadan`);
    for (const k of g.recorded || []) {
      if (!(k in g.lines)) fail(`${id}: '${k}' dirakam tetapi tiada teks`);
      if (!existsSync(resolve(APP, `games/${id}/audio/${k}.mp3`))) fail(`${id}: audio/${k}.mp3 tiada`);
    }
    for (const a of [3, 4, 5, 6]) { const s = g.initState(a); if (!Array.isArray(s.rounds)) fail(`${id}: initState(${a}).rounds bukan array`); g.normalize(s, a); }
    if (!existsSync(resolve(APP, `games/${id}/SKRIP-SUARA.md`))) fail(`${id}: SKRIP-SUARA.md tiada`);
  }
  // 4. Service worker: setiap modul kit/ ada dalam senarai cangkerang (supaya app boleh dibuka tanpa internet).
  const sw = readFileSync(resolve(APP, 'sw.js'), 'utf8');
  for (const f of readdirSync(resolve(APP, 'kit')).filter((f) => f.endsWith('.js'))) if (!sw.includes(`'${f.replace('.js', '')}'`)) fail(`sw.js: kit/${f} tiada dalam SHELL`);
  for (const f of ['manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png']) if (!existsSync(resolve(APP, f))) fail(`${f} tiada`);
  return { name: 'statik', ok: !errs.length, detail: errs.length ? errs : [`${js.length} fail JS, ${ids.length} game, ${Object.keys(SHARED_LINES).length} baris kongsi`] };
}
