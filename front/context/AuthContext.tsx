'use client'

import { fetcher } from "@/services/api";
import { createContext, useEffect, useState } from "react";
import { User } from "@/types/model";

type AuthContextType = {
    user: User | null;
    isLoading: boolean;
    refreshUser: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
    refreshUser: async () => {}
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshUser = async () => {
        try {
            setIsLoading(true);
            const data = await fetcher("/api/user/me", {
                credentials: "include"
            });
            setUser(data);
        } catch (error) {
            console.error("Error refreshing authentication:", error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refreshUser();
    }, []);

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
        <AuthContext.Provider value={{ user, isLoading, refreshUser }}>
            {children}
        </AuthContext.Provider>
    )
}
