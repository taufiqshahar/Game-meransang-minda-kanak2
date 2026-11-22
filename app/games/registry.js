// Senarai game. Metadata di sini dimuat terus (untuk laman utama); kod game dimuat hanya bila dimain (import dinamik).
// Tambah game baharu: cipta games/<id>/index.js (lihat games/README.md), kemudian tambah satu entri di bawah.
import { iconOf, hattedSVG } from '../kit/art.js';
import { RAMBUTAN_SVG } from '../kit/objects.js';

// Kemahiran yang dilatih. Warna = latar lakaran kecil game dan titik pada kad.
export const SKILLS = {
  'kawalan-diri': { name: 'Kawalan diri', color: '#F4A9AB' },
  ingatan: { name: 'Ingatan', color: '#A9CBF2' },
  fleksibiliti: { name: 'Fleksibiliti', color: '#F7D57F' },
  bahasa: { name: 'Bahasa', color: '#CDB3F0' },
  nombor: { name: 'Nombor', color: '#93DCC8' },
  emosi: { name: 'Emosi', color: '#F7BD98' },
  sains: { name: 'Sains & alam', color: '#B4DE98' },
  visual: { name: 'Visual', color: '#F2B0D6' },
};

export const GAMES = [
  { id: 'lampu-isyarat', title: 'Lampu Isyarat Haiwan', skill: 'kawalan-diri', ages: [3, 6], thumb: () => iconOf('kancil'), load: () => import('./lampu-isyarat/index.js') },
  { id: 'sorok-sorok', title: 'Sorok-Sorok Hutan', skill: 'ingatan', ages: [3, 6], thumb: () => iconOf('tapir'), load: () => import('./sorok-sorok/index.js') },
  { id: 'rumah-haiwan', title: 'Rumah Haiwan', skill: 'fleksibiliti', ages: [3, 6], thumb: () => hattedSVG('gajah', 'merah', false), load: () => import('./rumah-haiwan/index.js') },
  { id: 'kira-rambutan', title: 'Kira Rambutan', skill: 'nombor', ages: [3, 6], thumb: () => RAMBUTAN_SVG, load: () => import('./kira-rambutan/index.js') },
  { id: 'banyak-mana', title: 'Banyak Mana?', skill: 'nombor', ages: [3, 6], thumb: () => `<svg viewBox="0 0 60 40" aria-hidden="true"><g transform="translate(2 8) scale(.6)">${RAMBUTAN_SVG.replace(/<\/?svg[^>]*>/g, '')}</g><g transform="translate(30 2) scale(.5)">${RAMBUTAN_SVG.replace(/<\/?svg[^>]*>/g, '')}</g><g transform="translate(38 18) scale(.5)">${RAMBUTAN_SVG.replace(/<\/?svg[^>]*>/g, '')}</g><g transform="translate(24 20) scale(.45)">${RAMBUTAN_SVG.replace(/<\/?svg[^>]*>/g, '')}</g></svg>`, load: () => import('./banyak-mana/index.js') },
];
