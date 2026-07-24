"use client";
import { useState, useEffect } from 'react';
import Pusher from 'pusher-js';
import api from '@/lib/axios';

export const useChat = (roomId: string) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roomId) return;

    const fetchMessages = async () => {
      try {
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

    // إعداد Pusher
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY || 'd558a2e3ed306c081a46', {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'eu',
      authEndpoint: `${process.env.NEXT_PUBLIC_API_URL}/chat/pusher/auth/`,
      auth: {
        headers: { Authorization: `Token ${localStorage.getItem('token')}` },
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
      }
    }
  };

  return { messages, loading, sendMessage };
};