import React, { useState, useEffect } from 'react';
import { DataTable } from '../../components/ui/DataTable';
import { UserModal } from '../../components/modals/UserModal';
import { DeleteConfirmModal } from '../../components/modals/DeleteConfirmModal';
import { User, Role } from '../../types';
import { userService } from '../../services/userService';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Plus, Edit, Trash2, Shield, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSort, setCurrentSort] = useState<{ key: string; direction: 'asc' | 'desc' } | undefined>();
  
  // Modales
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      // Simulation des données en attendant l'API
      const mockUsers: User[] = [
        {
          id: 1,
          nom: 'Martin',
          prenom: 'Jean',
          email: 'jean.martin@progitek.com',
          role: { id: 1, libelle: 'Administrator' },
          status: 'active',
          phone: '+33 6 12 34 56 78',
          last_login: '2024-01-15T10:30:00Z',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-15T10:30:00Z'
        },
        {
          id: 2,
          nom: 'Dubois',
          prenom: 'Marie',
          email: 'marie.dubois@progitek.com',
          role: { id: 2, libelle: 'Technician' },
          status: 'active',
          phone: '+33 6 98 76 54 32',
          last_login: '2024-01-14T15:45:00Z',
          created_at: '2024-01-05T00:00:00Z',
          updated_at: '2024-01-14T15:45:00Z'
        },
        {
          id: 3,
          nom: 'Leroy',
          prenom: 'Pierre',
          email: 'pierre.leroy@client.com',
          role: { id: 3, libelle: 'Client' },
          status: 'active',
          phone: '+33 6 11 22 33 44',
          last_login: '2024-01-13T09:15:00Z',
          created_at: '2024-01-10T00:00:00Z',
          updated_at: '2024-01-13T09:15:00Z'
        }
      ];
      setUsers(mockUsers);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setIsLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const mockRoles: Role[] = [
        { id: 1, libelle: 'Administrator' },
        { id: 2, libelle: 'Technician' },
        { id: 3, libelle: 'Client' }
      ];
      setRoles(mockRoles);
    } catch (error) {
      console.error('Erreur lors du chargement des rôles:', error);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    setCurrentSort({ key, direction });
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setShowUserModal(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleSaveUser = async (userData: any) => {
    try {
      if (selectedUser) {
        // Modification
        const updatedUser = { ...selectedUser, ...userData };
        setUsers(users.map(u => u.id === selectedUser.id ? updatedUser : u));
      } else {
        // Création
        const newUser = {
          id: Math.max(...users.map(u => u.id)) + 1,
          ...userData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          role: roles.find(r => r.id === userData.role_id)!
        };
        setUsers([...users, newUser]);
      }
    } catch (error) {
      throw error;
    }
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      setUsers(users.filter(user => user.id !== userToDelete.id));
      toast.success('Utilisateur supprimé avec succès');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Administrator':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'Technician':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'Client':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300';
      case 'inactive':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'pending':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const columns = [
    {
      key: 'nom',
      label: 'Nom complet',
      sortable: true,
      render: (value: string, row: User) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <span className="text-blue-600 dark:text-blue-400 font-medium text-sm">
              {row.prenom.charAt(0)}{row.nom.charAt(0)}
            </span>
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {row.prenom} {row.nom}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {row.email}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      label: 'Rôle',
      sortable: true,
      render: (value: Role) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(value.libelle)}`}>
          <Shield className="w-3 h-3 mr-1" />
          {value.libelle}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Statut',
      sortable: true,
      render: (value: string) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
          <div className="w-1.5 h-1.5 bg-current rounded-full mr-1"></div>
          {value === 'active' ? 'Actif' : value === 'inactive' ? 'Inactif' : 'En attente'}
        </span>
      )
    },
    {
      key: 'phone',
      label: 'Téléphone',
      render: (value: string) => value || '-'
    },
    {
      key: 'last_login',
      label: 'Dernière connexion',
      sortable: true,
      render: (value: string) => value 
        ? format(new Date(value), 'dd/MM/yyyy HH:mm', { locale: fr })
        : 'Jamais'
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value: any, row: User) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleEditUser(row)}
            className="p-1 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            title="Modifier"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => {/* handleSendEmail */}}
            className="p-1 text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 transition-colors"
            title="Envoyer un email"
          >
            <Mail className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteUser(row)}
            className="p-1 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Gestion des utilisateurs
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gérez les comptes utilisateurs, leurs rôles et permissions
          </p>
        </div>
        <button 
          onClick={handleCreateUser}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvel utilisateur
        </button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Shield className="w-8 h-8 text-red-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Administrateurs</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {users.filter(u => u.role.libelle === 'Administrator').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Shield className="w-8 h-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Techniciens</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {users.filter(u => u.role.libelle === 'Technician').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Shield className="w-8 h-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Clients</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {users.filter(u => u.role.libelle === 'Client').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Actifs</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {users.filter(u => u.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau des utilisateurs */}
      <DataTable
        columns={columns}
        data={users}
        searchable={true}
        filterable={true}
        onSearch={handleSearch}
        onSort={handleSort}
        currentSort={currentSort}
        emptyMessage="Aucun utilisateur trouvé"
      />

      {/* Modales */}
      <UserModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        user={selectedUser}
        onSave={handleSaveUser}
        roles={roles}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteUser}
        title="Supprimer l'utilisateur"
        message="Êtes-vous sûr de vouloir supprimer cet utilisateur ?"
        itemName={userToDelete ? `${userToDelete.prenom} ${userToDelete.nom}` : ''}
      />
    </div>
  );
};