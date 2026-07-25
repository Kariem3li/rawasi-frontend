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
  const learnedMyIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (user && String(user.id) !== '0') {
        userRef.current = user;
    }
  }, [user]);

  // 🚀 دالة تعليم الغرفة كمقروءة وتحديث النافبار والقائمة الجانبية فوراً
  const markRoomAsRead = useCallback(async () => {
      if (!roomId) return;
      try {
          await api.post(`chat/rooms/${roomId}/read/`);
          if (typeof window !== 'undefined') {
              // بنقول للقائمة الجانبية تحدث نفسها (عشان تشيل النقطة الحمرا من الشات ده)
              window.dispatchEvent(new Event('chat_rooms_updated'));
              // بنقول للنافبار يجيب الرقم الجديد من السيرفر (عشان يقلل العداد العام)
              window.dispatchEvent(new Event('update_global_counter'));
          }
      } catch (error) {
          console.error("خطأ في تحديث حالة القراءة:", error);
      }
  }, [roomId]);

  const fetchMessages = useCallback(async () => {
    if (!roomId) return;
    try {
      setLoading(true);
      const response = await api.get(`chat/rooms/${roomId}/messages/`, {
          params: { _t: new Date().getTime() } 
      });

      const fetchedMessages = Array.isArray(response.data) ? response.data : (response.data?.results || []);

      const myMsg = fetchedMessages.find((m: any) => m.is_me === true);
      if (myMsg) {
          const senderVal = myMsg.sender?.id || myMsg.sender;
          if (senderVal) learnedMyIdRef.current = String(senderVal);
      }

      setMessages(fetchedMessages);
      
      // 🚀 أول ما الرسايل تحمل بنعلمها إنها اتقرأت ونضرب إشارة التحديث
      markRoomAsRead();

    } catch (error) {
      console.error("خطأ في جلب الرسائل:", error);
    } finally {
      setLoading(false);
    }
  }, [roomId, markRoomAsRead]);

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
          if (prev.some(m => String(m.id) === String(newMsg.id))) {
              return prev.map(m => String(m.id) === String(newMsg.id) ? { ...newMsg, is_me: m.is_me } : m);
          }

          let currentUserId = learnedMyIdRef.current || String(userRef.current?.id);
          if (!currentUserId || currentUserId === '0' || currentUserId === 'undefined') {
              currentUserId = String(localStorage.getItem('user_id'));
          }

          const senderId = typeof newMsg.sender === 'object' ? String(newMsg.sender?.id) : String(newMsg.sender);
          
          const isMine = (currentUserId && currentUserId !== '0') ? (senderId === currentUserId) : false;
          const correctedMsg = { ...newMsg, is_me: isMine };

          if (!isMine) {
             // 🚀 لو إنت فاتح الغرفة ورسالة جاتلك، بنعلمها مقروءة ونحدث النافبار في نفس اللحظة
             markRoomAsRead();
          }

          return [...prev, correctedMsg];
      });
    });

    channel.bind('message_delivered', (data: any) => {
      console.log("🔥 DEBUG FRONTEND: Received Double Tick event from Pusher!", data);
      setMessages((prev) => prev.map((msg) => 
        String(msg.id) === String(data.message_id) ? { ...msg, is_delivered: true } : msg
      ));
    });

    channel.bind('messages_read', () => {
      setMessages((prev) => prev.map((msg) => ({ ...msg, is_read: true })));
    });

    return () => {
        try {
            channel.unbind_all();
            channel.unsubscribe();
            pusher.disconnect();
        } catch (e) {}
    };
  }, [roomId, markRoomAsRead]);

  const sendMessage = async (content: string) => {
    try {
      const res = await api.post(`chat/rooms/${roomId}/messages/`, { content });
      const realMsg = { ...res.data, is_me: true };

      setMessages((prev) => {
          const existingMsg = prev.find(m => String(m.id) === String(realMsg.id));
          if (existingMsg) {
              return prev.map(m => String(m.id) === String(realMsg.id) ? 
                  { ...realMsg, is_delivered: m.is_delivered || realMsg.is_delivered, is_read: m.is_read || realMsg.is_read } : m);
          }
          return [...prev, realMsg];
      });
    } catch (error: any) {
      if (error.response?.data?.content) alert(error.response.data.content[0]);
    }
  };

  return { messages, loading, sendMessage };
};