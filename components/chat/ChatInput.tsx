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
    <div className="bg-white p-3 border-t border-gray-200 shrink-0 w-full z-10 shadow-sm">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="اكتب رسالتك..."
          className="flex-1 bg-gray-100 rounded-full px-5 py-3 outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button 
          type="submit" 
          disabled={!text.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-full w-12 h-12 flex justify-center items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  );
}