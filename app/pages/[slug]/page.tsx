import { Metadata, ResolvingMetadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import { API_URL, getFullImageUrl } from '@/lib/config'; 

// 🚀 1. تعديل الـ Props لتتوافق مع تحديثات Next.js الجديدة (Params as Promise)
type Props = {
  params: Promise<{ slug: string }>
}

async function getPageData(slug: string) {
    try {
        const res = await fetch(`${API_URL}/pages/${slug}/`, { 
            next: { revalidate: 3600 } 
        });
        if (!res.ok) return null;
        return await res.json();
    } catch (error) {
        console.error("Error fetching page:", error);
        return null;
    }
}

// ✅ 2. إعدادات محركات البحث (SEO)
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // 🚀 فك الـ Promise بتاع الـ params
  const resolvedParams = await params;
  const pageData = await getPageData(resolvedParams.slug);

  if (!pageData) {
      return { title: 'صفحة غير متوفرة | رواسي' }
  }

  // تنظيف وصف الـ SEO من أي أكواد HTML لو الباك إند بيبعت HTML
  const cleanDescription = pageData.body_content
    ? pageData.body_content.replace(/<[^>]*>?/gm, '').substring(0, 160)
    : 'صفحة مخصصة لمنصة رواسي العقارية';

  return {
      title: `${pageData.title} | رواسي للعقارات`,
      description: cleanDescription,
      openGraph: {
          images: pageData.cover_image ? [getFullImageUrl(pageData.cover_image)] : [],
          title: pageData.title,
          description: cleanDescription,
      },
  }
}

// ✅ 3. مكون السيرفر الرئيسي
export default async function CustomPageDetails({ params }: Props) {
  // 🚀 فك الـ Promise بتاع الـ params
  const resolvedParams = await params;
  const pageData = await getPageData(resolvedParams.slug);

  if (!pageData) {
      notFound(); 
  }

  return (
    <main className="min-h-screen bg-white pb-20 font-sans dir-rtl">
      <Navbar />
      
      {/* 🌟 هيدر الصفحة */}
      <div className="relative h-[40vh] md:h-[50vh] w-full bg-slate-900 flex items-end">
        {pageData.cover_image ? (
          <Image
            src={getFullImageUrl(pageData.cover_image)}
            alt={pageData.title || "غلاف الصفحة"}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 100vw"
            className="object-cover opacity-60"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900"></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
        
        <div className="relative z-10 w-full p-8 md:p-16 text-center max-w-4xl mx-auto">
           <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-2 drop-shadow-lg">
             {pageData.title}
           </h1>
           <div className="w-20 h-1.5 bg-amber-500 mx-auto mt-6 rounded-full"></div>
        </div>
      </div>

      {/* 📄 محتوى الصفحة */}
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        {/* 🚀 4. استخدام dangerouslySetInnerHTML لعرض الـ HTML القادم من الداتا بيز بشكل سليم */}
        <div 
          className="prose prose-lg md:prose-xl prose-slate max-w-none text-slate-700 leading-relaxed font-medium prose-headings:font-black prose-headings:text-slate-900 prose-a:text-amber-600 prose-img:rounded-2xl prose-img:shadow-md"
          dangerouslySetInnerHTML={{ __html: pageData.body_content }}
        />
      </div>

      <BottomNav />
    </main>
  );
}