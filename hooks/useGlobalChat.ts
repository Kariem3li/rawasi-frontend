"use client";
import { useEffect, useState } from 'react';
import Pusher from 'pusher-js';
import api from '@/lib/axios';
import { API_URL } from '@/lib/config';
import { useAuth } from '@/providers/AuthProvider';

export const useGlobalChat = () => {
    const { isAuthenticated } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);
    // 🚀 متغير جديد عشان نحفظ فيه الآي دي السليم اللي جاي من السيرفر
    const [serverUserId, setServerUserId] = useState<string | null>(null);

    useEffect(() => {
        if (isAuthenticated) {
            // 1. نجيب العداد والآي دي الموثوق من الباك إند
            api.get(`chat/unread-count/?_t=${new Date().getTime()}`)
               .then(res => {
                   setUnreadCount(res.data.unread_count);
                   if (res.data.user_id) {
                       setServerUserId(String(res.data.user_id));
                   }
               })
               .catch(err => console.error("Unread count error:", err));
        }
    }, [isAuthenticated]);

    useEffect(() => {
        // 2. لو لسه مجبناش الآي دي من السيرفر، منشغلش البوشر عشان ميجيبش 403
        if (!isAuthenticated || !serverUserId) return;

        let token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
        if (!token && typeof document !== 'undefined') {
            const match = document.cookie.match(/(^| )token=([^;]+)/);
            if (match) token = match[2];
        }
        if (!token) return;

        // Pusher.logToConsole = true;

        const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY || 'd558a2e3ed306c081a46', {
          cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'eu',
          authEndpoint: `${API_URL}chat/pusher/auth/`,
          auth: { headers: { Authorization: `Token ${token}` } },
        });

        // 🚀 دلوقتي البوشر هيشترك في القناة الصح 100% (مثلاً private-user_8)
        const globalChannelName = `private-user_${serverUserId}`;
        const globalChannel = pusher.subscribe(globalChannelName);

        globalChannel.bind('new_message_notification', (data: any) => {
            console.log("🔥 [GLOBAL CHAT] إشعار جديد وصل للنافبار!", data);
            
            // زيادة العداد لايف في النافبار
            setUnreadCount(prev => prev + 1);
            
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('chat_rooms_updated'));
            }
            
            // إرسال تأكيد الاستلام للمرسل عشان يشوف الصحين الرمادي فوراً
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