import { useState } from 'react';
import { documentService } from '@/services/documentService';
import { Document } from '@/types/model';

export function useFiles(folderId?: string) {
    const [showCreateFileModal, setShowCreateFileModal] = useState(false);
    const [showRenameFileModal, setShowRenameFileModal] = useState(false);
    const [showUploadFileModal, setShowUploadFileModal] = useState(false);
    const [fileToRename, setFileToRename] = useState<Document | null>(null);

    const createFile = async (title: string) => {
        try {
            await documentService.createDocument(title, folderId);
            return true;
        } catch (error) {
            console.error("Failed to create document:", error);
            return false;
        }
    };

    const renameFile = async (id: string, title: string) => {
        try {
            await documentService.updateDocument(id, title);
            return true;
        } catch (error) {
            console.error("Failed to rename document:", error);
            return false;
        }
    };

    const deleteFile = async (id: string) => {
        if (!confirm('Voulez-vous vraiment supprimer ce fichier ?')) return false;

        try {
            await documentService.deleteDocument(id);
            return true;
        } catch (error) {
            console.error("Failed to delete document:", error);
            return false;
        }
    };

    const uploadFile = async (file: File, title: string): Promise<boolean> => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('title', title);

            if (folderId) {
                formData.append('folderId', folderId);
            }
            await documentService.uploadDocument(formData);
            return true;
        } catch (error) {
            console.error('Failed to upload file:', error);
            return false;
        }
    };


    return {
        createFile,
        renameFile,
        deleteFile,
        showCreateFileModal,
        setShowCreateFileModal,
        showRenameFileModal,
        setShowRenameFileModal,
        fileToRename,
        setFileToRename,
        uploadFile,
        showUploadFileModal,
        setShowUploadFileModal,
    };
}