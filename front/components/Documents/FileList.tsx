import React from 'react';
import { Document } from '@/types/model';
import FileItem from './FileItem';

interface FileListProps {
  files: Document[];
  onCreateFile: () => void;
  onRenameFile: (file: Document) => void;
  onDeleteFile: (id: string) => void;
  onUploadFile: () => void;
}

export default function FileList({
  files,
  onCreateFile,
  onRenameFile,
  onDeleteFile,
  onUploadFile,
}: FileListProps) {
  return (
    <div>
      <button
        className="mb-4 py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600"
        onClick={onCreateFile}
      >
        + Nouveau Fichier
      </button>

      <button
            onClick={onUploadFile}
            className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            📤 Télécharger un fichier
        </button>
      
      <ul className="space-y-2">
        {files.map((doc) => (
          <FileItem 
            key={doc.id} 
            document={doc}
            onRename={onRenameFile}
            onDelete={onDeleteFile}
          />
        ))}
        {files.length === 0 && (
          <li className="text-gray-500">Aucun fichier</li>
        )}
      </ul>
    </div>
  );
}