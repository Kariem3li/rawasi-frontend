"use client";

import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav"; 
import { 
  Camera, MapPin, ArrowLeft, Loader2, CheckCircle2, Video, 
  ImagePlus, Banknote, Map as MapIcon, X, FileText, User, 
  Phone, UploadCloud, Home, ShieldCheck, ChevronDown, Navigation
} from "lucide-react";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import imageCompression from 'browser-image-compression';
import api from "@/lib/axios"; 
import { useVideoUpload } from "@/components/VideoUploadContext";
import { useRouter } from "next/navigation";
import { uploadSecurelyToCloudinary } from "@/lib/cloudinary";
import { Category, Feature, LocationInfo } from "@/types";
import { useAuth } from "@/providers/AuthProvider";
import toast, { Toaster } from "react-hot-toast";

const MapPicker = dynamic(
    () => import('@/components/MapPicker').then((mod) => mod.default), 
    { ssr: false, loading: () => <div className="h-[400px] w-full bg-slate-100 animate-pulse rounded-3xl flex items-center justify-center"><Loader2 className="w-8 h-8 text-amber-500 animate-spin"/></div> }
);

const sanitizeNumberInput = (val: string) => val.replace(/[^0-9]/g, '');

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

export default function AddProperty() {
  const router = useRouter(); 
  const { isAuthenticated, user } = useAuth(); 

  const [step, setStep] = useState(1);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [locating, setLocating] = useState(false);
  const [compressing, setCompressing] = useState(false);
  
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  const [governorates, setGovernorates] = useState<LocationInfo[]>([]);
  const [cities, setCities] = useState<LocationInfo[]>([]);
  const [zones, setZones] = useState<LocationInfo[]>([]);
  const [subdivisions, setSubdivisions] = useState<LocationInfo[]>([]);
  const [dynamicFields, setDynamicFields] = useState<Feature[]>([]);
  const [selectedCategoryName, setSelectedCategoryName] = useState("");

  const [formData, setFormData] = useState({
    offerType: "بيع", category: "", gov: "", city: "", zone: "", subdivision: "",
    plotNumber: "", buildingNumber: "", apartmentNumber: "", floorNumber: "", 
    area: "", price: "", isFinanceEligible: false,
    latitude: "", longitude: "", 
    features: {} as Record<string, string>, description: "",
    images: [] as File[], video: null as File | null,
    idCard: null as File | null, contract: null as File | null,
    ownerName: "", ownerPhone: "" 
  });
  
  const { startVideoUpload } = useVideoUpload(); 
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
      if (!isAuthenticated && !loadingData) {
          router.replace("/login");
      }
  }, [isAuthenticated, loadingData, router]);

  useEffect(() => {
    const initData = async () => {
        try {
            const userRes = await api.get('/auth/users/me/');
            setFormData(prev => ({
                ...prev,
                ownerName: userRes.data.first_name ? `${userRes.data.first_name} ${userRes.data.last_name}` : userRes.data.username,
                ownerPhone: userRes.data.phone_number || ""
            }));

            const [catRes, govRes] = await Promise.all([api.get('/categories/'), api.get('/governorates/')]);
            setCategories(Array.isArray(catRes.data) ? catRes.data : catRes.data.results || []);
            setGovernorates(Array.isArray(govRes.data) ? govRes.data : govRes.data.results || []);
            setLoadingData(false);
        } catch (e) { 
            console.error(e); 
            setLoadingData(false);
        }
    };
    if (isAuthenticated) initData();
  }, [isAuthenticated]);

  // 🚀 منع تسريب الذاكرة من صور المعاينة لو اليوزر قفل الصفحة
  useEffect(() => {
    return () => {
        // مش هنقدر نمسح الـ File object نفسه، بس لو عملنا createObjectURL هنمسحه
        // حالياً إنت بتعمل createObjectURL وقت الـ render، وبتعمله revoke وقت الـ onLoad، فده آمن 100%.
    };
  }, []);

  const handleMapConfirm = (lat: string, lng: string) => { setFormData({ ...formData, latitude: lat, longitude: lng }); setShowMap(false); };
  
  const getLocation = () => {
    if (!navigator.geolocation) { toast.error("GPS غير مدعوم في متصفحك"); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData({ ...formData, latitude: pos.coords.latitude.toString(), longitude: pos.coords.longitude.toString() });
        setLocating(false);
        toast.success("تم تحديد موقعك بنجاح!");
      },
      (err) => { 
        setLocating(false); 
        if (err.code === 1) {
            toast.error("لقد قمت برفض صلاحية الموقع. يرجى تفعيلها من إعدادات المتصفح.", { duration: 4000 });
        } else if (err.code === 2) {
            toast.error("الـ GPS مغلق أو الإشارة ضعيفة. يرجى تفعيله من إعدادات الموبايل.", { duration: 4000 });
        } else {
            toast.error("فشل تحديد الموقع. حاول التحديد يدوياً من الخريطة."); 
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 } 
    );
  };

  const handleChange = (field: string, value: string | boolean | File) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors({ ...errors, [field]: false });
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const catId = e.target.value;
      const selectedCat = categories.find(c => c.id.toString() === catId);
      setFormData({...formData, category: catId, features: {}});
      setSelectedCategoryName(selectedCat ? selectedCat.name : "");
      setDynamicFields(selectedCat?.allowed_features || []);
  };

  const handleGovChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
      const govId = e.target.value;
      setFormData({...formData, gov: govId, city: "", zone: "", subdivision: ""});
      if(govId) {
          try {
            const res = await api.get(`/cities/?governorate=${govId}`);
            setCities(Array.isArray(res.data) ? res.data : res.data.results || []);
          } catch(e) { console.error(e); }
      }
  };

  const handleCityChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
      const cityId = e.target.value;
      setFormData({...formData, city: cityId, zone: "", subdivision: ""});
      if(cityId) {
          try {
            const res = await api.get(`/major-zones/?city=${cityId}`);
            setZones(Array.isArray(res.data) ? res.data : res.data.results || []);
          } catch(e) { console.error(e); }
      }
  };

  const handleZoneChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
      const zoneId = e.target.value;
      setFormData({...formData, zone: zoneId, subdivision: ""});
      if(zoneId) {
          try {
            const res = await api.get(`/subdivisions/?major_zone=${zoneId}`);
            setSubdivisions(Array.isArray(res.data) ? res.data : res.data.results || []);
          } catch(e) { console.error(e); }
      }
  };

  const handleFeatureInput = (id: string, val: string) => setFormData(p => ({ ...p, features: { ...p.features, [id]: val } }));

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
          const files = Array.from(e.target.files);
          setCompressing(true);
          try {
              const compressedFiles = await Promise.all(
                  files.map(async (file) => {
                      try {
                          return await imageCompression(file, { 
                              maxSizeMB: 0.4, 
                              maxWidthOrHeight: 1200, 
                              useWebWorker: true,
                              initialQuality: 0.8
                          });
                      } catch {
                          return file;
                      }
                  })
              );
              setFormData(prev => ({ ...prev, images: [...prev.images, ...compressedFiles] }));
          } catch (error) { console.error(error); } 
          finally { setCompressing(false); }
      }
  };

  const removeImage = (index: number) => {
      const newImages = [...formData.images];
      newImages.splice(index, 1);
      setFormData({...formData, images: newImages});
  }

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          if (file.size > 500 * 1024 * 1024) { 
              toast.error("حجم الفيديو كبير جداً! الحد الأقصى 500 ميجابايت."); 
              return; 
          }
          setFormData(prev => ({ ...prev, video: file }));
      }
  };

  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'idCard' | 'contract') => { 
      if (e.target.files) setFormData({ ...formData, [type]: e.target.files[0] }); 
  };

  const validateStep1 = () => {
    let newErrors: Record<string, boolean> = {};
    if (!formData.category) newErrors.category = true;
    if (!formData.gov) newErrors.gov = true;
    if (!formData.city) newErrors.city = true;
    if (!formData.area) newErrors.area = true;
    if (!formData.price) newErrors.price = true;
    if (!formData.description) newErrors.description = true;
    
    if(Object.keys(newErrors).length > 0) { 
        setErrors(newErrors); 
        toast.error("يرجى إكمال جميع الحقول الأساسية الملونة بالأحمر"); 
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return false; 
    }
    return true;
  };

  const validateStep2 = () => {
      if (formData.images.length === 0) { 
          toast.error("يرجى إضافة صورة واحدة على الأقل للعقار"); 
          return false; 
      }
      return true;
  };

  const validateStep3 = () => {
      if (!formData.idCard && !formData.contract) { 
          toast.error("للتوثيق، يرجى إرفاق صورة البطاقة أو عقد الملكية"); 
          return false; 
      }
      if (!formData.ownerPhone) { 
          toast.error("رقم الهاتف مطلوب ليتواصل معك العملاء"); 
          return false; 
      }
      return true;
  };

  const nextStep = () => {
      if (step === 1) { if (validateStep1()) { setStep(2); window.scrollTo(0,0); } } 
      else if (step === 2) { if (validateStep2()) { setStep(3); window.scrollTo(0,0); } }
  };

  const handleSubmit = async () => {
        if (!isAuthenticated) { router.replace("/login"); return; }
        if (!validateStep3()) return;

        setSubmitting(true);
        setUploadProgress(0);

        try {
          let totalUploadTasks = formData.images.length + (formData.idCard ? 1 : 0) + (formData.contract ? 1 : 0);
          let tasksCompleted = 0;

          const updateOverallProgress = (localPercent: number) => {
              if(totalUploadTasks === 0) return;
              const overall = ((tasksCompleted * 100) + localPercent) / totalUploadTasks;
              setUploadProgress(overall * 0.9); 
          };

          setStatusMsg("جاري رفع الصور ومعالجتها بشكل آمن...");
          const uploadedImageUrls = [];
          for (let i = 0; i < formData.images.length; i++) {
              const url = await uploadSecurelyToCloudinary(formData.images[i], 'image', updateOverallProgress);
              uploadedImageUrls.push(url);
              tasksCompleted++;
          }

          setStatusMsg("تجهيز الوثائق وبيانات العقار...");
          let idCardUrl = formData.idCard ? await uploadSecurelyToCloudinary(formData.idCard, 'image', updateOverallProgress) : "";
          if (formData.idCard) tasksCompleted++;
          
          let contractUrl = formData.contract ? await uploadSecurelyToCloudinary(formData.contract, 'image', updateOverallProgress) : "";
          if (formData.contract) tasksCompleted++;

          setStatusMsg("إنشاء الإعلان...");
          const finalPayload = {
            title: `عرض ${formData.offerType} - ${selectedCategoryName} - ${formData.area}م`,
            offer_type: formData.offerType === "بيع" ? "Sale" : "Rent",
            category: formData.category ? parseInt(formData.category) : null,
            governorate: formData.gov ? parseInt(formData.gov) : null,
            city: formData.city ? parseInt(formData.city) : null,
            major_zone: formData.zone ? parseInt(formData.zone) : null,
            subdivision: formData.subdivision ? parseInt(formData.subdivision) : null,
            price: formData.price ? parseFloat(formData.price) : 0,
            area_sqm: formData.area ? parseInt(formData.area) : 0,
            description: formData.description + (formData.plotNumber ? `\n📌 رقم القطعة: ${formData.plotNumber}` : ""),
            is_finance_eligible: formData.isFinanceEligible,
            latitude: formData.latitude ? parseFloat(formData.latitude) : null,
            longitude: formData.longitude ? parseFloat(formData.longitude) : null,
            owner_name: formData.ownerName,
            owner_phone: formData.ownerPhone,
            features_data: JSON.stringify(formData.features), 
            floor_number: formData.floorNumber ? parseInt(formData.floorNumber) : null,
            building_number: formData.buildingNumber || null,
            apartment_number: formData.apartmentNumber || null,
            external_images: uploadedImageUrls, 
            external_id_card: idCardUrl || null,
            external_contract: contractUrl || null
          };

          const res = await api.post('/listings/', finalPayload);
          const newListingId = res.data.id; 

          setUploadProgress(100);
          setStatusMsg(formData.video ? "تم إنشاء الإعلان.. جاري معالجة الفيديو" : "🎉 تم نشر الإعلان بنجاح!");

          if (formData.video) {
              startVideoUpload(newListingId, formData.video);
          }
          
          setTimeout(() => router.push("/my-listings"), 2000);
          
        } 
        catch (error: any) {
            console.error(error);
            setSubmitting(false);
            setUploadProgress(0);
            toast.error("فشل نشر الإعلان. يرجى المحاولة مرة أخرى."); 
        }
    };

  const renderFeatureInput = (feat: Feature) => {
    const val = formData.features[feat.id] || "";
    if (feat.input_type === 'number') {
        const options = feat.options_list ? feat.options_list.split(',').map((s: string) => s.trim()) : ['1', '2', '3', '4', '5', '6'];
        return (
            <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                    {options.map((opt: string) => (
                        <button key={opt} type="button" onClick={() => handleFeatureInput(feat.id, opt)} className={`w-12 h-12 rounded-xl border-2 font-black text-sm transition-all duration-200 active:scale-95 ${val === opt ? "bg-amber-500 text-slate-900 border-amber-500 shadow-md shadow-amber-500/30" : "bg-white text-gray-500 border-gray-100 hover:border-amber-200"}`}>{opt}</button>
                    ))}
                </div>
                <input type="text" inputMode="numeric" pattern="[0-9]*" value={val} onChange={(e) => handleFeatureInput(feat.id, sanitizeNumberInput(e.target.value))} className="w-full h-12 border-2 rounded-xl px-4 bg-gray-50 focus:bg-white border-transparent focus:border-amber-500 outline-none transition text-left font-bold" placeholder="أو أدخل رقم مخصص..." />
            </div>
        );
    }
    if (feat.input_type === 'bool') {
        return (
            <div className="flex gap-3">
                <button type="button" onClick={() => handleFeatureInput(feat.id, "نعم")} className={`flex-1 flex items-center justify-center gap-2 h-12 rounded-xl border-2 font-bold transition-all active:scale-95 ${val === "نعم" ? "bg-slate-900 text-white border-slate-900 shadow-md" : "bg-white border-gray-100 text-gray-500 hover:border-slate-300"}`}>متوفر</button>
                <button type="button" onClick={() => handleFeatureInput(feat.id, "لا")} className={`flex-1 flex items-center justify-center gap-2 h-12 rounded-xl border-2 font-bold transition-all active:scale-95 ${val === "لا" ? "bg-red-50 text-red-500 border-red-200" : "bg-white border-gray-100 text-gray-500 hover:border-red-200"}`}>غير متوفر</button>
            </div>
        );
    }
    return <input type="text" value={val} onChange={(e) => handleFeatureInput(feat.id, e.target.value)} className="w-full h-12 px-4 border-2 border-gray-100 bg-gray-50 rounded-xl focus:bg-white focus:border-amber-500 outline-none transition font-medium" placeholder={`تفاصيل ${feat.name}...`} />;
  };

  if (!isAuthenticated && !loadingData) return null;

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-32 text-slate-800 font-sans dir-rtl">
      <Toaster position="top-center" reverseOrder={false} />
      {submitting && <ProgressOverlay progress={uploadProgress} message={statusMsg} />}
      
      {showMap && (
        <MapPicker 
           initialLat={formData.latitude} 
           initialLng={formData.longitude} 
           onConfirm={handleMapConfirm} 
           onClose={() => setShowMap(false)} 
        />
      )}

      <div className="bg-slate-900 pt-10 pb-28 px-4 text-center rounded-b-[2.5rem] md:rounded-b-[4rem] relative overflow-hidden shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)]">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent"></div>
        <h1 className="text-3xl md:text-4xl font-black mb-8 text-white relative z-10 tracking-wide">أضف عقارك <span className="text-amber-500">بسهولة</span></h1>
        
        <div className="max-w-xl mx-auto flex justify-between items-center relative z-10 px-4">
           <div className="absolute top-5 left-10 right-10 h-1 bg-slate-800 rounded-full -z-10"></div>
           <div className="absolute top-5 right-10 h-1 bg-amber-500 rounded-full -z-10 transition-all duration-500" style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}></div>

           {[ {id: 1, title: "التفاصيل", icon: Home}, {id: 2, title: "الصور", icon: Camera}, {id: 3, title: "التوثيق", icon: ShieldCheck} ].map((s) => (
             <div key={s.id} className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 md:w-12 h-12 rounded-full flex items-center justify-center text-sm md:text-base font-black border-4 transition-all duration-500 ${step >= s.id ? 'bg-amber-500 border-slate-900 text-slate-900 shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'bg-slate-800 border-slate-900 text-slate-500'}`}>
                    {step > s.id ? <CheckCircle2 className="w-5 h-5 md:w-6 h-6"/> : <s.icon className="w-4 h-4 md:w-5 h-5"/>}
                </div>
                <span className={`text-[10px] md:text-xs font-bold transition-colors duration-300 ${step >= s.id ? 'text-white' : 'text-slate-500'}`}>{s.title}</span>
             </div>
           ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-16 md:-mt-20 relative z-20">
        <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden p-6 md:p-10 mb-10">
           {loadingData && <div className="text-center py-20 flex flex-col items-center gap-3"><Loader2 className="w-10 h-10 text-amber-500 animate-spin"/><p className="font-bold text-slate-400">جاري تجهيز النموذج...</p></div>}

           {!loadingData && step === 1 && (
             <div className="animate-in fade-in slide-in-from-right-8 duration-500 space-y-8">
                
                <div className="bg-gray-50/80 p-2 rounded-2xl flex border border-gray-100">
                    {["بيع", "إيجار"].map(type => (
                        <button key={type} onClick={() => handleChange("offerType", type)} className={`flex-1 py-3.5 rounded-xl font-black text-sm md:text-base transition-all duration-300 ${formData.offerType === type ? "bg-white text-slate-900 shadow-sm border border-gray-200" : "text-slate-400 hover:text-slate-600"}`}>{type}</button>
                    ))}
                </div>

                <div className="relative">
                    <select className={`w-full h-14 border-2 rounded-2xl px-5 font-black text-sm md:text-base appearance-none outline-none transition-colors cursor-pointer bg-white ${errors.category ? 'border-red-400 bg-red-50 text-red-700' : 'border-gray-200 text-slate-700 focus:border-amber-500'}`} onChange={handleCategoryChange} value={formData.category}>
                        <option value="" disabled>اختر نوع العقار (شقة، فيلا، أرض...)</option>
                        {categories.map((cat) => <option key={cat.id} value={cat.id.toString()}>{cat.name}</option>)}
                    </select>
                    <ChevronDown className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"/>
                </div>

                {dynamicFields.length > 0 && (
                    <div className="bg-amber-50/50 p-6 md:p-8 rounded-[2rem] border border-amber-100/50 space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center"><Home className="w-4 h-4 text-amber-600"/></div>
                            <h3 className="font-black text-amber-800">المواصفات والتفاصيل</h3>
                        </div>
                        
                        {(selectedCategoryName.includes("أرض") || selectedCategoryName.includes("مصنع")) && (
                            <div><label className="block text-xs font-bold mb-2 text-slate-600">رقم القطعة</label><input type="text" className="w-full h-12 border-2 border-white rounded-xl px-4 font-bold focus:border-amber-400 outline-none shadow-sm" onChange={(e) => handleChange("plotNumber", e.target.value)} value={formData.plotNumber} placeholder="مثال: 45 ب" /></div>
                        )}
                        {selectedCategoryName.includes("شقة") && (
                            <div className="grid grid-cols-3 gap-3">
                                <div><label className="block text-xs font-bold mb-2 text-slate-500 text-center">عمارة</label><input type="text" className="w-full h-12 border-2 border-white rounded-xl px-2 text-center font-bold focus:border-amber-400 outline-none shadow-sm" onChange={(e) => handleChange("buildingNumber", e.target.value)} value={formData.buildingNumber} /></div>
                                {/* 🚀 منع حرف E في الدور */}
                                <div><label className="block text-xs font-bold mb-2 text-slate-500 text-center">الدور</label><input type="number" onKeyDown={(e) => ["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()} className="w-full h-12 border-2 border-white rounded-xl px-2 text-center font-bold focus:border-amber-400 outline-none shadow-sm" onChange={(e) => handleChange("floorNumber", e.target.value)} value={formData.floorNumber} /></div>
                                <div><label className="block text-xs font-bold mb-2 text-slate-500 text-center">شقة</label><input type="text" className="w-full h-12 border-2 border-white rounded-xl px-2 text-center font-bold focus:border-amber-400 outline-none shadow-sm" onChange={(e) => handleChange("apartmentNumber", e.target.value)} value={formData.apartmentNumber} /></div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                            {dynamicFields.map((feat) => (
                                <div key={feat.id} className={feat.input_type === 'text' ? 'col-span-full' : ''}>
                                    <label className="block text-[11px] font-bold text-slate-500 mb-2 uppercase tracking-wide">{feat.name}</label>
                                    {renderFeatureInput(feat)}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className={`p-6 md:p-8 rounded-[2rem] border-2 space-y-6 transition-colors ${errors.gov || errors.city ? 'border-red-200 bg-red-50/30' : 'border-gray-100 bg-gray-50/30'}`}>
                    <div className="mb-2">
                      <label className="text-base font-black text-slate-800 flex items-center gap-2"><MapPin className="w-5 h-5 text-slate-400" /> موقع العقار <span className="text-red-500">*</span></label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="relative"><select className={`w-full h-14 border-2 rounded-xl px-4 font-bold text-sm appearance-none outline-none focus:border-amber-500 bg-white ${errors.gov ? 'border-red-400 text-red-700' : 'border-gray-200 text-slate-700'}`} onChange={handleGovChange} value={formData.gov}><option value="" disabled>المحافظة</option>{governorates.map((g) => <option key={g.id} value={g.id.toString()}>{g.name}</option>)}</select><ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"/></div>
                        <div className="relative"><select className={`w-full h-14 border-2 rounded-xl px-4 font-bold text-sm appearance-none outline-none focus:border-amber-500 bg-white disabled:opacity-50 ${errors.city ? 'border-red-400 text-red-700' : 'border-gray-200 text-slate-700'}`} disabled={!formData.gov} onChange={handleCityChange} value={formData.city}><option value="" disabled>المدينة</option>{cities.map((c) => <option key={c.id} value={c.id.toString()}>{c.name}</option>)}</select><ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"/></div>
                        <div className="relative"><select className="w-full h-14 border-2 border-gray-200 bg-white rounded-xl px-4 font-bold text-sm appearance-none outline-none focus:border-amber-500 disabled:opacity-50 text-slate-700" disabled={!formData.city} onChange={handleZoneChange} value={formData.zone}><option value="">المنطقة (اختياري)</option>{zones.map((z) => <option key={z.id} value={z.id.toString()}>{z.name}</option>)}</select><ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"/></div>
                        <div className="relative"><select className="w-full h-14 border-2 border-gray-200 bg-white rounded-xl px-4 font-bold text-sm appearance-none outline-none focus:border-amber-500 disabled:opacity-50 text-slate-700" disabled={!formData.zone} onChange={(e) => handleChange("subdivision", e.target.value)} value={formData.subdivision}><option value="">المجاورة (اختياري)</option>{subdivisions.map((s) => <option key={s.id} value={s.id.toString()}>{s.name}</option>)}</select><ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"/></div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <button onClick={getLocation} type="button" className={`flex-1 py-3.5 rounded-xl text-sm font-bold border-2 transition flex items-center justify-center gap-2 ${formData.latitude && !showMap ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-sm' : 'bg-white border-gray-300 text-slate-600 hover:bg-gray-50 active:scale-95'}`}>
                            {locating ? <Loader2 className="w-4 h-4 animate-spin"/> : <Navigation className="w-4 h-4 text-blue-500" />}
                            {formData.latitude && !showMap ? "تم تحديد موقعك" : "استخدام موقعي الحالي"}
                        </button>

                        <button onClick={() => setShowMap(true)} type="button" className={`flex-1 py-3.5 rounded-xl text-sm font-bold border-2 border-dashed transition flex items-center justify-center gap-2 ${formData.latitude ? 'bg-green-50/50 border-green-300 text-green-700 hover:bg-green-100 shadow-sm' : 'bg-white border-gray-300 text-slate-500 hover:border-slate-400 hover:bg-gray-50 active:scale-95'}`}>
                            {formData.latitude ? <><CheckCircle2 className="w-4 h-4"/> تعديل على الخريطة</> : <><MapIcon className="w-4 h-4" /> تحديد يدوي على الخريطة</>}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 md:gap-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2">المساحة الإجمالية</label>
                        <div className="relative">
                            {/* 🚀 منع حرف E في المساحة */}
                            <input type="number" onKeyDown={(e) => ["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()} placeholder="0" className={`w-full h-14 border-2 rounded-2xl px-5 text-lg font-black outline-none transition ${errors.area ? 'border-red-400 text-red-600 bg-red-50' : 'border-gray-200 text-slate-900 focus:border-amber-500 bg-gray-50 focus:bg-white'}`} onChange={(e) => handleChange("area", e.target.value)} value={formData.area} />
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm pointer-events-none">م²</span>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-2">السعر المطلوب</label>
                        <div className="relative">
                            <input type="text" inputMode="numeric" pattern="[0-9]*" placeholder="0" className={`w-full h-14 border-2 rounded-2xl pl-10 pr-4 text-lg font-black outline-none transition ${errors.price ? 'border-red-400 text-red-600 bg-red-50' : 'border-gray-200 text-slate-900 focus:border-amber-500 bg-gray-50 focus:bg-white'}`} onChange={(e) => handleChange("price", sanitizeNumberInput(e.target.value))} value={formData.price} />
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-600 font-bold text-sm pointer-events-none">ج.م</span>
                        </div>
                        {formData.price && (
                            <p className="text-[11px] text-emerald-600 font-bold mt-1.5 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> {Number(formData.price).toLocaleString('ar-EG')} جنيه
                            </p>
                        )}
                    </div>
                </div>

                <div onClick={() => setFormData({...formData, isFinanceEligible: !formData.isFinanceEligible})} className={`flex items-center justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all active:scale-[0.99] select-none ${formData.isFinanceEligible ? 'border-emerald-500 bg-emerald-50/50 shadow-md' : 'border-gray-100 bg-white hover:border-emerald-200'}`}>
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${formData.isFinanceEligible ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'}`}><Banknote className="w-6 h-6" /></div>
                        <div><p className="font-black text-sm md:text-base text-slate-800">متاح للتمويل العقاري</p><p className="text-[11px] md:text-xs text-gray-500 mt-0.5">هل العقار مسجل ويصلح لقروض التمويل؟</p></div>
                    </div>
                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors ${formData.isFinanceEligible ? 'border-emerald-600 bg-emerald-600' : 'border-gray-300'}`}>{formData.isFinanceEligible && <CheckCircle2 className="w-5 h-5 text-white" />}</div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2">وصف تفصيلي للإعلان</label>
                    <textarea className={`w-full h-32 border-2 rounded-2xl p-4 text-sm resize-none outline-none transition font-medium leading-relaxed ${errors.description ? 'border-red-400 bg-red-50 text-red-800' : 'border-gray-200 bg-gray-50 focus:bg-white focus:border-amber-500 text-slate-700'}`} placeholder="اكتب تفاصيل إضافية (بحري، ناصية، مميزات الكمبوند، الخ...)" onChange={(e) => handleChange("description", e.target.value)} value={formData.description}></textarea>
                </div>

                <button onClick={nextStep} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg hover:bg-amber-500 hover:text-slate-900 transition-all shadow-[0_10px_20px_rgba(0,0,0,0.15)] active:scale-95 flex items-center justify-center gap-3 mt-10 group">
                    متابعة للصور والفيديو <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-2" />
                </button>
             </div>
           )}

           {!loadingData && step === 2 && (
             <div className="animate-in fade-in slide-in-from-right-8 duration-500 space-y-8">
                <div>
                    <h3 className="text-xl font-black text-slate-800 mb-2 flex items-center gap-2"><Camera className="w-6 h-6 text-amber-500"/> ألبوم الصور</h3>
                    <p className="text-sm text-gray-500 font-bold">الصور الجذابة تزيد من سرعة بيع عقارك.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {formData.images.map((img, idx) => {
                        const objectUrl = URL.createObjectURL(img);
                        return (
                          <div key={idx} className="aspect-square bg-gray-100 rounded-2xl overflow-hidden relative group shadow-sm border border-gray-200">
                               <img src={objectUrl} alt="Property" className="w-full h-full object-cover transition duration-300 group-hover:scale-110" onLoad={() => URL.revokeObjectURL(objectUrl)}/>
                               <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                               <button type="button" onClick={() => removeImage(idx)} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 shadow-md active:scale-95 transition-transform">
                                   <X className="w-4 h-4" />
                               </button>
                          </div>
                        )
                    })}
                    <label className="aspect-square bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 hover:border-amber-400 transition-colors group">
                        <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={compressing} />
                        {compressing ? <Loader2 className="w-10 h-10 text-amber-500 animate-spin"/> : <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform mb-2"><ImagePlus className="w-6 h-6 text-amber-500"/></div>}
                        <span className="text-xs font-bold text-slate-500">{compressing ? "جاري المعالجة..." : "إضافة صور"}</span>
                    </label>
                </div>
                
                <div className="pt-6 border-t border-gray-100">
                    <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2"><Video className="w-6 h-6 text-red-500"/> فيديو توضيحي (اختياري)</h3>
                    <label className={`block border-2 border-dashed rounded-[2rem] p-8 text-center cursor-pointer transition-all ${formData.video ? 'border-red-500 bg-red-50/50' : 'border-gray-300 bg-gray-50 hover:border-red-400 hover:bg-red-50/30'}`}>
                        <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm ${formData.video ? 'bg-red-500 text-white' : 'bg-white text-gray-400'}`}>
                            {formData.video ? <CheckCircle2 className="w-8 h-8"/> : <Video className="w-8 h-8" />}
                        </div>
                        <p className={`font-black text-base ${formData.video ? 'text-red-700' : 'text-slate-600'}`}>{formData.video ? formData.video.name : "اضغط هنا لرفع فيديو للعقار"}</p>
                        <p className="text-[11px] text-gray-400 font-bold mt-2">الحد الأقصى 500 ميجابايت (MP4, MOV)</p>
                    </label>
                </div>

                <div className="flex gap-4 pt-4">
                    <button onClick={() => {setStep(1); window.scrollTo(0,0);}} className="flex-1 bg-gray-100 text-slate-600 py-4 rounded-2xl font-black hover:bg-gray-200 transition active:scale-95">الرجوع للتفاصيل</button>
                    <button onClick={nextStep} className="flex-[2] bg-slate-900 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-amber-500 hover:text-slate-900 transition-all active:scale-95 flex items-center justify-center gap-2 group">
                        الخطوة الأخيرة <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                    </button>
                </div>
             </div>
           )}

           {!loadingData && step === 3 && (
             <div className="animate-in fade-in slide-in-from-right-8 duration-500 space-y-8">
                
                <div>
                    <h3 className="text-xl font-black text-slate-800 mb-2 flex items-center gap-2"><ShieldCheck className="w-6 h-6 text-green-500"/> التوثيق والتواصل</h3>
                    <p className="text-sm text-gray-500 font-bold">باقي خطوة واحدة ليكون إعلانك متاحاً للآلاف.</p>
                </div>

                <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100 space-y-5">
                    <h4 className="font-black text-base text-blue-900 flex items-center gap-2"><Phone className="w-5 h-5 text-blue-600"/> بيانات اتصال الإعلان</h4>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div><label className="block text-[11px] font-bold text-blue-700/70 mb-1.5 uppercase">الاسم (كما سيظهر)</label><input type="text" className="w-full h-12 border-2 border-white rounded-xl px-4 font-bold text-slate-800 outline-none focus:border-blue-400 shadow-sm" value={formData.ownerName} onChange={(e) => handleChange("ownerName", e.target.value)} /></div>
                        <div><label className="block text-[11px] font-bold text-blue-700/70 mb-1.5 uppercase">رقم الهاتف (للاتصال والواتساب)</label><input type="text" inputMode="numeric" pattern="[0-9]*" dir="ltr" className="w-full h-12 border-2 border-white rounded-xl px-4 font-black text-slate-800 outline-none focus:border-blue-400 shadow-sm text-right" value={formData.ownerPhone} onChange={(e) => handleChange("ownerPhone", sanitizeNumberInput(e.target.value))} /></div>
                    </div>
                </div>

                <div className="pt-2">
                    <h4 className="font-black text-base text-slate-800 mb-4 flex items-center gap-2">مستندات الملكية (سرية ولن تظهر للعامة)</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <label className={`relative overflow-hidden bg-slate-50 p-6 rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all group ${formData.idCard ? 'border-green-500 bg-green-50/50' : 'border-slate-300 hover:border-slate-400 hover:bg-slate-100'}`}>
                            <input type="file" className="hidden" onChange={(e) => handleDocUpload(e, 'idCard')} />
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 shadow-sm transition-transform group-hover:scale-110 ${formData.idCard ? 'bg-green-500 text-white' : 'bg-white text-slate-400'}`}>
                                {formData.idCard ? <CheckCircle2 className="w-6 h-6"/> : <User className="w-6 h-6"/>}
                            </div>
                            <span className={`font-black text-sm text-center ${formData.idCard ? 'text-green-700' : 'text-slate-600'}`}>{formData.idCard ? "تم إرفاق البطاقة" : "صورة البطاقة"}</span>
                        </label>
                        <label className={`relative overflow-hidden bg-slate-50 p-6 rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all group ${formData.contract ? 'border-green-500 bg-green-50/50' : 'border-slate-300 hover:border-slate-400 hover:bg-slate-100'}`}>
                            <input type="file" className="hidden" onChange={(e) => handleDocUpload(e, 'contract')} />
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 shadow-sm transition-transform group-hover:scale-110 ${formData.contract ? 'bg-green-500 text-white' : 'bg-white text-slate-400'}`}>
                                {formData.contract ? <CheckCircle2 className="w-6 h-6"/> : <FileText className="w-6 h-6"/>}
                            </div>
                            <span className={`font-black text-sm text-center ${formData.contract ? 'text-green-700' : 'text-slate-600'}`}>{formData.contract ? "تم إرفاق العقد" : "عقد الملكية"}</span>
                        </label>
                    </div>
                </div>

                <div className="flex gap-4 pt-6 border-t border-gray-100">
                    <button onClick={() => {setStep(2); window.scrollTo(0,0);}} className="flex-1 bg-gray-100 text-slate-600 py-4 rounded-2xl font-black hover:bg-gray-200 transition active:scale-95" disabled={submitting}>تعديل الصور</button>
                    <button onClick={handleSubmit} disabled={submitting || compressing} className="flex-[2] bg-emerald-600 text-white py-4 rounded-2xl font-black text-lg shadow-[0_10px_20px_rgba(5,150,105,0.2)] hover:bg-emerald-500 transition-all active:scale-95 flex justify-center items-center gap-2 disabled:bg-emerald-400 disabled:scale-100 disabled:shadow-none">
                        {submitting ? "جاري الرفع..." : <><UploadCloud className="w-6 h-6"/> انشر الإعلان الآن</>}
                    </button>
                </div>
             </div>
           )}

        </div>
      </div>
      <BottomNav />
    </main>
  );
}