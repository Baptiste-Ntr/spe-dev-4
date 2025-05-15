'use client';

import { useUsers } from '@/hooks/useUsers';
import SearchBar from '@/components/admin/SearchBar';
import FilterBar from '@/components/admin/FilterBar';
import UserTable from '@/components/admin/UserTable';
import UserFormModal from '@/components/admin/UserFormModal';
import { LoadingState, EmptyState } from '@/components/admin/StateComponents';

export default function AdminPage() {
  const {
    // États
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
    createUser,
    updateUser,
    toggleUserStatus,
    deleteUser,
    
    // Utilitaires
    isUserBlocked,
    formatDate
  } = useUsers();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Administration des utilisateurs</h1>
      
      {/* Filtres et recherche */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <SearchBar 
            value={searchTerm}
            onChange={setSearchTerm}
          />
          
          <FilterBar 
            roleFilter={roleFilter}
            statusFilter={statusFilter}
            onRoleFilterChange={setRoleFilter}
            onStatusFilterChange={setStatusFilter}
            onCreateUser={() => setShowCreateModal(true)}
          />
        </div>
      </div>
      
      {/* Liste des utilisateurs */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <LoadingState />
        ) : filteredUsers.length === 0 ? (
          <EmptyState />
        ) : (
          <UserTable 
            users={filteredUsers}
            isUserBlocked={isUserBlocked}
            formatDate={formatDate}
            onEdit={(user) => {
              setUserToEdit(user);
              setShowEditModal(true);
            }}
            onToggleStatus={toggleUserStatus}
            onDelete={deleteUser}
          />
        )}
      </div>
      
      {/* Modales */}
      {showCreateModal && (
        <UserFormModal
          title="Créer un nouvel utilisateur"
          open={showCreateModal}
          onOpenChange={setShowCreateModal}
          onSubmit={createUser}
        />
      )}
      
      {showEditModal && userToEdit && (
        <UserFormModal
          title="Modifier l'utilisateur"
          user={userToEdit}
          open={showEditModal}
          onOpenChange={setShowEditModal}
          onSubmit={(data) => updateUser(userToEdit.id!, data)}
        />
      )}
    </div>
  );
}