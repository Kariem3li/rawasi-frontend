export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://192.168.1.5:3000";

// استخلاص رابط الباك إند الأساسي وضمان وجود /api في الـ API_URL تلقائياً
const rawBackendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.5:8000";

// لو الرابط فيه /api في الآخر بنشيله ونظبطه عشان ميتكررش، وبعدين نضيفه بانتظام
const cleanBackendUrl = rawBackendUrl.replace(/\/api\/?$/, '');

export const API_URL = `${cleanBackendUrl}/api`;

export const getFullImageUrl = (imagePath: string | null | undefined): string => {
    if (!imagePath) return "https://placehold.co/800x600/e2e8f0/475569?text=No+Image";

    let cleanPath = decodeURIComponent(imagePath);

    if (cleanPath.startsWith("http")) {
        if (cleanPath.includes("res.cloudinary.com") && !cleanPath.includes("f_auto")) {
            return cleanPath.replace("/upload/", "/upload/f_auto,q_auto,w_800/");
        }
        return cleanPath;
    }

    cleanPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
    
    // منع إضافة الرابط مرتين لو الصورة مسارها كامل
    if (cleanPath.startsWith(cleanBackendUrl)) return cleanPath;

    return `${cleanBackendUrl}${cleanPath}`;
};