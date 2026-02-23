import { Metadata, ResolvingMetadata } from 'next';
import PromotionClient from './PromotionClient';
import { API_URL, getFullImageUrl } from '@/lib/config';
import { AlertTriangle, Home } from 'lucide-react';
import Link from 'next/link';

// ✅ التحديث الرسمي لـ Next.js 15: تعريف الـ params كـ Promise
type Props = {
  params: Promise<{ slug: string }>
}

// ✅ دالة الـ SEO (Server Side)
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // ✅ فك التشفير بشكل غير متزامن
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  try {
    const res = await fetch(`${API_URL}/promotions/?slug=${slug}`);
    const data = await res.json();
    const promo = data.results && data.results.length > 0 ? data.results[0] : null;

    if (!promo) return { title: 'عرض غير متاح | رواسي للعقارات' };

    return {
      title: `${promo.title} | رواسي للعقارات`,
      description: promo.subtitle || promo.description?.substring(0, 150),
      openGraph: {
        images: promo.cover_image ? [getFullImageUrl(promo.cover_image)] : [],
        title: promo.title,
        description: promo.subtitle,
      },
    }
  } catch (e) {
    return {
      title: 'رواسي للعقارات',
    }
  }
}

// ✅ مكون الصفحة الرئيسي (Server Component)
export default async function PromotionPage({ params }: Props) {
  // ✅ فك التشفير للحصول على الـ slug الصحيح
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  let promoData = null;

  try {
      // استخدام no-store لضمان جلب أحدث داتا دايماً
      const res = await fetch(`${API_URL}/promotions/?slug=${slug}`, { cache: 'no-store' });
      if (res.ok) {
          const data = await res.json();
          promoData = data.results && data.results.length > 0 ? data.results[0] : null;
      }
  } catch (error) {
      console.error("Error fetching promotion:", error);
  }

  // ✅ تصميم 404 بريميوم في حال عدم وجود العرض
  if (!promoData) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] px-4 text-center dir-rtl">
            <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-inner border border-red-100">
                <AlertTriangle className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-3">عفواً، هذا العرض غير متاح</h1>
            <p className="text-slate-500 mb-8 font-bold max-w-md leading-relaxed">
                يبدو أن هذا المشروع أو العرض قد انتهى أو تم إيقافه مؤقتاً.
            </p>
            <Link href="/" className="bg-amber-500 text-slate-900 font-black px-8 py-4 rounded-2xl hover:bg-amber-400 transition-all shadow-lg active:scale-95 flex items-center gap-2">
                <Home className="w-5 h-5" /> العودة للرئيسية
            </Link>
        </div>
      );
  }

  return <PromotionClient promo={promoData} />;
}