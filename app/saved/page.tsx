"use client";

import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import { useState, useEffect, useCallback } from "react";
import { Loader2, Heart, MapPin, DollarSign, Trash2, Eye, Bed, Bath, Search } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getFullImageUrl } from "@/lib/config";
import api from "@/lib/axios";
import { globalFavStore } from "@/components/FavoriteButton"; // ✅ استدعاء الذاكرة العالمية

export default function SavedListings() {
  const router = useRouter();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = useCallback(async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    if (!token) { 
        router.push('/login'); 
        return; 
    }

    try {
      const res = await api.get('/favorites/');
      const data = res.data;
      const results = Array.isArray(data) ? data : data.results || [];
      setListings(results);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);
  
  const handleRemoveFavorite = async (listingId: number) => {
    // 1. تحديث الواجهة فوراً (Optimistic UI)
    const oldListings = [...listings];
    setListings(prev => prev.filter(item => {
        const actualListing = item.listing || item;
        return actualListing.id !== listingId;
    }));

    // ✅ 2. السحر هنا: نحدث الذاكرة العالمية ونبلغ كل زراير القلوب في الموقع تطفي!
    globalFavStore.set(String(listingId), false);
    window.dispatchEvent(new CustomEvent('favoriteToggled', {
        detail: { listingId: String(listingId), isFavorite: false }
    }));

    try {
      // 3. إرسال الإزالة للسيرفر
      await api.post('/favorites/toggle/', { listing_id: listingId });
      router.refresh();
    } catch (error) {
      // إرجاع العنصر في حال فشل الاتصال وإرجاع الذاكرة لحالتها
      setListings(oldListings);
      globalFavStore.set(String(listingId), true);
      window.dispatchEvent(new CustomEvent('favoriteToggled', {
          detail: { listingId: String(listingId), isFavorite: true }
      }));
      alert("فشل الإزالة. تأكد من اتصالك بالإنترنت.");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]"><Loader2 className="animate-spin text-red-500 w-10 h-10"/></div>;

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-32 font-sans dir-rtl">
      <Navbar />

      {/* الهيدر الفخم */}
      <div className="bg-slate-900 text-white pt-24 pb-20 px-4 rounded-b-[2.5rem] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-[80px] pointer-events-none"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-black mb-3 flex items-center justify-center gap-3">
                <Heart className="w-8 h-8 md:w-10 md:h-10 text-red-500 fill-red-500" /> 
                قائمة المفضلة
            </h1>
            <p className="text-slate-400 text-sm md:text-base font-bold">
                تحتفظ بـ <span className="text-white font-black px-1">{listings.length}</span> إعلانات مميزة
            </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-12 relative z-20">
        
        {listings.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[2rem] shadow-sm border border-gray-100 flex flex-col items-center animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <Heart className="w-12 h-12 text-red-300" />
                </div>
                <h3 className="font-black text-slate-800 text-2xl mb-2">القائمة فارغة!</h3>
                <p className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed font-medium mb-8">لم تقم بحفظ أي عقارات حتى الآن. تصفح الموقع واضغط على علامة القلب 🤍 لحفظ ما يعجبك.</p>
                <Link href="/" className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-base shadow-[0_10px_20px_rgba(0,0,0,0.15)] hover:bg-amber-500 hover:text-slate-900 transition-all active:scale-95 flex items-center gap-2">
                    <Search className="w-5 h-5"/> تصفح العقارات
                </Link>
            </div>
        ) : (
            <div className="space-y-5">
                {listings.map((favItem, index) => {
                    const item = favItem.listing || favItem;
                    if (!item) return null;

                    return (
                        <div 
                            key={item.id} 
                            className="bg-white p-3 md:p-4 rounded-[1.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 transition-all hover:shadow-lg group animate-in slide-in-from-bottom duration-500"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            {/* صورة العقار */}
                            <div className="w-full md:w-56 h-48 md:h-full bg-slate-100 rounded-xl overflow-hidden shrink-0 relative block">
                                <Image 
                                    src={getFullImageUrl(item.thumbnail || item.image) || "/images/placeholder-property.jpg"} 
                                    alt={item.title || "عقار"}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 250px"
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg text-[10px] font-black text-slate-900 flex items-center gap-1 shadow-md">
                                    <DollarSign className="w-3.5 h-3.5 text-amber-500"/>
                                    {item.offer_type === 'Sale' ? 'بيع' : 'إيجار'}
                                </div>
                            </div>

                            {/* تفاصيل العقار */}
                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                    <h3 className="font-black text-slate-900 text-lg md:text-xl line-clamp-1 mb-2 group-hover:text-amber-600 transition-colors">{item.title}</h3>
                                    
                                    <div className="text-xs text-gray-500 flex items-center gap-1.5 font-bold mb-4">
                                        <MapPin className="w-4 h-4 text-slate-400"/> 
                                        {item.city_name || item.city?.name || "مدينة غير محددة"} {item.major_zone_name ? `، ${item.major_zone_name}` : ""}
                                    </div>

                                    <div className="flex items-center gap-3 text-slate-600 mb-4">
                                        {item.bedrooms > 0 && (
                                            <span className="flex items-center gap-1.5 text-xs font-bold bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                                <Bed className="w-4 h-4 text-amber-500"/> {item.bedrooms}
                                            </span>
                                        )}
                                        {item.bathrooms > 0 && (
                                            <span className="flex items-center gap-1.5 text-xs font-bold bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                                <Bath className="w-4 h-4 text-blue-400"/> {item.bathrooms}
                                            </span>
                                        )}
                                    </div>

                                    <div className="font-black text-slate-900 text-2xl mb-4">
                                        {item.price ? Number(item.price).toLocaleString('ar-EG') : "غير محدد"} <span className="text-sm font-bold text-gray-400">ج.م</span>
                                    </div>
                                </div>

                                {/* أزرار الإجراءات */}
                                <div className="grid grid-cols-2 gap-3 mt-auto border-t border-gray-50 pt-3">
                                    <Link 
                                        href={`/listings/${item.id}`} 
                                        className="bg-slate-900 text-white py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2 hover:bg-slate-800 transition active:scale-95 shadow-md shadow-slate-900/10"
                                    >
                                        <Eye className="w-4 h-4"/> التفاصيل
                                    </Link>
                                    <button 
                                        onClick={() => handleRemoveFavorite(item.id)}
                                        className="bg-red-50 text-red-600 py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2 hover:bg-red-600 hover:text-white transition border border-red-100 active:scale-95"
                                    >
                                        <Trash2 className="w-4 h-4"/> إزالة
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}