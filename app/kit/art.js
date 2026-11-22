// Lukisan haiwan dikongsi oleh semua game: SVG vektor, gaya pelekat kartun.
// Gradien (#ag-*) didaftar sekali oleh main.js melalui ART_DEFS.

const eye = (cx, cy, r, iris = '#2A1C14') => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${iris}"/><circle cx="${cx}" cy="${cy}" r="${r * .55}" fill="#120C08"/><circle cx="${cx + r * .32}" cy="${cy - r * .36}" r="${r * .36}" fill="#fff"/><circle cx="${cx - r * .38}" cy="${cy + r * .36}" r="${r * .16}" fill="#fff" opacity=".85"/>`;
const ringEye = (cx, cy, r, iris) => `<circle cx="${cx}" cy="${cy}" r="${r * 1.45}" fill="#FFFDF7"/>${eye(cx, cy, r, iris)}`;
const cheeks = (y, l, r, s = 7) => `<ellipse cx="${l}" cy="${y}" rx="${s}" ry="${s * .7}" fill="url(#ag-cheek)"/><ellipse cx="${r}" cy="${y}" rx="${s}" ry="${s * .7}" fill="url(#ag-cheek)"/>`;
const shadow = (rx = 34) => `<ellipse cx="70" cy="143" rx="${rx}" ry="5.5" fill="#0B2A1C" opacity=".18"/>`;
// Anggota berbentuk garisan tebal dengan garis luar (dua lapis).
const limb = (d, w, fill, line) => `<path d="${d}" stroke="${line}" stroke-width="${w + 5}" stroke-linecap="round" fill="none"/><path d="${d}" stroke="${fill}" stroke-width="${w}" stroke-linecap="round" fill="none"/>`;
const wrap = (inner, label) => `<svg viewBox="0 0 140 150" role="img" aria-label="${label}">${inner}</svg>`;

export const ART = {
  kancil: () => wrap(`${shadow(30)}
    ${limb('M54 112 L52 138', 6, '#9A5F33', '#5E3519')}${limb('M86 112 L88 138', 6, '#9A5F33', '#5E3519')}
    ${limb('M62 116 L61 140', 6.5, '#B57442', '#5E3519')}${limb('M78 116 L79 140', 6.5, '#B57442', '#5E3519')}
    <ellipse cx="61" cy="140.5" rx="4.5" ry="2.6" fill="#2A1C14"/><ellipse cx="79" cy="140.5" rx="4.5" ry="2.6" fill="#2A1C14"/>
    <ellipse cx="70" cy="104" rx="27" ry="21" fill="url(#ag-kancil)" stroke="#6B3E1F" stroke-width="3"/>
    <path d="M58 90 l12 9 l12 -9" stroke="#FFF6E8" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <path d="M61 101 l9 6.5 l9 -6.5" stroke="#FFF6E8" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <ellipse cx="45" cy="36" rx="9" ry="12.5" transform="rotate(-32 45 36)" fill="url(#ag-kancil)" stroke="#6B3E1F" stroke-width="3"/>
    <ellipse cx="95" cy="36" rx="9" ry="12.5" transform="rotate(32 95 36)" fill="url(#ag-kancil)" stroke="#6B3E1F" stroke-width="3"/>
    <ellipse cx="46" cy="37" rx="4.2" ry="7" transform="rotate(-32 46 37)" fill="#E9B98F"/><ellipse cx="94" cy="37" rx="4.2" ry="7" transform="rotate(32 94 37)" fill="#E9B98F"/>
    <path d="M70 30 C92 30 102 46 102 62 C102 80 88 90 70 90 C52 90 38 80 38 62 C38 46 48 30 70 30 Z" fill="url(#ag-kancil)" stroke="#6B3E1F" stroke-width="3"/>
    <path d="M60 50 q-6 10 -2 22 M80 50 q6 10 2 22" stroke="#E4B48A" stroke-width="3" stroke-linecap="round" fill="none" opacity=".9"/>
    <ellipse cx="70" cy="78" rx="14.5" ry="10.5" fill="url(#ag-cream)"/>
    <ellipse cx="70" cy="72" rx="5.5" ry="4" fill="#2A1C14"/><ellipse cx="68.4" cy="70.8" rx="1.6" ry="1" fill="#fff" opacity=".7"/>
    <path d="M64 81 q6 5 12 0" stroke="#5A3420" stroke-width="2.2" stroke-linecap="round" fill="none"/>
    ${eye(56, 60, 7)}${eye(84, 60, 7)}${cheeks(73, 47, 93, 6.5)}`, 'Kancil'),

  harimau: () => wrap(`${shadow(36)}
    <path d="M99 116 q22 -2 19 -27" stroke="#8E4211" stroke-width="12" stroke-linecap="round" fill="none"/>
    <path d="M99 116 q22 -2 19 -27" stroke="#F28A2C" stroke-width="7" stroke-linecap="round" fill="none"/>
    <path d="M114 101 l6 2 M117 93 l6 1" stroke="#2B1B12" stroke-width="3" stroke-linecap="round"/>
    <ellipse cx="70" cy="110" rx="31" ry="24" fill="url(#ag-tiger)" stroke="#8E4211" stroke-width="3"/>
    <ellipse cx="70" cy="116" rx="17" ry="14" fill="url(#ag-white)"/>
    <path d="M42 101 q7 2 10 8 M41 114 q7 1 9 6 M98 101 q-7 2 -10 8 M99 114 q-7 1 -9 6" stroke="#2B1B12" stroke-width="3.5" stroke-linecap="round" fill="none"/>
    <rect x="50" y="116" width="16" height="25" rx="8" fill="url(#ag-tiger)" stroke="#8E4211" stroke-width="3"/>
    <rect x="74" y="116" width="16" height="25" rx="8" fill="url(#ag-tiger)" stroke="#8E4211" stroke-width="3"/>
    <ellipse cx="58" cy="137" rx="8.5" ry="5" fill="url(#ag-white)" stroke="#8E4211" stroke-width="2.4"/><ellipse cx="82" cy="137" rx="8.5" ry="5" fill="url(#ag-white)" stroke="#8E4211" stroke-width="2.4"/>
    <circle cx="42" cy="34" r="12" fill="url(#ag-tiger)" stroke="#8E4211" stroke-width="3"/><circle cx="98" cy="34" r="12" fill="url(#ag-tiger)" stroke="#8E4211" stroke-width="3"/>
    <circle cx="42" cy="35" r="6" fill="#FFE2CF"/><circle cx="98" cy="35" r="6" fill="#FFE2CF"/>
    <ellipse cx="70" cy="63" rx="37" ry="33" fill="url(#ag-tiger)" stroke="#8E4211" stroke-width="3"/>
    <g stroke="#2B1B12" stroke-linecap="round" fill="none">
      <path d="M70 31 v11" stroke-width="5"/><path d="M58 34 q4 5 2 11" stroke-width="4"/><path d="M82 34 q-4 5 -2 11" stroke-width="4"/>
      <path d="M34 56 q7 1 11 5" stroke-width="4"/><path d="M35 68 q7 0 10 3" stroke-width="3.5"/>
      <path d="M106 56 q-7 1 -11 5" stroke-width="4"/><path d="M105 68 q-7 0 -10 3" stroke-width="3.5"/>
    </g>
    <ellipse cx="56" cy="49" rx="6.5" ry="3.6" fill="#FFF8EE"/><ellipse cx="84" cy="49" rx="6.5" ry="3.6" fill="#FFF8EE"/>
    <ellipse cx="61" cy="79" rx="12" ry="9.5" fill="url(#ag-white)"/><ellipse cx="79" cy="79" rx="12" ry="9.5" fill="url(#ag-white)"/>
    <ellipse cx="70" cy="89" rx="9" ry="5.5" fill="url(#ag-white)"/>
    <path d="M62.5 72 h15 q-2 6.5 -7.5 7.5 q-5.5 -1 -7.5 -7.5 z" fill="#E87E8E" stroke="#5A2A1A" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M70 79.5 v3.5 M70 83 q-5 4.5 -9.5 1 M70 83 q5 4.5 9.5 1" stroke="#5A2A1A" stroke-width="2" stroke-linecap="round" fill="none"/>
    <g fill="#5A2A1A" opacity=".55"><circle cx="58" cy="80" r="1.1"/><circle cx="55" cy="83" r="1.1"/><circle cx="82" cy="80" r="1.1"/><circle cx="85" cy="83" r="1.1"/></g>
    ${eye(57, 61, 7)}${eye(83, 61, 7)}${cheeks(74, 44, 96, 6)}`, 'Harimau Malaya'),

  orangutan: () => wrap(`${shadow(40)}
    ${limb('M47 96 C33 108 30 122 33 136', 13, '#C2532A', '#7A2D10')}${limb('M93 96 C107 108 110 122 107 136', 13, '#C2532A', '#7A2D10')}
    <ellipse cx="33" cy="139" rx="8.5" ry="6" fill="url(#ag-face)" stroke="#7A2D10" stroke-width="2.4"/><ellipse cx="107" cy="139" rx="8.5" ry="6" fill="url(#ag-face)" stroke="#7A2D10" stroke-width="2.4"/>
    ${limb('M60 126 L59 137', 11, '#B04822', '#7A2D10')}${limb('M80 126 L81 137', 11, '#B04822', '#7A2D10')}
    <ellipse cx="58" cy="140" rx="8" ry="4.5" fill="url(#ag-face)" stroke="#7A2D10" stroke-width="2.2"/><ellipse cx="82" cy="140" rx="8" ry="4.5" fill="url(#ag-face)" stroke="#7A2D10" stroke-width="2.2"/>
    <ellipse cx="70" cy="108" rx="27" ry="25" fill="url(#ag-orang)" stroke="#7A2D10" stroke-width="3"/>
    <path d="M60 98 q4 6 2 12 M72 96 q3 7 0 14 M82 100 q-2 6 1 11" stroke="#E9824F" stroke-width="2.4" stroke-linecap="round" fill="none" opacity=".8"/>
    <path d="M44 48 C40 26 56 20 70 20 C84 20 100 26 96 48 Z" fill="url(#ag-orang)" stroke="#7A2D10" stroke-width="3" stroke-linejoin="round"/>
    <path d="M62 22 l3 -10 l5 9 l5 -10 l3 11" fill="url(#ag-orang)" stroke="#7A2D10" stroke-width="3" stroke-linejoin="round"/>
    <circle cx="70" cy="58" r="31" fill="url(#ag-orang)" stroke="#7A2D10" stroke-width="3"/>
    <path d="M70 41 C78 37 92 40 92 54 C92 62 88 68 86 72 C84 84 78 90 70 90 C62 90 56 84 54 72 C52 68 48 62 48 54 C48 40 62 37 70 41 Z" fill="url(#ag-face)" stroke="#9A4A26" stroke-width="2"/>
    ${eye(61, 56, 5.5)}${eye(79, 56, 5.5)}
    <circle cx="67" cy="69" r="1.9" fill="#6B3218"/><circle cx="73" cy="69" r="1.9" fill="#6B3218"/>
    <path d="M58 77 q12 9 24 0" stroke="#7A3A1E" stroke-width="2.6" stroke-linecap="round" fill="none"/>
    ${cheeks(72, 54, 86, 5)}`, 'Orang utan'),

  gajah: () => wrap(`${shadow(38)}
    <path d="M50 44 C28 34 10 46 12 68 C14 88 30 96 46 88 Z" fill="url(#ag-ele)" stroke="#5B6B7D" stroke-width="3" stroke-linejoin="round"/>
    <path d="M90 44 C112 34 130 46 128 68 C126 88 110 96 94 88 Z" fill="url(#ag-ele)" stroke="#5B6B7D" stroke-width="3" stroke-linejoin="round"/>
    <path d="M46 52 C32 46 22 54 23 68 C24 80 34 84 44 80 Z" fill="#EFC3C8"/><path d="M94 52 C108 46 118 54 117 68 C116 80 106 84 96 80 Z" fill="#EFC3C8"/>
    <ellipse cx="70" cy="110" rx="31" ry="23" fill="url(#ag-ele)" stroke="#5B6B7D" stroke-width="3"/>
    <rect x="47" y="114" width="19" height="27" rx="8" fill="url(#ag-ele)" stroke="#5B6B7D" stroke-width="3"/>
    <rect x="74" y="114" width="19" height="27" rx="8" fill="url(#ag-ele)" stroke="#5B6B7D" stroke-width="3"/>
    <g fill="#F4F1EA"><ellipse cx="52" cy="139" rx="2.6" ry="1.8"/><ellipse cx="57" cy="139.5" rx="2.6" ry="1.8"/><ellipse cx="62" cy="139" rx="2.6" ry="1.8"/><ellipse cx="78" cy="139" rx="2.6" ry="1.8"/><ellipse cx="83" cy="139.5" rx="2.6" ry="1.8"/><ellipse cx="88" cy="139" rx="2.6" ry="1.8"/></g>
    <ellipse cx="70" cy="58" rx="33" ry="30" fill="url(#ag-ele)" stroke="#5B6B7D" stroke-width="3"/>
    <path d="M64 30 q1 -6 -2 -10 M70 29 v-9 M76 30 q-1 -6 2 -10" stroke="#5B6B7D" stroke-width="2" stroke-linecap="round" fill="none"/>
    <path d="M70 70 C70 92 63 100 71 110 C77 116 88 112 86 103" stroke="#5B6B7D" stroke-width="17" stroke-linecap="round" fill="none"/>
    <path d="M70 70 C70 92 63 100 71 110 C77 116 88 112 86 103" stroke="#A5B2C1" stroke-width="12" stroke-linecap="round" fill="none"/>
    <path d="M65 82 h9 M64.5 90 h8 M66 98 h7" stroke="#7D8C9E" stroke-width="1.8" stroke-linecap="round"/>
    ${eye(55, 56, 6.5)}${eye(85, 56, 6.5)}${cheeks(70, 47, 93, 6.5)}`, 'Gajah'),

  tapir: () => wrap(`${shadow(36)}
    <ellipse cx="70" cy="106" rx="33" ry="22" fill="url(#ag-cream)" stroke="#15171A" stroke-width="3"/>
    <path d="M38 108 C44 128 96 128 102 108 C98 124 86 130 70 130 C54 130 42 124 38 108 Z" fill="url(#ag-tapir)"/>
    <path d="M40 104 C46 118 94 118 100 104" fill="none" stroke="#15171A" stroke-width="0"/>
    <rect x="49" y="114" width="16" height="27" rx="7" fill="url(#ag-tapir)" stroke="#15171A" stroke-width="3"/>
    <rect x="75" y="114" width="16" height="27" rx="7" fill="url(#ag-tapir)" stroke="#15171A" stroke-width="3"/>
    <ellipse cx="47" cy="36" rx="8" ry="10.5" transform="rotate(-20 47 36)" fill="url(#ag-tapir)" stroke="#F4F1EA" stroke-width="3"/>
    <ellipse cx="93" cy="36" rx="8" ry="10.5" transform="rotate(20 93 36)" fill="url(#ag-tapir)" stroke="#F4F1EA" stroke-width="3"/>
    <ellipse cx="70" cy="60" rx="30" ry="28" fill="url(#ag-tapir)" stroke="#15171A" stroke-width="3"/>
    <ellipse cx="60" cy="46" rx="12" ry="7" fill="#fff" opacity=".1" transform="rotate(-20 60 46)"/>
    <path d="M59 72 C59 66 81 66 81 72 L80 90 C80 96 60 96 60 90 Z" fill="#4A4F58" stroke="#15171A" stroke-width="3" stroke-linejoin="round"/>
    <path d="M62 80 q8 3 16 0" stroke="#2C3036" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <ellipse cx="65.5" cy="90" rx="2" ry="1.4" fill="#15171A"/><ellipse cx="74.5" cy="90" rx="2" ry="1.4" fill="#15171A"/>
    ${ringEye(57, 57, 5)}${ringEye(83, 57, 5)}${cheeks(70, 46, 94, 5.5)}`, 'Tapir'),

  enggang: () => wrap(`${shadow(30)}
    <path d="M58 122 l-2 18 M70 122 l2 18" stroke="#F0B43A" stroke-width="4" stroke-linecap="round"/>
    <path d="M50 141 h10 M66 141 h10" stroke="#C98A1C" stroke-width="3" stroke-linecap="round"/>
    <path d="M50 118 L44 140 L80 140 L74 118 Z" fill="#FBFAF4" stroke="#15151A" stroke-width="3" stroke-linejoin="round"/>
    <path d="M46.5 131 h31" stroke="#15151A" stroke-width="5"/>
    <ellipse cx="62" cy="100" rx="27" ry="29" fill="url(#ag-bird)" stroke="#0A0A0D" stroke-width="3"/>
    <ellipse cx="62" cy="114" rx="15" ry="11" fill="url(#ag-white)"/>
    <ellipse cx="38" cy="102" rx="9" ry="20" transform="rotate(12 38 102)" fill="#2C2C33" stroke="#0A0A0D" stroke-width="2.6"/>
    <ellipse cx="86" cy="102" rx="9" ry="20" transform="rotate(-12 86 102)" fill="#2C2C33" stroke="#0A0A0D" stroke-width="2.6"/>
    <circle cx="60" cy="56" r="23" fill="url(#ag-bird)" stroke="#0A0A0D" stroke-width="3"/>
    <path d="M74 46 C84 30 106 26 118 34 C108 36 96 42 84 50 Z" fill="url(#ag-casque)" stroke="#9E3A12" stroke-width="2.6" stroke-linejoin="round"/>
    <path d="M76 52 C96 50 116 60 124 80 C108 72 92 68 76 64 Z" fill="url(#ag-beak)" stroke="#A86A12" stroke-width="2.6" stroke-linejoin="round"/>
    <path d="M80 59 C96 60 110 66 118 74" stroke="#D08A1C" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    ${ringEye(58, 52, 5, '#B3261E')}${cheeks(66, 48, 48, 5)}`, 'Burung enggang'),
};
export const ART_DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
  <radialGradient id="ag-kancil" cx=".35" cy=".3" r=".85"><stop offset="0" stop-color="#D49A62"/><stop offset="1" stop-color="#A2652F"/></radialGradient>
  <radialGradient id="ag-cream" cx=".4" cy=".3" r=".9"><stop offset="0" stop-color="#FFF8EC"/><stop offset="1" stop-color="#EBD6B6"/></radialGradient>
  <radialGradient id="ag-tiger" cx=".35" cy=".28" r=".85"><stop offset="0" stop-color="#FFB25C"/><stop offset="1" stop-color="#E7741A"/></radialGradient>
  <radialGradient id="ag-white" cx=".4" cy=".3" r=".9"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#ECE6DC"/></radialGradient>
  <radialGradient id="ag-orang" cx=".35" cy=".28" r=".85"><stop offset="0" stop-color="#E5773F"/><stop offset="1" stop-color="#AE4220"/></radialGradient>
  <radialGradient id="ag-face" cx=".4" cy=".3" r=".9"><stop offset="0" stop-color="#FBD6AF"/><stop offset="1" stop-color="#E0A577"/></radialGradient>
  <radialGradient id="ag-ele" cx=".35" cy=".28" r=".85"><stop offset="0" stop-color="#C3CEDA"/><stop offset="1" stop-color="#8D9CAE"/></radialGradient>
  <radialGradient id="ag-tapir" cx=".35" cy=".28" r=".85"><stop offset="0" stop-color="#4A505A"/><stop offset="1" stop-color="#1B1E22"/></radialGradient>
  <radialGradient id="ag-bird" cx=".35" cy=".28" r=".85"><stop offset="0" stop-color="#454550"/><stop offset="1" stop-color="#121216"/></radialGradient>
  <linearGradient id="ag-beak" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFE07A"/><stop offset="1" stop-color="#F0A21E"/></linearGradient>
  <linearGradient id="ag-casque" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#F06A2C"/><stop offset="1" stop-color="#FF9E5A"/></linearGradient>
  <radialGradient id="ag-cheek"><stop offset="0" stop-color="#FF8FA3" stop-opacity=".75"/><stop offset="1" stop-color="#FF8FA3" stop-opacity="0"/></radialGradient>
  <linearGradient id="ag-car" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3FA6DA"/><stop offset="1" stop-color="#1F78AC"/></linearGradient>
  <linearGradient id="ag-glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E6F7FF"/><stop offset="1" stop-color="#A9DBF3"/></linearGradient>
  <linearGradient id="ag-housing" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2E353E"/><stop offset=".5" stop-color="#3C444F"/><stop offset="1" stop-color="#22282F"/></linearGradient>
  <radialGradient id="ag-glow-r"><stop offset="0" stop-color="#FF5A5F" stop-opacity=".75"/><stop offset="1" stop-color="#FF5A5F" stop-opacity="0"/></radialGradient>
  <radialGradient id="ag-glow-g"><stop offset="0" stop-color="#3BE08A" stop-opacity=".75"/><stop offset="1" stop-color="#3BE08A" stop-opacity="0"/></radialGradient>
  <radialGradient id="ag-lamp-r" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#FFB3B5"/><stop offset=".45" stop-color="#FF4A50"/><stop offset="1" stop-color="#C22026"/></radialGradient>
  <radialGradient id="ag-lamp-g" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#B8FFD8"/><stop offset=".45" stop-color="#2FD47E"/><stop offset="1" stop-color="#11914E"/></radialGradient>
</defs></svg>`;
export const ANIMALS = [
  { id: 'kancil', name: 'Kancil' },
  { id: 'harimau', name: 'Harimau Malaya' },
  { id: 'orangutan', name: 'Orang utan' },
  { id: 'gajah', name: 'Gajah' },
  { id: 'tapir', name: 'Tapir' },
  { id: 'enggang', name: 'Enggang' },
];

export const HAND_SVG = `<svg viewBox="0 0 64 72" aria-hidden="true">
  <path d="M24 8 a6 6 0 0 1 12 0 v24 l3 -1 a6 6 0 0 1 7 4 l1 1 a6 6 0 0 1 9 5 v14 c0 10 -8 15 -18 15 h-6 c-8 0 -12 -4 -16 -10 l-10 -16 a5 5 0 0 1 8 -6 l10 10 z" fill="#FFFDF5" stroke="#15302A" stroke-width="3" stroke-linejoin="round"/>
  <circle cx="30" cy="6" r="10" fill="none" stroke="#FFFDF5" stroke-width="3" opacity=".8"/></svg>`;
export const BALLOON_SVG = `<svg viewBox="0 0 100 150" aria-hidden="true">
  <path d="M50 98 q-4 20 4 50" stroke="#FFFDF5" stroke-width="2" fill="none" opacity=".7"/>
  <ellipse cx="50" cy="50" rx="40" ry="46" fill="#E5484D"/>
  <path d="M44 96 h12 l-6 6 z" fill="#C73A3F"/>
  <ellipse cx="36" cy="32" rx="9" ry="14" fill="#fff" opacity=".35" transform="rotate(-20 36 32)"/></svg>`;

export const nameOf = (id) => ANIMALS.find((x) => x.id === id).name;
// Ikon tanpa label (untuk hiasan / kapsyen): role="img" diganti aria-hidden.
export const iconOf = (id) => ART[id]().replace(/role="img" aria-label="[^"]*"/, 'aria-hidden="true"');

/* ---- Topi (dipakai Rumah Haiwan; boleh diguna semula) ---- */
export const COLORS = { merah: { fill: '#E5484D', dark: '#A8262B' }, biru: { fill: '#2F7DE1', dark: '#1A4F99' } };
// Kedudukan topi (tengah tepi bawah, dalam koordinat lukisan 140×150) dan kecondongan.
const HAT_AT = { kancil: [70, 32, 0], harimau: [70, 33, 0], orangutan: [70, 24, 0], gajah: [70, 30, 0], tapir: [70, 34, 0], enggang: [56, 36, -12] };
export function hatSVG(color, [x, y, rot]) {
  const k = COLORS[color];
  return `<g transform="translate(${x} ${y}) rotate(${rot})"><path d="M-17 0 L0 -36 L17 0 Z" fill="${k.fill}" stroke="${k.dark}" stroke-width="3" stroke-linejoin="round"/><path d="M-11 -12 L11 -12 M-6 -24 L6 -24" stroke="#fff" stroke-width="3.2" stroke-linecap="round" opacity=".85"/><ellipse cx="0" cy="0" rx="19" ry="4.5" fill="${k.dark}"/><circle cx="0" cy="-37" r="5.5" fill="#FFE07A" stroke="#C98E12" stroke-width="2"/></g>`;
}
// Haiwan bertopi: viewBox dilanjutkan ke atas supaya topi tidak terpotong.
export function hattedSVG(a, color, label) {
  const s = ART[a]().replace('viewBox="0 0 140 150"', 'viewBox="0 -28 140 178"').replace('</svg>', hatSVG(color, HAT_AT[a]) + '</svg>');
  return label ? s.replace(/aria-label="[^"]*"/, `aria-label="${nameOf(a)} bertopi ${color}"`) : s.replace(/role="img" aria-label="[^"]*"/, 'aria-hidden="true"');
}
