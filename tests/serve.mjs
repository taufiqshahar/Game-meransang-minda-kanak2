// Pelayan statik kecil untuk ujian dan pembangunan (tanpa kebergantungan). Melayan app/ pada port rawak,
// dengan index.html dibungkus seperti di hos awam.
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { wrapIndex } from '../tools/build.mjs';

const ROOT = resolve(new URL('../app', import.meta.url).pathname);
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.png': 'image/png', '.mp3': 'audio/mpeg', '.css': 'text/css' };

export function serve() {
  const server = http.createServer(async (req, res) => {
    const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const file = normalize(join(ROOT, path.endsWith('/') ? path + 'index.html' : path));
    if (!file.startsWith(ROOT)) { res.writeHead(403).end(); return; }
    try {
      let body = await readFile(file);
      // Sama seperti hos awam: index.html dibungkus dengan rangka dokumen penuh (lihat tools/build.mjs).
      if (file === join(ROOT, 'index.html')) body = wrapIndex(body.toString('utf8'));
      res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' }).end(body);
    } catch { res.writeHead(404).end('not found'); }
  });
  return new Promise((ok) => server.listen(0, '127.0.0.1', () => ok({ url: `http://127.0.0.1:${server.address().port}/`, close: () => server.close() })));
}
