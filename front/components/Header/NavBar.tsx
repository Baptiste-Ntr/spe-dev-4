"use client"

import { useContext, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Bell, ChevronDown, LogOut, Settings, Shield, User } from "lucide-react"

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
import { User as UserType } from "@/types/model"
import { toast } from "sonner"
import { fetcher } from "@/lib/fetcher"
import { EditForm } from "../Profile/editForm"
export function Navbar() {
    const router = useRouter()
    const [notifications, setNotifications] = useState(3)

    const handleLogout = async () => {
        try {
            const response = await fetcher("/api/auth/logout", {
                method: "GET",
                credentials: "include"
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

    const { user } = useContext(AuthContext) as { user: UserType | null }

    console.log(user)

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
                    <Button variant="outline" size="icon" className="relative">
                        <Bell className="h-5 w-5" />
                        {notifications > 0 && (
                            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                                {notifications}
                            </span>
                        )}
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                                    <AvatarFallback>JD</AvatarFallback>
                                </Avatar>
                                <span className="hidden md:inline-block">John Doe</span>
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
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
                                <DropdownMenuItem>
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Two-Factor Authentication</span>
                                </DropdownMenuItem>
                                {/* Admin link - would be conditionally rendered based on user role */}
                                {user?.role === "ADMIN" && (
                                    <DropdownMenuItem onClick={() => router.push("/admin")}>
                                        <Shield className="mr-2 h-4 w-4" />
                                        <span>Admin Panel</span>
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleLogout}>
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    )
}