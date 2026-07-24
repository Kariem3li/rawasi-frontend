"use client";
import { useState, useEffect } from 'react';
import Pusher from 'pusher-js';
import api from '@/lib/axios';
import { API_URL } from '@/lib/config'; // 🚀 استدعينا الرابط المتين من الكونفيج
export const useChat = (roomId: string) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomId) {
      setLoading(false);
      return;
    }

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await api.get(`chat/rooms/${roomId}/messages/`);
        setMessages(response.data);
        await api.post(`chat/rooms/${roomId}/read/`); 
      } catch (error) {
        console.error("خطأ في جلب الرسائل:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // جلب التوكن بطريقة آمنة
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') || sessionStorage.getItem('token') : '';

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY || 'd558a2e3ed306c081a46', {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'eu',
      authEndpoint: `${API_URL}/chat/pusher/auth/`,
      auth: {
        headers: { 
          Authorization: `Token ${token}`,
          authorization: `Token ${token}`
        },
      },
    });

    const channel = pusher.subscribe(`private-chat_${roomId}`);

    channel.bind('new_message', (newMsg: any) => {
      setMessages((prev) => [...prev, newMsg]);
    });

    channel.bind('messages_read', () => {
      setMessages((prev) => prev.map((msg) => ({ ...msg, is_read: true })));
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [roomId]);

  const sendMessage = async (content: string) => {
    try {
      await api.post(`chat/rooms/${roomId}/messages/`, { content });
    } catch (error: any) {
      if (error.response?.data?.content) {
        alert(error.response.data.content[0]);
      } else if (error.response?.data?.detail) {
        alert(error.response.data.detail);
      }
    }
  };

  return { messages, loading, sendMessage };
};