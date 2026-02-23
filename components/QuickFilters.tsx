"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
  ChevronDown, Bed, Bath, DollarSign, Ruler, KeyRound, Building2, Check, X, 
  Hash, Car, Trees, Wifi, ShieldCheck, Snowflake, Tv, PaintBucket, Dumbbell, Utensils, Zap, Wind, Waves, ArrowUpFromLine, CheckCircle2, Layers, Search
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/axios"; // ✅ استخدام axios المركزي

const IconMap: Record<string, any> = {
    'BedDouble': Bed, 'Bed': Bed, 'Bath': Bath, 'Hash': Hash, 'ArrowUpFromLine': ArrowUpFromLine,
    'Zap': Zap, 'Wind': Wind, 'Waves': Waves, 'Trees': Trees, 'Car': Car, 'Wifi': Wifi,
    'ShieldCheck': ShieldCheck, 'Snowflake': Snowflake, 'Tv': Tv, 'Paintbucket': PaintBucket,
    'Dumbbell': Dumbbell, 'Utensils': Utensils, 'CheckCircle2': CheckCircle2, 'Layers': Layers
};

const DynamicSelector = ({ value, onChange, options = [], type }: any) => {
    const [localValue, setLocalValue] = useState(value || "");
    useEffect(() => { setLocalValue(value || ""); }, [value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setLocalValue(e.target.value);
    const applyFilter = () => { if (localValue !== value) onChange(localValue); };
    const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter') applyFilter(); };

    if (type === 'bool') {
        return (
            <div className="flex flex-col gap-4 w-full">
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={() => onChange("True")} 
                        className={`p-4 rounded-2xl font-bold border-2 transition-all active:scale-95 flex items-center justify-center gap-2
                        ${value === "True" ? 'bg-amber-500 text-white border-amber-500 shadow-lg' : 'bg-gray-50 text-slate-600 border-gray-100 hover:border-amber-400'}`}
                    >
                        <CheckCircle2 className="w-5 h-5" /> نعم (متوفر)
                    </button>
                    <button 
                        onClick={() => onChange("False")} 
                        className={`p-4 rounded-2xl font-bold border-2 transition-all active:scale-95 flex items-center justify-center gap-2
                        ${value === "False" ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-gray-50 text-slate-600 border-gray-100 hover:border-red-400'}`}
                    >
                        <X className="w-5 h-5" /> لا (غير متوفر)
                    </button>
                </div>
                {value && <button onClick={() => onChange('')} className="w-full py-3.5 text-red-500 font-bold bg-red-50 rounded-xl text-sm hover:bg-red-100 transition-colors">إلغاء التحديد</button>}
            </div>
        );
    }

    const finalOptions = options.length > 0 ? options : (type === 'number' ? ["1", "2", "3", "4", "5", "6"] : []);

    return (
        <div className="flex flex-col gap-5 w-full">
            {finalOptions.length > 0 && (
                <div className="flex gap-2 justify-start overflow-x-auto pb-2 px-1 no-scrollbar w-full" dir="ltr">
                    {finalOptions.map((opt: string) => (
                        <button 
                            key={opt} 
                            onClick={() => onChange(value === opt ? "" : opt)} 
                            className={`px-5 h-14 min-w-[3.5rem] rounded-2xl flex-shrink-0 font-black text-base border-2 transition-all duration-200 active:scale-95 whitespace-nowrap 
                            ${value === opt 
                                ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/30' 
                                : 'bg-white text-slate-600 border-gray-200 hover:border-amber-400'}`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            )}

            <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                <p className="text-xs text-gray-400 font-bold mb-3 text-center uppercase tracking-widest">
                    {type === 'text' ? 'أو ابحث بكلمة مخصصة' : 'أو أدخل رقم مخصص'}
                </p>
                <div className="flex items-center gap-2">
                    <input 
                        type={type === 'number' ? 'number' : 'text'} 
                        placeholder={type === 'text' ? "مثلاً: سوبر لوكس..." : "مثلاً: 10"} 
                        className={`flex-1 h-14 rounded-xl border-2 text-center text-lg outline-none transition-all font-bold 
                        ${value && !finalOptions.includes(value) ? 'border-amber-500 bg-white text-amber-600' : 'border-transparent bg-white focus:border-amber-400 text-slate-800 shadow-sm'}`} 
                        value={localValue} 
                        onChange={handleInputChange} 
                        onKeyDown={handleKeyDown} 
                        onBlur={applyFilter} 
                    />
                    <button onClick={applyFilter} className="h-14 w-14 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-md shrink-0 hover:bg-amber-500 transition-colors active:scale-95">
                        {type === 'text' ? <Search className="w-6 h-6"/> : <Check className="w-6 h-6"/>}
                    </button>
                </div>
            </div>
            
            {value && <button onClick={() => onChange('')} className="w-full py-3.5 text-red-500 font-bold bg-red-50 rounded-xl text-sm hover:bg-red-100 transition-colors">إلغاء التحديد</button>}
        </div>
    );
};

// ✅ حل مشكلة النطاقات السعرية (استخدام State بدل DOM)
const RangeSelector = ({ minVal, maxVal, onApply, onClear, type }: any) => {
    const [min, setMin] = useState(minVal || "");
    const [max, setMax] = useState(maxVal || "");

    useEffect(() => {
        setMin(minVal || "");
        setMax(maxVal || "");
    }, [minVal, maxVal]);

    return (
        <div className="pb-2">
            <div className="flex items-center gap-3 mb-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="flex-1 text-center">
                    <label className="text-[10px] text-gray-400 font-bold mb-2 block uppercase tracking-wider">من ({type})</label>
                    <input type="number" className="w-full bg-white h-12 rounded-xl text-center font-black text-lg text-slate-800 outline-none focus:ring-2 focus:ring-amber-400 border border-gray-100 shadow-sm" value={min} onChange={e => setMin(e.target.value)} placeholder="0" />
                </div>
                <div className="w-px h-12 bg-gray-200"></div>
                <div className="flex-1 text-center">
                    <label className="text-[10px] text-gray-400 font-bold mb-2 block uppercase tracking-wider">إلى ({type})</label>
                    <input type="number" className="w-full bg-white h-12 rounded-xl text-center font-black text-lg text-slate-800 outline-none focus:ring-2 focus:ring-amber-400 border border-gray-100 shadow-sm" value={max} onChange={e => setMax(e.target.value)} placeholder="∞" />
                </div>
            </div>
            <div className="flex gap-3">
                <button onClick={onClear} className="px-5 py-4 text-red-500 font-bold bg-red-50 rounded-xl text-sm hover:bg-red-100 transition-colors">مسح</button>
                <button onClick={() => onApply(min, max)} className="flex-1 bg-slate-900 text-white py-4 rounded-xl font-black text-base shadow-xl shadow-slate-900/20 hover:bg-amber-500 transition-all active:scale-95">تطبيق</button>
            </div>
        </div>
    );
};

const FilterPortal = ({ label, icon: Icon, isOpen, onToggle, isActive, children, title }: any) => {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);
    const DisplayIcon = Icon || Hash;

    return (
        <>
            <button onClick={onToggle} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-bold transition-all whitespace-nowrap active:scale-95 duration-200 ${isActive ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white border-gray-100 text-slate-600 hover:border-amber-300 hover:text-slate-900'}`}><DisplayIcon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-gray-400'}`}/>{label}<ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}/></button>
            {mounted && isOpen && createPortal(
                <div className="fixed inset-0 z-[999999] flex justify-center items-end md:items-center isolate">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onToggle}></div>
                    <div className="bg-white w-full md:w-[500px] rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl fixed bottom-0 md:relative md:bottom-auto z-[1000000] animate-in slide-in-from-bottom duration-300 ease-out flex flex-col max-h-[85vh]">
                        <div className="w-full flex justify-center pt-4 pb-2 md:hidden bg-white cursor-pointer rounded-t-[2.5rem]" onClick={onToggle}><div className="w-14 h-1.5 bg-gray-200 rounded-full"></div></div>
                        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white">
                            <h3 className="text-xl font-black text-slate-800 flex items-center gap-3"><div className="p-2 bg-amber-50 rounded-xl text-amber-500"><DisplayIcon className="w-5 h-5" /></div>{title}</h3>
                            <button onClick={onToggle} className="p-2 bg-gray-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar bg-white pb-10">{children}</div>
                    </div>
                </div>, document.body
            )}
        </>
    );
};

export default function QuickFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [featureGroups, setFeatureGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const normalizeGroupName = (name: string) => {
      const n = name.trim().toLowerCase();
      if (n.includes("غرف") || n.includes("نوم")) return "الغرف";
      if (n.includes("حمام")) return "الحمامات";
      if (n.includes("دور") || n.includes("طابق")) return "الدور";
      if (n.includes("تشطيب")) return "التشطيب";
      return name; 
  };

  useEffect(() => {
    const fetchData = async () => {
        try {
            const res = await api.get(`/categories/`); // ✅ استخدام axios 
            const catsList = Array.isArray(res.data) ? res.data : res.data.results || [];
            setCategories(catsList);

            const groups: Record<string, { ids: string[], iconName: string, options: Set<string>, type: string }> = {};

            for (const cat of catsList) {
                if (cat.allowed_features && Array.isArray(cat.allowed_features)) {
                    for (const feat of cat.allowed_features) {
                        if (feat.is_quick_filter) {
                            const normalizedName = normalizeGroupName(feat.name);
                            if (!groups[normalizedName]) {
                                groups[normalizedName] = { 
                                    ids: [], iconName: feat.icon || 'Hash', options: new Set(), type: feat.input_type
                                };
                            }
                            if (!groups[normalizedName].ids.includes(String(feat.id))) {
                                groups[normalizedName].ids.push(String(feat.id));
                            }
                            if (feat.options_list) {
                                feat.options_list.split(',').forEach((opt: string) => groups[normalizedName].options.add(opt.trim()));
                            }
                        }
                    }
                }
            }

            const groupsArray = Object.entries(groups).map(([name, data]) => ({
                name, ids: data.ids, icon: IconMap[data.iconName] || Hash, options: Array.from(data.options), type: data.type
            }));

            groupsArray.sort((a, b) => {
                const priority: any = { 'الغرف': 1, 'الحمامات': 2, 'الدور': 3 };
                return (priority[a.name] || 99) - (priority[b.name] || 99);
            });

            setFeatureGroups(groupsArray);
        } catch (e) { console.error(e); } 
        finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value); else params.delete(key);
    router.push(`/?${params.toString()}`, { scroll: false });
    setOpenFilter(null);
  };

  const updateDynamicFeature = (ids: string[], value: string) => {
      if (!ids || ids.length === 0) return;
      const key = `multi_feat_${ids.join('-')}`;
      const params = new URLSearchParams(searchParams.toString());
      Array.from(params.keys()).forEach(k => {
          if (k.startsWith(`multi_feat_`)) {
             if (k.split('_')[2] === ids.join('-')) params.delete(k);
          }
      });
      if (value) params.set(key, value);
      router.push(`/?${params.toString()}`, { scroll: false });
      setOpenFilter(null);
  };

  const updateRangeFilter = (minKey: string, maxKey: string, minVal: string, maxVal: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (minVal) params.set(minKey, minVal); else params.delete(minKey);
    if (maxVal) params.set(maxKey, maxVal); else params.delete(maxKey);
    router.push(`/?${params.toString()}`, { scroll: false });
    setOpenFilter(null);
  };

  const isGroupActive = (ids: string[]) => searchParams.has(`multi_feat_${ids.join('-')}`);
  const getGroupValue = (ids: string[]) => searchParams.get(`multi_feat_${ids.join('-')}`);
  const isActive = (key: string) => searchParams.has(key);

  return (
    <div className="relative w-full z-40">
      <div className="w-full overflow-x-auto no-scrollbar py-2 px-1">
        <div className="flex items-center gap-2.5 min-w-max">
          
          <FilterPortal label={searchParams.get('offer_type') === 'Sale' ? 'للبيع' : searchParams.get('offer_type') === 'Rent' ? 'للإيجار' : 'نوع العرض'} icon={KeyRound} isOpen={openFilter === 'offer'} onToggle={() => setOpenFilter(openFilter === 'offer' ? null : 'offer')} isActive={isActive('offer_type')} title="نوع الصفقة">
              <div className="grid grid-cols-2 gap-3 mb-6">
                 <button onClick={() => updateFilter('offer_type', 'Sale')} className={`p-4 rounded-2xl font-black flex flex-col items-center justify-center gap-2 border-2 transition-all duration-200 active:scale-95 ${searchParams.get('offer_type') === 'Sale' ? 'bg-amber-500 text-slate-900 border-amber-500 shadow-xl shadow-amber-500/30' : 'bg-gray-50 text-slate-500 border-gray-100 hover:bg-white hover:border-amber-300'}`}><div className={`p-3 rounded-full ${searchParams.get('offer_type') === 'Sale' ? 'bg-white/30' : 'bg-white shadow-sm'}`}><KeyRound className="w-6 h-6"/></div><span className="text-base">شراء</span></button>
                 <button onClick={() => updateFilter('offer_type', 'Rent')} className={`p-4 rounded-2xl font-black flex flex-col items-center justify-center gap-2 border-2 transition-all duration-200 active:scale-95 ${searchParams.get('offer_type') === 'Rent' ? 'bg-indigo-500 text-white border-indigo-500 shadow-xl shadow-indigo-500/30' : 'bg-gray-50 text-slate-500 border-gray-100 hover:bg-white hover:border-indigo-300'}`}><div className={`p-3 rounded-full ${searchParams.get('offer_type') === 'Rent' ? 'bg-white/20' : 'bg-white shadow-sm'}`}><Check className="w-6 h-6"/></div><span className="text-base">إيجار</span></button>
              </div>
              {isActive('offer_type') && <button onClick={() => updateFilter('offer_type', '')} className="w-full py-4 text-red-500 font-bold bg-red-50 rounded-xl text-sm hover:bg-red-100 transition-colors">إلغاء الفلتر</button>}
          </FilterPortal>

          <FilterPortal label="نوع العقار" icon={Building2} isOpen={openFilter === 'type'} onToggle={() => setOpenFilter(openFilter === 'type' ? null : 'type')} isActive={isActive('category')} title="اختر التصنيف">
              <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-1 pb-4">
                 <div className="grid grid-cols-2 gap-3 mb-6">
                     {categories.length > 0 ? categories.map((cat) => (
                        <button key={cat.id} onClick={() => updateFilter('category', cat.id.toString())} className={`py-4 px-3 rounded-2xl text-sm font-black border-2 transition-all duration-200 active:scale-95 ${searchParams.get('category') === cat.id.toString() ? 'border-amber-500 bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/30' : 'border-gray-100 bg-gray-50 text-slate-600 hover:bg-white hover:border-amber-300'}`}>{cat.name}</button>
                     )) : <p className="col-span-2 text-center text-gray-400 py-8 font-bold animate-pulse">جاري التحميل...</p>}
                 </div>
                 {isActive('category') && <button onClick={() => updateFilter('category', '')} className="w-full py-4 text-red-500 font-bold bg-red-50 rounded-xl text-sm hover:bg-red-100 transition-colors">مسح الكل</button>}
              </div>
          </FilterPortal>

          <FilterPortal label="السعر" icon={DollarSign} isOpen={openFilter === 'price'} onToggle={() => setOpenFilter(openFilter === 'price' ? null : 'price')} isActive={isActive('min_price') || isActive('max_price')} title="الميزانية (جنية)">
              <RangeSelector 
                 minVal={searchParams.get('min_price')} 
                 maxVal={searchParams.get('max_price')} 
                 type="جنية"
                 onApply={(min: string, max: string) => updateRangeFilter('min_price', 'max_price', min, max)} 
                 onClear={() => updateRangeFilter('min_price', 'max_price', '', '')} 
              />
          </FilterPortal>

          <FilterPortal label="المساحة" icon={Ruler} isOpen={openFilter === 'area'} onToggle={() => setOpenFilter(openFilter === 'area' ? null : 'area')} isActive={isActive('min_area') || isActive('max_area')} title="المساحة (م²)">
              <RangeSelector 
                 minVal={searchParams.get('min_area')} 
                 maxVal={searchParams.get('max_area')} 
                 type="متر"
                 onApply={(min: string, max: string) => updateRangeFilter('min_area', 'max_area', min, max)} 
                 onClear={() => updateRangeFilter('min_area', 'max_area', '', '')} 
              />
          </FilterPortal>

          {!loading && featureGroups.map((group) => (
              <FilterPortal key={group.name} label={group.name} icon={group.icon} isOpen={openFilter === group.name} onToggle={() => setOpenFilter(openFilter === group.name ? null : group.name)} isActive={isGroupActive(group.ids)} title={`تصفية حسب ${group.name}`}>
                   <DynamicSelector value={getGroupValue(group.ids)} onChange={(val: string) => updateDynamicFeature(group.ids, val)} options={group.options} type={group.type}/>
              </FilterPortal>
          ))}

        </div>
      </div>
    </div>
  );
}