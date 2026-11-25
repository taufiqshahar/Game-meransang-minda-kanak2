# Rumah Haiwan (Prototaip v0.1)

Permainan **fleksibiliti kognitif** untuk kanak-kanak 3–6 tahun. Game ketiga dalam siri ini:

| Game | Kemahiran teras (executive function) |
|---|---|
| Lampu Isyarat Haiwan | Kawalan diri (inhibisi) |
| Sorok-Sorok Hutan | Ingatan kerja |
| **Rumah Haiwan** | **Fleksibiliti kognitif** |

## Cara main
Dua rumah kampung yang sama rupa. Papan tanda setiap rumah menunjukkan haiwan bertopi, contohnya *kancil bertopi biru* dan *gajah bertopi merah*.
Haiwan datang satu demi satu (contohnya *kancil bertopi merah*) dan anak tekan rumah yang betul.

1. **Peraturan pertama** (contohnya ikut warna topi): 6 haiwan.
2. Sayf: "Sekarang kita tukar permainan!" **Peraturan kedua** (ikut haiwan): 6 haiwan.
3. **Tahap 2 sahaja: blok campur.** Sayf sebut "Warna!" atau "Haiwan!" sebelum setiap haiwan: 8 haiwan.

Setiap haiwan sengaja **bercanggah**: warnanya padan dengan satu rumah, jenisnya padan dengan rumah yang lain. Jadi anak mesti benar-benar tukar cara berfikir. Ini reka bentuk tugasan *Dimensional Change Card Sort* (DCCS).

## Ciri
- Peraturan pertama berselang-seli setiap pusingan (warna dahulu / haiwan dahulu).
- **Tahap 1** (lalai umur 3–4): peraturan diingatkan setiap percubaan. **Tahap 2** (lalai umur 5–6): peraturan hanya di awal, ditambah blok campur.
- Naik tahap bila betul ≥ 5/6 selepas tukar; turun bila ≤ 3/6.
- Salah: haiwan goyang, Sayf beri petunjuk ("Hmm, tengok warna topi dia"), tangan tunjuk, dan haiwan tetap masuk rumah yang betul. Tiada kalah.
- Tiada had masa menjawab; arahan diulang selepas 8 s jika anak senyap.
- Percubaan seimbang (separuh setiap jenis kad), tidak lebih 2 sama berturut-turut.
- Skor rendah selepas tukar dipaparkan dengan nada positif ("Tukar peraturan memang mencabar").
- Zon ibu bapa: % betul selepas tukar, % campur, tahap, sejarah (sebelum / selepas tukar / campur).
- Had masa harian, maks 3 pusingan, Tarik Nafas Belon, Misi Dunia Sebenar ("Isih Mainan").
- Tiada iklan, tiada rangkaian; data dalam `localStorage` (`rumah-haiwan.v1`) peranti sahaja.

## Jangkaan perkembangan (untuk tafsir data)
Ramai kanak-kanak 3 tahun masih ikut peraturan lama selepas tukar (*perseveration*). Ini normal. Kebanyakan kanak-kanak 4–5 tahun boleh tukar. Blok campur mencabar walaupun untuk 6 tahun.

## Fail
- `game.html`: sumber artifact.
- `assets/audio/*.mp3`: suara Sayf (`eleven_v4`), 64 kbps mono, −18 LUFS (`[softly]` −20 LUFS). `right1`, `right2`, `breath-in`, `breath-out` disalin dari Lampu Isyarat Haiwan.
- `SKRIP-SUARA.md`: skrip semua baris.

## Hutang teknikal (kini 3 salinan)
Lukisan haiwan, audio, gate, zon ibu bapa dan Tarik Nafas Belon disalin dalam ketiga-tiga game. Langkah seterusnya yang disyorkan: **app shell** dengan modul dikongsi, satu laman utama untuk 3 game, satu zon ibu bapa dan satu had masa harian untuk semua game.
