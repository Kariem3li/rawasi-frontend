"use client";

import { useState, useRef, useCallback } from 'react';
import { ChevronsLeftRight } from 'lucide-react';
import Image from 'next/image';

interface Props {
    beforeImage: string;
    afterImage: string;
    title?: string;
}

export default function BeforeAfterSlider({ beforeImage, afterImage, title }: Props) {
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    
    // 🚀 السحر هنا: استخدام Refs بدل State لتحريك العناصر لمنع الـ Re-renders المستمرة
    const overlayRef = useRef<HTMLDivElement>(null);
    const handleRef = useRef<HTMLDivElement>(null);

    // ✅ دالة التحريك المحسنة (Zero-Lag)
    const handleMove = useCallback((clientX: number) => {
        if (containerRef.current && overlayRef.current && handleRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            // حساب النسبة المئوية بدقة ومنع الخروج عن الإطار
            const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
            const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
            
            // 🚀 تعديل الـ DOM مباشرة للسرعة القصوى (بدون React State Re-renders)
            // استخدام requestAnimationFrame لضمان سلاسة الـ Animation مع رفرش الشاشة
            requestAnimationFrame(() => {
                if (overlayRef.current) {
                    overlayRef.current.style.clipPath = `polygon(0 0, ${percent}% 0, ${percent}% 100%, 0 100%)`;
                }
                if (handleRef.current) {
                    handleRef.current.style.left = `${percent}%`;
                }
            });
        }
    }, []);

    const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        setIsDragging(true);
        // نأمر المتصفح يركز كل أحداث الماوس/اللمس على العنصر ده حتى لو خرج براه
        e.currentTarget.setPointerCapture(e.pointerId);
        handleMove(e.clientX);
    };

    const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging) return;
        handleMove(e.clientX);
    };

    const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        setIsDragging(false);
        // تحرير الماوس لما العميل يشيل صباعه
        e.currentTarget.releasePointerCapture(e.pointerId);
    };

    return (
        <div className="w-full">
            {title && <h3 className="text-sm font-black text-slate-800 mb-3 text-center bg-gray-50 py-2 rounded-xl">{title}</h3>}
            
            <div 
                ref={containerRef}
                className="relative w-full aspect-[4/3] md:aspect-video rounded-2xl overflow-hidden cursor-ew-resize select-none shadow-inner border border-slate-200 group touch-none"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp} // لو حصل أي مقاطعة
                onDragStart={(e) => e.preventDefault()}
            >
                {/* الصورة الثانية (بعد) - الخلفية */}
                <Image 
                    src={afterImage} 
                    alt="التشطيب بعد" 
                    fill 
                    className="object-cover pointer-events-none"
                    sizes="(max-width: 768px) 100vw, 50vw"
                />
                
                {/* بادج "بعد" */}
                <div className="absolute top-4 right-4 z-0">
                    <span className="bg-amber-500 text-slate-900 text-xs font-black px-4 py-1.5 rounded-full shadow-lg">بعد</span>
                </div>

                {/* الصورة الأولى (قبل) - فوق الصورة الثانية مقصوصة */}
                <div 
                    ref={overlayRef} // 🚀 ربطنا الـ Ref هنا
                    className="absolute inset-0 z-10 pointer-events-none"
                    style={{ clipPath: `polygon(0 0, 50% 0, 50% 100%, 0 100%)` }} // القيمة الابتدائية
                >
                    <Image 
                        src={beforeImage} 
                        alt="التشطيب قبل" 
                        fill 
                        className="object-cover grayscale-[30%] opacity-90"
                        sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    
                    {/* بادج "قبل" */}
                    <div className="absolute top-4 left-4">
                        <span className="bg-slate-900/60 backdrop-blur-md text-white text-xs font-black px-4 py-1.5 rounded-full border border-white/20">قبل</span>
                    </div>
                </div>

                {/* شريط السحب (الخط والمقبض) */}
                <div 
                    ref={handleRef} // 🚀 ربطنا الـ Ref هنا
                    className="absolute top-0 bottom-0 z-20 w-1 bg-white shadow-[0_0_15px_rgba(0,0,0,0.5)] pointer-events-none -translate-x-1/2"
                    style={{ left: `50%` }} // القيمة الابتدائية
                >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-xl border-2 border-amber-500 transform transition-transform group-hover:scale-110">
                        <ChevronsLeftRight className="w-5 h-5 text-amber-500" />
                    </div>
                </div>
            </div>
        </div>
    );
}