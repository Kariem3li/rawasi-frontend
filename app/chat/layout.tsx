"use client";
import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
import { usePathname } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import Pusher from 'pusher-js';
import { API_URL } from '@/lib/config';
import { useAuth } from '@/providers/AuthProvider';

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const [rooms, setRooms] = useState<any[]>([]);
  const pathname = usePathname();
  const isRootChat = pathname === '/chat' || pathname === '/chat/';
  const { user } = useAuth(); // 🚀 جلب المستخدم

  // 🚀 فصلنا جلب الغرف في دالة عشان نعرف نناديها من جوه البوشر
  const fetchRooms = useCallback(async () => {
    try {
      const response = await api.get('chat/rooms/');
      const fetchedRooms = Array.isArray(response.data) 
        ? response.data 
        : (response.data?.results || []);
        
      setRooms(fetchedRooms.filter((room: any) => room.last_message !== null));
    } catch (error) {
      console.error("خطأ في جلب الغرف:", error);
      setRooms([]);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms, pathname]);

  // 🚀 البوشر اللي بيتصنت على إشعاراتك وإنت فاتح أي صفحة في الشات
  useEffect(() => {
    const currentUserId = user?.id || (typeof window !== 'undefined' ? localStorage.getItem('user_id') : null);
    if (!currentUserId) return;

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

    const globalChannel = pusher.subscribe(`private-user_${currentUserId}`);

    globalChannel.bind('new_message_notification', (data: any) => {
      // 1. حدث اللستة عشان النقطة الحمرا تنور
      fetchRooms();

      // 2. قول للباك إند "أنا استلمت الرسالة" عشان يعمل للمرسل صحين رمادي
      if (data && data.id) {
          api.post(`chat/messages/${data.id}/delivered/`).catch((e) => console.log(e));
      }
    });

    return () => {
        globalChannel.unbind_all();
        globalChannel.unsubscribe();
        pusher.disconnect();
    };
  }, [user?.id, fetchRooms]);

  return (
    <div className="flex h-[calc(100vh-75px)] mt-[75px] bg-white overflow-hidden" dir="rtl">
      {/* القائمة الجانبية للمحادثات */}
      <div className={`${isRootChat ? 'block' : 'hidden'} md:block w-full md:w-[350px] shrink-0 border-l border-gray-200 bg-white flex flex-col`}>
        <div className="p-4 md:p-5 bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-amber-500" />
          <h2 className="font-black text-lg text-slate-800">الرسائل</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
            {rooms.length > 0 ? (
                rooms.map(room => (
                <Link 
                    href={`/chat/${room.id}`} 
                    key={room.id} 
                    className={`block p-4 border-b border-gray-50 transition-all hover:bg-slate-50 relative ${pathname === `/chat/${room.id}` ? 'bg-amber-50/50 before:absolute before:right-0 before:top-0 before:bottom-0 before:w-1 before:bg-amber-500' : ''}`}
                >
                    <div className="flex justify-between items-start mb-1.5">
                    <h3 className="font-bold text-slate-800 truncate pr-2">{room.other_user?.name || "مستخدم"}</h3>
                    {room.last_message && (
                        <span className="text-[10px] font-bold text-slate-400 shrink-0">
                        {new Date(room.last_message.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    )}
                    </div>
                    
                    <p className="text-[11px] font-bold text-amber-600 truncate mb-1 pr-2">
                        {room.listing_title}
                    </p>
                    
                    <div className="flex justify-between items-center pr-2 gap-2">
                        <p className={`text-xs truncate ${room.unread_count > 0 ? 'text-slate-800 font-bold' : 'text-slate-500 font-medium'}`}>
                            {room.last_message?.content || "لا توجد رسائل"}
                        </p>
                        
                        {/* النقطة الحمرا */}
                        {room.unread_count > 0 && (
                            <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[20px] text-center shrink-0">
                                {room.unread_count}
                            </span>
                        )}
                    </div>
                </Link>
                ))
            ) : (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center opacity-60">
                    <MessageCircle className="w-12 h-12 text-slate-300 mb-3" strokeWidth={1.5} />
                    <p className="text-sm font-bold text-slate-500">لا توجد محادثات حتى الآن</p>
                </div>
            )}
        </div>
      </div>

      {/* منطقة عرض المحادثة النشطة */}
      <div className={`${!isRootChat ? 'block' : 'hidden'} md:block flex-1 bg-[#efeae2] relative h-full`}>
        {children}
      </div>
    </div>
  );
}