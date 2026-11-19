# Lampu Isyarat Haiwan (Prototaip v0.1)

Permainan **kawalan diri (inhibisi)** untuk kanak-kanak 3–6 tahun, berasaskan tugasan *Go/No-Go*.
Bantu haiwan hutan Malaysia (kancil, harimau Malaya, orang utan, gajah, tapir, enggang) melintas jalan:
**lampu hijau → ketik**, **lampu merah → tunggu** (kereta lalu).

## Ciri
- 2 percubaan latihan berpandu → 12 percubaan (9 Go, 3 No-Go, No-Go tak berturut-turut)
- Tahap kelajuan adaptif (6 tahap, 3.2 s → 1.3 s): naik ≥ 85% betul, turun < 60%
- Maklum balas tenang, tiada "Game Over", semua haiwan akhirnya melintas
- Had masa harian (lalai 10 minit), maks 3 pusingan satu sesi
- Ritual tamat: "Tarik Nafas Belon" + Misi Dunia Sebenar untuk ibu bapa
- Zon ibu bapa di belakang *parental gate* (soalan darab): ketepatan Go, "Sabar" (No-Go), masa reaksi, tetapan
- Tiada iklan, tiada rangkaian; data dalam `localStorage` peranti sahaja

## Fail
- `game.html`: sumber artifact (tanpa `<!doctype>`/`<html>`; skeleton ditambah semasa diterbitkan)
- `assets/audio/*.mp3`: rakaman suara BM (ElevenLabs `eleven_v4`, suara "Hafiz – Energetic Cartoon Character"), dimampat 64 kbps mono. Kunci fail = kunci dalam `LINES` di `game.html`.
- `assets/kancil-pilihan/`: 4 pilihan gaya kancil (Recraft v4.1 Pro Vector, SVG) untuk dipilih

## Suara
Rakaman dimuat dengan `fetch` + Web Audio semasa anak tekan Main. Jika gagal (contoh dibuka sebagai `file://`), sandaran ke suara pelayar `ms-*`/`id-*`, dan kapsyen sentiasa dipaparkan.

## Sementara (akan diganti)
- Seni haiwan: SVG dilukis dalam kod → akan diganti aset vektor setelah gaya dipilih

## Keputusan: 2D sahaja
Versi 3D (Three.js) telah dibina untuk perbandingan, kemudian **ditolak**: kekal 2D vektor (lebih ringan, cepat dibina, tajam). Kod 3D masih ada dalam sejarah git (commit `40b5c04`).

## v0.4: koleksi haiwan
- Mula dengan 3 haiwan (kancil, harimau, gajah). Orang utan, tapir dan enggang dibuka selepas pusingan tamat ke-1, ke-3 dan ke-5; yang belum dibuka tampil sebagai bayang "?" di laman utama.
- Kad "Kawan baharu!" + suara Hafiz bila haiwan dibuka.
- Bintang ★ setiap haiwan ikut bilangan percubaan **betul** dengan haiwan itu (3 / 10 / 25): ganjaran untuk kawalan diri, bukan untuk tekan sebanyak mungkin.
- Etika: tiada streak, tiada kehilangan, had masa harian & had 3 pusingan kekal. Status buka kunci diterbitkan daripada `data.rounds` (tiada keadaan berasingan); bintang disimpan dalam `data.helped`.
- Pepijat dibaiki: skrin keputusan kini menunjukkan haiwan sebenar yang melintas.

## v0.3: grafik & bahasa
- Semua haiwan, latar, kereta & lampu isyarat dilukis semula sebagai SVG vektor (tajam di semua skrin): garis luar lembut, gradien, mata berkilat, bayang.
- Latar hutan Malaysia: pokok tualang, kanopi berlapis, kerb hitam-putih, garisan tepi kuning, papan tanda kuning "lintasan gajah".
- Kancil kini ada belang putih di leher (ciri sebenar).
- Bahasa disemak ke bahasa Melayu Malaysia harian: "tekan" (bukan "ketik"), "adik" (bukan "kamu"), "Alamak", "Syabas".
- Sandaran suara peranti hanya `ms-*` (Bahasa Melayu). Sandaran Bahasa Indonesia dibuang.
- Rakaman suara: semua baris dirakam (ElevenLabs Hafiz, `eleven_v4`, 64 kbps mono) dan disenaraikan dalam `RECORDED` dalam `game.html`. Jika teks baris diubah, buang kuncinya dari `RECORDED` sehingga dirakam semula.
