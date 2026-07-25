"use client";
import { useEffect, useState } from 'react';
import Pusher from 'pusher-js';
import api from '@/lib/axios';
import { API_URL } from '@/lib/config';
import { useAuth } from '@/providers/AuthProvider';

export const useGlobalChat = () => {
    const { user, isAuthenticated } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnreadCount = () => {
        // 🚀 إضافة _t عشان نمنع المتصفح من كاش العداد القديم
        api.get(`chat/unread-count/?_t=${new Date().getTime()}`)
           .then(res => {
               console.log("🔥 DEBUG FRONTEND: Unread Count API returned ->", res.data.unread_count);
               setUnreadCount(res.data.unread_count);
           })
           .catch(err => console.error("Unread count error:", err));
    };

    useEffect(() => {
        if (isAuthenticated) fetchUnreadCount();
    }, [isAuthenticated]);

    useEffect(() => {
        if (!isAuthenticated) return;

        let userId = String(user?.id);
        if (!userId || userId === '0' || userId === 'undefined' || userId === 'null') {
            userId = String(localStorage.getItem('user_id'));
            if (!userId || userId === '0' || userId === 'undefined' || userId === 'null') return;
        }

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

        const globalChannelName = `private-user_${userId}`;
        const globalChannel = pusher.subscribe(globalChannelName);

        globalChannel.bind('new_message_notification', (data: any) => {
            console.log("🔥 DEBUG FRONTEND: Global Channel received notification!", data);
            
            setUnreadCount(prev => prev + 1); // لايف أبديت
            
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('chat_rooms_updated'));
            }
            
            if (data && data.id) {
                console.log(`🔥 DEBUG FRONTEND: Sending delivered status for msg ${data.id}`);
                api.post(`chat/messages/${data.id}/delivered/`)
                   .then(() => console.log("🔥 DEBUG FRONTEND: Delivered API success!"))
                   .catch((e) => console.log("🔥 DEBUG FRONTEND: Delivered API failed!", e));
            }
        });

        return () => {
            globalChannel.unbind_all();
            pusher.unsubscribe(globalChannelName);
            pusher.disconnect();
        };
    }, [user?.id, isAuthenticated]);

    return { unreadCount };
};