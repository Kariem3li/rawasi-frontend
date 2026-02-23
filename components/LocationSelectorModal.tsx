"use client";

import { useState, useEffect } from "react";
import { X, MapPin, ChevronRight, Loader2, Building2, Map, ChevronDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/axios"; // ✅ استخدام axios المركزي

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LocationSelectorModal({ isOpen, onClose }: LocationModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // === States ===
  const [loading, setLoading] = useState(false);
  
  // Data Lists
  const [governorates, setGovernorates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [majorZones, setMajorZones] = useState<any[]>([]);
  const [subdivisions, setSubdivisions] = useState<any[]>([]);

  // Selection States
  const [selectedGov, setSelectedGov] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedZone, setSelectedZone] = useState("");
  const [selectedSub, setSelectedSub] = useState("");

  // === 1. Load Governorates on Open ===
  useEffect(() => {
    if (isOpen) {
      api.get('/governorates/')
        .then(res => {
            const data = res.data;
            setGovernorates(Array.isArray(data) ? data : data.results || []);
        })
        .catch(console.error);
    }
  }, [isOpen]);

  // === 2. Handle Governorate Change ===
  const handleGovSelect = async (govId: string) => {
    setSelectedGov(govId);
    setSelectedCity("");
    setSelectedZone("");
    setSelectedSub("");
    setCities([]);
    setMajorZones([]);
    setSubdivisions([]);

    setLoading(true);
    try {
      const res = await api.get(`/cities/?governorate=${govId}`);
      const data = res.data;
      setCities(Array.isArray(data) ? data : data.results || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // === 3. Handle City Change ===
  const handleCitySelect = async (cityId: string) => {
    setSelectedCity(cityId);
    setSelectedZone("");
    setSelectedSub("");
    setMajorZones([]);
    setSubdivisions([]);

    setLoading(true);
    try {
      const res = await api.get(`/major-zones/?city=${cityId}`);
      const data = res.data;
      setMajorZones(Array.isArray(data) ? data : data.results || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // === 4. Handle Major Zone Change ===
  const handleZoneSelect = async (zoneId: string) => {
    setSelectedZone(zoneId);
    setSelectedSub("");
    setSubdivisions([]);

    setLoading(true);
    try {
      const res = await api.get(`/subdivisions/?major_zone=${zoneId}`);
      const data = res.data;
      setSubdivisions(Array.isArray(data) ? data : data.results || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // === 5. Apply Filter ===
  const applyLocation = () => {
    const params = new URLSearchParams(searchParams.toString());

    params.delete('governorate');
    params.delete('city');
    params.delete('major_zone');
    params.delete('subdivision');

    if (selectedGov) params.set('governorate', selectedGov);
    if (selectedCity) params.set('city', selectedCity);
    if (selectedZone) params.set('major_zone', selectedZone);
    if (selectedSub) params.set('subdivision', selectedSub);

    router.push(`/?${params.toString()}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000000] flex items-center justify-center p-4 isolate dir-rtl">
      {/* Overlay الزجاجي */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose}
      />

      {/* Modal Body */}
      <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white relative z-20 shadow-sm">
          <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <div className="p-2 bg-amber-50 rounded-xl">
                <MapPin className="w-5 h-5 text-amber-500" />
            </div>
            تحديد النطاق الجغرافي
          </h3>
          <button onClick={onClose} className="p-2.5 bg-gray-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors active:scale-95">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar pb-10">
            
            {/* 1. المحافظة */}
            <div className="space-y-3">
                <label className="text-sm font-bold text-slate-500 flex items-center gap-2">
                    <Map className="w-4 h-4 text-slate-400"/> المحافظة
                </label>
                <div className="grid grid-cols-2 gap-3">
                    {governorates.map(gov => (
                        <button 
                            key={gov.id}
                            onClick={() => handleGovSelect(gov.id)}
                            className={`p-3.5 rounded-xl text-sm font-black border-2 transition-all duration-200 active:scale-95 text-center ${selectedGov === gov.id ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-600 border-gray-100 hover:border-amber-400'}`}
                        >
                            {gov.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* 2. المدينة */}
            {selectedGov && (
                <div className="space-y-3 animate-in slide-in-from-right-4 fade-in duration-300">
                    <label className="text-sm font-bold text-slate-500 flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-400"/> المدينة
                    </label>
                    {cities.length > 0 ? (
                        <div className="relative group">
                            <select 
                                className="w-full h-14 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-amber-400 rounded-xl px-4 font-black text-slate-700 outline-none transition-all appearance-none cursor-pointer relative z-10"
                                value={selectedCity}
                                onChange={(e) => handleCitySelect(e.target.value)}
                            >
                                <option value="" disabled>اختر المدينة...</option>
                                {cities.map(city => (
                                    <option key={city.id} value={city.id}>{city.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-amber-500 z-20 pointer-events-none transition-colors" />
                        </div>
                    ) : (
                        <div className="text-center text-gray-400 text-sm py-4 bg-gray-50 rounded-xl font-bold border border-dashed border-gray-200">لا توجد مدن متاحة</div>
                    )}
                </div>
            )}

            {/* 3. المنطقة الرئيسية */}
            {selectedCity && (
                <div className="space-y-3 animate-in slide-in-from-right-4 fade-in duration-300 delay-100">
                    <label className="text-sm font-bold text-slate-500 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400"/> المنطقة / الحي
                    </label>
                    {loading && majorZones.length === 0 ? (
                        <div className="flex items-center justify-center gap-2 text-amber-500 text-sm font-bold py-4 bg-amber-50 rounded-xl border border-amber-100">
                            <Loader2 className="w-5 h-5 animate-spin"/> جاري التحميل...
                        </div>
                    ) : majorZones.length > 0 ? (
                        <div className="relative group">
                            <select 
                                className="w-full h-14 bg-gray-50 border-2 border-transparent focus:bg-white focus:border-amber-400 rounded-xl px-4 font-black text-slate-700 outline-none transition-all appearance-none cursor-pointer relative z-10"
                                value={selectedZone}
                                onChange={(e) => handleZoneSelect(e.target.value)}
                            >
                                <option value="">اختر المنطقة (اختياري)...</option>
                                {majorZones.map(zone => (
                                    <option key={zone.id} value={zone.id}>{zone.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-amber-500 z-20 pointer-events-none transition-colors" />
                        </div>
                    ) : (
                        <div className="text-center text-gray-400 text-sm py-4 bg-gray-50 rounded-xl font-bold border border-dashed border-gray-200">
                            لا توجد مناطق مسجلة في هذه المدينة
                        </div>
                    )}
                </div>
            )}

            {/* 4. المنطقة الفرعية (المجاورة) */}
            {selectedZone && subdivisions.length > 0 && (
                <div className="space-y-3 animate-in slide-in-from-right-4 fade-in duration-300 delay-200">
                    <label className="text-sm font-bold text-slate-500 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400"/> التقسيم / المجاورة (اختياري)
                    </label>
                    <div className="flex flex-wrap gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                        {subdivisions.map(sub => (
                            <button
                                key={sub.id}
                                onClick={() => setSelectedSub(selectedSub === sub.id ? "" : sub.id)}
                                className={`px-4 py-2.5 rounded-lg text-xs font-black border-2 transition-all active:scale-95 ${selectedSub === sub.id ? 'bg-amber-500 text-slate-900 border-amber-500 shadow-md' : 'bg-white text-slate-600 border-transparent hover:border-amber-300 shadow-sm'}`}
                            >
                                {sub.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 bg-white flex gap-3 relative z-20 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
            <button 
                onClick={onClose}
                className="px-6 py-4 rounded-xl font-bold text-slate-500 bg-gray-50 hover:bg-gray-100 hover:text-slate-800 transition-colors active:scale-95"
            >
                إلغاء
            </button>
            <button 
                onClick={applyLocation}
                disabled={!selectedGov}
                className="flex-1 bg-slate-900 text-white py-4 rounded-xl font-black text-lg shadow-xl shadow-slate-900/20 hover:bg-amber-500 hover:text-slate-900 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                تأكيد الموقع <ChevronRight className="w-5 h-5 rtl:rotate-180"/>
            </button>
        </div>

      </div>
    </div>
  );
}