import { Metadata, ResolvingMetadata } from 'next';
import ListingClient from './ListingClient'; 
import { API_URL, getFullImageUrl } from "@/lib/config";
import { Home, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

// ✅ 1. التعديل الأول: تعريف الـ params كـ Promise ليتوافق مع Next.js 15
type Props = {
  params: Promise<{ id: string }>
}

// دالة الـ SEO (تحسين جلب البيانات لمحركات البحث)
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  
  // ✅ 2. التعديل الثاني: فك تشفير الـ params قبل استخدامها
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  try {
    const res = await fetch(`${API_URL}/listings/${id}/`);
    if (!res.ok) throw new Error("Not Found");
    const product = await res.json();
    
    return {
      title: `${product.title} | ${Number(product.price).toLocaleString('ar-EG')} ج.م`,
      description: product.description?.substring(0, 160) || 'شاهد تفاصيل هذا العقار المميز على رواسي للعقارات...',
      openGraph: {
        images: product.thumbnail ? [getFullImageUrl(product.thumbnail)] : [],
        title: product.title,
        description: product.description?.substring(0, 100),
      },
    }
  } catch (e) {
    return { title: 'عقار غير متوفر | رواسي للعقارات' }
  }
}

// الصفحة الرئيسية (Server Component)
export default async function ListingPage({ params }: Props) {
  
  // ✅ 3. التعديل الثالث: فك التشفير هنا كمان عشان نبعت الرقم الحقيقي للسيرفر
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  let listingData = null;
  
  try {
      const res = await fetch(`${API_URL}/listings/${id}/`, { cache: 'no-store' }); 
      if (res.ok) {
          listingData = await res.json();
      }
  } catch (error) {
      console.error("Error fetching listing:", error);
  }

  // تصميم 404 بريميوم لو العقار اتباع أو اتحذف
  if (!listingData) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC] px-4 text-center">
            <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-inner border border-red-100">
                <AlertTriangle className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-3">عفواً، العقار غير متاح 😔</h1>
            <p className="text-slate-500 mb-8 font-bold max-w-md leading-relaxed">
                يبدو أن هذا العقار قد تم بيعه أو إيقافه بواسطة المالك. يمكنك استكشاف المزيد من العقارات المميزة لدينا.
            </p>
            <Link href="/" className="bg-amber-500 text-slate-900 font-black px-8 py-4 rounded-2xl hover:bg-amber-400 transition-all shadow-[0_10px_20px_rgba(245,158,11,0.2)] active:scale-95 flex items-center gap-2">
                <Home className="w-5 h-5" /> العودة للرئيسية
            </Link>
        </div>
      );
  }

  return <ListingClient listing={listingData} />;
}