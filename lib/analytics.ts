// src/lib/analytics.ts
import api from "./axios";

export type AnalyticsEventType = 'VIEW' | 'CLICK_DETAILS' | 'WHATSAPP' | 'CALL' | 'SEARCH';
export type AnalyticsTargetType = 'listing' | 'promotion';

export const trackEvent = async (
    eventType: AnalyticsEventType,
    targetType: AnalyticsTargetType,
    targetId: number | string
) => {
    if (!targetId) return;

    try {
        // ✅ استخدام api مباشرة (التوكن والهيدرز بتنضاف أوتوماتيك من axios.ts)
        await api.post('/analytics/track/', {
            event_type: eventType,
            target_type: targetType,
            target_id: targetId
        });
    } catch (error) {
        // بنطبع الخطأ في الكونسول بس عشان ميزعجش العميل لو الإحصائيات فشلت
        console.error("Analytics Error:", error);
    }
};