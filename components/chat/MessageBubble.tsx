"use client";
import React from 'react';
import { Check, CheckCheck } from 'lucide-react';

export default function MessageBubble({ msg }: { msg: any }) {
  const isMe = msg.is_me;
  const time = new Date(msg.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`flex ${isMe ? 'justify-start' : 'justify-end'} mb-4`}>
      <div className={`max-w-[85%] md:max-w-[70%] p-3 shadow-sm relative ${
        isMe 
          ? 'bg-amber-500 text-slate-900 rounded-2xl rounded-tr-none' 
          : 'bg-white text-slate-800 border border-gray-100 rounded-2xl rounded-tl-none'
      }`}>
        
        <p className="text-[15px] font-bold leading-relaxed break-words">{msg.content}</p>
        
        <div className={`flex items-center justify-end mt-1.5 text-[11px] gap-1 font-bold ${isMe ? 'text-slate-900/70' : 'text-gray-400'}`}>
          <span>{time}</span>
          
          {isMe && (
            <span className="flex items-center ml-1">
              {msg.is_read ? (
                // 🚀 تم تغيير لون الصحين ليكون أبيض شفاف عشان يليق مع الخلفية الدهبي بدل الأزرق المزعج
                <CheckCheck className="w-[15px] h-[15px] text-white drop-shadow-sm" strokeWidth={3} />
              ) : msg.is_delivered ? (
                <CheckCheck className="w-[15px] h-[15px] opacity-50" strokeWidth={2.5} />
              ) : (
                <Check className="w-[15px] h-[15px] opacity-50" strokeWidth={2.5} />
              )}
            </span>
          )}
        </div>

      </div>
    </div>
  );
}