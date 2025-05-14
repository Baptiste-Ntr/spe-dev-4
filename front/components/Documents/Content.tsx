import { Textarea } from "../ui/textarea"

export const Content = ({
    content,
    setContent,
    onSave
}: {
    content: string,
    setContent: (content: string) => void,
    onSave: () => void
}) => {
    return (
        <div>
            <Textarea
                value={content}
                onChange={(e) => {
                    setContent(e.target.value)
                    onSave()
                }}
                className="min-h-[calc(100vh-12rem)] resize-none border-none p-4 focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="Start typing..."
            />
        </div>
    )
}