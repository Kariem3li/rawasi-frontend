"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart3, Building, Users, MousePointerClick, Loader2, FileText, ArrowLeft } from "lucide-react";
import api from "@/lib/axios";

export default function AdminOverview() {
  const [stats, setStats] = useState({
    total_listings: 0,
    total_users: 0,
    total_views: 0,
    total_clicks: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const res = await api.get('/admin-dashboard/stats/', {
          headers: { Authorization: `Token ${token}` }
        });
        setStats(res.data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 🔝 الهيدر وزرار التنازلات */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h2 className="text-2xl font-black text-slate-800">نظرة عامة وإحصائيات</h2>
          
          {/* 🚀 الزرار الجديد الشيك للتنازلات */}
          <Link 
            href="/admin/waivers" 
            className="bg-slate-900 text-white px-6 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-amber-500 hover:text-slate-900 transition-all shadow-lg active:scale-95 border border-slate-800"
          >
            <FileText className="w-5 h-5" />
            إدارة التنازلات (Waivers)
            <ArrowLeft className="w-4 h-4 mr-1 hidden sm:block" />
          </Link>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {[
            { title: "إجمالي العقارات", value: stats.total_listings, icon: Building, color: "bg-blue-500" },
            { title: "المستخدمين النشطين", value: stats.total_users, icon: Users, color: "bg-emerald-500" },
            { title: "الزيارات الكلية", value: stats.total_views, icon: BarChart3, color: "bg-purple-500" },
            { title: "نقرات التواصل", value: stats.total_clicks, icon: MousePointerClick, color: "bg-amber-500" },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 md:w-14 md:h-14 ${stat.color} rounded-xl flex items-center justify-center text-white shadow-md shrink-0`}>
                <stat.icon className="w-6 h-6 md:w-7 md:h-7" />
              </div>
              <div>
                <p className="text-xs md:text-sm font-bold text-slate-500 mb-1">{stat.title}</p>
                <h3 className="text-xl md:text-2xl font-black text-slate-800">
                  {stat.value.toLocaleString('ar-EG')}
                </h3>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 📝 رسالة الترحيب المحدثة */}
      <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-2 h-full bg-amber-500"></div>
        <h3 className="font-black text-lg md:text-xl text-slate-800 mb-3">مرحباً بك في لوحة التحكم المركزية 🚀</h3>
        <p className="text-sm md:text-base text-slate-500 font-bold leading-relaxed max-w-4xl">
          من هنا يمكنك إدارة كل عقارات ومشاريع منصة رواسي بسهولة. تم تصميم هذه اللوحة خصيصاً لتوفير الوقت، وضغط الصور تلقائياً للحفاظ على سرعة الموقع، وإدارة بيانات السماسرة والعملاء بضغطة زر. يمكنك الآن متابعة التنازلات واستخراج بيانات العملاء المهتمين مباشرة.
        </p>
      </div>

    </div>
  );
}