"use client";
import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import { useChat } from '@/hooks/useChat';

export default function ChatWindow({ roomId }: { roomId: string }) {
  const { messages, loading, sendMessage } = useChat(roomId);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading) return <div className="flex items-center justify-center h-full">جاري التحميل...</div>;

  return (
    <div className="flex flex-col absolute inset-0 bg-[#efeae2]" dir="rtl">
      {/* منطقة الرسائل */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* مربع الكتابة */}
      <ChatInput onSendMessage={sendMessage} />
    </div>
  );
}