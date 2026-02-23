"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Heart, User, Plus, Building2, LogIn, X } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  
  const [active, setActive] = useState(0);
  const [windowWidth, setWindowWidth] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingRoute, setPendingRoute] = useState(""); 

  const Menus = useMemo(() => [
    { name: "الرئيسية", href: "/", icon: Home, protected: false },
    { name: "إعلاناتي", href: "/my-listings", icon: Building2, protected: true },
    { name: "إضافة", href: "/add-property", icon: Plus, protected: true },
    { name: "المفضلة", href: "/saved", icon: Heart, protected: true },
    { name: "حسابي", href: "/profile", icon: User, protected: true },
  ], []);

  useEffect(() => {
    const index = Menus.findIndex((item) => item.href === pathname);
    if (index !== -1) setActive(index);
  }, [pathname, Menus]);

  useEffect(() => {
    setMounted(true);
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleNavClick = (e: React.MouseEvent, index: number, menu: any) => {
    if (menu.protected) {
        // فحص التوكن في كلا الذاكرتين
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        
        if (!token) {
            e.preventDefault(); 
            setPendingRoute(menu.href);
            setShowAuthModal(true);
            return;
        }
    }
    setActive(index);
  };

  const handleLoginRedirect = () => {
    setShowAuthModal(false);
    router.push("/login");
  };

  if (!mounted) return null;

  // الحسابات الرياضية للمنحنى السائل
  const itemWidth = windowWidth / 5;
  const center = (4 - active) * itemWidth + (itemWidth / 2);
  const curveWidth = 75; 
  const depth = 38;      
  const R = 30;          

  const path = `
    M0,${R}                         
    Q0,0 ${R},0                     
    L${center - curveWidth},0       
    C${center - curveWidth * 0.5},0 ${center - curveWidth * 0.35},${depth} ${center},${depth} 
    C${center + curveWidth * 0.35},${depth} ${center + curveWidth * 0.5},0 ${center + curveWidth},0 
    L${windowWidth - R},0           
    Q${windowWidth},0 ${windowWidth},${R} 
    L${windowWidth},80              
    L0,80                           
    Z                               
  `;

  return (
    <>
        {/* الحاوية الرئيسية مختفية في الديسك توب */}
        <div className="md:hidden fixed bottom-0 w-full z-40 drop-shadow-[0_-8px_20px_rgba(0,0,0,0.05)] animate-in slide-in-from-bottom-5 duration-500" dir="rtl">
        
        <svg 
            className="w-full h-20 fill-white" 
            width={windowWidth} 
            height="80"
            viewBox={`0 0 ${windowWidth} 80`}
            preserveAspectRatio="none"
        >
            <path 
                d={path} 
                className="transition-[d] duration-500 ease-[cubic-bezier(0.5,0,0.1,1.1)]" 
            />
        </svg>

        <div className="absolute top-0 left-0 w-full h-full">
            {/* ✅ الدائرة الطائرة المحسنة (اللون الذهبي مع توهج) */}
            <div 
                className="absolute -top-[24px] w-14 h-14 rounded-full flex justify-center items-center z-20 bg-amber-500 shadow-lg shadow-amber-500/40 border-[3px] border-white"
                style={{
                    left: `${center - 28}px`, 
                    transition: "left 0.5s cubic-bezier(0.5, 0, 0.1, 1.1)",
                }}
            >
                <span className="text-slate-900 animate-in zoom-in duration-300 transform scale-110">
                    {React.createElement(Menus[active].icon, { size: 24, strokeWidth: 2.5 })}
                </span>
            </div>

            <ul className="flex w-full h-full absolute top-0 right-0">
            {Menus.map((menu, i) => {
                const isActive = i === active;
                return (
                <li key={i} className="relative h-full flex-1 group">
                    <Link
                        href={menu.href}
                        className="flex flex-col items-center justify-center h-full w-full cursor-pointer pb-1"
                        onClick={(e) => handleNavClick(e, i, menu)}
                    >
                    {/* الأيقونة وهي غير نشطة */}
                    <span
                        className={`absolute top-6 transition-all duration-500 ease-out
                        ${isActive 
                            ? "opacity-0 translate-y-8 scale-50" 
                            : "opacity-100 translate-y-0 scale-100 text-slate-400 group-hover:text-amber-500 group-hover:-translate-y-1"}
                        `}
                    >
                        <menu.icon size={26} strokeWidth={1.5} />
                    </span>

                    {/* النص وهو نشط */}
                    <span
                        className={`absolute bottom-3 text-[11px] font-black transition-all duration-500 ease-out
                        ${isActive 
                            ? "opacity-100 translate-y-0 text-amber-600 delay-100" 
                            : "opacity-0 translate-y-4 text-transparent"}
                        `}
                    >
                        {menu.name}
                    </span>
                    </Link>
                </li>
                );
            })}
            </ul>
        </div>
        </div>

        {/* ✅ المودال الفخم الموحد مع Navbar */}
        {showAuthModal && (
            <div className="fixed inset-0 z-[99999] flex items-center justify-center px-4">
                <div 
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
                    onClick={() => setShowAuthModal(false)}
                ></div>

                <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl relative z-10 animate-in zoom-in duration-300 border border-gray-100">
                    <button 
                        onClick={() => setShowAuthModal(false)}
                        className="absolute top-5 right-5 text-gray-400 hover:text-red-500 transition bg-gray-50 p-1.5 rounded-full"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="text-center mt-2">
                        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-5 text-amber-600 shadow-inner">
                            <LogIn className="w-8 h-8 ml-1" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-2">تسجيل الدخول مطلوب</h3>
                        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                            للمتابعة واستخدام هذه الميزة، يرجى تسجيل الدخول إلى حسابك أو إنشاء حساب جديد.
                        </p>
                        
                        <div className="flex gap-3">
                            <button 
                                onClick={handleLoginRedirect}
                                className="flex-1 bg-amber-500 text-slate-900 font-black py-3.5 rounded-xl hover:bg-amber-400 transition shadow-lg shadow-amber-500/20 active:scale-95"
                            >
                                دخول
                            </button>
                            <button 
                                onClick={() => setShowAuthModal(false)}
                                className="flex-1 bg-gray-100 text-slate-600 font-bold py-3.5 rounded-xl hover:bg-gray-200 transition active:scale-95"
                            >
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </>
  );
}