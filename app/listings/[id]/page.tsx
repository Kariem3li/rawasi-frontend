import { Metadata, ResolvingMetadata } from 'next';
import ListingClient from './ListingClient'; 
import { API_URL, getFullImageUrl } from "@/lib/config";
import { notFound } from 'next/navigation'; // 🚀 استدعاء ضروري للـ SEO

type Props = { params: Promise<{ id: string }> }

// 🚀 1. دالة موحدة لمنع الـ Double Fetch وتخفيف الضغط على السيرفر
async function getListingData(id: string) {
    try {
        // 🚀 2. استخدام ISR بدل no-store (الصفحة تفتح طلقة وتتحدث كل 60 ثانية)
        const res = await fetch(`${API_URL}listings/${id}/`, { 
            next: { revalidate: 60 } 
        });
        if (!res.ok) return null;
        return await res.json();
    } catch (error) {
        console.error("Error fetching listing:", error);
        return null;
    }
}

// دالة الـ SEO
export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const resolvedParams = await params;
  const product = await getListingData(resolvedParams.id);
  
  if (!product) return { title: 'عقار غير متوفر | رواسي للعقارات' };

  return {
      title: `${product.title} | ${Number(product.price).toLocaleString('ar-EG')} ج.م`,
      description: product.description?.substring(0, 160) || 'شاهد تفاصيل هذا العقار المميز على رواسي للعقارات...',
      openGraph: {
          images: product.thumbnail ? [getFullImageUrl(product.thumbnail)] : [],
          title: product.title,
          description: product.description?.substring(0, 100),
      },
  }
}

// الصفحة الرئيسية (Server Component)
export default async function ListingPage({ params }: Props) {
  const resolvedParams = await params;
  const listingData = await getListingData(resolvedParams.id);

  // 🚀 3. استخدام notFound عشان جوجل ميأرشفش صفحة الخطأ
  if (!listingData) {
      notFound(); 
  }

  return <ListingClient listing={listingData} />;
}