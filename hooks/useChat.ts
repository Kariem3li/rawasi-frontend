"use client";
import { useState, useEffect } from 'react';
import Pusher from 'pusher-js';
import api from '@/lib/axios';
import { API_URL } from '@/lib/config';
import { useAuth } from '@/providers/AuthProvider'; // 🚀 1. استدعاء بيانات المستخدم

export const useChat = (roomId: string) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth(); // 🚀 2. جلب بيانات المستخدم الحالي

  useEffect(() => {
    if (!roomId) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await api.get(`chat/rooms/${roomId}/messages/`);
        
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

    let token = '';
    if (typeof window !== 'undefined') {
        token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
    }

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
      // 🚀 3. السحر الحقيقي هنا: إعادة حساب is_me بناءً على اليوزر اللي فاتح الشاشة دلوقتي
      const actualIsMe = String(newMsg.sender) === String(user?.id);
      
      // بنعمل نسخة جديدة من الرسالة بالمعلومة الصحيحة
      const correctedMsg = { ...newMsg, is_me: actualIsMe };

      setMessages((prev) => {
          if (Array.isArray(prev) && prev.find(m => m.id === correctedMsg.id)) return prev;
          return Array.isArray(prev) ? [...prev, correctedMsg] : [correctedMsg];
      });
      
      // 🚀 4. دلوقتي الشرط هيشتغل صح 100%.. لو مش رسالتي هبعت إشعار السين للطرف التاني فوراً
      if (!actualIsMe) {
          api.post(`chat/rooms/${roomId}/read/`).catch(() => {});
      }
    });

    channel.bind('messages_read', () => {
      setMessages((prev) => Array.isArray(prev) ? prev.map((msg) => ({ ...msg, is_read: true })) : []);
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
  }, [roomId, user?.id]); // 🚀 5. إضافة user?.id للمصفوفة عشان الكود يتحدث صح

  const sendMessage = async (content: string) => {
    try {
      const res = await api.post(`chat/rooms/${roomId}/messages/`, { content });
      
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