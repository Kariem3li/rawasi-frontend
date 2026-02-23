"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import api from "@/lib/axios"; 

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    // ✅ التحقق من التوكن في المكانين (Local & Session)
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) return;

    try {
      const res = await api.get('/auth/notifications/');
      const data = res.data;
      const list = Array.isArray(data) ? data : data.results || [];
      setNotifications(list);
      const count = list.filter((n: any) => n.is_read === false).length;
      setUnreadCount(count);
    } catch (err) { 
        console.error("Error fetching notifications");
    }
  }, []);

  // جلب الإشعارات أول مرة، ثم كل 30 ثانية
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); 
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // إغلاق القائمة عند الضغط خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllRead = async () => {
    if (unreadCount === 0) return;
    
    setIsFetching(true);
    // ✅ التحديث اللحظي للواجهة (Optimistic Update)
    const oldCount = unreadCount;
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({...n, is_read: true})));

    try {
        await api.post('/auth/notifications/mark_all_read/');
    } catch (e) {
        setUnreadCount(oldCount); // إرجاع الرقم لو فشل الطلب
    } finally {
        setIsFetching(false);
    }
  };

  const toggleMenu = () => {
    if (!isOpen) {
        setIsOpen(true);
        // اختياري: لو حابب تعلمهم كمقروء بمجرد ما يفتح القائمة (شغّلها لو تحب)
        // if (unreadCount > 0) markAllRead();
    } else {
        setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 🔔 زر الجرس */}
      <button 
        onClick={toggleMenu} 
        className={`relative p-2.5 rounded-full transition-all duration-300 border group outline-none focus:ring-2 focus:ring-amber-500/50 ${isOpen ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-gray-50/80 hover:bg-gray-100 text-slate-700 border-transparent hover:border-gray-200'}`}
      >
        <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse shadow-sm"></span>
        )}
      </button>

      {/* 📜 قائمة الإشعارات */}
      {isOpen && (
        <div className="fixed inset-x-4 top-[80px] z-[999] sm:absolute sm:inset-auto sm:left-0 sm:right-auto sm:top-full sm:mt-4 sm:w-[400px] bg-white rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden animate-in slide-in-from-top-4 fade-in duration-200 origin-top">
          
          <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-slate-50/50 backdrop-blur-sm relative z-10">
            <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                الإشعارات 
                {unreadCount > 0 && (
                    <span className="px-2.5 py-0.5 bg-amber-500 text-white text-[10px] rounded-full shadow-sm">{unreadCount} جديد</span>
                )}
            </h3>
            {unreadCount > 0 && (
                <button onClick={markAllRead} disabled={isFetching} className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer transition-colors font-bold bg-blue-50/50 px-3 py-1.5 rounded-lg hover:bg-blue-100 disabled:opacity-50">
                    {isFetching ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : <CheckCheck className="w-3.5 h-3.5" />} 
                    تحديد كمقروء
                </button>
            )}
          </div>
          
          <div className="max-h-[60vh] sm:max-h-[400px] overflow-y-auto custom-scrollbar bg-white p-2">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div key={notif.id} className={`p-4 mb-2 rounded-2xl transition-all duration-300 flex gap-4 group cursor-default border ${!notif.is_read ? 'bg-amber-50/40 border-amber-100/50' : 'bg-white border-transparent hover:bg-gray-50'}`}>
                   
                   <div className={`w-2.5 h-2.5 mt-1.5 rounded-full shrink-0 transition-colors ${!notif.is_read ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.6)]' : 'bg-gray-200 group-hover:bg-gray-300'}`}></div>
                   
                   <div className="flex-1">
                      <div className="flex justify-between items-start mb-1.5">
                          <h4 className={`text-sm font-black line-clamp-1 pl-2 ${!notif.is_read ? 'text-slate-900' : 'text-slate-600'}`}>{notif.title}</h4>
                          <span className="text-[10px] text-gray-400 whitespace-nowrap shrink-0 font-bold bg-gray-50 px-2 py-0.5 rounded-md" dir="rtl">
                              {/* تنسيق التاريخ للعربي */}
                              {new Date(notif.created_at).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}
                          </span>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 font-medium">{notif.message}</p>
                   </div>

                </div>
              ))
            ) : (
              <div className="py-16 flex flex-col items-center justify-center text-gray-300 gap-4">
                <div className="p-5 bg-gray-50 rounded-full shadow-inner border border-gray-100">
                    <Bell className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-sm font-bold text-gray-400">لا توجد إشعارات حالياً</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* خلفية للإغلاق في الموبايل */}
      {isOpen && (
          <div className="fixed inset-0 z-[998] bg-slate-900/20 backdrop-blur-sm sm:hidden animate-in fade-in" onClick={() => setIsOpen(false)}></div>
      )}
    </div>
  );
}