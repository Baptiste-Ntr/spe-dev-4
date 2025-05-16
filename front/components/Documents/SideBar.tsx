'use client'

import { Mic, Plus } from "lucide-react"
import { Button } from "../ui/button"
import { Separator } from "../ui/separator"
import { Avatar, AvatarFallback } from "../ui/avatar"
import { useState, useEffect, useContext } from "react"
import { User, Document } from "@/types/model"
import { Dialog, DialogTrigger } from "../ui/dialog"
import { InvitationModal } from "./invitationModal"
import { CallModal } from "./callModal"
import { fetcher } from "@/services/api"
import { ScrollArea } from "../ui/scroll-area"
import { Badge } from "../ui/badge"
import { Clock } from "lucide-react"
import { AuthContext } from "@/context/AuthContext"

interface SideBarProps {
    showCollaborators: boolean
    document: Document | null
    activeCollaborators: string[]
}

export const SideBar = ({ showCollaborators, document, activeCollaborators }: SideBarProps) => {
    const [collaborators, setCollaborators] = useState<User[]>([])
    const [pendingInvitations, setPendingInvitations] = useState<Array<{
        id: string;
        invitedTo: User;
        createdAt: Date;
    }>>([])
    const [isInvitationModalOpen, setIsInvitationModalOpen] = useState(false)
    const [isCallModalOpen, setIsCallModalOpen] = useState(false)
    const { user } = useContext(AuthContext) as { user: User | null }

    useEffect(() => {
        const fetchCollaborators = async () => {
            try {
                const data = await fetcher(`/documents/${document?.id}/collaborators`, {
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    }
                })

                // S'assurer que l'utilisateur courant est dans la liste
                const allCollaborators = data.activeCollaborators || []
                if (user && !allCollaborators.some((c: User) => c.id === user.id)) {
                    allCollaborators.push(user)
                }

                setCollaborators(allCollaborators)
                setPendingInvitations(data.pendingInvitations)
            } catch (error) {
                console.error("Erreur lors du chargement des collaborateurs:", error)
            }
        }

        if (showCollaborators && document?.id) {
            fetchCollaborators()
            const interval = setInterval(fetchCollaborators, 30000)
            return () => clearInterval(interval)
        }
    }, [document?.id, showCollaborators, user])

    if (!showCollaborators || !document) return null

    // Filtrer les collaborateurs actifs et inactifs
    const activeUsers = collaborators.filter(collaborator =>
        collaborator.id && (collaborator.active || activeCollaborators.includes(collaborator.id))
    )
    const inactiveUsers = collaborators.filter(collaborator =>
        collaborator.id && !collaborator.active && !activeCollaborators.includes(collaborator.id)
    )

    return (
        <div className="h-screen border-l bg-background p-4 md:w-64">
            <div className="flex items-center justify-between">
                <h3 className="font-medium">Collaborateurs</h3>
                <div className="flex gap-2">
                    <Dialog open={isInvitationModalOpen} onOpenChange={setIsInvitationModalOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="icon" className="h-8 w-8">
                                <Plus className="h-4 w-4" />
                                <span className="sr-only">Inviter un collaborateur</span>
                            </Button>
                        </DialogTrigger>
                        <InvitationModal
                            open={isInvitationModalOpen}
                            onOpenChange={setIsInvitationModalOpen}
                            documentTitle={document.title}
                            documentId={document.id}
                        />
                    </Dialog>
                    <Dialog open={isCallModalOpen} onOpenChange={setIsCallModalOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" size="icon" className="h-8 w-8">
                                <Mic className="h-4 w-4" />
                                <span className="sr-only">Démarrer un appel audio</span>
                            </Button>
                        </DialogTrigger>
                        <CallModal
                            open={isCallModalOpen}
                            onOpenChange={setIsCallModalOpen}
                            documentTitle={document.title}
                            collaborators={collaborators}
                        />
                    </Dialog>
                </div>
            </div>
            <Separator className="my-4" />
            <ScrollArea className="h-[calc(100vh-100px)]">
                <div className="space-y-6">
                    {/* Collaborateurs actifs */}
                    <div>
                        <h4 className="text-sm font-medium mb-2">En ligne ({activeUsers.length})</h4>
                        <div className="space-y-2">
                            {activeUsers.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Aucun collaborateur actif</p>
                            ) : (
                                activeUsers.map((collaborator) => (
                                    <div key={collaborator.id} className="flex items-center space-x-3">
                                        <div className="relative">
                                            <Avatar>
                                                <AvatarFallback>
                                                    {`${collaborator.firstName?.[0]}${collaborator.lastName?.[0]}` || 'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-background" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{`${collaborator.firstName} ${collaborator.lastName}`}</p>
                                            <p className="text-xs text-muted-foreground">{collaborator.email}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Collaborateurs inactifs */}
                    {inactiveUsers.length > 0 && (
                        <div>
                            <h4 className="text-sm font-medium mb-2">Hors ligne ({inactiveUsers.length})</h4>
                            <div className="space-y-2">
                                {inactiveUsers.map((collaborator) => (
                                    <div key={collaborator.id} className="flex items-center space-x-3">
                                        <div className="relative">
                                            <Avatar>
                                                <AvatarFallback>
                                                    {`${collaborator.firstName?.[0]}${collaborator.lastName?.[0]}` || 'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-gray-500 ring-2 ring-background" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{`${collaborator.firstName} ${collaborator.lastName}`}</p>
                                            <p className="text-xs text-muted-foreground">{collaborator.email}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Invitations en attente */}
                    {pendingInvitations.length > 0 && (
                        <div>
                            <h4 className="text-sm font-medium mb-2">Invitations en attente</h4>
                            <div className="space-y-2">
                                {pendingInvitations.map((invitation) => (
                                    <div key={invitation.id} className="flex items-center gap-2">
                                        <Avatar>
                                            <AvatarFallback>
                                                {`${invitation.invitedTo?.firstName?.[0]}${invitation.invitedTo?.lastName?.[0]}`}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">{`${invitation.invitedTo.firstName} ${invitation.invitedTo.lastName}`}</p>
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-3 w-3 text-muted-foreground" />
                                                <p className="text-xs text-muted-foreground">
                                                    Invité le {new Date(invitation.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant="secondary">En attente</Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}