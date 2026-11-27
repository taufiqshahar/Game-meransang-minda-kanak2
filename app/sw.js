// Service worker: app boleh dipasang dan dimain tanpa internet.
// Strategi:
//   kod & halaman (html/js/json/webmanifest) → rangkaian dahulu, cache bila luar talian (kemas kini sentiasa sampai)
//   audio, imej, fon                         → cache dahulu, kemas kini di latar (cepat; klip baharu sampai pada main seterusnya)
// Cangkerang app + baris suara kongsi dimuat semasa pemasangan; modul game dan audionya dimuat bila dimain,
// atau sekali gus melalui butang "Simpan untuk main tanpa internet" (zon ibu bapa).
const VERSION = 'rm-v1';
const SHELL = [
  './', 'index.html', 'main.js', 'manifest.webmanifest', 'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png',
  'games/registry.js',
  ...['art', 'benda', 'faces', 'kuih', 'objects', 'pasar', 'pwa', 'util', 'vehicles', 'voice'].map((k) => `kit/${k}.js`),
];
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(VERSION);
    await c.addAll(SHELL);
    // Baris suara kongsi (nombor, pujian): senarai diambil dari kit/voice.js supaya tidak perlu diselenggara di dua tempat.
    try {
      const src = await (await fetch('kit/voice.js')).text();
      const block = src.slice(src.indexOf('SHARED_LINES = {'), src.indexOf('};', src.indexOf('SHARED_LINES = {')));
      const keys = [...block.matchAll(/(?:^|[,{])\s*'?([a-z0-9-]+)'?\s*:\s*['"]/gm)].map((m) => m[1]);
      await Promise.all(keys.map((k) => c.add(`kit/audio/${k}.mp3`).catch(() => {})));
    } catch { /* audio kongsi akan dicache bila dimain */ }
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== VERSION) await caches.delete(k);
    await self.clients.claim();
  })());
});

const isStatic = (url) => /\.(mp3|png|svg|woff2?|ttf)$/.test(url.pathname) || FONT_HOSTS.includes(url.hostname);

async function networkFirst(req) {
  const c = await caches.open(VERSION);
  try {
    const res = await fetch(req);
    if (res.ok) c.put(req, res.clone());
    return res;
  } catch {
    return (await c.match(req, { ignoreSearch: true })) || (req.mode === 'navigate' ? c.match('index.html') : Response.error());
  }
}

async function staleWhileRevalidate(req, e) {
  const c = await caches.open(VERSION);
  const hit = await c.match(req);
  const refresh = fetch(req).then((res) => { if (res.ok || res.type === 'opaque') c.put(req, res.clone()); return res; }).catch(() => null);
  if (hit) { e.waitUntil(refresh); return hit; }
  return (await refresh) || Response.error();
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const same = url.origin === self.location.origin;
  if (!same && !FONT_HOSTS.includes(url.hostname)) return;
  e.respondWith(isStatic(url) ? staleWhileRevalidate(req, e) : networkFirst(req));
});
