"use client"

import { useContext, useState, useEffect } from "react"
import { Phone, PhoneOff, Loader2 } from "lucide-react"
import { User } from "@/types/model"
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog"
import { Button } from "../ui/button"
import { ScrollArea } from "../ui/scroll-area"
import { Avatar, AvatarFallback } from "../ui/avatar"
import { Badge } from "../ui/badge"
import { toast } from "sonner"
import { AuthContext } from "@/context/AuthContext"
import { useCallStore } from "@/services/callService"

interface CallModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    documentTitle: string
    collaborators: User[]
}

export const CallModal = ({ open, onOpenChange, documentTitle, collaborators }: CallModalProps) => {
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [isCalling, setIsCalling] = useState(false)
    const [isMounted, setIsMounted] = useState(false)
    const { user } = useContext(AuthContext) as { user: User | null }
    const { isCallActive, startCall, endCall, registerUser } = useCallStore()

    useEffect(() => {
        setIsMounted(true)
    }, [])

    useEffect(() => {
        if (open && user?.id) {
            registerUser(user.id, `${user.firstName} ${user.lastName}`)
        }
    }, [open, user, registerUser])

    const handleStartCall = async (targetUser: User) => {
        if (!targetUser.id) return

        setIsCalling(true)
        try {
            await startCall(targetUser.id)
            setSelectedUser(targetUser)
        } catch (error) {
            console.error("Erreur lors du démarrage de l'appel:", error)
            toast.error("Impossible de démarrer l'appel")
        } finally {
            setIsCalling(false)
        }
    }

    const handleEndCall = () => {
        endCall()
        setSelectedUser(null)
        onOpenChange(false)
    }

    // Filtrer l'utilisateur courant de la liste
    const availableCollaborators = collaborators.filter(
        collaborator => collaborator.id !== user?.id
    )

    if (!isMounted) {
        return null
    }

    return (
        <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
                <DialogTitle>Appel audio</DialogTitle>
                <DialogDescription>
                    Démarrer un appel audio avec un collaborateur de &quot;{documentTitle}&quot;
                </DialogDescription>
            </DialogHeader>

            <ScrollArea className="h-[300px] rounded-md border p-4">
                <div className="space-y-4">
                    {availableCollaborators.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center">
                            Aucun collaborateur disponible pour l&apos;appel
                        </p>
                    ) : (
                        availableCollaborators.map((collaborator) => (
                            <div
                                key={collaborator.id}
                                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted"
                            >
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarFallback>
                                            {`${collaborator.firstName?.[0]}${collaborator.lastName?.[0]}`}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium">
                                            {`${collaborator.firstName} ${collaborator.lastName}`}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {collaborator.email}
                                        </p>
                                    </div>
                                </div>
                                {selectedUser?.id === collaborator.id ? (
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={handleEndCall}
                                        className="flex items-center gap-2"
                                    >
                                        <PhoneOff className="h-4 w-4" />
                                        Terminer
                                    </Button>
                                ) : (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleStartCall(collaborator)}
                                        disabled={isCalling || isCallActive}
                                        className="flex items-center gap-2"
                                    >
                                        {isCalling && selectedUser?.id === collaborator.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Phone className="h-4 w-4" />
                                        )}
                                        Appeler
                                    </Button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>

            {isCallActive && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarFallback>
                                    {`${selectedUser?.firstName?.[0]}${selectedUser?.lastName?.[0]}`}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm font-medium">
                                    Appel en cours avec {selectedUser?.firstName} {selectedUser?.lastName}
                                </p>
                                <Badge variant="secondary" className="mt-1">
                                    En direct
                                </Badge>
                            </div>
                        </div>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleEndCall}
                            className="flex items-center gap-2"
                        >
                            <PhoneOff className="h-4 w-4" />
                            Terminer l&apos;appel
                        </Button>
                    </div>
                </div>
            )}
        </DialogContent>
    )
} 