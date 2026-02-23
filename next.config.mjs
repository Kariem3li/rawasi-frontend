import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. حل مشكلة انهيار السيرفر (WorkerError)
  experimental: {
    webpackBuildWorker: false,
  },
  
  // 2. إسكات تحذير الـ Turbopack زي ما الإيرور طلب
  turbopack: {},

  // إعدادات الصور بتاعتنا زي ما هي
  images: {
    unoptimized: true,
    remotePatterns: [
        { protocol: 'https', hostname: 'rawasi-project-v5-production.up.railway.app' }, 
        { protocol: 'https', hostname: 'res.cloudinary.com' }, 
        { protocol: 'https', hostname: 'placehold.co' }, 
        { protocol: 'http', hostname: '192.168.1.8' },      
        { protocol: 'http', hostname: 'localhost' },        
        { protocol: 'http', hostname: '127.0.0.1' },        
    ],
  },
};

export default withPWA(nextConfig);