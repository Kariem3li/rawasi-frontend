"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from "@/components/Navbar";
import { getFullImageUrl } from '@/lib/config';
import { 
    MapPin, Calendar, CreditCard, Building2, Phone, 
    MessageCircle, CheckCircle2, ImageIcon, X, 
    ArrowLeft, PlayCircle, SplitSquareHorizontal, Banknote, Share2
} from 'lucide-react';
import Image from 'next/image';

// Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css'; 
import 'swiper/css/pagination'; 
import 'swiper/css/navigation';

import BeforeAfterSlider from '@/components/BeforeAfterSlider';
import { trackEvent } from '@/lib/analytics';

export default function PromotionClient({ promo }: { promo: any }) {
    const [selectedUnitImage, setSelectedUnitImage] = useState<string | null>(null);
    const isProject = promo.promo_type === 'PROJECT';
    const isService = promo.promo_type === 'SERVICE';
    
    useEffect(() => {
        trackEvent('VIEW', 'promotion', promo.id);
    }, [promo.id]);

    // دالة استخراج اليوتيوب (للفيديو السفلي)
    const getYouTubeEmbedUrl = (url: string) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
    };

    // ✅ تمت إضافة دوال الاتصال التي كانت مفقودة وتسبب Crash
    // ✅ تجهيز روابط الاتصال والواتساب
    const cleanPhone = promo.phone_number?.replace(/\D/g, '');
    const cleanWhatsapp = promo.whatsapp_number?.replace(/\D/g, '');
    const phoneLink = cleanPhone ? `tel:${cleanPhone}` : null;
    const whatsappLink = cleanWhatsapp ? `https://wa.me/2${cleanWhatsapp}` : null;
    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: promo.title,
                    text: promo.subtitle || 'عرض حصري من رواسي',
                    url: window.location.href,
                });
            } catch (error) { console.log('Error sharing'); }
        } else {
            await navigator.clipboard.writeText(window.location.href);
            alert("تم نسخ الرابط!");
        }
    };

    return (
        <main className="min-h-screen bg-[#F8FAFC] font-sans pb-32 dir-rtl">
            <Navbar />
            
            {/* 🌟 1. الغلاف الرئيسي (Hero Banner) */}
            <div className="relative w-full h-[55vh] md:h-[70vh] bg-slate-900">
                <Image 
                    src={getFullImageUrl(promo.cover_image)} 
                    alt={promo.title} 
                    fill 
                    className="object-cover" 
                    priority 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent"></div>
                
                {/* أزرار الهيدر */}
                <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-30" dir="ltr">
                    <Link href="/" className="bg-white/20 backdrop-blur-md p-3 rounded-full text-white hover:bg-white/30 transition shadow-lg active:scale-95"><ArrowLeft className="w-5 h-5" /></Link>
                    <button onClick={handleShare} className="bg-white/20 backdrop-blur-md p-3 rounded-full text-white hover:bg-white/30 transition shadow-lg active:scale-95"><Share2 className="w-5 h-5" /></button>
                </div>

                <div className="absolute bottom-5 left-0 w-full p-6 md:p-12 z-20 flex flex-col md:flex-row md:items-end justify-between gap-6 max-w-7xl mx-auto">
                    <div className="flex-1">
                        {isProject && <span className="inline-block bg-blue-600/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-black mb-3 border border-white/20">مشروع عقاري</span>}
                        {isService && <span className="inline-block bg-purple-600/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-black mb-3 border border-white/20">خدماتنا</span>}
                        <h1 className="text-3xl md:text-5xl font-black text-white leading-tight drop-shadow-lg">{promo.title}</h1>
                        {promo.subtitle && <p className="text-amber-400 font-bold mt-2 md:text-lg drop-shadow-md">{promo.subtitle}</p>}
                    </div>
                    {promo.developer_logo && (
                        <div className="w-20 h-20 md:w-32 md:h-32 bg-white rounded-2xl shadow-2xl relative overflow-hidden shrink-0 border border-gray-100 p-2">
                            <Image src={getFullImageUrl(promo.developer_logo)} alt="Developer Logo" fill className="object-contain p-2"/>
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-6 relative z-30 space-y-6">
                
                {/* 📋 2. تفاصيل المشروع */}
                <div className="bg-white rounded-[2rem] shadow-xl p-6 md:p-10 border border-gray-100">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {promo.price_start_from && (
                            <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
                                <Banknote className="w-6 h-6 text-amber-500 mb-2"/>
                                <p className="text-[10px] text-gray-500 font-bold mb-1">يبدأ من</p>
                                <p className="font-black text-slate-800">{Number(promo.price_start_from).toLocaleString('ar-EG')} ج</p>
                            </div>
                        )}
                        {promo.developer_name && (
                            <div className="bg-slate-50 p-4 rounded-2xl border border-gray-100">
                                <Building2 className="w-6 h-6 text-slate-500 mb-2"/>
                                <p className="text-[10px] text-gray-500 font-bold mb-1">المطور العقاري</p>
                                <p className="font-black text-slate-800">{promo.developer_name}</p>
                            </div>
                        )}
                        {promo.delivery_date && (
                            <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                                <Calendar className="w-6 h-6 text-blue-500 mb-2"/>
                                <p className="text-[10px] text-gray-500 font-bold mb-1">الاستلام</p>
                                <p className="font-black text-slate-800">{promo.delivery_date}</p>
                            </div>
                        )}
                        {promo.payment_system && (
                            <div className="bg-green-50/50 p-4 rounded-2xl border border-green-100">
                                <CreditCard className="w-6 h-6 text-green-500 mb-2"/>
                                <p className="text-[10px] text-gray-500 font-bold mb-1">نظام الدفع</p>
                                <p className="font-black text-slate-800">{promo.payment_system}</p>
                            </div>
                        )}
                    </div>

                    <h3 className="font-black text-xl text-slate-900 mb-4">وصف العرض</h3>
                    <p className="text-slate-600 font-medium leading-loose whitespace-pre-line">{promo.description}</p>

                    {promo.project_features && (
                        <div className="mt-8 pt-8 border-t border-gray-100">
                            <h3 className="font-black text-lg text-slate-900 mb-4">أهم المميزات</h3>
                            <div className="grid md:grid-cols-2 gap-3">
                                {promo.project_features.split('\n').map((feat: string, i: number) => feat.trim() && (
                                    <div key={i} className="flex items-start gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                        <span className="text-slate-700 font-bold text-sm">{feat.trim()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* 🏢 3. الوحدات المتاحة */}
                {isProject && promo.units && promo.units.length > 0 && (
                    <div className="bg-slate-900 rounded-[2rem] shadow-xl p-6 md:p-10 border border-slate-800">
                        <h3 className="font-black text-xl text-white mb-6 flex items-center gap-2"><Building2 className="w-6 h-6 text-amber-400"/> النماذج المتاحة</h3>
                        <Swiper modules={[Pagination, Autoplay]} spaceBetween={15} slidesPerView={1.2} breakpoints={{ 640: { slidesPerView: 2.5 }, 1024: { slidesPerView: 3.5 } }} className="pb-10">
                            {promo.units.map((unit: any) => (
                                <SwiperSlide key={unit.id}>
                                    <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden group">
                                        <div className="h-40 relative cursor-pointer" onClick={() => unit.image && setSelectedUnitImage(unit.image)}>
                                            {unit.image ? (
                                                <Image src={getFullImageUrl(unit.image)} alt={unit.title} fill className="object-cover group-hover:scale-105 transition duration-500" />
                                            ) : (
                                                <div className="w-full h-full bg-slate-700 flex items-center justify-center"><ImageIcon className="w-8 h-8 text-slate-500" /></div>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <h4 className="font-bold text-white text-sm line-clamp-1 mb-1">{unit.title}</h4>
                                            <p className="text-amber-400 font-black text-lg mb-3">{Number(unit.price).toLocaleString('ar-EG')} <span className="text-xs text-slate-400">ج.م</span></p>
                                            {unit.listing_id && (
                                                <Link href={`/listings/${unit.listing_id}`} className="block w-full text-center bg-white text-slate-900 py-2.5 rounded-xl text-xs font-bold hover:bg-amber-400 transition-colors">
                                                    تفاصيل الوحدة
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                )}

                {/* 📸 4. معرض الصور */}
                {promo.gallery && promo.gallery.length > 0 && (
                    <div className="bg-white rounded-[2rem] shadow-sm p-6 border border-gray-100">
                        <h3 className="font-black text-xl text-slate-900 mb-6 flex items-center gap-2"><ImageIcon className="w-6 h-6 text-purple-500"/> معرض الصور</h3>
                        <Swiper modules={[Pagination, Navigation, Autoplay]} spaceBetween={15} slidesPerView={1.2} breakpoints={{ 640: { slidesPerView: 2.2 }, 1024: { slidesPerView: 3.2 } }} className="w-full">
                            {promo.gallery.map((img: any) => (
                                <SwiperSlide key={img.id} className="rounded-2xl overflow-hidden aspect-[4/3] relative group" onClick={() => setSelectedUnitImage(img.image)}>
                                    <Image src={getFullImageUrl(img.image)} alt="Gallery" fill className="object-cover transition-transform duration-500 group-hover:scale-110 cursor-pointer" />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                )}

                {/* 🔄 5. قبل وبعد (للتشطيب) */}
                {isService && promo.transformations && promo.transformations.length > 0 && (
                    <div className="bg-white rounded-[2rem] shadow-sm p-6 border border-gray-100">
                        <h3 className="font-black text-xl text-slate-900 mb-6 flex items-center gap-2"><SplitSquareHorizontal className="w-6 h-6 text-amber-500"/> أعمالنا (قبل وبعد)</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            {promo.transformations.map((t: any) => (
                                <div key={t.id} className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                    <h4 className="font-bold text-center text-slate-700 mb-3">{t.title || "مقارنة"}</h4>
                                    <BeforeAfterSlider beforeImage={getFullImageUrl(t.before_image)} afterImage={getFullImageUrl(t.after_image)} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 🎥 6. فيديو المشروع */}
                {(promo.details_video || promo.video_url || promo.youtube_url) && (
                    <div className="bg-slate-900 rounded-[2rem] shadow-xl overflow-hidden relative">
                        <div className="aspect-video relative group">
                            {promo.youtube_url ? (
                                <iframe src={getYouTubeEmbedUrl(promo.youtube_url) || ''} title="YouTube" className="absolute inset-0 w-full h-full border-0" allowFullScreen></iframe>
                            ) : (
                                <video controls className="w-full h-full object-cover" poster={getFullImageUrl(promo.cover_image)}>
                                    <source src={getFullImageUrl(promo.details_video || promo.video_url)} type="video/mp4" />
                                </video>
                            )}
                        </div>
                    </div>
                )}

                {/* 📍 7. الخريطة والعنوان النصي */}
                {(promo.latitude && promo.longitude) || promo.address ? (
                    <div className="bg-white rounded-[2rem] shadow-sm p-6 border border-gray-100">
                        <h3 className="font-black text-xl text-slate-900 mb-6 flex items-center gap-2"><MapPin className="w-6 h-6 text-blue-500"/> موقع الإعلان</h3>
                        
                        {/* العنوان النصي */}
                        {promo.address && (
                            <div className="mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-start gap-3">
                                <MapPin className="w-6 h-6 text-slate-400 shrink-0" />
                                <div>
                                    <h4 className="text-xs font-bold text-slate-500 mb-1">العنوان التفصيلي</h4>
                                    <p className="text-slate-800 font-bold">{promo.address}</p>
                                </div>
                            </div>
                        )}

                        {/* الخريطة التفاعلية */}
                        {promo.latitude && promo.longitude && (
                            <div className="h-64 md:h-80 w-full rounded-2xl overflow-hidden shadow-inner border border-gray-200 relative group">
                                <iframe 
                                    title="Map" 
                                    width="100%" height="100%" frameBorder="0" scrolling="no" 
                                    src={`https://maps.google.com/maps?q=${promo.latitude},${promo.longitude}&hl=ar&z=15&output=embed`} 
                                    className="grayscale group-hover:grayscale-0 transition duration-700"
                                ></iframe>
                                {/* زرار فتح في جوجل ماب */}
                                <a 
                                    href={`https://www.google.com/maps/search/?api=1&query=${promo.latitude},${promo.longitude}`} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md text-slate-900 px-4 py-2 rounded-xl text-sm font-black shadow-lg hover:bg-blue-600 hover:text-white transition-colors flex items-center gap-2"
                                >
                                    <MapPin className="w-4 h-4"/> فتح في خرائط جوجل
                                </a>
                            </div>
                        )}
                    </div>
                ) : null}
            </div>

            {/* 🔍 Lightbox للصور المكبرة */}
            {selectedUnitImage && (
                <div className="fixed inset-0 z-[100000] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in duration-300">
                    <button className="absolute top-6 right-6 bg-white/10 p-3 rounded-full text-white hover:bg-white/20 transition" onClick={() => setSelectedUnitImage(null)}><X className="w-8 h-8" /></button>
                    <div className="relative w-full h-full max-w-5xl max-h-[85vh]">
                        <Image src={getFullImageUrl(selectedUnitImage)} alt="Preview" fill className="object-contain" />
                    </div>
                </div>
            )}

            {/* 📞 شريط التواصل العائم */}
            <div className="fixed bottom-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[600px] bg-slate-900/85 backdrop-blur-xl border border-white/20 p-3 rounded-[2rem] shadow-2xl z-50 transition-all duration-500 animate-in slide-in-from-bottom-10">
                <div className="flex gap-3">
                    {phoneLink && (
                        <a href={phoneLink} onClick={() => trackEvent('CALL', 'promotion', promo.id)} className="flex-1 h-14 rounded-2xl flex items-center justify-center gap-2 font-black text-sm md:text-base bg-white text-slate-900 hover:bg-gray-100 active:scale-95 transition-all">
                            <Phone className="w-5 h-5" /> اتصال بالمبيعات
                        </a>
                    )}
                    {whatsappLink && (
                        <a href={whatsappLink} target="_blank" onClick={() => trackEvent('WHATSAPP', 'promotion', promo.id)} className="flex-1 h-14 rounded-2xl flex items-center justify-center gap-2 font-black text-sm md:text-base bg-[#25D366] text-white hover:brightness-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(37,211,102,0.4)]">
                            <MessageCircle className="w-5 h-5" /> واتساب
                        </a>
                    )}
                </div>
            </div>
        </main>
    );
}