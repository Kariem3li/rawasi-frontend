"use client";

import { useVideoUpload } from './VideoUploadContext';
import { ArrowUp, Check, X, AlertCircle } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function UploadIndicator() {
  const { uploadState } = useVideoUpload();
  const [showTooltip, setShowTooltip] = useState(false);
  const indicatorRef = useRef<HTMLDivElement>(null);

  // 🚀 إغلاق الـ Tooltip عند الضغط خارجه (للموبايل)
  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (indicatorRef.current && !indicatorRef.current.contains(event.target as Node)) {
              setShowTooltip(false);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!uploadState.isUploading && !uploadState.isSuccess && !uploadState.isError) {
    return null; 
  }

  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (uploadState.progress / 100) * circumference;

  return (
    <div 
        ref={indicatorRef}
        className="relative flex items-center justify-center ml-2 md:ml-4 z-50" // 🚀 استخدمنا ml (Margin-Left) عشان الـ RTL
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
    >
      {/* الأيقونة الدائرية */}
      <button 
        onClick={() => setShowTooltip(!showTooltip)} // 🚀 دعم الموبايل
        className="relative flex items-center justify-center w-10 h-10 bg-slate-100 rounded-full shadow-sm cursor-pointer transition-all hover:bg-slate-200 active:scale-95 border border-slate-200 focus:outline-none"
      >
        {uploadState.isUploading && (
          <svg className="absolute inset-0 w-full h-full -rotate-90 transform" viewBox="0 0 40 40">
            <circle
              cx="20" cy="20" r={radius}
              className="text-slate-200 stroke-current"
              strokeWidth="3" fill="transparent"
            />
            <circle
              cx="20" cy="20" r={radius}
              className="text-amber-500 stroke-current transition-all duration-300 ease-out"
              strokeWidth="3" fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
        )}

        <div className="absolute inset-0 flex items-center justify-center z-10">
          {uploadState.isSuccess ? (
            <Check className="w-5 h-5 text-green-600 animate-in zoom-in duration-300" />
          ) : uploadState.isError ? (
            <X className="w-5 h-5 text-red-600 animate-in zoom-in duration-300" />
          ) : (
            <div className="relative flex items-center justify-center">
              <ArrowUp className="w-4 h-4 text-slate-700 animate-pulse" />
              <div className="absolute -bottom-1 w-2 h-0.5 bg-slate-700 rounded-full animate-bounce"></div>
            </div>
          )}
        </div>
      </button>

      {/* نافذة التفاصيل (Tooltip) */}
      {(showTooltip || uploadState.isError) && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-64 bg-slate-900 text-white p-3 rounded-2xl shadow-xl border border-slate-700 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-start gap-3">
             {uploadState.isError ? (
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
             ) : uploadState.isSuccess ? (
                <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
             ) : (
                <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin shrink-0 mt-0.5"></div>
             )}
             
             <div className="flex-1 overflow-hidden">
                <p className="text-xs font-bold text-slate-200 mb-1 line-clamp-1" dir="ltr">
                  {uploadState.fileName}
                </p>
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-black">
                  <span>
                    {uploadState.isError ? "فشل الرفع" : uploadState.isSuccess ? "اكتمل الرفع" : "جاري الرفع..."}
                  </span>
                  {!uploadState.isError && !uploadState.isSuccess && (
                     <span className="text-amber-400">{uploadState.progress}%</span>
                  )}
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}