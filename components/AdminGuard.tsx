"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import api from "@/lib/axios";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  // 3 حالات: بيحمل، أو مسموح، أو مرفوض
  const [status, setStatus] = useState<"loading" | "authorized" | "denied">("loading");

  useEffect(() => {
    const verifyAdmin = async () => {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      
      // لو مفيش توكن أصلاً، اطرده
      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        // 🚀 السحر هنا: التحقق الفعلي من الباك إند
        const res = await api.get("/auth/users/me/");
        
        if (res.data.is_staff) {
          // لو هو أدمن حقيقي في قاعدة البيانات
          localStorage.setItem("is_staff", "true");
          setStatus("authorized");
        } else {
          // لو معاه توكن بس مستخدم عادي (مش أدمن)
          localStorage.removeItem("is_staff");
          setStatus("denied");
          router.replace("/"); // رجعه للصفحة الرئيسية
        }
      } catch (error) {
        // لو التوكن منتهي أو مزيف
        localStorage.removeItem("token");
        localStorage.removeItem("is_staff");
        setStatus("denied");
        router.replace("/login");
      }
    };

    verifyAdmin();
  }, [router]);

  // شاشة تحميل احترافية أثناء التحقق من السيرفر
  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 text-amber-500 animate-spin mb-4" />
        <p className="text-slate-500 font-bold">جاري التحقق من الصلاحيات بأمان...</p>
      </div>
    );
  }

  if (status === "denied") return null;

  return <>{children}</>;
}