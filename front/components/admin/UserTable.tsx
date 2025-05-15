'use client';

import { User, Role } from '@/types/model';

interface UserTableProps {
  users: User[];
  isUserBlocked: (user: User) => boolean;
  formatDate: (date?: Date | string) => string;
  onEdit: (user: User) => void;
  onToggleStatus: (id: string, block: boolean) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

export default function UserTable({
  users,
  isUserBlocked,
  formatDate,
  onEdit,
  onToggleStatus,
  onDelete
}: UserTableProps) {
  return (
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
          {users.map(user => (
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
                <button 
                  onClick={() => onEdit(user)} 
                  className="text-blue-500 hover:underline"
                >
                  Modifier
                </button>
                <button
                  onClick={() => onToggleStatus(user.id!, !isUserBlocked(user))}
                  className={`${
                    !isUserBlocked(user) 
                      ? 'text-orange-500 hover:text-orange-700' 
                      : 'text-green-500 hover:text-green-700'
                  } hover:underline`}
                >
                  {!isUserBlocked(user) ? 'Bloquer' : 'Débloquer'}
                </button>
                <button
                  onClick={() => onDelete(user.id!)}
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
  );
}