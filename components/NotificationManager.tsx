"use client";

import { useEffect } from "react";
import { requestFcmToken, onMessageListener } from "../lib/firebase"; 
import api from "@/lib/axios"; // ✅ استخدام الـ api المركزي بدل fetch الخام

// أيقونة مبدئية للإشعارات (SVG Base64)
const LOGO_URL = `data:image/svg+xml;charset=utf-8,%3Csvg width='512' height='512' viewBox='0 0 512 512' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='512' height='512' rx='100' fill='%230f172a'/%3E%3Cpath d='M256 120L100 240V400H200V320H312V400H412V240L256 120Z' fill='%23d97706' stroke='%23fffbeb' stroke-width='20'/%3E%3Cpath d='M256 90L440 230V260L256 120L72 260V230L256 90Z' fill='%23fffbeb'/%3E%3C/svg%3E`;

export default function NotificationManager() {
  
  useEffect(() => {
    if (typeof window === "undefined") return;

    // فحص الأمان (HTTPS)
    const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
    if (!isSecure) {
        console.warn("⚠️ تنبيه: إشعارات Firebase تتطلب اتصالاً آمناً (HTTPS).");
    }

    const initFirebase = async () => {
        try {
            // 1. محاولة جلب التوكن من Firebase
            const token = await requestFcmToken();
            
            if (token) {
                // ✅ فحص وجود توكن المستخدم (لضمان إنه مسجل دخول) في المكانين
                const authToken = localStorage.getItem("token") || sessionStorage.getItem("token");
                
                if (authToken) {
                    try {
                        // ✅ إرسال التوكن للباك إند عبر axios بأمان وبدون الحاجة لكتابة الهيدرز
                        await api.post('/auth/update-fcm/', { fcm_token: token });
                        console.log("✅ FCM Token synced securely with server");
                    } catch(e) {
                        console.error("❌ Error syncing FCM token:", e);
                    }
                }
            }

            // 2. استقبال الرسائل والموقع مفتوح (Foreground)
            onMessageListener().then((payload: any) => {
                if(payload?.notification) {
                    if ('serviceWorker' in navigator) {
                        navigator.serviceWorker.ready.then(registration => {
                            (registration.showNotification as any)(payload.notification.title, {
                                body: payload.notification.body,
                                icon: LOGO_URL,
                                data: { url: payload.data?.url || '/' },
                                tag: 'renotify-tag', 
                                renotify: true,
                                vibrate: [200, 100, 200]
                            });
                        });
                    }
                }
            });

        } catch (error) {
            console.log("Firebase init error:", error);
        }
    };

    initFirebase();
  }, []);

  return null;
}