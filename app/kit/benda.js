// Benda harian (gaya pelekat). viewBox 0 0 60 60. Tiada gradien. Untuk Rima Lucu (perkataan) dan Tenggelam atau Timbul (bahan).

const shadow = `<ellipse cx="30" cy="54" rx="18" ry="3" fill="#000" opacity=".15"/>`;

const ART = {
  jam: `${shadow}<circle cx="30" cy="29" r="21" fill="#E5484D" stroke="#8E1F22" stroke-width="2.5"/><circle cx="30" cy="29" r="16" fill="#FFFDF5"/>
    <g fill="#2B2F36">${[0, 1, 2, 3].map((i) => { const a = i * Math.PI / 2; return `<circle cx="${(30 + 12.5 * Math.cos(a)).toFixed(1)}" cy="${(29 + 12.5 * Math.sin(a)).toFixed(1)}" r="1.6"/>`; }).join('')}</g>
    <path d="M30 29 V18 M30 29 L38 33" stroke="#2B2F36" stroke-width="2.6" stroke-linecap="round"/><circle cx="30" cy="29" r="2" fill="#2B2F36"/>`,
  bulan: `<path d="M38 8 A22 22 0 1 0 50 44 A17 17 0 1 1 38 8 Z" fill="#F5C531" stroke="#9A7208" stroke-width="2.5" stroke-linejoin="round"/>
    <g fill="#F5C531"><path d="M46 12 l1.6 3.4 3.4 1.6 -3.4 1.6 -1.6 3.4 -1.6 -3.4 -3.4 -1.6 3.4 -1.6 z"/><path d="M52 28 l1 2 2 1 -2 1 -1 2 -1 -2 -2 -1 2 -1 z"/></g>`,
  payung: `<path d="M6 30 Q30 2 54 30 Q50 26 46 30 Q42 26 38 30 Q34 26 30 30 Q26 26 22 30 Q18 26 14 30 Q10 26 6 30 Z" fill="#E5484D" stroke="#8E1F22" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M30 6 Q22 16 22 30 M30 6 Q38 16 38 30" stroke="#FFFDF5" stroke-width="2.4" fill="none" opacity=".8"/>
    <path d="M30 29 V48 Q30 54 24 54 Q19 54 19 49" stroke="#2B2F36" stroke-width="3.4" fill="none" stroke-linecap="round"/><circle cx="30" cy="5" r="2.2" fill="#2B2F36"/>`,
  topi: `${shadow}<path d="M10 40 Q10 14 32 14 Q50 14 50 38 Z" fill="#2F7DE1" stroke="#1A4F99" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M8 40 H56 Q58 46 50 46 H8 Z" fill="#1A4F99" stroke="#123A72" stroke-width="2" stroke-linejoin="round"/>
    <path d="M30 15 V40" stroke="#1A4F99" stroke-width="1.6" opacity=".6"/><circle cx="31" cy="14" r="2.5" fill="#F5B82E"/>`,
  kopi: `${shadow}<ellipse cx="28" cy="50" rx="22" ry="4.5" fill="#FFFDF5" stroke="#8A8F98" stroke-width="2"/>
    <path d="M12 24 H44 V38 Q44 48 34 48 H22 Q12 48 12 38 Z" fill="#FFFDF5" stroke="#8A8F98" stroke-width="2.5"/>
    <path d="M44 28 Q53 28 52 35 Q51 41 44 40" stroke="#8A8F98" stroke-width="3" fill="none"/>
    <ellipse cx="28" cy="25" rx="15" ry="3" fill="#7A4B25"/>
    <path d="M22 18 Q19 13 22 9 M29 17 Q26 12 29 7 M36 18 Q33 13 36 9" stroke="#B9C0C9" stroke-width="2" fill="none" stroke-linecap="round"/>`,
  bantal: `${shadow}<path d="M8 18 Q30 12 52 18 Q56 32 52 46 Q30 52 8 46 Q4 32 8 18 Z" fill="#A9CBF2" stroke="#2F6DB5" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M14 24 Q30 20 46 24" stroke="#FFFDF5" stroke-width="2.4" fill="none" opacity=".7"/>
    <g fill="#2F6DB5">${[[8, 18], [52, 18], [52, 46], [8, 46]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.4"/>`).join('')}</g>`,
  kapal: `<path d="M2 50 Q10 46 18 50 T34 50 T50 50 T66 50 V60 H2 Z" fill="#5BB8E8"/>
    <path d="M6 36 H54 L46 50 H14 Z" fill="#E5484D" stroke="#8E1F22" stroke-width="2.5" stroke-linejoin="round"/>
    <rect x="16" y="24" width="26" height="12" rx="2" fill="#FFFDF5" stroke="#6B7684" stroke-width="2"/>
    <g fill="#5BB8E8">${[20, 27, 34].map((x) => `<circle cx="${x + 1.5}" cy="30" r="2.2"/>`).join('')}</g>
    <rect x="34" y="12" width="7" height="12" fill="#F5B82E" stroke="#9A7208" stroke-width="2"/>
    <path d="M37 9 Q34 5 38 2" stroke="#B9C0C9" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
  pintu: `${shadow}<rect x="13" y="4" width="34" height="50" rx="2" fill="#B07A44" stroke="#6E4520" stroke-width="2.5"/>
    <rect x="18" y="9" width="24" height="16" rx="1.5" fill="#C99460" stroke="#6E4520" stroke-width="1.6"/>
    <rect x="18" y="29" width="24" height="20" rx="1.5" fill="#C99460" stroke="#6E4520" stroke-width="1.6"/>
    <circle cx="40" cy="29" r="2.6" fill="#F5B82E" stroke="#9A7208" stroke-width="1.4"/>`,
  batu: `${shadow}<path d="M8 46 Q4 34 14 26 Q20 14 34 16 Q50 16 54 32 Q58 46 46 50 H16 Q10 50 8 46 Z" fill="#9AA3AE" stroke="#4F5864" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M18 28 Q24 22 32 23" stroke="#C9D1D9" stroke-width="3" fill="none" stroke-linecap="round"/>
    <g fill="#7D8792"><circle cx="40" cy="38" r="2"/><circle cx="24" cy="42" r="1.6"/><circle cx="46" cy="28" r="1.3"/></g>`,
  katak: `${shadow}<ellipse cx="30" cy="38" rx="22" ry="15" fill="#5DBB46" stroke="#2C6E1E" stroke-width="2.5"/>
    <circle cx="19" cy="22" r="8" fill="#5DBB46" stroke="#2C6E1E" stroke-width="2.5"/><circle cx="41" cy="22" r="8" fill="#5DBB46" stroke="#2C6E1E" stroke-width="2.5"/>
    <circle cx="19" cy="22" r="4.4" fill="#FFFDF5"/><circle cx="41" cy="22" r="4.4" fill="#FFFDF5"/><circle cx="20" cy="22.5" r="2.4" fill="#2B2F36"/><circle cx="40" cy="22.5" r="2.4" fill="#2B2F36"/>
    <path d="M16 40 Q30 50 44 40" stroke="#2C6E1E" stroke-width="2.8" fill="none" stroke-linecap="round"/>
    <ellipse cx="14" cy="38" rx="3" ry="2" fill="#F28C8C" opacity=".6"/><ellipse cx="46" cy="38" rx="3" ry="2" fill="#F28C8C" opacity=".6"/>`,
  kotak: `${shadow}<path d="M8 22 L30 14 L52 22 L30 30 Z" fill="#E2B57A" stroke="#8A5A1E" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M8 22 V44 L30 53 V30 Z" fill="#C99456" stroke="#8A5A1E" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M52 22 V44 L30 53 V30 Z" fill="#D9A766" stroke="#8A5A1E" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M19 18 L41 26 V34" stroke="#F5E6C8" stroke-width="4" fill="none"/>`,
  // ---- Bahan eksperimen ----
  bola: `${[0, 1, 2, 3, 4, 5].map((i) => { const a0 = (i / 6) * Math.PI * 2 - Math.PI / 2, a1 = ((i + 1) / 6) * Math.PI * 2 - Math.PI / 2, p = (a) => `${(30 + 22 * Math.cos(a)).toFixed(1)} ${(30 + 22 * Math.sin(a)).toFixed(1)}`; return `<path d="M30 30 L${p(a0)} A22 22 0 0 1 ${p(a1)} Z" fill="${['#E5484D', '#FFFDF5', '#2F7DE1', '#F5B82E', '#FFFDF5', '#22B26A'][i]}"/>`; }).join('')}
    <circle cx="30" cy="30" r="22" fill="none" stroke="#2B2F36" stroke-width="2.5"/><circle cx="30" cy="30" r="4" fill="#FFFDF5" stroke="#2B2F36" stroke-width="1.6"/>
    <ellipse cx="20" cy="18" rx="5" ry="3" fill="#fff" opacity=".55"/>`,
  itik: `<path d="M10 36 Q10 50 30 50 Q50 50 52 36 Q52 28 44 28 Q40 30 36 30 Q34 24 36 18 Q36 8 26 8 Q16 8 16 18 Q16 26 22 30 Q10 28 10 36 Z" fill="#F7D23E" stroke="#A07A0A" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M14 20 Q6 20 4 24 Q10 26 16 24 Z" fill="#F28A2C" stroke="#A3511A" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="23" cy="17" r="2.4" fill="#2B2F36"/><path d="M30 38 Q38 42 46 36" stroke="#D9A514" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
  daun: `<path d="M8 50 Q6 18 46 8 Q54 40 18 50 Z" fill="#5DBB46" stroke="#2C6E1E" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M8 50 Q26 32 44 12 M22 36 L18 26 M30 28 L30 18 M28 32 L38 30 M18 42 L28 42" stroke="#2C6E1E" stroke-width="2" fill="none" stroke-linecap="round"/>`,
  kunci: `<circle cx="16" cy="30" r="10" fill="#F5C531" stroke="#9A7208" stroke-width="2.5"/><circle cx="16" cy="30" r="4" fill="#FFFDF5" stroke="#9A7208" stroke-width="2"/>
    <path d="M26 27 H52 V33 H48 V39 H43 V33 H38 V37 H34 V33 H26 Z" fill="#F5C531" stroke="#9A7208" stroke-width="2.5" stroke-linejoin="round"/>`,
  syiling: `<circle cx="30" cy="30" r="16" fill="#D9DEE4" stroke="#6B7684" stroke-width="2.5"/><circle cx="30" cy="30" r="11" fill="none" stroke="#9AA3AE" stroke-width="2"/>
    <text x="30" y="35.5" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="14" fill="#6B7684">10</text>`,
  kayu: `<rect x="6" y="20" width="46" height="20" rx="4" fill="#B07A44" stroke="#6E4520" stroke-width="2.5"/>
    <path d="M12 26 H34 M16 34 H44" stroke="#8A5A2E" stroke-width="2" stroke-linecap="round"/>
    <ellipse cx="52" cy="30" rx="6" ry="10" fill="#E2B57A" stroke="#6E4520" stroke-width="2.5"/><ellipse cx="52" cy="30" rx="3" ry="5" fill="none" stroke="#B07A44" stroke-width="1.6"/>`,
  epal: `<path d="M30 18 Q20 10 12 18 Q4 28 10 40 Q16 52 26 50 Q30 48 34 50 Q44 52 50 40 Q56 28 48 18 Q40 10 30 18 Z" fill="#E5484D" stroke="#8E1F22" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M30 18 Q30 10 34 6" stroke="#6E4520" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M34 10 Q42 4 46 10 Q40 14 34 10 Z" fill="#5DBB46" stroke="#2C6E1E" stroke-width="1.8"/>
    <ellipse cx="18" cy="26" rx="4" ry="6" fill="#fff" opacity=".35"/>`,
  sudu: `<ellipse cx="18" cy="30" rx="12" ry="9" fill="#C9D1D9" stroke="#6B7684" stroke-width="2.5"/><ellipse cx="16" cy="28" rx="5" ry="3" fill="#fff" opacity=".6"/>
    <path d="M29 30 L54 27 Q56 30 54 33 Z" fill="#C9D1D9" stroke="#6B7684" stroke-width="2.5" stroke-linejoin="round"/>`,
  botol: `<rect x="23" y="4" width="14" height="7" rx="2" fill="#2F7DE1" stroke="#1A4F99" stroke-width="2"/>
    <path d="M24 11 H36 V16 Q46 20 46 30 V50 Q46 55 41 55 H19 Q14 55 14 50 V30 Q14 20 24 16 Z" fill="#CFEAF7" fill-opacity=".85" stroke="#4A90B8" stroke-width="2.5" stroke-linejoin="round"/>
    <rect x="14" y="32" width="32" height="10" fill="#2F7DE1" opacity=".7"/><path d="M19 22 Q18 34 19 46" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".7"/>`,
};

export const NAMES = {
  jam: 'Jam', bulan: 'Bulan', payung: 'Payung', topi: 'Topi', kopi: 'Kopi', bantal: 'Bantal', kapal: 'Kapal', pintu: 'Pintu', batu: 'Batu', katak: 'Katak', kotak: 'Kotak',
  bola: 'Bola', itik: 'Itik getah', daun: 'Daun', kunci: 'Kunci', syiling: 'Syiling', kayu: 'Kayu', epal: 'Epal', sudu: 'Sudu', botol: 'Botol kosong',
};
export const hasBenda = (id) => id in ART;
export const bendaIcon = (id) => `<svg viewBox="0 0 60 60" aria-hidden="true">${ART[id]}</svg>`;
