"use strict";

// Dialog linear disimpan per ID agar story tetap terpisah dari engine.
const dialogues = Object.freeze({
  "prologue-central-plaza": Object.freeze([
    Object.freeze({ speakerId: "aruna", text: "SELAMAT DATANG DI NEXUS CITY, TEKNISI. JARINGAN IoT KOTA SEDANG MENGALAMI GANGGUAN BERANTAI." }),
    Object.freeze({ speakerId: "aruna", text: "LIMA ZONA MEMERLUKAN BANTUAN. KITA MULAI DARI SMART HOME DISTRICT." }),
  ]),
  "smart-home-arrival": Object.freeze([
    Object.freeze({ speakerId: "bima", text: "LAMPU DAN KIPAS RUMAH CERDAS TIDAK MERESPONS KONDISI RUANGAN. PERIKSA SENSOR DAN AKTUATORNYA." }),
  ]),
  "smart-home-complete": Object.freeze([
    Object.freeze({ speakerId: "tiko", text: "SMART HOME KEMBALI OTOMATIS. LANJUTKAN KE IoT LABORATORY." }),
  ]),
  "iot-laboratory-arrival": Object.freeze([
    Object.freeze({ speakerId: "naya", text: "MIKROKONTROLER LAB TIDAK MENERIMA INPUT DENGAN BENAR. KITA PERLU MEMERIKSA PERAN PERANGKAT DAN I/O." }),
  ]),
  "iot-laboratory-complete": Object.freeze([
    Object.freeze({ speakerId: "aruna", text: "LABORATORIUM SUDAH TERKALIBRASI. SEKARANG SENSOR SMART FARM MEMBUTUHKAN PEMANTAUAN." }),
  ]),
  "smart-farm-arrival": Object.freeze([
    Object.freeze({ speakerId: "bima", text: "TANAMAN KEKURANGAN AIR, TETAPI POMPA BELUM MENERIMA KEPUTUSAN YANG TEPAT. BACA DATA LINGKUNGANNYA." }),
  ]),
  "smart-farm-complete": Object.freeze([
    Object.freeze({ speakerId: "tiko", text: "KELEMBAPAN TANAH SUDAH TERCATAT DENGAN BENAR. SINYAL BERIKUTNYA BERASAL DARI SMART FACTORY." }),
  ]),
  "smart-factory-arrival": Object.freeze([
    Object.freeze({ speakerId: "naya", text: "MONITORING MESIN MENUNJUKKAN GETARAN TIDAK WAJAR. KITA PERLU MEMBEDAKAN DETEKSI KONDISI DAN TINDAKAN MESIN." }),
  ]),
  "smart-factory-complete": Object.freeze([
    Object.freeze({ speakerId: "aruna", text: "SISTEM PABRIK STABIL. HANYA NETWORK HUB YANG MASIH MEMISAHKAN KITA DARI NEXUS CORE." }),
  ]),
  "network-hub-arrival": Object.freeze([
    Object.freeze({ speakerId: "naya", text: "DATA DARI SEMUA ZONA BELUM SAMPAI KE PUSAT. PERIKSA CARA PERANGKAT BERKOMUNIKASI DAN MENGIRIM PESAN." }),
  ]),
  "network-hub-complete": Object.freeze([
    Object.freeze({ speakerId: "tiko", text: "JALUR DATA TELAH PULIH. AKSES KE NEXUS CORE TERBUKA." }),
  ]),
  "nexus-core-final": Object.freeze([
    Object.freeze({ speakerId: "aruna", text: "SIGNAL ZERO BUKAN SERANGAN. INI ADALAH PENGUJIAN TERHADAP CARA MANUSIA MEMAHAMI TEKNOLOGI YANG MEREKA BANGUN." }),
    Object.freeze({ speakerId: "tiko", text: "LIMA ZONA STABIL. NEXUS CITY KEMBALI TERHUBUNG." }),
  ]),
});
