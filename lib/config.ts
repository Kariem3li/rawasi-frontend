// src/lib/config.ts

// ✅ قراءة الرابط ديناميكياً (لو رفعناه هيقرأ متغير البيئة، لو مفيش هيستخدم رابط Railway)
export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://rawasi-project-v5-production.up.railway.app";
export const API_URL = `${BASE_URL}/api`;

export const getFullImageUrl = (imagePath: string | null | undefined): string => {
    // 1. لو مفيش صورة، رجع صورة رمادية شيك
    if (!imagePath) return "https://placehold.co/800x600/e2e8f0/475569?text=No+Image";

    let cleanPath = decodeURIComponent(imagePath);

    // 2. فك اشتباك الـ /media/https:// اللي دجانجو بيعمله
    if (cleanPath.includes("media/https://")) {
        cleanPath = cleanPath.split("media/")[1]; // بياخد الجزء اللي بعد /media/ (اللي هو الرابط الصح)
    } else if (cleanPath.includes("media/http://")) {
        cleanPath = cleanPath.split("media/")[1];
    }

    // 3. التعامل مع كلاوديناري
    if (cleanPath.includes("res.cloudinary.com")) {
        const pathParts = cleanPath.split("res.cloudinary.com/");
        let cloudinaryUrl = "https://res.cloudinary.com/" + pathParts[1];

        // تحسين الجودة أوتوماتيك
        if (!cloudinaryUrl.includes("f_auto") && !cloudinaryUrl.includes("q_auto")) {
            cloudinaryUrl = cloudinaryUrl.replace("/upload/", "/upload/f_auto,q_auto,w_800/");
        }
        return cloudinaryUrl;
    }

    // 4. لو رابط خارجي عادي (زي فيسبوك أو جوجل)
    const httpIndex = cleanPath.indexOf("http");
    if (httpIndex !== -1) {
        let externalUrl = cleanPath.substring(httpIndex);
        if (externalUrl.startsWith("https:/") && !externalUrl.startsWith("https://")) {
            externalUrl = externalUrl.replace("https:/", "https://");
        }
        return externalUrl;
    }

    // 5. لو صورة محلية
    cleanPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
    if (cleanPath.startsWith(BASE_URL)) return cleanPath;

    return `${BASE_URL}${cleanPath}`;
};