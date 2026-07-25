"use client";

import Link from "next/link";
import { User, LogIn, Menu, X, LogOut, Home, PlusSquare, ShieldAlert, Building2, Heart, FileSearch, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation"; 
import NotificationBell from "./NotificationBell";
import { Logo } from "./logo"; 
import { useAuth } from "@/providers/AuthProvider"; 
import UploadIndicator from "./UploadIndicator"; 

// 🚀 استدعاء الهوك العالمي الجديد اللي بيتحكم في الشات والعداد
import { useGlobalChat } from '@/hooks/useGlobalChat';

export default function Navbar() {
  const router = useRouter(); 
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // 🚀 سحب العداد من الهوك العالمي
  const { unreadCount } = useGlobalChat();

  // قفل السكرول لما المنيو تفتح
  useEffect(() => {
    if (isSidebarOpen || showAuthModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isSidebarOpen, showAuthModal]);

  // إغلاق المنيو عند تغيير الصفحة
  useEffect(() => {
    setIsSidebarOpen(false);
    setShowAuthModal(false);
  }, [pathname]);

  const handleLogout = () => {
      if(window.confirm("هل تريد بالفعل تسجيل الخروج؟")) {
          logout(); 
          setIsSidebarOpen(false);
          router.push("/login"); 
      }
  };

  const handleProtectedClick = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    if (!isAuthenticated) {
        setIsSidebarOpen(false); 
        setShowAuthModal(true);  
    } else {
        setIsSidebarOpen(false);
        router.push(path);
    }
  };

  const handleLoginRedirect = () => {
    setShowAuthModal(false);
    router.push("/login");
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 h-[75px] bg-white/85 backdrop-blur-lg border-b border-gray-100 shadow-sm z-[900]">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
            
            <Link href="/" className="flex items-center z-50" aria-label="الصفحة الرئيسية">
               <Logo isWhite={false} className="h-10 w-auto hover:scale-105 transition-transform" />
            </Link>

            <div className="hidden md:flex items-center gap-8">
                <Link href="/" className={`font-bold text-sm transition-colors ${pathname === '/' ? 'text-amber-500' : 'text-slate-600 hover:text-amber-500'}`}>الرئيسية</Link>
                <button onClick={(e) => handleProtectedClick(e, '/my-listings')} className={`font-bold text-sm transition-colors ${pathname === '/my-listings' ? 'text-amber-500' : 'text-slate-600 hover:text-amber-500'}`}>إعلاناتي</button>
                <button onClick={(e) => handleProtectedClick(e, '/saved')} className={`font-bold text-sm transition-colors ${pathname === '/saved' ? 'text-amber-500' : 'text-slate-600 hover:text-amber-500'}`}>المفضلة</button>
                <Link href="/waivers" className={`font-bold text-sm flex items-center gap-1.5 transition-colors ${pathname === '/waivers' ? 'text-amber-500' : 'text-slate-600 hover:text-amber-500'}`}>
                    <FileSearch className="w-4 h-4" /> التنازلات
                </Link>
            </div>

            <div className="flex items-center gap-3 md:gap-4 relative z-[901]">
              
              <UploadIndicator />

              {user?.isStaff && (
                  <Link href="/admin" className="hidden md:flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-sm font-black shadow-lg shadow-slate-900/20 hover:bg-slate-800 hover:-translate-y-0.5 transition-all border border-slate-700">
                      <ShieldAlert className="w-4 h-4 text-amber-500"/> الإدارة
                  </Link>
              )}

              <button onClick={(e) => handleProtectedClick(e, '/add-property')} className="hidden md:flex items-center gap-2 bg-amber-500 text-slate-900 px-5 py-2.5 rounded-xl text-sm font-black shadow-lg shadow-amber-500/20 hover:bg-amber-400 hover:-translate-y-0.5 transition-all">
                  <PlusSquare className="w-4 h-4"/> أضف عقارك
              </button>

              <div className="animate-in fade-in duration-500 flex items-center gap-3">
                {isAuthenticated ? (
                  <>
                      {/* 🚀 أيقونة الشات الجديدة */}
                      <button onClick={(e) => handleProtectedClick(e, '/chat')} className="relative p-2 rounded-full text-slate-500 hover:bg-amber-50 hover:text-amber-600 transition-colors active:scale-95" aria-label="الرسائل">
                          <MessageCircle className="w-6 h-6" />
                          {/* 🚀 استخدام العداد الجديد */}
                          {unreadCount > 0 && (
                              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black flex items-center justify-center rounded-full border border-white">
                                  {unreadCount > 99 ? '99+' : unreadCount}
                              </span>
                          )}
                      </button>

                      <NotificationBell />
                      <Link href="/profile" className="relative group" aria-label="الملف الشخصي">
                          <div className="absolute -inset-1 bg-amber-500/30 rounded-full blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                          <div className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md border-2 border-white ring-1 ring-gray-100 relative transform group-hover:scale-105 transition-transform duration-300">
                              {user?.name ? user.name[0].toUpperCase() : <User className="w-5 h-5"/>}
                          </div>
                      </Link>
                  </>
                ) : (
                  <Link href="/login" className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 hover:-translate-y-0.5 transition-all">
                     <LogIn className="w-4 h-4"/> دخول
                  </Link>
                )}
              </div>

              <button onClick={() => setIsSidebarOpen(true)} aria-label="فتح القائمة" className="p-2 rounded-xl md:hidden active:scale-95 transition text-slate-800 hover:bg-gray-100 bg-gray-50 border border-gray-100">
                <Menu className="w-6 h-6" strokeWidth={2.5} />
              </button>
            </div>
        </div>
      </nav>

      <div className="h-[75px] w-full bg-transparent block"></div>

      <div 
        className={`md:hidden fixed inset-0 bg-slate-900/60 z-[9990] transition-opacity duration-300 backdrop-blur-sm ${isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`} 
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden="true"
      ></div>

      {/* القائمة الجانبية (Sidebar) */}
      <div className={`md:hidden fixed top-0 right-0 h-[100dvh] w-[85%] max-w-[320px] bg-white z-[9991] shadow-2xl transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "translate-x-full"}`}>
          <div className="flex flex-col h-full p-6 relative">
              <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">القائمة</h2>
                    <p className="text-xs text-gray-400 font-bold mt-1">تصفح أقسام الموقع</p>
                  </div>
                  <button onClick={() => setIsSidebarOpen(false)} aria-label="إغلاق القائمة" className="p-2 bg-gray-50 text-slate-400 rounded-full hover:bg-red-50 hover:text-red-500 transition shadow-sm border border-gray-100">
                    <X className="w-5 h-5" />
                  </button>
              </div>

              {isAuthenticated && (
                <Link href="/profile" onClick={() => setIsSidebarOpen(false)} className="mb-6 block group shrink-0">
                    <div className="bg-amber-50 p-4 rounded-2xl flex items-center gap-3 border border-amber-100/50 group-active:scale-95 transition-transform">
                        <div className="w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md">
                            {user?.name ? user.name[0].toUpperCase() : <User className="w-6 h-6"/>}
                        </div>
                        <div>
                            <p className="font-bold text-slate-900 line-clamp-1">{user?.name}</p>
                            <span className="text-xs text-amber-600 font-bold flex items-center gap-1">عرض الملف الشخصي <span className="text-lg leading-none">←</span></span>
                        </div>
                    </div>
                </Link>
              )}

              {user?.isStaff && (
                <Link href="/admin" onClick={() => setIsSidebarOpen(false)} className="mb-4 bg-slate-900 text-white p-3.5 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm shadow-lg shadow-slate-900/20 hover:scale-[1.02] transition-transform shrink-0 border border-slate-700">
                    <ShieldAlert className="w-5 h-5 text-amber-500"/> لوحة الإدارة
                </Link>
              )}

              <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-2 mb-4">
                  <Link href="/" className="flex items-center gap-4 p-3.5 rounded-2xl bg-gray-50 text-slate-700 font-bold hover:bg-slate-900 hover:text-white transition-all duration-300" onClick={() => setIsSidebarOpen(false)}><Home className="w-5 h-5"/> الرئيسية</Link>
                  <button onClick={(e) => handleProtectedClick(e, '/my-listings')} className="w-full flex items-center gap-4 p-3.5 rounded-2xl bg-gray-50 text-slate-700 font-bold hover:bg-slate-900 hover:text-white transition-all duration-300"><Building2 className="w-5 h-5"/> إعلاناتي</button>
                  <button onClick={(e) => handleProtectedClick(e, '/saved')} className="w-full flex items-center gap-4 p-3.5 rounded-2xl bg-gray-50 text-slate-700 font-bold hover:bg-slate-900 hover:text-white transition-all duration-300"><Heart className="w-5 h-5"/> المفضلة</button>
                  
                  {/* 🚀 أيقونة الشات في الموبايل */}
                  <button onClick={(e) => handleProtectedClick(e, '/chat')} className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-amber-50 text-amber-700 font-bold hover:bg-amber-500 hover:text-slate-900 transition-all duration-300">
                      <div className="flex items-center gap-4"><MessageCircle className="w-5 h-5"/> الرسائل</div>
                      {/* 🚀 استخدام العداد الجديد هنا برضو */}
                      {unreadCount > 0 && <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs">{unreadCount}</span>}
                  </button>

                  <button onClick={(e) => handleProtectedClick(e, '/add-property')} className="w-full flex items-center gap-4 p-3.5 rounded-2xl bg-gray-50 text-slate-700 font-bold hover:bg-slate-900 hover:text-white transition-all duration-300"><PlusSquare className="w-5 h-5"/> أضف عقار</button>
                  <Link href="/waivers" onClick={() => setIsSidebarOpen(false)} className="w-full flex items-center gap-4 p-3.5 rounded-2xl bg-blue-50 text-blue-700 font-bold hover:bg-blue-600 hover:text-white transition-all duration-300 border border-blue-100/50"><FileSearch className="w-5 h-5"/> الاستعلام عن التنازلات</Link>
                  
                  {!isAuthenticated && (
                    <Link href="/login" className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all duration-300 mt-6 shadow-md" onClick={() => setIsSidebarOpen(false)}><LogIn className="w-5 h-5"/> تسجيل الدخول</Link>
                  )}
              </div>

              {isAuthenticated && (
                  <div className="mt-auto pt-4 border-t border-gray-100 shrink-0">
                      <button onClick={handleLogout} className="flex items-center justify-center gap-2 text-red-600 bg-red-50 p-4 rounded-2xl font-bold hover:bg-red-100 transition shadow-sm w-full active:scale-95">
                          <LogOut className="w-5 h-5" /> تسجيل خروج
                      </button>
                  </div>
              )}
          </div>
      </div>

      {showAuthModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setShowAuthModal(false)} aria-hidden="true"></div>
            <div className="relative bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl z-10 animate-in zoom-in duration-300 border border-gray-100">
                <button onClick={() => setShowAuthModal(false)} aria-label="إغلاق النافذة" className="absolute top-5 right-5 text-gray-400 hover:text-red-500 transition bg-gray-50 p-1.5 rounded-full"><X className="w-5 h-5" /></button>
                <div className="text-center mt-2">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-5 text-amber-600 shadow-inner"><LogIn className="w-8 h-8 ml-1" /></div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">تسجيل الدخول مطلوب</h3>
                    <p className="text-gray-500 text-sm mb-8 leading-relaxed">للمتابعة واستخدام هذه الميزة، يرجى تسجيل الدخول إلى حسابك.</p>
                    <div className="flex gap-3">
                        <button onClick={handleLoginRedirect} className="flex-1 bg-amber-500 text-slate-900 font-black py-3.5 rounded-xl hover:bg-amber-400 transition shadow-lg shadow-amber-500/20 active:scale-95">دخول</button>
                        <button onClick={() => setShowAuthModal(false)} className="flex-1 bg-gray-100 text-slate-600 font-bold py-3.5 rounded-xl hover:bg-gray-200 transition active:scale-95">إلغاء</button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </>
  );
}