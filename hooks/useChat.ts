"use client";
import { useState, useEffect, useRef } from 'react';
import Pusher from 'pusher-js';
import api from '@/lib/axios';
import { API_URL } from '@/lib/config';
import { useAuth } from '@/providers/AuthProvider';

export const useChat = (roomId: string) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth(); 
  
  // 🚀 1. استخدام useRef لحل مشكلة الـ Stale Closure (السبب الحقيقي في رمي الرسالة شمال لثانية)
  const userIdRef = useRef<string | number | null>(null);

  useEffect(() => {
    userIdRef.current = user?.id || (typeof window !== 'undefined' ? localStorage.getItem('user_id') : null);
  }, [user?.id]);

  useEffect(() => {
    // استخدمنا قيمة مبدئية فقط للتشغيل
    const initialUserId = userIdRef.current || (typeof window !== 'undefined' ? localStorage.getItem('user_id') : null);
    if (!roomId || !initialUserId) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await api.get(`chat/rooms/${roomId}/messages/`, {
            params: { _t: new Date().getTime() } 
        });
        
        const fetchedMessages = Array.isArray(response.data) ? response.data : [];
        
        const formattedMessages = fetchedMessages.map((msg: any) => {
            const senderId = typeof msg.sender === 'object' ? String(msg.sender?.id) : String(msg.sender);
            // نقرأ الآي دي الحي من الـ Ref
            const activeId = userIdRef.current || (typeof window !== 'undefined' ? localStorage.getItem('user_id') : null);
            return { ...msg, is_me: senderId === String(activeId) };
        });
            
        setMessages(formattedMessages);
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
          // 🚀 2. السحب الحي للـ ID جوه الدالة وقت وصول الرسالة عشان نستحيل نغلط
          const activeId = userIdRef.current || (typeof window !== 'undefined' ? localStorage.getItem('user_id') : null);
          
          const senderId = typeof newMsg.sender === 'object' ? String(newMsg.sender?.id) : String(newMsg.sender);
          const actualIsMe = activeId ? (senderId === String(activeId)) : false;
          
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
  }, [roomId]); // شيلنا اليوزر آي دي من هنا عشان الشات ميعملش ريستارت ويفقد الاتصال

  const sendMessage = async (content: string) => {
    // 🚀 3. Optimistic Update (إظهار الرسالة يمين فوراً بمجرد الضغط بدون انتظار أي سيرفر)
    const tempId = `temp_${Date.now()}`;
    const optimisticMsg = {
        id: tempId,
        content: content,
        created_at: new Date().toISOString(),
        is_read: false,
        is_delivered: false,
        is_me: true, // يمين إجباري
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const res = await api.post(`chat/rooms/${roomId}/messages/`, { content });
      const realMsg = { ...res.data, is_me: true };
      
      setMessages((prev) => {
          // تبديل الرسالة الوهمية بالرسالة الحقيقية اللي راجعة من السيرفر بسلاسة
          const filtered = prev.filter(m => m.id !== tempId && String(m.id) !== String(realMsg.id));
          return [...filtered, realMsg];
      });
    } catch (error: any) {
      // لو النت فصل مثلاً، بنمسح الرسالة الوهمية اللي كتبناها
      setMessages((prev) => prev.filter(m => m.id !== tempId));
      if (error.response?.data?.content) alert(error.response.data.content[0]);
    }
  };

  return { messages, loading, sendMessage };
};