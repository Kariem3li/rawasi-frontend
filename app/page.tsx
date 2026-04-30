// app/page.tsx (Server Component)
import { Suspense } from "react";
import HomeContent from "./HomeClient";
import { API_URL } from "@/lib/config";
import { Metadata } from "next";

// 🚀 إضافة الـ Metadata عشان يظهر بشكل ممتاز في محركات البحث
export const metadata: Metadata = {
  title: "رواسي للعقارات — شراء وبيع وإيجار العقارات في مصر",
  description: "ابحث عن شقق وفيلات وأراضي للبيع والإيجار في مدينة العاشر من رمضان ومصر.",
};

// 🚀 جلب أول صفحة من العقارات على السيرفر عشان جوجل يشوفها (SSR)
export default async function Home() {
  let initialListings = [];
  
  try {
    const res = await fetch(`${API_URL}/listings/?status=Available&page=1`, {
      next: { revalidate: 60 } // تحديث الكاش كل دقيقة
    });
    const data = await res.json();
    initialListings = data.results || [];
  } catch (error) {
    console.error("Failed to fetch initial listings:", error);
  }

  return (
    <Suspense fallback={<PageLoader />}>
      {/* بنمرر الداتا الجاهزة للـ Client عشان يعرضها فوراً */}
      <HomeContent initialListings={initialListings} />
    </Suspense>
  );
}

// لودر سريع بيظهر ثواني لو السيرفر لسه بيحمل
function PageLoader() {
  return (
    <div className="flex flex-col justify-center h-screen items-center bg-[#F8FAFC] gap-4">
        <div className="w-12 h-12 border-4 border-amber-400/30 border-t-amber-500 rounded-full animate-spin"></div>
        <p className="text-slate-800 font-bold animate-pulse text-sm">جاري تجهيز العقارات...</p>
    </div>
  );
}