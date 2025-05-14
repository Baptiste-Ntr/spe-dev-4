import React from 'react';
import { Document } from '@/types/model';
import { formatDate } from '@/utils/formatter';

interface FileItemProps {
    document: Document;
    onRename: (doc: Document) => void;
    onDelete: (id: string) => void;
}

export default function FileItem({ document, onRename, onDelete }: FileItemProps) {
    const getFileIcon = () => {
        if (!document.type) return '📄'; // Document standard

        if (document.type.includes('PDF')) return '📕';
        if (document.type.includes('IMAGE')) return '🖼️';
        if (document.type.includes('TEXT')) return '📝';
        console.log("dedede", document.type);
        
        
        return '📄'; // Document standard par défaut
    };
    
    return (
    <li className="flex justify-between items-start p-3 border rounded hover:bg-gray-50">
      <div className="flex items-center">
        <span className="text-2xl mr-3">{getFileIcon()}</span>
        <div>
          <div className="font-medium">{document.title}</div>
          {/* {document.filePath && (
            <a 
              href={getFileUrl() || '#'} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:underline"
            >
              Télécharger
            </a>
          )} */}
        </div>
      </div>

      {/* Infos et actions à droite */}
      <div className="flex flex-col items-end">
        {/* Boutons d'action */}
        <div className="space-x-2">
          <button
            onClick={() => onRename(document)}
            className="text-sm text-blue-600 hover:underline"
          >
            Renommer
          </button>
          <button
            onClick={() => onDelete(document.id)}
            className="text-sm text-red-600 hover:underline"
          >
            Supprimer
          </button>
        </div>

        {/* Informations sur la dernière modification */}
        {document.updatedBy && (
          <div className="mt-2 text-xs text-gray-500 text-right">
            <p>
              Dernière modification par{' '}
              <span className="font-semibold">
                {document.updatedBy.firstName || ''} {document.updatedBy.lastName || ''}
              </span>
            </p>
            <p>le {document.updatedAt ? formatDate(document.updatedAt) : 'Date inconnue'}</p>
          </div>
        )}
      </div>
    </li>
  );
}