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
  
  // 1. استخراج ID المستخدم الحالي بثبات
  const currentUserId = user?.id || (typeof window !== 'undefined' ? localStorage.getItem('user_id') : null);

  // 2. دالة الحكم الصارمة: تحدد الرسالة يمين ولا شمال بناءً على الـ ID فقط
  const checkIsMe = (msg: any, userId: any) => {
     if (!userId) return false;
     
     // فحص المرسل سواء كان رقم أو Object
     const sender = msg.sender;
     if (!sender) return false;
     
     const senderId = typeof sender === 'object' ? String(sender.id) : String(sender);
     return senderId === String(userId);
  };

  useEffect(() => {
    // 3. تأمين: لا تشغيل بدون ID الغرفة والـ User
    if (!roomId || !currentUserId) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await api.get(`chat/rooms/${roomId}/messages/`, {
            params: { _t: new Date().getTime() } 
        });
        
        const fetchedMessages = Array.isArray(response.data) 
            ? response.data 
            : (response.data?.results || []);
            
        // 4. تنسيق الرسائل القادمة من الداتابيز
        const formattedMessages = fetchedMessages.map((msg: any) => ({
            ...msg,
            is_me: checkIsMe(msg, currentUserId)
        }));
            
        setMessages(formattedMessages);
        
        // 5. إشعار قراءة فوري عند فتح الغرفة
        await api.post(`chat/rooms/${roomId}/read/`).catch(() => {}); 
      } catch (error) {
        console.error("خطأ في جلب الرسائل:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // 6. جلب التوكن للبوشر
    let token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
    if (!token && typeof document !== 'undefined') {
        const match = document.cookie.match(/(^| )token=([^;]+)/);
        if (match) token = match[2];
    }

    if (!token) return;

    // 7. تهيئة البوشر
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY || 'd558a2e3ed306c081a46', {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'eu',
      authEndpoint: `${API_URL}chat/pusher/auth/`,
      auth: { headers: { Authorization: `Token ${token}` } },
    });

    const channel = pusher.subscribe(`private-chat_${roomId}`);

    // 8. استقبال الرسالة اللحظية
    channel.bind('new_message', (newMsg: any) => {
      setMessages((prev) => {
          // السحر هنا: بنحسب الاتجاه للرسالة اللحظية فوراً قبل ما تترسم
          const actualIsMe = checkIsMe(newMsg, currentUserId);
          const correctedMsg = { ...newMsg, is_me: actualIsMe };
          
          // منع تكرار الرسالة في الشاشة
          const exists = prev.find(m => String(m.id) === String(correctedMsg.id));
          if (exists) {
              return prev.map(m => String(m.id) === String(correctedMsg.id) ? correctedMsg : m);
          }
          
          // لو الرسالة جاية من حد تاني وإحنا فاتحين الشات، نبعت Seen فوراً
          if (!actualIsMe) {
             api.post(`chat/rooms/${roomId}/read/`).catch(() => {});
          }
          
          return [...prev, correctedMsg];
      });
    });

    // 9. استقبال إشعار الـ Seen
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
  }, [roomId, currentUserId]); 

  // 10. دالة إرسال الرسالة
  const sendMessage = async (content: string) => {
    try {
      const res = await api.post(`chat/rooms/${roomId}/messages/`, { content });
      
      // أنا لسه باعت الرسالة بايدي، إذن هي بتاعتي 100%
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