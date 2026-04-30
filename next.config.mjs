/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "kariem.pythonanywhere.com" },
      { protocol: "https", hostname: "placehold.co" },
      ...(process.env.NODE_ENV === "development" ? [
        { protocol: "http", hostname: "localhost" },
        { protocol: "http", hostname: "127.0.0.1" },
        { protocol: "http", hostname: "192.168.1.5" }, 
      ] : []),
    ],
    // 🚀 ضروري للموبايل
    unoptimized: process.env.NODE_ENV === "development",
  },
  experimental: {
    webpackBuildWorker: false,
    ...(process.env.NODE_ENV === "development" ? {
      // 🚀 ضروري للموبايل
      allowedDevOrigins: [
        "192.168.1.5:3000", 
        "localhost:3000"
      ],
    } : {})
  }
};

export default nextConfig;