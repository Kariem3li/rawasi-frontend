"use client";

import React, { useState, memo, useEffect } from "react";
import { 
    MapPin, Phone, MessageCircle, BadgeCheck, Ruler, CheckCircle2, 
    BedDouble, Bath, Layout, PaintBucket, Dumbbell, Utensils, Zap, Wind, Waves, Trees, Car, Wifi, Snowflake, Tv, ShieldCheck, Home,
    Layers, Fan, Building, Map, Factory, Warehouse, Store 
} from "lucide-react";
import type { LucideIcon } from "lucide-react"; 
import FavoriteButton from './FavoriteButton'; 
import Link from "next/link"; 
import Image from "next/image";
import { trackEvent } from '@/lib/analytics';
import { useRouter } from "next/navigation"; // 🚀 استدعاء الـ Router لحل مشكلة الـ HTML النقي

const IconsRegistry: Record<string, LucideIcon> = { 
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

const getIcon = (iconName: string): LucideIcon => {
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

const formatPrice = (price: any) => {
    if (!price) return "0";
    const cleanString = price.toString().replace(/[^0-9.]/g, '');
    const val = Number(cleanString);
    return isNaN(val) ? price : val.toLocaleString('ar-EG');
};

// 🚀 نقل الدوال بره الـ Component عشان الـ Memory & Performance
const getWhatsAppLink = (number: string | undefined): string | null => {
    if (!number) return null;
    let clean = number.replace(/[\s\-()]/g, ""); 
    if (clean.startsWith("+")) clean = clean.slice(1); 
    if (clean.startsWith("01") && clean.length === 11) clean = "2" + clean; 
    return `https://wa.me/${clean}`;
};

const getPhoneLink = (number: string | undefined) => {
    if (!number) return null;
    let clean = number.toString().replace(/\D/g, '');
    return `tel:${clean}`;
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

const ListingCard = memo(({ 
    id, title, price, address, image, offerType, isFinanceEligible, isSold, features, is_favorite, phone_number
}: ListingProps) => {
    
    const router = useRouter();
    const [imgSrc, setImgSrc] = useState(image || "/images/placeholder-property.jpg");

    // 🚀 تحديث الصورة لو الداتا اتغيرت من الأب (مثلاً وقت الفلترة)
    useEffect(() => {
        setImgSrc(image || "/images/placeholder-property.jpg");
    }, [image]);

    const whatsappLink = getWhatsAppLink(phone_number);
    const phoneLink = getPhoneLink(phone_number);

    // 🚀 دالة ذكية للضغط على الكارت كله
    const handleCardClick = () => {
        trackEvent('CLICK_DETAILS', 'listing', id);
        router.push(`/listings/${id}`);
    };

    // 🚀 منع التداخل عند الضغط على أزرار التواصل
    const handleContactClick = (e: React.MouseEvent, url: string, type: 'WHATSAPP' | 'CALL') => {
        e.preventDefault();
        e.stopPropagation();
        trackEvent(type, 'listing', id);
        
        // فتح اللينك بشكل آمن (target=_blank للواتساب، وعادي للاتصال)
        if (type === 'WHATSAPP') {
            window.open(url, '_blank', 'noopener,noreferrer');
        } else {
            window.location.href = url;
        }
    };

    return (
        // 🚀 تحويل الـ div لـ زرار مخفي بيقبل الـ Click على الكارت بالكامل (Perfect UX)
        <div 
            className="bg-white rounded-[24px] border border-gray-100/80 shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1.5 overflow-hidden flex flex-col h-full relative group w-full cursor-pointer text-right"
            onClick={handleCardClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') handleCardClick(); }}
        >
            
            {/* 🚀 قسم المفضلة */}
            <div className="absolute top-4 left-4 z-40">
                <FavoriteButton listingId={id} isInitialFavorite={is_favorite} />
            </div>

            {/* --- قسم الصورة --- */}
            <div className="h-56 sm:h-64 bg-slate-100 relative overflow-hidden block w-full shrink-0"> 
                
                {isSold && (
                    <div className="absolute inset-0 z-20 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center pointer-events-none">
                        <div className="bg-red-500/90 text-white px-8 py-2 rounded-2xl font-black text-lg shadow-2xl border border-white/20 transform -rotate-12 backdrop-blur-md">
                            تم البيع
                        </div>
                    </div>
                )}

                <Image 
                    src={imgSrc} 
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110 z-0"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" 
                    priority={false} 
                    onError={() => setImgSrc("/images/placeholder-property.jpg")}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/0 to-slate-900/20 opacity-80 transition-opacity duration-300 group-hover:opacity-100 z-10 pointer-events-none"></div>

                <div className="absolute top-4 right-4 z-20">
                    <span className={`px-4 py-1.5 rounded-xl text-xs font-black shadow-lg text-white backdrop-blur-md border border-white/20 ${
                        offerType === 'بيع' ? 'bg-amber-500/90' : 'bg-indigo-500/90'
                    }`}>
                        {offerType}
                    </span>
                </div>
            </div>

            {/* --- قسم التفاصيل --- */}
            <div className="p-5 flex-1 flex flex-col z-20 bg-white">
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

            {/* --- قسم الأزرار (التواصل) --- */}
            {!isSold ? (
                <div className="px-5 pb-5 grid grid-cols-2 gap-3 mt-2 relative z-30">
                    {whatsappLink && (
                        // 🚀 تحويل الرابط لزرار بيفتح اللينك برمجياً لتجنب الـ HTML Nesting Errors
                        <button 
                            onClick={(e) => handleContactClick(e, whatsappLink, 'WHATSAPP')} 
                            className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm shadow-sm transition-all duration-300 active:scale-[0.98] bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/25 hover:shadow-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        >
                            <MessageCircle className="w-4 h-4" /> واتساب
                        </button>
                    )}
                    {phoneLink && (
                        <button 
                            onClick={(e) => handleContactClick(e, phoneLink, 'CALL')} 
                            className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm shadow-sm transition-all duration-300 active:scale-[0.98] bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20 hover:shadow-slate-900/30 focus:outline-none focus:ring-2 focus:ring-slate-900/50"
                        >
                            <Phone className="w-4 h-4" /> اتصال
                        </button>
                    )}
                </div>
            ) : (
                <div className="px-5 pb-5 text-center text-sm text-slate-400 font-bold py-3 mt-2 relative z-30">
                    هذا العقار تم بيعه 🚫
                </div>
            )}
        </div>
    );
});

ListingCard.displayName = "ListingCard";
export default ListingCard;