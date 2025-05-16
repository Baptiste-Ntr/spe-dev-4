'use client'

import { useState, useEffect } from 'react';
import { folderService } from '@/services/folderService';
import { Folder } from '@/types/model';

export function useFolders() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showRenameFolderModal, setShowRenameFolderModal] = useState(false);
  const [folderToRename, setFolderToRename] = useState<Folder | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchFolders = async () => {
    try {
      setIsLoading(true);
      const data = await folderService.getAllFolders();
      setFolders(data);

      if (data.length) {
        const currentFolderId = selectedFolder?.id;
        if (currentFolderId) {
          const updatedFolder = data.find(f => f.id === currentFolderId);
          if (updatedFolder) {
            setSelectedFolder(updatedFolder);
          } else {
            setSelectedFolder(data[0]);
          }
        } else {
          setSelectedFolder(data[0]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch folders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  const createFolder = async (name: string) => {
    try {
      await folderService.createFolder(name);
      await fetchFolders();
      return true;
    } catch (error) {
      console.error("Failed to create folder:", error);
      return false;
    }
  };

  const renameFolder = async (id: string, name: string) => {
    try {
      await folderService.renameFolder(id, name);
      await fetchFolders();
      return true;
    } catch (error) {
      console.error("Failed to rename folder:", error);
      return false;
    }
  };

  const deleteFolder = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce dossier ?')) return false;

    try {
      await folderService.deleteFolder(id);
      if (selectedFolder?.id === id) {
        setSelectedFolder(folders.find(f => f.id !== id) || null);
      }
      await fetchFolders();
      return true;
    } catch (error) {
      console.error("Failed to delete folder:", error);
      return false;
    }
  };

  return {
    folders,
    selectedFolder,
    setSelectedFolder,
    isLoading,
    createFolder,
    renameFolder,
    deleteFolder,
    showCreateFolderModal,
    setShowCreateFolderModal,
    showRenameFolderModal,
    setShowRenameFolderModal,
    folderToRename,
    setFolderToRename,
    refreshFolders: fetchFolders
  };
}