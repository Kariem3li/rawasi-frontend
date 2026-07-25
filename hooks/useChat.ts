"use client";
import { useState, useEffect } from 'react';
import Pusher from 'pusher-js';
import api from '@/lib/axios';
import { API_URL } from '@/lib/config';
import { useAuth } from '@/providers/AuthProvider';

export const useChat = (roomId: string) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth(); 
  
  const currentUserId = user?.id || (typeof window !== 'undefined' ? localStorage.getItem('user_id') : null);

  useEffect(() => {
    if (!roomId || !currentUserId) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await api.get(`chat/rooms/${roomId}/messages/`, {
            params: { _t: new Date().getTime() } 
        });
        
        // بعد التعديل في الباك إند، الداتا هترجع Array مباشر بدون results
        const fetchedMessages = Array.isArray(response.data) ? response.data : [];
        setMessages(fetchedMessages);
        
        await api.post(`chat/rooms/${roomId}/read/`).catch(() => {}); 
      } catch (error) {
        console.error("خطأ في جلب الرسائل:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

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

    const channel = pusher.subscribe(`private-chat_${roomId}`);

    channel.bind('new_message', (newMsg: any) => {
      setMessages((prev) => {
          // حساب الاتجاه للرسالة اللحظية فقط
          const senderId = typeof newMsg.sender === 'object' ? String(newMsg.sender?.id) : String(newMsg.sender);
          const actualIsMe = senderId === String(currentUserId);
          const correctedMsg = { ...newMsg, is_me: actualIsMe };
          
          const exists = prev.find(m => String(m.id) === String(correctedMsg.id));
          if (exists) {
              return prev.map(m => String(m.id) === String(correctedMsg.id) ? correctedMsg : m);
          }
          
          if (!actualIsMe) {
             api.post(`chat/rooms/${roomId}/read/`).catch(() => {});
          }
          
          return [...prev, correctedMsg];
      });
    });

    channel.bind('messages_read', () => {
      setMessages((prev) => prev.map((msg) => ({ ...msg, is_read: true })));
    });

    return () => {
        try {
            channel.unbind_all();
            channel.unsubscribe();
            pusher.disconnect();
        } catch (e) {
            console.error("Pusher cleanup error:", e);
        }
    };
  }, [roomId, currentUserId]); 

  const sendMessage = async (content: string) => {
    try {
      const res = await api.post(`chat/rooms/${roomId}/messages/`, { content });
      const myMsg = { ...res.data, is_me: true };
      
      setMessages((prev) => {
          const filtered = prev.filter(m => String(m.id) !== String(myMsg.id));
          return [...filtered, myMsg];
      });
    } catch (error: any) {
      if (error.response?.data?.content) alert(error.response.data.content[0]);
    }
  };

  return { messages, loading, sendMessage };
};