'use client';

import { useState, useEffect } from 'react';

export default function InstallPrompt() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // 1. التأكد إننا في البراوزر مش السيرفر
    if (typeof window === 'undefined') return;

    // 2. هل التطبيق متسطب أصلاً؟ (لو متسطب مش هنكمل)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) return;

    // 3. هل اليوزر قفل الرسالة قريب؟ (أقل من 24 ساعة)
    const lastDismissed = localStorage.getItem('installPromptDismissed');
    if (lastDismissed) {
      const timePassed = Date.now() - parseInt(lastDismissed, 10);
      const oneDay = 24 * 60 * 60 * 1000;
      if (timePassed < oneDay) return; // لسه معداش يوم
    }

    // 4. اكتشاف نظام iOS (أيفون وأيباد)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    
    if (isIosDevice) {
      setIsIOS(true);
      // في iOS مفيش حدث بيتبعت، بنظهرها على طول بعد ثانيتين شياكة
      setTimeout(() => setShowPrompt(true), 2000);
    }

    // 5. اكتشاف نظام أندرويد (الاستماع لحدث التسطيب)
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault(); // نمنع ظهور الرسالة الافتراضية البايخة بتاعت البراوزر
      setDeferredPrompt(e);
      setIsInstallable(true);
      setTimeout(() => setShowPrompt(true), 2000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // دالة لما اليوزر يدوس "تسطيب" (للأندرويد)
  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  // دالة لما اليوزر يقفل الرسالة (نسجل الوقت)
  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('installPromptDismissed', Date.now().toString());
  };

  // لو مفيش سبب لظهور الرسالة، مانعرضش حاجة
  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-[95%] max-w-sm z-50">
      {/* البوكس بتأثير الزجاج (Glassmorphism) وتصميم مودرن */}
      <div className="bg-white/80 backdrop-blur-lg border border-white/40 shadow-2xl rounded-3xl p-5 flex flex-col gap-3 animate-[bounce_1s_ease-in-out]">
        
        {/* زرار الإغلاق */}
        <button 
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex items-center gap-4">
          {/* أيقونة شيك (ممكن تبدليها بلوجو موقعك) */}
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shrink-0">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </div>
          
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 text-lg leading-tight">حمل التطبيق بتاعنا!</h3>
            <p className="text-sm text-gray-600 mt-1">
              تجربة أسرع وأسهل للوصول لعقاراتك في أي وقت.
            </p>
          </div>
        </div>

        {/* الأكشن بناءً على نوع الموبايل */}
        <div className="mt-2">
          {isIOS ? (
            <div className="bg-blue-50 rounded-xl p-3 text-sm text-blue-800 flex items-center gap-2 border border-blue-100">
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span>اضغط على أيقونة المشاركة (Share) تحت، واختار <strong>Add to Home Screen</strong></span>
            </div>
          ) : (
            isInstallable && (
              <button 
                onClick={handleInstallClick}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-md active:scale-95"
              >
                تسطيب الآن 🚀
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}