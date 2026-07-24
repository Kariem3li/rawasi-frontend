"use client";
import React from 'react';
import { Check, CheckCheck } from 'lucide-react'; // 🚀 استدعاء أيقونات الصح

export default function MessageBubble({ msg }: { msg: any }) {
  const isMe = msg.is_me;
  const time = new Date(msg.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`flex ${isMe ? 'justify-start' : 'justify-end'} mb-4`}>
      <div className={`max-w-[85%] md:max-w-[70%] p-3 shadow-sm relative ${
        isMe 
          ? 'bg-amber-500 text-slate-900 rounded-2xl rounded-tr-none' // 🚀 لون السيستم (البرتقالي/الذهبي)
          : 'bg-white text-slate-800 border border-gray-100 rounded-2xl rounded-tl-none' // لون الطرف الآخر
      }`}>
        
        <p className="text-[15px] font-bold leading-relaxed break-words">{msg.content}</p>
        
        <div className={`flex items-center justify-end mt-1.5 text-[11px] gap-1 font-bold ${isMe ? 'text-slate-800/80' : 'text-gray-400'}`}>
          <span>{time}</span>
          
          {/* 🚀 حالات الـ Seen زي الواتساب بالظبط */}
          {isMe && (
            <span className="flex items-center ml-1">
              {msg.is_read ? (
                // 1. تمت القراءة (صحين زرق)
                <CheckCheck className="w-[15px] h-[15px] text-blue-600" strokeWidth={3} />
              ) : msg.is_delivered ? (
                // 2. وصلت للطرف التاني بس لسه مشافهاش (صحين رمادي)
                <CheckCheck className="w-[15px] h-[15px] opacity-60" strokeWidth={2.5} />
              ) : (
                // 3. اتبعتت للسيرفر بس (صح واحدة رمادي)
                <Check className="w-[15px] h-[15px] opacity-60" strokeWidth={2.5} />
              )}
            </span>
          )}
        </div>

      </div>
    </div>
  );
}