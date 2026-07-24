// بناخد الرابط الأساسي (لأغراض زي تجميع الصور)
export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://rawasi1-production.up.railway.app";

// بناخد رابط الـ API (اللي آخره /api) ونضمن إن مفيش سلاش زيادة في الآخر
const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "https://rawasi1-production.up.railway.app/api";
export const API_URL = rawApiUrl.replace(/\/$/, '');

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
    
    if (cleanPath.startsWith(BASE_URL)) return cleanPath;

    return `${BASE_URL}${cleanPath}`;
};