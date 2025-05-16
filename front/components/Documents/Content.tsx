'use client'

import { useEffect, useRef, useContext } from 'react'
import { socketService } from '@/lib/socket'
import { AuthContext } from '@/context/AuthContext'
import { User } from '@/types/model'

interface ContentProps {
    content: string
    setContent: (content: string) => void
    onSave: () => void
    documentId: string
}

export const Content = ({ content, setContent, onSave, documentId }: ContentProps) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const isLocalChange = useRef(false)
    const { user } = useContext(AuthContext) as { user: User }

    useEffect(() => {
        if (!user?.id) return

        // Rejoindre le document et configurer la mise à jour du contenu
        socketService.joinDocument(
            documentId,
            user.id,
            (newContent) => {
                if (!isLocalChange.current) {
                    setContent(newContent)
                }
            },
            (users) => {
                // Gérer la mise à jour des collaborateurs actifs si nécessaire
            }
        )

        return () => {
            if (user?.id) {
                socketService.leaveDocument(documentId, user.id)
            }
        }
    }, [documentId, setContent, user?.id])

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (!user?.id) return

        isLocalChange.current = true
        const newContent = e.target.value
        setContent(newContent)
        socketService.updateDocument(documentId, newContent)
        onSave()
        isLocalChange.current = false
    }

    return (
        <div className="relative flex-1 p-4">
            <textarea
                ref={textareaRef}
                value={content}
                onChange={handleChange}
                className="w-full h-full p-4 resize-none focus:outline-none"
                style={{ minHeight: 'calc(100vh - 120px)' }}
            />
        </div>
    )
}