"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import { Heart } from 'lucide-react';
import api from "@/lib/axios";
import { useRouter, usePathname } from "next/navigation";

// الذاكرة العالمية: مزامنة القلوب في الموقع بالكامل
export const globalFavStore = new Map<string, boolean>();

interface FavoriteButtonProps {
  listingId: number | string;
  isInitialFavorite: boolean;
}

export default function FavoriteButton({ listingId, isInitialFavorite }: FavoriteButtonProps) {
  const router = useRouter();
  const pathname = usePathname(); // لمعرفة المسار الحالي
  const idStr = String(listingId);
  
  const [isFavorite, setIsFavorite] = useState<boolean>(() => {
      if (globalFavStore.has(idStr)) return globalFavStore.get(idStr) as boolean;
      return isInitialFavorite;
  });
  
  const [isAnimating, setIsAnimating] = useState(false);
  const isProcessing = useRef(false); // ✅ حماية ضد الـ Spam Clicks

  // تحديث محلي لو الذاكرة اتغيرت
  useEffect(() => {
      const currentVal = globalFavStore.get(idStr);
      if (currentVal !== undefined && currentVal !== isFavorite) {
          setIsFavorite(currentVal);
      } else if (currentVal === undefined) {
          globalFavStore.set(idStr, isInitialFavorite);
          setIsFavorite(isInitialFavorite);
      }
  }, [idStr, isInitialFavorite]);

  // الاستماع للأزرار التانية
  useEffect(() => {
    const syncFavorite = (e: any) => {
        if (String(e.detail.listingId) === idStr) {
            setIsFavorite(e.detail.isFavorite);
            globalFavStore.set(idStr, e.detail.isFavorite);
        }
    };
    
    window.addEventListener('favoriteToggled', syncFavorite);
    return () => window.removeEventListener('favoriteToggled', syncFavorite);
  }, [idStr]);

  const handleToggleFavorite = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation(); 

    // ✅ لو الزرار بيحمل حالياً، نمنع الضغط المتكرر
    if (isProcessing.current) return; 

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
        router.push("/login");
        return;
    }

    isProcessing.current = true; // قفل الزرار مؤقتاً
    const newState = !isFavorite;
    
    // ✅ تحديث فوري وسلس (بدون أي رفريش للشاشة)
    setIsFavorite(newState);
    globalFavStore.set(idStr, newState);
    
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);

    window.dispatchEvent(new CustomEvent('favoriteToggled', {
        detail: { listingId: idStr, isFavorite: newState }
    }));

    try {
        await api.post('/favorites/toggle/', { listing_id: listingId });
        
        // ✅ سحر الأداء: لو إحنا جوه صفحة المفضلة بس، نعمل رفريش عشان العقار يختفي/يظهر
        if (pathname === '/saved' || pathname === '/favorites') {
             router.refresh(); 
        }
    } catch (error) {
        // تراجع فوري لو حصل خطأ في السيرفر
        setIsFavorite(!newState);
        globalFavStore.set(idStr, !newState);
        window.dispatchEvent(new CustomEvent('favoriteToggled', {
            detail: { listingId: idStr, isFavorite: !newState }
        }));
        console.error("Favorite Error:", error);
    } finally {
        isProcessing.current = false; // فتح الزرار تاني
    }
  }, [listingId, idStr, isFavorite, router, pathname]); 

  return (
        <button 
            onClick={handleToggleFavorite}
            disabled={isProcessing.current}
            aria-label={isFavorite ? "إزالة من المفضلة" : "إضافة للمفضلة"}
            className="group relative flex items-center justify-center p-2.5 rounded-full bg-white/80 backdrop-blur-md shadow-[0_4px_15px_rgba(0,0,0,0.08)] hover:bg-white border border-gray-100 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        >
            {isAnimating && isFavorite && (
                <span className="absolute inset-0 rounded-full bg-red-400 opacity-50 animate-ping"></span>
            )}
            
            <Heart 
                className={`w-5 h-5 transition-all duration-300 ${
                    isFavorite 
                    ? 'fill-red-500 text-red-500 scale-110 drop-shadow-[0_2px_8px_rgba(239,68,68,0.4)]' 
                    : 'text-gray-400 group-hover:text-red-400 group-hover:scale-105'
                } ${isAnimating ? 'scale-125' : ''}`}
                strokeWidth={2} 
            />
        </button>
    );
}