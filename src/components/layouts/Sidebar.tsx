import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  Wrench, 
  ClipboardList, 
  Settings, 
  Bell,
  BarChart3,
  Shield,
  LogOut,
  Building,
  Database
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Utilisateurs', href: '/users', icon: Users },
  { name: 'Clients', href: '/clients', icon: Building },
  { name: 'Techniciens', href: '/technicians', icon: UserCheck },
  { name: 'Missions', href: '/missions', icon: ClipboardList },
  { name: 'Interventions', href: '/interventions', icon: Wrench },
  { name: 'Rapports', href: '/reports', icon: BarChart3 },
  { name: 'Audit', href: '/audit', icon: Shield },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Paramètres', href: '/settings', icon: Settings },
  { name: 'Test Supabase', href: '/test-supabase', icon: Database },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 shadow-lg transform transition-transform duration-300 ease-in-out ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    } lg:translate-x-0 lg:static lg:inset-0`}>
      
      {/* Logo et fermeture mobile */}
      <div className="flex items-center justify-between h-16 px-6 bg-blue-600 dark:bg-blue-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <img src="/logo.svg" alt="Parabellum" className="w-6 h-6" />
          </div>
          <span className="text-white font-bold text-lg">Parabellum</span>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1 rounded-md text-white hover:bg-blue-700 transition-colors"
        >
          ×
        </button>
      </div>

      {/* Profil utilisateur */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <span className="text-blue-600 dark:text-blue-400 font-medium">
              {user?.prenom?.charAt(0)}{user?.nom?.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {user?.prenom} {user?.nom}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {user?.role?.libelle}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={onClose}
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 border-r-2 border-blue-600'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <item.icon className={`mr-3 w-5 h-5 transition-colors ${
                isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 group-hover:text-gray-500'
              }`} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Bouton déconnexion */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={logout}
          className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <LogOut className="mr-3 w-5 h-5" />
          Déconnexion
        </button>
      </div>
    </div>
  );
};