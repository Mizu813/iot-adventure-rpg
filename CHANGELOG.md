# Changelog

Semua perubahan penting pada proyek dicatat dalam berkas ini.

## 2026-08-12 -- STEP 8: Exploration Minimal

### Added

- Panel eksplorasi dengan satu world map visual yang menampilkan tujuh zona naratif NEXUS CITY.
- Kontrol gerak teknisi menggunakan tombol arah (touch/keyboard) dan keyboard arrow keys.
- Titik interaksi sinyal per zona dan tombol interaksi yang aktif hanya dalam jangkauan.
- Visual zona terkunci agar pemain tidak bisa melewati area yang belum dibuka.
- Data `mapZone` pada setiap scene dengan `spawnPoint` dan `interactionPoint` untuk perpindahan zona terkontrol.

## 2026-08-12 -- STEP 7: Story, Dialogue & Quest

### Added

- Alur kampanye linear melalui fase scene, eksplorasi, interaksi, dialog, quest, quiz, reward, dan ending.
- Dialog linear dari `data/dialogues.js` berdasarkan `dialogueId` scene.
- Integrasi quest dari `data/quests.js` dengan soal, target jawaban benar minimum, XP, dan badge.
- Panel story, interaction, dialog, quest, reward, dan ending yang dikontrol oleh `story-engine.js`.

### Fixed

- Mencegah duplikasi `completedQuestIds` dan `earnedBadges` pada reward.
- Score tidak lagi terhitung ganda ketika pemain mengulang quest yang gagal.

## 2026-08-12 -- STEP 6: Progress & HUD

### Added

- HUD quiz lengkap dengan score, misi aktif, HP visual, progress 0/10 sampai 10/10, dan timer kondisional.
- Lookup misi dari `data/quests.js` berdasarkan `missionId` soal aktif.
- Indikator HP berupa pip 7 segment dengan peringatan visual saat HP rendah dan timer kritis.

### Changed

- Progress HUD memakai jumlah soal selesai, bukan nomor soal aktif.
- Timer hanya tampil saat fase jawab soal; disembunyikan saat feedback dan hasil.

## 2026-08-12 -- STEP 5: HP, Timer 45 Detik, dan Scoring

### Added

- HP quiz dengan nilai awal/maksimum 7, minimum 0, serta quiz tetap berlanjut ketika HP mencapai 0.
- Timer 45 detik per soal yang berhenti saat jawaban diproses dan reset saat berpindah soal.
- Speed bonus menggunakan `50 x (sisa waktu / 45)` dan HP bonus menggunakan `30 x (HP saat ini / 7)` setelah hasil jawaban diproses.
- Feedback khusus untuk jawaban benar, salah, dan waktu habis, termasuk perubahan HP atau bonus score.

### Fixed

- Proteksi state untuk mencegah jawaban dan timeout diproses dua kali pada soal yang sama atau timer berjalan ganda.
- Audit STEP 4 dikonfirmasi aman; tidak ada perubahan arsitektur core quiz yang tidak diperlukan.
- Seluruh 10 soal IoT disesuaikan dengan konteks siswa SMA, pilihan yang lebih masuk akal, dan penjelasan ringkas.

## 2026-08-11 -- STEP 4: Core Quiz Engine

### Added

- Engine quiz berbasis state untuk memulai kuis, memproses satu jawaban, menghitung base score, dan menampilkan hasil setelah 10 soal.
- Tampilan quiz mobile dengan konteks, 4 pilihan jawaban, feedback, dan tombol soal berikutnya.
- Penanganan aman untuk data kosong atau tidak valid, difficulty tidak dikenal, klik ganda, penggantian jawaban, dan index soal terakhir.
- Salinan `ROADMAP.md` dan `GAME-DESIGN.md` sebagai source of truth di folder proyek.

### Fixed

- Data STEP 3 diselaraskan dengan desain final: NPC utama, 5 area misi, urutan story, schema soal, difficulty, dan batas waktu.

## 2026-08-11 -- STEP 3: Game Content

### Added

- Lima karakter utama untuk campaign pembuka NEXUS CITY.
- Tujuh zona naratif, dua belas rangkaian dialog, lima misi berurutan, dan sepuluh soal edukasi IoT tingkat SMA.
- Skema data yang seragam untuk objective misi, hadiah, urutan pembukaan scene, dan dialog penyelesaian.

## 2026-08-11 -- STEP 2: Main UI

### Added

- Main menu mobile untuk IoT: SIGNAL ZERO.
- Form callsign dengan validasi dan tombol Start Game.
- Tombol leaderboard serta respons status sementara.

## 2026-08-11 -- STEP 1: Project Foundation

### Added

- Struktur proyek statis untuk IoT: SIGNAL ZERO.
- Halaman HTML5 placeholder dengan viewport mobile.
- Koneksi stylesheet dan JavaScript Vanilla.
- Placeholder Firebase dan lima berkas data game.
- Direktori aset untuk images, sounds, dan icons.
- Dokumentasi awal serta status proyek.
