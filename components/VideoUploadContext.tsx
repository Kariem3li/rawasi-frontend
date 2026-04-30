"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '@/lib/axios';

export interface UploadState {
  isUploading: boolean;
  progress: number;
  fileName: string;
  isSuccess: boolean;
  isError: boolean;
}

interface UploadContextType {
  startVideoUpload: (listingId: number, file: File) => void;
  uploadState: UploadState;
}

const VideoUploadContext = createContext<UploadContextType | null>(null);

export const useVideoUpload = () => {
  const context = useContext(VideoUploadContext);
  if (!context) throw new Error('useVideoUpload must be used within VideoUploadProvider');
  return context;
};

export const VideoUploadProvider = ({ children }: { children: React.ReactNode }) => {
  const [uploadState, setUploadState] = useState<UploadState>({ 
    isUploading: false, progress: 0, fileName: '', isSuccess: false, isError: false 
  });

  // 🚀 السحر هنا: التحكم في التايمر لمنع تداخل الأحداث
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    // 🚀 تنظيف أي تايمر قديم لو العميل بدأ رفع جديد بسرعة
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    setUploadState({ isUploading: true, progress: 0, fileName: file.name, isSuccess: false, isError: false });

    const chunkSize = 5 * 1024 * 1024; // 5 ميجا
    const totalChunks = Math.ceil(file.size / chunkSize);

    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);

      const formData = new FormData();
      formData.append('file', chunk);
      formData.append('content_range', `bytes ${start}-${end - 1}/${file.size}`);

      try {
        await api.post(`/listings/${listingId}/upload-video/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 0, 
        });

        const currentProgress = Math.round(((i + 1) / totalChunks) * 100);
        setUploadState(prev => ({ ...prev, progress: currentProgress }));

        if (i === totalChunks - 1) {
            setUploadState(prev => ({ ...prev, isUploading: false, isSuccess: true }));
            timeoutRef.current = setTimeout(() => {
                setUploadState({ isUploading: false, progress: 0, fileName: '', isSuccess: false, isError: false });
            }, 4000);
        }
      } catch (error) {
        console.error("Video upload failed:", error);
        setUploadState({ isUploading: false, progress: 0, fileName: 'فشل الرفع، تأكد من الإنترنت', isSuccess: false, isError: true });
        timeoutRef.current = setTimeout(() => {
            setUploadState({ isUploading: false, progress: 0, fileName: '', isSuccess: false, isError: false });
        }, 5000);
        break; // الخروج من اللوب فوراً عند أول فشل
      }
    }
  };

  return (
    <VideoUploadContext.Provider value={{ startVideoUpload, uploadState }}>
      {children}
    </VideoUploadContext.Provider>
  );
};