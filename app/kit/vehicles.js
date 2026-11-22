// Kenderaan dikongsi (pandangan sisi, gaya pelekat: garis luar tebal, warna ceria). viewBox 0 0 160 120, tanah di y≈110.
// Tiada gradien (#id) supaya boleh dipapar di mana-mana tanpa defs.

const wheel = (cx, cy, r = 12) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#2B2F36"/><circle cx="${cx}" cy="${cy}" r="${r * .5}" fill="#C9D1D9"/><circle cx="${cx}" cy="${cy}" r="${r * .18}" fill="#6B7684"/>`;
const shadow = (w = 64) => `<ellipse cx="80" cy="110" rx="${w}" ry="4.5" fill="#000" opacity=".18"/>`;
const svg = (inner, label) => `<svg viewBox="0 0 160 120" role="img" aria-label="${label}">${inner}</svg>`;

export const VEHICLES = [
  { id: 'jengkaut', name: 'Jengkaut' },
  { id: 'lori', name: 'Lori' },
  { id: 'bomba', name: 'Kereta bomba' },
  { id: 'ambulans', name: 'Ambulans' },
  { id: 'bas', name: 'Bas sekolah' },
  { id: 'keretaapi', name: 'Kereta api' },
  { id: 'helikopter', name: 'Helikopter' },
  { id: 'basikal', name: 'Basikal' },
];

export const VEHICLE = {
  jengkaut: () => svg(`${shadow(56)}
    <rect x="8" y="88" width="96" height="20" rx="10" fill="#3A3F47" stroke="#1F2328" stroke-width="3"/>
    ${[22, 40, 58, 76, 92].map((x) => `<circle cx="${x}" cy="98" r="5" fill="#8C96A1"/>`).join('')}
    <rect x="14" y="62" width="84" height="28" rx="6" fill="#F5B82E" stroke="#B7860F" stroke-width="3"/>
    <rect x="14" y="76" width="84" height="5" fill="#2B2F36" opacity=".8"/>
    <rect x="54" y="30" width="40" height="36" rx="6" fill="#F5B82E" stroke="#B7860F" stroke-width="3"/>
    <rect x="61" y="37" width="26" height="20" rx="3" fill="#A9DBF3"/><path d="M64 40 l7 -1" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".8"/>
    <path d="M90 60 L124 22 L146 58" stroke="#B7860F" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <path d="M90 60 L124 22 L146 58" stroke="#F5B82E" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <circle cx="124" cy="22" r="4" fill="#2B2F36"/>
    <path d="M134 56 L158 56 L154 82 L140 82 Z" fill="#6B6F76" stroke="#2B2F36" stroke-width="3" stroke-linejoin="round"/>
    <path d="M141 82 l2 5 M147 82 l1 5 M153 82 l-1 5" stroke="#2B2F36" stroke-width="3" stroke-linecap="round"/>`, 'Jengkaut'),

  lori: () => svg(`${shadow(66)}
    <rect x="12" y="78" width="136" height="12" rx="3" fill="#3A3F47"/>
    <path d="M10 44 L100 44 L96 82 L16 82 Z" fill="#F5B82E" stroke="#B7860F" stroke-width="3" stroke-linejoin="round"/>
    <path d="M30 48 L28 80 M50 48 L49 80 M70 48 L70 80 M88 48 L88 80" stroke="#D99B16" stroke-width="2.5"/>
    <path d="M104 86 V52 Q104 40 116 40 H130 Q138 40 142 48 L148 64 V86 Z" fill="#F28A2C" stroke="#A3511A" stroke-width="3" stroke-linejoin="round"/>
    <path d="M110 48 H128 Q133 48 135 53 L139 64 H110 Z" fill="#A9DBF3"/>
    <rect x="144" y="70" width="6" height="8" rx="2" fill="#FFE68A"/>
    ${wheel(36, 96)}${wheel(64, 96)}${wheel(128, 96)}`, 'Lori'),

  bomba: () => svg(`${shadow(68)}
    <rect x="10" y="44" width="104" height="44" rx="5" fill="#E5323C" stroke="#9E1F24" stroke-width="3"/>
    <path d="M110 88 V50 Q110 40 120 40 H134 Q142 40 146 48 L150 62 V88 Z" fill="#E5323C" stroke="#9E1F24" stroke-width="3" stroke-linejoin="round"/>
    <path d="M116 47 H132 Q137 47 139 52 L142 62 H116 Z" fill="#A9DBF3"/>
    <rect x="14" y="30" width="92" height="8" rx="2" fill="#C9D1D9" stroke="#6B7684" stroke-width="2"/>
    ${[24, 38, 52, 66, 80, 94].map((x) => `<rect x="${x}" y="30" width="3" height="8" fill="#6B7684"/>`).join('')}
    <rect x="22" y="38" width="6" height="8" fill="#6B7684"/><rect x="92" y="38" width="6" height="8" fill="#6B7684"/>
    <rect x="122" y="32" width="14" height="8" rx="3" fill="#2F7DE1" stroke="#1A4F99" stroke-width="2"/>
    <rect x="16" y="58" width="90" height="6" fill="#FFFDF5" opacity=".9"/>
    <rect x="20" y="68" width="22" height="14" rx="2" fill="#B21E27"/><rect x="48" y="68" width="22" height="14" rx="2" fill="#B21E27"/>
    ${wheel(32, 96)}${wheel(62, 96)}${wheel(130, 96)}`, 'Kereta bomba'),

  ambulans: () => svg(`${shadow(64)}
    <path d="M12 88 V40 Q12 32 20 32 H108 Q118 32 124 40 L144 62 Q148 66 148 72 V88 Z" fill="#FFFDF5" stroke="#8C96A1" stroke-width="3" stroke-linejoin="round"/>
    <path d="M110 40 H118 Q122 40 125 44 L140 62 H110 Z" fill="#A9DBF3"/>
    <rect x="12" y="66" width="136" height="7" fill="#E5323C"/>
    <rect x="46" y="40" width="22" height="22" rx="2" fill="#FFFDF5"/>
    <path d="M57 43 V59 M49 51 H65" stroke="#E5323C" stroke-width="6" stroke-linecap="round"/>
    <rect x="20" y="40" width="20" height="16" rx="2" fill="#A9DBF3"/><rect x="76" y="40" width="26" height="16" rx="2" fill="#A9DBF3"/>
    <rect x="58" y="22" width="16" height="10" rx="3" fill="#2F7DE1" stroke="#1A4F99" stroke-width="2"/>
    ${wheel(36, 96)}${wheel(124, 96)}`, 'Ambulans'),

  bas: () => svg(`${shadow(70)}
    <rect x="8" y="28" width="144" height="62" rx="12" fill="#F5B82E" stroke="#B7860F" stroke-width="3"/>
    ${[18, 44, 70, 96].map((x) => `<rect x="${x}" y="38" width="20" height="20" rx="3" fill="#A9DBF3"/>`).join('')}
    <rect x="122" y="38" width="22" height="44" rx="3" fill="#A9DBF3" stroke="#B7860F" stroke-width="2"/>
    <rect x="8" y="64" width="112" height="5" fill="#2B2F36"/>
    <text x="64" y="81" text-anchor="middle" font-family="Fredoka, sans-serif" font-weight="700" font-size="10" fill="#2B2F36">BAS SEKOLAH</text>
    <rect x="146" y="70" width="6" height="8" rx="2" fill="#FFE68A"/>
    ${wheel(36, 96)}${wheel(124, 96)}`, 'Bas sekolah'),

  keretaapi: () => svg(`${shadow(72)}
    <rect x="6" y="100" width="148" height="4" fill="#7A5232"/>
    <rect x="6" y="50" width="52" height="40" rx="5" fill="#E5323C" stroke="#9E1F24" stroke-width="3"/>
    <rect x="14" y="58" width="14" height="14" rx="2" fill="#A9DBF3"/><rect x="34" y="58" width="14" height="14" rx="2" fill="#A9DBF3"/>
    <rect x="56" y="82" width="10" height="4" fill="#2B2F36"/>
    <rect x="64" y="52" width="84" height="38" rx="5" fill="#2F7DE1" stroke="#1A4F99" stroke-width="3"/>
    <rect x="64" y="30" width="34" height="34" rx="4" fill="#2F7DE1" stroke="#1A4F99" stroke-width="3"/>
    <rect x="71" y="37" width="20" height="16" rx="2" fill="#A9DBF3"/>
    <rect x="120" y="26" width="14" height="26" rx="2" fill="#2B2F36"/><rect x="116" y="22" width="22" height="7" rx="3" fill="#2B2F36"/>
    <circle cx="146" cy="66" r="4" fill="#FFE68A"/>
    <path d="M148 84 L158 96 H148 Z" fill="#6B7684"/>
    ${wheel(20, 94, 8)}${wheel(44, 94, 8)}${wheel(82, 92, 10)}${wheel(108, 92, 10)}${wheel(134, 94, 8)}`, 'Kereta api'),

  helikopter: () => svg(`${shadow(46)}
    <path d="M34 104 H108 M44 96 V104 M96 96 V104" stroke="#2B2F36" stroke-width="4" stroke-linecap="round"/>
    <rect x="96" y="58" width="52" height="10" rx="5" fill="#22B26A" stroke="#178A50" stroke-width="3"/>
    <circle cx="148" cy="56" r="10" fill="none" stroke="#6B7684" stroke-width="3" stroke-dasharray="6 4"/>
    <ellipse cx="70" cy="70" rx="44" ry="28" fill="#22B26A" stroke="#178A50" stroke-width="3"/>
    <path d="M40 64 Q42 48 62 46 H78 V70 H42 Z" fill="#A9DBF3"/>
    <rect x="66" y="34" width="8" height="12" fill="#2B2F36"/>
    <rect x="8" y="28" width="124" height="6" rx="3" fill="#2B2F36"/>
    <rect x="86" y="60" width="16" height="6" rx="2" fill="#FFFDF5" opacity=".7"/>`, 'Helikopter'),

  basikal: () => svg(`${shadow(56)}
    <circle cx="40" cy="84" r="22" fill="none" stroke="#2B2F36" stroke-width="5"/><circle cx="40" cy="84" r="3" fill="#2B2F36"/>
    <circle cx="120" cy="84" r="22" fill="none" stroke="#2B2F36" stroke-width="5"/><circle cx="120" cy="84" r="3" fill="#2B2F36"/>
    <path d="M40 84 L70 84 L104 50 L60 50 Z M70 84 L58 44 M104 50 L120 84" stroke="#E5323C" stroke-width="5" stroke-linejoin="round" stroke-linecap="round" fill="none"/>
    <path d="M50 42 H66" stroke="#2B2F36" stroke-width="6" stroke-linecap="round"/>
    <path d="M104 50 L100 36 H112" stroke="#2B2F36" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <circle cx="70" cy="84" r="6" fill="none" stroke="#2B2F36" stroke-width="3"/>
    <circle cx="112" cy="34" r="4" fill="#F5B82E" stroke="#B7860F" stroke-width="1.5"/>`, 'Basikal'),
};

export const vehicleIcon = (id) => VEHICLE[id]().replace(/role="img" aria-label="[^"]*"/, 'aria-hidden="true"');
export const vehicleName = (id) => VEHICLES.find((v) => v.id === id).name;

// Bunyi kenderaan disintesis dengan Web Audio (tiada fail, tiada kos). ac = AudioContext, out = nod destinasi.
// Setiap fungsi pulangkan tempoh bunyi (s).
export const VEHICLE_SOUND = {
  bomba(ac, out) { // siren meraung naik-turun
    const t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain();
    o.type = 'sawtooth'; o.frequency.setValueAtTime(500, t);
    o.frequency.linearRampToValueAtTime(1100, t + 1); o.frequency.linearRampToValueAtTime(500, t + 2);
    g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(.08, t + .1); g.gain.setValueAtTime(.08, t + 1.8); g.gain.linearRampToValueAtTime(.0001, t + 2);
    o.connect(g); g.connect(out); o.start(t); o.stop(t + 2.05); return 2;
  },
  ambulans(ac, out) { // nee-naw dua nada
    const t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain();
    o.type = 'square';
    for (let i = 0; i < 4; i++) o.frequency.setValueAtTime(i % 2 ? 660 : 880, t + i * .45);
    g.gain.setValueAtTime(.05, t); g.gain.setValueAtTime(.05, t + 1.75); g.gain.linearRampToValueAtTime(.0001, t + 1.8);
    o.connect(g); g.connect(out); o.start(t); o.stop(t + 1.85); return 1.8;
  },
  lori(ac, out) { // hon rendah "paaam paaam"
    const t = ac.currentTime;
    [0, .7].forEach((d) => [155, 196].forEach((f) => {
      const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sawtooth'; o.frequency.value = f;
      g.gain.setValueAtTime(.0001, t + d); g.gain.linearRampToValueAtTime(.06, t + d + .04); g.gain.setValueAtTime(.06, t + d + .45); g.gain.linearRampToValueAtTime(.0001, t + d + .55);
      o.connect(g); g.connect(out); o.start(t + d); o.stop(t + d + .6);
    }));
    return 1.3;
  },
  bas(ac, out) { // hon dua nada pendek "pon pon"
    const t = ac.currentTime;
    [[0, 392], [.3, 330], [.75, 392], [1.05, 330]].forEach(([d, f]) => {
      const o = ac.createOscillator(), g = ac.createGain(); o.type = 'square'; o.frequency.value = f;
      g.gain.setValueAtTime(.0001, t + d); g.gain.linearRampToValueAtTime(.05, t + d + .02); g.gain.linearRampToValueAtTime(.0001, t + d + .26);
      o.connect(g); g.connect(out); o.start(t + d); o.stop(t + d + .3);
    });
    return 1.4;
  },
  keretaapi(ac, out) { // wisel "choo-choo" + dentum roda
    const t = ac.currentTime;
    [0, .55].forEach((d) => [587, 740, 880].forEach((f) => {
      const o = ac.createOscillator(), g = ac.createGain(); o.type = 'triangle'; o.frequency.value = f;
      g.gain.setValueAtTime(.0001, t + d); g.gain.linearRampToValueAtTime(.05, t + d + .05); g.gain.linearRampToValueAtTime(.0001, t + d + .45);
      o.connect(g); g.connect(out); o.start(t + d); o.stop(t + d + .5);
    }));
    chugs(ac, out, t + 1.1, 4, .22, 400);
    return 2;
  },
  helikopter(ac, out) { // "dup-dup-dup" bilah berputar
    chugs(ac, out, ac.currentTime, 14, .12, 180); return 1.8;
  },
  basikal(ac, out) { // loceng "kring kring"
    const t = ac.currentTime;
    [0, .12, .5, .62].forEach((d) => [2093, 2637].forEach((f) => {
      const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(.07, t + d); g.gain.exponentialRampToValueAtTime(.0001, t + d + .35);
      o.connect(g); g.connect(out); o.start(t + d); o.stop(t + d + .4);
    }));
    return 1.1;
  },
  jengkaut(ac, out) { // enjin berat + "bip bip" mengundur
    const t = ac.currentTime;
    chugs(ac, out, t, 10, .1, 120);
    [1.1, 1.5].forEach((d) => {
      const o = ac.createOscillator(), g = ac.createGain(); o.type = 'square'; o.frequency.value = 1000;
      g.gain.setValueAtTime(.04, t + d); g.gain.setValueAtTime(.0001, t + d + .2);
      o.connect(g); g.connect(out); o.start(t + d); o.stop(t + d + .22);
    });
    return 1.8;
  },
};
// Ledakan bunyi berkala (enjin, roda, bilah): hingar ditapis lulus-rendah.
function chugs(ac, out, start, n, gap, freq) {
  for (let i = 0; i < n; i++) {
    const len = Math.floor(ac.sampleRate * .08), buf = ac.createBuffer(1, len, ac.sampleRate), ch = buf.getChannelData(0);
    for (let j = 0; j < len; j++) ch[j] = (Math.random() * 2 - 1) * (1 - j / len);
    const s = ac.createBufferSource(); s.buffer = buf;
    const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = freq;
    const g = ac.createGain(); g.gain.value = .5;
    s.connect(f); f.connect(g); g.connect(out); s.start(start + i * gap);
  }
}
