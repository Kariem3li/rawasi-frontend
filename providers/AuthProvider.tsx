"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";

interface User {
    name: string;
    isStaff: boolean;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (token: string, name: string, isStaff: boolean, rememberMe: boolean) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    // حالة مبدئية عشان نمنع الـ Hydration Error
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        // أول ما الموقع يفتح، بنشيك لو في يوزر متسجل
        const token = Cookies.get("token") || localStorage.getItem("token") || sessionStorage.getItem("token");
        const savedName = localStorage.getItem("username");
        const isStaff = localStorage.getItem("is_staff") === "true";

        if (token && savedName) {
            setUser({ name: savedName, isStaff });
        }
    }, []);

    const login = (token: string, name: string, isStaff: boolean, rememberMe: boolean) => {
        // حفظ التوكن في الكوكيز للأمان (الباك إند بيحبه)
        Cookies.set("token", token, { 
            expires: rememberMe ? 30 : undefined, 
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        });

        // حفظ في اللوكال ستوريدج
        if (rememberMe) {
            localStorage.setItem("token", token);
            sessionStorage.removeItem("token");
        } else {
            sessionStorage.setItem("token", token);
            localStorage.removeItem("token");
        }

        localStorage.setItem("username", name);
        if (isStaff) localStorage.setItem("is_staff", "true");

        // 🚀 السحر هنا: تحديث الحالة اللحظية لكل الموقع
        setUser({ name, isStaff });
    };

    const logout = () => {
        Cookies.remove("token");
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("is_staff");
        setUser(null); // مسح اليوزر لحظياً
    };

    // تجنب مشاكل الـ SSR في Next.js
    if (!isMounted) return null;

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};