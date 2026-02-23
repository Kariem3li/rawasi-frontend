"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { 
    Loader2, Phone, Lock, LogIn, Check, 
    MessageCircle, Phone as PhoneIcon, Eye, EyeOff, AlertCircle, HelpCircle 
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";

export default function Login() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); 
  
  const [contactInfo, setContactInfo] = useState({ support_phone: "", whatsapp_number: "" });

 useEffect(() => {
    const fetchContactInfo = async () => {
        try {
            const res = await api.get('/contact-info/');
            let data = res.data;
            
            // عشان نضمن إننا نقرأ الداتا صح سواء دجانجو مرجعها مصفوفة، أو Pagination، أو Object مباشر
            if (Array.isArray(data) && data.length > 0) {
                setContactInfo(data[0]); // بناخد أول عنصر في اللستة
            } else if (data.results && data.results.length > 0) {
                setContactInfo(data.results[0]); // لو دجانجو مفعل الـ Pagination
            } else if (data.support_phone || data.whatsapp_number) {
                setContactInfo(data); // لو راجعة مظبوطة
            } else {
                // لو الداتابيز فاضية أصلاً، هنحط أرقام افتراضية عشان الديزاين يظهر وميبوظش
                setContactInfo({ 
                    support_phone: "01000000000", 
                    whatsapp_number: "20100000000" 
                });
            }
        } catch (error) { 
            console.error("Error fetching contacts");
            // لو حصل إيرور في السيرفر، نحط أرقام افتراضية برضه كـ Fallback
            setContactInfo({ 
                support_phone: "01000000000", 
                whatsapp_number: "20100000000" 
            });
        }
    };
    fetchContactInfo();
  }, []);

  const handleLogin = async () => {
    setError(""); 

    if (!phone || !password) {
        setError("يرجى إدخال رقم الهاتف وكلمة المرور.");
        return;
    }

    setLoading(true);

    try {
        const res = await api.post('/auth/login/', {
            phone_number: phone,
            password: password
        });

        const token = res.data.token;
        const fullName = res.data.name || phone;

        // الحفظ حسب رغبة المستخدم
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('token', token);
        storage.setItem('username', fullName);
        
        if (res.data.is_staff) {
            storage.setItem('is_staff', "true");
        }

        router.push("/"); // ✅ توجيه سريع بدون Reload

    } catch (err: any) {
        if (err.response && err.response.data && err.response.data.non_field_errors) {
            setError(err.response.data.non_field_errors[0]);
        } else {
            setError("حدث خطأ في الاتصال بالخادم. حاول مرة أخرى.");
        }
    } finally {
        setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans dir-rtl relative">
      <Navbar />
      
      {/* خلفية جمالية */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-40"></div>
          <div className="absolute top-40 -left-40 w-96 h-96 bg-slate-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-40"></div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 relative z-10 mt-10 md:mt-0">
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-8 md:p-10 w-full max-w-md border border-white/50 animate-in fade-in slide-in-from-bottom-8 duration-700">
            
            <div className="text-center mb-8">
                <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-slate-900/20">
                    <LogIn className="w-10 h-10 text-amber-500" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 mb-2 tracking-wide">تسجيل الدخول</h1>
                <p className="text-slate-500 text-sm font-bold">مرحباً بك مجدداً في منصة رواسي للعقارات</p>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 flex items-center gap-3 border border-red-100 animate-in zoom-in duration-300 shadow-sm">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-black">{error}</p>
                </div>
            )}

            <div className="space-y-5">
                <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">رقم الهاتف</label>
                    <div className="relative">
                        <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                            type="tel" 
                            dir="ltr"
                            className="w-full h-14 bg-gray-50 border-2 border-transparent focus:border-amber-500 focus:bg-white rounded-2xl pr-12 pl-4 font-black text-slate-800 outline-none transition-all shadow-sm text-right"
                            placeholder="010XXXXXXXX"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">كلمة المرور</label>
                    <div className="relative">
                        <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                            type={showPassword ? "text" : "password"} 
                            className="w-full h-14 bg-gray-50 border-2 border-transparent focus:border-amber-500 focus:bg-white rounded-2xl pr-12 pl-12 font-black text-slate-800 outline-none transition-all shadow-sm"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                        />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-500 transition-colors p-1"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-2">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${rememberMe ? 'bg-amber-500 border-amber-500' : 'border-slate-300 group-hover:border-amber-400 bg-white'}`}>
                            {rememberMe && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <span className="text-sm font-bold text-slate-600 select-none">تذكرني</span>
                    </label>
                    {/* تم إزالة رابط نسيت كلمة المرور من هنا بناءً على طلبك */}
                </div>

                <button 
                    onClick={handleLogin}
                    disabled={loading}
                    className="w-full bg-slate-900 text-white h-14 rounded-2xl font-black text-lg shadow-[0_10px_20px_rgba(0,0,0,0.15)] hover:bg-amber-500 hover:text-slate-900 transition-all active:scale-95 flex items-center justify-center gap-2 mt-6 disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
                >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "دخول"}
                </button>
            </div>

            <div className="mt-8 text-center">
                <p className="text-sm text-slate-500 font-bold">
                    ليس لديك حساب؟ <Link href="/register" className="text-amber-600 hover:text-amber-700 underline underline-offset-4 ml-1">سجل الآن مجاناً</Link>
                </p>
            </div>

            {/* قسم الدعم الفني الاحترافي */}
            {(contactInfo.support_phone || contactInfo.whatsapp_number) && (
                <div className="mt-10 pt-8 border-t border-gray-200/60 relative">
                    {/* أيقونة المساعدة في المنتصف */}
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white px-3 flex items-center gap-2 text-slate-400">
                         <HelpCircle className="w-4 h-4" />
                    </div>
                    
                    <div className="text-center mb-5">
                        <h3 className="text-[13px] font-black text-slate-700 tracking-wide">هل تواجه مشكلة في تسجيل الدخول؟</h3>
                        <p className="text-[11px] text-slate-500 mt-1">فريق الدعم الفني متاح لمساعدتك فوراً</p>
                    </div>

                    <div className="flex gap-4">
                        {contactInfo.whatsapp_number && (
                            <a 
                                href={`https://wa.me/${contactInfo.whatsapp_number}`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="flex-1 group relative overflow-hidden flex items-center justify-center gap-2 bg-[#25D366]/10 text-[#25D366] h-12 rounded-xl border border-[#25D366]/30 hover:bg-[#25D366] hover:text-white shadow-sm transition-all text-sm font-black active:scale-95"
                            >
                                <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" /> 
                                <span>واتساب</span>
                            </a>
                        )}
                        
                        {contactInfo.support_phone && (
                            <a 
                                href={`tel:${contactInfo.support_phone}`} 
                                className="flex-1 group relative overflow-hidden flex items-center justify-center gap-2 bg-slate-100 text-slate-700 h-12 rounded-xl border border-slate-200 hover:bg-slate-900 hover:text-white hover:border-slate-900 shadow-sm transition-all text-sm font-black active:scale-95"
                            >
                                <PhoneIcon className="w-5 h-5 group-hover:scale-110 transition-transform" /> 
                                <span>اتصال سريع</span>
                            </a>
                        )}
                    </div>
                </div>
            )}
        </div>
      </div>
    </main>
  );
}