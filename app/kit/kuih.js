// Kuih tradisional (pandangan atas/sisi, gaya pelekat). viewBox 0 0 60 60. Tiada gradien (#id) supaya boleh dipapar di mana-mana.
// Setiap kuih berbeza pada bentuk DAN warna supaya corak boleh dibezakan juga oleh anak yang buta warna.

const svg = (inner, label) => `<svg viewBox="0 0 60 60" role="img" aria-label="${label}">${inner}</svg>`;
const shadow = `<ellipse cx="30" cy="53" rx="20" ry="3.5" fill="#000" opacity=".16"/>`;

export const KUIH = [
  { id: 'lapis', name: 'Kuih lapis' },
  { id: 'onde', name: 'Onde-onde' },
  { id: 'serimuka', name: 'Seri muka' },
  { id: 'bahulu', name: 'Bahulu' },
  { id: 'karipap', name: 'Karipap' },
];

const ART = {
  // Segi empat berlapis merah jambu-putih
  lapis: () => `${shadow}<rect x="11" y="10" width="38" height="40" rx="4" fill="#FFF1F3" stroke="#A3324F" stroke-width="2.5"/>
    ${[0, 1, 2, 3].map((i) => `<rect x="12.3" y="${13 + i * 9.5}" width="35.4" height="4.8" fill="#E0567A"/>`).join('')}
    <rect x="15" y="12" width="9" height="2" rx="1" fill="#fff" opacity=".7"/>`,
  // Bola hijau bertabur kelapa
  onde: () => `${shadow}<circle cx="30" cy="31" r="19" fill="#3FA34D" stroke="#22652C" stroke-width="2.5"/>
    <g fill="#FFFDF5">${[[22, 22], [33, 19], [40, 27], [24, 33], [36, 36], [29, 43], [19, 40], [42, 39], [30, 28]].map(([x, y]) => `<rect x="${x}" y="${y}" width="4" height="1.8" rx=".9" transform="rotate(${(x * 7) % 60 - 30} ${x} ${y})"/>`).join('')}</g>
    <ellipse cx="22" cy="21" rx="5" ry="3" fill="#fff" opacity=".35"/>`,
  // Dua lapis: hijau pandan di atas, pulut putih di bawah
  serimuka: () => `${shadow}<path d="M8 22 L30 12 L52 22 L52 42 L30 52 L8 42 Z" fill="#FFFDF5" stroke="#6B6F5A" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M8 22 L30 12 L52 22 L30 32 Z" fill="#B5D63C" stroke="#5E7A12" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M30 32 V52" stroke="#6B6F5A" stroke-width="2"/>
    <path d="M8 22 L30 32 L52 22 L52 28 L30 38 L8 28 Z" fill="#9CC12A"/>
    <g fill="#E9E4D2">${[[14, 38], [20, 42], [40, 40], [45, 36], [34, 45]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.4"/>`).join('')}</g>`,
  // Bunga keemasan bertepi beralun
  bahulu: () => `${shadow}<path d="${(() => { let d = ''; for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2, r = i % 2 ? 15.5 : 20; d += `${i ? 'L' : 'M'}${(30 + r * Math.cos(a)).toFixed(1)} ${(31 + r * Math.sin(a)).toFixed(1)} `; } return d + 'Z'; })()}" fill="#E39A2E" stroke="#9A5A10" stroke-width="2.5" stroke-linejoin="round"/>
    <circle cx="30" cy="31" r="9" fill="#F5C35C" stroke="#C47A16" stroke-width="2"/>
    <circle cx="30" cy="31" r="3" fill="#C47A16"/>`,
  // Separuh bulan dengan tepi berkelim
  karipap: () => `${shadow}<path d="M8 44 Q8 14 30 14 Q52 14 52 44 Z" fill="#E8B04B" stroke="#9A6512" stroke-width="2.5" stroke-linejoin="round"/>
    <g fill="#D4942C" stroke="#9A6512" stroke-width="1.6">${[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => { const h = i < 4, t = h ? i / 4 : (i - 4) / 4, [a, c, b] = h ? [[8, 44], [8, 14], [30, 14]] : [[30, 14], [52, 14], [52, 44]], q = (k) => (1 - t) ** 2 * a[k] + 2 * (1 - t) * t * c[k] + t * t * b[k], x = q(0), y = q(1); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.2"/>`; }).join('')}</g>
    <rect x="8" y="42" width="44" height="4" rx="2" fill="#C98A2A"/>
    <ellipse cx="24" cy="26" rx="6" ry="3" fill="#fff" opacity=".3"/>`,
};

export const kuihSVG = (id) => svg(ART[id](), KUIH.find((k) => k.id === id).name);
export const kuihIcon = (id) => kuihSVG(id).replace(/role="img" aria-label="[^"]*"/, 'aria-hidden="true"');
export const kuihName = (id) => KUIH.find((k) => k.id === id).name;
