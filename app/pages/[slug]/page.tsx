import { Metadata, ResolvingMetadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import { API_URL, getFullImageUrl } from '@/lib/config'; 
import { AlertTriangle, Home } from 'lucide-react';

type Props = {
  params: { slug: string }
}

// ✅ 1. إعدادات محركات البحث (SEO)
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  try {
    const res = await fetch(`${API_URL}/pages/${params.slug}/`);
    if (!res.ok) throw new Error("Not Found");
    const pageData = await res.json();

    return {
      title: `${pageData.title} | رواسي للعقارات`,
      description: pageData.body_content?.substring(0, 160) || 'صفحة مخصصة لمنصة رواسي العقارية',
      openGraph: {
        images: pageData.cover_image ? [getFullImageUrl(pageData.cover_image)] : [],
        title: pageData.title,
      },
    }
  } catch (e) {
    return { title: 'صفحة غير متوفرة | رواسي' }
  }
}

// ✅ 2. مكون السيرفر (سريع جداً وصديق لمحركات البحث)
export default async function CustomPageDetails({ params }: Props) {
  let pageData = null;

  try {
      // استخدام revalidate بدل no-store لو دي صفحات مبتتغيرش كتير عشان تكون طلقة
      const res = await fetch(`${API_URL}/pages/${params.slug}/`, { next: { revalidate: 3600 } });
      if (res.ok) {
          pageData = await res.json();
      }
  } catch (error) {
      console.error("Error fetching page:", error);
  }

  // شاشة خطأ فخمة
  if (!pageData) {
      return (
        <main className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center px-4 text-center dir-rtl">
            <Navbar />
            <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-inner border border-red-100">
                <AlertTriangle className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-3">الصفحة غير موجودة</h1>
            <p className="text-slate-500 mb-8 font-bold max-w-md">عذراً، الرابط الذي تحاول الوصول إليه غير صحيح أو تم حذفه.</p>
            <Link href="/" className="bg-amber-500 text-slate-900 font-black px-8 py-4 rounded-xl hover:bg-amber-400 transition-all shadow-lg active:scale-95 flex items-center gap-2">
                <Home className="w-5 h-5" /> العودة للرئيسية
            </Link>
            <BottomNav />
        </main>
      );
  }

  return (
    <main className="min-h-screen bg-white pb-20 font-sans dir-rtl">
      <Navbar />
      
      {/* 🌟 هيدر الصفحة */}
      <div className="relative h-[40vh] md:h-[50vh] w-full bg-slate-900 flex items-end">
        {pageData.cover_image ? (
          <Image
            src={getFullImageUrl(pageData.cover_image)}
            alt={pageData.title}
            fill
            priority
            className="object-cover opacity-60"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900"></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
        
        <div className="relative z-10 w-full p-8 md:p-16 text-center max-w-4xl mx-auto">
           <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-2 drop-shadow-lg">{pageData.title}</h1>
           <div className="w-20 h-1.5 bg-amber-500 mx-auto mt-6 rounded-full"></div>
        </div>
      </div>

      {/* 📄 محتوى الصفحة */}
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        <div className="prose prose-lg md:prose-xl prose-slate max-w-none text-slate-700 leading-relaxed font-medium whitespace-pre-line prose-headings:font-black prose-headings:text-slate-900 prose-a:text-amber-600">
          {pageData.body_content}
        </div>
      </div>

      <BottomNav />
    </main>
  );
}