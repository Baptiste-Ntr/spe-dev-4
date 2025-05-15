'use client'

import { useEffect, useRef } from 'react'
import { socketService } from '@/lib/socket'

interface ContentProps {
    content: string
    setContent: (content: string) => void
    onSave: () => void
    documentId: string
}

export const Content = ({ content, setContent, onSave, documentId }: ContentProps) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const isLocalChange = useRef(false)

    useEffect(() => {
        // Rejoindre le document et configurer la mise à jour du contenu
        socketService.joinDocument(documentId, (newContent) => {
            if (!isLocalChange.current) {
                setContent(newContent)
            }
        })

        return () => {
            socketService.leaveDocument(documentId)
        }
    }, [documentId, setContent])

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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