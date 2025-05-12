'use client'

import { fetcher } from "@/lib/fetcher";
import { createContext, useEffect, useState } from "react";

type AuthContextType = {
    user: unknown;
    isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetcher("/api/auth/me", {
                    credentials: "include"
                })
                if (res.ok) {
                    const data = await res.json()
                    setUser(data)
                } else {
                    setUser(null)
                }
            } catch (error) {
                console.error("Error checking authentication:", error)
                setUser(null)
            } finally {
                setIsLoading(false)
            }
        }
        checkAuth()
    }, [])

    return (
        <AuthContext.Provider value={{ user, isLoading }}>
            {children}
        </AuthContext.Provider>
    )
}
