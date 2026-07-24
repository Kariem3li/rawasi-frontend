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
    /* خلينا الحاوية fixed عشان تملأ الشاشة بالكامل ومحدش يقدر يخفيها */
    <div className="fixed inset-0 z-50 flex flex-col bg-[#efeae2]" dir="rtl">
      
      {/* هيدر بسيط عشان تقدري تقفلي الشات وترجعي للموقع (مهم جداً عشان الـ fixed) */}
      <div className="bg-white p-4 border-b flex items-center justify-between shrink-0 shadow-sm">
         <h2 className="font-bold text-lg">المحادثة</h2>
         <button onClick={() => window.history.back()} className="text-gray-500 hover:text-red-500">
           إغلاق ✕
         </button>
      </div>

      {/* منطقة الرسائل بتاخد باقي المساحة وتعمل سكرول */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* مربع الكتابة */}
      <div className="shrink-0 bg-white">
        <ChatInput onSendMessage={sendMessage} />
      </div>
      
    </div>
  );
}