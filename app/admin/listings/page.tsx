"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle, XCircle, Eye, Tag, Home } from "lucide-react";
import api from "@/lib/axios";
import Link from "next/link";

export default function AdminListings() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await api.get('/admin-dashboard/listings/', {
        headers: { Authorization: `Token ${token}` }
      });
      setListings(res.data);
    } catch (error) {
      console.error("Error fetching listings:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, newStatus: string) => {
    if (!confirm(`هل أنت متأكد من تغيير حالة العقار إلى ${newStatus === 'Available' ? 'مقبول' : 'معلق'}؟`)) return;
    
    setActionLoading(id);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await api.post(`/admin-dashboard/listings/${id}/status/`, { status: newStatus }, {
        headers: { Authorization: `Token ${token}` }
      });
      
      // تحديث الجدول محلياً بدون ريفريش
      setListings(listings.map(l => l.id === id ? { ...l, status: newStatus } : l));
    } catch (error) {
      alert("حدث خطأ أثناء تحديث الحالة.");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Available': return <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">نشط (مقبول)</span>;
      case 'Pending': return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">قيد المراجعة</span>;
      case 'Sold': return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">مباع</span>;
      default: return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="w-10 h-10 animate-spin text-amber-500" /></div>;
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black text-slate-800">إدارة العقارات</h2>
        <Link href="/add-property" className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-amber-500 hover:text-slate-900 transition-colors shadow-md">
          + إضافة عقار جديد
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="p-4 font-black text-slate-500 text-sm">العقار</th>
                <th className="p-4 font-black text-slate-500 text-sm">الناشر</th>
                <th className="p-4 font-black text-slate-500 text-sm">السعر</th>
                <th className="p-4 font-black text-slate-500 text-sm">الحالة</th>
                <th className="p-4 font-black text-slate-500 text-sm">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {listings.map((listing) => (
                <tr key={listing.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-slate-800 text-sm max-w-[200px] truncate">{listing.title}</p>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 font-medium">
                      <Tag className="w-3 h-3" /> {listing.offer_type} | <Home className="w-3 h-3" /> {listing.created_at}
                    </div>
                  </td>
                  <td className="p-4 font-bold text-sm text-slate-600">{listing.agent_name}</td>
                  <td className="p-4 font-black text-amber-600 text-sm">{Number(listing.price).toLocaleString('ar-EG')} ج</td>
                  <td className="p-4">{getStatusBadge(listing.status)}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {/* زرار المشاهدة */}
                      <Link href={`/property/${listing.id}`} target="_blank" className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition" title="مشاهدة">
                        <Eye className="w-4 h-4" />
                      </Link>
                      
                      {/* زرار القبول (يظهر لو العقار مش مقبول) */}
                      {listing.status !== 'Available' && (
                        <button 
                          onClick={() => updateStatus(listing.id, 'Available')}
                          disabled={actionLoading === listing.id}
                          className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition disabled:opacity-50"
                          title="موافقة ونشر"
                        >
                          {actionLoading === listing.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                      )}

                      {/* زرار الرفض/التعليق (يظهر لو العقار مقبول) */}
                      {listing.status === 'Available' && (
                        <button 
                          onClick={() => updateStatus(listing.id, 'Pending')}
                          disabled={actionLoading === listing.id}
                          className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition disabled:opacity-50"
                          title="تعليق الإعلان"
                        >
                          {actionLoading === listing.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              
              {listings.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 font-bold">لا توجد عقارات حالياً.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}