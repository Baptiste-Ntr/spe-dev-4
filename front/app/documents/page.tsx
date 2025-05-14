'use client'
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// Structure des données
interface Document {
  id: string;
  title: string;
}

interface Folder {
  id: string;
  name: string;
  documents: Document[];
}

export default function DocumentExplorer() {
  const router = useRouter()
  const [fileToRename, setFileToRename] = useState<Document | null>(null);
  const [renameTitle, setRenameTitle] = useState('');
  const [showRenameFileModal, setShowRenameFileModal] = useState(false);

  const [folderToRename, setFolderToRename] = useState<Folder | null>(null);
  const [renameFolderName, setRenameFolderName] = useState('');
  const [showRenameFolderModal, setShowRenameFolderModal] = useState(false);

  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  // Récupére les dossiers et fichier
  useEffect(() => {
    async function fetchData() {
      const res = await fetch(`http://localhost:8000/api/folders`);
      const data: Folder[] = await res.json();
      setFolders(data);
      if (data.length) setSelectedFolder(data[0]);
    }
    fetchData();
  }, []);

  async function fetchData() {
    const res = await fetch(`http://localhost:8000/api/folders`);
    const data: Folder[] = await res.json();
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
  }

  useEffect(() => {
    fetchData();
  }, []);


  // Créer un fichier
  async function handleCreate() {
    if (!newTitle) return;

    console.log('Creating document:', newTitle, 'in folder:', selectedFolder);
    const payload: { title: string; folderId?: string } = { title: newTitle };
    if (selectedFolder) {
      payload.folderId = selectedFolder.id;
    }

    const res = await fetch(`http://localhost:8000/api/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include'
    });

    if (res.ok) {

      const doc = await res.json();
      console.log(doc);

      setFolders(prev => prev.map(f => f.id === selectedFolder?.id ? {
        ...f,
        documents: [...f.documents, doc],
      } : f));
      await fetchData();
      setNewTitle('');
      setShowModal(false);
    }

  }

  // Supprime un fichier
  async function handleDeleteFile(id: string) {
    if (!confirm('Voulez-vous vraiment supprimer ce fichier ?')) return;
    const res = await fetch(`http://localhost:8000/api/documents/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (res.ok) {
      setFolders(prev =>
        prev.map(f => f.id === selectedFolder?.id
          ? { ...f, documents: f.documents.filter(d => d.id !== id) }
          : f
        )
      );
      await fetchData();
    }
  }

  // Renomme un fichier
  async function handleRenameFile() {
    if (!fileToRename) return;
    const res = await fetch(`http://localhost:8000/api/documents/${fileToRename.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: renameTitle }),
      credentials: 'include'
    });
    if (res.ok) {
      setFolders(prev =>
        prev.map(f => ({
          ...f,
          documents: f.documents.map(d =>
            d.id === fileToRename.id ? { ...d, title: renameTitle } : d
          )
        }))
      );
      await fetchData();
      setShowRenameFileModal(false);
      setFileToRename(null);
    }
  }

  // Supprime un dossier
  async function handleDeleteFolder(id: string) {
    if (!confirm('Voulez-vous vraiment supprimer ce dossier ?')) return;
    const res = await fetch(`http://localhost:8000/api/folders/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (res.ok) {
      setFolders(prev => prev.filter(f => f.id !== id));
      if (selectedFolder?.id === id) setSelectedFolder(folders[0] || null);
      await fetchData();
    }
  }

  // Renomme un dossier
  async function handleRenameFolder() {
    if (!folderToRename) return;
    const res = await fetch(`http://127.0.0.1:3000/api/folders/${folderToRename.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: renameFolderName }),
      credentials: 'include'
    });
    if (res.ok) {
      setFolders(prev =>
        prev.map(f => f.id === folderToRename.id
          ? { ...f, name: renameFolderName }
          : f
        )
      );
      await fetchData();
      setShowRenameFolderModal(false);
      setFolderToRename(null);
    }
  }

  // Créer un dossier
  async function handleCreateFolder() {
    if (!newFolderName) return;
    const res = await fetch(`http://localhost:8000/api/folders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newFolderName }),
      credentials: 'include'
    });
    if (res.ok) {
      const folder = await res.json();
      setFolders(prev => [...prev, { ...folder, documents: [] }]);
      await fetchData();
      setNewFolderName('');
      setShowCreateFolderModal(false);
    }
  }

  return (
    <>
      <Head>
        <title>Document Explorer</title>
      </Head>
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-100 p-4">
          <h2 className="text-xl font-semibold mb-4">Mes Dossiers</h2>
          <ul>
            {Array.isArray(folders) && folders.map((folder, index) => (
              <li
                key={folder.id}
                className={`p-2 rounded cursor-pointer mb-2 ${selectedFolder?.id === folder.id ? 'bg-blue-200' : 'hover:bg-gray-200'}`}
                onClick={() => setSelectedFolder(folder)}
              >
                <div
                  className={`flex-grow ${selectedFolder?.id === folder.id ? 'font-bold text-blue-700' : ''}`}

                >
                  {folder.name}
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => {
                      setFolderToRename(folder);
                      setRenameFolderName(folder.name);
                      setShowRenameFolderModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-800 focus:outline-none"
                    title="Renommer ce dossier"
                  >
                    ✏️
                  </button>

                  {/* N'affiche pas l'icône de suppression pour le premier dossier*/}
                  {index !== 0 && (
                    <button
                      onClick={() => handleDeleteFolder(folder.id)}
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
            onClick={() => setShowModal(true)}
          >
            + Nouveau Fichier
          </button>
          <button
            className="mb-4 py-2 w-full bg-green-500 text-white rounded hover:bg-green-600"
            onClick={() => setShowCreateFolderModal(true)}
          >
            + Nouveau Dossier
          </button>

        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          <h1 className="text-2xl font-bold mb-4">Fichiers dans "{selectedFolder?.name || 'Aucun dossier'}"</h1>
          {selectedFolder && (
            <ul className="space-y-2">
              {selectedFolder.documents.map((doc) => (
                <li key={doc.id} className="flex justify-between items-center p-3 border rounded hover:bg-gray-50">
                  <span>{doc.title}</span>
                  <div className="space-x-2">
                    <button
                      onClick={() => {
                        setFileToRename(doc);
                        setRenameTitle(doc.title);
                        setShowRenameFileModal(true);
                      }}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Renommer
                    </button>
                    <button
                      onClick={() => handleDeleteFile(doc.id)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Supprimer
                    </button>
                  </div>
                </li>

              ))}
              {!selectedFolder.documents.length && (
                <li className="text-gray-500">Aucun fichier</li>
              )}
            </ul>
          )}
        </main>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded shadow-lg w-96">
              <h2 className="text-xl font-semibold mb-4">Créer un fichier</h2>
              <input
                type="text"
                className="w-full p-2 border rounded mb-4"
                placeholder="Titre du fichier"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
              <div className="flex justify-end space-x-2">
                <button
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  onClick={() => setShowModal(false)}
                >
                  Annuler
                </button>
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={handleCreate}
                >
                  Créer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal pour renommer le fichier */}
        {showRenameFileModal && fileToRename && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded shadow-lg w-96">
              <h2 className="text-xl font-semibold mb-4">Renommer un fichier</h2>
              <input
                type="text"
                value={renameTitle}
                onChange={e => setRenameTitle(e.target.value)}
                className="w-full p-2 border rounded mb-4"
              />
              <div className="flex justify-end space-x-2">
                <button onClick={() => setShowRenameFileModal(false)} className="px-4 py-2 bg-gray-200 rounded">Annuler</button>
                <button onClick={handleRenameFile} className="px-4 py-2 bg-blue-500 text-white rounded">Enregistrer</button>
              </div>
            </div>
          </div>
        )}

        {/* Modals pour renommer un dossier*/}
        {showRenameFolderModal && folderToRename && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded shadow-lg w-96">
              <h2 className="text-xl font-semibold mb-4">Renommer un dossier</h2>
              <input
                type="text"
                value={renameFolderName}
                onChange={e => setRenameFolderName(e.target.value)}
                className="w-full p-2 border rounded mb-4"
              />
              <div className="flex justify-end space-x-2">
                <button onClick={() => setShowRenameFolderModal(false)} className="px-4 py-2 bg-gray-200 rounded">Annuler</button>
                <button onClick={handleRenameFolder} className="px-4 py-2 bg-blue-500 text-white rounded">Enregistrer</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal pour créer un dossier */}
        {showCreateFolderModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded shadow-lg w-96">
              <h2 className="text-xl font-semibold mb-4">Créer un dossier</h2>
              <input
                type="text"
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                className="w-full p-2 border rounded mb-4"
              />
              <div className="flex justify-end space-x-2">
                <button onClick={() => setShowCreateFolderModal(false)} className="px-4 py-2 bg-gray-200 rounded">Annuler</button>
                <button onClick={handleCreateFolder} className="px-4 py-2 bg-green-500 text-white rounded">Créer</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
