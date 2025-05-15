'use client'

import { fetcher } from "@/services/api";
import { createContext, useEffect, useState } from "react";
import { User } from "@/types/model";

type AuthContextType = {
    user: User | null;
    isLoading: boolean;
};

export const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const data = await fetcher("/user/me", {
                    credentials: "include"
                })
                setUser(data)
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
