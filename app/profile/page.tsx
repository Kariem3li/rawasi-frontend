"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import ListingCard from "@/components/ListingCard";
import { 
    User, Heart, Building2, Loader2, 
    MessageCircle, LogOut, Save, BadgeCheck, 
    Briefcase, Phone, Settings, AlertCircle, PlusSquare, Search
} from "lucide-react";
import { getFullImageUrl } from "@/lib/config";
import api from "@/lib/axios";
import Link from "next/link";

// دالة لتجهيز بيانات الكارت (لتوحيد الشكل مع الرئيسية)
const prepareCardData = (item: any) => {
    const addressParts = [item.subdivision_name || item.subdivision?.name, item.major_zone_name || item.major_zone?.name, item.city_name || item.city?.name].filter(Boolean);
    let unifiedFeatures = [];
    
    if (item.area_sqm) unifiedFeatures.push({ label: "المساحة", value: `${item.area_sqm} م²`, icon: "ruler" });
    if (item.bedrooms) unifiedFeatures.push({ label: "غرف", value: `${item.bedrooms}`, icon: "bedroom" });
    if (item.bathrooms) unifiedFeatures.push({ label: "حمام", value: `${item.bathrooms}`, icon: "bath" });
    if (item.floor_number) unifiedFeatures.push({ label: "الدور", value: `${item.floor_number}`, icon: "floor" });
    
    if (item.dynamic_features && Array.isArray(item.dynamic_features)) {
        const extraFeats = item.dynamic_features.map((f: any) => ({
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

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("info");
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  const [userData, setUserData] = useState<any>({
      first_name: "", last_name: "", phone_number: "", 
      whatsapp_link: "", interests: "", username: "", client_type: "Buyer"
  });
  
  const [myListings, setMyListings] = useState<any[]>([]);
  const [savedListings, setSavedListings] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");

    if (!token) {
        router.push("/login");
        return;
    }

    const fetchAllData = async () => {
        try {
            const [userRes, listingsRes, favsRes] = await Promise.all([
                api.get('/auth/users/me/'),
                api.get('/listings/my_listings/'),
                api.get('/favorites/')
            ]);
            
            setUserData(userRes.data);
            setMyListings(Array.isArray(listingsRes.data) ? listingsRes.data : listingsRes.data.results || []);
            setSavedListings(Array.isArray(favsRes.data) ? favsRes.data : favsRes.data.results || []);
            
        } catch (error) {
            console.error("Error fetching profile data", error);
        } finally {
            setLoading(false);
        }
    };

    fetchAllData();
  }, [router]);

  const handleUpdate = async () => {
      setUpdating(true);
      try {
          await api.patch('/auth/users/me/', {
              first_name: userData.first_name,
              last_name: userData.last_name,
              whatsapp_link: userData.whatsapp_link,
              interests: userData.interests
          });
          
          const fullName = `${userData.first_name} ${userData.last_name}`.trim();
          if (fullName) {
              const storage = localStorage.getItem("token") ? localStorage : sessionStorage;
              storage.setItem("username", fullName);
          }
          
          alert("✅ تم تحديث بياناتك بنجاح!");
      } catch (error) {
          alert("❌ حدث خطأ أثناء التحديث.");
      } finally {
          setUpdating(false);
      }
  };

  const handleLogout = () => {
      if(confirm("هل تريد بالفعل تسجيل الخروج؟")) {
          localStorage.clear();
          sessionStorage.clear();
          router.push("/login");
      }
  };

  if (loading) {
      return (
          <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
              <p className="text-slate-800 font-bold animate-pulse">جاري تحميل بيانات حسابك...</p>
          </div>
      );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-32 font-sans dir-rtl">
      <Navbar />

      {/* 🌟 الهيدر الفخم */}
      <div className="bg-slate-900 pt-16 pb-24 px-4 text-center rounded-b-[2.5rem] relative shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent rounded-b-[2.5rem]"></div>
          <div className="relative z-10 flex flex-col items-center">
              <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mb-4 shadow-xl border-4 border-slate-900 text-white transform hover:scale-105 transition-transform duration-300">
                  <User className="w-10 h-10" />
              </div>
              <h1 className="text-2xl font-black text-white mb-1">
                  {userData.first_name || userData.last_name ? `${userData.first_name} ${userData.last_name}` : userData.username}
              </h1>
              <p className="text-amber-500 font-bold text-sm flex items-center gap-1.5 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                  <BadgeCheck className="w-4 h-4"/> {userData.client_type === 'Seller' ? 'مالك / بائع' : userData.client_type === 'Marketer' ? 'مسوق عقاري' : 'مشتري / مستثمر'}
              </p>
          </div>
      </div>

      {/* 🎛️ شريط التنقل السلس (Segmented Control) */}
      <div className="max-w-3xl mx-auto px-4 -mt-8 relative z-20">
          <div className="bg-white p-1.5 rounded-2xl shadow-md border border-gray-100 flex items-center gap-1">
              {[
                  { id: "info", label: "بياناتي", icon: Settings },
                  { id: "listings", label: "إعلاناتي", icon: Building2 },
                  { id: "saved", label: "المفضلة", icon: Heart }
              ].map((tab) => (
                  <button 
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-gray-50 hover:text-slate-900'}`}
                  >
                      <tab.icon className="w-4 h-4" /> <span className="hidden sm:inline">{tab.label}</span>
                  </button>
              ))}
          </div>
      </div>

      {/* 📑 محتوى الأقسام */}
      <div className="max-w-4xl mx-auto px-4 mt-8">
        
        {/* ================= 1. قسم البيانات الشخصية ================= */}
        {activeTab === "info" && (
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-2"><Settings className="w-6 h-6 text-amber-500"/> إعدادات الحساب</h2>
                    <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-bold text-red-500 bg-red-50 px-4 py-2 rounded-xl hover:bg-red-100 transition active:scale-95">
                        <LogOut className="w-4 h-4"/> خروج
                    </button>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">الاسم الأول</label>
                        <input type="text" className="w-full h-14 bg-gray-50 border-2 border-transparent focus:border-amber-500 focus:bg-white rounded-xl px-5 font-bold text-slate-800 outline-none transition-all shadow-sm" value={userData.first_name || ""} onChange={(e) => setUserData({...userData, first_name: e.target.value})}/>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">الاسم الأخير</label>
                        <input type="text" className="w-full h-14 bg-gray-50 border-2 border-transparent focus:border-amber-500 focus:bg-white rounded-xl px-5 font-bold text-slate-800 outline-none transition-all shadow-sm" value={userData.last_name || ""} onChange={(e) => setUserData({...userData, last_name: e.target.value})}/>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase flex items-center gap-1"><Phone className="w-3.5 h-3.5"/> رقم الهاتف (غير قابل للتعديل)</label>
                        <input type="text" className="w-full h-14 bg-gray-100 border-2 border-transparent rounded-xl px-5 font-bold text-slate-500 outline-none cursor-not-allowed" value={userData.phone_number || ""} readOnly dir="ltr" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5 text-green-500"/> رقم الواتساب</label>
                        <input type="text" dir="ltr" className="w-full h-14 bg-gray-50 border-2 border-transparent focus:border-green-500 focus:bg-white rounded-xl px-5 font-bold text-slate-800 outline-none transition-all shadow-sm" value={userData.whatsapp_link || ""} onChange={(e) => setUserData({...userData, whatsapp_link: e.target.value})} placeholder="مثال: 01012345678" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 mb-2 uppercase flex items-center gap-1"><Briefcase className="w-3.5 h-3.5"/> اهتماماتك العقارية</label>
                        <textarea className="w-full h-28 bg-gray-50 border-2 border-transparent focus:border-amber-500 focus:bg-white rounded-xl p-5 font-bold text-slate-800 outline-none transition-all shadow-sm resize-none" value={userData.interests || ""} onChange={(e) => setUserData({...userData, interests: e.target.value})} placeholder="مثال: مهتم بشراء شقة في التجمع..."></textarea>
                    </div>
                </div>

                <button onClick={handleUpdate} disabled={updating} className="w-full bg-slate-900 text-white h-14 rounded-xl font-black text-base shadow-xl shadow-slate-900/20 hover:bg-amber-500 hover:text-slate-900 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:shadow-none disabled:text-slate-500">
                    {updating ? <Loader2 className="w-5 h-5 animate-spin"/> : <Save className="w-5 h-5"/>} 
                    {updating ? "جاري الحفظ..." : "حفظ التعديلات"}
                </button>
            </div>
        )}

        {/* ================= 2. قسم إعلاناتي ================= */}
        {activeTab === "listings" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {myListings.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {myListings.map((listing) => {
                            const { address, features } = prepareCardData(listing);
                            return (
                                <div key={listing.id} className="relative">
                                    <ListingCard 
                                        id={listing.id}
                                        title={listing.title}
                                        price={listing.price.toString()}
                                        address={address}
                                        image={getFullImageUrl(listing.thumbnail)}
                                        offerType={listing.offer_type === 'Sale' ? 'بيع' : 'إيجار'}
                                        isFinanceEligible={listing.is_finance_eligible}
                                        isSold={listing.status === 'Sold'}
                                        is_favorite={listing.is_favorite || false}
                                        features={features}
                                        phone_number={listing.owner_phone || ""}
                                    />
                                    {/* زر تعديل الإعلان يظهر فوق الكارت */}
                                    <Link href={`/edit-property/${listing.id}`} className="absolute top-4 right-4 z-40 bg-white/90 backdrop-blur-md text-slate-900 px-4 py-2 rounded-xl text-xs font-black shadow-lg border border-white hover:bg-amber-500 hover:text-white transition-colors active:scale-95">
                                        تعديل الإعلان
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white rounded-[2rem] border border-dashed border-gray-300 shadow-sm p-12 text-center flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-5"><Building2 className="w-10 h-10 text-gray-300"/></div>
                        <h3 className="text-xl font-black text-slate-800 mb-2">ليس لديك إعلانات بعد</h3>
                        <p className="text-gray-500 font-medium mb-6">ابدأ الآن وأضف عقارك ليصل لآلاف المشترين المحتملين.</p>
                        <Link href="/add-property" className="bg-amber-500 text-slate-900 font-black px-8 py-3.5 rounded-xl hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20 active:scale-95 flex items-center gap-2">
                            <PlusSquare className="w-5 h-5"/> إضافة عقار جديد
                        </Link>
                    </div>
                )}
            </div>
        )}

        {/* ================= 3. قسم المفضلة ================= */}
        {activeTab === "saved" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {savedListings.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {savedListings.map((favItem) => {
                            const realListing = favItem.listing;
                            if(!realListing) return null;
                            const { address, features } = prepareCardData(realListing);
                            
                            return (
                                <ListingCard 
                                    key={favItem.id}
                                    id={realListing.id}
                                    title={realListing.title}
                                    price={realListing.price.toString()}
                                    address={address}
                                    image={getFullImageUrl(realListing.thumbnail)}
                                    offerType={realListing.offer_type === 'Sale' ? 'بيع' : 'إيجار'}
                                    isFinanceEligible={realListing.is_finance_eligible}
                                    isSold={realListing.status === 'Sold'}
                                    is_favorite={true} 
                                    features={features}
                                    phone_number={realListing.owner_phone || ""}
                                />
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white rounded-[2rem] border border-dashed border-gray-300 shadow-sm p-12 text-center flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-5"><Heart className="w-10 h-10 text-gray-300"/></div>
                        <h3 className="text-xl font-black text-slate-800 mb-2">قائمة المفضلة فارغة</h3>
                        <p className="text-gray-500 font-medium mb-6">تصفح العقارات المتاحة واحفظ ما يعجبك لتعود إليه لاحقاً.</p>
                        <Link href="/" className="bg-slate-900 text-white font-black px-8 py-3.5 rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 active:scale-95 flex items-center gap-2">
                            <Search className="w-5 h-5"/> تصفح العقارات
                        </Link>
                    </div>
                )}
            </div>
        )}
      </div>
      
      <BottomNav />
    </main>
  );
}