"use client";

import { useEffect, useState } from "react";
import { Loader2, Map, MapPin, Navigation, PlusCircle, LayoutGrid } from "lucide-react";
import api from "@/lib/axios";

export default function AdminGeography() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // حالة النافذة المنبثقة (Modal)
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({ level: "", parent_id: null as number | null, title: "" });
  const [newItemName, setNewItemName] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchGeography();
  }, []);

  const fetchGeography = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await api.get('/admin-dashboard/geography/', { headers: { Authorization: `Token ${token}` } });
      setData(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = (level: string, parent_id: number | null, title: string) => {
    setModalConfig({ level, parent_id, title });
    setNewItemName("");
    setModalOpen(true);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    
    setAdding(true);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await api.post('/admin-dashboard/geography/', {
        level: modalConfig.level,
        name: newItemName,
        parent_id: modalConfig.parent_id
      }, { headers: { Authorization: `Token ${token}` } });
      
      setModalOpen(false);
      fetchGeography(); // ريفريش للداتا عشان تظهر الإضافة الجديدة
    } catch (error) {
      alert("حدث خطأ، تأكد أن الاسم غير مكرر.");
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="w-10 h-10 animate-spin text-amber-500" /></div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg"><Map className="w-6 h-6 text-blue-600" /></div>
            <h2 className="text-2xl font-black text-slate-800">إدارة المناطق الجغرافية</h2>
        </div>
        <button onClick={() => openAddModal('gov', null, 'إضافة محافظة جديدة')} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-600 transition-colors shadow-md flex items-center gap-2">
          <PlusCircle className="w-5 h-5"/> إضافة محافظة
        </button>
      </div>

      <div className="space-y-6">
        {data.map((gov: any) => (
          <div key={gov.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* المحافظة */}
            <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-black text-lg text-slate-800 flex items-center gap-2"><MapPin className="w-5 h-5 text-blue-500"/> {gov.name}</h3>
              <button onClick={() => openAddModal('city', gov.id, `إضافة مدينة في ${gov.name}`)} className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 transition">
                + مدينة جديدة
              </button>
            </div>

            {/* المدن */}
            <div className="p-4 space-y-4">
              {gov.cities.length === 0 && <p className="text-sm text-slate-400 font-medium">لا توجد مدن مسجلة.</p>}
              
              {gov.cities.map((city: any) => (
                <div key={city.id} className="border border-slate-100 rounded-xl p-4 bg-gray-50/50">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold text-slate-700 flex items-center gap-2"><Navigation className="w-4 h-4 text-emerald-500"/> {city.name}</h4>
                    <button onClick={() => openAddModal('zone', city.id, `إضافة منطقة كبرى في ${city.name}`)} className="text-[11px] font-bold text-emerald-600 hover:bg-emerald-50 px-2 py-1 rounded border border-emerald-200 transition">
                      + منطقة/حي جديد
                    </button>
                  </div>

                  {/* المناطق والمجاورات */}
                  <div className="grid md:grid-cols-2 gap-3 pl-4 border-r-2 border-emerald-100 pr-4">
                    {city.zones.map((zone: any) => (
                      <div key={zone.id} className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-sm text-slate-800">{zone.name}</span>
                            <button onClick={() => openAddModal('subdivision', zone.id, `إضافة مجاورة في ${zone.name}`)} className="text-[10px] font-bold text-amber-600 hover:bg-amber-50 px-2 py-1 rounded border border-amber-200 transition">
                            + مجاورة
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            {zone.subdivisions.map((sub: any) => (
                                <span key={sub.id} className="bg-slate-100 text-slate-600 text-[10px] px-2 py-1 rounded-md font-bold flex items-center gap-1">
                                    <LayoutGrid className="w-3 h-3"/> {sub.name}
                                </span>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 🔴 النافذة المنبثقة (Modal) للإضافة */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="font-black text-xl text-slate-800 mb-4">{modalConfig.title}</h3>
            <form onSubmit={handleAdd}>
              <input 
                autoFocus
                type="text" 
                required
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="اكتب الاسم هنا..." 
                className="w-full h-14 px-4 rounded-xl border-2 border-slate-200 font-bold outline-none focus:border-blue-500 mb-6"
              />
              <div className="flex gap-3">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-3 bg-gray-100 text-slate-600 font-bold rounded-xl hover:bg-gray-200 transition">إلغاء</button>
                <button type="submit" disabled={adding} className="flex-[2] py-3 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition shadow-md flex justify-center items-center">
                  {adding ? <Loader2 className="w-5 h-5 animate-spin" /> : "حفظ وإضافة"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}