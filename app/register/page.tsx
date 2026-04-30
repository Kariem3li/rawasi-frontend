"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import { 
  Loader2, PhoneIcon, Lock, Briefcase, ChevronDown, 
  User, ShieldCheck, MessageCircle, UserPlus, Eye, EyeOff 
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { useContactInfo } from "@/lib/useContactInfo";
import Cookies from "js-cookie";
import toast, { Toaster } from "react-hot-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/providers/AuthProvider";
// 🚀 Zod Schema بضمان تطابق الباسورد والتحقق الكامل
const registerSchema = z.object({
  firstName: z.string().min(2, "الاسم الأول قصير جداً"),
  lastName: z.string().min(2, "الاسم الأخير قصير جداً"),
  clientType: z.enum(["Buyer", "Seller", "Marketer", "Investor"]),
  phone: z.string().regex(/^01[0125][0-9]{8}$/, "رقم هاتف مصري غير صالح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "كلمات المرور غير متطابقة",
  path: ["confirmPassword"], // لإظهار الإيرور تحت حقل التأكيد
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const router = useRouter();
  const { contactInfo } = useContactInfo();
  const { login } = useAuth(); // 👈 2. استدعاء دالة الـ login من البروفايدر
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { 
      register, 
      handleSubmit, 
      formState: { errors, isSubmitting } 
  } = useForm<RegisterFormValues>({
      resolver: zodResolver(registerSchema),
      defaultValues: { clientType: "Buyer" }
  });

  const onSubmit = async (data: RegisterFormValues) => {
      try {
          // 1. التسجيل
          await api.post('/auth/register/', { 
              first_name: data.firstName,
              last_name: data.lastName,
              phone_number: data.phone,
              password: data.password,
              client_type: data.clientType
          });

          // 2. الدخول التلقائي
          const loginRes = await api.post("/auth/login/", {
              phone_number: data.phone,
              password: data.password
          });
          const token = loginRes.data.token;
          const fullName = `${data.firstName} ${data.lastName}`;

          // 🚀 3. تحديث الـ Global State والـ Headers (زي صفحة اللوجين بالظبط)
          login(token, fullName, false, false); // isStaff = false, rememberMe = false
          api.defaults.headers.common['Authorization'] = `Token ${token}`;
          // حفظ التوكن بأمان
          Cookies.set("token", loginRes.data.token, { 
              secure: process.env.NODE_ENV === "production",
              sameSite: "strict" 
          });
          localStorage.setItem("username", `${data.firstName} ${data.lastName}`);

          setIsSuccess(true);
          toast.success("تم إنشاء الحساب بنجاح! جاري تحويلك...");
          
          setTimeout(() => {
              router.push("/");
          }, 1500);

      } catch (err: any) {
          const errorData = err.response?.data;
          let errorMessage = "حدث خطأ أثناء التسجيل، تأكد من صحة البيانات.";
          
          if (errorData?.phone_number) {
              errorMessage = "رقم الهاتف هذا مسجل بالفعل.";
          } else if (errorData?.password) {
              errorMessage = errorData.password[0];
          }
          
          toast.error(errorMessage);
      }
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans dir-rtl relative pb-10">
      <Toaster position="top-center" reverseOrder={false} />
      
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

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                
                {/* نوع الحساب */}
                <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">صفة التسجيل</label>
                    <div className="relative">
                        <Briefcase className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <select 
                            className="w-full h-14 bg-gray-50 border-2 border-transparent focus:border-amber-500 focus:bg-white rounded-2xl pr-12 pl-12 font-black text-slate-800 outline-none transition-all shadow-sm appearance-none cursor-pointer"
                            {...register("clientType")}
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
                            <input type="text" className={`w-full h-14 bg-gray-50 border-2 focus:bg-white rounded-2xl pr-10 pl-4 font-black text-slate-800 outline-none transition-all shadow-sm ${errors.firstName ? 'border-red-500' : 'border-transparent focus:border-amber-500'}`} placeholder="أحمد" {...register("firstName")} />
                        </div>
                        {errors.firstName && <p className="text-red-500 text-xs font-bold mt-1">{errors.firstName.message}</p>}
                    </div>
                    <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">الاسم الأخير</label>
                        <div className="relative">
                            <User className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input type="text" className={`w-full h-14 bg-gray-50 border-2 focus:bg-white rounded-2xl pr-10 pl-4 font-black text-slate-800 outline-none transition-all shadow-sm ${errors.lastName ? 'border-red-500' : 'border-transparent focus:border-amber-500'}`} placeholder="محمد" {...register("lastName")} />
                        </div>
                        {errors.lastName && <p className="text-red-500 text-xs font-bold mt-1">{errors.lastName.message}</p>}
                    </div>
                </div>

                {/* رقم الهاتف */}
                <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">رقم الهاتف (سيكون اسم الدخول)</label>
                    <div className="relative">
                        <PhoneIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input type="tel" dir="ltr" className={`w-full h-14 bg-gray-50 border-2 focus:bg-white rounded-2xl pr-12 pl-4 font-black text-slate-800 outline-none transition-all shadow-sm text-right ${errors.phone ? 'border-red-500' : 'border-transparent focus:border-amber-500'}`} placeholder="010XXXXXXXX" {...register("phone")} />
                    </div>
                    {errors.phone && <p className="text-red-500 text-xs font-bold mt-1">{errors.phone.message}</p>}
                </div>

                {/* كلمات المرور */}
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">كلمة المرور</label>
                        <div className="relative">
                            <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input type={showPassword ? "text" : "password"} className={`w-full h-14 bg-gray-50 border-2 focus:bg-white rounded-2xl pr-10 pl-10 font-black text-slate-800 outline-none transition-all shadow-sm dir-ltr text-left ${errors.password ? 'border-red-500' : 'border-transparent focus:border-amber-500'}`} placeholder="••••••••" {...register("password")} />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-500 transition-colors p-1">
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {errors.password && <p className="text-red-500 text-xs font-bold mt-1">{errors.password.message}</p>}
                    </div>
                    <div>
                        <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wider">تأكيد كلمة المرور</label>
                        <div className="relative">
                            <ShieldCheck className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input type={showConfirmPassword ? "text" : "password"} className={`w-full h-14 bg-gray-50 border-2 focus:bg-white rounded-2xl pr-10 pl-10 font-black text-slate-800 outline-none transition-all shadow-sm dir-ltr text-left ${errors.confirmPassword ? 'border-red-500' : 'border-transparent focus:border-amber-500'}`} placeholder="••••••••" {...register("confirmPassword")} />
                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-500 transition-colors p-1">
                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {errors.confirmPassword && <p className="text-red-500 text-xs font-bold mt-1">{errors.confirmPassword.message}</p>}
                    </div>
                </div>

                <button 
                    type="submit"
                    disabled={isSubmitting || isSuccess}
                    className="w-full bg-slate-900 text-white h-14 rounded-2xl font-black text-lg shadow-[0_10px_20px_rgba(0,0,0,0.15)] hover:bg-amber-500 hover:text-slate-900 transition-all active:scale-95 flex items-center justify-center gap-2 mt-6 disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
                >
                    {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <UserPlus className="w-6 h-6 ml-1" />}
                    {isSubmitting ? "جاري التسجيل..." : "إنشاء حساب"}
                </button>
            </form>

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