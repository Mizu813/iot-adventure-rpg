# ROADMAP - IoT ADVENTURE RPG

## A. Target Akhir

Membuat game **2D IoT Adventure RPG berbasis browser** yang dapat dimainkan terutama di smartphone portrait.

Konsep inti:

- 2D exploration ringan
- player movement
- NPC dan dialog
- quest / misi
- story
- quiz IoT dengan 10 soal utama
- HP / nyawa, timer, score, progress, reward, dan ending
- Firebase Realtime Database, live leaderboard, dan Vercel hosting

### Prinsip scope

Proyek diprioritaskan untuk selesai secepat mungkin. Inti edukasi, 10 soal, scoring objektif, HP, timer, story utama, 5 misi, eksplorasi sederhana, dan leaderboard dipertahankan. Asset, map, NPC, quest, audio, animasi, responsive target, dan QA multi-device dikompres sesuai kebutuhan. Tidak membuat fitur di luar kebutuhan inti.

## B. Teknologi

- HTML5
- CSS3
- Vanilla JavaScript
- Firebase Realtime Database
- Google Fonts
- Vercel

Tidak menggunakan framework atau library lain.

## C. Prinsip Pengembangan

Manusia menentukan konsep, story, gameplay, quest, materi IoT, dan keputusan desain. Codex mengerjakan HTML, CSS, JavaScript, game engine, dialog, exploration sederhana, quiz, timer, HP, score, Firebase, leaderboard, mobile UI, dan debugging. AI Asset membantu membuat asset minimum. Manusia melakukan validasi materi, pengujian smartphone, dan final approval.

## D. Tahap Desain

### STEP 0A - Finalisasi Konsep

**SELESAI / LOCKED**

### STEP 0B - Game Design

**SELESAI / LOCKED**

Story, dunia, misi, quiz, scoring, HP, timer, ending, dan leaderboard telah ditentukan.

### STEP 0C - UI/UX

**SELESAI / LOCKED**

UI mobile-first dan touch-first telah ditentukan.

### STEP 0D - Asset Plan

Menentukan asset minimum yang diperlukan agar game dapat selesai cepat.

## E. Implementasi - Versi Time-Optimized

### STEP 1 - Project Foundation

Struktur minimum:

```text
iot-adventure-quiz/
|- index.html
|- style.css
|- app.js
|- firebase.js
|- data/
|  |- questions.js
|  |- characters.js
|  |- dialogues.js
|  |- quests.js
|  `- scenes.js
|- assets/
|  |- images/
|  |- sounds/
|  `- icons/
`- README.md
```

Target: project dapat dibuka, halaman awal tampil, dan tidak ada framework tambahan.

### STEP 2 - Main UI

Implementasikan judul, input nama, Start Game, Leaderboard, style retro RPG + futuristic IoT, dan mobile portrait. Tidak membuat versi desktop terpisah.

### STEP 3 - Game Data

Pisahkan data dari engine dalam `questions.js`, `characters.js`, `dialogues.js`, `quests.js`, dan `scenes.js`.

Minimal: 10 soal, 5 misi, NPC utama, dialog singkat, dan scene/zona utama.

### STEP 4 - Core Quiz Engine

Implementasikan lebih dahulu karena merupakan inti game:

- scene/context
- question
- 4 choices
- answer lock
- score
- feedback
- next question

### STEP 5 - HP & Timer

Implementasikan HP awal 7, salah/timeout mengurangi HP satu, HP minimum 0, game tetap berjalan sampai 10 soal, timer 45 detik, dan timeout dianggap salah. Speed bonus menggunakan sisa waktu dibagi 45 detik.

### STEP 6 - Progress & HUD

Implementasikan HP, score, mission, question progress, timer saat quiz, dan progress 0/10 sampai 10/10.

### STEP 7 - Story, Dialogue & Quest

Implementasikan alur linear:

```text
Scene -> NPC / Object -> Dialog -> Quest -> Quiz -> Reward / Progress -> Scene berikutnya
```

Tidak membuat dialog bercabang. Quest menggunakan pola sederhana dan dapat digunakan ulang.

### STEP 8 - Exploration Minimal

Target hanya player movement, collision sederhana, interaction zone, NPC/object interaction, dan perpindahan zona.

Gunakan satu map/world visual utama yang dibagi menjadi Central Plaza, Smart Home, IoT Laboratory, Smart Farm, Smart Factory, Network Hub, dan NEXUS CORE. Tidak membuat tujuh map terpisah atau open-world.

### STEP 9 - Asset Integration

Gunakan asset minimum: satu player, NPC utama yang diperlukan, satu map utama, beberapa objek IoT penting, dan icon/UI sederhana. Gunakan CSS/SVG untuk elemen sederhana jika lebih cepat.

### STEP 10 - Audio & Animation Minimum

Audio minimum: satu BGM dan 2-4 SFX penting. Animasi minimum: movement sederhana, feedback jawaban, feedback HP, dan transition/fade sederhana. Tidak membuat cutscene atau animasi kompleks.

### STEP 11 - Firebase

Implementasikan player name, score, total time, timestamp, save result, dan read leaderboard.

### STEP 12 - Leaderboard

Urutan leaderboard: Score DESC, Total Time ASC, lalu Timestamp ASC. Tampilkan Top 10 melalui Firebase Realtime Database.

### STEP 13 - Mobile QA

Fokus pada smartphone portrait, touch interaction, layout, quiz, timer, HP, score, story, dan leaderboard. Desktop hanya sanity check bila mudah dilakukan.

### STEP 14 - Optimasi Ringan

Periksa console error, asset loading, event listener, fungsi penting, kode duplikat, dan performa dasar. Tidak melakukan refactor besar yang tidak diperlukan.

### STEP 15 - Deployment

Deploy ke Vercel. GitHub digunakan bila diperlukan untuk workflow deployment.

### STEP 16 - Final QA

Uji alur penuh: Main Menu -> Exploration -> Dialog -> 10 soal -> Result -> Ending -> Leaderboard. Pastikan scoring, HP, timer, leaderboard, dan console error benar.

## F. Aturan STEP

Setiap STEP:

1. Baca `ROADMAP.md`.
2. Baca `PROJECT-STATE.md`.
3. Kerjakan hanya STEP aktif.
4. Jangan melompat STEP.
5. Test.
6. Jika bug ditemukan, hentikan fitur baru dan perbaiki bug.
7. Update `PROJECT-STATE.md`.
8. Setelah STEP selesai, STOP.

Setiap STEP harus menghasilkan project yang tetap runnable.

## G. Definisi STEP Selesai

STEP selesai jika fitur berjalan, tidak ada error kritis, fitur sebelumnya tetap bekerja, sesuai scope, project dapat dijalankan, dan `PROJECT-STATE.md` diperbarui.

## H. Prioritas Waktu

1. Core quiz dan scoring
2. HP dan timer
3. Story/dialog/quest
4. Exploration sederhana
5. Firebase leaderboard
6. Asset visual
7. Audio/animasi
8. Polishing

Jika waktu semakin sempit, fitur pada bagian bawah dikompres lebih dahulu. Jangan mengorbankan objektivitas scoring atau kemampuan menyelesaikan 10 soal demi visual polish.
