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
    <div className="relative w-full h-full bg-[#efeae2]" dir="rtl">
      {/* منطقة الرسائل: متثبتة فوق وسايبة 75 بيكسل تحت عشان مربع الكتابة */}
      <div className="absolute top-0 left-0 right-0 bottom-[75px] overflow-y-auto p-4 md:p-6 pb-20">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* مربع الكتابة: متثبت إجبارياً في الأسفل */}
      <div className="absolute bottom-0 left-0 right-0 z-50">
        <ChatInput onSendMessage={sendMessage} />
      </div>
    </div>
  );
}