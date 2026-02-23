"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Loader2, Mail, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import api from "@/lib/axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleReset = async () => {
    setError("");

    if (!email) { 
        setError("يرجى إدخال البريد الإلكتروني الخاص بك."); 
        return; 
    }
    
    setLoading(true);
    try {
      // ✅ استخدام api المركزي
      await api.post('/auth/users/reset_password/', { email });
      setSent(true);
    } catch (err: any) {
      if (err.response?.status === 400) {
          setError("لم يتم العثور على حساب بهذا البريد الإلكتروني.");
      } else {
          setError("فشل الاتصال بالخادم. حاول مرة أخرى لاحقاً.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-dvh bg-[#F8FAFC] flex flex-col font-sans relative dir-rtl">
      <div className="absolute top-0 w-full z-50">
        <Navbar />
      </div>
      
      {/* خلفية جمالية */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-40 -right-20 w-96 h-96 bg-amber-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-40"></div>
          <div className="absolute bottom-40 -left-20 w-96 h-96 bg-slate-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-30"></div>
      </div>
      
      <div className="flex-1 flex items-center justify-center px-4 relative z-10 mt-20 md:mt-0 animate-in fade-in zoom-in duration-500">
        <div className="bg-white/80 backdrop-blur-xl w-full max-w-md mx-auto rounded-[2.5rem] shadow-2xl border border-white/50 p-8 md:p-10 text-center relative overflow-hidden">
            
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-bl-[4rem] -mr-4 -mt-4 pointer-events-none"></div>

            {!sent ? (
                <>
                    <div className="w-20 h-20 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-lg shadow-slate-900/20 rotate-3 transform hover:rotate-0 transition-transform">
                        <Mail className="w-10 h-10 text-amber-500"/>
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 mb-2 tracking-wide">نسيت كلمة المرور؟</h1>
                    <p className="text-slate-500 text-sm font-bold mb-8">لا تقلق، أدخل بريدك الإلكتروني وسنرسل لك رابطاً لاستعادة حسابك بأمان.</p>
                    
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-6 flex items-center gap-2 text-xs font-bold border border-red-100 animate-in shake">
                            <AlertCircle className="w-4 h-4 shrink-0"/>
                            {error}
                        </div>
                    )}

                    <div className="space-y-5">
                        <div className="relative group text-right">
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-amber-500 transition-colors pointer-events-none">
                                <Mail className="w-5 h-5"/>
                            </div>
                            <input 
                                type="email" 
                                placeholder="name@example.com" 
                                className="w-full h-14 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-amber-500 rounded-xl pr-12 pl-4 transition-all outline-none font-bold text-slate-700 dir-ltr text-right"
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if(error) setError("");
                                }}
                                onKeyDown={(e) => e.key === 'Enter' && handleReset()}
                            />
                        </div>

                        <button onClick={handleReset} disabled={loading} className="w-full bg-slate-900 text-white h-14 rounded-xl font-black text-lg shadow-[0_10px_20px_rgba(0,0,0,0.15)] hover:bg-amber-500 hover:text-slate-900 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none">
                            {loading ? <Loader2 className="animate-spin w-6 h-6"/> : "إرسال الرابط"}
                        </button>
                    </div>
                </>
            ) : (
                <div className="py-8 animate-in zoom-in duration-300">
                    <div className="w-24 h-24 bg-green-50 border border-green-100 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                        <CheckCircle2 className="w-12 h-12 text-green-500"/>
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-3">تم الإرسال بنجاح! 🚀</h2>
                    <p className="text-slate-500 text-sm mb-8 font-medium leading-relaxed">
                        قمنا بإرسال رابط تعيين كلمة المرور إلى بريدك الإلكتروني. <br/>
                        <span className="text-amber-600 font-bold">يرجى مراجعة صندوق الوارد (أو مجلد Spam).</span>
                    </p>
                    <Link href="/login" className="bg-slate-900 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-amber-500 hover:text-slate-900 transition-colors shadow-lg shadow-slate-900/20 active:scale-95 inline-block">
                        العودة لتسجيل الدخول
                    </Link>
                </div>
            )}

            {!sent && (
                <div className="mt-8 pt-6 border-t border-gray-100">
                    <Link href="/login" className="flex items-center justify-center gap-2 text-slate-400 hover:text-slate-800 transition font-bold text-sm">
                        <ArrowLeft className="w-4 h-4"/> العودة لتسجيل الدخول
                    </Link>
                </div>
            )}
        </div>
      </div>
    </main>
  );
}