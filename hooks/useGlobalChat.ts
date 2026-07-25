"use client";
import { useEffect, useState } from 'react';
import Pusher from 'pusher-js';
import api from '@/lib/axios';
import { API_URL } from '@/lib/config';
import { useAuth } from '@/providers/AuthProvider';

export const useGlobalChat = () => {
    const { user, isAuthenticated } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);

    // 🚀 1. جلب العداد: مفصول تماماً عشان يشتغل فوراً بمجرد اللوج إن (حتى لو البوشر متأخر)
    useEffect(() => {
        if (isAuthenticated) {
            api.get('chat/unread-count/')
               .then(res => setUnreadCount(res.data.unread_count))
               .catch(err => console.error("Unread count error:", err));
        }
    }, [isAuthenticated]);

    // 🚀 2. إعدادات البوشر (الرادار العام والصحين الرمادي)
    useEffect(() => {
        if (!isAuthenticated) return;

        // استخراج الآي دي الآمن
        let userId = String(user?.id);
        if (userId === '0' || userId === 'undefined' || userId === 'null' || !user?.id) {
            const stored = localStorage.getItem('user_id');
            if (stored && stored !== '0' && stored !== 'undefined' && stored !== 'null') {
                userId = stored;
            } else {
                return; // تأجيل التشغيل لحد ما الـ ID الحقيقي يظهر
            }
        }

        let token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
        if (!token && typeof document !== 'undefined') {
            const match = document.cookie.match(/(^| )token=([^;]+)/);
            if (match) token = match[2];
        }
        if (!token) return;

        Pusher.logToConsole = true;

        const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY || 'd558a2e3ed306c081a46', {
          cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'eu',
          authEndpoint: `${API_URL}chat/pusher/auth/`,
          auth: { headers: { Authorization: `Token ${token}` } },
        });

        const globalChannelName = `private-user_${userId}`;
        const globalChannel = pusher.subscribe(globalChannelName);

        globalChannel.bind('new_message_notification', (data: any) => {
            console.log("🚀 [GLOBAL CHAT] إشعار جديد وصل:", data);

            // أ) تحديث العداد
            api.get('chat/unread-count/').then(res => setUnreadCount(res.data.unread_count)).catch(()=>{});
            
            // ب) تحديث قائمة الشات
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('chat_rooms_updated'));
            }
            
            // ج) إرسال "تم الاستلام" عشان المرسل يشوف الصحين الرمادي
            if (data && data.id) {
                console.log("🚀 [GLOBAL CHAT] جاري تأكيد الاستلام...");
                api.post(`chat/messages/${data.id}/delivered/`).catch((e) => console.log(e));
            }
        });

        return () => {
            globalChannel.unbind_all();
            pusher.unsubscribe(globalChannelName);
            pusher.disconnect();
        };
    }, [user, isAuthenticated]);

    return { unreadCount };
};