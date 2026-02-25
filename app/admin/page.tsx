"use client";

import { BarChart3, Building, Users, MousePointerClick } from "lucide-react";

export default function AdminOverview() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-black text-slate-800 mb-6">نظرة عامة وإحصائيات</h2>
      
      {/* كروت الإحصائيات الوهمية (لحد ما نربطها بالباك إند) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: "إجمالي العقارات", value: "...", icon: Building, color: "bg-blue-500" },
          { title: "إجمالي المستخدمين", value: "...", icon: Users, color: "bg-emerald-500" },
          { title: "الزيارات الكلية", value: "...", icon: BarChart3, color: "bg-purple-500" },
          { title: "نقرات التواصل", value: "...", icon: MousePointerClick, color: "bg-amber-500" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className={`w-14 h-14 ${stat.color} rounded-xl flex items-center justify-center text-white shadow-md`}>
              <stat.icon className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500 mb-1">{stat.title}</p>
              <h3 className="text-2xl font-black text-slate-800">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center py-20">
        <p className="text-slate-500 font-bold text-lg">جاري تجهيز التحليلات والرسوم البيانية... 🚀</p>
      </div>
    </div>
  );
}