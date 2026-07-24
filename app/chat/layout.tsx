"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
import { usePathname } from 'next/navigation';
import { MessageCircle } from 'lucide-react'; // أيقونة إضافية للزينة

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const [rooms, setRooms] = useState<any[]>([]);
  const pathname = usePathname();
  const isRootChat = pathname === '/chat' || pathname === '/chat/';

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await api.get('chat/rooms/');
        console.log("الرد الكامل من السيرفر:", response);
        console.log("الداتا اللي راجعة:", response.data);
        // 🚀 السحر هنا: لو الداتا جاية في Object بسبب الـ Pagination بناخد الـ results
        const fetchedRooms = Array.isArray(response.data) 
          ? response.data 
          : (response.data?.results || []);
          
        setRooms(fetchedRooms);
      } catch (error) {
        console.error("خطأ في جلب الغرف:", error);
        setRooms([]);
      }
    };
    fetchRooms();
  }, [pathname]); // 🚀 ضفنا pathname عشان لو اتنقل بين الغرف اللستة تتحدث

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
                        
                        {/* 🚀 إظهار النقطة الحمرا لو الغرفة فيها رسايل جديدة */}
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