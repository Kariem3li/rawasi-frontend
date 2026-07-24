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

  useEffect(() => {
    if (!roomId) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        
        // 🚀 كسر الـ Cache الإجباري للمتصفح وجلب أحدث رسائل
        const response = await api.get(`chat/rooms/${roomId}/messages/`, {
            params: { _t: new Date().getTime() } 
        });
        
        const fetchedMessages = Array.isArray(response.data) 
            ? response.data 
            : (response.data?.results || []);
            
        setMessages(fetchedMessages);
        
        // إشعار قراءة للرسائل
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

    if (!token) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY || 'd558a2e3ed306c081a46', {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'eu',
      authEndpoint: `${API_URL}chat/pusher/auth/`,
      auth: { headers: { Authorization: `Token ${token}` } },
    });

    const channel = pusher.subscribe(`private-chat_${roomId}`);

    channel.bind('new_message', (newMsg: any) => {
      setMessages((prev) => {
          let actualIsMe = String(newMsg.sender) === String(user?.id);
          
          if (!actualIsMe && Array.isArray(prev)) {
              const pastMsg = prev.find(m => m.is_me === true);
              if (pastMsg && String(newMsg.sender) === String(pastMsg.sender)) {
                  actualIsMe = true;
              }
          }

          const correctedMsg = { ...newMsg, is_me: actualIsMe };
          const filtered = Array.isArray(prev) ? prev.filter(m => m.id !== correctedMsg.id) : [];
          
          if (!actualIsMe) {
             api.post(`chat/rooms/${roomId}/read/`).catch(() => {});
          }
          
          return [...filtered, correctedMsg];
      });
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
  }, [roomId, user?.id]);

  const sendMessage = async (content: string) => {
    try {
      const res = await api.post(`chat/rooms/${roomId}/messages/`, { content });
      
      const myMsg = { ...res.data, is_me: true };
      
      setMessages((prev) => {
          const filtered = Array.isArray(prev) ? prev.filter(m => m.id !== myMsg.id) : [];
          return [...filtered, myMsg];
      });
      
    } catch (error: any) {
      if (error.response?.data?.content) alert(error.response.data.content[0]);
    }
  };

  return { messages, loading, sendMessage };
};