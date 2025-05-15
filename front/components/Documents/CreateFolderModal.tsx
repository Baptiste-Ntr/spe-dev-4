import React, { useState } from 'react';

interface CreateFolderModalProps {
  onClose: () => void;
  onSubmit: (name: string) => Promise<boolean>;
}

export default function CreateFolderModal({ onClose, onSubmit }: CreateFolderModalProps) {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    
    setIsSubmitting(true);
    const success = await onSubmit(name);
    setIsSubmitting(false);
    
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-96">
        <h2 className="text-xl font-semibold mb-4">Créer un dossier</h2>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full p-2 border rounded mb-4"
          placeholder="Nom du dossier"
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
            className="px-4 py-2 bg-green-500 text-white rounded disabled:bg-green-300"
            disabled={!name.trim() || isSubmitting}
          >
            {isSubmitting ? 'En cours...' : 'Créer'}
          </button>
        </div>
      </div>
    </div>
  );
}