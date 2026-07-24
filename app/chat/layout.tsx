"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
import { usePathname } from 'next/navigation';

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const [rooms, setRooms] = useState<any[]>([]);
  const pathname = usePathname();
  const isRootChat = pathname === '/chat' || pathname === '/chat/';

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await api.get('/api/chat/rooms/');
        setRooms(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchRooms();
  }, []);

  return (
    <div className="flex h-[calc(100vh-80px)] bg-white border-t border-gray-200" dir="rtl">
      {/* القائمة الجانبية للمحادثات */}
      <div className={`${isRootChat ? 'block' : 'hidden'} md:block w-full md:w-1/3 lg:w-1/4 border-l border-gray-200 bg-white overflow-y-auto`}>
        <div className="p-4 bg-gray-50 border-b border-gray-200 sticky top-0 font-bold text-lg text-gray-800">
          المحادثات
        </div>
        {rooms.map(room => (
          <Link href={`/chat/${room.id}`} key={room.id} className="block p-4 border-b border-gray-100 hover:bg-gray-50 transition">
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-semibold text-gray-800 truncate">{room.other_user?.name || "مستخدم"}</h3>
              {room.last_message && (
                <span className="text-[11px] text-gray-400">
                  {new Date(room.last_message.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
            <p className="text-sm text-blue-600 truncate mb-1 text-[12px]">{room.listing_title}</p>
            <p className="text-sm text-gray-500 truncate">{room.last_message?.content || "لا توجد رسائل"}</p>
          </Link>
        ))}
        {rooms.length === 0 && <div className="p-4 text-center text-gray-500">لا توجد محادثات حتى الآن</div>}
      </div>

      {/* منطقة عرض المحادثة النشطة - تم التعديل هنا */}
      <div className={`${!isRootChat ? 'flex' : 'hidden'} md:flex flex-col w-full md:w-2/3 lg:w-3/4 h-full bg-[#efeae2] relative overflow-hidden`}>
        {children}
      </div>
    </div>
  );
}