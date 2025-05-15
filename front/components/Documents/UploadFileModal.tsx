import React, { useState, useRef } from 'react';
import { toast } from 'sonner';

interface UploadFileModalProps {
  folderId?: string;
  onClose: () => void;
  onSubmit: (file: File, title: string) => Promise<boolean>;
}

export default function UploadFileModal({ folderId, onClose, onSubmit }: UploadFileModalProps) {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Auto-remplir le titre avec le nom du fichier sans extension
      if (!title) {
        const fileName = selectedFile.name.split('.').slice(0, -1).join('.');
        setTitle(fileName || selectedFile.name);
      }
    }
  };

  const handleSubmit = async () => {
    if (!file || !title.trim()) return;
    
    setIsSubmitting(true);
    try {
      const success = await onSubmit(file, title);
      if (success) {
        toast.success('Fichier téléchargé avec succès');
        onClose();
      } else {
        toast.error('Échec du téléchargement');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Une erreur est survenue lors du téléchargement');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Télécharger un fichier</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Titre</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre du document"
            className="w-full p-2 border rounded"
            disabled={isSubmitting}
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Fichier</label>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            disabled={isSubmitting}
          />
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              disabled={isSubmitting}
            >
              Choisir un fichier
            </button>
            <span className="text-sm text-gray-600 truncate">
              {file ? file.name : 'Aucun fichier sélectionné'}
            </span>
          </div>
          
          {file && (
            <div className="mt-2 text-xs text-gray-500">
              <p>Type: {file.type}</p>
              <p>Taille: {(file.size / 1024 / 1024).toFixed(2)} Mo</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            disabled={isSubmitting}
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            className={`px-4 py-2 text-white rounded ${
              !file || !title.trim() || isSubmitting
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
            disabled={!file || !title.trim() || isSubmitting}
          >
            {isSubmitting ? 'Téléchargement...' : 'Télécharger'}
          </button>
        </div>
      </div>
    </div>
  );
}