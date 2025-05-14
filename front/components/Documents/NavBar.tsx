import { Loader2 } from "lucide-react"
import { ArrowLeft, CheckCircle2, Users } from "lucide-react"
import Link from "next/link"
import { Button } from "../ui/button"
import { Save, Share, Clock } from "lucide-react"
import { Input } from "../ui/input"
import { useState, useEffect, useRef, useContext } from "react"
import { useRouter } from "next/navigation"
import { Document } from "@/app/documents/[id]/page"
import { fetcher } from "@/lib/fetcher"
import { toast } from "sonner"
import { AuthContext } from "@/context/AuthContext"
import { User as UserType } from "@/types/model"

export const NavBar = ({
    document,
    title,
    setTitle,
    onSave,
    saveStatus
}: {
    document: Document,
    title: string,
    setTitle: (title: string) => void,
    onSave: () => Promise<void>,
    saveStatus: "saved" | "saving" | "unsaved"
}) => {
    const router = useRouter()
    const [showCollaborators, setShowCollaborators] = useState(true)
    const [editedBy, setEditedBy] = useState<UserType | null>(null)

    const { user } = useContext(AuthContext) as { user: UserType }

    useEffect(() => {
        const getEditedBy = async () => {
            const res = await fetcher(`/api/user/${user?.id}`, {
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                }
            })
            if (res) {
                setEditedBy({ firstName: res.firstName, lastName: res.lastName })
            }
        }
        getEditedBy()
    }, [document.updatedById])

    return (
        <div className="border-b bg-background p-4">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")} className="h-8 w-8">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back to dashboard</span>
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
                Dernière modification le {new Date(document.updatedAt).toLocaleDateString()} à {new Date(document.updatedAt).toLocaleTimeString()}
                {editedBy && (
                    <span className="ml-2">
                        par {editedBy.firstName} {editedBy.lastName}
                    </span>
                )}
            </div>
        </div>
    )
}