// Muka kanak-kanak dengan 5 perasaan. viewBox 0 0 100 100. Tiada gradien.
// Setiap perasaan ada petanda yang jelas pada KENING, MATA dan MULUT (bukan warna sahaja):
// gembira = mata lengkung + senyum lebar · sedih = kening condong ke atas + mulut ke bawah + air mata
// marah = kening condong ke bawah + mulut ketat · takut = mata besar + kening risau + mulut beralun + peluh
// terkejut = mata bulat besar + kening tinggi melengkung + mulut "O"

export const EMOTIONS = ['gembira', 'sedih', 'marah', 'takut', 'terkejut'];
export const EMOTION_NAME = { gembira: 'Gembira', sedih: 'Sedih', marah: 'Marah', takut: 'Takut', terkejut: 'Terkejut' };

const INK = '#2B2F36';
// Lima kanak-kanak berbeza (kulit, rambut) supaya anak membaca ekspresi, bukan mengenal orang.
export const KIDS = [
  { skin: '#E8B48A', hair: (s) => `<path d="M18 50 Q16 18 50 16 Q84 18 82 50 Q76 30 50 30 Q26 30 18 50 Z" fill="#2B2420"/>` },
  { skin: '#D9A06F', hair: () => '', tudung: '#E0567A' },
  { skin: '#F1C9A5', hair: () => `<circle cx="16" cy="40" r="9" fill="#5A3A22"/><circle cx="84" cy="40" r="9" fill="#5A3A22"/><path d="M19 48 Q18 18 50 17 Q82 18 81 48 Q70 28 50 31 Q30 28 19 48 Z" fill="#5A3A22"/>` },
  { skin: '#A86B44', hair: () => `<g fill="#1E1A17">${[24, 34, 44, 56, 66, 76].map((x, i) => `<circle cx="${x}" cy="${26 - (i > 0 && i < 5 ? 5 : 0)}" r="9"/>`).join('')}</g>` },
  { skin: '#C68654', hair: () => `<path d="M17 58 Q12 18 50 16 Q88 18 83 58 L78 58 Q78 32 50 32 Q22 32 22 58 Z" fill="#3B2A1A"/>` },
];

const BROWS = {
  gembira: `<path d="M31 41 Q37 37 43 40 M57 40 Q63 37 69 41" stroke="${INK}" stroke-width="3" stroke-linecap="round" fill="none"/>`,
  sedih: `<path d="M31 44 L43 39 M57 39 L69 44" stroke="${INK}" stroke-width="3.2" stroke-linecap="round" fill="none"/>`,
  marah: `<path d="M30 38 L44 45 M56 45 L70 38" stroke="${INK}" stroke-width="4.2" stroke-linecap="round" fill="none"/>`,
  takut: `<path d="M30 38 Q36 33 44 34 M56 34 Q64 33 70 38" stroke="${INK}" stroke-width="3" stroke-linecap="round" fill="none"/><path d="M45 36 L48 39 M55 36 L52 39" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`,
  terkejut: `<path d="M29 37 Q37 27 45 35 M55 35 Q63 27 71 37" stroke="${INK}" stroke-width="3" stroke-linecap="round" fill="none"/>`,
};
const dotEyes = (dy = 0) => `<circle cx="38" cy="${52 + dy}" r="3.6" fill="${INK}"/><circle cx="62" cy="${52 + dy}" r="3.6" fill="${INK}"/><circle cx="39.2" cy="${50.8 + dy}" r="1.1" fill="#fff"/><circle cx="63.2" cy="${50.8 + dy}" r="1.1" fill="#fff"/>`;
const bigEyes = (r, pr, px = 0) => `<circle cx="38" cy="51" r="${r}" fill="#fff" stroke="${INK}" stroke-width="2"/><circle cx="62" cy="51" r="${r}" fill="#fff" stroke="${INK}" stroke-width="2"/><circle cx="${38 + px}" cy="51" r="${pr}" fill="${INK}"/><circle cx="${62 + px}" cy="51" r="${pr}" fill="${INK}"/>`;
const EYES = {
  gembira: `<path d="M32 53 Q38 45 44 53 M56 53 Q62 45 68 53" stroke="${INK}" stroke-width="3.4" stroke-linecap="round" fill="none"/>`,
  sedih: dotEyes(2) + `<path d="M33 49 Q38 47 43 49 M57 49 Q62 47 67 49" stroke="${INK}" stroke-width="1.6" fill="none" opacity=".5"/>`,
  marah: dotEyes(1),
  takut: bigEyes(6.5, 2.6, -2),
  terkejut: bigEyes(7, 3.2),
};
const MOUTH = {
  gembira: `<path d="M35 64 Q50 84 65 64 Z" fill="#8E2A2A" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/><path d="M42 72 Q50 79 58 72 Q50 75 42 72 Z" fill="#E5737A"/><path d="M37 64.5 H63" stroke="#fff" stroke-width="2.4"/>`,
  sedih: `<path d="M39 76 Q50 66 61 76" stroke="${INK}" stroke-width="3.4" stroke-linecap="round" fill="none"/>`,
  marah: `<path d="M38 74 Q50 67 62 74 L62 76 Q50 71 38 76 Z" fill="${INK}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`,
  takut: `<path d="M37 73 q3.25 -4 6.5 0 q3.25 4 6.5 0 q3.25 -4 6.5 0 q3.25 4 6.5 0" stroke="${INK}" stroke-width="3" stroke-linecap="round" fill="none"/>`,
  terkejut: `<ellipse cx="50" cy="72" rx="6" ry="8" fill="#8E2A2A" stroke="${INK}" stroke-width="2.4"/>`,
};
const EXTRA = {
  gembira: `<ellipse cx="29" cy="62" rx="6" ry="3.5" fill="#F28C8C" opacity=".55"/><ellipse cx="71" cy="62" rx="6" ry="3.5" fill="#F28C8C" opacity=".55"/>`,
  sedih: `<path d="M33 58 Q30 64 33 67 Q36 64 33 58 Z" fill="#6EC1F0" stroke="#2F7DE1" stroke-width="1.2"/>`,
  marah: `<ellipse cx="29" cy="62" rx="6" ry="3.5" fill="#E5484D" opacity=".45"/><ellipse cx="71" cy="62" rx="6" ry="3.5" fill="#E5484D" opacity=".45"/>`,
  takut: `<path d="M76 36 Q73 42 76 45 Q79 42 76 36 Z" fill="#A9DBF3" stroke="#2F7DE1" stroke-width="1.2"/>`,
  terkejut: '',
};

export function faceSVG(kidIndex, emo, label) {
  const k = KIDS[kidIndex % KIDS.length];
  const head = k.tudung
    ? `<path d="M50 10 Q86 10 88 52 Q90 88 50 94 Q10 88 12 52 Q14 10 50 10 Z" fill="${k.tudung}"/><path d="M50 90 Q30 96 20 92 L22 98 H78 L80 92 Q70 96 50 90 Z" fill="${k.tudung}"/>
       <ellipse cx="50" cy="56" rx="27" ry="30" fill="${k.skin}"/><path d="M23 46 Q26 24 50 24 Q74 24 77 46 Q66 34 50 34 Q34 34 23 46 Z" fill="${k.tudung}"/>`
    : `<circle cx="18" cy="56" r="6" fill="${k.skin}"/><circle cx="82" cy="56" r="6" fill="${k.skin}"/><circle cx="50" cy="54" r="32" fill="${k.skin}"/>${k.hair()}`;
  return `<svg viewBox="0 0 100 100" ${label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"'}>${head}${BROWS[emo]}${EYES[emo]}<path d="M48 60 Q50 63 52 60" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round" opacity=".5"/>${MOUTH[emo]}${EXTRA[emo]}</svg>`;
}
