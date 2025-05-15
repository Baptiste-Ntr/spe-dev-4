'use client';

import { MagnifyingGlassIcon } from '@radix-ui/react-icons';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="flex-grow relative">
      <span className="absolute inset-y-0 left-0 flex items-center pl-3">
        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
      </span>
      <input
        type="text"
        placeholder="Rechercher un utilisateur..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full py-2 pl-10 pr-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
}