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

  const userRef = useRef(user);
  // 🚀 السحر الجديد: مرجع هيتعلم الـ ID بتاعك من الداتابيز عشان البوشر ميغلطش أبداً
  const learnedMyIdRef = useRef<string | null>(null);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

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

      // 🚀 الذكاء الاصطناعي: هندور على أي رسالة الباك إند قال إنها بتاعتك (is_me: true) وناخد منها الـ ID بتاعك كضمان!
      const myMsg = fetchedMessages.find((m: any) => m.is_me === true);
      if (myMsg) {
          const senderVal = myMsg.sender?.id || myMsg.sender;
          if (senderVal) learnedMyIdRef.current = String(senderVal);
      }

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
          // لو الرسالة موجودة فعلاً (أو موجودة كنسخة وهمية مؤقتة) هنتجاهلها عشان منع الرعشة
          if (prev.some(m => String(m.id) === String(newMsg.id))) {
              return prev;
          }

          // نحدد الآي دي بتاعك بأدق طريقة ممكنة (من المرجع المُتعلم، أو اليوزر، أو اللوكال ستوريدج)
          const currentUserId = learnedMyIdRef.current || String(userRef.current?.id) || localStorage.getItem('user_id');
          const senderId = typeof newMsg.sender === 'object' ? String(newMsg.sender?.id) : String(newMsg.sender);
          
          const isMine = currentUserId ? (senderId === String(currentUserId)) : false;
          const correctedMsg = { ...newMsg, is_me: isMine };

          // إشعار قراءة للطرف التاني
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
    // 🚀 التحديث المتفائل: نرسم الرسالة يمين فوووراً وقت الضغط عشان نحسس العميل بسرعة البرق
    const tempId = `temp_${Date.now()}`;
    const optimisticMsg = {
        id: tempId,
        content: content,
        created_at: new Date().toISOString(),
        is_read: false,
        is_delivered: false,
        is_me: true, // إجباري يمين
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const res = await api.post(`chat/rooms/${roomId}/messages/`, { content });
      const realMsg = { ...res.data, is_me: true };

      setMessages((prev) => {
          // بنشيل النسخة الوهمية ونحط النسخة الحقيقية اللي رجعت من السيرفر بدون أي رعشة
          const filtered = prev.filter(m => m.id !== tempId && String(m.id) !== String(realMsg.id));
          return [...filtered, realMsg];
      });
    } catch (error: any) {
      // لو النت فصل، بنمسح الرسالة الوهمية
      setMessages((prev) => prev.filter(m => m.id !== tempId));
      if (error.response?.data?.content) alert(error.response.data.content[0]);
    }
  };

  return { messages, loading, sendMessage };
};