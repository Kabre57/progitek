import React, { useState, useEffect } from 'react';
import { DataTable } from '../../components/ui/DataTable';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Shield, Eye, Search, Filter, AlertTriangle, CheckCircle, Clock, User, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AuditLog {
  id: number;
  user_id: number;
  username: string;
  action_type: string;
  entity_type: string;
  entity_id: number;
  details: string;
  ip_address: string;
  timestamp: string;
}

export const AuditPage: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSort, setCurrentSort] = useState<{ key: string; direction: 'asc' | 'desc' } | undefined>();
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const loadAuditLogs = async () => {
    try {
      setIsLoading(true);
      // Simulation des données
      const mockAuditLogs: AuditLog[] = [
        {
          id: 1,
          user_id: 1,
          username: 'Konan.Yane@progitek.com',
          action_type: 'CREATE',
          entity_type: 'User',
          entity_id: 5,
          details: 'Création d\'un nouvel utilisateur: Theodore Kabres',
          ip_address: '192.168.1.100',
          timestamp: '2024-01-15T10:30:00Z'
        },
        {
          id: 2,
          user_id: 2,
          username: 'Theodore.Kabres@progitek.com',
          action_type: 'UPDATE',
          entity_type: 'Client',
          entity_id: 3,
          details: 'Modification des informations client: INFAS',
          ip_address: '192.168.1.101',
          timestamp: '2024-01-15T11:45:00Z'
        },
        {
          id: 3,
          user_id: 1,
          username: 'Konan.Yane@progitek.com',
          action_type: 'DELETE',
          entity_type: 'Mission',
          entity_id: 1005,
          details: 'Suppression de la mission #1005',
          ip_address: '192.168.1.100',
          timestamp: '2024-01-15T14:20:00Z'
        },
        {
          id: 4,
          user_id: 3,
          username: 'KOUASSI.BEIBRO@progitek.com',
          action_type: 'LOGIN',
          entity_type: 'Auth',
          entity_id: 3,
          details: 'Connexion utilisateur réussie',
          ip_address: '192.168.1.102',
          timestamp: '2024-01-15T09:15:00Z'
        },
        {
          id: 5,
          user_id: 2,
          username: 'Theodore.Kabres@progitek.com',
          action_type: 'CREATE',
          entity_type: 'Intervention',
          entity_id: 25,
          details: 'Création d\'une nouvelle intervention pour la mission #1003',
          ip_address: '192.168.1.101',
          timestamp: '2024-01-15T16:30:00Z'
        }
      ];
      setAuditLogs(mockAuditLogs);
    } catch (error) {
      console.error('Erreur lors du chargement des logs d\'audit:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    setCurrentSort({ key, direction });
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'DELETE':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'LOGIN':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'LOGOUT':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      default:
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE':
        return CheckCircle;
      case 'UPDATE':
        return Clock;
      case 'DELETE':
        return AlertTriangle;
      case 'LOGIN':
      case 'LOGOUT':
        return User;
      default:
        return Eye;
    }
  };

  const getActionText = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'Création';
      case 'UPDATE':
        return 'Modification';
      case 'DELETE':
        return 'Suppression';
      case 'LOGIN':
        return 'Connexion';
      case 'LOGOUT':
        return 'Déconnexion';
      default:
        return action;
    }
  };

  const columns = [
    {
      key: 'timestamp',
      label: 'Date/Heure',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center text-sm text-gray-900 dark:text-white">
          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
          {format(new Date(value), 'dd/MM/yyyy HH:mm:ss', { locale: fr })}
        </div>
      )
    },
    {
      key: 'username',
      label: 'Utilisateur',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {value}
          </span>
        </div>
      )
    },
    {
      key: 'action_type',
      label: 'Action',
      sortable: true,
      render: (value: string) => {
        const Icon = getActionIcon(value);
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(value)}`}>
            <Icon className="w-3 h-3 mr-1" />
            {getActionText(value)}
          </span>
        );
      }
    },
    {
      key: 'entity_type',
      label: 'Entité',
      sortable: true,
      render: (value: string, row: AuditLog) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white text-sm">
            {value}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            ID: {row.entity_id}
          </div>
        </div>
      )
    },
    {
      key: 'details',
      label: 'Détails',
      render: (value: string) => (
        <div className="max-w-xs">
          <p className="text-sm text-gray-900 dark:text-white truncate" title={value}>
            {value}
          </p>
        </div>
      )
    },
    {
      key: 'ip_address',
      label: 'Adresse IP',
      render: (value: string) => (
        <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
          {value}
        </span>
      )
    }
  ];

  const filteredLogs = auditLogs.filter(log => {
    if (selectedFilter === 'all') return true;
    return log.action_type === selectedFilter;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const actionCounts = auditLogs.reduce((acc, log) => {
    acc[log.action_type] = (acc[log.action_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Journal d'audit
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Consultez l'historique des actions effectuées dans le système
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Toutes les actions</option>
            <option value="CREATE">Créations</option>
            <option value="UPDATE">Modifications</option>
            <option value="DELETE">Suppressions</option>
            <option value="LOGIN">Connexions</option>
          </select>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Shield className="w-8 h-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total événements</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{auditLogs.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Créations</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{actionCounts.CREATE || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <Clock className="w-4 h-4 text-blue-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Modifications</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{actionCounts.UPDATE || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Suppressions</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{actionCounts.DELETE || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-purple-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Connexions</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{actionCounts.LOGIN || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alertes de développeur web */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
              Activité suspecte détectée
            </h3>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
              3 tentatives de connexion échouées depuis l'adresse IP 192.168.1.105 dans les dernières 24h.
            </p>
            <button className="text-sm text-amber-800 dark:text-amber-200 underline mt-2 hover:no-underline">
              Voir les détails
            </button>
          </div>
        </div>
      </div>

      {/* Tableau des logs d'audit */}
      <DataTable
        columns={columns}
        data={filteredLogs}
        searchable={true}
        filterable={false}
        onSearch={handleSearch}
        onSort={handleSort}
        currentSort={currentSort}
        emptyMessage="Aucun événement d'audit trouvé"
      />
    </div>
  );
};