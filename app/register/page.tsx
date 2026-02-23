"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { 
  Loader2, PhoneIcon, Lock, Briefcase, ChevronDown, 
  User, ShieldCheck, MessageCircle, UserPlus, Eye, EyeOff, AlertCircle,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";

export default function Register() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    firstName: "", 
    lastName: "",
    phone: "", 
    password: "", 
    confirmPassword: "",
    clientType: "Buyer"
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [contactInfo, setContactInfo] = useState({ support_phone: "", whatsapp_number: "" });

  useEffect(() => {
    const fetchContactInfo = async () => {
        try {
            const res = await api.get('/contact-info/');
            setContactInfo(res.data);
        } catch (error) { console.error("Failed to fetch contact info"); }
    };
    fetchContactInfo();
  }, []);

  const handleChange = (e: any) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
      if (error) setError("");
  };

  const handleRegister = async () => {
    setError("");

    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.password) {
        setError("يرجى ملء جميع الحقول المطلوبة.");
        return;
    }

    if (formData.password !== formData.confirmPassword) {
        setError("كلمتا المرور غير متطابقتين.");
        return;
    }

    if (formData.password.length < 6) {
        setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل.");
        return;
    }

    setLoading(true);

    try {
        await api.post('/auth/users/', {
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone_number: formData.phone,
            password: formData.password,
            client_type: formData.clientType
        });

        setSuccess(true);
        setTimeout(() => {
            router.push("/login");
        }, 2000);

    } catch (err: any) {
        if (err.response && err.response.data) {
            const errorData = err.response.data;
            if (errorData.phone_number) {
                setError("رقم الهاتف هذا مسجل بالفعل.");
            } else if (errorData.password) {
                setError(errorData.password[0]);
            } else {
                setError("حدث خطأ أثناء التسجيل، تأكد من صحة البيانات.");
            }
        } else {
            setError("فشل الاتصال بالخادم. يرجى المحاولة لاحقاً.");
        }
    } finally {
        setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans dir-rtl relative pb-10">
      <Navbar />
      
      {/* خلفية جمالية */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 -right-20 w-[500px] h-[500px] bg-amber-200 rounded-full mix-blend-multiply filter blur-[120px] opacity-30"></div>
          <div className="absolute bottom-20 -left-20 w-[400px] h-[400px] bg-slate-300 rounded-full mix-blend-multiply filter blur-[120px] opacity-40"></div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 relative z-10 mt-8 md:mt-12">
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-6 md:p-10 w-full max-w-xl border border-white/50 animate-in fade-in slide-in-from-bottom-8 duration-700">
            
            <div className="text-center mb-8">
                <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-slate-900/20">
                    <UserPlus className="w-10 h-10 text-amber-500 ml-1" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 mb-2 tracking-wide">إنشاء حساب جديد</h1>
                <p className="text-slate-500 text-sm font-bold">انضم لمجتمع رواسي وابدأ رحلتك العقارية</p>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 flex items-center gap-3 border border-red-100 animate-in zoom-in duration-300 shadow-sm">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-black">{error}</p>
                </div>
            )}

            {success && (
                <div className="bg-green-50 text-green-700 p-4 rounded-2xl mb-6 flex items-center gap-3 border border-green-200 animate-in zoom-in duration-300 shadow-sm">
                    <CheckCircle2 className="w-6 h-6 shrink-0" />
                    <p className="text-sm font-black">تم إنشاء الحساب بنجاح! جاري تحويلك لتسجيل الدخول...</p>
                </div>
            )}

            <div className="space-y-5">
                
                {/* نوع الحساب */}
                <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">صفة التسجيل</label>
                    <div className="relative">
                        <Briefcase className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <select 
                            name="clientType"
                            className="w-full h-14 bg-gray-50 border-2 border-transparent focus:border-amber-500 focus:bg-white rounded-2xl pr-12 pl-12 font-black text-slate-800 outline-none transition-all shadow-sm appearance-none cursor-pointer"
                            value={formData.clientType}
                            onChange={handleChange}
                        >
                            <option value="Buyer">مشتري / أبحث عن عقار</option>
                            <option value="Seller">مالك / بائع</option>
                            <option value="Marketer">مسوق عقاري / سمسار</option>
                            <option value="Investor">مستثمر</option>
                        </select>
                        <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                    </div>
                </div>

                {/* الأسماء */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">الاسم الأول</label>
                        <div className="relative">
                            <User className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input type="text" name="firstName" className="w-full h-14 bg-gray-50 border-2 border-transparent focus:border-amber-500 focus:bg-white rounded-2xl pr-10 pl-4 font-black text-slate-800 outline-none transition-all shadow-sm" placeholder="أحمد" value={formData.firstName} onChange={handleChange} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">الاسم الأخير</label>
                        <div className="relative">
                            <User className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input type="text" name="lastName" className="w-full h-14 bg-gray-50 border-2 border-transparent focus:border-amber-500 focus:bg-white rounded-2xl pr-10 pl-4 font-black text-slate-800 outline-none transition-all shadow-sm" placeholder="محمد" value={formData.lastName} onChange={handleChange} />
                        </div>
                    </div>
                </div>

                {/* رقم الهاتف */}
                <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">رقم الهاتف (سيكون اسم الدخول)</label>
                    <div className="relative">
                        <PhoneIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input type="tel" dir="ltr" name="phone" className="w-full h-14 bg-gray-50 border-2 border-transparent focus:border-amber-500 focus:bg-white rounded-2xl pr-12 pl-4 font-black text-slate-800 outline-none transition-all shadow-sm text-right" placeholder="010XXXXXXXX" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/[^0-9]/g, '')})} />
                    </div>
                </div>

                {/* كلمات المرور */}
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">كلمة المرور</label>
                        <div className="relative">
                            <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input type={showPassword ? "text" : "password"} name="password" className="w-full h-14 bg-gray-50 border-2 border-transparent focus:border-amber-500 focus:bg-white rounded-2xl pr-10 pl-10 font-black text-slate-800 outline-none transition-all shadow-sm" placeholder="••••••••" value={formData.password} onChange={handleChange} />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-500 transition-colors p-1">
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">تأكيد كلمة المرور</label>
                        <div className="relative">
                            <ShieldCheck className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" className="w-full h-14 bg-gray-50 border-2 border-transparent focus:border-amber-500 focus:bg-white rounded-2xl pr-10 pl-10 font-black text-slate-800 outline-none transition-all shadow-sm" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} />
                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-500 transition-colors p-1">
                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={handleRegister}
                    disabled={loading || success}
                    className="w-full bg-slate-900 text-white h-14 rounded-2xl font-black text-lg shadow-[0_10px_20px_rgba(0,0,0,0.15)] hover:bg-amber-500 hover:text-slate-900 transition-all active:scale-95 flex items-center justify-center gap-2 mt-6 disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
                >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <UserPlus className="w-6 h-6 ml-1" />}
                    {loading ? "جاري التسجيل..." : "إنشاء حساب"}
                </button>
            </div>

            <div className="mt-8 text-center border-t border-gray-100 pt-6">
                <p className="text-sm text-slate-500 font-bold">
                    لديك حساب بالفعل؟ <Link href="/login" className="text-amber-600 hover:text-amber-700 underline underline-offset-4 ml-1">سجل الدخول من هنا</Link>
                </p>
            </div>

            {/* الدعم الفني */}
            {(contactInfo.support_phone || contactInfo.whatsapp_number) && (
                <div className="mt-8">
                    <div className="flex gap-3">
                        {contactInfo.whatsapp_number && (
                            <a href={`https://wa.me/${contactInfo.whatsapp_number}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 bg-[#25D366]/10 text-[#25D366] py-3 rounded-xl border border-[#25D366]/20 hover:bg-[#25D366] hover:text-white shadow-sm transition-all text-sm font-black active:scale-95">
                                <MessageCircle className="w-4 h-4" /> واتساب
                            </a>
                        )}
                        {contactInfo.support_phone && (
                            <a href={`tel:${contactInfo.support_phone}`} className="flex-1 flex items-center justify-center gap-2 bg-slate-100 text-slate-700 py-3 rounded-xl border border-slate-200 hover:bg-slate-900 hover:text-white hover:border-slate-900 shadow-sm transition-all text-sm font-black active:scale-95">
                                <PhoneIcon className="w-4 h-4" /> اتصال
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