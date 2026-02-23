"use client";
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Pagination, Navigation, Parallax } from 'swiper/modules';
import api from '@/lib/axios'; // ✅ استخدام الـ api المخصص بتاعنا بدل axios العادي
import { getFullImageUrl } from '@/lib/config'; 
import { ArrowLeft, ArrowRight, Sparkles, Tag, ChevronLeft } from 'lucide-react';

// استدعاء ملفات الـ CSS الخاصة بـ Swiper
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const HeroSlider = () => {
  const [slides, setSlides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const res = await api.get(`/promotions/`);
        const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
        setSlides(data);
      } catch (error) {
        console.error("Failed to fetch promotions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPromotions();
  }, []);

  // ✅ لو مفيش سلايدز خالص ومش بيحمل، نخفي المكون تماماً بنظافة
  if (!loading && slides.length === 0) return null;

  return (
    <section className="w-full px-4 pt-4 md:px-6 md:pt-6 bg-[#F8FAFC] dir-rtl pb-6 relative z-0 max-w-7xl mx-auto">
      
      {/* ✅ الـ Skeleton Loader المحسن وقت التحميل */}
      {loading ? (
        <div className="w-full h-[55vh] md:h-[600px] bg-slate-200 animate-pulse rounded-[2rem] md:rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-end p-8 md:p-16">
            <div className="h-6 w-32 bg-slate-300 rounded-full mb-4"></div>
            <div className="h-12 md:h-16 w-3/4 md:w-1/2 bg-slate-300 rounded-xl mb-6"></div>
            <div className="flex gap-4">
                <div className="h-12 w-40 bg-slate-300 rounded-2xl"></div>
                <div className="h-12 w-40 bg-slate-300 rounded-full"></div>
            </div>
        </div>
      ) : (
        <div className="relative group rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_-12px_rgba(0,0,0,0.2)] bg-slate-900 border border-slate-200/50">
          <Swiper
            modules={[Autoplay, EffectFade, Pagination, Navigation, Parallax]}
            effect={'fade'}
            fadeEffect={{ crossFade: true }}
            parallax={true}
            loop={slides.length > 1}
            speed={1200} 
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            navigation={{
                nextEl: '.swiper-button-next-custom',
                prevEl: '.swiper-button-prev-custom',
            }}
            pagination={{ 
                clickable: true,
                bulletClass: 'swiper-pagination-bullet !bg-white/50 !w-2 !h-2 !opacity-100 transition-all duration-300 backdrop-blur-sm shadow-sm mx-1.5',
                bulletActiveClass: 'swiper-pagination-bullet-active !bg-amber-500 !w-8 !rounded-full'
            }}
            className="w-full h-[60vh] md:h-[600px]" 
          >
            {slides.map((slide, idx) => (
              <SwiperSlide key={slide.id} className="relative w-full h-full overflow-hidden">
                <Link 
                    href={slide.final_url || '#'} 
                    target={slide.open_in_new_tab ? '_blank' : '_self'}
                    className="block w-full h-full relative"
                >
                    {/* 1. الصورة الخلفية */}
                    <div 
                        className="absolute inset-0 w-full h-full" 
                        data-swiper-parallax="20%" 
                        data-swiper-parallax-scale="1.05" 
                    >
                      <Image
                        src={getFullImageUrl(slide.cover_image)}
                        alt={slide.title}
                        fill
                        // ✅ أول صورة بس تاخد أولوية عشان الـ SEO والسرعة
                        priority={idx === 0} 
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 1200px"
                      />
                      
                      {/* تدرج لوني احترافي عشان الكلام يقرأ بوضوح تام */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-slate-900/10" />
                    </div>

                    {/* 2. المحتوى */}
                    <div className="absolute inset-0 flex flex-col justify-end pb-14 md:pb-20 px-6 md:px-16 z-20">
                        <div className="max-w-4xl transform transition-transform">
                            
                            {/* الصف العلوي: البادج والعنوان الفرعي */}
                            <div className="flex flex-wrap items-center gap-3 mb-4 md:mb-5" data-swiper-parallax="-100">
                                <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] md:text-xs font-black text-white tracking-wide border border-white/20 backdrop-blur-md shadow-lg
                                    ${slide.promo_type === 'PROJECT' ? 'bg-blue-600/80' : 
                                      slide.promo_type === 'SERVICE' ? 'bg-purple-600/80' : 
                                      'bg-amber-500/80'}`}>
                                    <Sparkles className="w-3.5 h-3.5 text-white" />
                                    {slide.promo_type === 'PROJECT' ? 'مشروع جديد' : 
                                     slide.promo_type === 'SERVICE' ? 'خدماتنا' : 'عروض مميزة'}
                                </span>

                                {slide.subtitle && (
                                    <span className="text-amber-400 text-xs md:text-base font-bold tracking-wide flex items-center gap-2 drop-shadow-md">
                                        <span className="w-6 h-[2px] bg-amber-400 inline-block"></span>
                                        {slide.subtitle}
                                    </span>
                                )}
                            </div>
                            
                            {/* العنوان الرئيسي */}
                            <h2 
                                className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-5 md:mb-8 drop-shadow-2xl line-clamp-2 md:line-clamp-none" 
                                data-swiper-parallax="-200"
                            >
                              {slide.title}
                            </h2>

                            {/* السعر والزر */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4 md:gap-6" data-swiper-parallax="-300">
                                {slide.display_price && (
                                    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-2.5 w-fit shadow-xl">
                                        <p className="text-[10px] text-amber-400 font-bold mb-1 flex items-center gap-1">
                                            <Tag className="w-3 h-3" /> يبدأ من
                                        </p>
                                        <p className="text-xl md:text-3xl font-black text-white tracking-tight">
                                            {Number(slide.display_price).toLocaleString('ar-EG')} <span className="text-sm font-bold text-gray-300">ج.م</span>
                                        </p>
                                    </div>
                                )}
                                
                                <button className="w-fit bg-white text-slate-900 px-6 py-3.5 md:px-8 md:py-4 rounded-xl font-black text-sm md:text-base hover:bg-amber-500 hover:text-white transition-all shadow-[0_10px_20px_rgba(0,0,0,0.2)] active:scale-95 duration-300 flex items-center gap-2 group/btn">
                                    {slide.button_text || "اكتشف التفاصيل"} 
                                    <ChevronLeft className="w-5 h-5 rtl:rotate-180 transition-transform group-hover/btn:-translate-x-1" />
                                </button>
                            </div>
                        </div>
                    </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* أزرار التنقل (تظهر في الديسك توب فقط عند تمرير الماوس) */}
          <div className="absolute bottom-10 left-10 z-30 gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500 hidden md:flex translate-y-4 group-hover:translate-y-0">
             <button className="swiper-button-prev-custom w-12 h-12 rounded-full bg-slate-900/40 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-amber-500 hover:border-amber-500 transition-all hover:scale-110 active:scale-95 cursor-pointer">
                <ArrowRight className="w-5 h-5" />
             </button>
             <button className="swiper-button-next-custom w-12 h-12 rounded-full bg-slate-900/40 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-amber-500 hover:border-amber-500 transition-all hover:scale-110 active:scale-95 cursor-pointer">
                <ArrowLeft className="w-5 h-5" />
             </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default HeroSlider;