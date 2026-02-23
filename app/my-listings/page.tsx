"use client";

import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav"; 
import { useState, useEffect } from "react";
import { Loader2, Trash2, MapPin, Eye, Clock, CheckCircle2, XCircle, Plus, AlertCircle, Edit, Building2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getFullImageUrl } from "@/lib/config";
import api from "@/lib/axios";

export default function MyListings() {
  const router = useRouter(); 
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyListings = async () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');

      if (!token) { 
          router.push('/login'); 
          return; 
      }
      
      try {
        const res = await api.get('/listings/my_listings/');
        const data = res.data;
        const list = Array.isArray(data) ? data : (data.results || []);
        setListings(list);
      } catch (error) { 
          console.error(error);
      } finally { 
          setLoading(false); 
      }
    };

    fetchMyListings(); 
  }, [router]);

  const handleDelete = async (id: number) => {
    if (!confirm("تنبيه: سيتم حذف الإعلان نهائياً. هل أنت متأكد؟")) return;
    
    // واجهة متجاوبة: إخفاء العنصر فوراً قبل رد السيرفر
    const previousListings = [...listings];
    setListings(prev => prev.filter(item => item.id !== id));

    try {
      await api.delete(`/listings/${id}/`);
    } catch (error) { 
        setListings(previousListings); // إرجاع العنصر لو فشل الحذف
        alert("فشل حذف الإعلان. تأكد من اتصالك بالإنترنت."); 
    }
  };

  const getStatusBadge = (status: string) => {
      switch(status) {
          case 'Pending': return <span className="flex items-center gap-1.5 bg-amber-100 text-amber-700 px-2.5 py-1 rounded-md text-[10px] font-black"><Clock className="w-3.5 h-3.5"/> قيد المراجعة</span>;
          case 'Available': return <span className="flex items-center gap-1.5 bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-md text-[10px] font-black"><CheckCircle2 className="w-3.5 h-3.5"/> نشط</span>;
          case 'Sold': return <span className="flex items-center gap-1.5 bg-red-100 text-red-700 px-2.5 py-1 rounded-md text-[10px] font-black"><XCircle className="w-3.5 h-3.5"/> مباع</span>;
          default: return null;
      }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]"><Loader2 className="animate-spin text-amber-500 w-10 h-10"/></div>;

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-32 font-sans dir-rtl">
      <Navbar />

      {/* الهيدر الفخم */}
      <div className="bg-slate-900 text-white pt-24 pb-20 px-4 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto flex justify-between items-center mt-2">
            <div>
                <h1 className="text-3xl font-black flex items-center gap-3"><Building2 className="w-8 h-8 text-amber-500" /> إعلاناتي</h1>
                <p className="text-slate-400 text-sm mt-2 font-bold">لديك <span className="text-amber-500">{listings.length}</span> إعلانات مسجلة</p>
            </div>
            <Link href="/add-property" className="bg-amber-500 text-slate-900 p-3 md:px-6 md:py-3 rounded-2xl flex items-center justify-center gap-2 font-black shadow-[0_10px_20px_rgba(245,158,11,0.3)] hover:bg-amber-400 hover:-translate-y-1 transition-all active:scale-95">
                <Plus className="w-6 h-6 md:w-5 md:h-5" /> <span className="hidden md:inline">أضف عقار جديد</span>
            </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-10 relative z-20">
        {listings.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-center animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-sm">
                    <AlertCircle className="w-10 h-10 text-gray-300"/>
                </div>
                <h3 className="font-black text-slate-800 text-2xl mb-2">لا توجد إعلانات</h3>
                <p className="text-gray-500 text-sm mb-8">لم تقم بإضافة أي عقار حتى الآن. ابدأ الآن واعرض عقارك لآلاف المشترين.</p>
                <Link href="/add-property" className="bg-slate-900 text-white px-8 py-4 rounded-xl font-black text-base shadow-xl shadow-slate-900/20 hover:bg-amber-500 hover:text-slate-900 transition-all active:scale-95">
                    إضافة إعلانك الأول
                </Link>
            </div>
        ) : (
            <div className="space-y-4">
                {listings.map((item, index) => (
                    <div 
                        key={item.id} 
                        className="bg-white p-3 md:p-4 rounded-[1.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 transition-all hover:shadow-lg group animate-in slide-in-from-bottom duration-500"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        {/* صورة العقار */}
                        <div className="w-full md:w-48 h-48 md:h-full bg-slate-100 rounded-xl overflow-hidden shrink-0 relative">
                            <Image 
                                src={getFullImageUrl(item.thumbnail) || "/images/placeholder-property.jpg"} 
                                alt={item.title}
                                fill
                                sizes="(max-width: 768px) 100vw, 200px"
                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute top-2 right-2 shadow-md">
                                {getStatusBadge(item.status)}
                            </div>
                        </div>

                        {/* تفاصيل العقار والأزرار */}
                        <div className="flex-1 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-black text-slate-900 text-base md:text-lg line-clamp-1 pr-2">{item.title}</h3>
                                    <span className="text-[10px] text-gray-400 font-mono font-bold bg-gray-50 px-2 py-1 rounded shrink-0">{item.created_at?.split('T')[0]}</span>
                                </div>
                                
                                <div className="text-xs text-gray-500 flex items-center gap-1.5 mb-3 font-medium">
                                    <MapPin className="w-4 h-4 text-amber-500"/> {item.city_name} {item.major_zone_name ? `، ${item.major_zone_name}` : ''}
                                </div>
                                <div className="font-black text-slate-900 text-xl md:text-2xl mb-4">{Number(item.price).toLocaleString('ar-EG')} <span className="text-xs text-gray-400">ج.م</span></div>
                            </div>

                            {/* أزرار التحكم */}
                            <div className="flex gap-2 border-t border-gray-50 pt-3 mt-auto">
                                <Link href={`/listings/${item.id}`} className="flex-1 bg-gray-50 text-slate-700 py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center justify-center gap-1.5 hover:bg-slate-900 hover:text-white transition-all active:scale-95">
                                    <Eye className="w-4 h-4"/> <span className="hidden sm:inline">معاينة</span>
                                </Link>

                                <Link href={`/edit-property/${item.id}`} className="flex-[1.5] bg-amber-50 text-amber-700 py-2.5 rounded-xl text-xs md:text-sm font-black flex items-center justify-center gap-1.5 hover:bg-amber-500 hover:text-slate-900 transition-all border border-amber-100 active:scale-95 shadow-sm">
                                    <Edit className="w-4 h-4"/> تعديل
                                </Link>

                                <button onClick={() => handleDelete(item.id)} className="flex-1 bg-red-50 text-red-600 py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center justify-center gap-1.5 hover:bg-red-600 hover:text-white transition-all border border-red-100 active:scale-95">
                                    <Trash2 className="w-4 h-4"/> <span className="hidden sm:inline">حذف</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}