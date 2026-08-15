# PROJECT STATE -- IoT: SIGNAL ZERO

## Current Step

**STEP 3 - Quiz UI**

Status: **SELESAI / LOCKED**

## Status Langkah

- STEP 0A -- Finalisasi Konsep: SELESAI / LOCKED
- STEP 0B -- Game Design: SELESAI / LOCKED
- STEP 0C -- UI/UX: SELESAI / LOCKED
- STEP 0D -- Asset Plan: SELESAI / LOCKED
- STEP 1 -- Project Foundation: SELESAI / LOCKED
- STEP 2 -- Main UI: SELESAI / LOCKED
- STEP 3 -- Game Content: SELESAI / LOCKED
- STEP 4 -- Core Quiz Engine: SELESAI / LOCKED
- STEP 5 -- HP & Timer: SELESAI / LOCKED
- STEP 6 -- Progress & HUD: SELESAI / LOCKED
- STEP 7 -- Story, Dialogue & Quest: SELESAI / LOCKED
- STEP 8 -- Exploration Minimal: SELESAI / LOCKED
- STEP 1 (Typography + UI System): SELESAI / LOCKED
- STEP 2 (Exploration HUD/Layout): SELESAI / LOCKED
- STEP 3 (Quiz UI): SELESAI / LOCKED

## Keputusan Terkunci

- Judul: **IoT: SIGNAL ZERO**
- Teknologi: HTML5, CSS3, Vanilla JavaScript, Firebase Realtime Database
- Target utama: smartphone portrait
- Konten game disimpan terpisah dari engine pada direktori `data/`
- Konten game tetap berada pada direktori `data/`; engine hanya membacanya.
- STEP 4 telah diaudit; core quiz, answer lock, feedback, score, dan next question aman. Timer, HP, Firebase, dan leaderboard backend berada di luar STEP 4.
- HP awal dan maksimum adalah 7, dengan minimum 0. HP 0 tidak menghentikan quiz.
- Setiap soal memiliki timer 45 detik. Jawaban salah atau timeout mengurangi HP satu.
- Score benar memakai base score berdasarkan difficulty, speed bonus `50 x (sisa waktu / 45)`, dan HP bonus `30 x (HP saat ini / 7)` setelah hasil jawaban diproses.

## Hasil STEP 1 (Project Foundation)

- Struktur folder utama, aset, dan data telah dibuat.
- Halaman placeholder dapat dibuka tanpa proses build.
- CSS dan JavaScript terhubung ke halaman.
- Berkas Firebase dan data tersedia sebagai placeholder kosong.

## Hasil STEP 2

- Main menu mobile untuk memasukkan callsign, memulai game, dan membuka leaderboard telah dibuat.
- Validasi callsign dasar dan status UI telah tersedia.

## Hasil STEP 3

- Campaign mengikuti desain final: 5 karakter, 7 zona naratif, 5 misi berurutan, 10 soal IoT level SMA, serta dialog linear.
- Setiap soal memiliki urutan, judul, konteks, 4 pilihan, jawaban benar, penjelasan, difficulty, dan batas waktu 45 detik sebagai data.

## Hasil STEP 4

- Core quiz engine membaca soal langsung dari `data/questions.js` dan memvalidasi kontrak datanya sebelum kuis dimulai.
- Quiz menampilkan konteks, nomor soal, pertanyaan, tepat 4 pilihan, feedback, base score, dan hasil setelah soal ke-10.
- Jawaban dikunci setelah dipilih; klik ganda, penggantian jawaban, soal kosong, index di luar batas, dan difficulty tidak dikenal ditangani aman.

## Hasil STEP 5

- HP awal = 7, HP maksimum = 7, dan HP minimum = 0.
- Jawaban salah dan timeout mengurangi HP satu; HP 0 bukan Game Over sehingga seluruh 10 soal tetap dapat diselesaikan.
- Timer 45 detik dimulai untuk setiap soal, berhenti ketika jawaban diproses, dan reset pada soal berikutnya.
- Proteksi state mencegah jawaban dan timeout memproses soal lebih dari sekali atau menjalankan timer ganda.
- HP bonus memakai HP setelah jawaban diproses (`30 x (HP / 7)`); speed bonus benar memakai sisa waktu dibagi 45.
- Sepuluh soal direvisi dengan bahasa yang sesuai siswa SMA, konteks IoT sehari-hari, pilihan yang lebih plausibel, dan penjelasan singkat.
- Audit STEP 4 dan pengujian engine untuk STEP 5 berhasil: answer/timeout hanya memproses soal satu kali, HP tidak negatif, timer reset, dan 10 soal dapat diselesaikan.

## Hasil STEP 6

- HUD quiz menampilkan score, misi aktif, HP visual, progress 0/10 sampai 10/10, dan timer hanya saat fase jawab soal.
- Misi aktif diambil dari `data/quests.js` berdasarkan `missionId` soal yang sedang atau terakhir diproses.
- Progress menggunakan jumlah soal selesai (`quizProgress`), bukan nomor soal aktif.
- Timer disembunyikan saat feedback dan hasil; tetap terlihat saat soal aktif dan belum terkunci.
- Indikator HP memakai pip visual 7 segment dengan peringatan visual saat HP rendah dan timer kritis.

## Hasil STEP 7

- Alur kampanye linear mengikuti `Scene -> Exploration -> Interaction -> Dialog -> Quest -> Quiz -> Reward -> Scene berikutnya`.
- Dialog linear dibaca dari `data/dialogues.js` berdasarkan `dialogueId` scene; tidak ada branching dialogue.
- Quest diambil dari `data/quests.js` berdasarkan `sceneId`; setiap quest memiliki soal, jumlah jawaban benar minimum, XP, dan badge.
- Reward mencegah duplikasi `completedQuestIds` dan `earnedBadges` jika fungsi dipanggil ulang.
- Percobaan ulang quest mengembalikan score ke nilai sebelum misi dimulai, sehingga score tidak terhitung ganda.
- Panel story, interaction, dialog, quest, reward, dan ending ditampilkan secara kondisional melalui `story-engine.js` dan `app.js`.

## Hasil STEP 8

- Ditambahkan panel eksplorasi sederhana dengan satu world map visual yang menampilkan tujuh zona naratif.
- Pemain dapat menggerakkan teknisi dengan tombol arah (touch/keyboard) menuju titik interaksi zona aktif.
- Zona yang terkunci ditandai secara visual dan tidak dapat dilewati pemain.
- Tombol interaksi aktif hanya ketika pemain berada dalam jangkauan titik sinyal zona aktif.
- Setiap scene memiliki `mapZone` dengan `spawnPoint` dan `interactionPoint` agar perpindahan zona tetap terkontrol.
- Engine eksplorasi tidak membuat map terpisah; cukup satu peta utama dengan zona-zona berbatas.

## Hasil STEP 1 (Typography + UI System)

- Sistem typography scale dengan 8 tingkat ukuran font (--font-size-xs hingga --font-size-3xl) untuk keterbacaan mobile optimal.
- Sistem spacing scale dengan 6 tingkat (--spacing-xs hingga --spacing-2xl) untuk konsistensi padding dan gap.
- Sistem border radius dengan 4 tingkat (--radius-sm, --radius-md, --radius-lg, --radius-full) untuk UI yang lebih modern.
- Sistem warna terpusat dengan CSS custom properties (--color-bg, --color-text, --color-accent-*) untuk konsistensi tema.
- Font size body ditingkatkan dari 14px ke 15px (--font-size-base: 0.9375rem) untuk keterbacaan mobile.
- Border radius diterapkan pada button, input, card, panel, dan komponen UI lainnya.
- Text-transform uppercase dan letter-spacing ditambahkan pada label, eyebrow, dan elemen kecil untuk hierarki visual.
- Font-weight 600 ditambahkan pada question-prompt untuk emphasis.
- Padding dan gap distandarisasi menggunakan spacing scale di seluruh komponen.
- Antialiasing font diaktifkan untuk rendering text yang lebih halus di mobile.
- Tidak ada perubahan pada gameplay, scoring, HP, timer, Firebase, story, atau struktur data.
- Semua fitur existing tetap berfungsi; game tetap runnable.

## Hasil STEP 2 (Exploration HUD/Layout)

- HUD quiz dibuat lebih compact dengan grid layout 2 baris: misi aktif di atas, stats (HP, progress, timer) di bawah.
- Grid stats menggunakan 3 kolom equal width (repeat(3, 1fr)) untuk distribusi ruang yang efisien.
- Font size label dan value HUD diperkecil ke var(--font-size-xs) untuk menghemat ruang vertikal.
- HP pips diperkecil dari 0.72rem ke 0.55rem dengan gap 0.15rem untuk footprint lebih kecil.
- Story panel padding dikurangi dari var(--spacing-xl) var(--spacing-lg) ke var(--spacing-lg) var(--spacing-md).
- Story exploration panel mendapat padding khusus (top/bottom var(--spacing-md)) untuk ruang map lebih luas.
- World map min-height dikurangi dari 25rem ke 20rem untuk memberi ruang lebih pada area bermain.
- Movement joystick diperkecil dari 4.25rem ke 3.75rem, thumb dari 1.75rem ke 1.5rem.
- Story controls alignment diubah dari flex-end ke center untuk konsistensi visual.
- Interaksi button di exploration panel menggunakan flex: 1 dengan height 3rem untuk proporsi lebih baik.
- Tidak ada perubahan pada movement, collision, quest, scoring, HP logic, timer, quiz, Firebase, story, atau data.
- Semua fitur existing tetap berfungsi; game tetap runnable.

## Hasil STEP 3 (Quiz UI)

- Tampilan quiz dibuat lebih modern dan bersih dengan hierarchy visual yang jelas: konteks → judul → pertanyaan → pilihan.
- Quiz context menggunakan font-size-xs, color-text-dim, letter-spacing 0.06em untuk subtle context indicator.
- Quiz title menggunakan font-size-sm, color-accent-amber, letter-spacing 0.04em untuk emphasis sedang.
- Question prompt tetap menggunakan font-size-lg dengan font-weight 600 untuk readability optimal.
- Pilihan jawaban dibuat seperti card/button dengan border 2px, background color-bg-card, box-shadow, dan min-height 4.25rem.
- Choice label diperbesar ke 2.25rem dengan background rgba teal, border 2px, dan flex-shrink 0 untuk konsistensi.
- Choice text menggunakan font-weight 500 untuk keterbacaan lebih baik.
- Hover state pada choice button menambahkan translateY(-1px) dan box-shadow untuk feedback tactile.
- Feedback benar/salah diperjelas dengan: border color, background tint, box-shadow ring, dan choice-label fill.
- Feedback panel mendapat is-correct/is-incorrect class dengan border color, background tint, dan status indicator dot.
- Feedback status menggunakan pseudo-element (::before) dengan dot indicator berwarna sesuai hasil.
- Feedback explanation font-size ditingkatkan ke font-size-base untuk keterbacaan mobile.
- Result panel mendapat padding consistent dan margin pada heading/summary.
- Tidak ada perubahan pada logic quiz, HP, timer 45 detik, scoring, urutan soal, atau data soal.
- Tidak ada perubahan pada Firebase, story, exploration, atau fitur lain.
- Semua fitur existing tetap berfungsi; game tetap runnable.

## Batasan STEP Berikutnya

STEP 9 dapat mengintegrasikan asset minimum (player, NPC, objek IoT, map visual). Integrasi Firebase tetap berada pada STEP 11.
