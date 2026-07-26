importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// 🚀 الكود النظيف بدون أي import
const firebaseConfig = {
  apiKey: "AIzaSyDOIIqvFAMZ_QG_5GW240rlt_74rok5-XA",
  authDomain: "rawasi-platform.firebaseapp.com",
  projectId: "rawasi-platform",
  storageBucket: "rawasi-platform.firebasestorage.app",
  messagingSenderId: "440733155952",
  appId: "1:440733155952:web:1464874f0fa90040cb6ab5"
};

try {
    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();

    // 🚀 استقبال الإشعار والموقع مقفول وعرضه بشكل احترافي
    messaging.onBackgroundMessage((payload) => {
      console.log('[firebase-messaging-sw.js] Received background message ', payload);
      
      const notificationTitle = payload.notification.title;
      const notificationOptions = {
        body: payload.notification.body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        data: payload.data
      };

      self.registration.showNotification(notificationTitle, notificationOptions);
    });

    // 🚀 توجيه المستخدم لصفحة الشات لما يدوس على الإشعار
    self.addEventListener('notificationclick', function(event) {
        event.notification.close();
        
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
} catch (error) {
    console.error("Firebase initialization failed in Service Worker:", error);
}