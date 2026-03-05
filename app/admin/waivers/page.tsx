"use client";

import { useState } from 'react';
import api from '@/lib/axios';
import { UploadCloud, Download, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function AdminWaivers() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [downloading, setDownloading] = useState(false);

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        setMessage({ type: "", text: "" });
        
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await api.post('/admin-dashboard/waivers/upload/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMessage({ type: "success", text: res.data.message });
            setFile(null);
        } catch (err: any) {
            setMessage({ type: "error", text: err.response?.data?.error || "حدث خطأ أثناء رفع الملف" });
        } finally {
            setUploading(false);
        }
    };

    const handleExport = async () => {
        setDownloading(true);
        try {
            const res = await api.get('/admin-dashboard/waivers/export/', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'بيانات_العملاء_المنتظرين.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            alert("لا توجد بيانات لتصديرها حالياً أو حدث خطأ في السيرفر.");
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="p-6 md:p-10 bg-slate-50 min-h-screen dir-rtl">
            <h1 className="text-3xl font-black text-slate-800 mb-2">إدارة التنازلات والعملاء</h1>
            <p className="text-slate-500 font-bold mb-8">ارفع ملفات الإكسيل الجديدة، وقم بتحميل بيانات العملاء المهتمين.</p>

            <div className="grid md:grid-cols-2 gap-8">
                
                {/* 📤 قسم رفع ملف التنازلات */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-blue-50 p-3 rounded-xl"><UploadCloud className="w-6 h-6 text-blue-500" /></div>
                        <h2 className="text-xl font-black text-slate-800">رفع إكسيل التنازلات (Waivers)</h2>
                    </div>

                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:bg-slate-50 transition-colors">
                        <input 
                            type="file" 
                            accept=".xlsx, .xls" 
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="hidden" 
                            id="excel-upload"
                        />
                        <label htmlFor="excel-upload" className="cursor-pointer flex flex-col items-center">
                            <FileText className={`w-12 h-12 mb-3 ${file ? 'text-blue-500' : 'text-slate-300'}`} />
                            <span className="font-bold text-slate-600">
                                {file ? file.name : "اضغط لاختيار ملف الإكسيل"}
                            </span>
                            <span className="text-xs text-slate-400 mt-2">يجب أن يحتوي على: الحي، المجاورة، القطعة، الإجراء، اللجنة</span>
                        </label>
                    </div>

                    {message.text && (
                        <div className={`mt-4 p-4 rounded-xl flex items-center gap-2 font-bold text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {message.type === 'success' ? <CheckCircle className="w-5 h-5"/> : <AlertCircle className="w-5 h-5"/>}
                            {message.text}
                        </div>
                    )}

                    <button 
                        onClick={handleUpload} 
                        disabled={!file || uploading}
                        className="w-full mt-6 bg-slate-900 text-white h-14 rounded-xl font-black shadow-lg hover:bg-blue-600 transition-all disabled:bg-slate-300 flex items-center justify-center gap-2"
                    >
                        {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : "رفع وحفظ البيانات"}
                    </button>
                </div>

                {/* 📥 قسم تحميل بيانات العملاء */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-amber-50 p-3 rounded-xl"><Download className="w-6 h-6 text-amber-500" /></div>
                        <h2 className="text-xl font-black text-slate-800">تصدير بيانات العملاء (Leads)</h2>
                    </div>
                    
                    <p className="text-slate-600 font-bold mb-8 leading-relaxed">
                        قم بتحميل ملف إكسيل يحتوي على أرقام هواتف، أسماء، والقطع التي استعلم عنها العملاء في الموقع للتواصل معهم وإتمام البيع.
                    </p>

                    <button 
                        onClick={handleExport}
                        disabled={downloading}
                        className="w-full bg-amber-500 text-slate-900 h-14 rounded-xl font-black shadow-lg hover:bg-amber-400 transition-all flex items-center justify-center gap-2"
                    >
                        {downloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Download className="w-5 h-5" /> تحميل الإكسيل الآن</>}
                    </button>
                </div>

            </div>
        </div>
    );
}