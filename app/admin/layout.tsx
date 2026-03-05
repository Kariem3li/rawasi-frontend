"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AdminGuard from "@/components/AdminGuard";
import { 
  LayoutDashboard, Building, Star, Users, 
  Map, FileText, LogOut, Menu, X 
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 🚀 قفل المنيو أوتوماتيك أول ما ننتقل لصفحة تانية (على الموبايل)
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const menuItems = [
    { name: "الرئيسية", icon: LayoutDashboard, path: "/admin" },
    { name: "العقارات", icon: Building, path: "/admin/listings" },
    { name: "الإعلانات المميزة", icon: Star, path: "/admin/promotions" },
    { name: "المناطق الجغرافية", icon: Map, path: "/admin/geography" },
    { name: "إدارة التنازلات", icon: FileText, path: "/admin/waivers" }, // 👈 ضفناها هنا
    { name: "المستخدمين والإشعارات", icon: Users, path: "/admin/users" },
  ];

  return (
    <AdminGuard>
      <div className="min-h-screen bg-slate-50 flex dir-rtl font-sans">
        
        {/* 📱 طبقة شفافة ورا المنيو للموبايل (عشان تقفل المنيو لما تدوس بره) */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* 📋 القائمة الجانبية (متوافقة مع الموبايل والشاشات الكبيرة) */}
        <aside className={`fixed inset-y-0 right-0 z-50 w-64 bg-slate-900 text-white flex flex-col shadow-2xl transition-transform duration-300 ease-in-out md:translate-x-0 ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}>
          <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800 shrink-0">
            <div>
              <h2 className="text-2xl font-black tracking-wider">
                رواسي <span className="text-amber-500">أدمن</span>
              </h2>
              <p className="text-[10px] text-slate-400 mt-1 font-bold">لوحة التحكم المركزية</p>
            </div>
            {/* زرار قفل المنيو للموبايل */}
            <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
            {menuItems.map((item) => {
              // تظبيط الـ Active State عشان الرئيسية متفضلش منورة على طول
              const isActive = pathname === item.path || (item.path !== '/admin' && pathname.startsWith(item.path + '/'));
              return (
                <Link key={item.path} href={item.path}>
                  <div className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold transition-all ${
                    isActive ? "bg-amber-500 text-slate-900 shadow-md" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}>
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-800 shrink-0">
            <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-red-400 hover:bg-red-500/10 transition-all">
              <LogOut className="w-5 h-5" />
              <span>العودة للموقع</span>
            </Link>
          </div>
        </aside>

        {/* 📄 منطقة المحتوى الرئيسية */}
        <main className="flex-1 md:mr-64 flex flex-col min-h-screen w-full">
          {/* هيدر الموبايل والشاشات */}
          <header className="bg-white h-20 shadow-sm border-b border-gray-100 flex items-center px-4 md:px-8 justify-between sticky top-0 z-30">
             <div className="flex items-center gap-4">
               {/* زرار فتح المنيو (يظهر في الموبايل بس) */}
               <button 
                 onClick={() => setIsMobileMenuOpen(true)}
                 className="md:hidden p-2.5 bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200 active:scale-95"
               >
                 <Menu className="w-6 h-6" />
               </button>
               <h1 className="font-black text-xl text-slate-800 hidden md:block">لوحة التحكم</h1>
               <div className="md:hidden font-black text-xl text-slate-900">رواسي <span className="text-amber-500">أدمن</span></div>
             </div>
             
             <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
                    <Users className="w-5 h-5 text-slate-600" />
                 </div>
             </div>
          </header>

          <div className="p-4 md:p-8 flex-1 w-full max-w-[100vw] overflow-x-hidden">
            {children}
          </div>
        </main>

      </div>
    </AdminGuard>
  );
}