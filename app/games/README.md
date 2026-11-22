# Kontrak modul game

Setiap game ialah satu fail `games/<id>/index.js` yang mengeksport objek default. Shell (`main.js`) menguruskan segala yang lain: laman utama, had masa, keputusan, tarik nafas, misi, zon ibu bapa dan storan.

```js
export default {
  id: 'kira-rambutan',               // sama dengan nama folder dan entri registry
  title: 'Kira Rambutan',
  stageLabel: 'Penerangan pentas untuk pembaca skrin.',
  lines: { intro: '…', end: '…' },   // kapsyen; kunci = nama fail audio. 'end' WAJIB (disebut di skrin keputusan)
  recorded: ['intro', 'end'],        // kunci yang ada rakaman dalam games/<id>/audio/ (senarai eksplisit)
  css: `…`,                          // CSS khusus game; awali kelas dengan singkatan game (cth. .kr-)
  stageHtml: () => `<svg class="bg" …>…</svg> …`, // isi pentas 2:3 (shell menambah .hand dan .caption)

  initState: (age) => ({ age, level: 1, rounds: [] }),
  normalize(s, age) { /* betulkan data rosak; jika s.age !== age, tetapkan semula tahap */ return s; },

  async round(ctx) {                 // satu pusingan; pulangkan keputusan
    return { record: {…}, text: 'html', foundHtml?: '', extraHtml?: '', followUp?: 'kunci', onShow?(root) {} };
  },

  parent: {
    stats: (s) => [{ v: '80%', label: 'Betul' }, …],   // 3 kad statistik
    cols: ['Betul', …], row: (r) => [cell, …],          // jadual sejarah (lajur "Masa" ditambah shell)
    explain: 'html',                                   // apa yang diukur + jangkaan umur
  },
  mission: { title: '…', steps: ['html', …], why: '…' },
};
```

## `ctx` (diberi kepada `round`)
| Ahli | Kegunaan |
|---|---|
| `stage`, `state`, `age`, `first` | Elemen pentas; keadaan game (simpan tahap di sini); umur; `true` pada pusingan pertama sesi (untuk latihan) |
| `say(key, iconSvg?)` → ms | Kapsyen + suara; pulangkan tempoh supaya boleh tunggu |
| `sfx.good/soft/pop/light/rustle()`, `sfx.car(sec)` | Bunyi |
| `wait(ms)` | Tidur yang membatalkan diri bila pusingan dihentikan |
| `tap({ selector, ms, event, keys })` → `{ el, t }` / `null` | Tunggu tekanan dalam pentas (null = tamat masa) |
| `alive()` | Lempar `CANCEL` jika pusingan dihentikan (panggil selepas `await` panjang) |
| `ready()` | Tunggu suara game dimuat (maks 4 s) |
| `caption(text)`, `hand.show(left%, top%)`, `hand.hide()` | Kapsyen tanpa suara; tangan penunjuk |
| `progress(n, gaps)`, `mark(i)` | Bar kemajuan |
| `toPct(rect)`, `anim(el, frames, opts)`, `save()` | Utiliti |

Baris kongsi (tanpa rakaman baharu): `start`, `bagus`, `pandainya`, `betul`, `hebat`, `cuba-lagi`, `tengok`, `end`, `breath-in`, `breath-out`, `n1`–`n10`, `v-<kenderaan>` (8 nama kenderaan). Senarai penuh: `kit/audio/SKRIP-SUARA.md`.

Aset seni kongsi: `kit/art.js` (6 haiwan, topi), `kit/vehicles.js` (8 kenderaan), `kit/objects.js` (rambutan).

## Senarai semak game baharu
1. **Kawalan aktif hanya semasa mendengar**: butang/kad dibuat `disabled` semasa Hafiz bercakap atau semasa maklum balas, dan aktif hanya bila `ctx.tap()` sedang menunggu. Jika tidak, tekanan awal hilang tanpa disedari (pepijat yang ditemui dalam Kira Rambutan dan Bunyi Mula).
1. **Reka bentuk**: satu kemahiran, berasaskan penyelidikan, tahap menyesuaikan diri, latihan berpandu untuk pusingan pertama, tiada kalah, salah = petunjuk + tunjuk jawapan, nada positif untuk skor rendah.
2. **Skrip suara** (`SKRIP-SUARA.md`): BM Malaysia (tekan, adik, dah, kat, tak). Jana dengan ElevenLabs Hafiz `LkSPBLr5WF7APTCqF4ZJ`, `eleven_v4`, 1 versi setiap baris.
3. **Audio**: 64 kbps mono; −18 LUFS (baris `[softly]` −20 LUFS); puncak ≤ −1.5 dBTP. Resipi: `prototype/lampu-isyarat-haiwan/SKRIP-SUARA.md`.
4. **Kod**: `games/<id>/index.js` ikut kontrak di atas; tambah entri dalam `registry.js`.
5. **Uji**: bot Playwright main satu pusingan penuh pada lebar 390 px (latihan, salah, betul, naik/turun tahap), semak tiada ralat konsol dan semua audio dimuat, satu tangkapan skrin pentas dan keputusan.
6. **Kemas kini** `ROADMAP.md` (status) dan terbitkan semula artifact.
