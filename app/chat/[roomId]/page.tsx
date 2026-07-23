"use client";
import ChatWindow from '@/components/chat/ChatWindow';

export default function ChatRoomPage({ params }: { params: { roomId: string } }) {
  return <ChatWindow roomId={params.roomId} />;
}