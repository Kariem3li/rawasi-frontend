"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // بنقرأ الداتا من التخزين (سواء local أو session)
    const isStaffLocal = localStorage.getItem("is_staff");
    const isStaffSession = sessionStorage.getItem("is_staff");
    
    if (isStaffLocal === "true" || isStaffSession === "true") {
      setIsAuthorized(true);
    } else {
      // لو مش أدمن، اطرده على صفحة اللوجين فوراً
      router.replace("/login");
    }
  }, [router]);

  // شاشة تحميل شيك لحد ما نتأكد من هويته
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 text-amber-500 animate-spin mb-4" />
        <p className="text-slate-500 font-bold">جاري التحقق من الصلاحيات...</p>
      </div>
    );
  }

  return <>{children}</>;
}