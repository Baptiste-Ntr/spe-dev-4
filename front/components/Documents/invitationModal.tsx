"use client"

import type React from "react"
import { useContext, useState, useRef, useEffect } from "react"
import { Loader2, Mail, Search, UserIcon, X } from "lucide-react"

import { User as UserType } from "@/types/model"
import { DialogDescription, DialogFooter } from "../ui/dialog"
import { DialogContent } from "../ui/dialog"
import { DialogHeader } from "../ui/dialog"
import { DialogTitle } from "../ui/dialog"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs"
import { ScrollArea } from "../ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Badge } from "../ui/badge"
import { toast } from "sonner"
import { fetcher } from "@/services/api"
import { AuthContext } from "@/context/AuthContext"

interface InvitationModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    documentTitle: string
    documentId: string
}

export const InvitationModal = ({ open, onOpenChange, documentTitle, documentId }: InvitationModalProps) => {
    const [searchQuery, setSearchQuery] = useState("")
    const [emailInput, setEmailInput] = useState("")
    const [selectedUsers, setSelectedUsers] = useState<UserType[]>([])
    const [searchResults, setSearchResults] = useState<UserType[]>([])
    const [allUsers, setAllUsers] = useState<UserType[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [activeTab, setActiveTab] = useState("search")
    const searchInputRef = useRef<HTMLInputElement>(null)
    const emailInputRef = useRef<HTMLInputElement>(null)

    const { user } = useContext(AuthContext) as { user: UserType | null }

    // Charger tous les utilisateurs au montage du composant
    useEffect(() => {
        const fetchAllUsers = async () => {
            try {
                const users = await fetcher(`/user`, {
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    }
                })
                setAllUsers(users)
            } catch (error) {
                console.error("Erreur lors du chargement des utilisateurs:", error)
                toast.error("Erreur lors du chargement des utilisateurs")
            }
        }

        if (open) {
            fetchAllUsers()
        }
    }, [open])

    // Recherche dans les utilisateurs locaux
    useEffect(() => {
        if (searchQuery.trim() === "") {
            setSearchResults([])
            return
        }

        const query = searchQuery.toLowerCase()
        const results = allUsers
            .filter(currentUser =>
                // Exclure l'utilisateur courant
                currentUser.id !== user?.id &&
                // Exclure les utilisateurs déjà sélectionnés
                !selectedUsers.some(selectedUser => selectedUser.id === currentUser.id) &&
                // Filtrer par la recherche
                (currentUser.firstName?.toLowerCase().includes(query) ||
                    currentUser.lastName?.toLowerCase().includes(query) ||
                    currentUser.email?.toLowerCase().includes(query))
            )
            .slice(0, 10) // Limiter à 10 résultats

        setSearchResults(results)
    }, [searchQuery, allUsers, selectedUsers, user?.id])

    // Focus the appropriate input when the modal opens
    useEffect(() => {
        if (open) {
            setTimeout(() => {
                if (activeTab === "search" && searchInputRef.current) {
                    searchInputRef.current.focus()
                } else if (activeTab === "email" && emailInputRef.current) {
                    emailInputRef.current.focus()
                }
            }, 100)
        }
    }, [open, activeTab])

    const handleSelectUser = (selectedUser: UserType) => {
        // Vérifier que ce n'est pas l'utilisateur courant
        if (selectedUser.id === user?.id) {
            toast.error("Vous ne pouvez pas vous inviter vous-même")
            return
        }

        if (!selectedUsers.some((u) => u.id === selectedUser.id)) {
            setSelectedUsers([...selectedUsers, selectedUser])
        }
        setSearchQuery("")
        setSearchResults([])
        if (searchInputRef.current) {
            searchInputRef.current.focus()
        }
    }

    const handleRemoveUser = (userId: string) => {
        setSelectedUsers(selectedUsers.filter((user) => user.id !== userId))
    }

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    const handleAddEmail = () => {
        if (!emailInput.trim() || !validateEmail(emailInput)) return

        // Check if this email already exists in our selected users
        if (selectedUsers.some((user) => user.email === emailInput)) {
            toast.error(`${emailInput} est déjà dans votre liste d'invitations.`)
            return
        }

        // Create a new user object for this email
        const newUser: UserType = {
            id: `email-${Date.now()}`,
            firstName: emailInput.split("@")[0],
            lastName: "",
            email: emailInput
        }

        setSelectedUsers([...selectedUsers, newUser])
        setEmailInput("")
        if (emailInputRef.current) {
            emailInputRef.current.focus()
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault()
            if (activeTab === "email" && emailInput) {
                handleAddEmail()
            }
        }
    }

    const handleSendInvitations = async () => {
        if (selectedUsers.length === 0) return

        setIsLoading(true)

        try {
            // Envoyer les invitations une par une
            const invitations = await Promise.all(
                selectedUsers.map(selectedUser =>
                    fetcher('/invitation', {
                        method: 'POST',
                        body: JSON.stringify({
                            documentId: documentId,
                            invitedById: user?.id,
                            invitedToId: selectedUser.id
                        }),
                        credentials: "include",
                        headers: {
                            "Content-Type": "application/json",
                            "Accept": "application/json"
                        }
                    })
                )
            )

            toast.success(`Invitations envoyées à ${selectedUsers.length} collaborateur${selectedUsers.length > 1 ? "s" : ""}`)
            setSelectedUsers([])
            setSearchQuery("")
            setEmailInput("")
            onOpenChange(false)
        } catch (error) {
            console.error(error)
            toast.error("Erreur lors de l'envoi des invitations")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
                <DialogTitle>Inviter des collaborateurs</DialogTitle>
                <DialogDescription>Inviter des personnes à collaborer sur &quot;{documentTitle}&quot;</DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="search" value={activeTab} onValueChange={setActiveTab} className="mt-2">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="search">Rechercher des utilisateurs</TabsTrigger>
                    <TabsTrigger value="email" disabled>Inviter par email</TabsTrigger>
                </TabsList>

                <TabsContent value="search" className="space-y-4 py-4">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            ref={searchInputRef}
                            type="search"
                            placeholder="Rechercher par nom, email ou ID..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {searchQuery && searchResults.length > 0 && (
                        <ScrollArea className="h-[200px] rounded-md border">
                            <div className="p-4">
                                <h4 className="mb-4 text-sm font-medium leading-none">Résultats de recherche</h4>
                                <div className="space-y-2">
                                    {searchResults.map((user) => (
                                        <div
                                            key={user.id}
                                            className="flex cursor-pointer items-center justify-between rounded-md p-2 hover:bg-muted"
                                            onClick={() => handleSelectUser(user)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src="/placeholder.svg" alt={`${user.firstName} ${user.lastName}`} />
                                                    <AvatarFallback>
                                                        {`${user?.firstName?.[0]}${user?.lastName?.[0]}`}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-sm font-medium">{`${user.firstName} ${user.lastName}`}</p>
                                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full p-0">
                                                <UserIcon className="h-4 w-4" />
                                                <span className="sr-only">Ajouter l&apos;utilisateur</span>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </ScrollArea>
                    )}

                    {searchQuery && searchResults.length === 0 && (
                        <div className="rounded-md border p-4 text-center">
                            <p className="text-sm text-muted-foreground">
                                {user?.id && allUsers.some(user => user.id === user?.id) &&
                                    searchQuery.toLowerCase() === `${user?.firstName?.toLowerCase()} ${user?.lastName?.toLowerCase()}`
                                    ? "Vous ne pouvez pas vous inviter vous-même"
                                    : selectedUsers.length > 0 && allUsers.some(user =>
                                        user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
                                    )
                                        ? "Cet utilisateur est déjà sélectionné"
                                        : `Aucun utilisateur trouvé pour "${searchQuery}"`}
                            </p>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="email" className="space-y-4 py-4">
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                ref={emailInputRef}
                                type="email"
                                placeholder="Entrer une adresse email..."
                                className="pl-8"
                                value={emailInput}
                                onChange={(e) => setEmailInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled
                            />
                        </div>
                        <Button
                            onClick={handleAddEmail}
                            disabled
                            className="shrink-0"
                        >
                            Ajouter
                        </Button>
                    </div>
                    <div className="text-xs text-muted-foreground">
                        Cette fonctionnalité sera bientôt disponible. Pour le moment, vous pouvez uniquement inviter des utilisateurs existants.
                    </div>
                </TabsContent>
            </Tabs>

            {selectedUsers.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-sm font-medium">Utilisateurs sélectionnés ({selectedUsers.length})</h4>
                    <div className="flex flex-wrap gap-2">
                        {selectedUsers.map((user) => (
                            <Badge key={user.id} variant="secondary" className="flex items-center gap-1">
                                <Avatar>
                                    <AvatarImage src="/placeholder.svg" alt={`${user.firstName} ${user.lastName}`} />
                                    <AvatarFallback>
                                        {`${user?.firstName?.[0]}${user?.lastName?.[0]}`}
                                    </AvatarFallback>
                                </Avatar>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-4 w-4 rounded-full p-0 hover:bg-transparent"
                                    onClick={() => handleRemoveUser(user.id ?? "")}
                                >
                                    <X className="h-3 w-3" />
                                    <span className="sr-only">Supprimer {`${user.firstName} ${user.lastName}`}</span>
                                </Button>
                            </Badge>
                        ))}
                    </div>
                </div>
            )}

            <DialogFooter className="flex items-center justify-between sm:justify-between">
                <div className="text-sm text-muted-foreground">
                    {selectedUsers.length > 0
                        ? `${selectedUsers.length} utilisateur${selectedUsers.length > 1 ? "s" : ""} sélectionné${selectedUsers.length > 1 ? "s" : ""}`
                        : "Aucun utilisateur sélectionné"}
                </div>
                <Button onClick={handleSendInvitations} disabled={selectedUsers.length === 0 || isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Envoi en cours...
                        </>
                    ) : (
                        <>
                            <Mail className="mr-2 h-4 w-4" />
                            Envoyer les invitations
                        </>
                    )}
                </Button>
            </DialogFooter>
        </DialogContent>
    )
}