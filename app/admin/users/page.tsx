"use client";

import { useEffect, useState } from "react";
import { Loader2, Users, ShieldCheck, BellRing, Send, UserCheck, Calendar } from "lucide-react";
import api from "@/lib/axios";

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // حالة نافذة الإشعارات
  const [modalOpen, setModalOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [notification, setNotification] = useState({ title: "", message: "", target: "all" });

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

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notification.title || !notification.message) return alert("يرجى كتابة العنوان والرسالة!");
    
    setSending(true);
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await api.post('/admin-dashboard/broadcast/', notification, { headers: { Authorization: `Token ${token}` } });
      alert(`تم إرسال الإشعار بنجاح إلى ${res.data.count} مستخدم! 🎉`);
      setModalOpen(false);
      setNotification({ title: "", message: "", target: "all" });
    } catch (error) { alert("حدث خطأ أثناء الإرسال."); } 
    finally { setSending(false); }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="w-10 h-10 animate-spin text-amber-500" /></div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* الهيدر وزرار الإشعارات */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg"><Users className="w-6 h-6 text-blue-600" /></div>
            <h2 className="text-2xl font-black text-slate-800">المستخدمين والإشعارات</h2>
            <span className="bg-slate-200 text-slate-700 px-3 py-1 rounded-full text-sm font-bold">{users.length} مستخدم</span>
        </div>
        <button onClick={() => setModalOpen(true)} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-amber-500 hover:text-slate-900 transition-colors shadow-md flex items-center gap-2">
          <BellRing className="w-5 h-5"/> إرسال إشعار للكل
        </button>
      </div>

      {/* جدول المستخدمين */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="p-4 font-black text-slate-500 text-sm">المستخدم</th>
                <th className="p-4 font-black text-slate-500 text-sm">رقم الهاتف</th>
                <th className="p-4 font-black text-slate-500 text-sm">النوع والصلاحية</th>
                <th className="p-4 font-black text-slate-500 text-sm">تاريخ التسجيل</th>
                <th className="p-4 font-black text-slate-500 text-sm text-center">إعلاناته</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-bold text-slate-800 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xs">
                          {user.name.charAt(0)}
                      </div>
                      {user.name}
                  </td>
                  <td className="p-4 font-bold text-sm text-slate-600 dir-ltr text-right">{user.phone}</td>
                  <td className="p-4">
                      <div className="flex gap-2">
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1"><UserCheck className="w-3 h-3"/> {user.user_type}</span>
                          {user.is_staff && <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> أدمن</span>}
                      </div>
                  </td>
                  <td className="p-4 text-sm font-bold text-slate-500 flex items-center gap-1"><Calendar className="w-4 h-4"/> {user.date_joined}</td>
                  <td className="p-4 text-center">
                      <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-black">{user.listings_count}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🔴 Modal إرسال الإشعارات */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="font-black text-xl text-slate-800 mb-2 flex items-center gap-2"><BellRing className="w-6 h-6 text-amber-500"/> إرسال إشعار جماعي</h3>
            <p className="text-sm font-bold text-slate-500 mb-6">سيتم إرسال هذا الإشعار فوراً لتطبيق وموقع المستخدمين.</p>
            
            <form onSubmit={handleSendBroadcast} className="space-y-4">
              <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">الفئة المستهدفة</label>
                  <select value={notification.target} onChange={(e) => setNotification({...notification, target: e.target.value})} className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 font-bold outline-none focus:border-blue-500 bg-gray-50">
                      <option value="all">الجميع (سماسرة وعملاء)</option>
                      <option value="Broker">السماسرة والشركات فقط</option>
                      <option value="Client">العملاء والباحثين فقط</option>
                  </select>
              </div>
              <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">عنوان الإشعار (مثال: عرض جديد!)</label>
                  <input required type="text" value={notification.title} onChange={(e) => setNotification({...notification, title: e.target.value})} className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 font-bold outline-none focus:border-blue-500" />
              </div>
              <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">تفاصيل الرسالة</label>
                  <textarea required rows={3} value={notification.message} onChange={(e) => setNotification({...notification, message: e.target.value})} className="w-full p-4 rounded-xl border-2 border-slate-200 font-bold outline-none focus:border-blue-500 resize-none"></textarea>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-3 bg-gray-100 text-slate-600 font-bold rounded-xl hover:bg-gray-200 transition">إلغاء</button>
                <button type="submit" disabled={sending} className="flex-[2] py-3 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition shadow-md flex justify-center items-center gap-2">
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