import { useEffect, useRef } from 'react';
import { socketService } from '@/lib/socket';
import { CollaboratorCursors } from './CollaboratorCursors';

interface ContentProps {
    content: string;
    setContent: (content: string) => void;
    onSave: () => void;
}

export const Content = ({ content, setContent, onSave }: ContentProps) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
        onSave();

        // Mettre à jour la position du curseur
        if (textareaRef.current) {
            const textarea = textareaRef.current;
            const cursorPosition = textarea.selectionStart;
            const textBeforeCursor = textarea.value.substring(0, cursorPosition);
            const lines = textBeforeCursor.split('\n');
            const line = lines.length - 1;
            const column = lines[lines.length - 1].length;

            socketService.updateCursor('document-id', { line, column });
        }
    };

    return (
        <div className="relative flex-1 p-4">
            <textarea
                ref={textareaRef}
                value={content}
                onChange={handleChange}
                className="w-full h-full p-4 resize-none focus:outline-none"
                style={{ minHeight: 'calc(100vh - 120px)' }}
            />
            <CollaboratorCursors />
        </div>
    );
};