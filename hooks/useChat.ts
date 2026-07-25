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
    // 🚀 تأمين الآي دي هنا كمان
    if (user && String(user.id) !== '0') {
        userRef.current = user;
    }
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
             api.post(`chat/rooms/${roomId}/read/`).catch(() => {});
          }

          return [...prev, correctedMsg];
      });
    });

    // 🚀🚀 السر هنا! استقبال إشعار الصحين الرمادي (كان ممسوح من عندك)
    channel.bind('message_delivered', (data: any) => {
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
        } catch (e) {
            console.error("Pusher cleanup error:", e);
        }
    };
  }, [roomId]);

  const sendMessage = async (content: string) => {
    try {
      const res = await api.post(`chat/rooms/${roomId}/messages/`, { content });
      const realMsg = { ...res.data, is_me: true };

      setMessages((prev) => {
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