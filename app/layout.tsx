import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { VideoUploadProvider } from "@/components/VideoUploadContext";
import InstallPrompt from '@/components/InstallPrompt';
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "رواسي للعقارات",
  description: "أفضل منصة عقارات",
  manifest: "/manifest.json", // 👈 السطر ده
  themeColor: "#2563eb",      // 👈 والسطر ده
};

export default function RootLayout({ children }) {
  return (
    <html lang="en"dir="rtl">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <VideoUploadProvider>
        {children}
        <InstallPrompt /> {/* هيفضل يراقب في الخلفية ويظهر وقت اللزوم */}
        </VideoUploadProvider>
      </body>
    </html>
  );
}
