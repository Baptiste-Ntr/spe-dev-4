import React from 'react';
import { Folder } from '@/types/model';

interface FolderSidebarProps {
  folders: Folder[];
  selectedFolder: Folder | null;
  onSelectFolder: (folder: Folder) => void;
  onCreateFolder: () => void;
  onRenameFolder: (folder: Folder) => void;
  onDeleteFolder: (id: string) => void;
}

export default function FolderSidebar({
  folders,
  selectedFolder,
  onSelectFolder,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder
}: FolderSidebarProps) {
  return (
    <aside className="w-64 bg-gray-100 p-4">
      <h2 className="text-xl font-semibold mb-4">Mes Dossiers</h2>
      <ul>
        {folders.map((folder, index) => (
          <li
            key={folder.id}
            className={`p-2 rounded cursor-pointer mb-2 flex justify-between items-center ${
              selectedFolder?.id === folder.id ? 'bg-blue-200' : 'hover:bg-gray-200'
            }`}
            onClick={() => onSelectFolder(folder)}
          >
            <div
              className={`flex-grow ${selectedFolder?.id === folder.id ? 'font-bold text-blue-700' : ''}`}
            >
              {folder.name}
            </div>
            <div className="flex space-x-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRenameFolder(folder);
                }}
                className="text-blue-600 hover:text-blue-800 focus:outline-none"
                title="Renommer ce dossier"
              >
                ✏️
              </button>

              {/* N'affiche pas l'icône de suppression pour le premier dossier*/}
              {index !== 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteFolder(folder.id);
                  }}
                  className="text-red-600 hover:text-red-800 focus:outline-none"
                  title="Supprimer ce dossier"
                >
                  🗑️
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
      <button
        className="mt-4 w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={onCreateFolder}
      >
        + Nouveau Dossier
      </button>
    </aside>
  );
}