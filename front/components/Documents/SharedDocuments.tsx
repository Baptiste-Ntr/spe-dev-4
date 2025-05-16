'use client'

import { useEffect, useState } from "react"
import { Document } from "@/types/model"
import { fetcher } from "@/services/api"
import { FileItem } from "./FileItem"
import { Separator } from "../ui/separator"
import { ScrollArea } from "../ui/scroll-area"

export const SharedDocuments = () => {
    const [sharedDocuments, setSharedDocuments] = useState<Document[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchSharedDocuments = async () => {
            try {
                const documents = await fetcher("/documents/shared", {
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    }
                })
                setSharedDocuments(documents)
            } catch (error) {
                console.error("Erreur lors du chargement des documents partagés:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchSharedDocuments()
    }, [])

    if (isLoading) {
        return <div className="p-4">Chargement des documents partagés...</div>
    }

    return (
        <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Documents partagés avec moi</h2>
            <Separator className="mb-4" />
            <ScrollArea className="h-[calc(100vh-200px)]">
                {sharedDocuments.length === 0 ? (
                    <div className="text-center text-muted-foreground py-4">
                        Aucun document partagé
                    </div>
                ) : (
                    <div className="space-y-2">
                        {sharedDocuments.map((doc) => (
                            <FileItem
                                key={doc.id}
                                document={doc}
                                onRename={() => { }}
                                onDelete={() => { }}
                                isShared
                            />
                        ))}
                    </div>
                )}
            </ScrollArea>
        </div>
    )
} 