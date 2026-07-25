"use client";
import { useEffect, useState } from 'react';
import Pusher from 'pusher-js';
import api from '@/lib/axios';
import { API_URL } from '@/lib/config';
import { useAuth } from '@/providers/AuthProvider';

export const useGlobalChat = () => {
    const { user } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
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

        const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY || 'd558a2e3ed306c081a46', {
          cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'eu',
          authEndpoint: `${API_URL}chat/pusher/auth/`,
          auth: { headers: { Authorization: `Token ${token}` } },
        });

        // 🚀 التصنت العام على إشعارات اليوزر في كل صفحات الموقع
        const globalChannel = pusher.subscribe(`private-user_${userId}`);

        globalChannel.bind('new_message_notification', (data: any) => {
            // أ) تحديث عداد الـ Navbar فوراً
            api.get('chat/unread-count/').then(res => setUnreadCount(res.data.unread_count)).catch(()=>{});
            
            // ب) إطلاق حدث عالمي عشان لو هو جوه صفحة الشات، اللستة الجانبية تتحدث
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('chat_rooms_updated'));
            }
            
            // ج) السحر: إرسال "تم الاستلام" للسيرفر عشان الطرف الأول يشوف صحين رمادي
            if (data && data.id) {
                api.post(`chat/messages/${data.id}/delivered/`).catch(() => {});
            }
        });

        return () => {
            globalChannel.unbind_all();
            globalChannel.unsubscribe();
            pusher.disconnect();
        };
    }, [user?.id]);

    return { unreadCount };
};