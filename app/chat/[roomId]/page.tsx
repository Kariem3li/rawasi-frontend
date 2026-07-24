"use client";
import ChatWindow from '@/components/chat/ChatWindow';
import { useParams } from 'next/navigation';

export default function ChatRoomPage() {
  const params = useParams();
  const roomId = params?.roomId as string;

  // لو الـ ID لسه مظهرش، بنستنى ثانية
  if (!roomId) return <div className="flex items-center justify-center h-full w-full">جاري تهيئة الغرفة...</div>;

  return <ChatWindow roomId={roomId} />;
}