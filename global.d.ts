// global.d.ts
declare module '*.css';
declare module '*.scss'; // لو بتستخدم Sass في المستقبل
// 🚀 السطور دي مخصوصة لمكتبة Swiper عشان TS يبطل يعترض
declare module 'swiper/css';
declare module 'swiper/css/pagination';
declare module 'swiper/css/navigation';
declare module 'swiper/css/*';
