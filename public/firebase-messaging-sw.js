importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');
import { initializeApp } from "firebase/app";

// 🚀 حط القيم بتاعتك هنا كنصوص صريحة بين علامات التنصيص
const firebaseConfig = {
  apiKey: "AIzaSyDOIIqvFAMZ_QG_5GW240rlt_74rok5-XA",
  authDomain: "rawasi-platform.firebaseapp.com",
  projectId: "rawasi-platform",
  storageBucket: "rawasi-platform.firebasestorage.app",
  messagingSenderId: "440733155952",
  appId: "1:440733155952:web:1464874f0fa90040cb6ab5"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// 🚀 استقبال الإشعار والموقع مقفول وعرضه بشكل احترافي
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icons/icon-192x192.png', // الأيقونة اللي عملناها
    badge: '/icons/icon-192x192.png',
    data: payload.data // عشان يوجه المستخدم صح لما يدوس
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// 🚀 توجيه المستخدم لصفحة الشات لما يدوس على الإشعار
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    
    // سحب الرابط اللي الباك إند بعته في الإشعار
    const urlToOpen = event.notification.data?.url || '/chat';
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url.includes(urlToOpen) && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});