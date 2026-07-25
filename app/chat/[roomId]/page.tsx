"use client";
import ChatWindow from '@/components/chat/ChatWindow';
import { useParams } from 'next/navigation';

export default function ChatRoomPage() {
  const params = useParams();
  const roomId = params?.roomId as string;

  if (!roomId) {
      return (
          <div className="flex items-center justify-center h-full w-full bg-[#efeae2] text-slate-500 font-bold">
              جاري تهيئة الغرفة...
          </div>
      );
  }

  return (
      <div className="h-full w-full flex flex-col overflow-hidden">
          <ChatWindow roomId={roomId} />
      </div>
  );
}