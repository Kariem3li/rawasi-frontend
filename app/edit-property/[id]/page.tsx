"use client";

import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Loader2, MapPin, CheckCircle2, Building2, 
  ImagePlus, Banknote, Map as MapIcon, Save, 
  FileText, User, X, Video, Home, 
  ArrowRight, ShieldCheck, ChevronDown
} from "lucide-react";
import dynamic from "next/dynamic";
import imageCompression from 'browser-image-compression';
import { getFullImageUrl } from "@/lib/config";
import api from "@/lib/axios"; 
import axios from 'axios';
import { useVideoUpload } from "@/components/VideoUploadContext"; // ✅ استدعاء سياق الفيديو

// تحميل الخريطة بشكل ديناميكي
const MapPicker = dynamic(() => import("@/components/MapPicker"), { 
    ssr: false, 
    loading: () => <div className="h-[300px] w-full bg-slate-100 animate-pulse rounded-3xl flex items-center justify-center"><Loader2 className="w-8 h-8 text-amber-500 animate-spin"/></div> 
});

// --- مكون البروجرس بار الفاخر ---
const ProgressOverlay = ({ progress, message }: { progress: number, message: string }) => {
    const radius = 65;
    const stroke = 8;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progress / 100) * circumference;
  
    return (
      <div className="fixed inset-0 z-[99999] bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300">
        <div className="relative flex items-center justify-center mb-8">
          <svg height={radius * 2} width={radius * 2} className="rotate-[-90deg]">
            <circle stroke="#1e293b" strokeWidth={stroke} fill="transparent" r={normalizedRadius} cx={radius} cy={radius} />
            <circle stroke="#f59e0b" fill="transparent" strokeWidth={stroke} strokeDasharray={circumference + ' ' + circumference} style={{ strokeDashoffset, transition: "stroke-dashoffset 0.3s ease-in-out" }} strokeLinecap="round" r={normalizedRadius} cx={radius} cy={radius} />
          </svg>
          <div className="absolute flex flex-col items-center">
             <span className="text-4xl font-black text-white dir-ltr tracking-tighter">{Math.round(progress)}<span className="text-xl text-amber-500">%</span></span>
          </div>
        </div>
        <h3 className="text-white font-black text-2xl mt-4 tracking-wide text-center px-4">{message}</h3>
        <p className="text-slate-400 text-sm mt-3 font-medium flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin"/> يرجى عدم إغلاق الصفحة
        </p>
      </div>
    );
};

// --- دوال مساعدة ---
const sanitizeNumberInput = (val: string) => val.replace(/[^0-9]/g, '');

const extractCoordsFromUrl = (url: string) => {
    try {
        if (!url) return null;
        const directCoords = url.match(/^(-?\d+\.\d+),\s*(-?\d+\.\d+)$/);
        if (directCoords) return { lat: directCoords[1], lng: directCoords[2] };
        const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (atMatch) return { lat: atMatch[1], lng: atMatch[2] };
        const qMatch = url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (qMatch) return { lat: qMatch[1], lng: qMatch[2] };
        return null;
    } catch (e) { return null; }
};

export default function EditProperty() {
    const params = useParams();
    const router = useRouter();
    const listingId = params.id;

    const { startVideoUpload } = useVideoUpload(); // ✅ تفعيل لوجيك الخلفية للفيديو

    const [loadingData, setLoadingData] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [compressing, setCompressing] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [locating, setLocating] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [statusMsg, setStatusMsg] = useState("");

    const [categories, setCategories] = useState<any[]>([]);
    const [governorates, setGovernorates] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);
    const [zones, setZones] = useState<any[]>([]);
    const [subdivisions, setSubdivisions] = useState<any[]>([]);
    const [dynamicFields, setDynamicFields] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        offerType: "Sale", category: "", gov: "", city: "", zone: "", subdivision: "",
        area: "", price: "", description: "", isFinanceEligible: false,
        latitude: "", longitude: "", googleMapsUrl: "",
        plotNumber: "", buildingNumber: "", apartmentNumber: "", floorNumber: "",
        features: {} as Record<string, string>,
        
        existingImages: [] as any[], deletedImageIds: [] as number[],
        newImages: [] as File[], 
        
        video: null as File | null, existingVideo: null as string | null,
        idCard: null as File | null, existingIdCard: null as string | null,
        contract: null as File | null, existingContract: null as string | null,
        
        ownerName: "", ownerPhone: ""
    });

    useEffect(() => {
        const initData = async () => {
            try {
                const [listingRes, catRes, govRes] = await Promise.all([
                    api.get(`/listings/${listingId}/`),
                    api.get(`/categories/`),
                    api.get(`/governorates/`)
                ]);

                const listing = listingRes.data;
                const cats = Array.isArray(catRes.data) ? catRes.data : catRes.data.results || [];
                const govs = Array.isArray(govRes.data) ? govRes.data : govRes.data.results || [];

                setCategories(cats);
                setGovernorates(govs);

                if (listing.category?.id) {
                    const featsRes = await api.get(`/categories/${listing.category.id}/features/`);
                    setDynamicFields(Array.isArray(featsRes.data) ? featsRes.data : featsRes.data.results || []);
                }

                if (listing.governorate?.id) {
                    const cRes = await api.get(`/cities/?governorate=${listing.governorate.id}`);
                    setCities(Array.isArray(cRes.data) ? cRes.data : cRes.data.results || []);
                }
                if (listing.city?.id) {
                    const zRes = await api.get(`/major-zones/?city=${listing.city.id}`);
                    setZones(Array.isArray(zRes.data) ? zRes.data : zRes.data.results || []);
                }
                if (listing.major_zone?.id) {
                    const sRes = await api.get(`/subdivisions/?major_zone=${listing.major_zone.id}`);
                    setSubdivisions(Array.isArray(sRes.data) ? sRes.data : sRes.data.results || []);
                }

                const existingFeats: Record<string, string> = {};
                if (listing.dynamic_features) {
                    listing.dynamic_features.forEach((df: any) => {
                        existingFeats[df.feature.toString()] = df.value;
                    });
                }

                setFormData({
                    offerType: listing.offer_type,
                    category: listing.category?.id?.toString() || "",
                    gov: listing.governorate?.id?.toString() || "",
                    city: listing.city?.id?.toString() || "",
                    zone: listing.major_zone?.id?.toString() || "",
                    subdivision: listing.subdivision?.id?.toString() || "",
                    area: listing.area_sqm?.toString() || "",
                    price: listing.price?.toString() || "",
                    description: listing.description || "",
                    isFinanceEligible: listing.is_finance_eligible || false,
                    latitude: listing.latitude?.toString() || "",
                    longitude: listing.longitude?.toString() || "",
                    googleMapsUrl: listing.google_maps_url || "",
                    plotNumber: listing.project_name || "", 
                    buildingNumber: listing.building_number || "",
                    apartmentNumber: listing.apartment_number || "",
                    floorNumber: listing.floor_number?.toString() || "",
                    features: existingFeats,
                    
                    existingImages: listing.images || [],
                    deletedImageIds: [],
                    newImages: [],
                    
                    video: null, existingVideo: listing.youtube_url || listing.external_video || listing.video,
                    idCard: null, existingIdCard: listing.external_id_card || listing.id_card_image,
                    contract: null, existingContract: listing.external_contract || listing.contract_image,
                    
                    ownerName: listing.owner_name || "",
                    ownerPhone: listing.owner_phone || ""
                });

                setLoadingData(false);
            } catch (error) {
                console.error(error);
                alert("حدث خطأ أثناء جلب بيانات العقار. قد يكون غير موجود.");
                router.push("/my-listings");
            }
        };
        initData();
    }, [listingId, router]);

    const handleChange = (field: string, value: any) => {
        setFormData(prev => {
            const newData = { ...prev, [field]: value };
            if (field === "googleMapsUrl") {
                const coords = extractCoordsFromUrl(value);
                if (coords) { newData.latitude = coords.lat; newData.longitude = coords.lng; }
            }
            return newData;
        });
    };

    const handleFeatureInput = (id: string, val: string) => setFormData(p => ({ ...p, features: { ...p.features, [id]: val } }));
    
    const handleCategoryChange = async (e: any) => {
        const catId = e.target.value;
        handleChange("category", catId);
        handleChange("features", {}); 
        if (catId) {
            try {
                const featsRes = await api.get(`/categories/${catId}/features/`);
                setDynamicFields(Array.isArray(featsRes.data) ? featsRes.data : featsRes.data.results || []);
            } catch (error) { console.error(error); }
        } else setDynamicFields([]);
    };

    const handleGovChange = async (e: any) => {
        const govId = e.target.value;
        handleChange("gov", govId);
        handleChange("city", ""); handleChange("zone", ""); handleChange("subdivision", "");
        if(govId) {
            const res = await api.get(`/cities/?governorate=${govId}`);
            setCities(Array.isArray(res.data) ? res.data : res.data.results || []);
        }
    };
    const handleCityChange = async (e: any) => {
        const cityId = e.target.value;
        handleChange("city", cityId);
        handleChange("zone", ""); handleChange("subdivision", "");
        if(cityId) {
            const res = await api.get(`/major-zones/?city=${cityId}`);
            setZones(Array.isArray(res.data) ? res.data : res.data.results || []);
        }
    };
    const handleZoneChange = async (e: any) => {
        const zoneId = e.target.value;
        handleChange("zone", zoneId);
        handleChange("subdivision", "");
        if(zoneId) {
            const res = await api.get(`/subdivisions/?major_zone=${zoneId}`);
            setSubdivisions(Array.isArray(res.data) ? res.data : res.data.results || []);
        }
    };

    const handleMapConfirm = (lat: string, lng: string) => { setFormData({ ...formData, latitude: lat, longitude: lng }); setShowMap(false); };
    const getLocation = () => {
        if (!navigator.geolocation) return alert("GPS غير مدعوم في متصفحك");
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => { setFormData({ ...formData, latitude: pos.coords.latitude.toString(), longitude: pos.coords.longitude.toString() }); setLocating(false); },
            () => { setLocating(false); alert("فشل تحديد الموقع."); }
        );
    };

    const handleImageUpload = async (e: any) => {
        if (e.target.files) {
            const files = Array.from(e.target.files) as File[];
            setCompressing(true);
            try {
                const compressedFiles = await Promise.all(files.map(async (file) => {
                    try { return await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true }); } 
                    catch { return file; }
                }));
                setFormData(prev => ({ ...prev, newImages: [...prev.newImages, ...compressedFiles] }));
            } catch (error) { console.error(error); } 
            finally { setCompressing(false); }
        }
    };

    const removeExistingImage = (imageId: number) => {
        setFormData(prev => ({
            ...prev,
            existingImages: prev.existingImages.filter(img => img.id !== imageId),
            deletedImageIds: [...prev.deletedImageIds, imageId]
        }));
    };

    const removeNewImage = (index: number) => {
        const arr = [...formData.newImages];
        arr.splice(index, 1);
        handleChange('newImages', arr);
    };

    const handleVideoUpload = (e: any) => {
        if (e.target.files && e.target.files[0]) {
            if (e.target.files[0].size > 500 * 1024 * 1024) return alert("حجم الفيديو كبير! الحد الأقصى 500 ميجابايت.");
            handleChange('video', e.target.files[0]);
        }
    };

    const handleDocUpload = (e: any, type: 'idCard' | 'contract') => {
        if (e.target.files) handleChange(type, e.target.files[0]);
    };

    const uploadDirectToCloudinary = async (file: File, resourceType: 'image' | 'video', onProgress?: (percent: number) => void) => {
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "daksg9vcz"; 
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "doh2de38";
        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", uploadPreset);
    
        try {
            const res = await axios.post(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, data, {
                onUploadProgress: (e) => { if (e.total && onProgress) onProgress(Math.round((e.loaded * 100) / e.total)); }
            });
            return res.data.secure_url;
        } catch (error) { throw new Error(`فشل رفع الملف`); }
    };

    const handleSubmit = async () => {
        if (!formData.category || !formData.gov || !formData.city || !formData.price || !formData.area) {
            alert("يرجى التأكد من ملء الحقول الأساسية (النوع، الموقع، السعر، المساحة).");
            return;
        }

        setSubmitting(true);
        setUploadProgress(0);

        try {
            setStatusMsg("جاري معالجة الصور...");
            const uploadedImageUrls = [];
            for (let i = 0; i < formData.newImages.length; i++) {
                const url = await uploadDirectToCloudinary(formData.newImages[i], 'image', (p) => {
                    setUploadProgress(Math.round(((i / formData.newImages.length) * 100) + (p / formData.newImages.length)) * 0.9);
                });
                uploadedImageUrls.push(url);
            }

            setStatusMsg("تحديث الوثائق والبيانات...");
            let idCardUrl = formData.idCard ? await uploadDirectToCloudinary(formData.idCard, 'image') : "";
            let contractUrl = formData.contract ? await uploadDirectToCloudinary(formData.contract, 'image') : "";
            
            const payload: any = {
                offer_type: formData.offerType,
                category: parseInt(formData.category),
                governorate: parseInt(formData.gov),
                city: parseInt(formData.city),
                major_zone: formData.zone ? parseInt(formData.zone) : null,
                subdivision: formData.subdivision ? parseInt(formData.subdivision) : null,
                price: parseFloat(formData.price),
                area_sqm: parseInt(formData.area),
                description: formData.description,
                is_finance_eligible: formData.isFinanceEligible,
                latitude: formData.latitude ? parseFloat(formData.latitude) : null,
                longitude: formData.longitude ? parseFloat(formData.longitude) : null,
                google_maps_url: formData.googleMapsUrl || null,
                features_data: JSON.stringify(formData.features),
                deleted_image_ids: formData.deletedImageIds,
                external_images: uploadedImageUrls,
                owner_name: formData.ownerName,
                owner_phone: formData.ownerPhone,
            };

            if (formData.floorNumber) payload.floor_number = parseInt(formData.floorNumber);
            if (formData.buildingNumber) payload.building_number = formData.buildingNumber;
            if (formData.apartmentNumber) payload.apartment_number = formData.apartmentNumber;
            
            if (idCardUrl) payload.external_id_card = idCardUrl;
            if (contractUrl) payload.external_contract = contractUrl;

            // ✅ تحديث الإعلان في دجانجو
            await api.patch(`/listings/${listingId}/`, payload);

            setUploadProgress(100);
            setStatusMsg(formData.video ? "تم تحديث البيانات.. جاري تجهيز الفيديو" : "✅ تم تحديث العقار بنجاح!");

            // ✅ لوجيك رفع الفيديو الاحترافي في الخلفية
            if (formData.video) {
                startVideoUpload(Number(listingId), formData.video);
            }

            setTimeout(() => router.push("/my-listings"), 2000);

        } catch (error: any) {
            console.error(error);
            alert("حدث خطأ أثناء الحفظ. يرجى المحاولة مرة أخرى.");
            setSubmitting(false);
        }
    };

    if (loadingData) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-amber-500 animate-spin mb-4" />
                <h2 className="text-xl font-black text-slate-800 animate-pulse">جاري تحميل بيانات العقار...</h2>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#F8FAFC] pb-32 text-slate-800 font-sans dir-rtl">
            <Navbar />
            {submitting && <ProgressOverlay progress={uploadProgress} message={statusMsg} />}
            {showMap && <MapPicker onConfirm={handleMapConfirm} onClose={() => setShowMap(false)} />}

            {/* ✅ الهيدر الاحترافي المطابق لصفحة الإضافة */}
            <div className="bg-slate-900 pt-10 pb-28 px-4 text-center rounded-b-[2.5rem] md:rounded-b-[4rem] relative overflow-hidden shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)]">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>
                <div className="relative z-10 flex items-center justify-between max-w-4xl mx-auto px-2">
                    <button onClick={() => router.back()} className="text-white hover:text-amber-500 transition flex items-center gap-2 font-bold text-sm bg-white/10 px-4 py-2.5 rounded-2xl backdrop-blur-md active:scale-95">
                        <ArrowRight className="w-4 h-4"/> رجوع
                    </button>
                    <h1 className="text-2xl md:text-3xl font-black text-white tracking-wide">تعديل <span className="text-amber-500">الإعلان</span></h1>
                    <div className="w-[88px]"></div> {/* للحفاظ على التوسيط */}
                </div>
            </div>

            {/* ✅ الحاوية المرفوعة لأعلى (Negative Margin) */}
            <div className="max-w-4xl mx-auto px-4 -mt-16 md:-mt-20 relative z-20 space-y-6 mb-10">
                
                {/* 1. التفاصيل الأساسية */}
                <section className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl border border-slate-100">
                    <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2"><Home className="w-5 h-5 text-amber-500"/> التفاصيل الأساسية</h2>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-gray-50/80 p-1.5 rounded-2xl flex border border-gray-100">
                            {["Sale", "Rent"].map(type => (
                                <button key={type} onClick={() => handleChange("offerType", type)} className={`flex-1 py-3.5 rounded-xl font-black text-sm transition-all duration-300 ${formData.offerType === type ? "bg-white text-slate-900 shadow-sm border border-gray-200" : "text-slate-400 hover:text-slate-600"}`}>
                                    {type === "Sale" ? "للبيع" : "للإيجار"}
                                </button>
                            ))}
                        </div>
                        <div className="relative">
                            <select className="w-full h-14 border-2 border-gray-200 bg-white rounded-2xl px-5 font-bold text-sm appearance-none outline-none focus:border-amber-500 transition-colors" onChange={handleCategoryChange} value={formData.category}>
                                <option value="" disabled>نوع العقار</option>
                                {categories.map((cat: any) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                            </select>
                            <ChevronDown className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"/>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2">المساحة الإجمالية</label>
                            <div className="relative">
                                <input type="number" className="w-full h-14 border-2 border-gray-200 bg-gray-50 focus:bg-white rounded-2xl px-5 font-black text-lg outline-none focus:border-amber-500 transition" value={formData.area} onChange={(e) => handleChange("area", e.target.value)} />
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">م²</span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2">السعر المطلوب</label>
                            <div className="relative">
                                <input type="text" inputMode="numeric" className="w-full h-14 border-2 border-gray-200 bg-gray-50 focus:bg-white rounded-2xl pl-12 pr-5 font-black text-lg outline-none focus:border-amber-500 transition" value={formData.price ? Number(formData.price).toLocaleString('ar-EG') : ''} onChange={(e) => handleChange("price", sanitizeNumberInput(e.target.value))} />
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-amber-600 font-bold text-sm">ج.م</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2">الوصف التفصيلي</label>
                        <textarea className="w-full h-32 border-2 border-gray-200 bg-gray-50 focus:bg-white rounded-2xl p-4 text-sm resize-none outline-none focus:border-amber-500 transition font-medium" value={formData.description} onChange={(e) => handleChange("description", e.target.value)}></textarea>
                    </div>
                </section>

                {/* 2. الموقع والخريطة */}
                <section className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl border border-slate-100">
                    <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2"><MapPin className="w-5 h-5 text-blue-500"/> الموقع الجغرافي</h2>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <div className="relative"><select className="w-full h-14 border-2 border-gray-200 bg-gray-50 focus:bg-white rounded-2xl px-4 font-bold text-sm appearance-none outline-none focus:border-blue-500" onChange={handleGovChange} value={formData.gov}><option value="" disabled>المحافظة</option>{governorates.map((g: any) => <option key={g.id} value={g.id}>{g.name}</option>)}</select><ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"/></div>
                        <div className="relative"><select className="w-full h-14 border-2 border-gray-200 bg-gray-50 focus:bg-white rounded-2xl px-4 font-bold text-sm appearance-none outline-none focus:border-blue-500 disabled:opacity-50" disabled={!formData.gov} onChange={handleCityChange} value={formData.city}><option value="" disabled>المدينة</option>{cities.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}</select><ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"/></div>
                        <div className="relative"><select className="w-full h-14 border-2 border-gray-200 bg-gray-50 focus:bg-white rounded-2xl px-4 font-bold text-sm appearance-none outline-none focus:border-blue-500 disabled:opacity-50" disabled={!formData.city} onChange={handleZoneChange} value={formData.zone}><option value="">المنطقة (اختياري)</option>{zones.map((z: any) => <option key={z.id} value={z.id}>{z.name}</option>)}</select><ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"/></div>
                        <div className="relative"><select className="w-full h-14 border-2 border-gray-200 bg-gray-50 focus:bg-white rounded-2xl px-4 font-bold text-sm appearance-none outline-none focus:border-blue-500 disabled:opacity-50" disabled={!formData.zone} onChange={(e) => handleChange("subdivision", e.target.value)} value={formData.subdivision}><option value="">المجاورة (اختياري)</option>{subdivisions.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}</select><ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"/></div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <input type="url" className="w-full h-14 border-2 border-gray-200 bg-gray-50 focus:bg-white rounded-2xl px-4 text-sm outline-none focus:border-blue-500 font-bold" placeholder="رابط جوجل ماب (اختياري)" value={formData.googleMapsUrl} onChange={(e) => handleChange("googleMapsUrl", e.target.value)} />
                        <div className="flex gap-3">
                            <button onClick={() => setShowMap(true)} type="button" className={`flex-1 py-3.5 rounded-2xl text-sm font-bold border-2 border-dashed transition flex items-center justify-center gap-2 ${formData.latitude ? 'bg-green-50 border-green-300 text-green-700' : 'bg-white border-gray-300 text-slate-500 hover:bg-gray-50'}`}>
                                {formData.latitude ? <><CheckCircle2 className="w-4 h-4"/> تم التحديد بنجاح</> : <><MapIcon className="w-4 h-4" /> تحديد يدوي على الخريطة</>}
                            </button>
                            <button onClick={getLocation} type="button" className="px-6 rounded-2xl text-sm font-bold bg-white text-slate-600 hover:bg-slate-50 transition shadow-sm border border-gray-200 flex items-center gap-2 active:scale-95">
                                {locating ? <Loader2 className="w-4 h-4 animate-spin text-blue-500"/> : <MapPin className="w-4 h-4 text-blue-500" />} GPS
                            </button>
                        </div>
                    </div>
                </section>

                {/* 3. الخصائص الديناميكية */}
                {dynamicFields.length > 0 && (
                    <section className="bg-amber-50/50 p-6 md:p-8 rounded-[2rem] shadow-xl border border-amber-100/50">
                        <h2 className="text-lg font-black text-amber-800 mb-6 flex items-center gap-2"><Building2 className="w-5 h-5"/> المواصفات والتفاصيل</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {dynamicFields.map((feat: any) => {
                                const val = formData.features[feat.id] || "";
                                return (
                                    <div key={feat.id}>
                                        <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wide">{feat.name}</label>
                                        {feat.input_type === 'number' ? (
                                            <input type="text" inputMode="numeric" value={val} onChange={(e) => handleFeatureInput(feat.id, sanitizeNumberInput(e.target.value))} className="w-full h-12 border-2 border-white bg-white/60 focus:bg-white rounded-xl px-4 font-bold outline-none focus:border-amber-400 shadow-sm" placeholder="أدخل الرقم..." />
                                        ) : feat.input_type === 'bool' ? (
                                            <div className="flex gap-2">
                                                <button onClick={() => handleFeatureInput(feat.id, "نعم")} className={`flex-1 h-12 rounded-xl border-2 font-bold transition-all active:scale-95 ${val === "نعم" ? "bg-slate-900 text-white border-slate-900" : "bg-white border-white text-gray-500 hover:border-slate-300 shadow-sm"}`}>متوفر</button>
                                                <button onClick={() => handleFeatureInput(feat.id, "لا")} className={`flex-1 h-12 rounded-xl border-2 font-bold transition-all active:scale-95 ${val === "لا" ? "bg-red-50 text-red-500 border-red-200" : "bg-white border-white text-gray-500 hover:border-red-200 shadow-sm"}`}>غير متوفر</button>
                                            </div>
                                        ) : (
                                            <input type="text" value={val} onChange={(e) => handleFeatureInput(feat.id, e.target.value)} className="w-full h-12 border-2 border-white bg-white/60 focus:bg-white rounded-xl px-4 font-bold outline-none focus:border-amber-400 shadow-sm" placeholder="..." />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* 4. الصور والفيديو (تصميم موحد للحذف) */}
                <section className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl border border-slate-100">
                    <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2"><ImagePlus className="w-5 h-5 text-amber-500"/> ألبوم الصور والفيديو</h2>
                    
                    <div className="mb-8">
                        <p className="text-xs font-bold text-slate-500 mb-3">الصور الحالية المرفوعة</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {formData.existingImages.map((img: any) => (
                                <div key={img.id} className="aspect-square bg-gray-100 rounded-2xl overflow-hidden relative group shadow-sm border border-gray-200">
                                    <img src={getFullImageUrl(img.image)} alt="Property" className="w-full h-full object-cover transition duration-300 group-hover:scale-110"/>
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                                    <button type="button" onClick={() => removeExistingImage(img.id)} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 shadow-md active:scale-95 transition-transform">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mb-6">
                        <p className="text-xs font-bold text-slate-500 mb-3">إضافة صور جديدة</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {formData.newImages.map((img, idx) => (
                                <div key={idx} className="aspect-square bg-gray-100 rounded-2xl overflow-hidden relative group shadow-sm border border-gray-200">
                                    <img src={URL.createObjectURL(img)} alt="New" className="w-full h-full object-cover transition duration-300 group-hover:scale-110"/>
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                                    <button type="button" onClick={() => removeNewImage(idx)} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 shadow-md active:scale-95 transition-transform">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            <label className="aspect-square bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 hover:border-amber-400 transition-colors group">
                                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={compressing} />
                                {compressing ? <Loader2 className="w-10 h-10 text-amber-500 animate-spin"/> : <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform mb-2"><ImagePlus className="w-6 h-6 text-amber-500"/></div>}
                                <span className="text-xs font-bold text-slate-500">{compressing ? "جاري المعالجة..." : "إضافة صور"}</span>
                            </label>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                        <p className="text-xs font-bold text-slate-500 mb-3">فيديو الإعلان</p>
                        <label className={`block border-2 border-dashed rounded-[2rem] p-8 text-center cursor-pointer transition-all ${formData.video ? 'border-red-500 bg-red-50/50' : 'border-gray-300 bg-gray-50 hover:border-red-400 hover:bg-red-50/30'}`}>
                            <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm ${formData.video ? 'bg-red-500 text-white' : 'bg-white text-gray-400'}`}>
                                {formData.video ? <CheckCircle2 className="w-8 h-8"/> : <Video className="w-8 h-8" />}
                            </div>
                            <p className={`font-black text-base ${formData.video ? 'text-red-700' : 'text-slate-600'}`}>
                                {formData.video ? formData.video.name : "اضغط هنا لتحديث الفيديو (اختياري)"}
                            </p>
                            {formData.existingVideo && !formData.video && (
                                <p className="text-[11px] text-green-600 font-bold mt-3 bg-green-100 inline-block px-4 py-1.5 rounded-full border border-green-200">
                                    يوجد فيديو مرفوع بالفعل
                                </p>
                            )}
                            <p className="text-[11px] text-gray-400 font-bold mt-2">الحد الأقصى 500 ميجابايت (MP4, MOV)</p>
                        </label>
                    </div>
                </section>

                {/* 5. التوثيق */}
                <section className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl border border-slate-100">
                    <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-green-500"/> التوثيق والتواصل</h2>
                    
                    <div className="grid sm:grid-cols-2 gap-4 mb-8">
                        <div><label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase">الاسم (كما سيظهر)</label><input type="text" className="w-full h-12 border-2 border-gray-200 bg-gray-50 rounded-xl px-4 font-bold text-slate-800 outline-none focus:border-amber-400 focus:bg-white transition" value={formData.ownerName} onChange={(e) => handleChange("ownerName", e.target.value)} /></div>
                        <div><label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase">رقم الهاتف (للاتصال والواتساب)</label><input type="text" inputMode="numeric" dir="ltr" className="w-full h-12 border-2 border-gray-200 bg-gray-50 rounded-xl px-4 font-black text-slate-800 outline-none focus:border-amber-400 focus:bg-white transition text-right" value={formData.ownerPhone} onChange={(e) => handleChange("ownerPhone", sanitizeNumberInput(e.target.value))} /></div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <label className={`relative overflow-hidden bg-slate-50 p-6 rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all group ${formData.idCard ? 'border-green-500 bg-green-50/50' : 'border-slate-300 hover:border-slate-400 hover:bg-slate-100'}`}>
                            <input type="file" className="hidden" onChange={(e) => handleDocUpload(e, 'idCard')} />
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 shadow-sm transition-transform group-hover:scale-110 ${formData.idCard ? 'bg-green-500 text-white' : 'bg-white text-slate-400'}`}>
                                {formData.idCard ? <CheckCircle2 className="w-6 h-6"/> : <User className="w-6 h-6"/>}
                            </div>
                            <span className={`font-black text-sm text-center ${formData.idCard ? 'text-green-700' : 'text-slate-600'}`}>{formData.idCard ? "تم استبدال البطاقة" : formData.existingIdCard ? "تحديث البطاقة" : "إرفاق بطاقة جديدة"}</span>
                            {formData.existingIdCard && !formData.idCard && <span className="absolute top-4 right-4 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span></span>}
                        </label>
                        <label className={`relative overflow-hidden bg-slate-50 p-6 rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all group ${formData.contract ? 'border-green-500 bg-green-50/50' : 'border-slate-300 hover:border-slate-400 hover:bg-slate-100'}`}>
                            <input type="file" className="hidden" onChange={(e) => handleDocUpload(e, 'contract')} />
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 shadow-sm transition-transform group-hover:scale-110 ${formData.contract ? 'bg-green-500 text-white' : 'bg-white text-slate-400'}`}>
                                {formData.contract ? <CheckCircle2 className="w-6 h-6"/> : <FileText className="w-6 h-6"/>}
                            </div>
                            <span className={`font-black text-sm text-center ${formData.contract ? 'text-green-700' : 'text-slate-600'}`}>{formData.contract ? "تم استبدال العقد" : formData.existingContract ? "تحديث العقد" : "إرفاق عقد جديد"}</span>
                            {formData.existingContract && !formData.contract && <span className="absolute top-4 right-4 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span></span>}
                        </label>
                    </div>
                </section>

                {/* زر الحفظ النهائي */}
                <button onClick={handleSubmit} disabled={submitting || compressing} className="w-full bg-emerald-600 text-white h-16 rounded-[2rem] font-black text-xl shadow-[0_10px_20px_rgba(5,150,105,0.2)] hover:bg-emerald-500 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:bg-emerald-400 mt-10">
                    {submitting ? <Loader2 className="animate-spin w-6 h-6"/> : <Save className="w-6 h-6"/>}
                    {submitting ? "جاري حفظ التعديلات..." : "حفظ التعديلات"}
                </button>
            </div>
            
            <BottomNav />
        </main>
    );
}