'use client'
import { useState, useEffect } from 'react';
import { useFolders } from '@/hooks/useFolders';
import { useFiles } from '@/hooks/useFiles';
import FolderSidebar from '@/components/Documents/FolderSidebar';
import FileList from '@/components/Documents/FileList';
import CreateFileModal from '@/components/Documents/CreateFileModal';
import RenameFileModal from '@/components/Documents/RenameFileModal';
import CreateFolderModal from '@/components/Documents/CreateFolderModal';
import RenameFolderModal from '@/components/Documents/RenameFolderModal';
import UploadFileModal from '@/components/Documents/UploadFileModal';
import useSocket from '@/hooks/useSocket';


export default function DocumentExplorer() {
    // Gestion des dossiers avec le hook personnalisé
    const { socket } = useSocket();

    const {
        folders,
        selectedFolder,
        setSelectedFolder,
        createFolder,
        renameFolder,
        deleteFolder,
        showCreateFolderModal,
        setShowCreateFolderModal,
        showRenameFolderModal,
        setShowRenameFolderModal,
        folderToRename,
        setFolderToRename,
        refreshFolders
    } = useFolders();

    // Gestion des fichiers avec le hook personnalisé
    const {
        createFile: createFileInHook,
        renameFile: renameFileInHook,
        deleteFile: deleteFileInHook,
        uploadFile: uploadFileInHook,
        showUploadFileModal,
        setShowUploadFileModal,
        showCreateFileModal,
        setShowCreateFileModal,
        showRenameFileModal,
        setShowRenameFileModal,
        fileToRename,
        setFileToRename
    } = useFiles(selectedFolder?.id);

    // Wrapper pour rafraîchir les dossiers après les opérations de fichier
    const createFile = async (title: string) => {
      const success = await createFileInHook(title);
      if (success) {
        if (socket) {
          socket.emit('fileCreated', { title, folderId: selectedFolder?.id });
        }
        await refreshFolders();
      }
      return success;
    };

    const handleCreateFolder = async (name: string) => {
      const success = await createFolder(name);
      if (success) {
        if (socket) {
          socket.emit('folderCreated', { name });
        }
        await refreshFolders();
      }
      return success;
    };

    const renameFile = async (id: string, title: string) => {
        const success = await renameFileInHook(id, title);
        if (success) await refreshFolders();
        return success;
    };

    const deleteFile = async (id: string) => {
        const success = await deleteFileInHook(id);
        if (success) await refreshFolders();
        return success;
    };

    const uploadFile = async (file: File, title: string) => {
        const success = await uploadFileInHook(file, title);
        if (success) await refreshFolders();
        return success;
    };

    useEffect(() => {
      if (!socket) return;

      const onFolderCreated = (folder) => {
        refreshFolders(); // Pour recharger les dossiers/fichiers
      };

      const onFileCreated = (file) => {
        refreshFolders();
      };

      // Écoute des événements
      socket.on('folderCreated', onFolderCreated);
      socket.on('fileCreated', onFileCreated);

      // Nettoyage à la fin
      return () => {
        socket.off('folderCreated', onFolderCreated);
        socket.off('fileCreated', onFileCreated);
      };
    }, [socket, refreshFolders]);

    return (
        <div className="flex h-screen">
            <FolderSidebar
                folders={folders}
                selectedFolder={selectedFolder}
                onSelectFolder={setSelectedFolder}
                onCreateFolder={() => setShowCreateFolderModal(true)}
                onRenameFolder={(folder) => {
                    setFolderToRename(folder);
                    setShowRenameFolderModal(true);
                }}
                onDeleteFolder={deleteFolder}
            />

            <main className="flex-1 p-6 overflow-auto">
                <h1 className="text-2xl font-bold mb-4">
                    Fichiers dans "{selectedFolder?.name || 'Aucun dossier'}"
                </h1>

                <FileList
                    files={selectedFolder?.documents || []}
                    onCreateFile={() => setShowCreateFileModal(true)}
                    onRenameFile={(file) => {
                        setFileToRename(file);
                        setShowRenameFileModal(true);
                    }}
                    onDeleteFile={deleteFile}
                    onUploadFile={() => setShowUploadFileModal(true)}
                />
            </main>

            {/* Modals */}
            {showCreateFileModal && (
                <CreateFileModal
                    folderId={selectedFolder?.id}
                    onClose={() => setShowCreateFileModal(false)}
                    onSubmit={createFile}
                />
            )}

            {showRenameFileModal && fileToRename && (
                <RenameFileModal
                    file={fileToRename}
                    onClose={() => setShowRenameFileModal(false)}
                    onSubmit={renameFile}
                />
            )}

            {showCreateFolderModal && (
                <CreateFolderModal
                    onClose={() => setShowCreateFolderModal(false)}
                    onSubmit={handleCreateFolder}
                />
            )}

            {showRenameFolderModal && folderToRename && (
                <RenameFolderModal
                    folder={folderToRename}
                    onClose={() => setShowRenameFolderModal(false)}
                    onSubmit={renameFolder}
                />
            )}

            {showUploadFileModal && (
                <UploadFileModal
                    folderId={selectedFolder?.id}
                    onClose={() => setShowUploadFileModal(false)}
                    onSubmit={uploadFile}
                />
            )}
        </div>
    );
}