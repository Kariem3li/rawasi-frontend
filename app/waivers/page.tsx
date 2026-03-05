"use client";
import api from "@/lib/axios";
import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav"; // 👈 استدعاء البوتن ناف بار
import { 
    Search, MapPin, Building, FileText, 
    Award, Clock, Loader2, Sparkles, AlertCircle,
    User, Phone, BellRing, Calendar , Hourglass
} from "lucide-react";

export default function WaiversSearch() {
  const [formData, setFormData] = useState({ 
      full_name: "", 
      phone_number: "", 
      plot: "", 
      neighborhood: "", 
      district: "" 
  });
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const resultRef = useRef<HTMLDivElement>(null);

  // 🚀 التعديل الأول: جلب بيانات العميل (الاسم والفون) مباشرة من السيرفر
  useEffect(() => {
    const fetchUserData = async () => {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        
        if (token) {
            try {
                // لو مسجل دخول، هنجيب بياناته الأكيدة من الداتابيز
                const { data } = await api.get('/auth/users/me/');
                const fullName = (data.first_name || data.last_name) 
                    ? `${data.first_name} ${data.last_name}`.trim() 
                    : data.username;

                setFormData(prev => ({ 
                    ...prev, 
                    full_name: fullName || "", 
                    phone_number: data.phone_number || "" // 👈 السيرفر هيرجع الرقم هنا
                }));
            } catch (error) {
                console.error("فشل جلب بيانات المستخدم", error);
            }
        } else {
            // لو مش مسجل، نحاول نقرأ أي بيانات قديمة من المتصفح
            const savedName = localStorage.getItem("username") || sessionStorage.getItem("username");
            const savedPhone = localStorage.getItem("remembered_phone");
            if (savedName) {
                setFormData(prev => ({ ...prev, full_name: savedName, phone_number: savedPhone || "" }));
            }
        }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (result && resultRef.current) {
        resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [result]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.phone_number || !formData.plot || !formData.neighborhood || !formData.district) return;

    setLoading(true);
    setResult(null);

    try {
        const res = await api.post('/waivers/search/', {
            full_name: formData.full_name,
            phone_number: formData.phone_number,
            plot: formData.plot,
            neighborhood: formData.neighborhood,
            district: formData.district
        });

        if (res.data.status === 'success') {
            setResult({ status: 'success', data: res.data.data });
        } else {
            setResult({ status: 'pending' });
        }
    } catch (error: any) {
        console.error("Search error", error);
        alert("حدث خطأ في الاتصال، يرجى التأكد من البيانات والمحاولة لاحقاً.");
    } finally {
        setLoading(false);
    }
  };

  return (
    // 👈 التعديل التاني: ضفنا pb-24 عشان نعمل مساحة للمنيو السفلية
    <main className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans dir-rtl relative overflow-hidden pb-24 md:pb-0">
      <Navbar />

      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-40"></div>
          <div className="absolute top-40 -left-40 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-40"></div>
      </div>

      <div className="flex-1 flex flex-col items-center p-4 relative z-10 mt-10 max-w-4xl mx-auto w-full">
        
        <div className="text-center mb-10 animate-in fade-in slide-in-from-top-10 duration-700">
            <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-slate-900/20 relative">
                <FileText className="w-10 h-10 text-amber-500" />
                <div className="absolute -bottom-2 -right-2 bg-amber-500 text-slate-900 p-1.5 rounded-full border-4 border-[#F8FAFC]">
                    <Search className="w-4 h-4" />
                </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-3 tracking-wide">الاستعلام عن التنازلات</h1>
            <p className="text-slate-500 font-bold md:text-lg">تابع حالة ملفك وإجراءات التنازل بكل سهولة</p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-xl p-6 md:p-8 w-full border border-white/50 animate-in zoom-in-95 duration-500 mb-8">
            <div className="bg-blue-50/50 border border-blue-100 p-4 md:p-5 rounded-2xl flex items-start gap-4 mb-8 shadow-sm">
                <div className="bg-white p-2.5 rounded-xl shadow-sm shrink-0 border border-blue-50">
                    <BellRing className="w-6 h-6 text-blue-500 animate-pulse" />
                </div>
                <div>
                    <h4 className="text-sm md:text-base font-black text-slate-800 mb-1">لماذا نطلب بياناتك؟</h4>
                    <p className="text-xs md:text-sm text-slate-600 font-bold leading-relaxed">
                        يرجى التأكد من كتابة الاسم ورقم الهاتف بشكل صحيح، حيث سيقوم نظامنا بإرسال رسالة فورية لك عبر الواتساب أو اتصال هاتفي لتبليغك <span className="text-blue-600 font-black">بمجرد صدور الموافقة على التنازل الخاص بك!</span>
                    </p>
                </div>
            </div>

            <form onSubmit={handleSearch}>
                <div className="grid md:grid-cols-2 gap-5 mb-6 pb-6 border-b border-gray-100">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2">الاسم الرباعي</label>
                        <div className="relative">
                            <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input 
                                type="text" required
                                placeholder="اكتب اسمك بالكامل"
                                value={formData.full_name}
                                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                                className="w-full h-14 bg-gray-50 border-2 border-transparent focus:border-amber-500 focus:bg-white rounded-2xl pr-12 pl-4 font-bold text-slate-800 outline-none transition-all"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2">رقم الهاتف (للتواصل السريع)</label>
                        <div className="relative">
                            <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input 
                                type="tel" required dir="ltr"
                                placeholder="010XXXXXXXX"
                                value={formData.phone_number}
                                onChange={(e) => setFormData({...formData, phone_number: e.target.value.replace(/[^0-9]/g, '')})}
                                className="w-full h-14 bg-gray-50 border-2 border-transparent focus:border-amber-500 focus:bg-white rounded-2xl pr-12 pl-4 font-bold text-slate-800 outline-none transition-all text-right"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-5">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2">الحي</label>
                        <div className="relative">
                            <Building className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input 
                                type="text" required
                                placeholder="مثال: الأول"
                                value={formData.district}
                                onChange={(e) => setFormData({...formData, district: e.target.value})}
                                className="w-full h-14 bg-gray-50 border-2 border-transparent focus:border-amber-500 focus:bg-white rounded-2xl pr-12 pl-4 font-bold text-slate-800 outline-none transition-all"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2">المجاورة</label>
                        <div className="relative">
                            <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input 
                                type="text" required
                                placeholder="مثال: الأولى"
                                value={formData.neighborhood}
                                onChange={(e) => setFormData({...formData, neighborhood: e.target.value})}
                                className="w-full h-14 bg-gray-50 border-2 border-transparent focus:border-amber-500 focus:bg-white rounded-2xl pr-12 pl-4 font-bold text-slate-800 outline-none transition-all"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2">رقم القطعة</label>
                        <div className="relative">
                            <FileText className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input 
                                type="text" required
                                placeholder="مثال: 123"
                                value={formData.plot}
                                onChange={(e) => setFormData({...formData, plot: e.target.value})}
                                className="w-full h-14 bg-gray-50 border-2 border-transparent focus:border-amber-500 focus:bg-white rounded-2xl pr-12 pl-4 font-bold text-slate-800 outline-none transition-all"
                            />
                        </div>
                    </div>
                    <div className="md:col-span-3 mt-2">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-slate-900 text-white h-14 rounded-2xl font-black text-lg shadow-lg hover:bg-amber-500 hover:text-slate-900 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:shadow-none"
                        >
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Search className="w-5 h-5" /> استعلام الآن</>}
                        </button>
                    </div>
                </div>
            </form>
        </div>

        <div ref={resultRef} className="w-full">
            {result?.status === 'success' && (
                <div className="w-full bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-[2rem] p-6 md:p-10 shadow-lg animate-in slide-in-from-bottom-8 fade-in duration-500 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-amber-400 to-emerald-400 animate-pulse"></div>
                    
                    <div className="flex flex-col items-center text-center mb-8">
                        <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(16,185,129,0.3)] animate-bounce">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-black text-emerald-800 mb-2">ألف مبروك يا {formData.full_name.split(' ')[0]}! 🎉</h2>
                        <p className="text-emerald-600 font-bold">تم إنهاء إجراءات التنازل بنجاح للقطعة الخاصة بك.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-100 flex flex-col md:col-span-2">
                            <p className="text-xs text-slate-500 font-bold mb-3 flex items-center gap-2">
                                <MapPin className="w-4 h-4" /> بيانات القطعة
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 flex-1 min-w-[100px] text-center">
                                    <span className="block text-[10px] text-slate-400 font-bold mb-1">القطعة</span>
                                    <span className="font-black text-slate-800 text-lg">{result.data.plot}</span>
                                </div>
                                <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 flex-1 min-w-[100px] text-center">
                                    <span className="block text-[10px] text-slate-400 font-bold mb-1">المجاورة</span>
                                    <span className="font-black text-slate-800 text-lg">{result.data.neighborhood}</span>
                                </div>
                                <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 flex-1 min-w-[100px] text-center">
                                    <span className="block text-[10px] text-slate-400 font-bold mb-1">الحي</span>
                                    <span className="font-black text-slate-800 text-lg">{result.data.district}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-emerald-100 flex items-center gap-4">
                            <div className="bg-amber-50 p-3 rounded-xl"><Award className="w-6 h-6 text-amber-600" /></div>
                            <div>
                                <p className="text-[11px] text-slate-500 font-bold">رقم اللجنة</p>
                                <p className="text-lg font-black text-slate-800">{result.data.committee_number}</p>
                            </div>
                        </div>
                        
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-emerald-100 flex items-center gap-4">
                            <div className="bg-purple-50 p-3 rounded-xl"><Calendar className="w-6 h-6 text-purple-600" /></div>
                            <div>
                                <p className="text-[11px] text-slate-500 font-bold">تاريخ الإجراء</p>
                                <p className="text-lg font-black text-slate-800">{result.data.date}</p>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-emerald-100 md:col-span-2 flex items-center gap-4">
                            <div className="bg-blue-50 p-3 rounded-xl"><CheckCircleIcon className="w-6 h-6 text-blue-600" /></div>
                            <div>
                                <p className="text-[11px] text-slate-500 font-bold">الإجراء الذي تم</p>
                                <p className="text-lg font-black text-slate-800">{result.data.procedure}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {result?.status === 'pending' && (
                <div className="w-full bg-gradient-to-br from-rose-50 to-red-50 border-2 border-rose-200 rounded-[2rem] p-6 md:p-10 shadow-lg animate-in slide-in-from-bottom-8 fade-in duration-500 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 via-rose-400 to-red-400 animate-pulse"></div>

                    <div className="flex flex-col items-center text-center">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-5 border-4 border-rose-100 shadow-[0_0_30px_rgba(244,63,94,0.2)]">
                            <Hourglass className="w-10 h-10 text-rose-500 animate-[spin_3s_linear_infinite]" />
                        </div>
                        
                        <h2 className="text-2xl font-black text-rose-800 mb-2">
                            لسه شوية يا {formData.full_name.split(' ')[0]} 🥺
                        </h2>
                        
                        <p className="text-rose-600 font-bold leading-relaxed max-w-md">
                            لم يتم تسجيل إجراءات التنازل لهذه القطعة حتى الآن. فريقنا يتابع الإجراءات في الجهاز بشكل مستمر. 
                        </p>

                        <div className="mt-4 bg-white/60 px-5 py-3 rounded-xl border border-rose-100 shadow-sm">
                            <span className="text-red-700 font-black text-sm block">
                                سنقوم بالتواصل معك على رقمك ({formData.phone_number}) فور صدور الموافقة! 🚀
                            </span>
                        </div>
                        
                        <div className="mt-6 flex items-center justify-center gap-2 text-rose-500 text-xs font-bold">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            تأكد من إدخال رقم القطعة والحي بشكل صحيح، أو عاود الاستعلام لاحقاً.
                        </div>
                    </div>
                </div>
            )}
        </div>

      </div>

      {/* 👈 التعديل التالت: إضافة البوتن ناف بار أسفل الصفحة */}
      <BottomNav />
    </main>
  );
}

function CheckCircleIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
  )
}