'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { fetcher } from '@/services/api';
import { User, Role } from '@/types/model';

interface UserFormData {
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
  role: Role;
  isTwoFactorEnabled?: boolean;
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // État pour les modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  // Charger les utilisateurs
  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetcher('/user');
      console.log('Utilisateurs chargés:', data);
      
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error('Échec du chargement des utilisateurs:', error);
      toast.error('Impossible de charger la liste des utilisateurs');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialisation au chargement
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Appliquer les filtres
  useEffect(() => {
    let result = [...users];
    
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

  // Actions sur les utilisateurs
  const createUser = async (userData: UserFormData) => {
    try {
      const newUser = await fetcher('/user/by-admin', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
      
      setUsers(prev => [...prev, newUser]);
      toast.success('Utilisateur créé avec succès');
      setShowCreateModal(false);
      return true;
    } catch (error) {
      console.error('Échec de la création de l\'utilisateur:', error);
      toast.error('Impossible de créer l\'utilisateur');
      return false;
    }
  };
  
  const updateUser = async (id: string, userData: Partial<UserFormData>) => {
    try {
      const updatedUser = await fetcher(`/user/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(userData)
      });
      
      setUsers(prev => prev.map(user => user.id === id ? {...user, ...updatedUser} : user));
      toast.success('Utilisateur mis à jour avec succès');
      setShowEditModal(false);
      return true;
    } catch (error) {
      console.error('Échec de la mise à jour de l\'utilisateur:', error);
      toast.error('Impossible de mettre à jour l\'utilisateur');
      return false;
    }
  };
  
  const toggleUserStatus = async (id: string, block: boolean) => {
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
      return true;
    } catch (error) {
      console.error('Échec de la modification du statut:', error);
      toast.error('Impossible de modifier le statut de l\'utilisateur');
      return false;
    }
  };
  
  const deleteUser = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.')) {
      return false;
    }
    
    try {
      await fetcher(`/user/${id}`, {
        method: 'DELETE'
      });
      
      setUsers(prev => prev.filter(user => user.id !== id));
      toast.success('Utilisateur supprimé avec succès');
      return true;
    } catch (error) {
      console.error('Échec de la suppression:', error);
      toast.error('Impossible de supprimer l\'utilisateur');
      return false;
    }
  };

  // Utilitaires
  const isUserBlocked = (user: User): boolean => {
    return !!user.blockedAt;
  };
  
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

  return {
    // États
    users,
    filteredUsers,
    isLoading,
    
    // Filtres
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    
    // Modales
    showCreateModal,
    setShowCreateModal,
    showEditModal,
    setShowEditModal,
    userToEdit,
    setUserToEdit,
    
    // Actions
    fetchUsers,
    createUser,
    updateUser,
    toggleUserStatus,
    deleteUser,
    
    // Utilitaires
    isUserBlocked,
    formatDate
  };
}