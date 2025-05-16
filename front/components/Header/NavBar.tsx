"use client"

import { useContext } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronDown, LogOut, Settings, Shield, User } from "lucide-react"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AuthContext } from "@/context/AuthContext"
import { User as UserType, NotificationContextType, Notification } from "@/types/model"
import { toast } from "sonner"
import { fetcher } from "@/services/api"
import { EditForm } from "./Profile/editForm"
import { TwoFactor } from "./2FA/TwoFactor"
import { NotificationContext } from "@/context/NotificationContext"
import { NotificationDetailDialog } from "./NotificationDetailDialog"

export function Navbar() {
    const router = useRouter()
    const { notifications, unreadCount, refreshNotifications } = useContext(NotificationContext) as NotificationContextType

    const handleLogout = async () => {
        try {
            const response = await fetcher("/auth/logout", {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                }
            })
            if (response) {
                toast.success("Déconnexion réussie")
                router.push("/")
            }
        } catch (error) {
            console.error("Erreur lors de la déconnexion:", error)
            toast.error("Erreur lors de la déconnexion")
        }
    }

    const handleAcceptNotification = async (notification: Notification) => {
        if (!notification.token) {
            toast.error("Token d'invitation manquant")
            return
        }

        try {
            await fetcher(`/invitation/${notification.token}/accept`, {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                }
            })
            toast.success("Invitation acceptée")
            refreshNotifications()
        } catch (error) {
            console.error("Erreur lors de l'acceptation:", error)
            toast.error("Erreur lors de l'acceptation")
        }
    }

    const handleDeclineNotification = async (notification: Notification) => {
        if (!notification.token) {
            toast.error("Token d'invitation manquant")
            return
        }

        try {
            await fetcher(`/invitation/${notification.token}/decline`, {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                }
            })
            toast.success("Invitation refusée")
            refreshNotifications()
        } catch (error) {
            console.error("Erreur lors du refus:", error)
            toast.error("Erreur lors du refus")
        }
    }

    const { user } = useContext(AuthContext) as { user: UserType | null }

    return (
        <header className="sticky top-0 z-50 border-b bg-background">
            <div className="flex h-16 items-center justify-between px-4 md:px-6">
                <div className="flex items-center gap-2">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Logo" />
                            <AvatarFallback>DC</AvatarFallback>
                        </Avatar>
                        <span className="hidden font-bold md:inline-block">DocCollab</span>
                    </Link>
                </div>
                <div className="flex items-center gap-4">
                    <NotificationDetailDialog
                        notifications={notifications}
                        unreadCount={unreadCount}
                        onAccept={handleAcceptNotification}
                        onDecline={handleDeclineNotification}
                    />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                                    <AvatarFallback>{user?.firstName?.charAt(0) || ""}{user?.lastName?.charAt(0) || ""}</AvatarFallback>
                                </Avatar>
                                <span className="hidden md:inline-block">{user?.firstName} {user?.lastName}</span>
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <User className="mr-2 h-4 w-4" />
                                    <EditForm
                                        userId={user?.id || ""}
                                        defaultUserEmail={user?.email || ""}
                                        defaultUserFirstName={user?.firstName || ""}
                                        defaultUserLastName={user?.lastName || ""}
                                    />
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Settings className="mr-2 h-4 w-4" />
                                    <TwoFactor />
                                </DropdownMenuItem>
                                {user?.role === "ADMIN" && (
                                    <DropdownMenuItem onClick={() => router.push("/admin")}>
                                        <Shield className="mr-2 h-4 w-4" />
                                        <span>Panneau d&apos;administration</span>
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout}>
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Déconnexion</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    )
}