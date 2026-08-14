"use strict";

const firebaseConfig = Object.freeze({
  apiKey: "AIzaSyBYpXGJ4rfU2BzQsTpw6LkkcwPwLjICYfA",
  authDomain: "iot-signal-zero.firebaseapp.com",
  databaseURL: "https://iot-signal-zero-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "iot-signal-zero",
  storageBucket: "iot-signal-zero.firebasestorage.app",
  messagingSenderId: "850178839060",
  appId: "1:850178839060:web:a4115c69d9f767dc06cd01",
});

firebase.initializeApp(firebaseConfig);

const firebaseDatabase = firebase.database();

async function saveGameResult(result) {
  if (!result || typeof result !== "object") {
    throw new Error("DATA HASIL GAME TIDAK VALID.");
  }

  const resultReference = firebaseDatabase.ref("results").push();

  await resultReference.set({
    name: result.name,
    score: result.score,
    totalTime: result.totalTime,
    timestamp: firebase.database.ServerValue.TIMESTAMP,
  });

  return resultReference.key;
}