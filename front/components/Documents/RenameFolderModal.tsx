import React, { useState, useEffect } from 'react';
import { Folder } from '@/types/model';

interface RenameFolderModalProps {
  folder: Folder;
  onClose: () => void;
  onSubmit: (id: string, name: string) => Promise<boolean>;
}

export default function RenameFolderModal({ folder, onClose, onSubmit }: RenameFolderModalProps) {
  const [name, setName] = useState(folder.name);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setName(folder.name);
  }, [folder]);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    
    setIsSubmitting(true);
    const success = await onSubmit(folder.id, name);
    setIsSubmitting(false);
    
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-96">
        <h2 className="text-xl font-semibold mb-4">Renommer un dossier</h2>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full p-2 border rounded mb-4"
          disabled={isSubmitting}
        />
        <div className="flex justify-end space-x-2">
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-gray-200 rounded"
            disabled={isSubmitting}
          >
            Annuler
          </button>
          <button 
            onClick={handleSubmit} 
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-blue-300"
            disabled={!name.trim() || isSubmitting}
          >
            {isSubmitting ? 'En cours...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}