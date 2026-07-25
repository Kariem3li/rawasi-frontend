"use client";
import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import { useChat } from '@/hooks/useChat';

export default function ChatWindow({ roomId }: { roomId: string }) {
  const { messages, loading, sendMessage } = useChat(roomId);
  const bottomRef = useRef<HTMLDivElement>(null);

  // 🚀 التمرير التلقائي لأسفل مع تأخير بسيط (100ms) لضمان تحميل الـ DOM ورسم الرسائل بالكامل
  useEffect(() => {
    const timeout = setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
    return () => clearTimeout(timeout);
  }, [messages]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-[#efeae2] text-slate-500 font-bold">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        جاري تحميل المحادثة...
      </div>
    );
  }

  return (
    // 🚀 1. استخدام h-full w-full بدلاً من absolute لمنع التمدد خارج الشاشة
    // 🚀 2. overflow-hidden هنا بتمنع الصفحة كلها من السكرول (السكرول هيكون جوه الرسايل بس)
    <div className="flex flex-col h-full w-full bg-[#efeae2] overflow-hidden" dir="rtl">
      
      {/* 🚀 منطقة الرسائل */}
      {/* flex-1: تأخذ المساحة المتبقية | overflow-y-auto: تفعل السكرول الداخلي */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
        <div className="flex flex-col space-y-2">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}
            
            {/* ديف مخفي لضمان التمرير للأسفل مع مسافة أمان لتجنب التصاق آخر رسالة بالكيبورد */}
            <div ref={bottomRef} className="h-4 shrink-0"></div>
        </div>
      </div>

      {/* 🚀 مربع الكتابة */}
      {/* shrink-0: تمنعه من الانضغاط أو الاختفاء مهما زاد عدد الرسائل */}
      {/* z-10: لضمان بقائه فوق أي عناصر أخرى */}
      <div className="shrink-0 w-full z-10 bg-[#efeae2]">
        <ChatInput onSendMessage={sendMessage} />
      </div>

    </div>
  );
}