'use client';

import { useState, useEffect } from 'react';
import { User, Role } from '@/types/model';
import * as Dialog from '@radix-ui/react-dialog';
import * as Label from '@radix-ui/react-label';
import * as Checkbox from '@radix-ui/react-checkbox';
import * as Select from '@radix-ui/react-select';
import { Cross2Icon, CheckIcon } from '@radix-ui/react-icons';

interface UserFormData {
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
  role: Role;
  isTwoFactorEnabled?: boolean;
}

interface UserFormModalProps {
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UserFormData) => Promise<boolean>;
  user?: User;
}

export default function UserFormModal({
  title,
  open,
  onOpenChange,
  onSubmit,
  user
}: UserFormModalProps) {
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    role: Role.USER,
    isTwoFactorEnabled: false
  });

  // Réinitialiser le formulaire quand la modal s'ouvre ou un utilisateur change
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (user && !formData.password) {
      const { password, ...dataWithoutPassword } = formData;
      await onSubmit(dataWithoutPassword);
    } else {
      await onSubmit(formData);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
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
    </Dialog.Root>
  );
}