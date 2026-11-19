# Skrip Suara: Lampu Isyarat Haiwan (BM Malaysia)

Suara: ElevenLabs **Hafiz – Energetic Cartoon Character** (`LkSPBLr5WF7APTCqF4ZJ`, loghat Malaysia), model `eleven_v4`, 1 versi setiap baris.
Simpan sebagai `assets/audio/<kunci>.mp3` (64 kbps mono), kemudian tambah kunci ke `RECORDED` dalam `game.html`.

## Kelantangan (wajib sebelum simpan)
- Baris biasa: **−18 LUFS**. Baris `[softly]`: **−20 LUFS** (lembut tapi masih jelas pada pembesar suara tablet).
- Puncak maksimum **−1.5 dBTP**. Gain linear sahaja + limiter, jangan mampat dinamik.
- Encode dari fail asal ElevenLabs, bukan dari MP3 64k (elak kualiti jatuh dua kali).

```bash
# 1) Ukur: ambil nilai "input_i"
ffmpeg -i asal.mp3 -af loudnorm=print_format=json -f null - 2>&1 | grep input_i
# 2) GAIN = sasaran − input_i (cth. −18 − (−24.5) = 6.5)
ffmpeg -i asal.mp3 -af "volume=6.5dB,alimiter=limit=0.84:level=false" -ac 1 -b:a 64k -map_metadata -1 assets/audio/<kunci>.mp3
```

| Kunci | Teks (tag nada dalam kurungan siku) | Status |
|---|---|---|
| intro | [excited] Jom, kita tolong haiwan melintas jalan! | ✅ ada |
| prac-go | [warmly] Lampu hijau! Tekan haiwan tu, biar dia melintas. | ✅ ada |
| prac-nogo | [softly] Lampu merah… tunggu dulu. Jangan tekan, ya. | ✅ ada |
| start | [happy] Pandai! Sekarang kita main betul-betul. | ✅ ada |
| go1 | [happy] Bagus! | ✅ ada |
| go2 | [excited] Pandainya! | ✅ ada |
| go3 | [excited] Yeay, dia dah sampai seberang! | ✅ ada |
| go4 | [warmly] Terima kasih, adik! | ✅ ada |
| wait1 | [warmly] Pandai adik tunggu! | ✅ ada |
| wait2 | [happy] Bagus, adik sabar! | ✅ ada |
| wait3 | [happy] Kereta dah lalu. Selamat! | ✅ ada |
| miss | [warmly] Lampu dah hijau. Tekan haiwan tu, ya! | ✅ ada |
| oops | [softly] Alamak, lampu masih merah. Kita tunggu dulu, ya. | ✅ ada |
| end | [excited] Syabas! Semua haiwan dah selamat melintas. | ✅ ada |
| breath-in | [softly] Tarik nafas dalam-dalam… | ✅ ada |
| breath-out | [softly] Hembus perlahan-lahan… | ✅ ada |
| baru-orangutan | [excited] Wah, kawan baharu! Orang utan nak ikut melintas! | ✅ ada |
| baru-tapir | [excited] Wah, kawan baharu! Tapir nak ikut melintas! | ✅ ada |
| baru-enggang | [excited] Wah, kawan baharu! Burung enggang nak ikut melintas! | ✅ ada |

## Panduan bahasa (Melayu Malaysia, bukan Indonesia)
- Skrin: **tekan** (bukan "ketik"/"ketuk"/"klik").
- Sapaan kanak-kanak: **adik** (bukan "kamu"/"anda").
- Harian & mesra: "dah", "tu", "ya", "Jom", "Alamak", "Syabas", "Pandainya".
- Elak perkataan Indonesia: "bisa", "kok", "dong", "banget", "nggak", "silakan ketuk", "mobil" (guna "kereta").
