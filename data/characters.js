"use strict";

// Asset fisik diintegrasikan pada STEP 9; assetKey menjaga data tidak merujuk berkas yang belum ada.
const characters = Object.freeze([
  Object.freeze({
    id: "player",
    name: "PLAYER",
    role: "TEKNISI MUDA",
    accent: "lime",
    assetKey: "player",
    description: "Teknisi muda NEXUS CITY. Nama tampilnya diisi dari callsign pemain.",
  }),
  Object.freeze({
    id: "aruna",
    name: "DR. ARUNA",
    role: "MENTOR DAN MISSION LEAD",
    accent: "amber",
    assetKey: "npc-aruna",
    description: "Mentor yang memandu pemulihan sistem IoT NEXUS CITY.",
  }),
  Object.freeze({
    id: "bima",
    name: "BIMA",
    role: "TEKNISI LAPANGAN",
    accent: "teal",
    assetKey: "npc-bima",
    description: "Teknisi lapangan yang memahami perangkat IoT di berbagai zona kota.",
  }),
  Object.freeze({
    id: "naya",
    name: "NAYA",
    role: "DATA ANALYST",
    accent: "blue",
    assetKey: "npc-naya",
    description: "Analis data yang memeriksa pembacaan sensor dan konektivitas sistem.",
  }),
  Object.freeze({
    id: "tiko",
    name: "TIKO",
    role: "ROBOT COMPANION",
    accent: "coral",
    assetKey: "tiko",
    description: "Robot pendamping yang memberi petunjuk singkat selama misi.",
  }),
]);
