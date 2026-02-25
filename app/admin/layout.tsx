"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AdminGuard from "@/components/AdminGuard";
import { 
  LayoutDashboard, Building, Star, Users, 
  Map, Tags, Bell, Settings, LogOut 
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const menuItems = [
    { name: "الرئيسية", icon: LayoutDashboard, path: "/admin" },
    { name: "العقارات", icon: Building, path: "/admin/listings" },
    { name: "الإعلانات المميزة", icon: Star, path: "/admin/promotions" },
    { name: "المناطق الجغرافية", icon: Map, path: "/admin/geography" },
    { name: "التصنيفات والمواصفات", icon: Tags, path: "/admin/categories" },
    { name: "المستخدمين", icon: Users, path: "/admin/users" },
    { name: "الإشعارات الجماعية", icon: Bell, path: "/admin/broadcast" },
    { name: "إعدادات الموقع", icon: Settings, path: "/admin/settings" },
  ];

  return (
    <AdminGuard>
      <div className="min-h-screen bg-slate-50 flex dir-rtl font-sans">
        
        {/* 📋 القائمة الجانبية (Sidebar) */}
        <aside className="w-64 bg-slate-900 text-white flex-shrink-0 hidden md:flex flex-col shadow-2xl fixed h-full z-50">
          <div className="p-6 text-center border-b border-slate-800">
            <h2 className="text-2xl font-black tracking-wider">
              رواسي <span className="text-amber-500">أدمن</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-bold">لوحة التحكم المركزية</p>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar">
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link key={item.path} href={item.path}>
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                    isActive ? "bg-amber-500 text-slate-900 shadow-md" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}>
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-800">
            <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-red-400 hover:bg-red-500/10 transition-all">
              <LogOut className="w-5 h-5" />
              <span>العودة للموقع</span>
            </Link>
          </div>
        </aside>

        {/* 📄 منطقة المحتوى الرئيسية */}
        <main className="flex-1 md:mr-64 flex flex-col min-h-screen">
          {/* Header علوي بسيط للموبايل والترحيب */}
          <header className="bg-white h-20 shadow-sm border-b border-gray-100 flex items-center px-8 justify-between sticky top-0 z-40">
             <h1 className="font-black text-xl text-slate-800 hidden md:block">لوحة التحكم</h1>
             <div className="md:hidden font-black text-xl text-slate-900">رواسي <span className="text-amber-500">أدمن</span></div>
             <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
                    <Users className="w-5 h-5 text-slate-600" />
                 </div>
             </div>
          </header>

          <div className="p-4 md:p-8 flex-1">
            {children}
          </div>
        </main>

      </div>
    </AdminGuard>
  );
}