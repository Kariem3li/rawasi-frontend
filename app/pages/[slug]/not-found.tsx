import Link from 'next/link';
import { AlertTriangle, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-[80vh] bg-[#F8FAFC] flex flex-col items-center justify-center px-4 text-center dir-rtl">
        {/* شلنا الـ Navbar من هنا لأنه موجود في الـ Layout */}
        
        <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 shadow-inner border border-red-100 animate-in zoom-in duration-500">
            <AlertTriangle className="w-10 h-10" />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-3 tracking-wide">
            الصفحة غير موجودة
        </h1>
        
        <p className="text-slate-500 mb-8 font-bold max-w-md text-sm md:text-base leading-relaxed">
            عذراً، الرابط الذي تحاول الوصول إليه غير صحيح أو تم نقله. تأكد من الرابط أو عد إلى الصفحة الرئيسية.
        </p>
        
        <Link 
            href="/" 
            className="bg-amber-500 text-slate-900 font-black px-8 py-4 rounded-xl hover:bg-amber-400 transition-all shadow-[0_10px_20px_rgba(245,158,11,0.2)] active:scale-95 flex items-center gap-2 group"
        >
            <Home className="w-5 h-5 transition-transform group-hover:scale-110" /> 
            العودة للرئيسية
        </Link>
        
        {/* شلنا الـ BottomNav من هنا لأنه موجود في الـ Layout */}
    </main>
  );
}