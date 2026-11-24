// Utiliti kecil dikongsi semua game. Tiada kebergantungan.

export const CANCEL = Symbol('cancel'); // dilempar bila pusingan dibatalkan (anak tekan Rumah / tukar tab)
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const pick = (a) => a[Math.floor(Math.random() * a.length)];
export const shuffle = (a) => {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
  return b;
};
export const anim = (el, frames, opts) => el.animate(frames, { fill: 'forwards', easing: 'ease-in-out', ...opts }).finished.catch(() => {});
export const pct = (n, d) => (d ? Math.round((n / d) * 100) : null);
export const todayStr = (d = new Date()) => { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };

// n percubaan seimbang (separuh 0, separuh 1), tidak lebih 2 sama berturut-turut.
export function balanced(n) {
  let s;
  do { s = shuffle([...Array(n)].map((_, i) => i % 2)); } while (s.some((v, i) => i > 1 && v === s[i - 1] && v === s[i - 2]));
  return s;
}

// Kedudukan sesuatu rect dalam % pentas (untuk animasi yang kekal betul bila skrin diubah saiz).
export function toPct(stage, r) {
  const s = stage.getBoundingClientRect();
  return { left: (r.left - s.left) / s.width * 100, top: (r.top - s.top) / s.height * 100, width: r.width / s.width * 100 };
}

export function fmtDate(t) {
  const d = new Date(t);
  return d.toLocaleDateString('ms-MY', { day: 'numeric', month: 'short' }) + ' ' + d.toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' });
}
export const meter = (p) => (p === null ? '–' : `<span class="meter"><i style="width:${p}%"></i></span>${p}%`);
