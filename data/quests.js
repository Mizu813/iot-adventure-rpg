"use strict";

// Lima misi utama mengikuti urutan dan fokus yang dikunci pada GAME-DESIGN.md.
const quests = Object.freeze([
  Object.freeze({
    id: "restore-smart-home",
    chapter: 1,
    order: 1,
    title: "RUMAH CERDAS",
    briefing: "Pulihkan otomasi Smart Home dengan memahami sensor, actuator, dan aturan otomatis.",
    sceneId: "smart-home",
    objective: Object.freeze({
      type: "answer-questions",
      questionIds: Object.freeze(["iot-001", "iot-002"]),
    }),
    rewards: Object.freeze({ xp: 100, badge: "HOME FIXER" }),
    completionDialogueId: "smart-home-complete",
    nextQuestId: "calibrate-iot-laboratory",
  }),

  Object.freeze({
    id: "calibrate-iot-laboratory",
    chapter: 1,
    order: 2,
    title: "LABORATORIUM TERHUBUNG",
    briefing: "Kalibrasi perangkat, microcontroller, input/output, dan komunikasi di IoT Laboratory.",
    sceneId: "iot-laboratory",
    objective: Object.freeze({
      type: "answer-questions",
      questionIds: Object.freeze(["iot-003", "iot-004"]),
    }),
    rewards: Object.freeze({ xp: 125, badge: "LAB TECH" }),
    completionDialogueId: "iot-laboratory-complete",
    nextQuestId: "monitor-smart-farm",
  }),

  Object.freeze({
    id: "monitor-smart-farm",
    chapter: 1,
    order: 3,
    title: "PANEN DATA",
    briefing: "Gunakan sensor lingkungan, kelembapan, dan monitoring untuk memulihkan Smart Farm.",
    sceneId: "smart-farm",
    objective: Object.freeze({
      type: "answer-questions",
      questionIds: Object.freeze(["iot-005", "iot-006"]),
    }),
    rewards: Object.freeze({ xp: 150, badge: "FARM MONITOR" }),
    completionDialogueId: "smart-farm-complete",
    nextQuestId: "stabilize-smart-factory",
  }),

  Object.freeze({
    id: "stabilize-smart-factory",
    chapter: 1,
    order: 4,
    title: "PABRIK STABIL",
    briefing: "Pulihkan monitoring Industrial IoT, sensor, dan actuator di Smart Factory.",
    sceneId: "smart-factory",
    objective: Object.freeze({
      type: "answer-questions",
      questionIds: Object.freeze(["iot-007", "iot-008"]),
    }),
    rewards: Object.freeze({ xp: 175, badge: "FACTORY GUARD" }),
    completionDialogueId: "smart-factory-complete",
    nextQuestId: "reconnect-network-hub",
  }),

  Object.freeze({
    id: "reconnect-network-hub",
    chapter: 1,
    order: 5,
    title: "JALUR TERAKHIR",
    briefing: "Pulihkan konektivitas, komunikasi, dan transmisi data di Network Hub.",
    sceneId: "network-hub",
    objective: Object.freeze({
      type: "answer-questions",
      questionIds: Object.freeze(["iot-009", "iot-010"]),
    }),
    rewards: Object.freeze({ xp: 250, badge: "SIGNAL ZERO" }),
    completionDialogueId: "network-hub-complete",
    nextQuestId: null,
  }),
]);