"use client";

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useState, useEffect } from "react";
import { Crosshair, Check, X, Loader2, MapPin } from "lucide-react";

// 1. إصلاح أيقونة Leaflet المختفية بتصميم محسن
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

// 2. مكون لتحريك الكاميرا بذكاء عند تغيير الموقع (طيران ناعم)
function ChangeView({ center }: { center: { lat: number, lng: number } }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
        map.flyTo(center, map.getZoom(), {
            duration: 1.5,
            easeLinearity: 0.25
        });
    }
  }, [center, map]);
  return null;
}

// 3. مكون النقر لتغيير مكان الدبوس
function LocationMarker({ position, setPosition }: any) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position ? <Marker position={position} icon={icon} /> : null;
}

interface MapPickerProps {
  onConfirm: (lat: string, lng: string) => void;
  onClose: () => void;
  initialLat?: string;
  initialLng?: string;
}

export default function MapPicker({ onConfirm, onClose, initialLat, initialLng }: MapPickerProps) {
  
  // 4. تحديد نقطة البداية (العاشر من رمضان)
  const defaultLocation = { lat: 30.3060, lng: 31.7376 }; 
  
  // تحديد الموقع بناءً على الإحداثيات الممررة أو الافتراضية
  const startPosition = (initialLat && initialLng && !isNaN(parseFloat(initialLat)))
    ? { lat: parseFloat(initialLat), lng: parseFloat(initialLng) }
    : defaultLocation;

  const [position, setPosition] = useState<any>(startPosition);
  const [loadingLoc, setLoadingLoc] = useState(false);

  // دالة تحديد الموقع الحالي (GPS)
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert("عذراً، متصفحك لا يدعم تحديد الموقع (GPS).");
      return;
    }
    
    setLoadingLoc(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setPosition(newPos);
        setLoadingLoc(false);
      },
      (err) => {
        alert("تعذر تحديد موقعك بدقة. يرجى التأكد من تفعيل الـ GPS والسماح للمتصفح بالوصول.");
        setLoadingLoc(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 } // إعدادات دقة عالية
    );
  };

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 isolate">
      {/* طبقة شفافة زجاجية كخلفية */}
      <div 
        className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose}
      />

      {/* المودال الرئيسي */}
      <div className="bg-white w-full max-w-2xl rounded-[2rem] overflow-hidden shadow-2xl flex flex-col h-[85vh] relative z-10 animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white z-10 shadow-sm dir-rtl relative">
           <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
             <div className="p-2 bg-amber-50 rounded-xl">
                 <MapPin className="w-5 h-5 text-amber-500" />
             </div>
             حدد موقع العقار
           </h3>
           <button onClick={onClose} className="p-2.5 bg-gray-50 hover:bg-red-50 text-gray-500 hover:text-red-500 rounded-full transition-colors active:scale-95">
             <X className="w-5 h-5" />
           </button>
        </div>

        {/* Map Body */}
        <div className="flex-1 relative bg-slate-100/50">
           {/* الخريطة */}
           <div className="absolute inset-0 h-full w-full">
             <MapContainer 
                 center={position} 
                 zoom={14} 
                 style={{ height: "100%", width: "100%", zIndex: 0 }}
                 zoomControl={false} // إخفاء أزرار الزوم الافتراضية
             >
                 <TileLayer 
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
                 />
                 <ChangeView center={position} /> 
                 <LocationMarker position={position} setPosition={setPosition} />
             </MapContainer>
           </div>

           {/* زرار GPS العائم (بتصميم فخم) */}
           <button 
             onClick={handleLocateMe}
             disabled={loadingLoc}
             className="absolute bottom-6 right-6 z-[400] w-14 h-14 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl flex items-center justify-center text-slate-700 hover:text-blue-600 hover:bg-white transition-all border border-white active:scale-95 group"
             title="الذهاب لموقعي الحالي"
           >
             {loadingLoc ? (
                 <Loader2 className="w-6 h-6 animate-spin text-blue-600"/>
             ) : (
                 <Crosshair className="w-6 h-6 group-hover:scale-110 transition-transform" />
             )}
           </button>

           {/* تلميح صغير فوق الخريطة */}
           <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg pointer-events-none">
               اسحب الخريطة واضغط لتغيير مكان الدبوس
           </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 bg-white z-10 flex flex-col sm:flex-row items-center gap-4 shadow-[0_-10px_30px_rgba(0,0,0,0.03)] dir-rtl">
           
           <div className="flex-1 text-center sm:text-right">
               <p className="text-xs text-gray-500 font-bold mb-1">الإحداثيات الحالية:</p>
               <p className="text-sm font-mono font-black text-slate-800 bg-gray-50 px-3 py-1.5 rounded-lg inline-block border border-gray-100 dir-ltr">
                   {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
               </p>
           </div>
           
           <button 
             onClick={() => onConfirm(position.lat.toString(), position.lng.toString())}
             className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 text-white rounded-xl font-black flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20 hover:bg-amber-500 hover:text-slate-900 transition-all active:scale-95"
           >
             <Check className="w-5 h-5" /> تأكيد واعتماد الموقع
           </button>
        </div>

      </div>
    </div>
  );
}