import React from 'react';

export const Logo = ({ className = "h-10 w-auto", isWhite = false }: { className?: string, isWhite?: boolean }) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      
      {/* SVG Icon */}
      <svg viewBox="0 0 100 120" className="h-full w-auto shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            {!isWhite && (
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" /> {/* اللون الكهرماني الفاتح amber-500 */}
                    <stop offset="100%" stopColor="#d97706" /> {/* اللون الكهرماني الغامق amber-600 */}
                </linearGradient>
            )}
        </defs>
        
        <path 
            d="M50 5 L93.3 30 V80 L50 105 L6.7 80 V30 L50 5Z" 
            stroke={isWhite ? "white" : "url(#logoGradient)"} 
            strokeWidth="7" 
            strokeLinejoin="round"
        />
        
        <path d="M50 90 V35 M30 80 V50 M70 80 V45" stroke={isWhite ? "white" : "url(#logoGradient)"} strokeWidth="5" strokeLinecap="round" />
        <path d="M50 35 L70 45 L70 80 M50 35 L30 50 L30 80" stroke={isWhite ? "white" : "url(#logoGradient)"} strokeWidth="4" fill="none" />
      </svg>

      {/* النصوص الجانبية */}
      <div className="flex flex-col justify-center mt-1"> 
        
        {/* اسم الشركة */}
        <span className={`font-black text-xl leading-none tracking-tight ${isWhite ? 'text-white' : 'text-slate-900'}`}>
          Rawasi
        </span>
        
        {/* التخصص - الحروف متباعدة (Premium Look) */}
        <span className={`text-[8px] md:text-[9px] font-bold tracking-[0.25em] uppercase mt-1 ${isWhite ? 'text-gray-300' : 'text-amber-600'}`}>
          REAL ESTATE
        </span>

      </div>
    </div>
  );
};