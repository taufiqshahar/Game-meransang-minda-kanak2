// PWA: daftar service worker, butang pasang, dan simpan semua game untuk main tanpa internet.
// Semua fungsi selamat dipanggil di mana-mana: dalam iframe (pratonton artifact) atau pelayar tanpa sokongan,
// service worker tidak didaftar dan bahagian "Pasang app" disembunyikan.
import { SHARED_LINES } from './voice.js';

const OFFLINE_KEY = 'rangsang-minda.offline';
const inFrame = (() => { try { return window.self !== window.top; } catch { return true; } })();
const secure = location.protocol === 'https:' || ['localhost', '127.0.0.1'].includes(location.hostname);
export const swSupported = 'serviceWorker' in navigator && secure && !inFrame;

let deferredPrompt = null;
const listeners = new Set();
const changed = () => listeners.forEach((f) => f());
export const onChange = (f) => listeners.add(f);

export function initPwa() {
  if (!swSupported) return;
  navigator.serviceWorker.register('sw.js').then(() => changed()).catch(() => {});
  // Android/Chrome: tangguh gesaan pasang supaya ibu bapa memilih bila (bukan muncul semasa anak bermain).
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; changed(); });
  window.addEventListener('appinstalled', () => { deferredPrompt = null; changed(); });
}

export const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
export const canPrompt = () => !!deferredPrompt;

export async function promptInstall() {
  if (!deferredPrompt) return false;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice.catch(() => ({ outcome: 'dismissed' }));
  deferredPrompt = null; changed();
  return outcome === 'accepted';
}

export function installHelp() {
  if (isStandalone()) return 'App sudah dipasang. ✓';
  if (deferredPrompt) return 'Pasang di skrin utama supaya anak boleh buka terus seperti app biasa.';
  if (isIOS()) return 'Di iPhone/iPad: buka dalam Safari, tekan butang Kongsi (petak dengan anak panah ke atas), kemudian pilih "Tambah ke Skrin Utama".';
  return 'Untuk pasang: buka menu pelayar (⋮) dan pilih "Pasang app" atau "Tambah ke skrin utama".';
}

export function offlineStatus() {
  try { return JSON.parse(localStorage.getItem(OFFLINE_KEY) || 'null'); } catch { return null; }
}

/** Muat turun semua modul game dan audio melalui service worker (yang menyimpannya dalam cache). */
export async function cacheAll(games, onProgress) {
  if (!navigator.serviceWorker?.controller) throw new Error('nosw');
  // Minta storan kekal supaya pelayar tidak membuang cache bila ruang storan rendah.
  try { await navigator.storage?.persist?.(); } catch { /* tidak kritikal */ }
  const mods = await Promise.all(games.map((g) => g.load().then((m) => ({ id: g.id, rec: m.default.recorded || [] }))));
  const urls = [
    ...Object.keys(SHARED_LINES).map((k) => `kit/audio/${k}.mp3`),
    ...mods.flatMap(({ id, rec }) => rec.map((k) => `games/${id}/audio/${k}.mp3`)),
  ];
  let done = 0, bytes = 0, failed = 0;
  const q = [...urls];
  await Promise.all(Array.from({ length: 6 }, async () => {
    while (q.length) {
      const u = q.shift();
      try { const r = await fetch(u); if (!r.ok) throw 0; bytes += (await r.arrayBuffer()).byteLength; } catch { failed++; }
      onProgress(++done / urls.length);
    }
  }));
  if (failed) throw new Error(`gagal:${failed}`);
  const st = { at: Date.now(), games: games.length, mb: Math.round(bytes / 1e5) / 10 };
  try { localStorage.setItem(OFFLINE_KEY, JSON.stringify(st)); } catch { /* tidak kritikal */ }
  return st;
}
