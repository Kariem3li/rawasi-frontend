"use client";
import { useEffect, useState } from 'react';
import Pusher from 'pusher-js';
import api from '@/lib/axios';
import { API_URL } from '@/lib/config';
import { useAuth } from '@/providers/AuthProvider';

export const useGlobalChat = () => {
    const { user, isAuthenticated } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!isAuthenticated) return;

        // 🚀 حماية مطلقة: نمنع البوشر إنه يشتغل لو الآي دي 0 أو undefined
        let userId = String(user?.id);
        if (userId === '0' || userId === 'undefined' || userId === 'null' || !user?.id) {
            const stored = localStorage.getItem('user_id');
            if (stored && stored !== '0' && stored !== 'undefined' && stored !== 'null') {
                userId = stored;
            } else {
                return; // قفلة قوية عشان ميجيبش 403 Forbidden
            }
        }

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

        const globalChannel = pusher.subscribe(`private-user_${userId}`);

        globalChannel.bind('new_message_notification', (data: any) => {
            // أ) تحديث العداد
            api.get('chat/unread-count/').then(res => setUnreadCount(res.data.unread_count)).catch(()=>{});
            
            // ب) تحديث قائمة الشات
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('chat_rooms_updated'));
            }
            
            // ج) إرسال "تم الاستلام" عشان المرسل يشوف الصحين الرمادي
            if (data && data.id) {
                api.post(`chat/messages/${data.id}/delivered/`).catch(() => {});
            }
        });

        return () => {
            globalChannel.unbind_all();
            globalChannel.unsubscribe();
            pusher.disconnect();
        };
    }, [user?.id, isAuthenticated]);

    return { unreadCount };
};