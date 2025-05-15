'use client'

import { useState, useEffect, useContext, useCallback, useRef } from 'react'
import { NavBar } from '@/components/Documents/NavBar'
import { Content } from '@/components/Documents/Content'
import { fetcher } from '@/lib/fetcher'
import { toast } from 'sonner'
import { AuthContext } from '@/context/AuthContext'
import { User as UserType } from '@/types/model'
import { useParams } from 'next/navigation'
import { socketService } from '@/lib/socket'

export interface Document {
    id: string
    title: string
    content: string
    updatedAt: string
    updatedById: string
}

export default function DocumentPage() {
    const params = useParams()
    const [document, setDocument] = useState<Document | null>(null)
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved")
    const { user } = useContext(AuthContext) as { user: UserType | null }
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const contentRef = useRef(content)

    useEffect(() => {
        const fetchDocument = async () => {
            if (!params?.id) return
            const res = await fetcher(`/api/documents/${params.id}`, {
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                }
            })
            if (res) {
                setDocument(res)
                setTitle(res.title)
                setContent(res.content)
                contentRef.current = res.content

                // Rejoindre le document pour la collaboration
                if (typeof params.id === 'string') {
                    socketService.joinDocument(params.id)
                }
            }
        }
        fetchDocument()

        // Nettoyer la connexion WebSocket lors du démontage
        return () => {
            if (params?.id && typeof params.id === 'string') {
                socketService.leaveDocument(params.id)
            }
            socketService.disconnect()
        }
    }, [params?.id])

    useEffect(() => {
        if (document && (title !== document.title || content !== document.content)) {
            setSaveStatus("unsaved")
        }
    }, [title, content, document])

    const handleSave = useCallback(async () => {
        if (!document || !user?.id) return
        setSaveStatus("saving")
        try {
            const res = await fetcher(`/api/documents/${document.id}`, {
                method: "PATCH",
                body: JSON.stringify({
                    title,
                    content: contentRef.current,
                    updatedAt: new Date().toISOString(),
                    updatedById: user.id
                }),
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                }
            })
            if (res) {
                setDocument(res)
                setSaveStatus("saved")
                toast.success("Document sauvegardé avec succès")
            } else {
                toast.error("Erreur lors de la sauvegarde")
                setSaveStatus("unsaved")
            }
        } catch (error) {
            console.error("Erreur lors de la sauvegarde:", error)
            toast.error("Erreur lors de la sauvegarde")
            setSaveStatus("unsaved")
        }
    }, [document, title, user?.id])

    const debouncedSave = useCallback(() => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current)
        }

        saveTimeoutRef.current = setTimeout(() => {
            handleSave()
        }, 1000)
    }, [handleSave])

    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current)
            }
        }
    }, [])

    if (!document) {
        return <div>Chargement...</div>
    }

    return (
        <div>
            <NavBar
                document={document}
                title={title}
                setTitle={setTitle}
                onSave={handleSave}
                saveStatus={saveStatus}
            />
            <Content
                content={content}
                setContent={(newContent) => {
                    setContent(newContent)
                    contentRef.current = newContent
                    debouncedSave()
                }}
                onSave={debouncedSave}
            />
        </div>
    )
} 