# GAME DESIGN - IoT: SIGNAL ZERO

## 1. Identitas Game

**Judul:** IoT: SIGNAL ZERO  
**Genre:** 2D Adventure RPG + Educational Quiz + Mystery  
**Perspektif:** 2D Top-Down  
**Target:** Smartphone portrait

Game dibuat dengan scope sederhana dan time-optimized agar dapat selesai cepat tanpa mengorbankan inti edukasi dan kompetisi.

## 2. Dunia

**NEXUS CITY** adalah kota pintar masa depan yang bergantung pada teknologi IoT.

Area naratif:

- Central Plaza
- Smart Home District
- IoT Laboratory
- Smart Farm
- Smart Factory
- Network Hub
- NEXUS CORE

Secara teknis tidak wajib membuat tujuh map terpisah. Gunakan satu map/world visual utama yang dibagi menjadi beberapa zona. Perpindahan zona memakai trigger zone, perubahan posisi kamera/area, atau state scene sederhana untuk mengurangi waktu pembuatan asset, map, dan kode tanpa mengubah alur cerita.

## 3. Cerita Utama

Pemain adalah teknisi muda yang baru memperoleh sertifikasi dasar IoT. Saat tiba di NEXUS CITY, terjadi gangguan besar pada jaringan IoT kota. Pemain membantu memperbaiki sistem melalui eksplorasi ringan, interaksi NPC, dan tantangan IoT.

Di akhir perjalanan, pemain mencapai NEXUS CORE dan menemukan bahwa SIGNAL ZERO merupakan pengujian terhadap pemahaman manusia mengenai teknologi yang mereka ciptakan. Story tetap linear dan singkat.

## 4. Karakter

### Protagonis

Teknisi muda dengan nama dari pemain.

### Dr. Aruna

Mentor dan pemberi misi utama.

### Bima

Teknisi lapangan.

### Naya

Data analyst.

### Tiko

Robot companion dan pendamping utama.

### Warga Kota

NPC pendukung seperlunya.

### Prioritas Asset Karakter

1. Player
2. Dr. Aruna
3. Bima/Naya/Tiko sesuai kebutuhan implementasi
4. Warga tidak wajib memiliki asset unik

Gunakan reuse visual sebanyak mungkin.

## 5. Struktur Misi

Game memiliki **5 misi utama** dan **10 soal**.

| Misi | Area | Fokus | Soal |
|---|---|---|---:|
| 1 | Smart Home | Sensor, actuator, automation | 2 |
| 2 | IoT Laboratory | Perangkat, microcontroller, I/O, komunikasi | 2 |
| 3 | Smart Farm | Sensor lingkungan, kelembapan, monitoring | 2 |
| 4 | Smart Factory | Industrial IoT, sensor, actuator, monitoring | 2 |
| 5 | Network Hub | Konektivitas, komunikasi, transmisi data | 2 |

Pola setiap misi:

```text
Masuk zona -> dialog singkat -> interaksi -> soal 1 -> feedback -> interaksi -> soal 2 -> penyelesaian -> lanjut
```

Tidak ada quest sampingan wajib.

## 6. Story Flow

```text
Prolog -> Central Plaza -> Misi 1 -> Misi 2 -> Misi 3 -> Misi 4 -> Misi 5 -> NEXUS CORE -> Final -> Ending
```

Story, quest, dialog, scene, dan soal tetap berada di data terpisah dari engine.

## 7. Dialog

Dialog pendek, linear, mudah dipahami, langsung mendukung quest, dan memberi konteks soal. Tidak ada branching dialogue.

## 8. Eksplorasi

Eksplorasi dikompres menjadi player movement, collision sederhana, interaction zone, NPC/object interaction, dan perpindahan zona. Tidak ada combat, open-world, inventory kompleks, puzzle eksplorasi kompleks, quest sampingan wajib, atau sistem item kompleks.

Eksplorasi berfungsi sebagai konteks story dan quiz, bukan sistem utama kompetisi.

## 9. Quiz

Total: **10 soal utama**. Semua pemain mendapat 10 soal yang sama, urutan yang sama, dan tingkat kesulitan yang sama.

Setiap soal memiliki:

- ID
- judul
- konteks/story
- pertanyaan
- 4 pilihan
- jawaban benar
- penjelasan
- tingkat kesulitan
- batas waktu

Kesulitan: Mudah, Sedang, dan Sulit. Distribusi serta bobot dikunci sebelum leaderboard digunakan.

## 10. HP

**HP awal: 7**

- Salah atau timeout mengurangi HP satu.
- HP minimum 0.
- HP 0 tidak menyebabkan Game Over.
- Pemain tetap menyelesaikan seluruh 10 soal.

## 11. Timer

Setiap soal: **45 detik**.

- Timer mulai saat soal aktif, berhenti saat jawaban dipilih, dan reset pada soal berikutnya.
- Timeout dianggap salah dan mengurangi HP.

### Speed Bonus

`Speed Bonus = 50 x (Sisa Waktu / 45)`

Timeout memberi speed bonus 0. Nilai dibulatkan ke bilangan bulat.

## 12. Score

### Base Score

| Kesulitan | Base |
|---|---:|
| Mudah | 100 |
| Sedang | 150 |
| Sulit | 200 |

### HP Bonus

`HP Bonus = 30 x (HP Saat Ini / 7)`

HP saat ini dihitung setelah HP diproses.

### Question Score

Jika benar:

`Question Score = Base Score + Speed Bonus + HP Bonus`

Jika salah/timeout, Question Score = 0.

Urutan perhitungan: tampilkan soal, timer berjalan, jawab/timeout, tentukan benar/salah, kurangi HP bila perlu, hitung speed bonus, hitung HP bonus, hitung score, tambahkan score, tampilkan feedback, lalu lanjut.

## 13. Ending

Ending ditentukan setelah 10 soal.

- **CITY SAVIOR** - Perfect
- **SYSTEM RESTORED** - Good
- **SIGNAL LOST** - Bad

Persentase berdasarkan skor maksimum aktual dari 10 soal. Threshold awal: Perfect >=85%, Good 60%-84.99%, Bad <60%.

## 14. Leaderboard

Urutan: Score DESC, Total Time ASC, lalu Timestamp ASC. Tampilkan Top 10 melalui Firebase Realtime Database.

Semua pemain menggunakan soal, urutan, tingkat kesulitan, timer, HP awal, dan formula yang sama.

## 15. UI/UX

Target utama: mobile portrait.

```text
MAIN MENU -> NAME INPUT -> EXPLORATION -> DIALOG -> INTERACTION / QUEST -> QUIZ -> FEEDBACK -> FINAL RESULT -> ENDING -> LEADERBOARD
```

Prinsip: touch-first, tombol besar, pilihan quiz vertikal, HUD sederhana, timer hanya saat quiz, tidak bergantung pada hover/keyboard, teks terbaca, kontras cukup, dan benar/salah tidak hanya dibedakan dengan warna.

Touch control eksplorasi dapat menggunakan directional control atau virtual joystick sederhana. Tidak muncul saat quiz.

## 16. Asset Scope Minimum - Final

Asset dibuat berdasarkan fungsi, bukan kelengkapan.

### Wajib

- 1 player
- NPC utama yang benar-benar muncul: Dr. Aruna dan Bima/Naya/Tiko sesuai kebutuhan story
- 1 map/world visual utama
- sekitar 5-8 objek/perangkat IoT penting
- sekitar 8-12 icon/UI sederhana
- asset dapat direuse sebanyak mungkin

### Audio minimum

- 1 BGM
- 1 SFX benar
- 1 SFX salah/timeout
- SFX tombol jika mudah

### Animasi minimum

- movement sederhana
- feedback jawaban
- feedback HP
- transition/fade sederhana

### Opsional jika waktu cukup

- variasi NPC
- dekorasi tambahan
- variasi bangunan
- efek lingkungan
- BGM per area
- voice
- ambience tambahan
- SFX khusus objek

### Strategi pembuatan asset

Jika lebih cepat, gunakan CSS, SVG, bentuk sederhana, atau reuse asset daripada membuat gambar baru.

## 17. Struktur Penyimpanan Asset

```text
assets/
|- images/
|  |- map.png
|  |- player.png
|  |- npc-aruna.png
|  |- npc-bima.png
|  |- npc-naya.png
|  |- tiko.png
|  `- iot/
|- icons/
`- sounds/
   |- bgm.mp3
   |- correct.mp3
   `- wrong.mp3
```

Tidak perlu membuat asset untuk setiap warga atau setiap zona.

## 18. Struktur Data

```text
data/
|- questions.js
|- characters.js
|- dialogues.js
|- quests.js
`- scenes.js
```

Engine hanya membaca data tersebut. Story, quest, dialog, scene, dan soal tidak di-hardcode sebagai konten utama di engine.

## 19. Prinsip Scope Time-Optimized

Jika waktu semakin sempit, pengorbanan dilakukan berurutan: dekorasi, variasi asset, audio tambahan, animasi tambahan, kompleksitas eksplorasi, NPC tambahan, lalu polish visual.

Jangan mengorbankan quiz, scoring, HP, timer, 10 soal, story utama, 5 misi, atau Firebase leaderboard.

Game harus tetap dapat dimainkan dari awal sampai ending.

## 20. Prinsip Desain Final

1. Edukasi tetap menjadi inti.
2. Quiz menyatu dengan problem-solving.
3. Penilaian objektif.
4. Semua pemain mendapat soal yang sama.
5. Eksplorasi sederhana.
6. Asset minimum.
7. Tidak ada combat.
8. Tidak ada open-world.
9. Tidak ada branching dialogue.
10. Tidak ada quest sampingan wajib.
11. Smartphone portrait menjadi target utama.
12. Visual cukup baik tanpa mengejar kompleksitas.
13. Waktu penyelesaian menjadi prioritas selama kualitas inti tetap terjaga.
