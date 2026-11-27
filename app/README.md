# Rangsang Minda (app, v0.8)

Satu app untuk semua permainan merangsang minda kanak-kanak 3–6 tahun. Nama "Rangsang Minda" ialah nama kerja.
Ini sumber utama produk mulai v0.5. Folder `prototype/` dibekukan sebagai arkib.

## Struktur
```
app/
├── index.html          shell: markup + CSS kongsi (laman utama, pentas, keputusan, tarik nafas, misi, gate, zon ibu bapa)
├── main.js             shell: skrin, sesi, storan, had masa harian, keputusan, zon ibu bapa
├── sw.js               service worker: main tanpa internet
├── manifest.webmanifest + icons/   boleh dipasang di skrin utama (PWA)
├── kit/
│   ├── art.js          6 haiwan (SVG), topi, tangan, belon
│   ├── voice.js        Web Audio, sfx, suara Sayf (dimuat per game), sandaran suara peranti ms-*
│   ├── util.js         shuffle, anim, balanced, toPct, fmtDate, meter …
│   ├── pwa.js          daftar service worker, butang pasang, simpan semua untuk luar talian
│   └── audio/          suara dikongsi: start, bagus, pandainya, breath-in, breath-out
├── games/
│   ├── README.md       kontrak modul game + senarai semak game baharu
│   ├── registry.js     senarai game (metadata + import dinamik)
│   └── <id>/           index.js (mekanik), audio/*.mp3, SKRIP-SUARA.md
└── ROADMAP.md          40 game: kemahiran, keutamaan, status
```

## Keputusan seni bina
| Keputusan | Kenapa |
|---|---|
| ES modules tanpa build step dan tanpa library | Ringan, mudah diterbitkan sebagai artifact berbilang fail, tiada kebergantungan untuk diselenggara |
| Modul game dimuat bila dimain (`import()`) | Laman utama kekal cepat walaupun ada 40 game |
| Suara dimuat per game | Muat turun awal kecil; cache dikongsi merentas game |
| Satu stor `localStorage` (`rangsang-minda.v1`) | Satu had masa harian, satu umur, satu zon ibu bapa untuk semua game |
| `normalize(state, age)` dalam setiap game | Data lama atau rosak dibetulkan; tukar umur menetapkan semula tahap tanpa perlu memuat semua modul |
| Pusingan dibatalkan dengan `AbortController` | Tekan Rumah atau tukar tab menghentikan pusingan dengan bersih, tanpa pemasa tergantung |

## Jalankan secara tempatan
```bash
npm start
```
Pelayan kecil (`tests/serve.mjs`, tanpa kebergantungan) melayan `app/` dan membungkus `index.html` dengan rangka dokumen penuh, sama seperti di hos awam.

## Ujian
```bash
npm install && npm test
```
| Lapisan | Apa yang disemak | Fail |
|---|---|---|
| Statik | Sintaks JS, kontrak modul setiap game, setiap baris suara ada mp3, kit/ dalam senarai service worker | `tests/static.mjs` |
| Asap | **40 game** dibuka pada umur 3 dan 6, pusingan bermula, tiada ralat, tiada fail hilang | `tests/smoke.mjs` |
| PWA | Service worker aktif, simpan luar talian berjaya, **rangkaian diputus** kemudian app dibuka dan satu game dimain | `tests/pwa.mjs` |
| Main penuh | Bot main sehingga skrin keputusan (umur 4 dengan 2 silap sengaja, tahap 4 tanpa silap) | `tests/play.mjs` + `tests/drivers.mjs` |

`npm run test:quick` = statik + asap + PWA (~3 minit). `npm test -- --only <id>` untuk satu game; `--shots <folder>` simpan tangkapan skrin.
Main penuh meliputi 20 game; 20 game yang lebih awal belum ada pemandu dalam `tests/drivers.mjs` (diliputi ujian asap sahaja).
CI (`.github/workflows/test.yml`): ujian pantas setiap push, ujian penuh setiap pull request.

## Terbitkan
| Sasaran | Cara |
|---|---|
| Hos awam (GitHub Pages) | Automatik bila branch lalai dikemas kini (`.github/workflows/deploy.yml`). `node tools/build.mjs` menyalin `app/` ke `dist/` dan membungkus `index.html`. Persediaan sekali: Settings → Pages → Source: **GitHub Actions** |
| Artifact (pratonton peribadi) | Halaman `app/index.html`, `root: app`, `files` = fail yang berubah. Service worker sengaja tidak didaftar dalam iframe pratonton |

`app/index.html` sengaja ditulis sebagai serpihan (tanpa `<!doctype>`) kerana platform artifact menambah rangka dokumen sendiri; `tools/build.mjs` menambahnya untuk hos biasa.

## Main tanpa internet (PWA)
| Kandungan | Strategi cache | Kenapa |
|---|---|---|
| Kod dan halaman | Rangkaian dahulu, cache bila luar talian | Kemas kini sentiasa sampai bila ada internet |
| Audio, imej, fon | Cache dahulu, kemas kini di latar | Pantas; klip yang dijana semula sampai pada main seterusnya |

Cangkerang app dan 28 baris suara kongsi disimpan semasa pemasangan. Game lain disimpan bila dimain, atau sekali gus melalui **Zon ibu bapa → Simpan semua game untuk luar talian** (~3 MB). Tukar `VERSION` dalam `sw.js` hanya bila struktur cache berubah.

## Privasi & etika
Tiada iklan, tiada analitik, tiada rangkaian selain fail app sendiri dan fon Google, tiada akaun. Data dalam peranti sahaja. Had masa harian (lalai 10 minit) dikongsi semua game; maksimum 3 pusingan satu sesi; setiap sesi berakhir dengan Tarik Nafas Belon dan misi dunia sebenar. Tiada streak dan tiada apa-apa yang hilang bila anak tidak bermain.
