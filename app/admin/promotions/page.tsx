"use client";

import { useEffect, useState } from "react";
import { Loader2, Star, Eye, MousePointerClick, Edit, Power, PowerOff } from "lucide-react";
import api from "@/lib/axios";
import Link from "next/link";

export default function AdminPromotions() {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await api.get('/admin-dashboard/promotions/', {
        headers: { Authorization: `Token ${token}` }
      });
      setPromotions(res.data);
    } catch (error) {
      console.error("Error fetching promotions:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id: number) => {
    setActionLoading(id);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await api.post(`/admin-dashboard/promotions/${id}/toggle/`, {}, {
        headers: { Authorization: `Token ${token}` }
      });
      
      // تحديث الجدول محلياً
      setPromotions(promotions.map(p => p.id === id ? { ...p, is_active: res.data.is_active } : p));
    } catch (error) {
      alert("حدث خطأ أثناء تغيير الحالة.");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="w-10 h-10 animate-spin text-amber-500" /></div>;
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
            <div className="bg-amber-100 p-2 rounded-lg"><Star className="w-6 h-6 text-amber-600" /></div>
            <h2 className="text-2xl font-black text-slate-800">الإعلانات المميزة والمشاريع</h2>
        </div>
        <Link href="/admin/promotions/add" className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-amber-500 hover:text-slate-900 transition-colors shadow-md inline-block">
        + إضافة مشروع/إعلان جديد
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="p-4 font-black text-slate-500 text-sm">عنوان الإعلان</th>
                <th className="p-4 font-black text-slate-500 text-sm">النوع</th>
                <th className="p-4 font-black text-slate-500 text-sm text-center">الإحصائيات</th>
                <th className="p-4 font-black text-slate-500 text-sm">الحالة</th>
                <th className="p-4 font-black text-slate-500 text-sm">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {promotions.map((promo) => (
                <tr key={promo.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-bold text-slate-800 text-sm max-w-[200px] truncate">{promo.title}</td>
                  <td className="p-4 font-bold text-sm text-slate-600">
                    <span className="bg-gray-100 px-2 py-1 rounded-md text-xs">{promo.type}</span>
                  </td>
                  <td className="p-4">
                      <div className="flex items-center justify-center gap-4 text-[11px] font-bold text-slate-500">
                          <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5 text-blue-500"/> {promo.views}</span>
                          <span className="flex items-center gap-1"><MousePointerClick className="w-3.5 h-3.5 text-amber-500"/> {promo.clicks}</span>
                      </div>
                  </td>
                  <td className="p-4">
                      {promo.is_active ? 
                        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">نشط</span> : 
                        <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-bold">متوقف</span>
                      }
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {/* زرار الإيقاف والتشغيل السريع */}
                      <button 
                        onClick={() => toggleStatus(promo.id)}
                        disabled={actionLoading === promo.id}
                        className={`p-2 rounded-lg transition disabled:opacity-50 ${promo.is_active ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                        title={promo.is_active ? "إيقاف الإعلان" : "تفعيل الإعلان"}
                      >
                        {actionLoading === promo.id ? <Loader2 className="w-4 h-4 animate-spin" /> : (promo.is_active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />)}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {promotions.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 font-bold">لا توجد إعلانات مميزة حالياً.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}