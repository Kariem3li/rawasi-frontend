"use client";
import React from 'react';

export default function MessageBubble({ msg }: { msg: any }) {
  const isMe = msg.is_me;
  const time = new Date(msg.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`flex ${isMe ? 'justify-start' : 'justify-end'} mb-4`}>
      <div className={`max-w-[85%] md:max-w-[70%] p-3 rounded-2xl shadow-sm relative ${
        isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
      }`}>
        <p className="text-[15px] leading-relaxed break-words">{msg.content}</p>
        <div className={`flex items-center justify-end mt-1 text-[11px] gap-1 ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
          <span>{time}</span>
          {isMe && <span className="text-[14px]">{msg.is_read ? '🔵🔵' : '✓✓'}</span>}
        </div>
      </div>
    </div>
  );
}