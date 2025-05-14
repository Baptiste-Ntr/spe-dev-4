'use client'
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { NavBar } from '@/components/Documents/NavBar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Document {
    id: string;
    title: string;
    content?: string;
}

export default function DocumentPage() {
    const params = useParams();
    const [document, setDocument] = useState<Document | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDocument() {
            try {
                const res = await fetch(`http://localhost:8000/api/documents/${params.id}`, {
                    credentials: 'include'
                });
                if (res.ok) {
                    const data = await res.json();
                    setDocument(data);
                }
            } catch (error) {
                console.error('Erreur lors du chargement du document:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchDocument();
    }, [params.id]);

    if (loading) {
        return <div className="p-4">Chargement...</div>;
    }

    if (!document) {
        return (
            <>
                <div className="p-4">Document non trouvé</div>
                <Button>
                    <Link href="/documents">
                        Retour
                    </Link>
                </Button>
            </>
        );
    }

    return (
        <div className="p-6">
            <NavBar documentTitle={document.title} documentId={document.id} />
            <h1 className="text-2xl font-bold mb-4">{document.title}</h1>
            <div className="prose max-w-none">
                {document.content || 'Aucun contenu disponible'}
            </div>
        </div>
    );
} 