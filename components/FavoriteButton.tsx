"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import { Heart } from 'lucide-react';
import api from "@/lib/axios";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider"; 
import toast from "react-hot-toast";

// الذاكرة العالمية: مزامنة القلوب في الموقع بالكامل
export const globalFavStore = new Map<string, boolean>();

interface FavoriteButtonProps {
  listingId: number | string;
  isInitialFavorite: boolean;
}

export default function FavoriteButton({ listingId, isInitialFavorite }: FavoriteButtonProps) {
  const router = useRouter();
  const pathname = usePathname(); 
  const { isAuthenticated } = useAuth(); 
  const idStr = String(listingId);
  
  const [isFavorite, setIsFavorite] = useState<boolean>(() => {
      if (globalFavStore.has(idStr)) return globalFavStore.get(idStr) as boolean;
      return isInitialFavorite;
  });
  
  const [isAnimating, setIsAnimating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); 
  
  // 🚀 1. استخدام Ref للوجيك عشان ميتأثرش بذاكرة الرياكت (يمنع الضغط المزدوج بامتياز)
  const processingRef = useRef(false);

  useEffect(() => {
      const currentVal = globalFavStore.get(idStr);
      if (currentVal !== undefined) {
          setIsFavorite((prev) => prev !== currentVal ? currentVal : prev);
      } else {
          globalFavStore.set(idStr, isInitialFavorite);
          setIsFavorite((prev) => prev !== isInitialFavorite ? isInitialFavorite : prev);
      }
  }, [idStr, isInitialFavorite]);

  useEffect(() => {
    const syncFavorite = (e: any) => {
        if (String(e.detail.listingId) === idStr) {
            const newValue = e.detail.isFavorite;
            setIsFavorite(newValue);
            globalFavStore.set(idStr, newValue);
        }
    };
    
    window.addEventListener('favoriteToggled', syncFavorite);
    return () => window.removeEventListener('favoriteToggled', syncFavorite);
  }, [idStr]);

  const handleToggleFavorite = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation(); 

    // الاعتماد على الـ Ref هنا بيحل مشكلة الـ Stale Closure تماماً
    if (processingRef.current) return; 

    if (!isAuthenticated) {
        sessionStorage.setItem('redirectAfterLogin', pathname);
        router.push("/login");
        return;
    }

    processingRef.current = true;
    setIsProcessing(true); 
    
    // 🚀 2. استخدام (prev) عشان دايماً يجيب أحدث حالة بدون ما نعتمد على المتغير الخارجي
    setIsFavorite((prev) => {
        const newState = !prev; // عكس الحالة الحالية دايماً
        globalFavStore.set(idStr, newState);
        
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 300);

        window.dispatchEvent(new CustomEvent('favoriteToggled', {
            detail: { listingId: idStr, isFavorite: newState }
        }));

        return newState;
    });

    try {
        await api.post('/favorites/toggle/', { listing_id: listingId });
    } catch (error) {
        // التراجع في حالة الخطأ
        setIsFavorite((prev) => {
            const rollbackState = !prev;
            globalFavStore.set(idStr, rollbackState);
            
            window.dispatchEvent(new CustomEvent('favoriteToggled', {
                detail: { listingId: idStr, isFavorite: rollbackState }
            }));
            
            return rollbackState;
        });
        console.error("Favorite Error:", error);
        toast.error("فشل التحديث، تأكد من الاتصال بالإنترنت."); 
    } finally {
        processingRef.current = false;
        setIsProcessing(false);
    }
  // 🚀 3. مصفوفة نظيفة جداً ومفيهاش أي متغير بيعمل Re-create
  }, [listingId, idStr, router, isAuthenticated, pathname]); 

  return (
        <button 
            onClick={handleToggleFavorite}
            disabled={isProcessing}
            aria-label={isFavorite ? "إزالة من المفضلة" : "إضافة للمفضلة"}
            className={`group relative flex items-center justify-center p-2.5 rounded-full bg-white/90 backdrop-blur-md shadow-sm border border-gray-200 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-500/50 hover:border-red-200 ${isProcessing ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-md'}`}
        >
            {isAnimating && isFavorite && (
                <span className="absolute inset-0 rounded-full bg-red-400 opacity-60 animate-ping duration-300 pointer-events-none"></span>
            )}
            
            <Heart 
                className={`w-5 h-5 transition-all duration-300 ${
                    isFavorite 
                    ? 'fill-red-500 text-red-500 scale-110 drop-shadow-[0_2px_6px_rgba(239,68,68,0.5)]' 
                    : 'text-slate-400 group-hover:text-red-400 group-hover:scale-105'
                } ${isAnimating ? 'scale-125' : ''}`}
                strokeWidth={isFavorite ? 1.5 : 2} 
            />
        </button>
    );
}