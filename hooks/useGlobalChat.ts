"use client";
import { useEffect, useState } from 'react';
import Pusher from 'pusher-js';
import api from '@/lib/axios';
import { API_URL } from '@/lib/config';
import { useAuth } from '@/providers/AuthProvider';

export const useGlobalChat = () => {
    const { user, isAuthenticated } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);

    // 🚀 1. جلب العداد المبدئي (مستقل تماماً)
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

        const userId = String(user?.id || localStorage.getItem('user_id'));
        if (!userId || userId === '0' || userId === 'undefined' || userId === 'null') return;

        let token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
        if (!token && typeof document !== 'undefined') {
            const match = document.cookie.match(/(^| )token=([^;]+)/);
            if (match) token = match[2];
        }
        if (!token) return;

        // Pusher.logToConsole = true; // شيلنا اللوج عشان الكونسول يبقى نظيف

        const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY || 'd558a2e3ed306c081a46', {
          cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'eu',
          authEndpoint: `${API_URL}chat/pusher/auth/`,
          auth: { headers: { Authorization: `Token ${token}` } },
        });

        const globalChannelName = `private-user_${userId}`;
        const globalChannel = pusher.subscribe(globalChannelName);

        globalChannel.bind('new_message_notification', (data: any) => {
            // 🚀 السحر هنا: زيادة العداد فوراً في الواجهة بدون انتظار السيرفر (طلقة!)
            setUnreadCount(prev => prev + 1);
            
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('chat_rooms_updated'));
            }
            
            if (data && data.id) {
                api.post(`chat/messages/${data.id}/delivered/`).catch(() => {});
            }
        });

        return () => {
            globalChannel.unbind_all();
            pusher.unsubscribe(globalChannelName);
            pusher.disconnect();
        };
    }, [user?.id, isAuthenticated]); // 🚀 استخدام user?.id بيمنع إعادة الاتصال العشوائية

    return { unreadCount };
};