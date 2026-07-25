"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import Pusher from 'pusher-js';
import api from '@/lib/axios';
import { API_URL } from '@/lib/config';
import { useAuth } from '@/providers/AuthProvider';

export const useChat = (roomId: string) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // 🚀 1. مرجع ثابت لبيانات المستخدم عشان البوشر ميقراش داتا قديمة أبداً
  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // 🚀 2. دالة جلب الرسائل (هنثق في الباك إند 100%)
  const fetchMessages = useCallback(async () => {
    if (!roomId) return;
    try {
      setLoading(true);
      const response = await api.get(`chat/rooms/${roomId}/messages/`, {
          params: { _t: new Date().getTime() } 
      });

      const fetchedMessages = Array.isArray(response.data)
        ? response.data
        : (response.data?.results || []);

      // الباك إند (السيريلايزر) أصلاً بيبعت is_me صح، فمش هنلعب فيها تاني عشان متضربش شمال!
      setMessages(fetchedMessages);

      await api.post(`chat/rooms/${roomId}/read/`).catch(() => {});
    } catch (error) {
      console.error("خطأ في جلب الرسائل:", error);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    if (!roomId) return;

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
          // لو الرسالة دي موجودة أصلاً (عشان أنا لسه باعتها من ثانية) مش هنضيفها تاني
          if (prev.some(m => String(m.id) === String(newMsg.id))) {
              return prev;
          }

          // تحديد الاتجاه للرسايل اللحظية بس
          const currentUserId = userRef.current?.id || localStorage.getItem('user_id');
          const senderId = typeof newMsg.sender === 'object' ? String(newMsg.sender?.id) : String(newMsg.sender);
          
          const isMine = currentUserId ? (senderId === String(currentUserId)) : false;
          const correctedMsg = { ...newMsg, is_me: isMine };

          // لو رسالة الطرف التاني نبعت Seen
          if (!isMine) {
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
  }, [roomId]);

  const sendMessage = async (content: string) => {
    try {
      const res = await api.post(`chat/rooms/${roomId}/messages/`, { content });

      // الرسالة دي मेरी 100%
      const realMsg = { ...res.data, is_me: true };

      setMessages((prev) => {
          // منع أي تكرار وتأكيد الاتجاه الصحيح
          const exists = prev.some(m => String(m.id) === String(realMsg.id));
          if (exists) {
              return prev.map(m => String(m.id) === String(realMsg.id) ? realMsg : m);
          }
          return [...prev, realMsg];
      });
    } catch (error: any) {
      if (error.response?.data?.content) alert(error.response.data.content[0]);
    }
  };

  return { messages, loading, sendMessage };
};