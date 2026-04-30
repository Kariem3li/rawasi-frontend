import { Metadata, ResolvingMetadata } from 'next';
import PromotionClient from './PromotionClient';
import { API_URL, getFullImageUrl } from '@/lib/config';
import { notFound } from 'next/navigation'; 

type Props = {
  params: Promise<{ slug: string }>
}

async function getPromotionData(slug: string) {
    try {
        const res = await fetch(`${API_URL}/promotions/?slug=${slug}`, { 
            next: { revalidate: 60 } 
        });
        if (!res.ok) return null;
        const data = await res.json();
        return data.results && data.results.length > 0 ? data.results[0] : null;
    } catch (error) {
        console.error("Error fetching promotion:", error);
        return null;
    }
}

export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const resolvedParams = await params;
  const promo = await getPromotionData(resolvedParams.slug);

  if (!promo) return { title: 'عرض غير متاح | رواسي للعقارات' };

  // 🚀 تنظيف الـ HTML من الوصف عشان محركات البحث
  const rawDescription = promo.subtitle || promo.description || 'عرض حصري من رواسي للعقارات';
  const cleanDescription = rawDescription.replace(/<[^>]*>?/gm, '').substring(0, 150);

  return {
      title: `${promo.title} | رواسي للعقارات`,
      description: cleanDescription,
      openGraph: {
          images: promo.cover_image ? [getFullImageUrl(promo.cover_image)] : [],
          title: promo.title,
          description: cleanDescription,
      },
  }
}

export default async function PromotionPage({ params }: Props) {
  const resolvedParams = await params;
  const promoData = await getPromotionData(resolvedParams.slug);

  if (!promoData) {
      notFound(); 
  }

  return <PromotionClient promo={promoData} />;
}