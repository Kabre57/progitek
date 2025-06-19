import React from 'react';
import { 
  Users, 
  Building, 
  UserCheck, 
  ClipboardList, 
  Wrench, 
  TrendingUp,
  Shield,
  Bell,
  Settings,
  BarChart3
} from 'lucide-react';

export const TestIcons: React.FC = () => {
  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Test des icônes Lucide</h3>
      <div className="grid grid-cols-5 gap-4">
        <div className="flex flex-col items-center p-2">
          <Users className="w-8 h-8 text-blue-500 mb-2" />
          <span className="text-xs">Users</span>
        </div>
        <div className="flex flex-col items-center p-2">
          <Building className="w-8 h-8 text-green-500 mb-2" />
          <span className="text-xs">Building</span>
        </div>
        <div className="flex flex-col items-center p-2">
          <UserCheck className="w-8 h-8 text-purple-500 mb-2" />
          <span className="text-xs">UserCheck</span>
        </div>
        <div className="flex flex-col items-center p-2">
          <ClipboardList className="w-8 h-8 text-yellow-500 mb-2" />
          <span className="text-xs">ClipboardList</span>
        </div>
        <div className="flex flex-col items-center p-2">
          <Wrench className="w-8 h-8 text-red-500 mb-2" />
          <span className="text-xs">Wrench</span>
        </div>
        <div className="flex flex-col items-center p-2">
          <TrendingUp className="w-8 h-8 text-emerald-500 mb-2" />
          <span className="text-xs">TrendingUp</span>
        </div>
        <div className="flex flex-col items-center p-2">
          <Shield className="w-8 h-8 text-indigo-500 mb-2" />
          <span className="text-xs">Shield</span>
        </div>
        <div className="flex flex-col items-center p-2">
          <Bell className="w-8 h-8 text-orange-500 mb-2" />
          <span className="text-xs">Bell</span>
        </div>
        <div className="flex flex-col items-center p-2">
          <Settings className="w-8 h-8 text-gray-500 mb-2" />
          <span className="text-xs">Settings</span>
        </div>
        <div className="flex flex-col items-center p-2">
          <BarChart3 className="w-8 h-8 text-pink-500 mb-2" />
          <span className="text-xs">BarChart3</span>
        </div>
      </div>
    </div>
  );
};