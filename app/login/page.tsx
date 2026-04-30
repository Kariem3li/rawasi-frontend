"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { 
    Loader2, Phone, Lock, LogIn, Check, 
    MessageCircle, Phone as PhoneIcon, Eye, EyeOff, HelpCircle 
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { useContactInfo } from "@/lib/useContactInfo"; // السحر بتاعنا
import Cookies from "js-cookie"; // للأمان
import toast, { Toaster } from "react-hot-toast"; // للإشعارات
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/providers/AuthProvider"; // 👈 الاستدعاء
// 🚀 Zod Schema للـ Validation (بعد التعديل)
const loginSchema = z.object({
    phone: z.string().regex(/^01[0125][0-9]{8}$/, "رقم الهاتف غير صالح، يجب أن يكون رقم مصري صحيح"),
    password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
    rememberMe: z.boolean().optional(), // التعديل هنا: خليناها optional بدل default
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
    const router = useRouter();
    const { login } = useAuth();
    const { contactInfo } = useContactInfo();
    const [showPassword, setShowPassword] = useState(false);

    // 🚀 ربط React Hook Form بـ Zod
    const { 
        register, 
        handleSubmit, 
        setValue, 
        watch, 
        formState: { errors, isSubmitting } 
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { rememberMe: false }
    });

    const rememberMeChecked = watch("rememberMe");

    // استرجاع الرقم لو كان محفوظ
    useEffect(() => {
        const savedPhone = localStorage.getItem("remembered_phone");
        if (savedPhone) {
            setValue("phone", savedPhone);
            setValue("rememberMe", true);
        }
    }, [setValue]);

    const onSubmit = async (data: LoginFormValues) => {
        try {
            const res = await api.post('/auth/login/', {
                phone_number: data.phone,
                password: data.password
            });

            const token = res.data.token;
            const fullName = res.data.name || data.phone;
            
            // 🚀 تحويل القيمة لـ boolean صريح لتجنب مشاكل الـ undefined
            const isRemember = !!data.rememberMe; 
            const isStaff = !!res.data.is_staff;

            // 🚀 تشغيل الدالة الاحترافية (هتحدث الـ Navbar فوراً)
            login(token, fullName, isStaff, isRemember);
            api.defaults.headers.common['Authorization'] = `Token ${token}`;
            // 🚀 تخزين آمن باستخدام Cookies بدل LocalStorage للتوكن
            Cookies.set("token", token, { 
                expires: isRemember ? 30 : undefined, // هنا استخدمنا المتغير الجديد
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict"
            });

            // البيانات العادية ممكن تتحفظ في LocalStorage
            localStorage.setItem("username", fullName);
            if (res.data.is_staff) localStorage.setItem('is_staff', "true");

            if (isRemember) localStorage.setItem('remembered_phone', data.phone);
            else localStorage.removeItem('remembered_phone');

            toast.success("تم تسجيل الدخول بنجاح! جاري التحويل...");
            
            setTimeout(() => {
                router.push("/");
            }, 1000);

        } catch (err: any) {
            const errorMsg = err.response?.data?.non_field_errors?.[0] 
                || err.response?.data?.detail 
                || "بيانات الدخول غير صحيحة أو حدث خطأ في الاتصال.";
            
            toast.error(errorMsg);
        }
    };

    return (
        <main className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans dir-rtl relative">
            <Toaster position="top-center" reverseOrder={false} />
            
            {/* الخلفية الساحرة */}
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

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {/* حقل رقم الهاتف */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">رقم الهاتف</label>
                            <div className="relative">
                                <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input 
                                    type="tel" 
                                    dir="ltr"
                                    autoComplete="username tel" 
                                    className={`w-full h-14 bg-gray-50 border-2 focus:bg-white rounded-2xl pr-12 pl-4 font-black text-slate-800 outline-none transition-all shadow-sm text-right ${errors.phone ? 'border-red-500 focus:border-red-500' : 'border-transparent focus:border-amber-500'}`}
                                    placeholder="010XXXXXXXX"
                                    {...register("phone")}
                                />
                            </div>
                            {errors.phone && <p className="text-red-500 text-xs font-bold mt-2">{errors.phone.message}</p>}
                        </div>

                        {/* حقل كلمة المرور */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">كلمة المرور</label>
                            <div className="relative">
                                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    autoComplete="current-password"
                                    className={`w-full h-14 bg-gray-50 border-2 focus:bg-white rounded-2xl pr-12 pl-12 font-black text-slate-800 outline-none transition-all shadow-sm text-left dir-ltr ${errors.password ? 'border-red-500 focus:border-red-500' : 'border-transparent focus:border-amber-500'}`}
                                    placeholder="••••••••"
                                    {...register("password")}
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-500 transition-colors p-1 focus:outline-none"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-500 text-xs font-bold mt-2">{errors.password.message}</p>}
                        </div>

                        {/* تذكرني */}
                        <div className="flex items-center justify-between mt-2">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${rememberMeChecked ? 'bg-amber-500 border-amber-500' : 'border-slate-300 group-hover:border-amber-400 bg-white'}`}>
                                    {rememberMeChecked && <Check className="w-3.5 h-3.5 text-white" />}
                                </div>
                                <input type="checkbox" className="hidden" {...register("rememberMe")} />
                                <span className="text-sm font-bold text-slate-600 select-none">تذكرني</span>
                            </label>
                        </div>

                        <button 
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-slate-900 text-white h-14 rounded-2xl font-black text-lg shadow-[0_10px_20px_rgba(0,0,0,0.15)] hover:bg-amber-500 hover:text-slate-900 transition-all active:scale-95 flex items-center justify-center gap-2 mt-6 disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
                        >
                            {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "دخول"}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-slate-500 font-bold">
                            ليس لديك حساب؟ <Link href="/register" className="text-amber-600 hover:text-amber-700 underline underline-offset-4 ml-1">سجل الآن مجاناً</Link>
                        </p>
                    </div>

                    {/* الدعم الفني باستخدام الـ Hook */}
                    {(contactInfo.support_phone || contactInfo.whatsapp_number) && (
                        <div className="mt-10 pt-8 border-t border-gray-200/60 relative">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white px-3 flex items-center gap-2 text-slate-400">
                                 <HelpCircle className="w-4 h-4" />
                            </div>
                            <div className="text-center mb-5">
                                <h3 className="text-[13px] font-black text-slate-700 tracking-wide">هل تواجه مشكلة في تسجيل الدخول؟</h3>
                                <p className="text-[11px] text-slate-500 mt-1">فريق الدعم الفني متاح لمساعدتك فوراً</p>
                            </div>
                            <div className="flex gap-4">
                                {contactInfo.whatsapp_number && (
                                    <a href={`https://wa.me/${contactInfo.whatsapp_number}`} target="_blank" rel="noopener noreferrer" className="flex-1 group relative overflow-hidden flex items-center justify-center gap-2 bg-[#25D366]/10 text-[#25D366] h-12 rounded-xl border border-[#25D366]/30 hover:bg-[#25D366] hover:text-white shadow-sm transition-all text-sm font-black active:scale-95">
                                        <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" /> 
                                        <span>واتساب</span>
                                    </a>
                                )}
                                {contactInfo.support_phone && (
                                    <a href={`tel:${contactInfo.support_phone}`} className="flex-1 group relative overflow-hidden flex items-center justify-center gap-2 bg-slate-100 text-slate-700 h-12 rounded-xl border border-slate-200 hover:bg-slate-900 hover:text-white hover:border-slate-900 shadow-sm transition-all text-sm font-black active:scale-95">
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