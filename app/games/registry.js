// Senarai game. Metadata di sini dimuat terus (untuk laman utama); kod game dimuat hanya bila dimain (import dinamik).
// Tambah game baharu: cipta games/<id>/index.js (lihat games/README.md), kemudian tambah satu entri di bawah.
import { iconOf, hattedSVG } from '../kit/art.js';
import { RAMBUTAN_SVG } from '../kit/objects.js';
import { vehicleIcon } from '../kit/vehicles.js';

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
  dengar: { name: 'Pendengaran', color: '#9FD3E8' },
  motor: { name: 'Motor halus', color: '#F5C7A0' },
};

export const GAMES = [
  { id: 'lampu-isyarat', title: 'Lampu Isyarat Haiwan', skill: 'kawalan-diri', ages: [3, 6], thumb: () => iconOf('kancil'), load: () => import('./lampu-isyarat/index.js') },
  { id: 'sorok-sorok', title: 'Sorok-Sorok Hutan', skill: 'ingatan', ages: [3, 6], thumb: () => iconOf('tapir'), load: () => import('./sorok-sorok/index.js') },
  { id: 'rumah-haiwan', title: 'Rumah Haiwan', skill: 'fleksibiliti', ages: [3, 6], thumb: () => hattedSVG('gajah', 'merah', false), load: () => import('./rumah-haiwan/index.js') },
  { id: 'kira-rambutan', title: 'Kira Rambutan', skill: 'nombor', ages: [3, 6], thumb: () => RAMBUTAN_SVG, load: () => import('./kira-rambutan/index.js') },
  { id: 'banyak-mana', title: 'Banyak Mana?', skill: 'nombor', ages: [3, 6], thumb: () => `<svg viewBox="0 0 60 40" aria-hidden="true"><g transform="translate(2 8) scale(.6)">${RAMBUTAN_SVG.replace(/<\/?svg[^>]*>/g, '')}</g><g transform="translate(30 2) scale(.5)">${RAMBUTAN_SVG.replace(/<\/?svg[^>]*>/g, '')}</g><g transform="translate(38 18) scale(.5)">${RAMBUTAN_SVG.replace(/<\/?svg[^>]*>/g, '')}</g><g transform="translate(24 20) scale(.45)">${RAMBUTAN_SVG.replace(/<\/?svg[^>]*>/g, '')}</g></svg>`, load: () => import('./banyak-mana/index.js') },
  { id: 'bunyi-mula', title: 'Bunyi Mula', skill: 'bahasa', ages: [3, 6], thumb: () => `<svg viewBox="0 0 60 60" aria-hidden="true"><text x="30" y="42" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="34" fill="#15302A">ga</text><path d="M8 18 q-5 12 0 24 M52 18 q5 12 0 24" stroke="#15302A" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`, load: () => import('./bunyi-mula/index.js') },
  { id: 'bunyi-kenderaan', title: 'Bunyi Apa Ni?', skill: 'dengar', ages: [3, 6], thumb: () => vehicleIcon('bomba'), load: () => import('./bunyi-kenderaan/index.js') },
  { id: 'muat-lori', title: 'Muat Lori', skill: 'nombor', ages: [3, 6], thumb: () => vehicleIcon('lori'), load: () => import('./muat-lori/index.js') },
  { id: 'pandu-jengkaut', title: 'Pandu Jengkaut', skill: 'motor', ages: [3, 6], thumb: () => vehicleIcon('jengkaut'), load: () => import('./pandu-jengkaut/index.js') },
];
