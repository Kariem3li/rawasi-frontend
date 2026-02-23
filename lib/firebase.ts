// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// ✅ تهيئة آمنة تمنع تحطم الموقع لو المتغيرات مش موجودة
const app = (getApps().length === 0 && firebaseConfig.apiKey) 
    ? initializeApp(firebaseConfig) 
    : getApps().length > 0 ? getApp() : null;

export const requestFcmToken = async () => {
  try {
    if (app && typeof window !== "undefined" && await isSupported()) {
      const messaging = getMessaging(app);
      const permission = await Notification.requestPermission();
      
      if (permission === "granted") {
        const token = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
        });
        return token;
      } else {
        console.log("تم رفض الإذن بالإشعارات");
        return null;
      }
    }
    return null;
  } catch (error) {
    console.error("خطأ في FCM Token:", error);
    return null;
  }
};

export const onMessageListener = () =>
  new Promise(async (resolve) => {
    if (app && typeof window !== "undefined" && await isSupported()) {
      const messaging = getMessaging(app);
      onMessage(messaging, (payload) => {
        resolve(payload);
      });
    }
  });