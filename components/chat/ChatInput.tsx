"use client";
import React, { useState } from 'react';

export default function ChatInput({ onSendMessage }: { onSendMessage: (text: string) => void }) {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendMessage(text);
    setText("");
  };

  return (
    <div className="bg-white p-3 border-t border-gray-200">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="اكتب رسالتك..."
          // 🚀 تم تغيير لون النص لـ slate-800 ليكون مقروء جداً على الموبايل
          className="flex-1 bg-gray-100 text-slate-800 font-medium rounded-full px-5 py-3 outline-none focus:ring-2 focus:ring-amber-500 transition-all placeholder:text-gray-400"
        />
        <button 
          type="submit" 
          disabled={!text.trim()}
          // 🚀 تم تغيير لون الزرار للذهبي بتاع الموقع (amber-500)
          className="bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-white rounded-full w-12 h-12 flex justify-center items-center transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  );
}