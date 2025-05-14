import Link from "next/link"

export const NavBar = ({ documentTitle, documentId }: { documentTitle: string, documentId: string }) => {
    return (
        <div>
            <h1>{documentTitle}</h1>
            <button>
                <Link href={`/documents/${documentId}`}>
                    <p>Retour</p>
                </Link>
            </button>
        </div>
    )
}