// Susun Cerita: urutan peristiwa dan naratif (asas kefahaman bacaan). 3–4 gambar cerita bercampur; anak tekan ikut turutan
// "apa jadi dulu, lepas tu apa?". Setiap gambar yang betul masuk ke jalur bernombor dan Sayf terus menceritakannya,
// jadi cerita terbina sedikit demi sedikit. Cerita dipilih supaya turutannya jelas dari sebab-akibat (api → bomba → padam).
import { vehicleIcon } from '../../kit/vehicles.js';
import { itemIcon } from '../../kit/pasar.js';
import { pick, shuffle, pct, meter } from '../../kit/util.js';

const inner = (s) => s.replace(/<\/?svg[^>]*>/g, '');
// Letak ikon (dengan viewBox asalnya) dalam panel 100×80.
const place = (s, x, y, w, h, vb, extra = '') => `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${vb}">${inner(s)}${extra}</svg>`;
const sky = (c = '#BFE6F5') => `<rect width="100" height="80" fill="${c}"/>`;
const ground = (c = '#8BCB6E') => `<rect y="62" width="100" height="18" fill="${c}"/>`;
const sun = (x, y, r = 8) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#FFD84D"/><g stroke="#FFD84D" stroke-width="2.4" stroke-linecap="round">${[0, 60, 120, 180, 240, 300].map((a) => { const t = a * Math.PI / 180; return `<path d="M${(x + (r + 3) * Math.cos(t)).toFixed(1)} ${(y + (r + 3) * Math.sin(t)).toFixed(1)} L${(x + (r + 7) * Math.cos(t)).toFixed(1)} ${(y + (r + 7) * Math.sin(t)).toFixed(1)}"/>`; }).join('')}</g>`;
const cloud = (x, y, s = 1, c = '#fff') => `<g fill="${c}" transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="0" rx="14" ry="7"/><ellipse cx="10" cy="-4" rx="10" ry="7"/><ellipse cx="-9" cy="-3" rx="8" ry="6"/></g>`;
const house = (x, y, extra = '') => `<g transform="translate(${x} ${y})"><path d="M0 18 L20 2 L40 18 Z" fill="#C0392B" stroke="#7A1F14" stroke-width="2" stroke-linejoin="round"/><rect x="4" y="18" width="32" height="24" fill="#F1D3AE" stroke="#8A5A1E" stroke-width="2"/><rect x="16" y="28" width="9" height="14" fill="#8A5A2E"/><rect x="7" y="22" width="7" height="7" fill="#A9DBF3" stroke="#8A5A1E" stroke-width="1.2"/><rect x="27" y="22" width="7" height="7" fill="#A9DBF3" stroke="#8A5A1E" stroke-width="1.2"/>${extra}</g>`;
const flame = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0 Q-8 -8 -3 -18 Q0 -10 4 -14 Q10 -22 6 -30 Q16 -20 10 -6 Q8 0 0 0 Z" fill="#F28A2C" stroke="#C0392B" stroke-width="1.6" stroke-linejoin="round"/><path d="M1 -2 Q-3 -8 0 -13 Q3 -8 5 -11 Q7 -6 4 -2 Z" fill="#FFD84D"/></g>`;
const smoke = (x, y, c = '#8C96A1') => `<g fill="${c}" opacity=".8"><circle cx="${x}" cy="${y}" r="5"/><circle cx="${x + 5}" cy="${y - 7}" r="6"/><circle cx="${x + 1}" cy="${y - 15}" r="7"/></g>`;
const bricks = (x, y, rows, cols, w = 9, h = 4.5) => `<g fill="#C8563A" stroke="#7A2E1A" stroke-width="1">${Array.from({ length: rows }, (_, r) => Array.from({ length: cols - (r % 2 ? 1 : 0) }, (_, c) => `<rect x="${x + c * w + (r % 2 ? w / 2 : 0)}" y="${y - (r + 1) * h}" width="${w}" height="${h}"/>`).join('')).join('')}</g>`;
const pan = (x, y, inside = '') => `<g transform="translate(${x} ${y})"><path d="M44 6 L66 2" stroke="#2B2F36" stroke-width="5" stroke-linecap="round"/><ellipse cx="22" cy="8" rx="26" ry="9" fill="#3A3F47" stroke="#1F2328" stroke-width="2"/><ellipse cx="22" cy="6" rx="21" ry="6" fill="#5B6270"/>${inside}</g>`;
const friedEgg = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-12 0 Q-14 -8 -4 -9 Q4 -12 10 -6 Q16 -1 10 4 Q2 8 -6 6 Q-14 6 -12 0 Z" fill="#FFFDF5" stroke="#C9C2B0" stroke-width="1.4"/><circle cx="0" cy="-1" r="4.6" fill="#F5B82E" stroke="#C98E12" stroke-width="1.2"/></g>`;
const egg = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="0" rx="11" ry="14" fill="#F1D3AE" stroke="#A9773E" stroke-width="2.2"/><ellipse cx="-4" cy="-5" rx="3" ry="4.5" fill="#fff" opacity=".6"/></g>`;
const popsicle = (x, y, melt) => `<g transform="translate(${x} ${y})"><rect x="-3" y="20" width="6" height="16" rx="3" fill="#E2B57A" stroke="#8A5A1E" stroke-width="1.6"/>${melt < 2 ? `<path d="M-12 ${melt ? 4 : -14} Q-12 -22 0 -22 Q12 -22 12 ${melt ? 4 : -14} V20 H-12 Z" fill="#F28CB8" stroke="#B0306A" stroke-width="2" stroke-linejoin="round" ${melt ? 'transform="scale(1 .85) translate(0 4)"' : ''}/><path d="M-6 -12 V10" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity=".6"/>` : ''}${melt ? `<g fill="#F28CB8" stroke="#B0306A" stroke-width="1.2"><path d="M-8 22 q-2 6 0 8 q2 -2 0 -8z"/><path d="M6 24 q-2 6 0 8 q2 -2 0 -8z"/></g>` : ''}</g>`;
const balloon = (x, y, s, string = 18) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 22 q-4 ${string / 2} 2 ${string}" stroke="#2B2F36" stroke-width="1.4" fill="none"/><ellipse cx="0" cy="0" rx="18" ry="21" fill="#E5484D" stroke="#9E1F24" stroke-width="2"/><path d="M-3 21 h6 l-3 3 z" fill="#9E1F24"/><ellipse cx="-7" cy="-8" rx="4" ry="7" fill="#fff" opacity=".4" transform="rotate(-20 -7 -8)"/></g>`;
const cake = (x, y, candles, lit) => `<g transform="translate(${x} ${y})"><rect x="-26" y="-6" width="52" height="22" rx="3" fill="#F7C9A0" stroke="#A06A3A" stroke-width="2"/><path d="M-26 -2 Q-20 4 -13 -2 Q-6 4 0 -2 Q6 4 13 -2 Q20 4 26 -2 V-6 H-26 Z" fill="#FFFDF5" stroke="#C9C2B0" stroke-width="1.2"/>
  <g fill="#E5484D">${[-18, -6, 6, 18].map((cx) => `<circle cx="${cx}" cy="8" r="2"/>`).join('')}</g>
  ${candles ? [-12, 0, 12].map((cx) => `<rect x="${cx - 2}" y="-18" width="4" height="12" fill="#2F7DE1" stroke="#1A4F99" stroke-width="1"/>${lit ? `<path d="M${cx} -27 q-4 5 0 8 q4 -3 0 -8z" fill="#FFD84D" stroke="#F28A2C" stroke-width="1"/>` : `<path d="M${cx} -20 q-3 -5 1 -9 q-2 -4 2 -7" stroke="#B9C0C9" stroke-width="1.6" fill="none" stroke-linecap="round"/>`}`).join('') : ''}<ellipse cx="0" cy="17" rx="32" ry="4" fill="#E9EEF3" stroke="#B9C0C9" stroke-width="1.4"/></g>`;
const kitchen = `<rect width="100" height="80" fill="#FCE9C8"/><rect y="56" width="100" height="24" fill="#D9B48A"/><path d="M0 56 H100" stroke="#A9773E" stroke-width="2"/>`;

const P = {
  'pisang-1': sky('#FFF1C9') + `<ellipse cx="50" cy="66" rx="30" ry="5" fill="#000" opacity=".12"/>` + place(itemIcon('pisang'), 22, 8, 56, 56, '0 0 60 60'),
  'pisang-2': sky('#FFF1C9') + `<g transform="translate(50 40)"><path d="M-5 -26 Q0 -32 5 -26 L6 20 Q0 24 -6 20 Z" fill="#FFF3C4" stroke="#C9A64A" stroke-width="1.8"/>
    <path d="M-6 0 Q-22 -2 -26 14 Q-16 8 -6 14 Z" fill="#F7D23E" stroke="#A07A0A" stroke-width="2" stroke-linejoin="round"/><path d="M6 0 Q22 -2 26 14 Q16 8 6 14 Z" fill="#F7D23E" stroke="#A07A0A" stroke-width="2" stroke-linejoin="round"/>
    <path d="M-6 6 Q0 10 6 6 V30 Q0 34 -6 30 Z" fill="#F7D23E" stroke="#A07A0A" stroke-width="2"/><path d="M-3 30 h6 v5 h-6z" fill="#6B8E23"/></g>`,
  'pisang-3': sky('#FFF1C9') + `<g transform="translate(50 20)"><path d="M-16 10 H16 L13 52 H-13 Z" fill="#22B26A" stroke="#13703F" stroke-width="2.4" stroke-linejoin="round"/><rect x="-19" y="4" width="38" height="7" rx="2" fill="#1C9A5B" stroke="#13703F" stroke-width="2"/>
    <path d="M-6 20 V44 M0 20 V44 M6 20 V44" stroke="#13703F" stroke-width="1.6" opacity=".6"/>
    <path d="M-2 4 Q-12 -6 -18 2 Q-10 0 -4 6 Z M2 4 Q10 -8 18 -2 Q10 0 4 6 Z" fill="#F7D23E" stroke="#A07A0A" stroke-width="1.8" stroke-linejoin="round"/></g>`,
  'aiskrim-1': sky('#DFF3FC') + `<g fill="#fff" stroke="#9FD3EC" stroke-width="1.2">${[[20, 18], [80, 24], [26, 56], [78, 58]].map(([x, y]) => `<path d="M${x} ${y - 5} V${y + 5} M${x - 5} ${y} H${x + 5} M${x - 3.5} ${y - 3.5} L${x + 3.5} ${y + 3.5} M${x + 3.5} ${y - 3.5} L${x - 3.5} ${y + 3.5}" stroke="#7FB8CC" stroke-width="1.6"/>`).join('')}</g>` + popsicle(50, 38, 0),
  'aiskrim-2': sky('#FFE59E') + sun(80, 16, 9) + popsicle(46, 40, 1) + `<ellipse cx="46" cy="76" rx="14" ry="3" fill="#F28CB8" opacity=".8"/>`,
  'aiskrim-3': sky('#FFE59E') + sun(80, 16, 9) + popsicle(46, 40, 2) + `<ellipse cx="46" cy="76" rx="22" ry="4" fill="#F28CB8" stroke="#B0306A" stroke-width="1"/>`,
  'belon-1': sky('#E8F4FB') + `<rect x="18" y="38" width="12" height="28" rx="3" fill="#2F7DE1" stroke="#1A4F99" stroke-width="2"/><rect x="14" y="64" width="20" height="6" rx="2" fill="#1A4F99"/><path d="M24 38 V30 H18" stroke="#2B2F36" stroke-width="2" fill="none"/><path d="M30 46 Q40 46 46 40" stroke="#2B2F36" stroke-width="2.4" fill="none"/>` + balloon(58, 34, .45, 10) + `<g stroke="#9FB4C4" stroke-width="2" stroke-linecap="round"><path d="M70 30 h8 M70 36 h10 M70 42 h7"/></g>`,
  'belon-2': sky('#E8F4FB') + balloon(50, 34, 1.15, 16) + ground('#CFE3B8'),
  'belon-3': sky('#9BD4F2') + cloud(24, 54, 1.1) + cloud(80, 66, .9) + balloon(62, 20, .55, 30) + `<g stroke="#2B2F36" stroke-width="1.6" fill="none" stroke-linecap="round"><path d="M14 20 q4 -4 8 0 q4 -4 8 0"/><path d="M36 32 q3 -3 6 0 q3 -3 6 0"/></g>`,
  'hujan-1': sky('#A8B6C4') + cloud(32, 26, 1.5, '#6B7684') + cloud(72, 32, 1.3, '#5F6B78') + ground('#7FA86A'),
  'hujan-2': sky('#8C9AA8') + cloud(32, 18, 1.5, '#5F6B78') + cloud(72, 22, 1.3, '#56616D') + `<g stroke="#CFE6F5" stroke-width="2" stroke-linecap="round">${Array.from({ length: 14 }, (_, i) => `<path d="M${8 + i * 6.5} ${34 + (i % 3) * 6} l-2 7"/>`).join('')}</g>` + ground('#6E9A5C') + `<g fill="#9FC8E0">${[[24, 68], [70, 72]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="10" ry="2.5"/>`).join('')}</g>`,
  'hujan-3': sky('#9BD4F2') + `<g fill="none" stroke-width="4">${['#E5484D', '#F28A2C', '#F5C531', '#22B26A', '#2F7DE1', '#7B4FC9'].map((c, i) => `<path d="M${14 + i * 4} 64 A${36 - i * 4} ${36 - i * 4} 0 0 1 ${86 - i * 4} 64" stroke="${c}"/>`).join('')}</g>` + sun(84, 14, 7) + cloud(18, 62, .8) + ground('#8BCB6E'),
  'bomba-1': sky('#FBD9B5') + ground() + house(50, 22) + flame(64, 34, 1) + flame(78, 30, .8) + smoke(70, 10),
  'bomba-2': sky('#FBD9B5') + ground() + place(vehicleIcon('bomba'), 0, 22, 62, 46, '0 0 160 120') + `<g stroke="#2B2F36" stroke-width="2" stroke-linecap="round" opacity=".5"><path d="M-2 40 h6 M-2 48 h8"/></g>` + house(62, 26) + flame(78, 38, .7) + smoke(80, 16),
  'bomba-3': sky('#FBD9B5') + ground() + place(vehicleIcon('bomba'), -4, 24, 56, 42, '0 0 160 120') + house(60, 24) + flame(78, 38, .45) + `<path d="M40 36 Q60 4 76 32" stroke="#5BB8E8" stroke-width="4" fill="none" stroke-linecap="round"/><g fill="#5BB8E8">${[[70, 26], [78, 34], [74, 38]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.8"/>`).join('')}</g>`,
  'bomba-4': sky('#BFE6F5') + ground() + sun(16, 14, 6) + house(30, 22) + `<g fill="#F5B82E">${[[18, 36], [82, 30], [76, 50]].map(([x, y]) => `<path d="M${x} ${y - 4} l1.2 2.8 2.8 1.2 -2.8 1.2 -1.2 2.8 -1.2 -2.8 -2.8 -1.2 2.8 -1.2z"/>`).join('')}</g>`,
  'rumah-1': sky() + `<rect y="58" width="100" height="22" fill="#B07A44"/><path d="M60 60 Q74 40 92 60 Z" fill="#8A5A2E" stroke="#5E3C1E" stroke-width="2"/>` + place(vehicleIcon('jengkaut'), 0, 12, 76, 57, '0 0 160 120'),
  'rumah-2': sky() + `<rect y="62" width="100" height="18" fill="#B07A44"/>` + place(vehicleIcon('lori'), 4, 16, 92, 69, '0 0 160 120', bricks(18, 44, 3, 8, 9.5, 5.5)),
  'rumah-3': sky() + `<rect y="62" width="100" height="18" fill="#B07A44"/>` + bricks(22, 64, 5, 6, 10, 5) + `<g fill="#C8563A" stroke="#7A2E1A" stroke-width="1"><rect x="72" y="58" width="10" height="5"/><rect x="76" y="53" width="10" height="5"/></g><path d="M86 30 V62 M80 62 H92" stroke="#6B7684" stroke-width="2"/>`,
  'rumah-4': sky() + ground() + `<g transform="translate(50 40) scale(1.6) translate(-20 -22)">${house(0, 0)}</g>` + sun(86, 14, 6),
  'kek-1': kitchen + `<g transform="translate(50 46)"><path d="M-26 -6 H26 Q24 18 0 20 Q-24 18 -26 -6 Z" fill="#E9EEF3" stroke="#8A9199" stroke-width="2.2" stroke-linejoin="round"/><ellipse cx="0" cy="-6" rx="26" ry="6" fill="#F7E2B8" stroke="#8A9199" stroke-width="2"/>
    <path d="M6 -8 L20 -34" stroke="#B07A44" stroke-width="4" stroke-linecap="round"/><path d="M-12 -8 q6 -4 12 0 q6 4 12 0" stroke="#E2B57A" stroke-width="1.8" fill="none"/></g>`,
  'kek-2': kitchen + `<g transform="translate(50 40)"><rect x="-30" y="-26" width="60" height="44" rx="4" fill="#C9D1D9" stroke="#6B7684" stroke-width="2.4"/><rect x="-24" y="-14" width="48" height="26" rx="3" fill="#F5A84A" stroke="#6B7684" stroke-width="2"/>
    <rect x="-12" y="-2" width="24" height="10" rx="2" fill="#C98A4A" stroke="#7A4B25" stroke-width="1.4"/><g fill="#2B2F36">${[-18, -8, 2, 12].map((x) => `<circle cx="${x}" cy="-20" r="2.2"/>`).join('')}</g>
    <path d="M-10 -6 q2 -4 0 -6 M0 -6 q2 -4 0 -6 M10 -6 q2 -4 0 -6" stroke="#FFF3C4" stroke-width="1.4" fill="none"/></g>`,
  'kek-3': kitchen + cake(50, 46, true, true),
  'kek-4': `<rect width="100" height="80" fill="#FCE1EC"/><rect y="56" width="100" height="24" fill="#D9B48A"/>` + cake(50, 46, true, false) + `<g>${[[12, 14, '#E5484D'], [24, 30, '#2F7DE1'], [80, 12, '#22B26A'], [88, 32, '#F5B82E'], [64, 8, '#7B4FC9'], [36, 8, '#F28A2C']].map(([x, y, c]) => `<rect x="${x}" y="${y}" width="4" height="4" fill="${c}" transform="rotate(30 ${x} ${y})"/>`).join('')}</g>`,
  'telur-1': kitchen + egg(50, 36, 1.5) + `<ellipse cx="50" cy="60" rx="18" ry="3" fill="#000" opacity=".12"/>`,
  'telur-2': kitchen + pan(18, 50) + `<g transform="translate(40 22)"><path d="M-12 0 Q-12 -14 0 -14 Q12 -14 12 0 L8 -4 L4 2 L0 -4 L-4 2 L-8 -4 Z" fill="#F1D3AE" stroke="#A9773E" stroke-width="1.8" stroke-linejoin="round"/><path d="M0 6 q-3 6 0 10 q3 -4 0 -10 Z" fill="#F5B82E" stroke="#C98E12" stroke-width="1"/></g>`,
  'telur-3': kitchen + pan(18, 50, friedEgg(22, 6, 1.1)) + `<path d="M34 40 q-3 -5 0 -9 M42 40 q-3 -5 0 -9" stroke="#B9C0C9" stroke-width="1.6" fill="none" stroke-linecap="round"/>`,
  'telur-4': kitchen + `<ellipse cx="50" cy="56" rx="34" ry="10" fill="#FFFDF5" stroke="#B9C0C9" stroke-width="2"/><g fill="#FFFDF5" stroke="#D9DEE4" stroke-width="1">${[[32, 50], [38, 46], [44, 50], [36, 54], [42, 54], [30, 54], [48, 54]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="3.4" ry="2.2"/>`).join('')}</g>` + friedEgg(62, 52, 1.1) + `<path d="M80 40 L88 62 M84 40 L90 60" stroke="#8A9199" stroke-width="2" stroke-linecap="round"/>`,
};
const panel = (id) => `<svg viewBox="0 0 100 80" aria-hidden="true">${P[id]}</svg>`;

const STORIES = {
  pisang: { n: 3, name: 'Makan pisang' }, aiskrim: { n: 3, name: 'Aiskrim cair' }, belon: { n: 3, name: 'Belon terbang' }, hujan: { n: 3, name: 'Hujan dan pelangi' },
  bomba: { n: 4, name: 'Bomba padam api' }, rumah: { n: 4, name: 'Bina rumah' }, kek: { n: 4, name: 'Kek hari jadi' }, telur: { n: 4, name: 'Masak telur' },
};
const LINES_STORY = {
  'pisang-1': 'Ini sebiji pisang.', 'pisang-2': 'Kupas kulit pisang.', 'pisang-3': 'Nyam! Kulit buang dalam tong sampah.',
  'aiskrim-1': 'Aiskrim sejuk.', 'aiskrim-2': 'Panasnya! Aiskrim cair.', 'aiskrim-3': 'Alamak, tinggal batang je!',
  'belon-1': 'Tiup belon.', 'belon-2': 'Belon makin besar.', 'belon-3': 'Belon terbang tinggi!',
  'hujan-1': 'Awan jadi gelap.', 'hujan-2': 'Hujan turun.', 'hujan-3': 'Hujan berhenti. Ada pelangi!',
  'bomba-1': 'Alamak, ada api!', 'bomba-2': 'Kereta bomba datang.', 'bomba-3': 'Bomba sembur air.', 'bomba-4': 'Api dah padam. Selamat!',
  'rumah-1': 'Jengkaut gali tanah.', 'rumah-2': 'Lori bawa bata.', 'rumah-3': 'Bina dinding.', 'rumah-4': 'Rumah dah siap!',
  'kek-1': 'Kacau adunan kek.', 'kek-2': 'Bakar dalam oven.', 'kek-3': 'Pasang lilin.', 'kek-4': 'Tiup lilin. Selamat hari jadi!',
  'telur-1': 'Ini sebiji telur.', 'telur-2': 'Pecahkan telur dalam kuali.', 'telur-3': 'Telur goreng dah masak.', 'telur-4': 'Makan nasi dengan telur!',
};

// n = panjang cerita · given = gambar pertama sudah diletak (perancah)
const LEVELS = [null,
  { n: 3, given: true },
  { n: 3, given: false },
  { n: 4, given: true },
  { n: 4, given: false },
];
const MAX_LEVEL = 4;
const AGE_LEVEL = { 3: 1, 4: 2, 5: 3, 6: 3 };
const TRIALS = 3, UP_AT = 2, DOWN_AT = 0;
const IDLE_MS = 10000;
const PRAISE = ['hebat', 'bagus', 'pandainya'];

export default {
  id: 'susun-cerita',
  title: 'Susun Cerita',
  stageLabel: 'Jalur cerita bernombor di atas, gambar cerita bercampur di bawah. Tekan gambar ikut turutan cerita.',
  lines: {
    intro: 'Jom susun cerita! Apa jadi dulu, lepas tu apa?',
    mula: 'Apa jadi dulu?', lepas: 'Lepas tu?', belum: 'Hmm, belum lagi.',
    ...LINES_STORY,
  },
  recorded: ['intro', 'mula', 'lepas', 'belum', ...Object.keys(LINES_STORY)],

  css: `.sc-strip { left: 3%; right: 3%; top: 14%; z-index: 2; display: flex; justify-content: center; gap: calc(var(--u) * 1.6); }
.sc-slot { position: relative; flex: 0 0 30%; aspect-ratio: 5 / 4; border-radius: calc(var(--u) * 2.5); border: calc(var(--u) * .7) dashed rgba(21,48,42,.35); background: rgba(255,253,245,.55); overflow: hidden; }
.sc-strip[data-n="4"] .sc-slot { flex-basis: 23%; }
.sc-slot::before { content: attr(data-num); position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); font: 700 calc(var(--u) * 7)/1 Fredoka, sans-serif; color: rgba(21,48,42,.35); }
.sc-slot.next { border-color: var(--kuning); border-style: solid; }
.sc-slot.full { border: calc(var(--u) * .7) solid #FFFDF5; box-shadow: 0 calc(var(--u) * .8) 0 rgba(0,0,0,.18); }
.sc-slot.full::before { content: none; }
.sc-slot svg { width: 100%; height: 100%; display: block; }
.sc-slot b { position: absolute; left: calc(var(--u) * 1); top: calc(var(--u) * 1); min-width: calc(var(--u) * 5); padding: 0 calc(var(--u) * 1); border-radius: 99px; background: var(--kuning); color: #15302A; font: 700 calc(var(--u) * 3.4)/calc(var(--u) * 5) Fredoka, sans-serif; text-align: center; }
.sc-slot.glow { box-shadow: 0 0 0 calc(var(--u) * 1.2) var(--kuning); }
.sc-cards { left: 4%; right: 4%; top: 38%; bottom: 4%; z-index: 3; display: flex; flex-wrap: wrap; justify-content: center; align-content: center; gap: calc(var(--u) * 3); }
.sc-card { flex: 0 0 44%; aspect-ratio: 5 / 4; padding: 0; overflow: hidden; border-radius: calc(var(--u) * 3.5); background: #FFFDF5; border: calc(var(--u) * 1) solid #FFFDF5; box-shadow: 0 calc(var(--u) * 1.2) 0 rgba(0,0,0,.2); transition: opacity .3s, transform .3s; }
.sc-card svg { width: 100%; height: 100%; display: block; }
.sc-card.gone { opacity: 0; transform: scale(.5); pointer-events: none; }
.sc-card:disabled { cursor: default; }`,

  stageHtml: () => `<svg class="bg" viewBox="0 0 200 300" preserveAspectRatio="none" aria-hidden="true">
      <rect width="200" height="300" fill="#F3E3C3"/>
      <rect y="0" width="200" height="104" fill="#E7D0A6"/>
      <path d="M0 104 H200" stroke="#C9A46E" stroke-width="3"/>
      <g fill="#C9A46E" opacity=".5">${[[20, 140], [176, 180], [40, 262], [160, 270], [100, 230]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3"/>`).join('')}</g>
    </svg>
    <div class="sc-strip"></div>
    <div class="sc-cards"></div>`,

  initState: (age) => ({ age, level: AGE_LEVEL[age], rounds: [] }),
  normalize(s, age) {
    if (s.age !== age) { s.age = age; s.level = AGE_LEVEL[age]; }
    if (!Number.isInteger(s.level) || s.level < 1 || s.level > MAX_LEVEL) s.level = AGE_LEVEL[age];
    return s;
  },

  async round(ctx) {
    const { stage, state, say, sfx, anim } = ctx;
    const stripEl = stage.querySelector('.sc-strip'), cardsEl = stage.querySelector('.sc-cards');
    const level = state.level, L = LEVELS[level];

    async function trial(story, demo) {
      const n = STORIES[story].n, ids = Array.from({ length: n }, (_, i) => `${story}-${i + 1}`);
      stripEl.dataset.n = String(n);
      stripEl.innerHTML = ids.map((_, i) => `<div class="sc-slot" data-num="${i + 1}"></div>`).join('');
      const slots = [...stripEl.querySelectorAll('.sc-slot')];
      const put = (i) => { slots[i].classList.remove('next'); slots[i].classList.add('full'); slots[i].innerHTML = panel(ids[i]) + `<b>${i + 1}</b>`; slots[i].setAttribute('aria-label', `${i + 1}: ${LINES_STORY[ids[i]]}`); };
      let step = 0;
      if (L.given) {
        put(0); step = 1;
        sfx.pop();
        await ctx.wait(Math.max(1200, say(ids[0]) + 250));
      }
      // Kad bercampur (pastikan tidak tersusun betul secara kebetulan).
      let rest = ids.slice(step);
      do { rest = shuffle(rest); } while (rest.length > 1 && rest.every((id, i) => id === ids[step + i]));
      cardsEl.innerHTML = rest.map((id) => `<button class="sc-card" type="button" data-id="${id}" aria-label="${LINES_STORY[id]}" disabled>${panel(id)}</button>`).join('');
      const cards = [...cardsEl.querySelectorAll('.sc-card')];
      const arm = (on) => cards.forEach((c) => { c.disabled = !on || c.classList.contains('gone'); });
      let errors = 0;

      while (step < n) {
        const want = ids[step];
        const right = cards.find((c) => c.dataset.id === want);
        const hint = () => { const r = ctx.toPct(right.getBoundingClientRect()); ctx.hand.show(r.left + r.width * .45, r.top + r.height * .4); };
        slots[step].classList.add('next');
        stage.dataset.answer = want; // untuk ujian automatik
        const prompt = step === 0 ? 'mula' : 'lepas';
        await ctx.wait(Math.max(700, say(prompt) + 100));
        let wrong = 0;
        for (;;) {
          if (demo && wrong === 0 && step === (L.given ? 1 : 0)) hint();
          arm(true);
          const tap = await ctx.tap({ selector: '.sc-card:not(.gone)', ms: IDLE_MS });
          arm(false); ctx.hand.hide();
          if (!tap) { hint(); await ctx.wait(Math.max(700, say(prompt) + 100)); continue; }
          if (tap.el === right) break;
          wrong++; errors++;
          sfx.soft();
          anim(tap.el, [{ transform: 'translateX(0)' }, { transform: 'translateX(-5%)' }, { transform: 'translateX(5%)' }, { transform: 'translateX(0)' }], { duration: 340, fill: 'none' });
          await ctx.wait(Math.max(800, say('belum') + 100));
          if (wrong >= 2) hint();
        }
        // Betul: kad masuk ke jalur, Sayf ceritakan gambar itu.
        right.classList.add('gone');
        put(step);
        sfx.light();
        anim(slots[step], [{ transform: 'scale(.6)' }, { transform: 'scale(1.06)' }, { transform: 'scale(1)' }], { duration: 380, fill: 'none' });
        await ctx.wait(Math.max(1100, say(want) + 300));
        step++;
      }
      // Cerita lengkap: setiap gambar bercahaya mengikut turutan.
      sfx.good();
      for (const s of slots) { s.classList.add('glow'); await ctx.wait(260); s.classList.remove('glow'); }
      if (errors === 0) await ctx.wait(Math.max(700, say(pick(PRAISE)) + 150));
      else await ctx.wait(500);
      return { story, errors };
    }

    const pool = Object.keys(STORIES).filter((s) => STORIES[s].n === L.n);
    let order = shuffle(pool);
    if (ctx.first && L.n === 3) order = ['pisang', ...order.filter((s) => s !== 'pisang')];
    order = order.slice(0, TRIALS);
    ctx.progress(TRIALS);
    await ctx.ready(); ctx.alive();
    if (ctx.first) await ctx.wait(Math.max(3200, say('intro') + 200));
    const recs = [];
    for (let i = 0; i < TRIALS; i++) {
      recs.push(await trial(order[i], ctx.first && i === 0 && level <= 2));
      ctx.mark(i);
      await ctx.wait(400);
    }
    delete stage.dataset.answer;

    const clean = recs.filter((r) => r.errors === 0).length;
    if (clean >= UP_AT) state.level = Math.min(MAX_LEVEL, level + 1);
    else if (clean <= DOWN_AT) state.level = Math.max(1, level - 1);
    return {
      record: { level, n: L.n, trials: recs.length, clean, errors: recs.reduce((a, r) => a + r.errors, 0), stories: recs.map((r) => r.story) },
      foundHtml: recs.map((r) => panel(`${r.story}-${STORIES[r.story].n}`)).join(''),
      text: `Adik susun <span class="big-num">${recs.length}</span> cerita!` + (clean ? ` <span class="big-num">${clean}</span> tanpa silap.` : ' Makin lama makin pandai.'),
    };
  },

  parent: {
    stats(s) {
      const last = s.rounds.slice(-7);
      const okP = pct(last.reduce((a, r) => a + (r.clean || 0), 0), last.reduce((a, r) => a + (r.trials || 0), 0));
      const best = s.rounds.reduce((m, r) => (r.clean ? Math.max(m, r.n || 0) : m), 0);
      return [
        { v: okP === null ? '–' : okP + '%', label: 'Cerita tanpa silap' },
        { v: `${s.level}<small>/${MAX_LEVEL}</small>`, label: 'Tahap' },
        { v: best ? `${best}<small> gambar</small>` : '–', label: 'Cerita terpanjang' },
      ];
    },
    cols: ['Tahap', 'Tanpa silap', 'Silap'],
    row: (r) => [r.level, meter(pct(r.clean, r.trials)), r.errors],
    explain: `<span><b>Urutan dan naratif</b> (Komunikasi KSPK): memahami bahawa peristiwa berlaku mengikut turutan dan ada sebab-akibat. Kemahiran ini asas kefahaman bacaan dan bercerita semula. Budak 3–4 tahun biasanya boleh 3 gambar; 5–6 tahun boleh 4 gambar.</span>
      <span>Tahap 1: 3 gambar, gambar pertama diberi · Tahap 2: 3 gambar · Tahap 3: 4 gambar, gambar pertama diberi · Tahap 4: 4 gambar. Sayf menceritakan setiap gambar yang betul. Naik bila 2/3 cerita tanpa silap.</span>`,
  },

  mission: {
    title: 'Cerita "Hari Ini Adik…"',
    steps: [
      'Sebelum tidur, tanya: <b>"Hari ni apa adik buat dulu? Lepas tu?"</b>',
      'Bantu dengan kata urutan: <b>mula-mula, lepas tu, akhirnya</b>.',
      'Ambil 3 gambar dari telefon (cth. bangun, sarapan, ke tadika). Campurkan dan minta anak susun.',
      'Biar anak ceritakan semula guna gambar itu kepada ayah atau nenek.',
    ],
    why: 'Kenapa? Bercerita ikut turutan melatih anak menyusun fikiran dan menggunakan bahasa dengan teratur, asas penting sebelum belajar membaca dan menulis karangan.',
  },
};
