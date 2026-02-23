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

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) return;

    // لو قفله، هيختفي لمدة 24 ساعة ويرجع يظهر تاني
    const lastDismissed = localStorage.getItem('installPromptDismissed');
    if (lastDismissed) {
      const timePassed = Date.now() - parseInt(lastDismissed, 10);
      const oneDay = 24 * 60 * 60 * 1000;
      if (timePassed < oneDay) return;
    }

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    
    if (isIosDevice) {
      setIsIOS(true);
      setTimeout(() => {
        setShowPrompt(true);
        setTimeout(() => setAnimateIn(true), 50); // أنيميشن الظهور الناعم
      }, 3000); // بيظهر بعد 3 ثواني من فتح الموقع عشان ميزعجش العميل
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      setTimeout(() => {
        setShowPrompt(true);
        setTimeout(() => setAnimateIn(true), 50);
      }, 3000);
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
    setAnimateIn(false); // أنيميشن الاختفاء أولاً
    setTimeout(() => {
      setShowPrompt(false);
      localStorage.setItem('installPromptDismissed', Date.now().toString());
    }, 400); // نستنى الأنيميشن يخلص قبل ما نشيله من الشاشة
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[9999] px-4 pb-6 sm:px-6 sm:pb-8 pointer-events-none flex justify-center">
      {/* البوكس الرئيسي مع الأنيميشن */}
      <div 
        className={`pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-[2rem] bg-white/95 backdrop-blur-xl border border-white/50 p-5 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] transition-all duration-500 ease-out transform ${
          animateIn ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}
      >
        
        {/* زرار الإغلاق (X) الشيك */}
        <button 
          onClick={handleDismiss}
          className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100/80 text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-800"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex items-start gap-4 mt-2">
          {/* 🔴 هنا تقدري تغيري لون خلفية الأيقونة للون موقعك (بدل bg-slate-900) 🔴 */}
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-amber-600 shadow-lg">
            {/* لو عندك صورة اللوجو، امسحي الـ svg ده وحطي <img src="/logo.png" /> */}
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent"></div>
          </div>
          
          <div className="flex-1 pt-1">
            <h3 className="text-[1.15rem] font-extrabold text-slate-900 tracking-tight">رواسي للعقارات</h3>
            <div className="mt-1 flex items-center gap-1">
              {/* نجوم التقييم لإعطاء إحساس بالثقة */}
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="h-3.5 w-3.5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-xs font-medium text-slate-500">تجربة أسرع</span>
            </div>
          </div>
        </div>

        {/* الأكشن: زرار التسطيب أو تعليمات الآيفون */}
        <div className="mt-6">
          {isIOS ? (
            <div className="relative overflow-hidden rounded-xl bg-slate-50 border border-slate-100 p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-lg bg-white p-1.5 shadow-sm">
                  <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  لتثبيت التطبيق، اضغط على زر <strong className="text-slate-900 font-bold">المشاركة</strong> بالأسفل ثم اختر <strong className="text-slate-900 font-bold">إضافة للشاشة الرئيسية</strong>
                </p>
              </div>
            </div>
          ) : (
            isInstallable && (
              /* 🔴 هنا تقدري تغيري لون الزرار للون موقعك (بدل bg-slate-900) 🔴 */
              <button 
                onClick={handleInstallClick}
                className="group relative w-full overflow-hidden rounded-xl bg-slate-900 px-4 py-3.5 font-bold text-white transition-all hover:bg-amber-600 active:scale-[0.98] shadow-md"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full transition-transform group-hover:translate-y-0 duration-300"></div>
                <span className="relative flex items-center justify-center gap-2 text-[15px]">
                  تثبيت التطبيق الآن
                  <svg className="h-5 w-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </span>
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}