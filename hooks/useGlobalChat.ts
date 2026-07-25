"use client";
import { useEffect, useState, useCallback } from 'react';
import Pusher from 'pusher-js';
import api from '@/lib/axios';
import { API_URL } from '@/lib/config';
import { useAuth } from '@/providers/AuthProvider';

export const useGlobalChat = () => {
    const { isAuthenticated } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);
    const [serverUserId, setServerUserId] = useState<string | null>(null);

    // 🚀 1. فصل دالة جلب العداد عشان نقدر نناديها براحتنا وقت ما نحب
    const fetchUnreadCount = useCallback(() => {
        if (!isAuthenticated) return;
        
        api.get(`chat/unread-count/?_t=${new Date().getTime()}`)
           .then(res => {
               setUnreadCount(res.data.unread_count);
               if (res.data.user_id) {
                   setServerUserId(String(res.data.user_id));
               }
           })
           .catch(err => console.error("Unread count error:", err));
    }, [isAuthenticated]);

    // 🚀 2. استدعاء العداد أول مرة، والتصنت على الإشارات اللي جاية من الغرف
    useEffect(() => {
        fetchUnreadCount();

        // السلك السحري: أي مكان في الموقع يضرب الإشارة دي، العداد هيتحدث لايف!
        window.addEventListener('update_global_counter', fetchUnreadCount);
        
        return () => {
            window.removeEventListener('update_global_counter', fetchUnreadCount);
        };
    }, [fetchUnreadCount]);

    // 🚀 3. إعدادات البوشر (الرادار العام)
    useEffect(() => {
        if (!isAuthenticated || !serverUserId) return;

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

        const globalChannelName = `private-user_${serverUserId}`;
        const globalChannel = pusher.subscribe(globalChannelName);

        globalChannel.bind('new_message_notification', (data: any) => {
            console.log("🔥 [GLOBAL CHAT] إشعار جديد وصل للنافبار!", data);
            
            // زيادة العداد لايف
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
    }, [serverUserId, isAuthenticated]);

    return { unreadCount };
};