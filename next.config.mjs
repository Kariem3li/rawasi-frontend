import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development", // عشان ميزعجكيش وإنتي بتكتبي كود
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        unoptimized: true,
        remotePatterns: [
            { protocol: 'https', hostname: 'rawasi-project-v5-production.up.railway.app' }, // سيرفر الباك إند الحي
            { protocol: 'https', hostname: 'res.cloudinary.com' }, // سيرفر الصور السحابي
            { protocol: 'http', hostname: '192.168.1.8' },      // الموبايل/الشبكة المحلية
            { protocol: 'http', hostname: 'localhost' },        // اللاب توب
            { protocol: 'http', hostname: '127.0.0.1' },        // اللاب توب
        ],
    },
};

export default withPWA(nextConfig);