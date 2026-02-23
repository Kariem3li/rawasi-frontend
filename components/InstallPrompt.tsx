"use client";
import { useState, useEffect } from "react";
import { X, Download, Share } from "lucide-react";

export default function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. لو المستخدم قفل الرسالة قبل كده، متظهرش تاني لمدة يوم
    const isDismissed = localStorage.getItem("installPromptDismissed");
    if (isDismissed) {
        const lastDismissedTime = new Date(isDismissed).getTime();
        const now = new Date().getTime();
        // لو عدى أقل من 24 ساعة، ارجع وماتعرضش حاجة
        if (now - lastDismissedTime < 24 * 60 * 60 * 1000) return;
    }

    // 2. معالجة أجهزة أندرويد والكمبيوتر (Chrome/Edge)
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault(); // منع المتصفح من إظهار الرسالة الافتراضية
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // 3. معالجة أجهزة الآيفون (iOS)
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    // التأكد إن الموقع مش شغال أصلاً كـ تطبيق (Standalone)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    if (isIosDevice && !isStandalone) {
      setIsIOS(true);
      setShowPrompt(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleClose = () => {
    setShowPrompt(false);
    // احفظ إن المستخدم قفلها عشان متظهرش تاني النهاردة
    localStorage.setItem("installPromptDismissed", new Date().toISOString());
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:bottom-6 md:left-auto md:right-6 md:w-[400px] bg-slate-900/95 backdrop-blur-xl text-white p-5 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[9999] border border-white/10 animate-in slide-in-from-bottom-10 fade-in duration-500 dir-rtl">
      
      {/* زر الإغلاق */}
      <button 
        onClick={handleClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
      
      <div className="flex items-start gap-4 mt-1">
        {/* أيقونة التطبيق */}
        <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg border border-amber-300/30">
           <span className="font-black text-2xl text-slate-900">R</span>
        </div>

        <div className="flex-1 pr-1">
          <h3 className="font-black text-lg mb-1 text-white">تطبيق رواسي</h3>
          <p className="text-slate-300 text-xs mb-4 leading-relaxed font-medium">
            {isIOS 
              ? "لأفضل تجربة، قم بتثبيت التطبيق على الآيفون الخاص بك."
              : "ثبت التطبيق الآن لسهولة الوصول وتجربة أسرع."
            }
          </p>

          {isIOS ? (
            // تعليمات الآيفون بتصميم أحدث
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-[11px] space-y-2.5 font-bold text-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-slate-800 rounded-full flex items-center justify-center text-[9px] shadow-inner">1</span>
                <span>اضغط على أيقونة المشاركة</span>
                <Share className="w-4 h-4 text-blue-400 mr-auto" />
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 bg-slate-800 rounded-full flex items-center justify-center text-[9px] shadow-inner">2</span>
                <span>اختر "إضافة للشاشة الرئيسية"</span>
                <span className="w-4 h-4 border-2 border-slate-400 rounded flex items-center justify-center text-[10px] mr-auto">+</span>
              </div>
            </div>
          ) : (
            // زر الأندرويد بتصميم متناسق مع الموقع
            <button
              onClick={handleInstallClick}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-black py-3 rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 active:scale-95"
            >
              <Download className="w-4 h-4" /> تثبيت التطبيق مجاناً
            </button>
          )}
        </div>
      </div>
    </div>
  );
}