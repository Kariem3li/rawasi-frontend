export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://192.168.1.5:3000";
export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://192.168.1.5:8000";

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
    
    // 🚀 منع إضافة API_URL مرتين
    if (cleanPath.startsWith(API_URL)) return cleanPath;

    return `${API_URL}${cleanPath}`;
};