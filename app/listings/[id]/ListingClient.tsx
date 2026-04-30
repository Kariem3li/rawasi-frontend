"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';
import { 
  MapPin, BedDouble, Bath, Ruler, CheckCircle2, Phone, MessageCircle, 
  ArrowLeft, ChevronRight, ChevronLeft, Map, Layout, Video, Share2, 
  Image as ImageIcon, X, PlayCircle, Layers, PaintBucket, Dumbbell, 
  Utensils, Zap, Wind, Waves, Trees, Car, Wifi, Snowflake, Tv, 
  ShieldCheck, Home, Fan, Building, Factory, Warehouse, Store
} from "lucide-react";
import { getFullImageUrl } from "@/lib/config";
import { trackEvent } from '@/lib/analytics';
import FavoriteButton from '@/components/FavoriteButton';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
};

// ... (IconsRegistry and getIcon functions remain the same)
const IconsRegistry: Record<string, any> = {
    ruler: Ruler, area: Ruler, sqm: Ruler,
    beddouble: BedDouble, bedroom: BedDouble, bedrooms: BedDouble, room: BedDouble, rooms: BedDouble,
    bath: Bath, bathroom: Bath, bathrooms: Bath, wc: Bath,
    layout: Layout, floor: Layout, layers: Layers,
    paintbucket: PaintBucket, finishing: PaintBucket,
    wifi: Wifi, internet: Wifi,
    car: Car, parking: Car, garage: Car,
    dumbbell: Dumbbell, gym: Dumbbell,
    utensils: Utensils, kitchen: Utensils,
    shieldcheck: ShieldCheck, security: ShieldCheck,
    zap: Zap, electricity: Zap,
    wind: Wind, fan: Fan,
    snowflake: Snowflake, ac: Snowflake, aircondition: Snowflake,
    waves: Waves, pool: Waves, trees: Trees, garden: Trees, landscape: Trees,
    home: Home, building: Building, land: Map, landplot: Map, factory: Factory, warehouse: Warehouse, shop: Store, store: Store,
    tv: Tv, satellite: Tv,
    check: CheckCircle2, checkcircle: CheckCircle2
};

const getIcon = (iconName: string) => {
    if (!iconName) return CheckCircle2;
    const cleanName = iconName.toString().toLowerCase().replace(/\s+/g, '').replace(/_/g, '').replace(/-/g, '');
    const IconComponent = IconsRegistry[cleanName];
    if (!IconComponent) {
        if (cleanName.includes('bed')) return BedDouble;
        if (cleanName.includes('bath')) return Bath;
        if (cleanName.includes('area')) return Ruler;
        if (cleanName.includes('shop') || cleanName.includes('store')) return Store;
        if (cleanName.includes('land')) return Map;
        return CheckCircle2;
    }
    return IconComponent;
};

// 🚀 دالة ذكية لتنظيف رقم الواتساب (Edge Case Fix)
const formatWhatsappNumber = (phone: string | undefined | null) => {
    if (!phone) return null;
    let cleanPhone = phone.toString().replace(/\D/g, '');
    // لو الرقم مصري (11 رقم بيبدأ بـ 01)، شيل الصفر وحط 20
    if (cleanPhone.length === 11 && cleanPhone.startsWith('01')) {
        cleanPhone = `2${cleanPhone}`;
    } else if (cleanPhone.length === 10 && cleanPhone.startsWith('1')) {
        // لو العميل كتبه 10... على طول، حط 20
        cleanPhone = `20${cleanPhone}`;
    }
    return `https://wa.me/${cleanPhone}`;
};


export default function ListingClient({ listing }: { listing: any }) {
  const [showLightbox, setShowLightbox] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showMapLightbox, setShowMapLightbox] = useState(false); 

  useEffect(() => {
    trackEvent('VIEW', 'listing', listing.id);
  }, [listing.id]);

  // 🚀 إخفاء السكرول الأساسي للصفحة لما الـ Lightbox يفتح عشان الـ BottomNav ميضربش
  useEffect(() => {
      if (showLightbox || showMapLightbox) {
          document.body.style.overflow = 'hidden';
      } else {
          document.body.style.overflow = 'unset';
      }
      return () => { document.body.style.overflow = 'unset'; };
  }, [showLightbox, showMapLightbox]);


  const allImages = [listing.thumbnail, ...(listing.images?.map((img: any) => img.image) || [])].filter(Boolean);
  const uniqueImages = [...new Set(allImages)];

  const rawPhone = listing.owner_phone || listing.agent?.phone_number;
  const rawWhatsapp = listing.owner_phone || listing.agent?.phone_number || listing.agent?.whatsapp_link;
  
  const whatsappLink = formatWhatsappNumber(rawWhatsapp);
  const phoneLink = rawPhone ? `tel:${rawPhone.toString().replace(/\D/g, '')}` : null;
  const youtubeEmbed = getYouTubeEmbedUrl(listing.youtube_url);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing.title,
          text: `شاهد هذا العقار المميز: ${listing.title} بسعر ${Number(listing.price).toLocaleString('ar-EG')} ج.م`,
          url: window.location.href,
        });
      } catch (error) { console.log('Error sharing:', error); }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert("تم نسخ الرابط للحافظة!");
    }
  };

  const addressParts = [
    listing.governorate_name,
    listing.city_name,
    listing.major_zone_name || listing.major_zone?.name,
    listing.subdivision_name || listing.subdivision?.name
  ].filter(Boolean);
  const fullAddress = addressParts.join('، ');

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-32 font-sans dir-rtl">
      
      {/* 📸 معرض الصور (Gallery) بـ Swiper */}
      <div className="relative h-[45vh] md:h-[65vh] bg-slate-900 overflow-hidden">
         {/* أزرار الهيدر */}
         <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-center z-30 bg-gradient-to-b from-black/70 to-transparent" dir="ltr">
             <Link href="/" className="bg-white/20 backdrop-blur-md p-3 rounded-full text-white hover:bg-white/30 transition-all shadow-lg active:scale-95">
                <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
             </Link>
             <div className="flex gap-3">
                 <button onClick={handleShare} className="bg-white/20 backdrop-blur-md p-3 rounded-full text-white hover:bg-white/30 transition-all shadow-lg active:scale-95">
                    <Share2 className="w-5 h-5 md:w-6 md:h-6" />
                 </button>
             </div>
         </div>

         {uniqueImages.length > 0 ? (
             <Swiper
                modules={[Pagination, Navigation]}
                pagination={{ type: 'fraction', el: '.custom-fraction' }}
                navigation={{ nextEl: '.next-img', prevEl: '.prev-img' }}
                className="w-full h-full cursor-pointer"
                onSlideChange={(swiper) => setActiveImageIndex(swiper.activeIndex)}
                onClick={() => setShowLightbox(true)}
             >
                {uniqueImages.map((img, idx) => (
                    // 🚀 إضافة relative صريحة للـ Slide عشان الـ fill يشتغل صح 100%
                    <SwiperSlide key={idx} className="relative w-full h-full">
                        <Image 
                            src={getFullImageUrl(img as string)}
                            alt={`${listing.title} - صورة ${idx + 1}`}
                            fill
                            className="object-cover"
                            priority={idx === 0} 
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/20 to-transparent opacity-90 pointer-events-none"></div>
                    </SwiperSlide>
                ))}

                <div className="absolute !bottom-14 !right-4 md:!right-6 !left-auto !w-auto min-w-[70px] flex items-center justify-center z-20 bg-black/50 backdrop-blur-md text-white font-bold text-xs px-4 py-2 rounded-full custom-fraction tracking-widest border border-white/10 shadow-lg"></div>
             </Swiper>
         ) : (
             <div className="w-full h-full flex items-center justify-center text-gray-500 flex-col bg-slate-200">
                 <ImageIcon className="w-16 h-16 mb-2 opacity-50"/><span>لا توجد صور</span>
             </div>
         )}
         
         <div className="absolute bottom-14 left-4 md:left-6 z-30">
            <div className="bg-black/50 backdrop-blur-md p-2.5 rounded-full border border-white/10 shadow-lg">
                <FavoriteButton listingId={listing.id} isInitialFavorite={listing.is_favorite} />
            </div>
         </div>
      </div>

      {/* 📄 تفاصيل العقار */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-8 relative z-40">
        <div className="bg-white rounded-[2rem] shadow-2xl p-6 md:p-8 border border-gray-100">
            
            {/* العنوان والسعر */}
            <div className="border-b border-gray-100 pb-6 mb-8">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className={`inline-block text-[11px] font-black px-4 py-1.5 rounded-full text-white shadow-sm ${listing.offer_type === 'Sale' ? 'bg-amber-500' : 'bg-indigo-500'}`}>
                        {listing.offer_type === 'Sale' ? 'للبيع' : 'للإيجار'}
                    </span>
                    {listing.status === 'Sold' && (
                        <span className="inline-block text-[11px] font-black px-4 py-1.5 rounded-full text-white shadow-sm bg-red-500">تم البيع</span>
                    )}
                </div>

                <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-2 leading-snug">{listing.title}</h1>
                <p className="text-slate-500 text-sm font-bold flex items-center gap-1.5 mb-6">
                    <MapPin className="w-4 h-4 text-amber-500"/> {fullAddress}
                </p>

                <div className="flex justify-between items-end bg-gray-50 p-5 rounded-2xl border border-gray-100">
                    <div>
                        <p className="text-gray-400 text-xs font-bold mb-1.5">السعر المطلوب</p>
                        <div className="text-3xl md:text-4xl font-black text-slate-900 flex items-baseline gap-1.5">
                            {Number(listing.price).toLocaleString('ar-EG')} <span className="text-base font-bold text-amber-500">ج.م</span>
                        </div>
                    </div>
                    <div className="text-center bg-white px-5 py-3 rounded-xl shadow-sm border border-gray-100">
                        <Ruler className="w-6 h-6 mx-auto text-amber-500 mb-1"/>
                        <span className="text-sm font-black text-slate-800">{listing.area_sqm} م²</span>
                    </div>
                </div>
            </div>

            {/* الوصف */}
            <div className="mb-10">
                <h3 className="font-black text-lg text-slate-900 mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-amber-500 rounded-full"></span> تفاصيل الوحدة
                </h3>
                <p className="text-slate-600 text-sm md:text-base leading-relaxed whitespace-pre-line font-medium">{listing.description}</p>
                
                {listing.custom_map_image && (
                    <button 
                        onClick={() => setShowMapLightbox(true)}
                        className="mt-6 flex items-center gap-2 px-6 py-3 bg-indigo-50 text-indigo-600 font-black rounded-xl hover:bg-indigo-100 transition border border-indigo-100 active:scale-95"
                    >
                        <Layout className="w-5 h-5"/> عرض المخطط الهندسي (Floor Plan)
                    </button>
                )}
            </div>

            {/* المميزات (Dynamic Features) */}
            {((listing.dynamic_features && listing.dynamic_features.length > 0) || (listing.floor_number !== null && listing.floor_number !== undefined)) && (
                <div className="mb-10">
                    <h3 className="font-black text-lg text-slate-900 mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-amber-500 rounded-full"></span> المميزات والمرافق
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                        
                        {listing.floor_number !== null && listing.floor_number !== undefined && (
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3 transition hover:border-amber-200">
                                <div className="p-2.5 bg-white rounded-xl shadow-sm"><Layers className="w-5 h-5 text-amber-500" /></div>
                                <div>
                                    <p className="text-[11px] text-gray-400 font-bold mb-0.5">الدور</p>
                                    <p className="text-sm font-black text-slate-700">{listing.floor_number === 0 ? "أرضي" : listing.floor_number}</p>
                                </div>
                            </div>
                        )}

                        {listing.dynamic_features?.map((feat: any, idx: number) => {
                            const IconComp = getIcon(feat.icon || feat.feature_name);
                            return (
                                <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-3 transition hover:border-amber-200">
                                    <div className="p-2.5 bg-white rounded-xl shadow-sm"><IconComp className="w-5 h-5 text-amber-500" /></div>
                                    <div className="overflow-hidden">
                                        <p className="text-[11px] text-gray-400 font-bold mb-0.5 truncate">{feat.feature_name}</p>
                                        <p className="text-sm font-black text-slate-700 truncate">{feat.value === "نعم" || feat.value === "True" ? "متاح" : feat.value}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* الفيديو */}
            {(youtubeEmbed || listing.video) && (
                <div className="mb-10">
                    <h3 className="font-black text-lg text-slate-900 mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-red-500 rounded-full"></span> فيديو العقار
                    </h3>
                    <div className="rounded-3xl overflow-hidden shadow-xl border border-gray-100 bg-black aspect-video relative group">
                        {youtubeEmbed ? (
                             <iframe 
                                src={youtubeEmbed} 
                                title={listing.title} 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowFullScreen
                                className="absolute inset-0 w-full h-full border-0"
                             />
                        ) : (
                            <video 
                                controls 
                                playsInline 
                                webkit-playsinline="true"
                                preload="metadata"
                                className="w-full h-full object-cover" 
                                poster={getFullImageUrl(listing.thumbnail)}
                            >
                                <source src={getFullImageUrl(listing.video) as string} type="video/mp4" />
                            </video>
                        )}
                    </div>
                </div>
            )}

            {/* الخريطة */}
            {listing.latitude && listing.longitude && (
                <div className="mb-6">
                    <h3 className="font-black text-lg text-slate-900 mb-4 flex items-center gap-2">
                       <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span> الموقع على الخريطة
                    </h3>
                    <div className="h-64 w-full rounded-3xl overflow-hidden shadow-inner border border-gray-200 relative group mb-4">
                        <iframe 
                           title={listing.title}
                           width="100%" height="100%" frameBorder="0" scrolling="no"
                           // 🚀 تأكد من صحة الرابط ده (شيل الصفر اللي كان قبل الـ query لو عامل مشكلة)
                           src={`https://maps.google.com/maps?q=${listing.latitude},${listing.longitude}&hl=ar&z=15&output=embed`}
                           className="grayscale group-hover:grayscale-0 transition duration-700 absolute inset-0 w-full h-full" 
                           loading="lazy"
                        ></iframe>
                    </div>
                    
                    {/* 🚀 الأزرار الجديدة: Grid عشان يكونوا جنب بعض */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <a 
                            href={`https://www.google.com/maps/search/?api=1&query=${listing.latitude},${listing.longitude}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex justify-center items-center gap-2 w-full py-4 bg-blue-50 text-blue-700 rounded-2xl font-black text-sm hover:bg-blue-100 transition active:scale-95 border border-blue-100"
                        >
                            <MapPin className="w-5 h-5"/> فتح في Google Maps
                        </a>
                        
                        {/* 🚀 زرار OpenStreetMap (التقسيمات) */}
                        <a 
                            href={`https://www.openstreetmap.org/?mlat=${listing.latitude}&mlon=${listing.longitude}#map=17/${listing.latitude}/${listing.longitude}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex justify-center items-center gap-2 w-full py-4 bg-amber-50 text-amber-700 rounded-2xl font-black text-sm hover:bg-amber-100 transition active:scale-95 border border-amber-100"
                        >
                            <Map className="w-5 h-5"/> الخريطة التفصيلية (التقسيمات)
                        </a>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* 📞 شريط التواصل العائم (Floating Bottom Bar) */}
      <div className="fixed bottom-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[600px] bg-slate-900/85 backdrop-blur-xl border border-white/20 p-3 rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.3)] z-50 transition-all duration-500 animate-in slide-in-from-bottom-10">
         <div className="flex gap-3">
             <a href={phoneLink || '#'} onClick={(e) => { if(!phoneLink || listing.status === 'Sold') e.preventDefault(); else trackEvent('CALL', 'listing', listing.id); }} 
                className={`flex-1 h-14 rounded-2xl flex items-center justify-center gap-2 font-black text-sm md:text-base transition-all active:scale-95 ${phoneLink && listing.status !== 'Sold' ? 'bg-white text-slate-900 hover:bg-gray-100' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}>
                 <Phone className="w-5 h-5" /> اتصال
             </a>
             <a href={whatsappLink || '#'} target="_blank" rel="noopener noreferrer" onClick={(e) => { if(!whatsappLink || listing.status === 'Sold') e.preventDefault(); else trackEvent('WHATSAPP', 'listing', listing.id); }} 
                className={`flex-1 h-14 rounded-2xl flex items-center justify-center gap-2 font-black text-sm md:text-base transition-all active:scale-95 ${whatsappLink && listing.status !== 'Sold' ? 'bg-[#25D366] text-white hover:brightness-105 shadow-[0_0_15px_rgba(37,211,102,0.4)]' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}>
                 <MessageCircle className="w-5 h-5" /> واتساب
             </a>
         </div>
      </div>

      {/* 🔍 نافذة عرض الصور بكامل الشاشة (Lightbox) */}
      {showLightbox && (
          <div className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-md flex flex-col justify-center animate-in fade-in duration-300">
              <button onClick={() => setShowLightbox(false)} className="absolute top-6 right-6 z-[999999] bg-white/10 border border-white/20 text-white p-3 rounded-full hover:bg-white/20 transition active:scale-95"><X className="w-6 h-6"/></button>
              
              <div className="flex-1 relative w-full h-full">
                  <Swiper
                    modules={[Navigation, Pagination]}
                    initialSlide={activeImageIndex}
                    navigation={{ nextEl: '.lb-next', prevEl: '.lb-prev' }}
                    pagination={{ type: 'fraction' }}
                    className="w-full h-full"
                  >
                     {uniqueImages.map((img, idx) => (
                        <SwiperSlide key={idx} className="flex items-center justify-center relative">
                            {/* 🚀 استخدام un-optimized image مؤقتاً في اللايتبوكس لو الصور مقاساتها غريبة، أو استخدام fill مع object-contain */}
                            <div className="relative w-full h-full md:w-[90vw] md:h-[90vh]">
                                <Image 
                                   src={getFullImageUrl(img as string)} 
                                   alt="صورة مكبرة" 
                                   fill 
                                   className="object-contain" 
                                   sizes="100vw" 
                                   priority={idx === activeImageIndex}
                                />
                            </div>
                        </SwiperSlide>
                     ))}
                     
                     <button className="lb-prev absolute left-4 top-1/2 -translate-y-1/2 z-50 p-4 bg-black/40 border border-white/20 text-white rounded-full hover:bg-black/60 transition backdrop-blur-md active:scale-95 hidden md:block"><ChevronLeft className="w-8 h-8"/></button>
                     <button className="lb-next absolute right-4 top-1/2 -translate-y-1/2 z-50 p-4 bg-black/40 border border-white/20 text-white rounded-full hover:bg-black/60 transition backdrop-blur-md active:scale-95 hidden md:block"><ChevronRight className="w-8 h-8"/></button>
                  </Swiper>
              </div>
          </div>
      )}

      {/* 🗺️ نافذة المخطط الهندسي */}
      {showMapLightbox && listing.custom_map_image && (
          <div className="fixed inset-0 z-[99999] bg-white/95 backdrop-blur-xl flex flex-col justify-center animate-in fade-in duration-300">
              <button onClick={() => setShowMapLightbox(false)} className="absolute top-6 right-6 z-[999999] bg-gray-100 text-slate-800 p-3 rounded-full hover:bg-gray-200 transition shadow-lg active:scale-95"><X className="w-6 h-6"/></button>
              <div className="flex-1 relative flex items-center justify-center p-4 md:p-12">
                  <Image src={getFullImageUrl(listing.custom_map_image)} alt="المخطط الهندسي" fill className="object-contain" sizes="100vw" />
              </div>
              <p className="text-center text-slate-500 font-bold pb-10">المخطط الهندسي للوحدة</p>
          </div>
      )}

    </main>
  );
}