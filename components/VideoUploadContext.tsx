"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/axios'; // ✅ استخدام الـ API الخاص بالمشروع
import { Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';

interface UploadContextType {
  startVideoUpload: (listingId: number, file: File) => void;
}

const VideoUploadContext = createContext<UploadContextType | null>(null);

export const useVideoUpload = () => {
  const context = useContext(VideoUploadContext);
  if (!context) throw new Error('useVideoUpload must be used within VideoUploadProvider');
  return context;
};

export const VideoUploadProvider = ({ children }: { children: React.ReactNode }) => {
  const [uploadState, setUploadState] = useState<{
    isUploading: boolean;
    progress: number;
    fileName: string;
    isSuccess: boolean;
    isError: boolean;
  }>({ isUploading: false, progress: 0, fileName: '', isSuccess: false, isError: false });

  // منع المستخدم من إغلاق المتصفح أثناء الرفع
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (uploadState.isUploading) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [uploadState.isUploading]);

  const startVideoUpload = async (listingId: number, file: File) => {
    setUploadState({ isUploading: true, progress: 0, fileName: file.name, isSuccess: false, isError: false });

    const chunkSize = 5 * 1024 * 1024; // 5 ميجا لكل جزء لتخفيف الضغط
    const totalChunks = Math.ceil(file.size / chunkSize);

    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);

      const formData = new FormData();
      formData.append('file', chunk);
      formData.append('content_range', `bytes ${start}-${end - 1}/${file.size}`);

      try {
        // ✅ استخدام api.post مباشرة، الرابط مطابق للباك إند بالظبط
        await api.post(`/listings/${listingId}/upload-video/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 0, // ✅ السطر ده مهم جداً لمنع الـ Broken Pipe وقت بطء النت
        });

        const currentProgress = Math.round(((i + 1) / totalChunks) * 100);
        setUploadState(prev => ({ ...prev, progress: currentProgress }));

        if (i === totalChunks - 1) {
            setUploadState(prev => ({ ...prev, isUploading: false, isSuccess: true }));
            setTimeout(() => setUploadState({ isUploading: false, progress: 0, fileName: '', isSuccess: false, isError: false }), 6000);
        }
      } catch (error) {
        console.error("Video upload failed:", error);
        setUploadState({ isUploading: false, progress: 0, fileName: 'فشل الرفع، تأكد من اتصالك بالإنترنت', isSuccess: false, isError: true });
        setTimeout(() => setUploadState({ isUploading: false, progress: 0, fileName: '', isSuccess: false, isError: false }), 6000);
        break;
      }
    }
  };

  return (
    <VideoUploadContext.Provider value={{ startVideoUpload }}>
      {children}
      
      {/* 🚀 نافذة الرفع العائمة (تصميم احترافي ثابت أسفل الشاشة) */}
      {(uploadState.isUploading || uploadState.isSuccess || uploadState.isError) && (
        <div dir="rtl" className="fixed bottom-24 left-4 right-4 md:left-auto md:right-8 md:bottom-8 z-[999999] bg-slate-900/95 backdrop-blur-xl text-white p-5 rounded-[1.5rem] shadow-[0_20px_40px_rgba(0,0,0,0.4)] border border-slate-700/50 w-auto md:w-96 animate-in slide-in-from-bottom-8 fade-in duration-500">
          <div className="flex items-center gap-4 mb-2">
            {uploadState.isError ? (
                <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
            ) : uploadState.isSuccess ? (
                <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>
            ) : (
                <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center shrink-0 relative">
                    <Loader2 className="w-5 h-5 text-amber-500 animate-spin absolute" />
                </div>
            )}
            
            <div className="flex-1 overflow-hidden">
              <p className={`text-sm font-black ${uploadState.isError ? 'text-red-400' : 'text-white'}`}>
                  {uploadState.isError ? "فشل رفع الفيديو!" : uploadState.isSuccess ? "تم رفع الفيديو بنجاح!" : "جاري رفع فيديو العقار..."}
              </p>
              <p className="text-xs text-slate-400 truncate mt-0.5" dir="ltr">{uploadState.fileName}</p>
            </div>
            
            {uploadState.isUploading && (
                <span className="text-base font-black text-amber-500 bg-slate-800 px-3 py-1 rounded-xl shrink-0">
                    {uploadState.progress}%
                </span>
            )}
          </div>
          
          {uploadState.isUploading && (
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden shadow-inner mt-4">
              <div 
                className="bg-gradient-to-r from-amber-600 to-amber-400 h-full rounded-full transition-all duration-300 ease-out relative" 
                style={{ width: `${uploadState.progress}%` }}
              >
                  <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
          )}
        </div>
      )}
    </VideoUploadContext.Provider>
  );
};