// Firebase configuration for LoveLock
// ⚠️ SETUP INSTRUCTIONS:
// 1. Go to https://console.firebase.google.com
// 2. Create a new project (name: LoveLock)
// 3. Go to Realtime Database → Create Database → Start in TEST MODE
// 4. Go to Project Settings → Your apps → Web (</>)  → Register app
// 5. Copy your config values below

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getDatabase, ref, push, onValue, set, onDisconnect, remove, get } from 'firebase/database';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyBCd-AkyiKxqH-JJ4GpcqqdvK1emA58uY0",
  authDomain: "lovelock-4dc25.firebaseapp.com",
  databaseURL: "https://lovelock-4dc25-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "lovelock-4dc25",
  storageBucket: "lovelock-4dc25.firebasestorage.app",
  messagingSenderId: "541787436376",
  appId: "1:541787436376:web:e7b7eff98e4a9a7659612d",
  measurementId: "G-7T0646CDS5"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
const db = getDatabase(app);

let messaging = null;
try {
  messaging = getMessaging(app);
} catch (e) {
  console.log("Firebase Messaging not supported", e);
}

// Generate a 6-digit room code
export function generateRoomCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Create a new room
export async function createRoom(code, userName) {
  const roomRef = ref(db, `rooms/${code}`);
  await set(roomRef, {
    createdAt: Date.now(),
    users: { host: userName }
  });
  // Clean up room on disconnect
  onDisconnect(ref(db, `rooms/${code}/users/host`)).remove();
  return code;
}

// Join an existing room
export async function joinRoom(code, userName) {
  const roomRef = ref(db, `rooms/${code}`);
  const snapshot = await get(roomRef);
  if (!snapshot.exists()) return null;
  await set(ref(db, `rooms/${code}/users/guest`), userName);
  onDisconnect(ref(db, `rooms/${code}/users/guest`)).remove();
  return snapshot.val();
}

// Listen to room users
export function onRoomUsers(code, callback) {
  const usersRef = ref(db, `rooms/${code}/users`);
  return onValue(usersRef, (snap) => callback(snap.val() || {}));
}

// Send chat message
export function sendMessage(code, msg) {
  const chatRef = ref(db, `rooms/${code}/chat`);
  push(chatRef, { ...msg, time: Date.now() });
}

// Listen to chat messages
export function onMessages(code, callback) {
  const chatRef = ref(db, `rooms/${code}/chat`);
  return onValue(chatRef, (snap) => {
    const data = snap.val();
    callback(data ? Object.values(data).sort((a, b) => a.time - b.time) : []);
  });
}

// Send drawing stroke
export function sendStroke(code, stroke) {
  const drawRef = ref(db, `rooms/${code}/drawing`);
  push(drawRef, stroke);
}

// Listen to drawing strokes
export function onStrokes(code, callback) {
  const drawRef = ref(db, `rooms/${code}/drawing`);
  return onValue(drawRef, (snap) => {
    const data = snap.val();
    callback(data ? Object.values(data) : []);
  });
}

// Clear drawing
export function clearDrawing(code) {
  remove(ref(db, `rooms/${code}/drawing`));
}

// Set current music
export function setMusic(code, music) {
  set(ref(db, `rooms/${code}/music`), music);
}

// Listen to music changes
export function onMusic(code, callback) {
  return onValue(ref(db, `rooms/${code}/music`), (snap) => callback(snap.val()));
}

export { db, ref, set, get, onValue, messaging, getToken, onMessage, signInWithPopup, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, onDisconnect };
