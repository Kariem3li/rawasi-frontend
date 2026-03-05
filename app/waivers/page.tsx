"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { 
    Search, MapPin, Building, FileText, 
    Award, Clock, Loader2, Sparkles, AlertCircle,
    User, Phone, BellRing
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

  // 🚀 السحر الأول: سحب بيانات العميل لو مسجل دخول
  useEffect(() => {
    // بنقرا البيانات اللي حفظناها في صفحة اللوجين
    const savedName = localStorage.getItem("username") || sessionStorage.getItem("username");
    const savedPhone = localStorage.getItem("remembered_phone");

    if (savedName) {
        setFormData(prev => ({
            ...prev,
            full_name: savedName,
            // لو مفيش رقم محفوظ، هنسيبها فاضية يكتبها
            phone_number: savedPhone || ""
        }));
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.phone_number || !formData.plot || !formData.neighborhood || !formData.district) return;

    setLoading(true);
    setResult(null);

    // محاكاة الاتصال بالسيرفر
    setTimeout(() => {
        if (formData.plot === "123") {
            setResult({
                status: 'success',
                data: {
                    plot: formData.plot,
                    neighborhood: formData.neighborhood,
                    district: formData.district,
                    procedure: "تمت الموافقة النهائية واستخراج العقد",
                    committee_number: "لجنة رقم 45 - لسنة 2026",
                    date: new Date().toLocaleDateString('ar-EG')
                }
            });
        } else {
            setResult({ status: 'pending' });
        }
        setLoading(false);
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans dir-rtl relative overflow-hidden">
      <Navbar />

      {/* خلفية جمالية */}
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

        {/* 🔍 فورم البحث */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-xl p-6 md:p-8 w-full border border-white/50 animate-in zoom-in-95 duration-500">
            
            {/* 💡 الرسالة الذكية للعميل */}
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
                
                {/* 👤 قسم البيانات الشخصية */}
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

                {/* 📍 قسم بيانات القطعة */}
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

        {/* باقي الكود بتاع النتيجة (مبروك أو جاري الانتظار) زي ما هو بالظبط */}
        {result?.status === 'success' && (
            <div className="mt-8 w-full bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-[2rem] p-6 md:p-10 shadow-lg animate-in slide-in-from-bottom-8 fade-in duration-500 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-amber-400 to-emerald-400 animate-pulse"></div>
                
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(16,185,129,0.3)] animate-bounce">
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-black text-emerald-800 mb-2">ألف مبروك يا {formData.full_name.split(' ')[0]}! 🎉</h2>
                    <p className="text-emerald-600 font-bold">تم إنهاء إجراءات التنازل بنجاح للقطعة الخاصة بك.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-emerald-100 flex items-center gap-4">
                        <div className="bg-emerald-50 p-3 rounded-xl"><FileText className="w-6 h-6 text-emerald-600" /></div>
                        <div>
                            <p className="text-[11px] text-slate-500 font-bold">رقم القطعة / الحي / المجاورة</p>
                            <p className="text-lg font-black text-slate-800">{result.data.plot} / {result.data.district} / {result.data.neighborhood}</p>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-emerald-100 flex items-center gap-4">
                        <div className="bg-amber-50 p-3 rounded-xl"><Award className="w-6 h-6 text-amber-600" /></div>
                        <div>
                            <p className="text-[11px] text-slate-500 font-bold">رقم اللجنة</p>
                            <p className="text-lg font-black text-slate-800">{result.data.committee_number}</p>
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
            <div className="mt-8 w-full bg-white border-2 border-slate-100 rounded-[2rem] p-6 md:p-10 shadow-lg animate-in slide-in-from-bottom-8 fade-in duration-500">
                <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-5 border-4 border-slate-100">
                        <Clock className="w-10 h-10 text-slate-400" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 mb-2">جاري العمل على طلبك ⏳</h2>
                    <p className="text-slate-500 font-bold leading-relaxed max-w-md">
                        لم يتم تسجيل إجراءات التنازل لهذه القطعة حتى الآن. فريقنا يتابع الإجراءات في الجهاز بشكل مستمر. 
                        <br/> <span className="text-amber-600">سنقوم بالتواصل معك على رقمك ({formData.phone_number}) فور صدور الموافقة!</span>
                    </p>
                    
                    <div className="mt-6 flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-3 rounded-xl text-sm font-bold border border-blue-100">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        تأكد من إدخال رقم القطعة والحي بشكل صحيح.
                    </div>
                </div>
            </div>
        )}

      </div>
    </main>
  );
}

function CheckCircleIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
  )
}