"use client";

import { useEffect, useState } from "react";
import { BarChart3, Building, Users, MousePointerClick, Loader2 } from "lucide-react";
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
        // بنبعت التوكن عشان الباك إند يتأكد إننا الأدمن
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
      <h2 className="text-2xl font-black text-slate-800 mb-6">نظرة عامة وإحصائيات</h2>
      
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { title: "إجمالي العقارات", value: stats.total_listings, icon: Building, color: "bg-blue-500" },
            { title: "المستخدمين النشطين", value: stats.total_users, icon: Users, color: "bg-emerald-500" },
            { title: "الزيارات الكلية", value: stats.total_views, icon: BarChart3, color: "bg-purple-500" },
            { title: "نقرات التواصل", value: stats.total_clicks, icon: MousePointerClick, color: "bg-amber-500" },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className={`w-14 h-14 ${stat.color} rounded-xl flex items-center justify-center text-white shadow-md`}>
                <stat.icon className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 mb-1">{stat.title}</p>
                <h3 className="text-2xl font-black text-slate-800">
                  {stat.value.toLocaleString('ar-EG')}
                </h3>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 mt-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-amber-500"></div>
        <h3 className="font-black text-lg text-slate-800 mb-2">مرحباً بك في لوحة التحكم المركزية 🚀</h3>
        <p className="text-slate-500 font-medium leading-relaxed">
          من هنا يمكنك إدارة كل عقارات ومشاريع منصة رواسي بسهولة. تم تصميم هذه اللوحة خصيصاً لتوفير الوقت، وضغط الصور تلقائياً للحفاظ على سرعة الموقع، وإدارة بيانات السماسرة والعملاء بضغطة زر.
        </p>
      </div>
    </div>
  );
}