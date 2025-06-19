import React from 'react';
import { AlertCircle } from 'lucide-react';

export const DemoModeIndicator: React.FC = () => {
  const token = localStorage.getItem('token');
  const isDemoMode = token?.startsWith('demo-token');

  if (!isDemoMode) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-amber-100 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-lg p-3 shadow-lg">
      <div className="flex items-center space-x-2">
        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
          Mode Démo
        </span>
      </div>
      <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
        Backend non disponible - Données simulées
      </p>
    </div>
  );
};