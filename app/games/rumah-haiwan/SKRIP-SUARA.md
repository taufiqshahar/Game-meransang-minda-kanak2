> Disalin dari `prototype/rumah-haiwan/SKRIP-SUARA.md`. Dalam app, baris kongsi (`start`, `bagus`, `pandainya`, `breath-in`, `breath-out`) berada dalam `app/kit/audio/`. Lampu Isyarat: `go1` → `bagus`, `go2` → `pandainya`. Rumah Haiwan: `right1` → `bagus`, `right2` → `pandainya`.

# Skrip Suara: Rumah Haiwan (BM Malaysia)

Suara: ElevenLabs **Hafiz – Energetic Cartoon Character** (`LkSPBLr5WF7APTCqF4ZJ`), model `eleven_v4`, 1 versi setiap baris.
Simpan sebagai `assets/audio/<kunci>.mp3` (64 kbps mono), kemudian pastikan kunci ada dalam `RECORDED` dalam `game.html`.
Kelantangan: baris biasa −18 LUFS, baris `[softly]` −20 LUFS, puncak ≤ −1.5 dBTP. Resipi ffmpeg: `../lampu-isyarat-haiwan/SKRIP-SUARA.md`.

| Kunci | Teks (tag nada dalam kurungan siku) | Status |
|---|---|---|
| intro | [excited] Jom tolong haiwan balik rumah! Dengar baik-baik, ya. | ✅ ada |
| rule-warna | [warmly] Kita main warna. Topi merah masuk rumah topi merah, topi biru masuk rumah topi biru. | ✅ ada |
| rule-haiwan | [warmly] Kita main haiwan. Setiap haiwan masuk rumah haiwan yang sama, tak kira warna topi. | ✅ ada |
| switch | [excited] Sekarang kita tukar permainan! | ✅ ada |
| mix | [excited] Sekarang lagi mencabar! Dengar baik-baik: warna atau haiwan? | ✅ ada |
| cue-warna | [happy] Warna! | ✅ ada |
| cue-haiwan | [happy] Haiwan! | ✅ ada |
| remind-warna | [softly] Ingat, ikut warna topi. | ✅ ada |
| remind-haiwan | [softly] Ingat, ikut haiwan. | ✅ ada |
| right1 | [happy] Bagus! | ✅ ada (salinan Lampu Isyarat `go1`) |
| right2 | [excited] Pandainya! | ✅ ada (salinan Lampu Isyarat `go2`) |
| right3 | [excited] Betul, itu rumah dia! | ✅ ada |
| wrong-warna | [softly] Hmm, tengok warna topi dia. | ✅ ada |
| wrong-haiwan | [softly] Hmm, tengok haiwan apa ni. | ✅ ada |
| end | [excited] Syabas! Semua haiwan dah sampai rumah. | ✅ ada |
| breath-in | [softly] Tarik nafas dalam-dalam… | ✅ ada (salinan) |
| breath-out | [softly] Hembus perlahan-lahan… | ✅ ada (salinan) |

## Panduan bahasa (Melayu Malaysia, bukan Indonesia)
- **balik rumah** (harian), **tak kira** (bukan "tidak peduli"), **ni** (harian untuk "ini").
- Skrin: **tekan**. Sapaan: **adik**.
