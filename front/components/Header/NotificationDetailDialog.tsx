"use client"

import { Notification } from "@/types/model"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, CheckCircle2, XCircle, Check } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useNotifications } from "@/context/NotificationContext"

interface NotificationDetailDialogProps {
    notifications: Notification[]
    unreadCount: number
    onAccept: (notification: Notification) => void
    onDecline: (notification: Notification) => void
}

export function NotificationDetailDialog({
    notifications,
    unreadCount,
    onAccept,
    onDecline,
}: NotificationDetailDialogProps) {
    const { markAsRead } = useNotifications()

    const formatTimestamp = (date: Date) => {
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMins / 60)
        const diffDays = Math.floor(diffHours / 24)

        if (diffMins < 1) return "À l'instant"
        if (diffMins < 60) return `Il y a ${diffMins} minutes`
        if (diffHours < 24) return `Il y a ${diffHours} heures`
        if (diffDays < 7) return `Il y a ${diffDays} jours`

        return date.toLocaleDateString()
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                            {unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            Aucune notification
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <div key={notification.id} className="p-2">
                                <div className="flex items-start gap-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={notification.senderAvatar || "/placeholder.svg"} alt={notification.senderName} />
                                        <AvatarFallback>
                                            {notification.senderName.split(" ").map((n) => n[0]).join("")}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="text-sm font-medium">{notification.title}</p>
                                            {!notification.read && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={() => markAsRead(notification.id)}
                                                >
                                                    <Check className="h-4 w-4 text-muted-foreground" />
                                                </Button>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground">{notification.message}</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-muted-foreground">
                                                {formatTimestamp(notification.timestamp)}
                                            </span>
                                            {notification.type === "INVITATION" && !notification.message.includes("accepté") && !notification.message.includes("refusé") && (
                                                <div className="flex gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6"
                                                        onClick={() => onAccept(notification)}
                                                    >
                                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6"
                                                        onClick={() => onDecline(notification)}
                                                    >
                                                        <XCircle className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <Separator className="mt-2" />
                            </div>
                        ))
                    )}
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    )
} 