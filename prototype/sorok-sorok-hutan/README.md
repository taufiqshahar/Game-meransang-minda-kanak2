# Sorok-Sorok Hutan (Prototaip v0.1)

Permainan **ingatan kerja** untuk kanak-kanak 3–6 tahun. Game kedua dalam siri ini, selepas *Lampu Isyarat Haiwan* (kawalan diri).
Haiwan hutan Malaysia menyorok dalam semak seekor demi seekor. Hafiz tanya "Mana kancil?" dan anak tekan semak yang betul.

## Kenapa game ini
Ingatan kerja dan kawalan diri ialah dua daripada tiga kemahiran teras *executive function* untuk umur prasekolah. Dua game yang melatih kemahiran berbeza menjadikan produk ini satu kurikulum kepada ibu bapa, bukan koleksi game rawak.

## Ciri
- Latihan berpandu (1 haiwan, 3 semak, tangan penunjuk) diikuti 8 soalan satu pusingan.
- Bilangan haiwan menyesuaikan diri (1–5) dengan tangga **2-naik-1-turun**: tambah seekor selepas 2 betul berturut-turut, kurang seekor bila tersilap (sasaran ~70% betul). Bilangan mula ikut umur: 3–4 tahun → 2, 5–6 tahun → 3.
- Bilangan semak = haiwan + 2 (min 3, maks 6), jadi sentiasa ada semak kosong sebagai pengganggu.
- Tiada had masa menjawab. Soalan diulang selepas 8 s jika anak senyap (2 kali).
- Salah sekali: "Cuba lagi" (1 peluang lagi). Salah lagi: haiwan keluar dan tangan tunjuk tempatnya. Tiada "kalah".
- **Betul** hanya dikira pada cubaan pertama (data ibu bapa jujur), tapi anak tetap "jumpa" kawan pada cubaan kedua.
- Haiwan yang sama tidak ditanya dua kali berturut-turut.
- Had masa harian, maks 3 pusingan satu sesi, Tarik Nafas Belon, Misi Dunia Sebenar ("Sorok Bawah Cawan").
- Zon ibu bapa (soalan darab): % ingat betul, bilangan haiwan sekarang, rekod terbaik, sejarah 10 pusingan.
- Tiada iklan, tiada rangkaian; data dalam `localStorage` (`sorok-sorok-hutan.v1`) peranti sahaja.

## Fail
- `game.html`: sumber artifact (skeleton `<!doctype>` ditambah semasa diterbitkan).
- `assets/audio/*.mp3`: suara Hafiz (ElevenLabs `eleven_v4`), 64 kbps mono, −18 LUFS (baris `[softly]` −20 LUFS). `start`, `breath-in`, `breath-out` disalin dari Lampu Isyarat Haiwan.
- `SKRIP-SUARA.md`: skrip semua baris + resipi kelantangan.

## Hutang teknikal
- Lukisan haiwan (`ART`, `ART_DEFS`, `ANIMALS`), audio, gate dan zon ibu bapa disalin dari `lampu-isyarat-haiwan/game.html`. Ekstrak ke modul dikongsi bila app shell untuk banyak game dibina (game ketiga ialah masa yang sesuai).
- Had masa harian dikira berasingan untuk setiap game. App shell nanti patut kongsi satu had untuk semua game.
