# Rangsang Minda (app, v0.5)

Satu app untuk semua permainan merangsang minda kanak-kanak 3–6 tahun. Nama "Rangsang Minda" ialah nama kerja.
Ini sumber utama produk mulai v0.5. Folder `prototype/` dibekukan sebagai arkib.

## Struktur
```
app/
├── index.html          shell: markup + CSS kongsi (laman utama, pentas, keputusan, tarik nafas, misi, gate, zon ibu bapa)
├── main.js             shell: skrin, sesi, storan, had masa harian, keputusan, zon ibu bapa
├── kit/
│   ├── art.js          6 haiwan (SVG), topi, tangan, belon
│   ├── voice.js        Web Audio, sfx, suara Hafiz (dimuat per game), sandaran suara peranti ms-*
│   ├── util.js         shuffle, anim, balanced, toPct, fmtDate, meter …
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
`index.html` tiada `<!doctype>` kerana skeleton artifact ditambah semasa diterbitkan. Untuk uji tempatan, sediakan folder ujian yang membungkusnya:
```bash
mkdir -p /tmp/rm-site && (echo '<!doctype html><meta charset="utf-8">'; cat app/index.html) > /tmp/rm-site/index.html && ln -sfn "$PWD/app/main.js" "$PWD/app/kit" "$PWD/app/games" /tmp/rm-site/
```
```bash
cd /tmp/rm-site && python3 -m http.server 8765
```

## Terbitkan
Artifact: halaman `app/index.html`, dengan `root: app` dan `files` = semua `*.js` dan `*.mp3` di bawah `app/` (laluan relatif).

## Privasi & etika
Tiada iklan, tiada rangkaian selain fail app sendiri, tiada akaun. Data dalam peranti sahaja. Had masa harian (lalai 10 minit) dikongsi semua game; maksimum 3 pusingan satu sesi; setiap sesi berakhir dengan Tarik Nafas Belon dan misi dunia sebenar. Tiada streak dan tiada apa-apa yang hilang bila anak tidak bermain.
