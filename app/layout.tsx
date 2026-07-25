import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google"; 
import "./globals.css";

import { AuthProvider } from "@/providers/AuthProvider"; 
import { VideoUploadProvider } from "@/components/VideoUploadContext"; 
import Navbar from "@/components/Navbar"; 

const cairo = Cairo({ 
  subsets: ["arabic"], 
  variable: "--font-cairo" 
});

export const viewport: Viewport = {
  themeColor: "#f59e0b", 
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://rawasi-project-v5-production.up.railway.app"),
  title: { 
    default: "رواسي للعقارات | الأفضل في العاشر من رمضان", 
    template: "%s | رواسي للعقارات" 
  },
  description: "منصة رواسي لشراء وبيع وإيجار العقارات في مدينة العاشر من رمضان ومصر. اكتشف شقق، فيلات، وأراضي بأفضل الأسعار.",
  manifest: "/manifest.json", // 🚀 السطر السحري اللي بيشغل التثبيت بالأيقونة بتاعتك
  openGraph: {
    type: "website", 
    locale: "ar_EG",
    siteName: "رواسي للعقارات",
    title: "رواسي للعقارات",
    description: "ابحث عن عقار أحلامك للبيع أو الإيجار بكل سهولة.",
  },
  twitter: { 
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.variable} font-sans bg-slate-50 text-slate-900`}>
        <AuthProvider>
          <VideoUploadProvider>
            <Navbar />
            {children}
          </VideoUploadProvider>
        </AuthProvider>
      </body>
    </html>
  );
}