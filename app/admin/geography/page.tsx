"use client";

import { useEffect, useState } from "react";
import { Loader2, Map, MapPin, Navigation, PlusCircle, LayoutGrid, Trash2, AlertTriangle, X } from "lucide-react";
import api from "@/lib/axios";

export default function AdminGeography() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // حالة نافذة الإضافة
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({ level: "", parent_id: null as number | null, title: "" });
  const [newItemName, setNewItemName] = useState("");
  const [adding, setAdding] = useState(false);

  // حالة نافذة الحذف (السحر هنا)
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, level: "", id: 0, name: "", count: null as number | null, checking: false, deleting: false });

  useEffect(() => {
    fetchGeography();
  }, []);

  const fetchGeography = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await api.get('/admin-dashboard/geography/', { headers: { Authorization: `Token ${token}` } });
      setData(res.data);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  // دوال الإضافة
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
      await api.post('/admin-dashboard/geography/', { level: modalConfig.level, name: newItemName, parent_id: modalConfig.parent_id }, { headers: { Authorization: `Token ${token}` } });
      setModalOpen(false);
      fetchGeography();
    } catch (error) { alert("حدث خطأ، تأكد أن الاسم غير مكرر."); } 
    finally { setAdding(false); }
  };

  // دوال الحذف الذكي
  const triggerDelete = async (level: string, id: number, name: string) => {
    setDeleteModal({ isOpen: true, level, id, name, count: null, checking: true, deleting: false });
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await api.post('/admin-dashboard/geography/delete/', { action: 'check', level, id }, { headers: { Authorization: `Token ${token}` } });
      setDeleteModal(prev => ({ ...prev, count: res.data.count, checking: false }));
    } catch (error) {
      alert("فشل في فحص الارتباطات!");
      setDeleteModal(prev => ({ ...prev, isOpen: false }));
    }
  };

  const confirmDelete = async () => {
    setDeleteModal(prev => ({ ...prev, deleting: true }));
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      await api.post('/admin-dashboard/geography/delete/', { action: 'delete', level: deleteModal.level, id: deleteModal.id }, { headers: { Authorization: `Token ${token}` } });
      setDeleteModal(prev => ({ ...prev, isOpen: false }));
      fetchGeography();
    } catch (error) { alert("فشل الحذف!"); }
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
              <div className="flex items-center gap-2">
                  <button onClick={() => triggerDelete('gov', gov.id, gov.name)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-4 h-4"/></button>
                  <button onClick={() => openAddModal('city', gov.id, `إضافة مدينة في ${gov.name}`)} className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 transition">
                    + مدينة جديدة
                  </button>
              </div>
            </div>

            {/* المدن */}
            <div className="p-4 space-y-4">
              {gov.cities.length === 0 && <p className="text-sm text-slate-400 font-medium">لا توجد مدن مسجلة.</p>}
              
              {gov.cities.map((city: any) => (
                <div key={city.id} className="border border-slate-100 rounded-xl p-4 bg-gray-50/50">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-bold text-slate-700 flex items-center gap-2"><Navigation className="w-4 h-4 text-emerald-500"/> {city.name}</h4>
                    <div className="flex items-center gap-2">
                        <button onClick={() => triggerDelete('city', city.id, city.name)} className="p-1.5 text-red-400 hover:text-red-600 transition"><Trash2 className="w-4 h-4"/></button>
                        <button onClick={() => openAddModal('zone', city.id, `إضافة منطقة كبرى في ${city.name}`)} className="text-[11px] font-bold text-emerald-600 hover:bg-emerald-50 px-2 py-1 rounded border border-emerald-200 transition">
                        + منطقة/حي جديد
                        </button>
                    </div>
                  </div>

                  {/* المناطق والمجاورات */}
                  <div className="grid md:grid-cols-2 gap-3 pl-4 border-r-2 border-emerald-100 pr-4">
                    {city.zones.map((zone: any) => (
                      <div key={zone.id} className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-sm text-slate-800">{zone.name}</span>
                            <div className="flex items-center gap-1">
                                <button onClick={() => triggerDelete('zone', zone.id, zone.name)} className="p-1 text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5"/></button>
                                <button onClick={() => openAddModal('subdivision', zone.id, `إضافة مجاورة في ${zone.name}`)} className="text-[10px] font-bold text-amber-600 hover:bg-amber-50 px-2 py-1 rounded border border-amber-200 transition">
                                + مجاورة
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            {zone.subdivisions.map((sub: any) => (
                                <span key={sub.id} className="bg-slate-100 border border-slate-200 text-slate-600 text-[10px] pl-1 pr-2 py-1 rounded-md font-bold flex items-center gap-1">
                                    <LayoutGrid className="w-3 h-3 text-slate-400"/> {sub.name}
                                    <button onClick={() => triggerDelete('subdivision', sub.id, sub.name)} className="mr-1 text-red-400 hover:text-red-600 p-0.5"><X className="w-3 h-3"/></button>
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

      {/* 🔴 Modal الإضافة */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="font-black text-xl text-slate-800 mb-4">{modalConfig.title}</h3>
            <form onSubmit={handleAdd}>
              <input autoFocus type="text" required value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="اكتب الاسم هنا..." className="w-full h-14 px-4 rounded-xl border-2 border-slate-200 font-bold outline-none focus:border-blue-500 mb-6" />
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

      {/* 🔴 Modal الحذف (التحذير الذكي) */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
            
            {deleteModal.checking ? (
                <div className="py-8 flex flex-col items-center">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                    <h3 className="font-black text-slate-700">جاري فحص ارتباطات هذه المنطقة...</h3>
                </div>
            ) : (
                <>
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-8 h-8" />
                    </div>
                    <h3 className="font-black text-2xl text-slate-800 mb-2">تأكيد الحذف!</h3>
                    <p className="font-bold text-slate-500 mb-6">هل أنت متأكد من حذف <span className="text-red-500">"{deleteModal.name}"</span>؟</p>

                    {deleteModal.count !== null && deleteModal.count > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                            <p className="text-sm font-black text-red-700">
                                ⚠️ تحذير خطير: سيتم حذف عدد ({deleteModal.count}) إعلان عقاري مرتبط بهذه المنطقة نهائياً!
                            </p>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button type="button" onClick={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))} className="flex-1 py-3 bg-gray-100 text-slate-600 font-bold rounded-xl hover:bg-gray-200 transition">إلغاء والتراجع</button>
                        <button type="button" onClick={confirmDelete} disabled={deleteModal.deleting} className="flex-[2] py-3 bg-red-600 text-white font-black rounded-xl hover:bg-red-700 transition shadow-md flex justify-center items-center">
                            {deleteModal.deleting ? <Loader2 className="w-5 h-5 animate-spin" /> : "نعم، احذف نهائياً"}
                        </button>
                    </div>
                </>
            )}

          </div>
        </div>
      )}

    </div>
  );
}