"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { UploadCloud, Download, FileText, Loader2, CheckCircle, AlertCircle, Trash2, Users } from 'lucide-react';

export default function AdminWaivers() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [downloading, setDownloading] = useState(false);
    
    // 👈 متغيرات الجدول الجديد
    const [leads, setLeads] = useState<any[]>([]);
    const [loadingLeads, setLoadingLeads] = useState(true);

    // 👈 جلب البيانات أول ما الصفحة تفتح
    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        setLoadingLeads(true);
        try {
            const res = await api.get('/admin-dashboard/waivers/leads/');
            setLeads(res.data);
        } catch (err) {
            console.error("Error fetching leads");
        } finally {
            setLoadingLeads(false);
        }
    };

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
            fetchLeads(); // 👈 تحديث الجدول بعد الرفع لأن الحالات ممكن تتغير
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

    // 👈 دالة الحذف
    const handleDeleteLead = async (id: number) => {
        if (!confirm("هل أنت متأكد من حذف بيانات هذا العميل؟")) return;
        
        try {
            await api.delete(`/admin-dashboard/waivers/leads/${id}/`);
            // مسح العميل من الشاشة فوراً بدون ريفريش
            setLeads(leads.filter(lead => lead.id !== id)); 
        } catch (err) {
            alert("حدث خطأ أثناء الحذف.");
        }
    };

    return (
        <div className="p-6 md:p-10 bg-slate-50 min-h-screen dir-rtl">
            <h1 className="text-3xl font-black text-slate-800 mb-2">إدارة التنازلات والعملاء</h1>
            <p className="text-slate-500 font-bold mb-8">ارفع ملفات الإكسيل الجديدة، وقم بتحميل وإدارة بيانات العملاء المهتمين.</p>

            <div className="grid md:grid-cols-2 gap-8 mb-10">
                {/* 📤 قسم رفع ملف التنازلات */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-blue-50 p-3 rounded-xl"><UploadCloud className="w-6 h-6 text-blue-500" /></div>
                        <h2 className="text-xl font-black text-slate-800">رفع إكسيل التنازلات</h2>
                    </div>

                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:bg-slate-50 transition-colors">
                        <input 
                            type="file" 
                            accept=".csv, .xlsx, .xls" 
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="hidden" 
                            id="excel-upload"
                        />
                        <label htmlFor="excel-upload" className="cursor-pointer flex flex-col items-center">
                            <FileText className={`w-12 h-12 mb-3 ${file ? 'text-blue-500' : 'text-slate-300'}`} />
                            <span className="font-bold text-slate-600">
                                {file ? file.name : "اضغط لاختيار ملف الإكسيل"}
                            </span>
                            <span className="text-xs text-slate-400 mt-2">الأعمدة المطلوبة: لجنة، تاريخ، الاجراء، ق، مج، حى</span>
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
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-amber-50 p-3 rounded-xl"><Download className="w-6 h-6 text-amber-500" /></div>
                        <h2 className="text-xl font-black text-slate-800">تصدير بيانات العملاء (Leads)</h2>
                    </div>
                    
                    <p className="text-slate-600 font-bold mb-8 leading-relaxed flex-1">
                        قم بتحميل ملف إكسيل يحتوي على أرقام هواتف، أسماء، والقطع التي استعلم عنها العملاء في الموقع للتواصل معهم وإتمام البيع.
                    </p>

                    <button 
                        onClick={handleExport}
                        disabled={downloading}
                        className="w-full bg-amber-500 text-slate-900 h-14 rounded-xl font-black shadow-lg hover:bg-amber-400 transition-all flex items-center justify-center gap-2 mt-auto"
                    >
                        {downloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Download className="w-5 h-5" /> تحميل الإكسيل الآن</>}
                    </button>
                </div>
            </div>

            {/* 📋 جدول العملاء المستعلمين */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 md:p-8 border-b border-slate-100 flex items-center gap-3">
                    <div className="bg-emerald-50 p-3 rounded-xl"><Users className="w-6 h-6 text-emerald-600" /></div>
                    <div>
                        <h2 className="text-xl font-black text-slate-800">سجل استعلامات العملاء</h2>
                        <p className="text-sm font-bold text-slate-500 mt-1">عرض جميع العملاء الذين قاموا بالاستعلام وإمكانية حذفهم</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loadingLeads ? (
                        <div className="flex justify-center items-center h-40">
                            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                        </div>
                    ) : leads.length === 0 ? (
                        <div className="text-center py-10 text-slate-500 font-bold">لا يوجد أي استعلامات مسجلة حتى الآن.</div>
                    ) : (
                        <table className="w-full text-right border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 text-slate-600 text-sm">
                                    <th className="p-4 font-black">الاسم</th>
                                    <th className="p-4 font-black">رقم الهاتف</th>
                                    <th className="p-4 font-black">القطعة / المجاورة / الحي</th>
                                    <th className="p-4 font-black">تاريخ الاستعلام</th>
                                    <th className="p-4 font-black">حالة التنازل</th>
                                    <th className="p-4 font-black text-center">إجراء</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leads.map((lead) => (
                                    <tr key={lead.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4 font-bold text-slate-800">{lead.full_name}</td>
                                        <td className="p-4 font-bold text-slate-600 dir-ltr text-right">{lead.phone_number}</td>
                                        <td className="p-4 font-bold text-slate-600">
                                            {lead.plot} / {lead.neighborhood} / {lead.district}
                                        </td>
                                        <td className="p-4 font-bold text-slate-500 text-sm">{lead.created_at}</td>
                                        <td className="p-4">
                                            {lead.status === 'Success' ? (
                                                <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-black">تم التنازل</span>
                                            ) : (
                                                <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-black">قيد الانتظار</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            <button 
                                                onClick={() => handleDeleteLead(lead.id)}
                                                className="p-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-colors"
                                                title="حذف الاستعلام"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}