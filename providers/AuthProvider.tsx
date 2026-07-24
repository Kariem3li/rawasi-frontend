"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";

// 🚀 1. أضفنا الـ id لهيكل المستخدم عشان TypeScript يفهمه
interface User {
    id: string | number;
    name: string;
    isStaff: boolean;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    // 🚀 2. حدثنا دالة اللوجين عشان تستقبل الـ id كبراميتر ثاني
    login: (token: string, id: string | number, name: string, isStaff: boolean, rememberMe: boolean) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const token = Cookies.get("token") || localStorage.getItem("token") || sessionStorage.getItem("token");
        const savedName = localStorage.getItem("username");
        const savedId = localStorage.getItem("user_id"); // 🚀 3. بنقرأ الـ id من المتصفح
        const isStaff = localStorage.getItem("is_staff") === "true";

        if (token && savedName && savedId) {
            setUser({ id: savedId, name: savedName, isStaff });
        }
    }, []);

    const login = (token: string, id: string | number, name: string, isStaff: boolean, rememberMe: boolean) => {
        Cookies.set("token", token, { 
            expires: rememberMe ? 30 : undefined, 
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        });

        if (rememberMe) {
            localStorage.setItem("token", token);
            sessionStorage.removeItem("token");
        } else {
            sessionStorage.setItem("token", token);
            localStorage.removeItem("token");
        }

        localStorage.setItem("user_id", id.toString()); // 🚀 4. بنحفظ الـ id وقت اللوجين
        localStorage.setItem("username", name);
        if (isStaff) localStorage.setItem("is_staff", "true");

        setUser({ id, name, isStaff });
    };

    const logout = () => {
        Cookies.remove("token");
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        localStorage.removeItem("user_id"); // 🚀 5. بنمسحه وقت الخروج
        localStorage.removeItem("username");
        localStorage.removeItem("is_staff");
        setUser(null); 
    };

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