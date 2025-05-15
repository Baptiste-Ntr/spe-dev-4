'use client';

import * as Select from '@radix-ui/react-select';
import { CheckIcon, PlusIcon } from '@radix-ui/react-icons';
import { Role } from '@/types/model';
import * as Dialog from '@radix-ui/react-dialog';

interface FilterBarProps {
  roleFilter: string;
  statusFilter: string;
  onRoleFilterChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onCreateUser: () => void;
}

export default function FilterBar({
  roleFilter,
  statusFilter,
  onRoleFilterChange,
  onStatusFilterChange,
  onCreateUser
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Select.Root value={roleFilter} onValueChange={onRoleFilterChange}>
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
      
      <Select.Root value={statusFilter} onValueChange={onStatusFilterChange}>
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
      
      <button 
        onClick={onCreateUser}
        className="inline-flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
      >
        <PlusIcon className="mr-2 h-4 w-4" />
        Nouvel utilisateur
      </button>
    </div>
  );
}