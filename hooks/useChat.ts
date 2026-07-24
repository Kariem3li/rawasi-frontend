"use client";
import { useState, useEffect } from 'react';
import Pusher from 'pusher-js';
import api from '@/lib/axios';
import { API_URL } from '@/lib/config';

export const useChat = (roomId: string) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomId) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await api.get(`chat/rooms/${roomId}/messages/`);
        
        // 🚀 السحر هنا: قراءة الداتا من results لو الـ Pagination شغال
        const fetchedMessages = Array.isArray(response.data) 
            ? response.data 
            : (response.data?.results || []);
            
        setMessages(fetchedMessages);
        await api.post(`chat/rooms/${roomId}/read/`).catch(() => {}); 
      } catch (error) {
        console.error("خطأ في جلب الرسائل:", error);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // 🚀 تنظيف استخراج التوكن
    let token = '';
    if (typeof window !== 'undefined') {
        token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
    }

    // 🚀 لو مفيش توكن، متعملش اتصال بالبوشر عشان ميضربش 401
    if (!token) {
        console.warn("No token found, skipping Pusher connection.");
        return;
    }

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY || 'd558a2e3ed306c081a46', {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'eu',
      authEndpoint: `${API_URL}chat/pusher/auth/`,
      auth: {
        headers: { 
          Authorization: `Token ${token}`
        },
      },
    });

    const channel = pusher.subscribe(`private-chat_${roomId}`);

    channel.bind('new_message', (newMsg: any) => {
      setMessages((prev) => {
          if (Array.isArray(prev) && prev.find(m => m.id === newMsg.id)) return prev;
          return Array.isArray(prev) ? [...prev, newMsg] : [newMsg];
      });
      
      // 🚀 السحر هنا: لو الرسالة دي مش بتاعتي (جاية من الطرف التاني) وأنا فاتح الشات حالاً
      // اضرب API للباك إند قوله إني شفتها، عشان يبعت للطرف التاني إشعار الـ Seen فوراً!
      if (!newMsg.is_me) {
          api.post(`chat/rooms/${roomId}/read/`).catch(() => {});
      }
    });

    channel.bind('messages_read', () => {
      setMessages((prev) => Array.isArray(prev) ? prev.map((msg) => ({ ...msg, is_read: true })) : []);
    });

    // 🚀 التخلص من الإيرور الخاص بالـ WebSocket Closing State
    return () => {
        try {
            channel.unbind_all();
            channel.unsubscribe();
            pusher.disconnect();
        } catch (e) {
            console.error("Pusher cleanup error:", e);
        }
    };
  }, [roomId]);

  const sendMessage = async (content: string) => {
    try {
      const res = await api.post(`chat/rooms/${roomId}/messages/`, { content });
      
      // 🚀 إظهار الرسالة في الشاشة فوراً بمجرد ما تتبعت للسرعة (Optimistic Update)
      setMessages((prev) => {
          if (Array.isArray(prev) && prev.find(m => m.id === res.data.id)) return prev;
          return Array.isArray(prev) ? [...prev, res.data] : [res.data];
      });
      
    } catch (error: any) {
      if (error.response?.data?.content) alert(error.response.data.content[0]);
    }
  };

  return { messages, loading, sendMessage };
};