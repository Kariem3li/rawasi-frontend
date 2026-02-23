"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Filter, MapPin, Home, Banknote, Check, RotateCcw, Bed, Bath, Hash, DollarSign, Ruler, LayoutDashboard, Building, KeyRound, Search, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/axios"; // ✅ استخدام axios المركزي

const FilterSection = ({ title, icon: Icon, children }: any) => (
    <div className="space-y-4 pt-6 border-t border-gray-100 first:border-t-0 first:pt-0">
        <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <div className="p-1.5 bg-amber-50 rounded-xl"><Icon className="w-4 h-4 text-amber-500"/></div>
            {title}
        </h3>
        {children}
    </div>
);

const CategoryButton = ({ name, isSelected, onClick, Icon }: any) => (
    <button onClick={onClick} className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-300 border-2 text-center h-24 w-full active:scale-95 ${isSelected ? "border-amber-500 bg-amber-50 text-slate-900 shadow-md transform scale-[1.02]" : "border-gray-100 text-slate-500 bg-white hover:bg-gray-50 hover:border-amber-200"}`}>
        <Icon className={`w-6 h-6 mb-2 transition-colors ${isSelected ? "text-amber-500" : "text-gray-400"}`}/>
        <span className="text-[11px] font-bold">{name}</span>
    </button>
);

const NumberSelector = ({ value, onChange }: any) => {
    const [localValue, setLocalValue] = useState(value || "");
    useEffect(() => { setLocalValue(value || ""); }, [value]);

    const isStandardValue = ["1", "2", "3", "4", "5", "6"].includes(value);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalValue(e.target.value.replace(/[^0-9]/g, ''));
    };

    const applyFilter = () => {
        if (localValue !== value) onChange(localValue);
    };

    return (
        <div className="flex flex-col gap-4 pb-1 w-full">
            <div className="flex gap-2 justify-start overflow-x-auto no-scrollbar w-full pb-2">
                {[1, 2, 3, 4, 5, 6].map((num) => (
                    <button 
                        key={num} 
                        onClick={() => onChange(value === num.toString() ? "" : num.toString())}
                        className={`w-11 h-11 rounded-full flex-shrink-0 font-black text-sm border-2 transition-all active:scale-95 ${
                            value === num.toString() 
                            ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/30' 
                            : 'bg-white text-slate-500 border-gray-100 hover:border-amber-400'
                        }`}
                    >
                        {num}
                    </button>
                ))}
            </div>
            <div className="flex items-center gap-2">
                <input 
                    type="number" 
                    placeholder="رقم مخصص +" 
                    className={`flex-1 h-12 rounded-xl border-2 text-center text-sm outline-none transition-all font-bold ${
                        value && !isStandardValue 
                        ? 'border-amber-500 text-amber-600' 
                        : 'border-gray-100 bg-gray-50 focus:border-amber-400 focus:bg-white'
                    }`}
                    value={localValue} 
                    onChange={handleInputChange}
                    onBlur={applyFilter}
                    onKeyDown={(e) => e.key === 'Enter' && applyFilter()}
                />
            </div>
        </div>
    );
};

export default function AdvancedFiltersModal({ trigger }: any) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [mounted, setMounted] = useState(false);

    const [categories, setCategories] = useState<any[]>([]);
    const [governorates, setGovernorates] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);
    const [zones, setZones] = useState<any[]>([]);
    const [subdivisions, setSubdivisions] = useState<any[]>([]);
    const [dynamicFeatureFields, setDynamicFeatureFields] = useState<any[]>([]);
    
    const [specialIds, setSpecialIds] = useState<{ bedroom: string | null, bathroom: string | null, floor: string | null }>({ bedroom: null, bathroom: null, floor: null });

    const [filters, setFilters] = useState({
        offer_type: "", category: "", min_price: "", max_price: "", min_area: "", max_area: "", 
        governorate: "", city: "", major_zone: "", subdivision: "", 
        is_finance_eligible: false,
        dynamicFeatures: {} as Record<string, any>
    });

    // ✅ استخدام axios المركزي بدلاً من fetch
    const safeFetch = async (endpoint: string) => {
        try {
            const res = await api.get(endpoint);
            return Array.isArray(res.data) ? res.data : res.data.results || [];
        } catch { return []; }
    };

    const getCategoryIcon = (name: string) => {
        if (!name) return Home;
        if (name.includes("شقة") || name.includes("استوديو")) return Home;
        if (name.includes("فيلا") || name.includes("منزل")) return Building;
        if (name.includes("أرض")) return MapPin;
        return LayoutDashboard;
    };

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            const initialize = async () => {
                setIsLoadingData(true);
                try {
                    const [cats, govs] = await Promise.all([
                        safeFetch(`/categories/`),
                        safeFetch(`/governorates/`)
                    ]);
                    setCategories(cats);
                    setGovernorates(govs);

                    const currentFilters: any = { ...filters };
                    const currentDynamic: any = {};
                    searchParams.forEach((value, key) => {
                        if (key.startsWith('feat_')) {
                            const featureId = key.split('_')[1];
                            currentDynamic[featureId] = value;
                        } else if (key in filters) {
                            if (key === 'is_finance_eligible') currentFilters[key] = value === 'true';
                            else currentFilters[key] = value;
                        }
                    });
                    currentFilters.dynamicFeatures = currentDynamic;
                    setFilters(currentFilters);

                    if (currentFilters.category) {
                        const feats = await safeFetch(`/categories/${currentFilters.category}/features/`);
                        setDynamicFeatureFields(feats);
                        
                        const bed = feats.find((f: any) => f.name.includes("غرف") || f.name.includes("نوم"));
                        const bath = feats.find((f: any) => f.name.includes("حمام"));
                        const floor = feats.find((f: any) => f.name.includes("دور") || f.name.includes("طابق"));
                        setSpecialIds({ 
                            bedroom: bed ? String(bed.id) : null, 
                            bathroom: bath ? String(bath.id) : null,
                            floor: floor ? String(floor.id) : null
                        });
                    }

                    if (currentFilters.governorate) {
                        const citiesData = await safeFetch(`/cities/?governorate=${currentFilters.governorate}`);
                        setCities(citiesData);
                        if (currentFilters.city) {
                            const zonesData = await safeFetch(`/major-zones/?city=${currentFilters.city}`);
                            setZones(zonesData);
                            if (currentFilters.major_zone) {
                                const subsData = await safeFetch(`/subdivisions/?major_zone=${currentFilters.major_zone}`);
                                setSubdivisions(subsData);
                            }
                        }
                    }
                } catch (error) { console.error(error); } 
                finally { setIsLoadingData(false); }
            };
            initialize();
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen, searchParams]); 

    const handleCategoryChange = async (catId: string) => {
        setFilters(prev => ({ ...prev, category: catId, dynamicFeatures: {} }));
        setDynamicFeatureFields([]);
        setSpecialIds({ bedroom: null, bathroom: null, floor: null });

        if (catId) {
            const feats = await safeFetch(`/categories/${catId}/features/`);
            setDynamicFeatureFields(feats);
            const bed = feats.find((f: any) => f.name.includes("غرف") || f.name.includes("نوم"));
            const bath = feats.find((f: any) => f.name.includes("حمام"));
            const floor = feats.find((f: any) => f.name.includes("دور") || f.name.includes("طابق"));
            setSpecialIds({ 
                bedroom: bed ? String(bed.id) : null, 
                bathroom: bath ? String(bath.id) : null,
                floor: floor ? String(floor.id) : null
            });
        }
    };

    const handleGovChange = async (e: any) => {
        const val = e.target.value;
        setFilters(prev => ({ ...prev, governorate: val, city: "", major_zone: "", subdivision: "" }));
        setCities([]); setZones([]); setSubdivisions([]);
        if (val) {
            const citiesData = await safeFetch(`/cities/?governorate=${val}`);
            setCities(citiesData);
        }
    };
    const handleCityChange = async (e: any) => {
        const val = e.target.value;
        setFilters(prev => ({ ...prev, city: val, major_zone: "", subdivision: "" }));
        setZones([]); setSubdivisions([]);
        if (val) {
            const zonesData = await safeFetch(`/major-zones/?city=${val}`);
            setZones(zonesData);
        }
    };
    const handleZoneChange = async (e: any) => {
        const val = e.target.value;
        setFilters(prev => ({ ...prev, major_zone: val, subdivision: "" }));
        setSubdivisions([]);
        if (val) {
            const subsData = await safeFetch(`/subdivisions/?major_zone=${val}`);
            setSubdivisions(subsData);
        }
    };

    const handleFeatureChange = (value: string, featureId: string | number) => {
        setFilters(prev => ({
            ...prev,
            dynamicFeatures: { ...prev.dynamicFeatures, [featureId]: value }
        }));
    };

    const applyFilters = () => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (key === 'dynamicFeatures') return;
            if (key === 'is_finance_eligible') { if (value === true) params.append(key, 'true'); return; }
            if (value && value !== "") params.append(key, String(value));
        });
        Object.entries(filters.dynamicFeatures).forEach(([id, value]) => {
            if (value && value !== '0' && value !== "") params.append(`feat_${id}`, String(value));
        });
        setIsOpen(false);
        router.push(`/?${params.toString()}`);
    };

    const resetFilters = () => {
        setFilters({ 
            offer_type: "", category: "", min_price: "", max_price: "", min_area: "", max_area: "", 
            governorate: "", city: "", major_zone: "", subdivision: "", 
            is_finance_eligible: false, dynamicFeatures: {} 
        });
        setDynamicFeatureFields([]);
        router.push('/');
        setIsOpen(false);
    };

    return (
        <>
            <div onClick={() => setIsOpen(true)}>{trigger || <button className="bg-slate-900 h-14 w-14 rounded-2xl flex items-center justify-center text-white hover:bg-amber-500 transition-all shadow-lg active:scale-95"><Filter className="w-6 h-6" /></button>}</div>
            {mounted && isOpen && createPortal(
                <div className="fixed inset-0 z-[1000000] flex justify-center items-end md:items-center isolate">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsOpen(false)}/>
                    <div className="bg-white w-full md:w-[700px] h-[95vh] md:h-auto md:max-h-[90vh] rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl relative z-[1000001] flex flex-col animate-in slide-in-from-bottom duration-300">
                        
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-[2.5rem] sticky top-0 z-20">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2"><Filter className="w-6 h-6 text-amber-500" /> تصفية دقيقة</h2>
                                <p className="text-xs text-gray-500 font-bold mt-1">حدد مواصفات عقارك بالتفصيل</p>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-2.5 bg-gray-50 text-slate-400 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors"><X className="w-5 h-5"/></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                            {isLoadingData ? (
                                <div className="h-60 flex items-center justify-center flex-col gap-4">
                                    <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
                                    <span className="text-sm font-bold text-gray-500 animate-pulse">جاري تجهيز الفلاتر...</span>
                                </div>
                            ) : (
                                <div className="space-y-8 pb-10">
                                    <div className="bg-gray-50/50 p-2 rounded-2xl flex text-sm font-bold border border-gray-100 shadow-inner">
                                        <button onClick={() => setFilters(p => ({...p, offer_type: 'Sale'}))} className={`flex-1 py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${filters.offer_type === 'Sale' ? 'bg-white text-slate-900 shadow-md ring-2 ring-amber-500' : 'text-gray-400 hover:text-slate-700'}`}><Banknote className="w-4 h-4"/> شراء</button>
                                        <button onClick={() => setFilters(p => ({...p, offer_type: 'Rent'}))} className={`flex-1 py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${filters.offer_type === 'Rent' ? 'bg-white text-slate-900 shadow-md ring-2 ring-indigo-500' : 'text-gray-400 hover:text-slate-700'}`}><KeyRound className="w-4 h-4"/> إيجار</button>
                                    </div>

                                    <FilterSection title="نوع العقار" icon={LayoutDashboard}>
                                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                            {categories.map((cat) => (<CategoryButton key={cat.id} name={cat.name} isSelected={filters.category == cat.id} onClick={() => handleCategoryChange(cat.id)} Icon={getCategoryIcon(cat.name)}/>))}
                                        </div>
                                    </FilterSection>

                                    <FilterSection title="النطاق الجغرافي" icon={MapPin}>
                                        <div className="grid gap-4">
                                            <select className="w-full bg-gray-50 h-14 rounded-xl px-4 font-bold text-slate-700 border-2 border-gray-100 focus:border-amber-400 outline-none transition-colors" onChange={handleGovChange} value={filters.governorate}><option value="">جميع المحافظات</option>{governorates.map((g: any) => <option key={g.id} value={g.id}>{g.name}</option>)}</select>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <select className="w-full bg-gray-50 h-14 rounded-xl px-4 font-bold text-slate-700 border-2 border-gray-100 focus:border-amber-400 outline-none disabled:opacity-50" onChange={handleCityChange} value={filters.city} disabled={!filters.governorate}><option value="">المدينة</option>{cities.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
                                                <select className="w-full bg-gray-50 h-14 rounded-xl px-4 font-bold text-slate-700 border-2 border-gray-100 focus:border-amber-400 outline-none disabled:opacity-50" onChange={handleZoneChange} value={filters.major_zone} disabled={!filters.city}><option value="">الحي / المنطقة</option>{zones.map((z: any) => <option key={z.id} value={z.id}>{z.name}</option>)}</select>
                                            </div>
                                            <select className="w-full bg-gray-50 h-14 rounded-xl px-4 font-bold text-slate-700 border-2 border-gray-100 focus:border-amber-400 outline-none disabled:opacity-50" onChange={(e) => setFilters(p => ({...p, subdivision: e.target.value}))} value={filters.subdivision} disabled={!filters.major_zone}><option value="">المجاورة / التقسيم (اختياري)</option>{subdivisions.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
                                        </div>
                                    </FilterSection>

                                    <FilterSection title="الميزانية والمساحة" icon={DollarSign}>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <label className="text-xs font-bold text-gray-500">السعر (ج.م)</label>
                                                <div className="flex gap-2">
                                                    <input type="number" placeholder="الحد الأدنى" className="w-full bg-gray-50 h-12 rounded-xl text-center font-bold text-slate-700 border-2 border-gray-100 focus:border-amber-400 outline-none" value={filters.min_price} onChange={e => setFilters(p => ({...p, min_price: e.target.value}))}/>
                                                    <input type="number" placeholder="الحد الأقصى" className="w-full bg-gray-50 h-12 rounded-xl text-center font-bold text-slate-700 border-2 border-gray-100 focus:border-amber-400 outline-none" value={filters.max_price} onChange={e => setFilters(p => ({...p, max_price: e.target.value}))}/>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-xs font-bold text-gray-500">المساحة (م²)</label>
                                                <div className="flex gap-2">
                                                    <input type="number" placeholder="من" className="w-full bg-gray-50 h-12 rounded-xl text-center font-bold text-slate-700 border-2 border-gray-100 focus:border-amber-400 outline-none" value={filters.min_area} onChange={e => setFilters(p => ({...p, min_area: e.target.value}))}/>
                                                    <input type="number" placeholder="إلى" className="w-full bg-gray-50 h-12 rounded-xl text-center font-bold text-slate-700 border-2 border-gray-100 focus:border-amber-400 outline-none" value={filters.max_area} onChange={e => setFilters(p => ({...p, max_area: e.target.value}))}/>
                                                </div>
                                            </div>
                                        </div>
                                        <label className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all mt-4 select-none ${filters.is_finance_eligible ? 'border-emerald-500 bg-emerald-50 shadow-md' : 'border-gray-100 bg-white hover:border-emerald-200'}`}>
                                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${filters.is_finance_eligible ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'}`}>
                                                {filters.is_finance_eligible && <Check className="w-4 h-4 text-white"/>}
                                            </div>
                                            <input type="checkbox" className="hidden" checked={filters.is_finance_eligible} onChange={() => setFilters(p => ({...p, is_finance_eligible: !p.is_finance_eligible}))} />
                                            <span className="text-sm font-black text-slate-800">متاح للتمويل العقاري</span>
                                        </label>
                                    </FilterSection>

                                    {dynamicFeatureFields.length > 0 && (
                                        <FilterSection title="التفاصيل والمرافق" icon={Ruler}>
                                            <div className="space-y-6">
                                                {specialIds.bedroom && (
                                                    <div className="space-y-3">
                                                        <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5"><Bed className="w-4 h-4 text-amber-500"/> الغرف</label>
                                                        <NumberSelector value={filters.dynamicFeatures[specialIds.bedroom] || ""} onChange={(v: string) => handleFeatureChange(v, specialIds.bedroom!)} />
                                                    </div>
                                                )}
                                                {specialIds.bathroom && (
                                                    <div className="space-y-3">
                                                        <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5"><Bath className="w-4 h-4 text-amber-500"/> الحمامات</label>
                                                        <NumberSelector value={filters.dynamicFeatures[specialIds.bathroom] || ""} onChange={(v: string) => handleFeatureChange(v, specialIds.bathroom!)} />
                                                    </div>
                                                )}
                                                {specialIds.floor && (
                                                    <div className="space-y-3">
                                                        <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5"><Hash className="w-4 h-4 text-amber-500"/> الدور</label>
                                                        <NumberSelector value={filters.dynamicFeatures[specialIds.floor] || ""} onChange={(v: string) => handleFeatureChange(v, specialIds.floor!)} />
                                                    </div>
                                                )}

                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                                                {dynamicFeatureFields.map((field) => {
                                                    if ([specialIds.bedroom, specialIds.bathroom, specialIds.floor].includes(String(field.id))) return null;
                                                    
                                                    const val = filters.dynamicFeatures[field.id] || "";
                                                    return (
                                                        <div key={field.id} className="space-y-2">
                                                            <label className="text-xs font-bold text-gray-500 flex items-center gap-1.5 line-clamp-1"><LayoutDashboard className="w-3.5 h-3.5"/> {field.name}</label>
                                                            {field.input_type === 'bool' ? (
                                                                <select className="w-full bg-gray-50 h-11 rounded-xl px-2 font-bold text-slate-700 border border-gray-200 outline-none" value={val} onChange={(e) => handleFeatureChange(e.target.value, field.id)}><option value="">الكل</option><option value="نعم">متوفر</option><option value="لا">غير متوفر</option></select>
                                                            ) : (
                                                                <input type="text" className="w-full bg-gray-50 h-11 rounded-xl px-3 font-bold text-center text-slate-700 border border-gray-200 outline-none" placeholder="..." value={val} onChange={(e) => handleFeatureChange(e.target.value, field.id)}/>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                                </div>
                                            </div>
                                        </FilterSection>
                                    )}
                                </div>
                            )}
                        </div>
                        
                        <div className="p-5 border-t border-gray-100 bg-white md:rounded-b-[2.5rem] sticky bottom-0 z-20 flex gap-3">
                            <button onClick={resetFilters} className="px-6 py-4 rounded-xl font-bold text-slate-500 bg-gray-50 hover:text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"><RotateCcw className="w-4 h-4"/> مسح</button>
                            <button onClick={applyFilters} className="flex-1 bg-slate-900 text-white rounded-xl font-black text-lg py-4 hover:bg-amber-500 active:scale-95 transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2"><Search className="w-5 h-5"/> إظهار النتائج</button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}