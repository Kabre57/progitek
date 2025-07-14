import React from 'react';

export const MaintenancePage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 text-center px-4">
      <div>
        <h1 className="text-3xl font-bold text-red-600">🚧 Maintenance en cours</h1>
        <p className="mt-4 text-gray-700">
          Le serveur backend est actuellement inaccessible.<br />
          Merci de réessayer dans quelques minutes.
        </p>
      </div>
    </div>
  );
};
