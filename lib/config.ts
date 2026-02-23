// src/lib/config.ts

// ✅ قراءة الرابط ديناميكياً (لو رفعناه هيقرأ متغير البيئة، لو مفيش هيستخدم رابط Railway)
export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://rawasi-project-v5-production.up.railway.app";
export const API_URL = `${BASE_URL}/api`;

export const getFullImageUrl = (imagePath: string | null | undefined): string => {
    // 1. صورة افتراضية لو مفيش صورة مرفوعة
    if (!imagePath) return "https://placehold.co/800x600/e2e8f0/475569?text=No+Image";

    let cleanPath = decodeURIComponent(imagePath);

    // 2. السحر هنا: استخراج الرابط الحقيقي متجاهلاً دمج دجانجو الغريب
    // هنجيب "آخر" مرة اتكتبت فيها كلمة http وناخد الرابط من عندها
    const lastHttpIndex = cleanPath.lastIndexOf("http");
    if (lastHttpIndex !== -1) {
        cleanPath = cleanPath.substring(lastHttpIndex);
    }

    // 3. التعامل مع روابط Cloudinary بأمان تام
    if (cleanPath.includes("res.cloudinary.com")) {
        // لو دجانجو مسح الـ s بالغلط نرجعها
        if (cleanPath.startsWith("http://")) {
            cleanPath = cleanPath.replace("http://", "https://");
        }
        
        // تحسين الجودة لسرعة الموقع
        if (!cleanPath.includes("f_auto") && !cleanPath.includes("q_auto")) {
            cleanPath = cleanPath.replace("/upload/", "/upload/f_auto,q_auto,w_800/");
        }
        return cleanPath;
    }

    // 4. لو رابط خارجي عادي سليم
    if (cleanPath.startsWith("http")) {
        return cleanPath;
    }

    // 5. لو مسار محلي عادي
    cleanPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
    if (cleanPath.startsWith(BASE_URL)) return cleanPath;

    return `${BASE_URL}${cleanPath}`;
};