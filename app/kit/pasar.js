// Barang pasar (gaya pelekat). viewBox 0 0 60 60. Tiada gradien. Setiap barang berbeza bentuk dan warna.

const svg = (inner, label) => `<svg viewBox="0 0 60 60" role="img" aria-label="${label}">${inner}</svg>`;
const shadow = `<ellipse cx="30" cy="54" rx="19" ry="3.2" fill="#000" opacity=".15"/>`;

export const ITEMS = [
  { id: 'ayam', name: 'Ayam' },
  { id: 'ikan', name: 'Ikan' },
  { id: 'telur', name: 'Telur' },
  { id: 'roti', name: 'Roti' },
  { id: 'pisang', name: 'Pisang' },
  { id: 'tembikai', name: 'Tembikai' },
  { id: 'jagung', name: 'Jagung' },
  { id: 'nanas', name: 'Nanas' },
];

const ART = {
  // Peha ayam goreng
  ayam: `${shadow}<path d="M14 38 Q6 22 20 13 Q34 6 42 18 Q48 28 38 36 L34 39 Q24 46 14 38 Z" fill="#C9772E" stroke="#7A3F10" stroke-width="2.5"/>
    <path d="M20 18 Q26 14 32 17" stroke="#E9A45A" stroke-width="3" stroke-linecap="round" fill="none"/>
    <path d="M35 38 L46 48" stroke="#7A3F10" stroke-width="9" stroke-linecap="round"/><path d="M35 38 L46 48" stroke="#FFF7E6" stroke-width="5.5" stroke-linecap="round"/>
    <circle cx="47" cy="46" r="4" fill="#FFF7E6" stroke="#7A3F10" stroke-width="2"/><circle cx="44" cy="50.5" r="4" fill="#FFF7E6" stroke="#7A3F10" stroke-width="2"/>`,
  // Ikan biru
  ikan: `${shadow}<path d="M8 31 Q20 15 38 20 Q44 22 47 28 L56 19 L54 31 L56 43 L47 34 Q44 40 38 42 Q20 47 8 31 Z" fill="#5B9BD5" stroke="#1F4E79" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M24 22 Q22 31 24 40" stroke="#1F4E79" stroke-width="2" fill="none" opacity=".6"/>
    <path d="M30 34 Q36 37 40 33" stroke="#A9CBF2" stroke-width="2" fill="none"/>
    <circle cx="16" cy="28" r="3.2" fill="#fff" stroke="#1F4E79" stroke-width="1.5"/><circle cx="16.6" cy="28" r="1.5" fill="#1F4E79"/>`,
  // Dua biji telur
  telur: `${shadow}<ellipse cx="22" cy="34" rx="11" ry="15" fill="#FFF6E0" stroke="#A8865A" stroke-width="2.5"/>
    <ellipse cx="39" cy="36" rx="10.5" ry="14" fill="#F3D9B1" stroke="#A8865A" stroke-width="2.5"/>
    <ellipse cx="18" cy="27" rx="3" ry="5" fill="#fff" opacity=".8"/><ellipse cx="35" cy="29" rx="2.6" ry="4.5" fill="#fff" opacity=".55"/>`,
  // Roti buku
  roti: `${shadow}<path d="M9 30 Q9 14 22 14 Q30 9 38 14 Q51 14 51 30 V48 Q51 51 48 51 H12 Q9 51 9 48 Z" fill="#D89A4E" stroke="#7E4E1A" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M14 30 Q14 20 24 20 Q30 16 36 20 Q46 20 46 30 V46 H14 Z" fill="#F6DDB0"/>
    <g fill="#E8C48A">${[[20, 30], [28, 36], [36, 28], [40, 40], [22, 41]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.3"/>`).join('')}</g>`,
  // Sesikat pisang
  pisang: `${shadow}<path d="M12 22 Q14 46 40 48 Q48 48 50 44 Q30 42 20 20 Z" fill="#F7D23E" stroke="#A07A0A" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M20 18 Q26 40 50 38 Q54 36 54 32 Q34 34 27 16 Z" fill="#FBE15F" stroke="#A07A0A" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M14 14 Q20 12 28 14 L26 20 L18 22 Z" fill="#6B8E23" stroke="#3E5A10" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="50" cy="44" r="1.6" fill="#5A4210"/><circle cx="54" cy="32" r="1.6" fill="#5A4210"/>`,
  // Sepotong tembikai
  tembikai: `${shadow}<path d="M6 22 H54 A24 24 0 0 1 6 22 Z" fill="#3E9B3E" stroke="#1F5F1F" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M10 22 H50 A20 20 0 0 1 10 22 Z" fill="#F1F7D8"/>
    <path d="M13 22 H47 A17 17 0 0 1 13 22 Z" fill="#E5484D"/>
    <g fill="#2B2F36">${[[22, 28], [30, 32], [38, 28], [26, 35], [34, 35], [30, 26]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="1.3" ry="2.1"/>`).join('')}</g>`,
  // Jagung dengan daun
  jagung: `${shadow}<ellipse cx="30" cy="28" rx="10" ry="20" fill="#F5C531" stroke="#9A7208" stroke-width="2.5"/>
    <g stroke="#D9A514" stroke-width="1.4">${[14, 20, 26, 32, 38].map((y) => `<path d="M21 ${y} H39"/>`).join('')}<path d="M26 10 V46 M34 10 V46"/></g>
    <path d="M30 52 Q16 44 15 24 Q22 36 30 40 Z" fill="#6DB33F" stroke="#2F6B12" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M30 52 Q44 44 45 24 Q38 36 30 40 Z" fill="#7CC64B" stroke="#2F6B12" stroke-width="2.2" stroke-linejoin="round"/>`,
  // Nanas
  nanas: `${shadow}<path d="M30 18 L22 4 L28 12 L30 2 L32 12 L38 4 Z" fill="#4FA34A" stroke="#22652C" stroke-width="2" stroke-linejoin="round"/>
    <ellipse cx="30" cy="35" rx="14" ry="18" fill="#F2A93B" stroke="#9A5A10" stroke-width="2.5"/>
    <g stroke="#B8731A" stroke-width="1.6" fill="none" stroke-linecap="round">${[[24, 24], [36, 24], [30, 30], [20, 32], [40, 32], [24, 38], [36, 38], [30, 44], [30, 20]].map(([x, y]) => `<path d="M${x - 3} ${y - 2} L${x} ${y + 1} L${x + 3} ${y - 2}"/>`).join('')}</g>`,
};

export const itemSVG = (id) => svg(ART[id], ITEMS.find((i) => i.id === id).name);
export const itemIcon = (id) => `<svg viewBox="0 0 60 60" aria-hidden="true">${ART[id]}</svg>`;
export const itemName = (id) => ITEMS.find((i) => i.id === id).name;
