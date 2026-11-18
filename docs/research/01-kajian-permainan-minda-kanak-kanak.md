# Kajian: Permainan Merangsang Minda Kanak-Kanak Bawah 6 Tahun (untuk SaaS)

> Tarikh: 18 Nov 2026 · Status: Draf v1 (kajian meja / desk research) · Belum disahkan dengan temu bual ibu bapa

---

## 0. Ringkasan Eksekutif (TL;DR)

| # | Dapatan | Implikasi kepada produk |
|---|---------|--------------------------|
| 1 | WHO (2019): **0 skrin untuk < 1 tahun**, **≤ 1 jam/hari untuk 2–4 tahun** (kurang lebih baik). AAP: elakkan skrin < 18 bulan (kecuali video call), 2–5 tahun ≤ 1 jam kandungan berkualiti, **sebaiknya bersama ibu bapa**. | Sasaran sebenar = **umur 2–6 tahun**, fokus utama **3–6**. Had masa terbina dalam (sesi 10–15 min) = **ciri jualan**, bukan kelemahan. |
| 2 | "Video deficit / transfer deficit": kanak-kanak < 3 tahun belajar **kurang** dari skrin berbanding dunia sebenar; bantuan ibu bapa (label, puji, terangkan) **mengurangkan** jurang ini. | Bina **mod main bersama (co-play)** + "misi dunia sebenar" selepas setiap sesi. |
| 3 | Rangka kerja **4 Tiang Pembelajaran** (Hirsh-Pasek et al., 2015): Aktif, Fokus/Terlibat, Bermakna, Interaksi Sosial + matlamat pembelajaran jelas. Kajian 100 app kanak-kanak teratas: **skor rendah** di semua tiang. | Ini jurang pasaran. Jadikan 4 Tiang sebagai **standard reka bentuk dalaman** setiap permainan. |
| 4 | Radesky et al. (JAMA Netw Open, 2022): hanya **20% app** yang dimainkan kanak-kanak 3–5 tahun **bebas reka bentuk manipulatif**; kanak-kanak SES rendah lebih terdedah. | Posisi jenama: **"Tiada iklan. Tiada helah. Tiada ketagihan."** — kepercayaan ibu bapa = kelebihan kompetitif. |
| 5 | Kemahiran paling bernilai untuk dirangsang: **Fungsi Eksekutif** (ingatan kerja, kawalan diri, fleksibiliti kognitif), **kemahiran ruang (spatial)**, **numerasi awal**, **kesedaran fonologi**, **bahasa & emosi**. Kemahiran ruang umur 3 meramal matematik umur 5 lebih kuat daripada kemahiran membilang. | Katalog permainan dibina mengikut **5 domain** ini (lihat §3). |
| 6 | Pasaran Malaysia: pesaing tempatan (Didi & Friends – Astro, Omar & Hana – Digital Durian) kuat pada **IP kartun/video**, bukan pada **permainan kognitif berasaskan bukti + papan pemuka ibu bapa**. Pesaing global (Khan Academy Kids – percuma; Lingokids, Sago Mini, Pok Pok – langganan) kebanyakannya Inggeris. | Pembeza: **Bahasa Melayu-first + selaras KP2026 + laporan perkembangan untuk ibu bapa + B2B tadika/TASKA**. |
| 7 | Undang-undang: **PDPA (Pindaan) 2024** berkuat kuasa berperingkat dari 2025; draf peraturan cadangkan pengesahan persetujuan ibu bapa. COPPA (AS) dipinda, berkuat kuasa penuh 22 Apr 2026 jika anda jual ke AS. | **Privasi-by-design**: data minimum, tiada SDK iklan, akaun milik ibu bapa, "parental gate". |

**Cadangan utama:** Bina **MVP 6–8 permainan** (2 per domain teras) untuk umur 3–6, dwibahasa BM/EN, sesi 10–15 minit, mod co-play, papan pemuka ibu bapa. Model **langganan tanpa iklan** (B2C) + **lesen per murid** (B2B tadika). Sahkan dahulu dengan 20–30 ibu bapa sebelum tulis banyak kod.

---

## 1. Realiti Saintifik — Apa Yang Ibu Bapa (dan Pakar) Perlu Tahu

### 1.1 Garis panduan masa skrin

| Umur | WHO 2019 | AAP | Implikasi |
|------|----------|-----|-----------|
| < 1 tahun | Tiada skrin | Elak (kecuali video call) | **Jangan sasar.** Boleh tawar kad aktiviti *luar talian* untuk ibu bapa. |
| 1–2 tahun | 1 tahun: tiada; 2 tahun: ≤ 1 jam | 18–24 bln: hanya kandungan berkualiti, **bersama ibu bapa** | Hanya mod **co-play** (ibu bapa pegang fon bersama). |
| 2–4/5 tahun | ≤ 1 jam/hari, kurang lebih baik | ≤ 1 jam/hari kandungan berkualiti, main bersama | Sesi pendek, had harian, ada titik henti semula jadi. |
| 5–6 tahun | (di luar skop WHO <5) | Had konsisten, utamakan tidur/aktiviti fizikal | Boleh main solo lebih lama, tetap ada had. |

**Pengajaran (Critical Thinking):** Idea "SaaS untuk kanak-kanak bawah 6 tahun" perlu diperhalusi. Jika anda pasarkan untuk bayi/kanak-kanak < 2 tahun bermain sendiri, anda **bertentangan** dengan WHO/AAP — risiko reputasi besar dan pakar pediatrik tak akan sokong. Posisi yang betul: *"Masa skrin yang sedikit, tetapi bermakna — untuk umur 2–6."*

### 1.2 Masalah sebenar di Malaysia
- Kajian Selangor (Daerah Petaling, 2022) mengkaji faktor masa skrin berlebihan (> 1 jam) bagi kanak-kanak 2–<5 tahun — penulis menyatakan ini kajian pertama seumpamanya di Malaysia.
- Kajian JMIR 2021 (789 pasangan ibu bapa–anak, klinik kesihatan Petaling) mengkaji **halangan ibu bapa** untuk kurangkan masa skrin.
- Kajian UiTM 2021 (143 ibu bapa, anak 4–6 tahun): **51%** prasekolah didedahkan kepada skrin melalui **telefon pintar**.
- ⚠️ Tiada statistik nasional yang kukuh khusus untuk telefon pintar < 5 tahun. **Ini peluang** — tinjauan anda sendiri boleh jadi bahan pemasaran (content marketing / PR).

**Insight pelanggan:** Ibu bapa bukan tak tahu skrin "tak elok" — mereka **perlukan fon sebagai alat bertahan** (masak, memandu, kerja). Mereka rasa **bersalah**. Produk anda menjual **"pengurangan rasa bersalah yang jujur"**: masa skrin yang memang membina otak + had automatik + idea aktiviti luar talian.

### 1.3 Kenapa kebanyakan app "pendidikan" gagal
1. **Transfer deficit:** Kanak-kanak < 3 tahun sukar memindahkan apa yang dipelajari di skrin ke dunia sebenar. Bantuan ibu bapa (melabel, menyusun tugas, memuji) **meningkatkan** pemindahan; interaksi sentuh yang **kontinjen** (respons khusus kepada tindakan anak) juga membantu. Kanak-kanak 4–6 tahun kurang terjejas.
2. **Tiada matlamat pembelajaran jelas** → hanya hiburan.
3. **Gangguan (distracting enhancements):** animasi/bunyi berlebihan yang tak berkaitan. Kajian mendapati app **percuma** mempunyai skor "engagement in learning" lebih rendah berbanding app berbayar kerana gangguan ini.
4. **Reka bentuk manipulatif:** watak memujuk ("Jangan berdiri saja, buat sesuatu!"), iklan susah ditutup (46% app), ganjaran untuk terus bermain, paywall di tengah permainan.

### 1.4 Rangka kerja 4 Tiang (gunakan sebagai checklist setiap permainan)

| Tiang | Soalan semakan | Contoh baik | Contoh buruk |
|-------|----------------|-------------|---------------|
| **Aktif** (minds-on) | Adakah anak *berfikir*, bukan sekadar ketik? | Susun bentuk untuk lengkapkan gambar | Ketik apa saja → bunyi |
| **Terlibat** (tanpa gangguan) | Adakah setiap animasi menyokong matlamat? | Maklum balas ringkas, tenang | Konfeti/bunyi setiap 3 saat |
| **Bermakna** | Berkait dengan kehidupan anak? | Kira buah di pasar malam, susun kasut | Abstrak tanpa konteks |
| **Sosial** | Ada ruang bercakap dengan ibu bapa/rakan? | Gesaan "Tanya ibu: warna apa baju ibu?" | Main seorang tanpa henti |
| **+ Matlamat pembelajaran** | Kemahiran khusus yang diukur? | "Ingatan kerja: ingat 3 item" | "Seronok!" sahaja |

---

## 2. Peringkat Perkembangan & Fokus Kemahiran Mengikut Umur

| Umur | Ciri perkembangan | Kemahiran utama untuk dirangsang | Gaya interaksi skrin |
|------|-------------------|----------------------------------|----------------------|
| **2–3** | Bahasa meletup, motor halus asas, pemindahan dari skrin lemah | Kosa kata, nama objek/warna/bentuk, sebab-akibat, ikut 1 arahan | Ketik besar, seret mudah, **wajib co-play**, suara ibu bapa |
| **3–4** | **Kawalan diri (inhibisi) berkembang paling pesat 3–5 tahun**, main pura-pura | Inhibisi, padanan, corak ABAB, bilang 1–5, emosi asas | Sesi 5–10 min, 2–3 langkah |
| **4–5** | Ingatan kerja meningkat, minat huruf & nombor | Ingatan kerja, fonologi (rima, bunyi awal), subitizing, puzzle ruang | Sesi 10–15 min, tahap kesukaran adaptif |
| **5–6** | Kesediaan sekolah (transisi Tahun 1) | Fleksibiliti kognitif (tukar peraturan), bunyi huruf → suku kata, tambah/tolak mudah, perancangan, kod asas | Sesi 15 min, boleh main solo lebih lama |

> **Nota kurikulum:** KSPK (Semakan 2017) sudah digantikan oleh **Kurikulum Prasekolah 2026 (KP2026)** mulai Jan 2026 — merangkumi bahasa, matematik awal, sains, kreativiti/seni dan **literasi digital**. Selaraskan permainan dengan KP2026 untuk jualan B2B ke tadika/TASKA. *(Perlu dapatkan dokumen rasmi KPM untuk pemetaan tepat.)*

---

## 3. Katalog Permainan Yang Disyorkan (berasaskan bukti)

### Domain A — Fungsi Eksekutif (EF) ⭐ keutamaan tertinggi
EF = asas kesediaan sekolah dan kawalan diri. Bukti: program main terstruktur yang melatih inhibisi, ingatan kerja & fleksibiliti menunjukkan peningkatan di kelas prasekolah. Bukti untuk *app sahaja* masih **kurang konsisten** → gabungkan dengan aktiviti dunia sebenar.

| Permainan (nama kerja) | Kemahiran | Umur | Mekanik | Asas |
|------------------------|-----------|------|---------|------|
| **"Lampu Isyarat Haiwan"** | Inhibisi | 3–6 | Ketik bila haiwan *hijau*, JANGAN ketik bila *merah*; peraturan bertukar kadang-kadang | Paradigma Go/No-Go, permainan "Red Light Green Light" |
| **"Siang–Malam Terbalik"** | Inhibisi | 4–6 | Gambar matahari → tekan bulan; bulan → tekan matahari | Tugasan Day-Night Stroop |
| **"Ingat Barang Belanja"** | Ingatan kerja | 3–6 | Lihat 2→5 barang di bakul, kemudian pilih dari rak pasar | Span ingatan, adaptif |
| **"Susun Ikut Warna… Eh, Ikut Bentuk!"** | Fleksibiliti kognitif | 4–6 | Isih kad ikut warna, kemudian peraturan bertukar ke bentuk | Dimensional Change Card Sort (DCCS) |
| **"Ikut Rentak Kompang"** | Kawalan diri + ingatan | 3–6 | Ulang corak ketukan (ringkas → panjang); mod "jangan ketuk bila loceng" | Simon-says, ritma |

### Domain B — Kemahiran Ruang (Spatial) & Logik
Kemahiran ruang umur 3 meramal matematik umur 5 **lebih kuat** daripada kemahiran membilang awal (Verdine et al.). Kanak-kanak berpendapatan rendah lebih ketinggalan → impak sosial tinggi.

| Permainan | Kemahiran | Umur | Mekanik |
|-----------|-----------|------|---------|
| **"Tangram Rumah Kampung"** | Visualisasi, putaran mental | 3–6 | Seret & putar bentuk untuk lengkapkan siluet (bilangan kepingan adaptif) |
| **"Salin Binaan Blok"** | Salin struktur 2D/3D | 3–6 | Bina semula menara blok mengikut contoh |
| **"Peta Harta Karun"** | Bahasa ruang (atas/bawah/kiri/kanan/belakang) | 3–5 | "Letak kucing di **bawah** meja" |
| **"Corak Batik"** | Corak (ABAB, AABB, ABC) | 3–6 | Lengkapkan corak motif batik/songket |
| **"Robot Kecil Pulang ke Rumah"** | Urutan, perancangan, asas pengekodan | 5–6 | Susun anak panah untuk gerakkan robot (unplugged-coding style) |

### Domain C — Numerasi Awal
Meta-analisis intervensi numerasi awal: kesan sederhana (g ≈ 0.64), **lebih besar** untuk prasekolah/tadika. Intervensi digital: kesan ~0.5 tetapi heterogen; permainan video **tidak** semestinya lebih baik dari latih tubi digital yang direka baik → fokus pada **reka bentuk pembelajaran**, bukan "gamifikasi".

| Permainan | Kemahiran | Umur | Mekanik |
|-----------|-----------|------|---------|
| **"Sekilas Pandang" (subitizing)** | Kenal kuantiti 1–5 tanpa kira | 3–5 | Titik/buah muncul sekejap → pilih nombor |
| **"Kedai Runcit Mini"** | Kardinaliti, bilang, wang mudah | 4–6 | Beri pelanggan "3 rambutan", bayar dengan syiling |
| **"Lebih atau Kurang?"** | Perbandingan kuantiti, garis nombor | 3–6 | Pilih kumpulan lebih banyak; letak nombor di garis |
| **"Kongsi Kuih Sama Rata"** | Asas pembahagian/pecahan | 5–6 | Bahagi kuih kepada rakan secara adil |

### Domain D — Bahasa & Literasi Awal (BM-first, dwibahasa)
Meta-analisis 2024 (19 kajian): intervensi **kesedaran fonologi** berasaskan teknologi menunjukkan kesan positif konsisten untuk prasekolah. Bahasa Melayu sangat sesuai — **ejaan fonetik & berasaskan suku kata** (ba-ju, ka-ki).

| Permainan | Kemahiran | Umur | Mekanik |
|-----------|-----------|------|---------|
| **"Bunyi Apa Ini?"** | Bunyi awal | 4–6 | "Mana bermula dengan bunyi /b/?" → bola, bas, buku |
| **"Kereta Api Suku Kata"** | Gabung & pecah suku kata | 4–6 | Cantum gerabak "ku" + "da" = kuda |
| **"Pantun Berima"** | Rima | 4–6 | Pilih perkataan yang berima |
| **"Cerita Bergambar Interaktif"** | Kosa kata, kefahaman, naratif | 2–6 | Buku digital dengan **gesaan dialog untuk ibu bapa** (dialogic reading) |
| **"Kad Perkataan Dunia Sebenar"** | Kosa kata | 2–4 | Kategori rumah, dapur, haiwan, pengangkutan Malaysia |

### Domain E — Sosio-Emosi & Kreativiti
| Permainan | Kemahiran | Umur | Mekanik |
|-----------|-----------|------|---------|
| **"Muka Apa Ini?"** | Kenal emosi | 3–6 | Padankan ekspresi muka dengan situasi |
| **"Tarik Nafas Belon"** | Regulasi emosi | 3–6 | Tiup/tarik nafas ikut belon mengembang (juga **ritual tamat sesi**) |
| **"Studio Lukis & Lagu"** | Kreativiti terbuka | 2–6 | Kanvas bebas, tiada betul/salah |
| **"Pilih Apa Patut Buat"** | Penyelesaian masalah sosial | 4–6 | Senario: "Kawan jatuh, apa kita buat?" |

### Prioriti MVP (cadangan 8 permainan)
1. Lampu Isyarat Haiwan (EF – inhibisi)
2. Ingat Barang Belanja (EF – ingatan kerja)
3. Susun Ikut Warna… Eh, Bentuk! (EF – fleksibiliti)
4. Tangram Rumah Kampung (Ruang)
5. Corak Batik (Logik/corak)
6. Sekilas Pandang (Numerasi)
7. Kereta Api Suku Kata (Literasi BM)
8. Tarik Nafas Belon (Emosi + ritual tamat sesi)

**Kenapa ini?** Paling kuat bukti, paling mudah dibina (2D, aset ringkas), boleh **diukur** (ketepatan, masa reaksi, tahap), dan setiap satu boleh jadi **enjin generik** (satu enjin → banyak tema/kandungan = DRY, skala kandungan murah).

---

## 4. Prinsip Reka Bentuk Produk (Non-Negotiable)

### 4.1 Untuk kanak-kanak
- [ ] Tiada teks wajib → **arahan suara** (BM/EN), ikon besar, sasaran sentuh ≥ 2 cm.
- [ ] **Kesukaran adaptif** (zone of proximal development): naik tahap bila ≥ 80% betul, turun bila < 50%.
- [ ] Maklum balas **tenang dan bermaklumat** ("Betul! Itu 3 rambutan") — bukan bunyi kasino.
- [ ] Kesilapan = peluang ("Cuba lagi, tengok bentuknya…") — tiada "Game Over", tiada hukuman.
- [ ] Sesi berakhir dengan **titik henti semula jadi** (cerita tamat, haiwan tidur) + ritual "Tarik Nafas Belon".
- [ ] **Tiada** autoplay seterusnya, streak yang menghukum, kotak ganjaran rawak (loot box), atau watak yang merayu anak terus main.
- [ ] **Misi Dunia Sebenar** selepas sesi: "Cari 3 benda bulat di rumah!" (atasi transfer deficit).
- [ ] Berfungsi **luar talian** (offline) — penting untuk kereta/kampung/data terhad.

### 4.2 Untuk ibu bapa
- [ ] **Parental gate** (cth. soalan matematik dewasa) sebelum tetapan, pembelian, pautan luar.
- [ ] Had masa harian & sesi yang boleh ditetapkan (lalai: 15 min/sesi, mengikut garis panduan).
- [ ] **Papan pemuka perkembangan**: kemahiran mengikut domain, trend mingguan, cadangan aktiviti luar talian. Elak "skor IQ" — gunakan bahasa positif dan rujuk bahawa ini bukan alat diagnosis.
- [ ] **Mod Main Bersama** dengan gesaan perbualan ("Tanya anak: kenapa dia pilih itu?").
- [ ] Laporan mingguan ringkas (emel/WhatsApp opt-in) → enjin **retention** utama.

### 4.3 Anti-pola yang perlu dielak (bukti Radesky 2022)
| Anti-pola | Kenapa bahaya |
|-----------|---------------|
| Iklan dalam app kanak-kanak | Anak tak boleh bezakan iklan vs kandungan; melanggar polisi Kids/Families stor app dalam banyak kes |
| Paywall di tengah permainan | Anak menangis → tekanan kepada ibu bapa → kebencian jenama |
| Watak memujuk/menyalahkan | Manipulasi emosi |
| Ganjaran untuk masa main panjang | Bercanggah dengan misi kesihatan |
| Mata wang maya/gacha | Asas perjudian |

---

## 5. Analisis Pasaran & Pesaing

### 5.1 Saiz pasaran (anggaran, berhati-hati)
- Anggaran pasaran global app pembelajaran awal kanak-kanak: **~USD 3.8–6.2 bilion (2025)**, CAGR **~11–17%** (Marketintelo, Deep Market Insights). ⚠️ Laporan vendor, metodologi tak telus — **jangan guna untuk keputusan besar**; gunakan anggaran bottom-up di bawah.
- **Bottom-up Malaysia (perlu sahkan):** Kira bilangan kanak-kanak umur 3–6 (data DOSM) × % isi rumah dengan telefon pintar × % sanggup bayar × ARPU. Ini lebih jujur untuk pitch pelabur.

### 5.2 Pesaing

| Pesaing | Model | Kekuatan | Kelemahan / Jurang |
|---------|-------|----------|--------------------|
| **Khan Academy Kids** | Percuma sepenuhnya (bukan untung), tiada iklan; sekolah USD 5/murid | Kualiti tinggi, kurikulum luas | Inggeris, tiada konteks Malaysia, percuma = sukar bersaing harga |
| **Lingokids** | Langganan (~USD 15/bln, ~USD 72–90/thn) | Bahasa Inggeris, jenama global | Mahal untuk Malaysia, fokus bahasa Inggeris |
| **Sago Mini (World/School)** | Langganan (~USD 8–12/bln) | Reka bentuk tenang, main terbuka | Kurang pengukuran kemahiran, Inggeris |
| **Pok Pok** | Langganan (~USD 7/bln) | Main terbuka, estetik, Montessori-style | Tiada laporan kemahiran, harga |
| **Omar & Hana** (Digital Durian, MY) | Langganan (~USD 6/bln, ~USD 60/thn) | IP Islamik kuat, ada BM | Lebih fokus video/lagu; masa skrin pasif |
| **Didi & Friends** (Astro, MY) | Percuma + IAP | IP terkenal tempatan | Video-heavy, bukan berfokus kognitif |

*(Harga dari senarai App Store/agregator — sahkan di stor Malaysia sebelum guna dalam pitch.)*

### 5.3 Positioning yang disyorkan
> **"Permainan minda 15 minit sehari — dibina berdasarkan sains perkembangan otak, dalam Bahasa Melayu, tanpa iklan dan tanpa helah ketagihan."**

**Kelebihan kompetitif (moat) yang boleh dibina:**
1. **Kandungan BM berasaskan suku kata + budaya tempatan** (batik, kompang, pasar malam, kuih) — sukar ditiru pemain global.
2. **Data perkembangan** (agregat, tanpa nama, dengan persetujuan) → validasi keberkesanan → kertas kajian bersama universiti (UPSI, UM, UPM) → kredibiliti yang pesaing tak ada.
3. **Saluran B2B** (tadika, TASKA, KEMAS, PERMATA, tadika swasta francais) → kos perolehan pelanggan (CAC) rendah; guru jadi saluran ke ibu bapa.
4. **Kepercayaan** sebagai jenama ("anti-dark-pattern pledge").

**Cabaran andaian anda:** "Pelbagai permainan" bukan kelebihan — pesaing ada ratusan. Kelebihan sebenar ialah **bukti keberkesanan + laporan untuk ibu bapa + konteks tempatan**. Lebih baik **8 permainan hebat yang adaptif** daripada 50 permainan biasa.

---

## 6. Model Perniagaan & Harga

### 6.1 Pilihan

| Model | Kebaikan | Keburukan | Cadangan |
|-------|----------|-----------|----------|
| Percuma + iklan | Mudah dapat pengguna | Bercanggah misi, risiko polisi stor/undang-undang, dark patterns | ❌ Jangan |
| Freemium (beberapa permainan percuma) | Corong pemasaran baik | Perlu elak paywall di tengah main | ✅ Ya — paywall hanya di **zon ibu bapa** |
| Langganan B2C | Hasil berulang (MRR), selari dengan kualiti | Perlu nilai berterusan (kandungan baharu) | ✅ Teras |
| Lesen B2B (tadika/TASKA) | CAC rendah, kontrak tahunan, kredibiliti | Kitaran jualan lebih panjang, perlu dashboard guru | ✅ Fasa 2 |
| Bayaran sekali | Ibu bapa suka | Tiada hasil berulang | ⚠️ Mungkin sebagai pakej "seumur hidup" terhad untuk early adopters |

### 6.2 Cadangan harga awal (perlu diuji)
| Pelan | Harga cadangan | Isi |
|-------|----------------|-----|
| Percuma | RM 0 | 3 permainan, 1 profil anak, laporan asas |
| Keluarga Bulanan | RM 14.90–19.90 | Semua permainan, 4 profil, laporan penuh, mod offline |
| Keluarga Tahunan | RM 119–149 (≈ 2 bulan percuma) | Sama + pek aktiviti cetak luar talian |
| Tadika/TASKA | RM 3–6 / murid / bulan (bil tahunan) | Dashboard guru, laporan kelas, pemetaan KP2026, akses ibu bapa |

**Logik harga:** Lebih murah daripada pesaing global (USD 7–15) tetapi tidak terlalu murah sehingga dilihat "murahan". Ujian harga A/B pada halaman pendaratan **sebelum** bina.

### 6.3 Metrik utama (North Star & sokongan)
- **North Star:** *Bilangan anak yang menamatkan ≥ 3 sesi bermakna seminggu* (bukan "minit dimainkan" — itu insentif salah).
- Pengaktifan: % ibu bapa yang lengkap profil anak + sesi pertama dalam 24 jam.
- Retention: D7 / D30, **churn bulanan < 6%** sasaran.
- Konversi percuma → berbayar: sasaran 3–5%.
- Pembukaan laporan mingguan oleh ibu bapa (proksi nilai).
- LTV : CAC ≥ 3 : 1.

---

## 7. Undang-Undang, Privasi & Polisi Stor App

| Perkara | Keperluan | Tindakan |
|---------|-----------|----------|
| **PDPA Malaysia (Pindaan 2024, Akta A1727)** | Berkuat kuasa berperingkat dari 2025: obligasi pemproses data, pemindahan rentas sempadan, penalti lebih tinggi, "data user" → "data controller". Draf peraturan 2025 cadangkan langkah pengesahan munasabah bila dapat persetujuan ibu bapa/penjaga. | Akaun **milik ibu bapa** sahaja; persetujuan jelas; dasar privasi BM/EN; pantau peraturan muktamad. Dapatkan nasihat peguam. |
| **COPPA (AS)** — jika ada pengguna AS | Pindaan berkuat kuasa penuh 22 Apr 2026: program keselamatan data bertulis, dasar penyimpanan data bertulis, persetujuan berasingan untuk pendedahan pihak ketiga, biometrik (suara/muka) = data peribadi. | Jika pasaran AS: elak rakaman suara/muka anak atau dapatkan persetujuan; tulis dasar keselamatan & retensi. |
| **Apple App Store – Kids Category** & **Google Play – Families Policy** | Sekatan ketat pada iklan, analitik pihak ketiga, pautan luar, pembelian; perlu parental gate. | Gunakan analitik first-party sahaja; tiada SDK iklan; semak polisi terkini sebelum hantar. |
| **Data minimum** | Kumpul hanya: nama panggilan anak (bukan penuh), tahun lahir, keputusan permainan. | Tiada lokasi, tiada foto anak, tiada chat. Enkripsi, penghapusan akaun sendiri. |

> ⚠️ Ini bukan nasihat undang-undang. Dapatkan peguam privasi Malaysia sebelum pelancaran.

---

## 8. Cadangan Seni Bina Teknikal (ringkas)

| Keputusan | Cadangan | Sebab | Alternatif |
|-----------|----------|-------|------------|
| Platform | **PWA (web) + bungkus ke stor** (Capacitor/TWA) | Satu kod asas, kemas kini segera, kos rendah; boleh offline via Service Worker | Flutter (prestasi animasi lebih baik, juga 1 kod asas); Unity (berlebihan untuk 2D ringkas) |
| Enjin permainan | **Canvas/SVG + Web Animations API**, atau PixiJS jika perlu prestasi | Minimal dependency, ringan pada fon murah | Phaser (lebih banyak ciri, lebih berat) |
| Seni bina permainan | **Enjin generik + kandungan data-driven (JSON)** | 1 enjin "isih kad" → banyak tema; skala kandungan tanpa kod baharu | Kod khusus setiap permainan (hutang teknikal tinggi) |
| Backend | Postgres (cth. Supabase) dengan **Row-Level Security** | Multi-tenant (keluarga / tadika), auth siap | Firebase |
| Multi-tenancy | `organization` (keluarga atau tadika) → `child_profile` → `session` → `attempt` | Sokong B2C & B2B dengan satu skema | Skema berasingan (sukar diselenggara) |
| Analitik | First-party (jadual sendiri), agregat | Patuh polisi Kids/Families & PDPA | SDK pihak ketiga ❌ |
| Audio | Rakaman suara manusia BM/EN (penutur asli, mesra kanak-kanak) | Kualiti & kepercayaan; TTS boleh untuk prototaip | TTS sepenuhnya (lebih murah, kurang mesra) |

---

## 9. Pelan Tindakan (Roadmap)

### Fasa 0 — Validasi (2–4 minggu) ⬅️ **mula di sini**
- [ ] Temu bual **20–30 ibu bapa** (umur anak 2–6): bila beri fon, app apa, apa yang dirisaukan, berapa sanggup bayar.
- [ ] Temu bual **5 pengusaha tadika/TASKA**: keperluan laporan, bajet, cara buat keputusan.
- [ ] Halaman pendaratan + senarai menunggu (waitlist) + ujian harga A/B (RM 14.90 vs RM 19.90).
- [ ] Prototaip kertas/Figma 2 permainan → uji dengan 5–10 kanak-kanak (dengan kebenaran ibu bapa).
- **Kriteria lulus:** ≥ 300 waitlist, ≥ 30% ibu bapa yang ditemu bual kata "akan bayar", ≥ 2 tadika setuju pilot.

### Fasa 1 — MVP (8–12 minggu)
- [ ] 8 permainan (§3 prioriti MVP), BM + EN, offline.
- [ ] Profil anak, kesukaran adaptif, had masa, parental gate.
- [ ] Papan pemuka ibu bapa + laporan mingguan.
- [ ] Langganan (Stripe / Billplz / stor app).

### Fasa 2 — B2B & Bukti (3–6 bulan)
- [ ] Dashboard guru + pemetaan KP2026.
- [ ] Pilot dengan 3–5 tadika; ukur pra/pasca (dengan kolaborasi ahli akademik).
- [ ] Penerbitan hasil → PR & kredibiliti.

### Fasa 3 — Skala
- [ ] Kandungan bulanan baharu (tema perayaan: Raya, CNY, Deepavali, Merdeka).
- [ ] Bahasa tambahan (Mandarin, Tamil, Arab asas) → pasaran Indonesia/Brunei/Singapura.

---

## 10. Risiko Utama & Mitigasi

| Risiko | Kebarangkalian | Impak | Mitigasi |
|--------|----------------|-------|----------|
| Dakwaan "merangsang minda" tanpa bukti → isu kepercayaan / dakwaan mengelirukan | Sederhana | Tinggi | Guna bahasa "dibina berdasarkan kajian" bukan "terbukti tingkatkan IQ"; jalankan kajian pilot sendiri |
| Ibu bapa tak sanggup bayar (pesaing percuma) | Tinggi | Tinggi | Validasi Fasa 0; B2B sebagai saluran kedua; nilai = laporan + BM + kepercayaan |
| Kos kandungan tinggi (seni, suara, animasi) | Tinggi | Sederhana | Enjin generik + kandungan JSON; gaya seni ringkas; fokus kualiti 8 permainan |
| Isu privasi / polisi stor ditolak | Sederhana | Tinggi | Privacy-by-design dari hari 1; semak polisi sebelum hantar |
| Pengkritik: "app = lebih masa skrin" | Tinggi | Sederhana | Had masa terbina, misi luar talian, sokong garis panduan WHO secara terbuka |
| Prestasi pada fon murah | Sederhana | Sederhana | Uji pada fon Android bajet; aset ringan; tiada 3D |

---

## 11. Soalan Terbuka (perlu jawapan anda / kajian lanjut)
1. Sasaran awal: **B2C ibu bapa** dulu, atau **B2B tadika** dulu? (Cadangan: B2C untuk produk, B2B pilot serentak untuk bukti.)
2. Identiti: neutral (semua kaum) atau ada pilihan kandungan Islamik? (Omar & Hana sudah kuasai niche Islamik.)
3. Bajet & pasukan: siapa buat seni dan suara?
4. Perlu dokumen rasmi KP2026 (KPM) untuk pemetaan tepat.
5. Data DOSM: bilangan kanak-kanak 3–6 tahun untuk anggaran TAM/SAM/SOM.

---

## Sumber

**Garis panduan masa skrin**
- [WHO 2019 – ringkasan (World Economic Forum)](https://weforum.org/stories/2019/04/who-recommends-one-hour-maximum-screen-time-per-day-for-under-5s)
- [WHO guidelines – Active for Life](https://activeforlife.com/world-health-guidelines/)
- [AAP: When Your Kids Should — and Shouldn't — Use Digital Media (Michigan Medicine)](https://www.michiganmedicine.org/childrens-health/aap-when-your-kids-should-and-shouldnt-use-digital-media)
- [AAP 2016 news release (ScienceDaily)](https://www.sciencedaily.com/releases/2016/10/161021093834.htm)

**Sains pembelajaran & reka bentuk app**
- [Hirsh-Pasek et al. – Putting Education in "Educational" Apps (APS)](https://www.psychologicalscience.org/publications/educational-apps.html)
- [New America – A New Framework to Identify Truly Educational Apps](https://www.newamerica.org/insights/new-framework-identify-truly-educational-apps/)
- [Meyer et al. – Kajian 100 app kanak-kanak (Journal of Children and Media)](https://informahealthcare.com/doi/abs/10.1080/17482798.2021.1882516)
- [ZERO TO THREE – Maximizing the Potential for Learning From Screen Experiences](https://www.zerotothree.org/resources/3005-maximizing-the-potential-for-learning-from-screen-experiences-in-early-childhood-what-the-research-says)
- [They can interact, but can they learn? Toddlers' transfer learning from touchscreens (SUNY)](https://researchconnect.suny.edu/en/publications/they-can-interact-but-can-they-learn-toddlers-transfer-learning-f/)
- [Frontiers in Psychology 2021 – contingency & touchscreen learning](https://www.frontiersin.org/articles/10.3389/fpsyg.2021.564479)
- [Radesky et al. 2022 – Manipulative Design in Children's Apps (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC9206186/)
- [Michigan Medicine – Design tricks used to monetize young children's app use](https://michiganmedicine.org/health-lab/design-tricks-commonly-used-monetize-young-childrens-app-use)

**Fungsi eksekutif, ruang, numerasi, literasi**
- [Rosas et al. 2019 – EF games in preschool (Frontiers in Psychology)](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2019.02024/epub)
- [Play-based preschool program improves EF (PsyPost)](https://www.psypost.org/preschool-program-uses-play-based-activities-to-improve-childrens-executive-function-language-and-motor-skills/)
- [Hardy 2022 – Impact of interactive apps on children's EF (Macquarie thesis)](https://figshare.mq.edu.au/articles/thesis/The_impact_of_interactive_apps_on_children_s_executive_function/19436210)
- [UW – No Touch Pig: PBS/Sesame inhibitory control game](https://faculty.washington.edu/alexisr/noTouchPig.pdf)
- [Verdine et al. – Spatial skills & early math (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC4107032)
- [University of Delaware – The building blocks of learning](https://www.udel.edu/udaily/2014/sep/playing-with-blocks-092613.html)
- [UW I-LABS – Spatial Skills and Early Math Ability](https://modules.ilabs.uw.edu/module/spatial-skills-and-reasoning/spatial-skills-and-early-math-ability/)
- [Benavides-Varela et al. 2020 – Digital math interventions meta-analysis](https://www.research.unipd.it/bitstream/11577/3345422/2/1-s2.0-S0360131520301512-main.pdf)
- [Early numeracy interventions meta-analysis (UMN)](https://experts.umn.edu/en/publications/the-effects-of-early-numeracy-interventions-for-students-in-presc/)
- [Technology-based phonological awareness meta-analysis (Education Sciences 2024, DOAJ)](https://doaj.org/article/02791a0ce29e411b84331b084c5cf75c)

**Konteks Malaysia**
- [Determinants of excessive screen time among children under five, Selangor](https://libmast.utm.my/Record/upm.eprints-100924)
- [IJERPH 2022 – Selangor screen time study](https://ideas.repec.org/a/gam/jijerp/v19y2022i6p3560-d773119.html)
- [JMIR 2021 – Parental barriers to reducing screen time, Petaling](https://www.jmir.org/2021/4/e25219)
- [UiTM 2021 – Preschoolers' smartphone exposure](https://ir.uitm.edu.my/46598/1/46598.pdf)
- [Berita Harian – KP2026 menggantikan KSPK](https://www.bharian.com.my/amp/rencana/lain-lain/2025/12/1488022/bhplus)

**Pesaing & pasaran**
- [Khan Academy Kids – pricing](https://www.khanacademy.org/kids/pricing)
- [Khan Academy blog – Best early learning apps](https://blog.khanacademy.org/?p=21481)
- [Lingokids – App Store](https://apps.apple.com/app/lingokids/id1002043426)
- [Sago Mini School review](https://toddler-games.pages.dev/review/sago-mini-school-light-learning-on-the-calmest-tablet-shelf-7-99-month)
- [Omar & Hana – App Store](https://apps.apple.com/sg/app/omar-hana/id1503903788)
- [Didi & Friends Classroom – App Store](https://apps.apple.com/us/app/id1620806231)
- [Marketintelo – Early Childhood Learning Apps Market](https://marketintelo.com/report/early-childhood-learning-apps-market)
- [Deep Market Insights – Preschool App Market](https://deepmarketinsights.com/report/preschool-app-market-research-report)

**Undang-undang**
- [Baker McKenzie – Malaysia PDPA Amendment Act 2024 to come into force](https://insightplus.bakermckenzie.com/bm/data-technology/malaysia-personal-data-protection-amendment-act-2024-to-come-into-force)
- [Baker McKenzie – Malaysia public consultation on PDP Regulations (2025)](https://www.bakermckenzie.com/en/insight/publications/alerts/2025/08/malaysia-public-consultation-on-the-personal-data-protection-regulations)
- [DFDL – Implementation of PDPA (Amendment) Act 2024](https://www.dfdl.com/insights/legal-and-tax-updates/malaysia-implementation-of-the-personal-data-protection-amendment-act-2024/)
- [Federal Register – Amended COPPA Rule (22 Apr 2025)](https://www.govinfo.gov/content/pkg/FR-2025-04-22/html/2025-05904.htm)
- [Davis Polk – COPPA new compliance obligations take effect](https://www.davispolk.com/insights/client-update/ftc-prioritizes-coppa-enforcement-new-compliance-obligations-take-effect)
