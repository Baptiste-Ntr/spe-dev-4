"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { fetcher } from "@/services/api"
import { Notification, NotificationContextType } from "@/types/model"
import { AuthContext } from "./AuthContext"

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const { user } = useContext(AuthContext)

    const refreshNotifications = async () => {
        if (!user?.id) return

        try {
            const notificationsData = await fetcher(`/notifications`, {
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                }
            })

            // Filtrer les notifications pour ne garder que celles destinées à l'utilisateur actuel
            const userNotifications = notificationsData
                .filter((n: Notification) => n.userId === user.id)
                .map((n: Notification) => ({
                    ...n,
                    timestamp: new Date(n.timestamp)
                }))

            setNotifications(userNotifications)
            setUnreadCount(userNotifications.filter((n: Notification) => !n.read).length)
        } catch (error) {
            console.error("Erreur lors du chargement des notifications:", error)
        }
    }

    useEffect(() => {
        if (user?.id) {
            refreshNotifications()
            // Rafraîchir les notifications toutes les 30 secondes
            const interval = setInterval(refreshNotifications, 30000)
            return () => clearInterval(interval)
        }
    }, [user?.id])

    const markAsRead = async (id: string) => {
        try {
            await fetcher(`/notifications/${id}/read`, {
                method: "PATCH",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                }
            })
            setNotifications(notifications.map(n =>
                n.id === id ? { ...n, read: true } : n
            ))
            setUnreadCount(prev => Math.max(0, prev - 1))
        } catch (error) {
            console.error("Erreur lors du marquage de la notification:", error)
        }
    }

    const markAllAsRead = async () => {
        try {
            await fetcher(`/notifications/read-all`, {
                method: "PATCH",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                }
            })
            setNotifications(notifications.map(n => ({ ...n, read: true })))
            setUnreadCount(0)
        } catch (error) {
            console.error("Erreur lors du marquage de toutes les notifications:", error)
        }
    }

    const removeNotification = async (id: string) => {
        try {
            await fetcher(`/notifications/${id}`, {
                method: "DELETE",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                }
            })
            const notification = notifications.find(n => n.id === id)
            setNotifications(notifications.filter(n => n.id !== id))
            if (notification && !notification.read) {
                setUnreadCount(prev => Math.max(0, prev - 1))
            }
        } catch (error) {
            console.error("Erreur lors de la suppression de la notification:", error)
        }
    }

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                markAsRead,
                markAllAsRead,
                removeNotification,
                refreshNotifications
            }}
        >
            {children}
        </NotificationContext.Provider>
    )
}

export function useNotifications() {
    const context = useContext(NotificationContext)
    if (context === undefined) {
        throw new Error("useNotifications must be used within a NotificationProvider")
    }
    return context
} 