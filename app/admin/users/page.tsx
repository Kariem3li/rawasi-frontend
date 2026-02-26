"use client";

import { useEffect, useState } from "react";
import { Loader2, Users, ShieldCheck, BellRing, Send, UserCheck, Calendar, Edit, Ban, CheckCircle } from "lucide-react";
import api from "@/lib/axios";

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // حالة الإشعارات
  const [broadcastModal, setBroadcastModal] = useState(false);
  const [notification, setNotification] = useState({ title: "", message: "", target: "all" });
  const [sending, setSending] = useState(false);

  // حالة تعديل المستخدم
  const [editModal, setEditModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await api.get('/admin-dashboard/users/', { headers: { Authorization: `Token ${token}` } });
      setUsers(res.data);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  // 📣 إرسال إشعار جماعي
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await api.post('/admin-dashboard/broadcast/', notification, { headers: { Authorization: `Token ${token}` } });
      alert(`تم الإرسال لـ ${res.data.count} مستخدم!`);
      setBroadcastModal(false);
    } catch (error) { alert("حدث خطأ!"); } 
    finally { setSending(false); }
  };

  // ✏️ فتح شاشة التعديل
  const openEditModal = (user: any) => {
    setEditingUser({
        id: user.id,
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        phone: user.phone || "",
        client_type: user.raw_client_type,
        is_staff: user.is_staff,
        is_active: user.is_active
    });
    setEditModal(true);
  };

  // 💾 حفظ تعديلات المستخدم
  const handleSaveUser = async (e: React.FormEvent) => {
      e.preventDefault();
      setSaving(true);
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        await api.put(`/admin-dashboard/users/${editingUser.id}/`, editingUser, { headers: { Authorization: `Token ${token}` } });
        setEditModal(false);
        fetchUsers();
      } catch (error: any) { alert(error.response?.data?.error || "حدث خطأ"); }
      finally { setSaving(false); }
  };

  // 🚫 إيقاف / تفعيل المستخدم
  const toggleUserStatus = async (id: number, currentStatus: boolean) => {
      const confirmMsg = currentStatus ? "هل أنت متأكد من حظر هذا المستخدم؟ لن يتمكن من تسجيل الدخول." : "هل تريد رفع الحظر عن هذا المستخدم؟";
      if(!confirm(confirmMsg)) return;

      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        await api.delete(`/admin-dashboard/users/${id}/`, { headers: { Authorization: `Token ${token}` } });
        fetchUsers();
      } catch (error: any) { alert(error.response?.data?.error || "حدث خطأ"); }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="w-10 h-10 animate-spin text-blue-500" /></div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* الهيدر */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg"><Users className="w-6 h-6 text-blue-600" /></div>
            <h2 className="text-2xl font-black text-slate-800">إدارة المستخدمين</h2>
            <span className="bg-slate-200 text-slate-700 px-3 py-1 rounded-full text-sm font-bold">{users.length}</span>
        </div>
        <button onClick={() => setBroadcastModal(true)} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-amber-500 hover:text-slate-900 transition-colors shadow-md flex items-center gap-2">
          <BellRing className="w-5 h-5"/> إشعار للكل
        </button>
      </div>

      {/* جدول المستخدمين */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="p-4 font-black text-slate-500 text-sm">المستخدم</th>
                <th className="p-4 font-black text-slate-500 text-sm">الهاتف</th>
                <th className="p-4 font-black text-slate-500 text-sm">الصلاحية</th>
                <th className="p-4 font-black text-slate-500 text-sm">الحالة</th>
                <th className="p-4 font-black text-slate-500 text-sm text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id} className={`hover:bg-slate-50/50 transition-colors ${!user.is_active ? 'opacity-50 bg-red-50/20' : ''}`}>
                  <td className="p-4 font-bold text-slate-800 flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${user.is_active ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}>
                          {user.name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                          <span>{user.name}</span>
                          <span className="text-[10px] text-slate-400 font-medium">تسجيل: {user.date_joined}</span>
                      </div>
                  </td>
                  <td className="p-4 font-bold text-sm text-slate-600 dir-ltr text-right">{user.phone}</td>
                  <td className="p-4">
                      <div className="flex gap-2">
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1"><UserCheck className="w-3 h-3"/> {user.user_type}</span>
                          {user.is_staff && <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> أدمن</span>}
                      </div>
                  </td>
                  <td className="p-4">
                      {user.is_active ? 
                        <span className="text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md text-xs font-bold flex w-max items-center gap-1"><CheckCircle className="w-3 h-3"/> نشط</span> : 
                        <span className="text-red-500 bg-red-50 px-2 py-1 rounded-md text-xs font-bold flex w-max items-center gap-1"><Ban className="w-3 h-3"/> محظور</span>
                      }
                  </td>
                  <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                          <button onClick={() => openEditModal(user)} className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition" title="تعديل والصلاحيات"><Edit className="w-4 h-4"/></button>
                          <button onClick={() => toggleUserStatus(user.id, user.is_active)} className={`p-2 rounded-lg transition ${user.is_active ? 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'}`} title={user.is_active ? "حظر المستخدم" : "فك الحظر"}>
                              {user.is_active ? <Ban className="w-4 h-4"/> : <CheckCircle className="w-4 h-4"/>}
                          </button>
                      </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🔴 Modal تعديل المستخدم (لوحة التحكم النووية) */}
      {editModal && editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <h3 className="font-black text-xl text-slate-800 mb-6 border-b pb-4">تعديل بيانات وصلاحيات المستخدم</h3>
            
            <form onSubmit={handleSaveUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">الاسم الأول</label>
                      <input type="text" value={editingUser.first_name} onChange={(e) => setEditingUser({...editingUser, first_name: e.target.value})} className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 font-bold outline-none focus:border-blue-500" />
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">الاسم الأخير</label>
                      <input type="text" value={editingUser.last_name} onChange={(e) => setEditingUser({...editingUser, last_name: e.target.value})} className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 font-bold outline-none focus:border-blue-500" />
                  </div>
              </div>

              <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">رقم الهاتف</label>
                  <input dir="ltr" type="text" value={editingUser.phone} onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})} className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 font-bold outline-none focus:border-blue-500 text-right" />
              </div>

              <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">نوع الحساب</label>
                  <select value={editingUser.client_type} onChange={(e) => setEditingUser({...editingUser, client_type: e.target.value})} className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 font-bold outline-none focus:border-blue-500 bg-gray-50">
                      <option value="Buyer">مشترِي</option>
                      <option value="Seller">بائع/مالك</option>
                      <option value="Investor">مستثمر</option>
                      <option value="Marketer">مسوق/سمسار</option>
                  </select>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 mt-4">
                  <h4 className="font-black text-sm text-slate-800 border-b pb-2">الصلاحيات والحالة</h4>
                  
                  <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={editingUser.is_staff} onChange={(e) => setEditingUser({...editingUser, is_staff: e.target.checked})} className="w-5 h-5 accent-amber-500 rounded" />
                      <span className="font-bold text-slate-700 text-sm">ترقية إلى أدمن (مدير للموقع)</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={editingUser.is_active} onChange={(e) => setEditingUser({...editingUser, is_active: e.target.checked})} className="w-5 h-5 accent-blue-500 rounded" />
                      <span className="font-bold text-slate-700 text-sm">الحساب نشط (إلغاء التحديد لحظر المستخدم)</span>
                  </label>
              </div>

              <div className="flex gap-3 pt-6">
                <button type="button" onClick={() => setEditModal(false)} className="flex-1 py-3 bg-gray-100 text-slate-600 font-bold rounded-xl hover:bg-gray-200 transition">إلغاء</button>
                <button type="submit" disabled={saving} className="flex-[2] py-3 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition shadow-md flex justify-center items-center gap-2">
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "حفظ التعديلات"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🔴 Modal الإشعارات (الموجودة مسبقاً) */}
      {broadcastModal && (
          // ... (نفس كود شاشة الإشعارات اللي فاتت بالضبط)
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
             <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
               <h3 className="font-black text-xl text-slate-800 mb-2 flex items-center gap-2"><BellRing className="w-6 h-6 text-amber-500"/> إرسال إشعار جماعي</h3>
               <form onSubmit={handleSendBroadcast} className="space-y-4">
                 <div>
                     <label className="block text-xs font-bold text-slate-600 mb-1">الفئة المستهدفة</label>
                     <select value={notification.target} onChange={(e) => setNotification({...notification, target: e.target.value})} className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 font-bold outline-none focus:border-blue-500 bg-gray-50">
                         <option value="all">الجميع</option>
                         <option value="Broker">السماسرة والملاك</option>
                         <option value="Client">المشترين والمستثمرين</option>
                     </select>
                 </div>
                 <div>
                     <label className="block text-xs font-bold text-slate-600 mb-1">عنوان الإشعار</label>
                     <input required type="text" value={notification.title} onChange={(e) => setNotification({...notification, title: e.target.value})} className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 font-bold outline-none focus:border-blue-500" />
                 </div>
                 <div>
                     <label className="block text-xs font-bold text-slate-600 mb-1">الرسالة</label>
                     <textarea required rows={3} value={notification.message} onChange={(e) => setNotification({...notification, message: e.target.value})} className="w-full p-4 rounded-xl border-2 border-slate-200 font-bold outline-none focus:border-blue-500 resize-none"></textarea>
                 </div>
                 <div className="flex gap-3 pt-4">
                   <button type="button" onClick={() => setBroadcastModal(false)} className="flex-1 py-3 bg-gray-100 text-slate-600 font-bold rounded-xl hover:bg-gray-200 transition">إلغاء</button>
                   <button type="submit" disabled={sending} className="flex-[2] py-3 bg-amber-500 text-slate-900 font-black rounded-xl hover:bg-amber-600 transition shadow-md flex justify-center items-center gap-2">
                     {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4"/> إرسال الآن</>}
                   </button>
                 </div>
               </form>
             </div>
          </div>
      )}

    </div>
  );
}