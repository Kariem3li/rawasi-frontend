'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Download, Star, Share, PlusSquare } from 'lucide-react'; // 🚀 1. توحيد الأيقونات

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function InstallPrompt() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // التحقق هل التطبيق مثبت بالفعل
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    if (isStandalone) return;

    // التحقق هل العميل قفل النافذة في هذه الجلسة
    const isDismissedThisSession = sessionStorage.getItem('installPromptDismissed');
    if (isDismissedThisSession) return;

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    
    let showTimer: NodeJS.Timeout;
    let animateTimer: NodeJS.Timeout;

    if (isIosDevice) {
      setIsIOS(true);
      showTimer = setTimeout(() => {
        setShowPrompt(true);
        animateTimer = setTimeout(() => setAnimateIn(true), 50); 
      }, 4000); // 🚀 أخرناها لـ 4 ثواني عشان العميل يلحق ياخد نفسه في الموقع
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
      showTimer = setTimeout(() => {
        setShowPrompt(true);
        animateTimer = setTimeout(() => setAnimateIn(true), 50);
      }, 4000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      if (showTimer) clearTimeout(showTimer);
      if (animateTimer) clearTimeout(animateTimer);
    };
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
      sessionStorage.setItem('installPromptDismissed', 'true');
    }, 400); 
  };

  if (!showPrompt) return null;

  return (
    // 🚀 تأكد من إن الـ z-index عالي جداً والـ bottom يراعي لو فيه BottomNav
    <div className="fixed inset-x-0 bottom-24 md:bottom-10 z-[100000] px-4 sm:px-6 pointer-events-none flex justify-center dir-rtl font-sans">
      
      {/* 🌟 الكارت الرئيسي بتصميم زجاجي فاخر يتماشى مع "رواسي" */}
      <div 
        className={`pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-[2rem] bg-white/90 backdrop-blur-xl border border-white/60 p-6 shadow-[0_20px_40px_rgba(0,0,0,0.1),0_0_20px_rgba(245,158,11,0.1)] transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] transform ${
          animateIn ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-12 opacity-0 scale-95'
        }`}
      >
        
        {/* زرار الإغلاق الشيك */}
        <button 
          onClick={handleDismiss}
          className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition-all hover:bg-red-50 hover:text-red-500 hover:rotate-90 duration-300 shadow-sm"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-4 mb-5">
          {/* أيقونة التطبيق */}
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl shadow-lg shadow-amber-500/20 p-0.5 bg-gradient-to-tr from-amber-400 to-amber-600">
            <div className="relative w-full h-full bg-white rounded-[14px] overflow-hidden flex items-center justify-center">
              {/* ⚠️ حط مسار لوجو رواسي الفعلي هنا */}
              <Image 
                src="/icons/Gemini_Generated_Image_ykgajuykgajuykga.png" 
                alt="شعار رواسي"
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              رواسي للعقارات
            </h3>
            <div className="mt-1 flex items-center gap-2">
              <div className="flex text-amber-500 drop-shadow-sm">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                ))}
              </div>
              <span className="text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">مجاني</span>
            </div>
          </div>
        </div>

        <div className="mt-2">
          {isIOS ? (
            /* 🚀 تصميم تعليمات iOS بألوان الموقع (Slate & Amber) */
            <div className="relative overflow-hidden rounded-2xl bg-slate-50 border border-slate-200 p-4">
              <p className="text-xs text-slate-700 font-bold leading-relaxed">
                لتثبيت التطبيق، اضغط على زر المشاركة <Share className="inline w-4 h-4 text-slate-900 mx-1 mb-1"/> بالأسفل، 
                ثم اختر <br/>
                <span className="inline-flex items-center gap-1 mt-2 text-slate-900 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-sm">
                  <PlusSquare className="w-4 h-4 text-amber-500"/> إضافة للشاشة الرئيسية
                </span>
              </p>
            </div>
          ) : (
            isInstallable && (
              /* 🚀 زر التثبيت بستايل الموقع (Slate & Amber) */
              <button 
                onClick={handleInstallClick}
                className="w-full bg-slate-900 text-white h-12 rounded-xl font-black text-sm shadow-xl shadow-slate-900/20 hover:bg-amber-500 hover:text-slate-900 transition-all active:scale-95 flex items-center justify-center gap-2 group"
              >
                تنزيل التطبيق لتجربة أسرع
                <Download className="w-4 h-4 text-amber-500 group-hover:text-slate-900 group-hover:-translate-y-0.5 transition-all" />
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}