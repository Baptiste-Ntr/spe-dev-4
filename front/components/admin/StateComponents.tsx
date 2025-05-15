'use client';

export function LoadingState() {
  return (
    <div className="p-8 text-center">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
      <p className="mt-2">Chargement des utilisateurs...</p>
    </div>
  );
}

export function EmptyState() {
  return (
    <div className="p-8 text-center text-gray-500">
      Aucun utilisateur ne correspond aux critères de recherche.
    </div>
  );
}