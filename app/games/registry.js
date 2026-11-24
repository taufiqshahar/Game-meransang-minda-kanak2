// Senarai game. Metadata di sini dimuat terus (untuk laman utama); kod game dimuat hanya bila dimain (import dinamik).
// Tambah game baharu: cipta games/<id>/index.js (lihat games/README.md), kemudian tambah satu entri di bawah.
import { iconOf, hattedSVG } from '../kit/art.js';
import { RAMBUTAN_SVG } from '../kit/objects.js';
import { vehicleIcon } from '../kit/vehicles.js';
import { kuihIcon } from '../kit/kuih.js';
import { faceSVG } from '../kit/faces.js';
import { itemIcon } from '../kit/pasar.js';
import { bendaIcon } from '../kit/benda.js';
import { RAMBUTAN_SVG as RB } from '../kit/objects.js';

const inner = (svg) => svg.replace(/<\/?svg[^>]*>/g, '');

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
  motor: { name: 'Motor halus', color: '#F5C7A0' },
};

export const GAMES = [
  { id: 'lampu-isyarat', title: 'Lampu Isyarat Haiwan', skill: 'kawalan-diri', ages: [3, 6], thumb: () => iconOf('kancil'), load: () => import('./lampu-isyarat/index.js') },
  { id: 'sorok-sorok', title: 'Sorok-Sorok Hutan', skill: 'ingatan', ages: [3, 6], thumb: () => iconOf('tapir'), load: () => import('./sorok-sorok/index.js') },
  { id: 'rumah-haiwan', title: 'Rumah Haiwan', skill: 'fleksibiliti', ages: [3, 6], thumb: () => hattedSVG('gajah', 'merah', false), load: () => import('./rumah-haiwan/index.js') },
  { id: 'kira-rambutan', title: 'Kira Rambutan', skill: 'nombor', ages: [3, 6], thumb: () => RAMBUTAN_SVG, load: () => import('./kira-rambutan/index.js') },
  { id: 'banyak-mana', title: 'Banyak Mana?', skill: 'nombor', ages: [3, 6], thumb: () => `<svg viewBox="0 0 60 40" aria-hidden="true"><g transform="translate(2 8) scale(.6)">${RAMBUTAN_SVG.replace(/<\/?svg[^>]*>/g, '')}</g><g transform="translate(30 2) scale(.5)">${RAMBUTAN_SVG.replace(/<\/?svg[^>]*>/g, '')}</g><g transform="translate(38 18) scale(.5)">${RAMBUTAN_SVG.replace(/<\/?svg[^>]*>/g, '')}</g><g transform="translate(24 20) scale(.45)">${RAMBUTAN_SVG.replace(/<\/?svg[^>]*>/g, '')}</g></svg>`, load: () => import('./banyak-mana/index.js') },
  { id: 'bunyi-mula', title: 'Bunyi Mula', skill: 'bahasa', ages: [3, 6], thumb: () => `<svg viewBox="0 0 60 60" aria-hidden="true"><text x="30" y="42" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="34" fill="#15302A">ga</text><path d="M8 18 q-5 12 0 24 M52 18 q5 12 0 24" stroke="#15302A" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`, load: () => import('./bunyi-mula/index.js') },
  { id: 'muat-lori', title: 'Muat Lori', skill: 'nombor', ages: [3, 6], thumb: () => vehicleIcon('lori'), load: () => import('./muat-lori/index.js') },
  { id: 'pandu-jengkaut', title: 'Pandu Jengkaut', skill: 'motor', ages: [3, 6], thumb: () => vehicleIcon('jengkaut'), load: () => import('./pandu-jengkaut/index.js') },
  { id: 'pasangan-kenderaan', title: 'Pasangan Kenderaan', skill: 'ingatan', ages: [3, 6], thumb: () => vehicleIcon('bas'), load: () => import('./pasangan-kenderaan/index.js') },
  { id: 'susun-saiz', title: 'Susun Ikut Saiz', skill: 'nombor', ages: [3, 6], thumb: () => `<svg viewBox="0 0 160 70" aria-hidden="true"><g transform="translate(0 44) scale(.2)">${inner(vehicleIcon('lori'))}</g><g transform="translate(36 32) scale(.32)">${inner(vehicleIcon('lori'))}</g><g transform="translate(86 14) scale(.46)">${inner(vehicleIcon('lori'))}</g></svg>`, load: () => import('./susun-saiz/index.js') },
  { id: 'corak-kuih', title: 'Corak Kuih', skill: 'nombor', ages: [3, 6], thumb: () => `<svg viewBox="0 0 120 44" aria-hidden="true">${['lapis', 'onde', 'lapis', 'onde'].map((k, i) => `<g transform="translate(${i * 30} 6) scale(.5)">${inner(kuihIcon(k))}</g>`).join('')}</svg>`, load: () => import('./corak-kuih/index.js') },
  { id: 'muka-perasaan', title: 'Muka Perasaan', skill: 'emosi', ages: [3, 6], thumb: () => faceSVG(0, 'gembira'), load: () => import('./muka-perasaan/index.js') },
  { id: 'pasang-kenderaan', title: 'Pasang Kenderaan', skill: 'visual', ages: [3, 6], thumb: () => `<svg viewBox="0 0 172 124" aria-hidden="true"><svg x="0" y="4" width="80" height="120" viewBox="0 0 80 120">${inner(vehicleIcon('bomba'))}</svg><svg x="92" y="0" width="80" height="120" viewBox="80 0 80 120">${inner(vehicleIcon('bomba'))}</svg></svg>`, load: () => import('./pasang-kenderaan/index.js') },
  { id: 'pasar-malam', title: 'Pasar Malam', skill: 'ingatan', ages: [3, 6], thumb: () => `<svg viewBox="0 0 100 60" aria-hidden="true"><g transform="translate(0 4) scale(.85)">${inner(itemIcon('tembikai'))}</g><g transform="translate(46 4) scale(.85)">${inner(itemIcon('nanas'))}</g></svg>`, load: () => import('./pasar-malam/index.js') },
  { id: 'rima-lucu', title: 'Rima Lucu', skill: 'bahasa', ages: [3, 6], thumb: () => `<svg viewBox="0 0 100 52" aria-hidden="true"><g transform="translate(0 0) scale(.85)">${inner(bendaIcon('topi'))}</g><g transform="translate(48 0) scale(.85)">${inner(bendaIcon('kopi'))}</g></svg>`, load: () => import('./rima-lucu/index.js') },
  { id: 'tenggelam-timbul', title: 'Tenggelam atau Timbul', skill: 'sains', ages: [3, 6], thumb: () => `<svg viewBox="0 0 60 60" aria-hidden="true"><rect x="4" y="22" width="52" height="34" rx="4" fill="#40A0DC" opacity=".55"/><g transform="translate(14 8) scale(.55)">${inner(bendaIcon('itik'))}</g><g transform="translate(20 34) scale(.38)">${inner(bendaIcon('batu'))}</g></svg>`, load: () => import('./tenggelam-timbul/index.js') },
  { id: 'hafiz-kata', title: 'Hafiz Kata', skill: 'kawalan-diri', ages: [3, 6], thumb: () => `<svg viewBox="0 0 60 60" aria-hidden="true"><path d="M30 5 L37 22 L55 23 L41 35 L46 53 L30 43 L14 53 L19 35 L5 23 L23 22 Z" fill="#F5B82E" stroke="#B7860F" stroke-width="3" stroke-linejoin="round"/></svg>`, load: () => import('./hafiz-kata/index.js') },
  { id: 'kawan-baik', title: 'Kawan Baik', skill: 'emosi', ages: [3, 6], thumb: () => `<svg viewBox="0 0 120 60" aria-hidden="true"><g transform="translate(0 0) scale(.6)">${inner(faceSVG(1, 'sedih'))}</g><path d="M60 22 c-4 -6 -12 -2 -8 4 l8 8 8 -8 c4 -6 -4 -10 -8 -4z" fill="#E5484D"/><g transform="translate(60 0) scale(.6)">${inner(faceSVG(3, 'gembira'))}</g></svg>`, load: () => import('./kawan-baik/index.js') },
  { id: 'bayang-siapa', title: 'Bayang Siapa?', skill: 'visual', ages: [3, 6], thumb: () => `<svg viewBox="0 0 172 124" aria-hidden="true"><g transform="translate(6 6) scale(.62)" style="filter:brightness(0)" opacity=".8">${inner(vehicleIcon('jengkaut'))}</g><g transform="translate(70 40) scale(.62)">${inner(vehicleIcon('jengkaut'))}</g></svg>`, load: () => import('./bayang-siapa/index.js') },
  { id: 'tambah-buah', title: 'Tambah Buah', skill: 'nombor', ages: [3, 6], thumb: () => `<svg viewBox="0 0 100 44" aria-hidden="true"><g transform="translate(0 6) scale(.8)">${inner(RB)}</g><g transform="translate(24 6) scale(.8)">${inner(RB)}</g><text x="58" y="32" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="26" fill="#15302A">+</text><g transform="translate(68 6) scale(.8)">${inner(RB)}</g></svg>`, load: () => import('./tambah-buah/index.js') },
];
