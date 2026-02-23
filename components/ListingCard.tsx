"use client";

import React, { useState, memo } from "react";
import { 
    MapPin, Phone, MessageCircle, BadgeCheck, Ruler, CheckCircle2, 
    BedDouble, Bath, Layout, PaintBucket, Dumbbell, Utensils, Zap, Wind, Waves, Trees, Car, Wifi, Snowflake, Tv, ShieldCheck, Home,
    Layers, Fan, Building, Map, Factory, Warehouse, Store 
} from "lucide-react";
import FavoriteButton from './FavoriteButton'; 
import Link from "next/link"; 
import Image from "next/image";
import { trackEvent } from '@/lib/analytics';

// --- تسجيل الأيقونات ---
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

// ✅ تحسين تنسيق السعر لدعم الفواصل العربية بشكل قياسي
const formatPrice = (price: any) => {
    if (!price) return "0";
    const cleanString = price.toString().replace(/[^0-9.]/g, '');
    const val = Number(cleanString);
    return isNaN(val) ? price : val.toLocaleString('ar-EG');
};

interface ListingProps {
    id: number;
    title: string;
    price: string;
    address: string;
    image: string;
    offerType: "بيع" | "إيجار";
    isFinanceEligible: boolean;
    isSold: boolean;
    features: { label: string; value: string; icon?: string }[]; 
    is_favorite: boolean;
    phone_number?: string;
}

// ✅ استخدام React.memo لمنع إعادة بناء الكارت بدون داعي (تحسين أداء ضخم للقوائم)
const ListingCard = memo(({ 
    id, title, price, address, image, offerType, isFinanceEligible, isSold, features, is_favorite, phone_number
}: ListingProps) => {
    
    // ✅ التعامل مع خطأ الصورة بطريقة React السليمة
    const [imgSrc, setImgSrc] = useState(image || "/images/placeholder-property.jpg");

    const getWhatsAppLink = (number: string | undefined) => {
        if (!number) return null;
        let clean = number.toString().replace(/\D/g, ''); 
        if (clean.startsWith('01')) clean = '2' + clean;
        return `https://wa.me/${clean}`;
    };

    const getPhoneLink = (number: string | undefined) => {
        if (!number) return null;
        let clean = number.toString().replace(/\D/g, '');
        return `tel:${clean}`;
    };

    const whatsappLink = getWhatsAppLink(phone_number);
    const phoneLink = getPhoneLink(phone_number);

    return (
        <div className="bg-white rounded-[24px] border border-gray-100/80 shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1.5 overflow-hidden flex flex-col h-full relative group w-full">
            
            <Link 
                href={`/listings/${id}`} 
                className="flex flex-col flex-1 cursor-pointer"
                onClick={() => trackEvent('VIEW', 'listing', id)}
                prefetch={false} // 🚀 تقليل استهلاك الباندويث في القوائم الكبيرة
            >
                {/* --- قسم الصورة --- */}
                <div className="h-56 sm:h-64 bg-slate-100 relative overflow-hidden block w-full"> 
                    
                    {isSold && (
                        <div className="absolute inset-0 z-20 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center">
                            <div className="bg-red-500/90 text-white px-8 py-2 rounded-2xl font-black text-lg shadow-2xl border border-white/20 transform -rotate-12 backdrop-blur-md">
                                تم البيع
                            </div>
                        </div>
                    )}

                    <Image 
                        src={imgSrc} 
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority={false} 
                        onError={() => setImgSrc("/images/placeholder-property.jpg")} // ✅ الطريقة الآمنة
                    />

                    {/* تدرج لوني أنيق لضمان وضوح الشارات */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/0 to-slate-900/20 opacity-80 transition-opacity duration-300 group-hover:opacity-100"></div>

                    {/* شارة نوع العرض */}
                    <div className="absolute top-4 right-4 z-10">
                        <span className={`px-4 py-1.5 rounded-xl text-xs font-black shadow-lg text-white backdrop-blur-md border border-white/20 ${
                            offerType === 'بيع' ? 'bg-amber-500/90' : 'bg-indigo-500/90'
                        }`}>
                            {offerType}
                        </span>
                    </div>
                </div>

                {/* --- قسم التفاصيل --- */}
                <div className="p-5 flex-1 flex flex-col">
                    <div className="mb-4">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-black text-slate-900 flex items-baseline gap-1">
                                {formatPrice(price)} 
                                <span className="text-xs font-bold text-slate-400">ج.م</span>
                            </h3>
                            {isFinanceEligible && (
                                <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-2.5 py-1.5 rounded-lg border border-emerald-100/50">
                                    <BadgeCheck className="w-3.5 h-3.5" />
                                    <span className="text-[10px] font-bold">تمويل عقاري</span>
                                </div>
                            )}
                        </div>
                        
                        <h2 className="text-base font-bold text-slate-800 line-clamp-1 mb-2 group-hover:text-amber-500 transition-colors leading-relaxed">
                            {title}
                        </h2>
                        
                        <div className="flex items-center text-slate-500 text-xs">
                            <MapPin className="w-4 h-4 ml-1.5 shrink-0 text-amber-500/80" /> 
                            <span className="line-clamp-1 font-medium">{address}</span>
                        </div>
                    </div>

                    {/* الخصائص */}
                    <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100 mt-auto">
                        {features.length > 0 ? (
                            features.map((feat, index) => {
                                const IconComp = getIcon(feat.icon || '');
                                return (
                                    <div key={index} className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100/80 max-w-[48%] sm:max-w-none hover:bg-slate-100 transition-colors">
                                        <IconComp className="w-4 h-4 text-amber-500 shrink-0" />
                                        <span className="text-[11px] font-bold text-slate-600 truncate">
                                            {feat.value === "نعم" || feat.value === "True" ? feat.label : `${feat.label}: ${feat.value}`}
                                        </span>
                                    </div>
                                );
                            })
                        ) : (
                            <span className="text-xs text-slate-400 font-medium py-1">تفاصيل إضافية بالداخل...</span>
                        )}
                    </div>
                </div>
            </Link>

            {/* زر المفضلة */}
            <div className="absolute top-4 left-4 z-30">
                <FavoriteButton listingId={id} isInitialFavorite={is_favorite} />
            </div>

            {/* --- قسم أزرار التواصل --- */}
            <div className="px-5 pb-5 grid grid-cols-2 gap-3 mt-2">
                {whatsappLink ? (
                    <a 
                        href={whatsappLink} 
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => { 
                            if(isSold) e.preventDefault(); 
                            else trackEvent('WHATSAPP', 'listing', id);
                        }} 
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm shadow-sm transition-all duration-300 active:scale-[0.98] ${
                            isSold 
                            ? 'bg-slate-50 text-slate-400 cursor-not-allowed border border-slate-100' 
                            : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/25 hover:shadow-emerald-500/40'
                        }`}
                    >
                        <MessageCircle className="w-4 h-4" /> واتساب
                    </a>
                ) : (
                    <button disabled className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm bg-slate-50 text-slate-400 cursor-not-allowed border border-slate-100">
                        <MessageCircle className="w-4 h-4" /> واتساب
                    </button>
                )}
                
                {phoneLink ? (
                    <a 
                        href={phoneLink} 
                        onClick={(e) => { 
                            if(isSold) e.preventDefault(); 
                            else trackEvent('CALL', 'listing', id);
                        }} 
                        className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm shadow-sm transition-all duration-300 active:scale-[0.98] ${
                            isSold 
                            ? 'bg-slate-50 text-slate-400 cursor-not-allowed border border-slate-100' 
                            : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20 hover:shadow-slate-900/30'
                        }`}
                    >
                        <Phone className="w-4 h-4" /> اتصال
                    </a>
                ) : (
                    <button disabled className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm bg-slate-50 text-slate-400 cursor-not-allowed border border-slate-100">
                        <Phone className="w-4 h-4" /> اتصال
                    </button>
                )}
            </div>
        </div>
    );
});

ListingCard.displayName = "ListingCard"; // ضروري عند استخدام React.memo
export default ListingCard;