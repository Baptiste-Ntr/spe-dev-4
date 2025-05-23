import { fetcher } from './api';
import { Document } from '@/types/model';

export const documentService = {
    async createDocument(title: string, folderId?: string): Promise<Document> {
        return fetcher('documents', {
            method: 'POST',
            body: JSON.stringify({ title, folderId })
        });
    },

    async updateDocument(id: string, title: string): Promise<Document> {
        return fetcher(`documents/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ title })
        });
    },
    
    async renameDocument(id: string, title: string): Promise<Document> {
        return fetcher(`documents/rename/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ title })
        });
    },

    async deleteDocument(id: string): Promise<void> {
        return fetcher(`documents/${id}`, {
            method: 'DELETE'
        });
    },

    async uploadDocument(formData: FormData): Promise<Document> {
        return fetcher('documents/upload', {
            method: 'POST',
            body: formData
        });
    }


};