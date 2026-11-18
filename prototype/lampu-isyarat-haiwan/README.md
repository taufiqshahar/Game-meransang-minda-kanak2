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

## Sementara (akan diganti)
- Suara: Web Speech API (`ms-*`/`id-*` jika ada) → akan diganti rakaman suara BM (ElevenLabs)
- Seni: SVG dilukis dalam kod → akan diganti aset rasmi
