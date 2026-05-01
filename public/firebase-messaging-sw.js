importScripts('https://www.gstatic.com/firebasejs/11.6.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.6.0/firebase-messaging-compat.js');

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

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/vite.svg'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
