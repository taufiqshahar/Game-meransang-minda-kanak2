// Senarai game. Metadata di sini dimuat terus (untuk laman utama); kod game dimuat hanya bila dimain (import dinamik).
// Tambah game baharu: cipta games/<id>/index.js (lihat games/README.md), kemudian tambah satu entri di bawah.
import { iconOf, hattedSVG } from '../kit/art.js';

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
];
