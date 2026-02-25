"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, UploadCloud, Image as ImageIcon, PlusCircle, X, Search, Trash2, SplitSquareHorizontal } from "lucide-react";
import api from "@/lib/axios";
import axios from 'axios';
import imageCompression from 'browser-image-compression';

export default function AddPromotion() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [availableListings, setAvailableListings] = useState<any[]>([]); 

  const [formData, setFormData] = useState({
    title: "", subtitle: "", promo_type: "GENERAL", description: "",
    developer_name: "", payment_system: "", delivery_date: "", price_start_from: "", project_features: "",
    phone_number: "", whatsapp_number: "", youtube_url: "", target_listing_id: ""
  });

  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [developerLogo, setDeveloperLogo] = useState<File | null>(null);
  const [gallery, setGallery] = useState<File[]>([]);

  // 🔴 1. حالات (States) جديدة للوحدات وصور قبل وبعد
  const [units, setUnits] = useState([{ custom_title: "" }]);
  const [transformations, setTransformations] = useState([{ title: "", before: null as File | null, after: null as File | null }]);

  useEffect(() => {
    if (formData.promo_type === 'LISTING') {
      const fetchListings = async () => {
        try {
          const token = localStorage.getItem("token") || sessionStorage.getItem("token");
          const res = await api.get('/admin-dashboard/listings/', { headers: { Authorization: `Token ${token}` } });
          setAvailableListings(res.data);
        } catch (e) { console.error(e); }
      };
      fetchListings();
    }
  }, [formData.promo_type]);

  const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageSelect = async (e: any, type: string) => {
    if (!e.target.files || e.target.files.length === 0) return;
    try {
      const file = e.target.files[0];
      const compressedFile = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1920 });
      if (type === 'cover') setCoverImage(compressedFile);
      if (type === 'logo') setDeveloperLogo(compressedFile);
      if (type === 'gallery') {
          const files = Array.from(e.target.files) as File[];
          const compressedFiles = await Promise.all(files.map(f => imageCompression(f, { maxSizeMB: 1 })));
          setGallery([...gallery, ...compressedFiles]);
      }
    } catch (error) { console.error("Compression error:", error); }
  };

  const removeGalleryImage = (index: number) => {
    const newGallery = [...gallery];
    newGallery.splice(index, 1);
    setGallery(newGallery);
  };

  // 🔴 2. دوال التحكم في أنواع الوحدات
  const handleUnitChange = (index: number, val: string) => {
    const newUnits = [...units];
    newUnits[index].custom_title = val;
    setUnits(newUnits);
  };
  const addUnit = () => setUnits([...units, { custom_title: "" }]);
  const removeUnit = (index: number) => setUnits(units.filter((_, i) => i !== index));

  // 🔴 3. دوال التحكم في صور قبل وبعد
  const handleTransTitleChange = (index: number, val: string) => {
    const newTrans = [...transformations];
    newTrans[index].title = val;
    setTransformations(newTrans);
  };
  const handleTransImageSelect = async (index: number, type: 'before' | 'after', e: any) => {
    if (!e.target.files || e.target.files.length === 0) return;
    try {
        const compressedFile = await imageCompression(e.target.files[0], { maxSizeMB: 1, maxWidthOrHeight: 1080 });
        const newTrans = [...transformations];
        newTrans[index][type] = compressedFile;
        setTransformations(newTrans);
    } catch (error) { console.error(error); }
  };
  const addTransformation = () => setTransformations([...transformations, { title: "", before: null, after: null }]);
  const removeTransformation = (index: number) => setTransformations(transformations.filter((_, i) => i !== index));

  const uploadToCloudinary = async (file: File) => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "daksg9vcz"; 
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "doh2de38";
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", uploadPreset);
    const res = await axios.post(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, data);
    return res.data.secure_url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverImage) return alert("صورة الغلاف مطلوبة!");
    if (formData.promo_type === 'LISTING' && !formData.target_listing_id) return alert("يجب اختيار العقار المرتبط!");

    setSubmitting(true);
    try {
      setStatusMsg("جاري رفع الصور الأساسية...");
      const coverUrl = await uploadToCloudinary(coverImage);
      const logoUrl = developerLogo ? await uploadToCloudinary(developerLogo) : "";
      
      setStatusMsg("جاري رفع معرض الصور...");
      const galleryUrls = [];
      for (const img of gallery) galleryUrls.push(await uploadToCloudinary(img));

      // 🔴 4. رفع صور قبل وبعد (لو موجودة)
      const transPayload = [];
      if (formData.promo_type === 'SERVICE') {
          for (let i = 0; i < transformations.length; i++) {
              const t = transformations[i];
              if (t.before && t.after) {
                  setStatusMsg(`جاري رفع صور التشطيبات (${i + 1}/${transformations.length})...`);
                  const beforeUrl = await uploadToCloudinary(t.before);
                  const afterUrl = await uploadToCloudinary(t.after);
                  transPayload.push({ title: t.title, before: beforeUrl, after: afterUrl });
              }
          }
      }

      // تنظيف الوحدات الفارغة
      const validUnits = units.filter(u => u.custom_title.trim() !== "");

      setStatusMsg("جاري حفظ بيانات الإعلان...");
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      
      const payload = {
        ...formData,
        cover_image: coverUrl,
        developer_logo: logoUrl,
        gallery: galleryUrls,
        transformations: transPayload, // 👈 بنبعتهم للباك إند
        units: formData.promo_type === 'PROJECT' ? validUnits : [] // 👈 بنبعتهم للباك إند
      };

      await api.post('/admin-dashboard/promotions/add/', payload, {
        headers: { Authorization: `Token ${token}` }
      });

      setStatusMsg("تمت الإضافة بنجاح! 🚀");
      setTimeout(() => router.push('/admin/promotions'), 1500);
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء الحفظ");
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {submitting && (
        <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex flex-col items-center justify-center text-white">
          <Loader2 className="w-16 h-16 animate-spin text-amber-500 mb-4" />
          <h2 className="text-2xl font-black">{statusMsg}</h2>
        </div>
      )}

      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="p-2 bg-white rounded-xl shadow-sm hover:bg-gray-50"><ArrowLeft className="w-5 h-5"/></button>
        <h2 className="text-2xl font-black text-slate-800">إضافة مشروع / إعلان مميز</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* نوع الإعلان */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
            <label className="block text-sm font-bold text-slate-600 mb-3">اختر نوع الإعلان لتخصيص الحقول:</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { id: 'GENERAL', label: 'إعلان عام' },
                    { id: 'PROJECT', label: 'مشروع عقاري' },
                    { id: 'SERVICE', label: 'خدمة / تشطيبات' },
                    { id: 'LISTING', label: 'عقار VIP' }
                ].map(type => (
                    <button type="button" key={type.id} onClick={() => setFormData({...formData, promo_type: type.id})} className={`p-3 rounded-xl font-bold text-sm transition-all border-2 ${formData.promo_type === type.id ? 'bg-amber-50 border-amber-500 text-amber-700' : 'bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100'}`}>
                        {type.label}
                    </button>
                ))}
            </div>
        </div>

        {/* قسم: إعلان VIP */}
        {formData.promo_type === 'LISTING' && (
            <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100 animate-in fade-in zoom-in-95">
                <h3 className="font-black text-blue-800 mb-4 flex items-center gap-2"><Search className="w-5 h-5"/> ربط بعقار موجود</h3>
                <select name="target_listing_id" value={formData.target_listing_id} onChange={handleChange} className="w-full h-12 px-4 rounded-xl border-2 border-white font-bold outline-none focus:border-blue-400 shadow-sm">
                    <option value="">-- اختر العقار --</option>
                    {availableListings.map(l => (
                        <option key={l.id} value={l.id}>{l.title} (سعر: {l.price} ج)</option>
                    ))}
                </select>
            </div>
        )}

        {/* قسم: الأساسيات */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-bold text-slate-600 mb-2">عنوان الإعلان *</label><input required name="title" value={formData.title} onChange={handleChange} type="text" className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 font-bold outline-none focus:border-amber-500" /></div>
                <div><label className="block text-sm font-bold text-slate-600 mb-2">عنوان فرعي (اختياري)</label><input name="subtitle" value={formData.subtitle} onChange={handleChange} type="text" className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 font-bold outline-none focus:border-amber-500" /></div>
            </div>
            {formData.promo_type !== 'LISTING' && (
                <div><label className="block text-sm font-bold text-slate-600 mb-2">وصف تفصيلي</label><textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full p-4 rounded-xl border-2 border-slate-100 font-bold outline-none focus:border-amber-500 resize-none"></textarea></div>
            )}
        </div>

        {/* 🔴 قسم: المشروع العقاري (البيانات + الوحدات) */}
        {formData.promo_type === 'PROJECT' && (
            <div className="bg-emerald-50/50 p-6 rounded-[2rem] border border-emerald-100 animate-in fade-in zoom-in-95 space-y-6">
                <h3 className="font-black text-emerald-800 border-b border-emerald-200 pb-3">تفاصيل المشروع</h3>
                <div className="grid md:grid-cols-2 gap-4">
                    <div><label className="block text-xs font-bold text-slate-600 mb-1">اسم المطور العقاري</label><input name="developer_name" value={formData.developer_name} onChange={handleChange} className="w-full h-12 px-4 rounded-xl border-2 border-white focus:border-emerald-400 outline-none" /></div>
                    <div><label className="block text-xs font-bold text-slate-600 mb-1">تبدأ الأسعار من</label><input name="price_start_from" type="number" value={formData.price_start_from} onChange={handleChange} className="w-full h-12 px-4 rounded-xl border-2 border-white focus:border-emerald-400 outline-none" /></div>
                    <div><label className="block text-xs font-bold text-slate-600 mb-1">أنظمة السداد (مثال: 10% مقدم)</label><input name="payment_system" value={formData.payment_system} onChange={handleChange} className="w-full h-12 px-4 rounded-xl border-2 border-white focus:border-emerald-400 outline-none" /></div>
                    <div><label className="block text-xs font-bold text-slate-600 mb-1">موعد الاستلام</label><input name="delivery_date" value={formData.delivery_date} onChange={handleChange} className="w-full h-12 px-4 rounded-xl border-2 border-white focus:border-emerald-400 outline-none" /></div>
                </div>
                <div><label className="block text-xs font-bold text-slate-600 mb-1">مميزات المشروع (افصل بينها بفاصلة)</label><input name="project_features" value={formData.project_features} onChange={handleChange} placeholder="جيم, حمام سباحة, أمن 24 ساعة..." className="w-full h-12 px-4 rounded-xl border-2 border-white focus:border-emerald-400 outline-none" /></div>

                {/* --- أنواع الوحدات للمشاريع --- */}
                <div className="pt-4">
                  <h4 className="font-bold text-emerald-800 mb-3 flex items-center gap-2"><SplitSquareHorizontal className="w-4 h-4"/> أنواع الوحدات في المشروع</h4>
                  <div className="space-y-3">
                    {units.map((u, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                            <input type="text" value={u.custom_title} onChange={(e) => handleUnitChange(idx, e.target.value)} placeholder="مثال: شقة 150م بحديقة" className="flex-1 h-12 px-4 rounded-xl border-2 border-white focus:border-emerald-400 outline-none font-bold text-sm" />
                            <button type="button" onClick={() => removeUnit(idx)} className="p-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition"><Trash2 className="w-5 h-5"/></button>
                        </div>
                    ))}
                    <button type="button" onClick={addUnit} className="flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-100/50 px-4 py-2 rounded-xl transition">
                        <PlusCircle className="w-4 h-4"/> إضافة نوع وحدة
                    </button>
                  </div>
                </div>
            </div>
        )}

        {/* 🔴 قسم: التشطيبات (صور قبل وبعد) */}
        {formData.promo_type === 'SERVICE' && (
            <div className="bg-purple-50/50 p-6 rounded-[2rem] border border-purple-100 animate-in fade-in zoom-in-95 space-y-4">
                <h3 className="font-black text-purple-800 border-b border-purple-200 pb-3 flex items-center gap-2"><ImageIcon className="w-5 h-5"/> معرض التشطيبات (قبل وبعد)</h3>
                
                <div className="space-y-6">
                    {transformations.map((trans, idx) => (
                        <div key={idx} className="bg-white p-4 rounded-2xl border border-purple-100 shadow-sm relative">
                            <button type="button" onClick={() => removeTransformation(idx)} className="absolute top-4 left-4 p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition"><Trash2 className="w-4 h-4"/></button>
                            
                            <label className="block text-xs font-bold text-slate-600 mb-2">عنوان الصورة (مثال: تشطيب الريسبشن)</label>
                            <input type="text" value={trans.title} onChange={(e) => handleTransTitleChange(idx, e.target.value)} className="w-full md:w-1/2 h-10 px-4 rounded-xl border-2 border-slate-100 focus:border-purple-400 outline-none font-bold text-sm mb-4" />
                            
                            <div className="grid grid-cols-2 gap-4">
                                <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 transition relative overflow-hidden bg-gray-50">
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleTransImageSelect(idx, 'before', e)} />
                                    {trans.before ? <img src={URL.createObjectURL(trans.before)} className="absolute inset-0 w-full h-full object-cover" /> : <><ImageIcon className="w-5 h-5 text-slate-400 mb-1" /><span className="font-bold text-xs text-slate-500">صورة قبل</span></>}
                                </label>
                                <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 transition relative overflow-hidden bg-purple-50">
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleTransImageSelect(idx, 'after', e)} />
                                    {trans.after ? <img src={URL.createObjectURL(trans.after)} className="absolute inset-0 w-full h-full object-cover" /> : <><ImageIcon className="w-5 h-5 text-purple-400 mb-1" /><span className="font-bold text-xs text-purple-600">صورة بعد</span></>}
                                </label>
                            </div>
                        </div>
                    ))}
                    <button type="button" onClick={addTransformation} className="flex items-center gap-2 text-sm font-bold text-purple-600 hover:text-purple-700 bg-purple-100/50 px-4 py-3 rounded-xl transition w-full justify-center border border-purple-200 border-dashed">
                        <PlusCircle className="w-5 h-5"/> إضافة مقارنة جديدة (قبل وبعد)
                    </button>
                </div>
            </div>
        )}

        {/* قسم: التواصل (ما عدا VIP) */}
        {formData.promo_type !== 'LISTING' && (
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 grid md:grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-slate-600 mb-1">رقم الاتصال</label><input name="phone_number" value={formData.phone_number} onChange={handleChange} className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 focus:border-amber-500 outline-none dir-ltr text-right" /></div>
                <div><label className="block text-xs font-bold text-slate-600 mb-1">رقم الواتساب</label><input name="whatsapp_number" value={formData.whatsapp_number} onChange={handleChange} className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 focus:border-amber-500 outline-none dir-ltr text-right" /></div>
            </div>
        )}

        {/* قسم: الصور والميديا */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 space-y-6">
          <h3 className="font-black text-lg text-slate-800 border-b pb-4">الصور والميديا الرئيسية</h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:bg-slate-50 transition relative overflow-hidden">
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageSelect(e, 'cover')} />
                {coverImage ? <img src={URL.createObjectURL(coverImage)} className="absolute inset-0 w-full h-full object-cover" /> : <><ImageIcon className="w-6 h-6 text-slate-400 mb-1" /><span className="font-bold text-sm text-slate-500">صورة الغلاف (مطلوبة) *</span></>}
            </label>

            {formData.promo_type === 'PROJECT' && (
                <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer hover:bg-slate-50 transition relative overflow-hidden">
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageSelect(e, 'logo')} />
                    {developerLogo ? <img src={URL.createObjectURL(developerLogo)} className="absolute inset-0 w-full h-full object-contain p-4" /> : <><ImageIcon className="w-6 h-6 text-slate-400 mb-1" /><span className="font-bold text-sm text-slate-500">لوجو المطور (اختياري)</span></>}
                </label>
            )}
            
            {formData.promo_type !== 'LISTING' && (
                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-600 mb-1">رابط فيديو يوتيوب</label>
                    <input name="youtube_url" value={formData.youtube_url} onChange={handleChange} type="url" className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 focus:border-amber-500 outline-none dir-ltr text-left" placeholder="https://youtube.com/..." />
                </div>
            )}
          </div>

          {formData.promo_type !== 'LISTING' && (
            <div>
                <label className="block text-sm font-bold text-slate-600 mb-3">معرض الصور (Gallery)</label>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                    {gallery.map((img, idx) => (
                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden shadow-sm border border-gray-200">
                            <img src={URL.createObjectURL(img)} className="w-full h-full object-cover" />
                            <button type="button" onClick={() => removeGalleryImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"><X className="w-3 h-3"/></button>
                        </div>
                    ))}
                    <label className="aspect-square border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center cursor-pointer hover:bg-slate-50">
                        <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleImageSelect(e, 'gallery')} />
                        <PlusCircle className="w-6 h-6 text-slate-400" />
                    </label>
                </div>
            </div>
          )}
        </div>

        {/* زر الإرسال */}
        <button type="submit" disabled={submitting} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg hover:bg-amber-500 hover:text-slate-900 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2">
            <UploadCloud className="w-6 h-6" /> حفظ ونشر الإعلان
        </button>
      </form>
    </div>
  );
}