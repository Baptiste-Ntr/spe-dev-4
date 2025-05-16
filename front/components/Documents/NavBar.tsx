'use client'

import { Loader2 } from "lucide-react"
import { ArrowLeft, CheckCircle2, Users } from "lucide-react"
import { Button } from "../ui/button"
import { Save, Share, Clock } from "lucide-react"
import { Input } from "../ui/input"
import { useState, useEffect, useContext } from "react"
import { useRouter } from "next/navigation"
import { fetcher } from "@/services/api"
import { AuthContext } from "@/context/AuthContext"
import { Document, User as UserType } from "@/types/model"

export const NavBar = ({
    document,
    title,
    setTitle,
    onSave,
    saveStatus,
    showCollaborators,
    setShowCollaborators
}: {
    document: Document,
    title: string,
    setTitle: (title: string) => void,
    onSave: () => Promise<void>,
    saveStatus: "saved" | "saving" | "unsaved",
    showCollaborators: boolean,
    setShowCollaborators: (show: boolean) => void
}) => {
    const router = useRouter()
    const [editedBy, setEditedBy] = useState<UserType | null>(null)
    const { user } = useContext(AuthContext) as { user: UserType }

    useEffect(() => {
        const getEditedBy = async () => {
            if (!document.updatedBy?.id) return
            const res = await fetcher(`/user/${document.updatedBy.id}`, {
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                }
            })
            if (res) {
                setEditedBy(res)
            }
        }
        getEditedBy()
    }, [document.updatedBy?.id])

    return (
        <div className="border-b bg-background p-4">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")} className="h-8 w-8">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Retour au tableau de bord</span>
                </Button>
                <div className="flex-1">
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="border-none bg-transparent px-0 text-lg font-medium focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                </div>
                <div className="flex items-center gap-2">
                    {saveStatus === "saving" && (
                        <div className="flex items-center text-sm text-muted-foreground">
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                            Sauvegarde...
                        </div>
                    )}
                    {saveStatus === "saved" && (
                        <div className="flex items-center text-sm text-muted-foreground">
                            <CheckCircle2 className="mr-1 h-3 w-3 text-green-500" />
                            Sauvegardé
                        </div>
                    )}
                    {saveStatus === "unsaved" && (
                        <Button variant="outline" size="sm" onClick={onSave}>
                            <Save className="mr-2 h-4 w-4" />
                            Sauvegarder
                        </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => setShowCollaborators(!showCollaborators)}>
                        <Users className="mr-2 h-4 w-4" />
                        {showCollaborators ? "Masquer" : "Afficher"} Collaborateurs
                    </Button>
                    <Button variant="outline" size="sm">
                        <Share className="mr-2 h-4 w-4" />
                        Partager
                    </Button>
                </div>
            </div>
            <div className="mt-2 flex items-center text-xs text-muted-foreground">
                <Clock className="mr-1 h-3 w-3" />
                {document.updatedAt && (
                    <>
                        Dernière modification le {new Date(document.updatedAt).toLocaleDateString()} à {new Date(document.updatedAt).toLocaleTimeString()}
                        {editedBy && (
                            <span className="ml-2">
                                par {editedBy.firstName} {editedBy.lastName}
                            </span>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}