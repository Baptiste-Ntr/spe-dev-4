'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { fetcher } from '@/services/api';
import { User, Role } from '@/types/model';
import * as Dialog from '@radix-ui/react-dialog';
import * as Label from '@radix-ui/react-label';
import * as Checkbox from '@radix-ui/react-checkbox';
import { Cross2Icon, CheckIcon, MagnifyingGlassIcon, PlusIcon } from '@radix-ui/react-icons';
import { Slot } from '@radix-ui/react-slot';
import * as Tabs from '@radix-ui/react-tabs';
import * as Select from '@radix-ui/react-select';

interface UserFormData {
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
  role: Role;
  isTwoFactorEnabled?: boolean;
}

// Composant principal de la page d'administration
export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // État pour les modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Charger les utilisateurs
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const data = await fetcher('/user');
        setUsers(data);
        setFilteredUsers(data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        toast.error('Impossible de charger la liste des utilisateurs');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  // Filtrer les utilisateurs
  useEffect(() => {
    let result = users;
    
    // Filtre de recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(user => 
        user.email?.toLowerCase().includes(term) || 
        user.firstName?.toLowerCase().includes(term) || 
        user.lastName?.toLowerCase().includes(term)
      );
    }
    
    // Filtre par rôle
    if (roleFilter !== 'all') {
      result = result.filter(user => user.role === roleFilter);
    }
    
    // Filtre par statut
    if (statusFilter !== 'all') {
      const isBlocked = statusFilter === 'inactive';
      result = result.filter(user => 
        isBlocked ? !!user.blockedAt : !user.blockedAt
      );
    }
    
    setFilteredUsers(result);
  }, [users, searchTerm, roleFilter, statusFilter]);
  
  // Handlers
  const handleCreateUser = async (userData: UserFormData) => {
    try {
      const newUser = await fetcher('/admin/users', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
      
      setUsers(prev => [...prev, newUser]);
      toast.success('Utilisateur créé avec succès');
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Failed to create user:', error);
      toast.error('Impossible de créer l\'utilisateur');
    }
  };
  
  const handleUpdateUser = async (id: string, userData: Partial<UserFormData>) => {
    try {
      const updatedUser = await fetcher(`/admin/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(userData)
      });
      
      setUsers(prev => prev.map(user => user.id === id ? {...user, ...updatedUser} : user));
      toast.success('Utilisateur mis à jour avec succès');
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Failed to update user:', error);
      toast.error('Impossible de mettre à jour l\'utilisateur');
    }
  };
  
  const handleToggleUserStatus = async (id: string, block: boolean) => {
    try {
      await fetcher(`/user/${id}/block`, {
        method: 'PATCH',
      });
      
      setUsers(prev => prev.map(user => 
        user.id === id ? {
          ...user, 
          blockedAt: block ? new Date() : undefined
        } : user
      ));
      
      toast.success(block 
        ? 'Utilisateur bloqué avec succès'
        : 'Utilisateur débloqué avec succès'
      );
    } catch (error) {
      console.error('Failed to toggle user status:', error);
      toast.error('Impossible de modifier le statut de l\'utilisateur');
    }
  };
  
  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.')) {
      return;
    }
    
    try {
      await fetcher(`/admin/users/${id}`, {
        method: 'DELETE'
      });
      
      setUsers(prev => prev.filter(user => user.id !== id));
      toast.success('Utilisateur supprimé avec succès');
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error('Impossible de supprimer l\'utilisateur');
    }
  };
  
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };
  
  // Formatage de la date
  const formatDate = (date?: Date | string) => {
    if (!date) return 'N/A';
    
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Vérifier si un utilisateur est bloqué
  const isUserBlocked = (user: User): boolean => {
    return !!user.blockedAt;
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Administration des utilisateurs</h1>
      
      {/* Filtres et recherche */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </span>
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2 pl-10 pr-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Select.Root value={roleFilter} onValueChange={setRoleFilter}>
              <Select.Trigger className="inline-flex items-center justify-between min-w-[180px] border border-gray-300 rounded-md px-4 py-2 text-gray-700 bg-white">
                <Select.Value placeholder="Filtrer par rôle" />
                <Select.Icon className="ml-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </Select.Icon>
              </Select.Trigger>

              <Select.Portal>
                <Select.Content className="overflow-hidden bg-white rounded-md shadow-lg border border-gray-200 z-50">
                  <Select.Viewport className="p-1">
                    <Select.Item value="all" className="relative flex items-center px-8 py-2 text-sm rounded-md cursor-default select-none hover:bg-blue-50">
                      <Select.ItemText>Tous les rôles</Select.ItemText>
                      <Select.ItemIndicator className="absolute left-2 flex items-center justify-center">
                        <CheckIcon />
                      </Select.ItemIndicator>
                    </Select.Item>
                    <Select.Item value={Role.ADMIN} className="relative flex items-center px-8 py-2 text-sm rounded-md cursor-default select-none hover:bg-blue-50">
                      <Select.ItemText>Administrateurs</Select.ItemText>
                      <Select.ItemIndicator className="absolute left-2 flex items-center justify-center">
                        <CheckIcon />
                      </Select.ItemIndicator>
                    </Select.Item>
                    <Select.Item value={Role.USER} className="relative flex items-center px-8 py-2 text-sm rounded-md cursor-default select-none hover:bg-blue-50">
                      <Select.ItemText>Utilisateurs</Select.ItemText>
                      <Select.ItemIndicator className="absolute left-2 flex items-center justify-center">
                        <CheckIcon />
                      </Select.ItemIndicator>
                    </Select.Item>
                  </Select.Viewport>
                </Select.Content>
              </Select.Portal>
            </Select.Root>
            
            <Select.Root value={statusFilter} onValueChange={setStatusFilter}>
              <Select.Trigger className="inline-flex items-center justify-between min-w-[180px] border border-gray-300 rounded-md px-4 py-2 text-gray-700 bg-white">
                <Select.Value placeholder="Filtrer par statut" />
                <Select.Icon className="ml-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </Select.Icon>
              </Select.Trigger>

              <Select.Portal>
                <Select.Content className="overflow-hidden bg-white rounded-md shadow-lg border border-gray-200 z-50">
                  <Select.Viewport className="p-1">
                    <Select.Item value="all" className="relative flex items-center px-8 py-2 text-sm rounded-md cursor-default select-none hover:bg-blue-50">
                      <Select.ItemText>Tous les statuts</Select.ItemText>
                      <Select.ItemIndicator className="absolute left-2 flex items-center justify-center">
                        <CheckIcon />
                      </Select.ItemIndicator>
                    </Select.Item>
                    <Select.Item value="active" className="relative flex items-center px-8 py-2 text-sm rounded-md cursor-default select-none hover:bg-blue-50">
                      <Select.ItemText>Actifs</Select.ItemText>
                      <Select.ItemIndicator className="absolute left-2 flex items-center justify-center">
                        <CheckIcon />
                      </Select.ItemIndicator>
                    </Select.Item>
                    <Select.Item value="inactive" className="relative flex items-center px-8 py-2 text-sm rounded-md cursor-default select-none hover:bg-blue-50">
                      <Select.ItemText>Bloqués</Select.ItemText>
                      <Select.ItemIndicator className="absolute left-2 flex items-center justify-center">
                        <CheckIcon />
                      </Select.ItemIndicator>
                    </Select.Item>
                  </Select.Viewport>
                </Select.Content>
              </Select.Portal>
            </Select.Root>
            
            <Dialog.Root open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <Dialog.Trigger asChild>
                <button className="inline-flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors">
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Nouvel utilisateur
                </button>
              </Dialog.Trigger>
              
              <UserFormDialog
                title="Créer un nouvel utilisateur"
                onSubmit={handleCreateUser}
                open={isCreateModalOpen}
                onOpenChange={setIsCreateModalOpen}
              />
            </Dialog.Root>
          </div>
        </div>
      </div>
      
      {/* Liste des utilisateurs */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
            <p className="mt-2">Chargement des utilisateurs...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Aucun utilisateur ne correspond aux critères de recherche.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">2FA</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Créé le</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium">{user.firstName} {user.lastName}</div>
                    </td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === Role.ADMIN 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        !isUserBlocked(user) 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {isUserBlocked(user) ? 'Bloqué' : 'Actif'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.isTwoFactorEnabled 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.isTwoFactorEnabled ? 'Activé' : 'Désactivé'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2 whitespace-nowrap">
                      <Dialog.Root open={isEditModalOpen && selectedUser?.id === user.id} onOpenChange={(open) => {
                        if (!open) setIsEditModalOpen(false);
                        else {
                          handleEditUser(user);
                        }
                      }}>
                        <Dialog.Trigger asChild>
                          <button className="text-blue-500 hover:underline">Modifier</button>
                        </Dialog.Trigger>
                        
                        {selectedUser && selectedUser.id === user.id && (
                          <UserFormDialog
                            title="Modifier l'utilisateur"
                            user={selectedUser}
                            onSubmit={(data) => handleUpdateUser(selectedUser.id!, data)}
                            open={isEditModalOpen}
                            onOpenChange={setIsEditModalOpen}
                          />
                        )}
                      </Dialog.Root>
                      
                      <button
                        onClick={() => handleToggleUserStatus(user.id!, !isUserBlocked(user))}
                        className={`${
                          !isUserBlocked(user) 
                            ? 'text-orange-500 hover:text-orange-700' 
                            : 'text-green-500 hover:text-green-700'
                        } hover:underline`}
                      >
                        {!isUserBlocked(user) ? 'Bloquer' : 'Débloquer'}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id!)}
                        className="text-red-500 hover:text-red-700 hover:underline"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Composant modal pour création/édition d'utilisateur avec Radix Dialog
interface UserFormDialogProps {
  title: string;
  user?: User;
  onSubmit: (data: UserFormData) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function UserFormDialog({ title, user, onSubmit, open, onOpenChange }: UserFormDialogProps) {
  const [formData, setFormData] = useState<UserFormData>({
    email: user?.email || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    password: '',
    role: user?.role || Role.USER,
    isTwoFactorEnabled: user?.isTwoFactorEnabled || false
  });
  
  // Reset form when modal opens/closes
  useEffect(() => {
    if (open && user) {
      setFormData({
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        password: '',
        role: user.role || Role.USER,
        isTwoFactorEnabled: user.isTwoFactorEnabled || false
      });
    } else if (open && !user) {
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        password: '',
        role: Role.USER,
        isTwoFactorEnabled: false
      });
    }
  }, [open, user]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({ 
        ...prev, 
        [name]: (e.target as HTMLInputElement).checked 
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (user && !formData.password) {
      const { password, ...dataWithoutPassword } = formData;
      onSubmit(dataWithoutPassword);
    } else {
      onSubmit(formData);
    }
  };
  
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 bg-black/50" />
      <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 shadow-xl w-full max-w-md focus:outline-none">
        <Dialog.Title className="text-xl font-semibold mb-4">{title}</Dialog.Title>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label.Root className="block text-sm font-medium mb-1" htmlFor="email">
              Email
            </Label.Root>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label.Root className="block text-sm font-medium mb-1" htmlFor="firstName">
                Prénom
              </Label.Root>
              <input
                id="firstName"
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <Label.Root className="block text-sm font-medium mb-1" htmlFor="lastName">
                Nom
              </Label.Root>
              <input
                id="lastName"
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <Label.Root className="block text-sm font-medium mb-1" htmlFor="password">
              {user ? 'Nouveau mot de passe (laissez vide pour ne pas changer)' : 'Mot de passe'}
            </Label.Root>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required={!user}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <Label.Root className="block text-sm font-medium mb-1" htmlFor="role">
              Rôle
            </Label.Root>
            <Select.Root value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as Role }))}>
              <Select.Trigger className="inline-flex items-center justify-between w-full border border-gray-300 rounded-md px-4 py-2 text-gray-700 bg-white">
                <Select.Value placeholder="Sélectionnez un rôle" />
                <Select.Icon className="ml-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </Select.Icon>
              </Select.Trigger>

              <Select.Portal>
                <Select.Content className="overflow-hidden bg-white rounded-md shadow-lg border border-gray-200">
                  <Select.Viewport className="p-1">
                    <Select.Item value={Role.USER} className="relative flex items-center px-8 py-2 text-sm rounded-md cursor-default select-none hover:bg-blue-50">
                      <Select.ItemText>Utilisateur</Select.ItemText>
                      <Select.ItemIndicator className="absolute left-2 flex items-center justify-center">
                        <CheckIcon />
                      </Select.ItemIndicator>
                    </Select.Item>
                    <Select.Item value={Role.ADMIN} className="relative flex items-center px-8 py-2 text-sm rounded-md cursor-default select-none hover:bg-blue-50">
                      <Select.ItemText>Administrateur</Select.ItemText>
                      <Select.ItemIndicator className="absolute left-2 flex items-center justify-center">
                        <CheckIcon />
                      </Select.ItemIndicator>
                    </Select.Item>
                  </Select.Viewport>
                </Select.Content>
              </Select.Portal>
            </Select.Root>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox.Root 
              id="isTwoFactorEnabled"
              checked={formData.isTwoFactorEnabled}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isTwoFactorEnabled: checked === true }))}
              className="flex h-4 w-4 items-center justify-center rounded border border-gray-300 bg-white focus:outline-none data-[state=checked]:bg-blue-500"
            >
              <Checkbox.Indicator>
                <CheckIcon className="h-3.5 w-3.5 text-white" />
              </Checkbox.Indicator>
            </Checkbox.Root>
            <Label.Root className="text-sm" htmlFor="isTwoFactorEnabled">
              Activer l'authentification à deux facteurs
            </Label.Root>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Dialog.Close asChild>
              <button
                type="button"
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
            </Dialog.Close>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              {user ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </form>
        
        <Dialog.Close asChild>
          <button
            className="absolute top-3 right-3 inline-flex items-center justify-center w-8 h-8 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none"
            aria-label="Fermer"
          >
            <Cross2Icon className="h-4 w-4" />
          </button>
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  );
}