"use client";

import React, { Suspense, useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import ListingCard from "@/components/ListingCard";
import AdvancedFiltersModal from "@/components/AdvancedFiltersModal";
import LocationSelectorModal from "@/components/LocationSelectorModal"; 
import QuickFilters from "@/components/QuickFilters"; 
import { MapPin, SlidersHorizontal, ChevronDown, SearchX } from "lucide-react";
import { useSearchParams } from "next/navigation"; 
import HeroSlider from '@/components/HeroSlider';
import { getFullImageUrl } from '@/lib/config';
import api from "@/lib/axios";

// ✅ 1. عزل اللوجيك: فصلنا الدالة دي بره عشان ميتعملهاش Re-render مع كل تحديث في الصفحة (تحسين أداء جبار)
const prepareCardData = (item) => {
    const addressParts = [item.subdivision_name, item.major_zone_name, item.city_name].filter(Boolean);
    let unifiedFeatures = [];
    
    if (item.area_sqm) unifiedFeatures.push({ label: "المساحة", value: `${item.area_sqm} م²`, icon: "ruler" });
    if (item.bedrooms) unifiedFeatures.push({ label: "غرف", value: `${item.bedrooms}`, icon: "bedroom" });
    if (item.bathrooms) unifiedFeatures.push({ label: "حمام", value: `${item.bathrooms}`, icon: "bath" });
    if (item.floor_number) unifiedFeatures.push({ label: "الدور", value: `${item.floor_number}`, icon: "floor" });
    
    if (item.dynamic_features && Array.isArray(item.dynamic_features)) {
        const extraFeats = item.dynamic_features.map((f) => ({
            label: f.feature_name,
            value: f.value,
            icon: f.feature_icon || f.icon || "check"
        }));
        unifiedFeatures = [...unifiedFeatures, ...extraFeats];
    }
    
    return {
        address: addressParts.join("، ") || "عنوان غير محدد",
        features: unifiedFeatures 
    };
};

function HomeContent() {
  const searchParams = useSearchParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLocationOpen, setIsLocationOpen] = useState(false);

  useEffect(() => {
    // ✅ 2. الأمان والسرعة: استخدام AbortController لمنع الـ Race Conditions 
    const controller = new AbortController();
    
    const fetchListings = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams(searchParams.toString());
        if (!params.get('status')) params.append('status', 'Available');
        
        const res = await api.get(`/listings/?${params.toString()}`, {
            signal: controller.signal // ربط الريكويست بالـ Controller
        });
        
        const data = res.data;
        const results = Array.isArray(data.results) ? data.results : (Array.isArray(data) ? data : []);
        setListings(results);

      } catch (error) {
        // تجاهل الخطأ لو كان بسبب إننا لغينا الريكويست القديم عمداً
        if (error.name !== 'CanceledError') {
            console.error("Error fetching listings:", error);
            setListings([]);
        }
      } finally {
        setLoading(false);
      }
    };
    
    // ✅ 3. Debouncing: تأخير الريكويست 150 ملي ثانية لو العميل بيغير الفلاتر بسرعة
    const debounceTimer = setTimeout(() => {
        fetchListings();
    }, 150);

    return () => {
        clearTimeout(debounceTimer);
        controller.abort(); // إلغاء أي ريكويست قديم معلق
    };
  }, [searchParams]);

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-32 font-sans overflow-x-hidden dir-rtl">
      
      {/* Navbar مع تأثير الزجاج (Glassmorphism) ليكون ثابت وجذاب */}
      <div className="sticky top-0 z-50 bg-[#F8FAFC]/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <Navbar />
      </div>

      <div className="w-full relative z-10 mt-2">
        <HeroSlider />
      </div>

      {/* قسم البحث والفلاتر السريعة */}
      <div className="px-4 relative z-20 mt-6 space-y-4 max-w-7xl mx-auto">
        <div className="flex gap-3 items-center">
            <button 
                onClick={() => setIsLocationOpen(true)}
                className="flex-1 bg-white h-14 rounded-2xl shadow-sm border border-gray-200 flex items-center px-4 gap-3 hover:border-amber-500/50 hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
            >
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500">
                    <MapPin className="w-5 h-5" />
                </div>
                <div className="flex flex-col items-start overflow-hidden">
                    <span className="text-[10px] text-gray-500 font-medium">نطاق البحث</span>
                    <span className="text-sm font-bold text-slate-800 line-clamp-1 text-right w-full">
                        {searchParams.get('major_zone') ? "منطقة محددة" : "كل المناطق"}
                    </span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400 mr-auto" />
            </button>

            <div className="relative">
                 <AdvancedFiltersModal trigger={
                    <div className="h-14 w-14 bg-slate-900 rounded-2xl shadow-lg shadow-slate-900/20 flex items-center justify-center cursor-pointer hover:bg-amber-500 transition-all active:scale-[0.98] text-white">
                        <SlidersHorizontal className="w-6 h-6" />
                    </div>
                 }/>
            </div>
        </div>

        <div className="w-full overflow-x-auto pb-2 hide-scrollbar">
            <QuickFilters />
        </div>
      </div>

      {/* قسم عرض العقارات */}
      <section className="px-4 relative z-10 mt-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
             <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                <span className="w-1.5 h-7 bg-amber-500 rounded-full"></span>
                أحدث العقارات
             </h2>
             {/* عداد ديناميكي للعقارات */}
             {!loading && (
                 <span className="text-xs font-bold text-gray-500 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-200">
                    {listings.length} عقار
                 </span>
             )}
          </div>

          {/* الـ Skeleton Loader (شكل بريميوم بيحاكي الكارت الحقيقي) */}
          {loading && (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-white rounded-3xl h-[400px] animate-pulse border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                        <div className="h-[200px] bg-gray-200 m-3 rounded-2xl"></div>
                        <div className="p-4 flex-1 flex flex-col gap-4">
                            <div className="flex justify-between items-center">
                                <div className="h-4 bg-gray-200 rounded-md w-1/3"></div>
                                <div className="h-6 bg-gray-200 rounded-full w-1/4"></div>
                            </div>
                            <div className="h-6 bg-gray-200 rounded-md w-3/4"></div>
                            <div className="mt-auto flex gap-2">
                                <div className="h-10 bg-gray-200 rounded-xl flex-1"></div>
                                <div className="h-10 bg-gray-200 rounded-xl flex-1"></div>
                            </div>
                        </div>
                    </div>
                ))}
             </div>
          )}
          
          {/* حالة عدم وجود عقارات (Empty State احترافي) */}
          {!loading && listings.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-[2rem] border border-dashed border-gray-300 shadow-sm mx-2">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-5">
                    <SearchX className="w-10 h-10 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">لم نجد عقارات مطابقة!</h3>
                  <p className="text-sm text-gray-500 mt-2 max-w-[250px]">
                    حاول توسيع نطاق البحث أو تقليل الفلاتر للحصول على نتائج.
                  </p>
                  <button 
                    onClick={() => window.location.href='/'} 
                    className="mt-6 text-slate-900 font-bold text-sm bg-amber-400 px-8 py-3 rounded-xl hover:bg-amber-500 shadow-lg shadow-amber-400/30 transition-all active:scale-95"
                  >
                    عرض كل العقارات
                  </button>
              </div>
          )}

          {/* قائمة العقارات الفعلية */}
          {!loading && listings.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
                {listings.map((item) => {
                    const { address, features } = prepareCardData(item);
                    const contactPhone = item.owner_phone || (item.agent && item.agent.phone_number) || "";
                    return (
                        <div key={item.id} className="transition-transform duration-300 hover:-translate-y-1.5"> 
                            <ListingCard 
                                id={item.id}
                                title={item.title}
                                address={address}
                                price={Number(item.price).toLocaleString()}
                                image={getFullImageUrl(item.thumbnail)}
                                offerType={item.offer_type === 'Sale' ? 'بيع' : 'إيجار'}
                                isFinanceEligible={item.is_finance_eligible}
                                isSold={item.status === 'Sold'}
                                is_favorite={item.is_favorite || false}
                                features={features} 
                                phone_number={contactPhone}
                            />
                        </div>
                    );
                })}
              </div>
          )}
      </section>

      <LocationSelectorModal 
        isOpen={isLocationOpen} 
        onClose={() => setIsLocationOpen(false)} 
      />

      <BottomNav />
    </main>
  );
}

// مكون تحميل أنيق يظهر أثناء الـ Suspense
function PageLoader() {
    return (
        <div className="flex flex-col justify-center h-screen items-center bg-[#F8FAFC] gap-4">
            <div className="w-12 h-12 border-4 border-amber-400/30 border-t-amber-500 rounded-full animate-spin"></div>
            <p className="text-slate-800 font-bold animate-pulse text-sm">جاري تجهيز العقارات...</p>
        </div>
    );
}

export default function Home() {
  return (
    <Suspense fallback={<PageLoader />}>
      <HomeContent />
    </Suspense>
  );
}