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
  
  // 🚀 استخراج دقيق للـ ID الخاص بالمستخدم الحالي من كل الأماكن الممكنة
  const currentUserId = user?.id || (typeof window !== 'undefined' ? localStorage.getItem('user_id') : null);

  // 🚀 دالة سحرية وظيفتها الوحيدة تحديد: دي رسالتي (يمين) ولا لأ (شمال)
  const checkIsMe = (senderId: any, backendIsMe: boolean) => {
     if (!senderId && backendIsMe !== undefined) return backendIsMe;
     const normalizedSenderId = senderId?.id ? String(senderId.id) : String(senderId);
     return normalizedSenderId === String(currentUserId);
  };

  useEffect(() => {
    if (!roomId) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        
        // كسر الكاش عشان مفيش رسالة تتمسح بعد الريفريش
        const response = await api.get(`chat/rooms/${roomId}/messages/`, {
            params: { _t: new Date().getTime() } 
        });
        
        const fetchedMessages = Array.isArray(response.data) 
            ? response.data 
            : (response.data?.results || []);
            
        // 🚀 فرض السيطرة على اليمين والشمال بناءً على الـ ID مش كلام الباك إند
        const formattedMessages = fetchedMessages.map((msg: any) => ({
            ...msg,
            is_me: checkIsMe(msg.sender, msg.is_me)
        }));
            
        setMessages(formattedMessages);
        
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
          // حساب دقيق للرسالة الجاية من بوشر (يمين ولا شمال)
          const actualIsMe = checkIsMe(newMsg.sender, newMsg.is_me);
          const correctedMsg = { ...newMsg, is_me: actualIsMe };
          
          // التأكد إنها مش متكررة
          const exists = prev.find(m => String(m.id) === String(correctedMsg.id));
          if (exists) {
              return prev.map(m => String(m.id) === String(correctedMsg.id) ? correctedMsg : m);
          }
          
          // لو الرسالة جاية من الطرف التاني، نبلغ السيرفر إننا قرأناها فوراً
          if (!actualIsMe) {
             api.post(`chat/rooms/${roomId}/read/`).catch(() => {});
          }
          
          return [...prev, correctedMsg];
      });
    });

    channel.bind('messages_read', () => {
      // تلوين كل الرسايل اللي في الشاشة لـ أزرق
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
  }, [roomId, currentUserId]);

  const sendMessage = async (content: string) => {
    try {
      const res = await api.post(`chat/rooms/${roomId}/messages/`, { content });
      
      // 🚀 فرض سيطرة: الرسالة اللي أنا لسه دايس إرسال عليها بتاعتي 100%
      const myMsg = { ...res.data, is_me: true };
      
      setMessages((prev) => {
          const filtered = prev.filter(m => String(m.id) !== String(myMsg.id));
          return [...filtered, myMsg];
      });
      
    } catch (error: any) {
      if (error.response?.data?.content) alert(error.response.data.content[0]);
    }
  };

  return { messages, loading, sendMessage };
};