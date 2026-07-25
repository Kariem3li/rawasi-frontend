"use client";
import { useEffect, useState } from 'react';
import Pusher from 'pusher-js';
import api from '@/lib/axios';
import { API_URL } from '@/lib/config';
import { useAuth } from '@/providers/AuthProvider';

export const useGlobalChat = () => {
    // 🚀 جلب حالة تسجيل الدخول للتأمين
    const { user, isAuthenticated } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        // لا تشغل المراقبة إلا لو مسجل دخول
        if (!isAuthenticated) return;

        let userId = user?.id;
        if (!userId && typeof window !== 'undefined') {
            const stored = localStorage.getItem('user_id');
            if (stored && stored !== 'undefined' && stored !== 'null') {
                userId = stored;
            }
        }

        if (!userId) return;

        // 1. جلب عدد الرسائل الكلي أول ما الموقع يفتح
        api.get('chat/unread-count/').then(res => setUnreadCount(res.data.unread_count)).catch(()=>{});

        let token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
        if (!token && typeof document !== 'undefined') {
            const match = document.cookie.match(/(^| )token=([^;]+)/);
            if (match) token = match[2];
        }
        if (!token) return;

        // 🚀 تشغيل لوج الكونسول لكشف الأخطاء أو الاستلام
        Pusher.logToConsole = true;

        const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY || 'd558a2e3ed306c081a46', {
          cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'eu',
          authEndpoint: `${API_URL}chat/pusher/auth/`,
          auth: { headers: { Authorization: `Token ${token}` } },
        });

        const globalChannel = pusher.subscribe(`private-user_${userId}`);

        globalChannel.bind('new_message_notification', (data: any) => {
            console.log("🚀 [GLOBAL CHAT] إشعار رسالة جديدة وصل:", data);

            // أ) تحديث عداد الـ Navbar فوراً
            api.get('chat/unread-count/').then(res => setUnreadCount(res.data.unread_count)).catch(()=>{});
            
            // ب) إطلاق حدث عالمي عشان لو هو جوه صفحة الشات، اللستة الجانبية تتحدث
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('chat_rooms_updated'));
            }
            
            // ج) السحر: إرسال "تم الاستلام" للسيرفر عشان الطرف الأول يشوف صحين رمادي
            if (data && data.id) {
                console.log("🚀 [GLOBAL CHAT] إرسال تأكيد استلام...");
                api.post(`chat/messages/${data.id}/delivered/`).catch((e) => console.log("Delivered API Error:", e));
            }
        });

        return () => {
            globalChannel.unbind_all();
            globalChannel.unsubscribe();
            pusher.disconnect();
        };
    }, [user?.id, isAuthenticated]); // ربط التحديث بحالة تسجيل الدخول

    return { unreadCount };
};