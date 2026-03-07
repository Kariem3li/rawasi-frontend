'use client';

import { useState, useEffect } from 'react';

export default function InstallPrompt() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. فحص إذا كان التطبيق متسطب بالفعل
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) return;

    // 🚀 2. السحر هنا: استخدام sessionStorage بدل localStorage
    // كده لو قفل الرسالة، مش هتظهرله تاني طول ما هو فاتح الموقع (حتى لو راح صفحات تانية ورجع)
    // بس لو قفل التاب وفتح الموقع من جديد، هتظهرله تاني.
    const isDismissedThisSession = sessionStorage.getItem('installPromptDismissed');
    if (isDismissedThisSession) return;

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    
    if (isIosDevice) {
      setIsIOS(true);
      setTimeout(() => {
        setShowPrompt(true);
        setTimeout(() => setAnimateIn(true), 50); 
      }, 3500); // تظهر بعد 3.5 ثانية بهدوء
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      setTimeout(() => {
        setShowPrompt(true);
        setTimeout(() => setAnimateIn(true), 50);
      }, 3500);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      handleDismiss();
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setAnimateIn(false); 
    setTimeout(() => {
      setShowPrompt(false);
      // 🚀 حفظ الإغلاق في الجلسة الحالية فقط
      sessionStorage.setItem('installPromptDismissed', 'true');
    }, 400); 
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-x-0 bottom-24 z-[9999] px-4 sm:px-6 pointer-events-none flex justify-center">
      {/* 🌟 الكارت الرئيسي بتصميم زجاجي وتدرج لوني خفيف */}
      <div 
        className={`pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-[2.5rem] bg-white/80 backdrop-blur-2xl border border-white/60 p-6 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.1),0_0_40px_-10px_rgba(245,158,11,0.2)] transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] transform ${
          animateIn ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-20 opacity-0 scale-95'
        }`}
      >
        
        {/* زرار الإغلاق */}
        <button 
          onClick={handleDismiss}
          className="absolute top-5 right-5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100/80 text-slate-400 transition-all hover:bg-red-50 hover:text-red-500 hover:rotate-90 duration-300"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex items-center gap-4">
          {/* 🖼️ حل مشكلة الصورة مع إطار ذهبي احترافي */}
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl shadow-lg shadow-amber-500/30 p-0.5 bg-gradient-to-tr from-amber-400 to-amber-600">
            <div className="w-full h-full bg-white rounded-[14px] overflow-hidden">
              {/* لاحظ مسار الصورة اتصلح (شيلنا كلمة public) */}
              <img 
                src="/icons/Gemini_Generated_Image_ykgajuykgajuykga.png" 
                alt="شعار رواسي"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          <div className="flex-1">
            {/* نص بتدرج لوني */}
            <h3 className="text-xl font-black bg-gradient-to-l from-slate-900 to-slate-700 bg-clip-text text-transparent tracking-tight">
              رواسي للعقارات
            </h3>
            <div className="mt-1 flex items-center gap-1.5">
              <div className="flex text-amber-500 drop-shadow-sm">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="h-3.5 w-3.5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">تجربة أسرع</span>
            </div>
          </div>
        </div>

        <div className="mt-6">
          {isIOS ? (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100/50 p-4">
              <div className="flex items-start gap-3 relative z-10">
                <div className="mt-0.5 rounded-xl bg-white p-2 shadow-sm border border-blue-100 text-blue-500">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <p className="text-[13px] text-slate-700 font-medium leading-relaxed">
                  لتثبيت التطبيق، اضغط على <strong className="text-blue-700 font-black">المشاركة</strong> بالأسفل ثم اختر <br/> <strong className="text-blue-700 font-black">إضافة للشاشة الرئيسية (Add to Home Screen)</strong>
                </p>
              </div>
            </div>
          ) : (
            isInstallable && (
              <button 
                onClick={handleInstallClick}
                className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 p-[2px] shadow-lg shadow-amber-500/30 transition-all hover:scale-[1.02] active:scale-95"
              >
                {/* تأثير لمعة خفيفة بتتحرك جوا الزرار */}
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] transition-transform group-hover:translate-x-[100%] duration-1000 ease-in-out"></div>
                
                <div className="relative flex h-12 items-center justify-center gap-2 rounded-[14px] bg-gradient-to-r from-slate-900 to-slate-800 px-4 text-white transition-colors group-hover:from-slate-800 group-hover:to-slate-700">
                  <span className="font-black text-sm tracking-wide text-amber-50">تثبيت التطبيق مجاناً</span>
                  <svg className="h-5 w-5 text-amber-400 group-hover:animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </div>
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}