import React, { useState } from 'react';

interface CreateFileModalProps {
  folderId?: string;
  onClose: () => void;
  onSubmit: (title: string) => Promise<boolean>;
}

export default function CreateFileModal({ folderId, onClose, onSubmit }: CreateFileModalProps) {
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    
    setIsSubmitting(true);
    const success = await onSubmit(title);
    setIsSubmitting(false);
    
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-96">
        <h2 className="text-xl font-semibold mb-4">Créer un fichier</h2>
        <input
          type="text"
          className="w-full p-2 border rounded mb-4"
          placeholder="Titre du fichier"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isSubmitting}
        />
        <div className="flex justify-end space-x-2">
          <button
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Annuler
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
            onClick={handleSubmit}
            disabled={!title.trim() || isSubmitting}
          >
            {isSubmitting ? 'En cours...' : 'Créer'}
          </button>
        </div>
      </div>
    </div>
  );
}