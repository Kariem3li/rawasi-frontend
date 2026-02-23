// src/lib/config.ts

// ✅ قراءة الرابط من ملف البيئة لتجنب مشاكل الـ Localhost والـ Production
// استبدل 192.168.1.8 بالـ IP بتاعك الحقيقي
export const API_URL = "http://192.168.1.8:8000/api";
export const BASE_URL = "http://192.168.1.8:8000";

export const getFullImageUrl = (imagePath: string | null | undefined): string => {
    // 1. لو مفيش صورة، نرجع صورة افتراضية شيك
    if (!imagePath) return "/images/placeholder-property.jpg";

    // 2. تنظيف الرابط في حال دجانجو قام بدمج الروابط (فك التشفير %3A إلى :)
    let cleanPath = decodeURIComponent(imagePath);

    // 3. ✅ سحر Cloudinary: استخراج الرابط النظيف حتى لو كان مشوه وتحسين أدائه
    if (cleanPath.includes("res.cloudinary.com")) {
        // قص الرابط من أول اسم كلاوديناري لضمان التخلص من أي مسارات محلية قبله
        const pathParts = cleanPath.split("res.cloudinary.com/");
        let cloudinaryUrl = "https://res.cloudinary.com/" + pathParts[1];

        // تطبيق تحسينات الأداء والصيغ التلقائية
        if (!cloudinaryUrl.includes("f_auto") && !cloudinaryUrl.includes("q_auto")) {
            cloudinaryUrl = cloudinaryUrl.replace("/upload/", "/upload/f_auto,q_auto,w_800/");
        }
        return cloudinaryUrl;
    }

    // 4. لو الرابط خارجي ومدمج بالخطأ (يبدأ بكلمة http في المنتصف)
    const httpIndex = cleanPath.indexOf("http");
    if (httpIndex !== -1) {
        let externalUrl = cleanPath.substring(httpIndex);
        // إصلاح السلاش الناقص لو دجانجو حذفه
        if (externalUrl.startsWith("https:/") && !externalUrl.startsWith("https://")) {
            externalUrl = externalUrl.replace("https:/", "https://");
        }
        if (externalUrl.startsWith("http:/") && !externalUrl.startsWith("http://")) {
            externalUrl = externalUrl.replace("http:/", "http://");
        }
        return externalUrl;
    }

    // 5. لو صورة محلية عادية (على سيرفر دجانجو بتاعنا)، ظبط المسار
    cleanPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
    
    // التأكد من عدم تكرار الـ BASE_URL لو موجود بالفعل
    if (cleanPath.startsWith(BASE_URL)) return cleanPath;

    return `${BASE_URL}${cleanPath}`;
};