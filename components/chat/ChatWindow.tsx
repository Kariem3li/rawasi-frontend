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

  if (loading) return <div className="flex items-center justify-center h-full w-full">جاري التحميل...</div>;

  return (
    // التعديل السحري هنا: absolute inset-0 تجعل هذا المكون يأخذ 100% من مساحة الأب (الـ layout) بدون أن يتمدد
    <div className="absolute inset-0 flex flex-col bg-[#efeae2]" dir="rtl">
      
      {/* منطقة الرسائل */}
      {/* flex-1 تسمح للمنطقة بالتمدد، overflow-y-auto تظهر السكرول بار، pb-6 تعطي مسافة بين آخر رسالة ومربع الكتابة */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-6">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}
        {/* ديف مخفي لعمل سكرول إليه */}
        <div ref={bottomRef} className="h-2" />
      </div>

      {/* مربع الكتابة */}
      {/* shrink-0 تمنع مربع الكتابة من الانضغاط أو الاختفاء إذا كثرت الرسائل */}
      {/* mt-auto تضمن بقاءه دائماً في الأسفل */}
      <div className="shrink-0 w-full mt-auto">
        {/* بما أن ChatInput بداخله الخلفية البيضاء، لا داعي لوضع لون خلفية إضافي هنا */}
        <ChatInput onSendMessage={sendMessage} />
      </div>

    </div>
  );
}