// Binaan untuk hos awam (GitHub Pages / Cloudflare Pages / Netlify): salin app/ ke dist/ dan bungkus index.html
// dengan rangka dokumen penuh. app/index.html sengaja ditulis sebagai serpihan kerana platform artifact menambah
// rangka itu sendiri; hos statik biasa tidak, jadi tanpa langkah ini halaman berjalan dalam "quirks mode" tanpa viewport.
// Guna: node tools/build.mjs  →  dist/
import { cpSync, readFileSync, writeFileSync, rmSync } from 'node:fs';

const HEAD = '<!doctype html>\n<html lang="ms">\n<head>\n<meta charset="utf-8">\n'
  + '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n';

/** Bungkus serpihan index.html (idempoten: halaman yang sudah lengkap tidak diubah). */
export function wrapIndex(html) {
  return /^\s*<!doctype/i.test(html) ? html : HEAD + html.trimStart();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const root = new URL('..', import.meta.url).pathname;
  rmSync(root + 'dist', { recursive: true, force: true });
  cpSync(root + 'app', root + 'dist', { recursive: true, filter: (p) => !/\.md$/.test(p) });
  writeFileSync(root + 'dist/index.html', wrapIndex(readFileSync(root + 'app/index.html', 'utf8')));
  console.log('dist/ sedia');
}
