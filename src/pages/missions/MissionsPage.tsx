import React, { useState, useEffect } from 'react';
import { DataTable } from '../../components/ui/DataTable';
import { MissionModal } from '../../components/modals/MissionModal';
import { DeleteConfirmModal } from '../../components/modals/DeleteConfirmModal';
import { Mission, Client } from '../../types';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Plus, Edit, Trash2, ClipboardList, Building, Calendar, FileText, Target, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';

export const MissionsPage: React.FC = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSort, setCurrentSort] = useState<{ key: string; direction: 'asc' | 'desc' } | undefined>();
  
  // Modales
  const [showMissionModal, setShowMissionModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [missionToDelete, setMissionToDelete] = useState<Mission | null>(null);

  useEffect(() => {
    loadMissions();
    loadClients();
  }, []);

  const loadMissions = async () => {
    try {
      setIsLoading(true);
      // Simulation des données
      const mockMissions: Mission[] = [
        {
          num_intervention: 1001,
          nature_intervention: 'Maintenance réseau',
          objectif_du_contrat: 'Maintenance préventive du réseau informatique',
          description: 'Vérification et maintenance complète de l\'infrastructure réseau, mise à jour des équipements et optimisation des performances.',
          date_sortie_fiche_intervention: '2024-01-15',
          client: {
            id: 1,
            nom: 'INFAS',
            email: 'contact@techcorp.com',
            telephone: '+225 07 07 07 07',
            entreprise: 'INFAS',
            date_d_inscription: '2024-01-01T00:00:00Z'
          }
        },
        {
          num_intervention: 1002,
          nature_intervention: 'Installation serveur',
          objectif_du_contrat: 'Installation et configuration d\'un nouveau serveur',
          description: 'Installation complète d\'un serveur Dell PowerEdge, configuration du système d\'exploitation et mise en place des services de base.',
          date_sortie_fiche_intervention: '2024-01-18',
          client: {
            id: 2,
            nom: 'DataSys Industries',
            email: 'info@datasys.fr',
            telephone: '+33 1 98 76 54 32',
            entreprise: 'DataSys Industries',
            date_d_inscription: '2024-01-05T00:00:00Z'
          }
        },
        {
          num_intervention: 1003,
          nature_intervention: 'Audit développeur web',
          objectif_du_contrat: 'Audit complet de la développeur web informatique',
          description: 'Évaluation complète de la développeur web du système d\'information, test de pénétration et recommandations d\'amélioration.',
          date_sortie_fiche_intervention: '2024-01-20',
          client: {
            id: 3,
            nom: 'InnovateTech',
            email: 'hello@innovatetech.com',
            telephone: '+33 1 11 22 33 44',
            entreprise: 'InnovateTech',
            date_d_inscription: '2024-01-10T00:00:00Z'
          }
        }
      ];
      setMissions(mockMissions);
    } catch (error) {
      console.error('Erreur lors du chargement des missions:', error);
      toast.error('Erreur lors du chargement des missions');
    } finally {
      setIsLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const mockClients: Client[] = [
        {
          id: 1,
          nom: 'INFAS',
          email: 'contact@techcorp.com',
          entreprise: 'INFAS',
          date_d_inscription: '2024-01-01T00:00:00Z'
        },
        {
          id: 2,
          nom: 'DataSys Industries',
          email: 'info@datasys.fr',
          entreprise: 'DataSys Industries',
          date_d_inscription: '2024-01-05T00:00:00Z'
        },
        {
          id: 3,
          nom: 'InnovateTech',
          email: 'hello@innovatetech.com',
          entreprise: 'InnovateTech',
          date_d_inscription: '2024-01-10T00:00:00Z'
        }
      ];
      setClients(mockClients);
    } catch (error) {
      console.error('Erreur lors du chargement des clients:', error);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    setCurrentSort({ key, direction });
  };

  const handleCreateMission = () => {
    setSelectedMission(null);
    setShowMissionModal(true);
  };

  const handleEditMission = (mission: Mission) => {
    setSelectedMission(mission);
    setShowMissionModal(true);
  };

  const handleDeleteMission = (mission: Mission) => {
    setMissionToDelete(mission);
    setShowDeleteModal(true);
  };

  const handleSaveMission = async (missionData: any) => {
    try {
      if (selectedMission) {
        // Modification
        const client = clients.find(c => c.id === missionData.client_id);
        const updatedMission = { 
          ...selectedMission, 
          ...missionData,
          client: client!
        };
        setMissions(missions.map(m => m.num_intervention === selectedMission.num_intervention ? updatedMission : m));
      } else {
        // Création
        const client = clients.find(c => c.id === missionData.client_id);
        const newMission = {
          num_intervention: Math.max(...missions.map(m => m.num_intervention)) + 1,
          ...missionData,
          client: client!
        };
        setMissions([...missions, newMission]);
      }
    } catch (error) {
      throw error;
    }
  };

  const confirmDeleteMission = async () => {
    if (!missionToDelete) return;
    
    try {
      setMissions(missions.filter(mission => mission.num_intervention !== missionToDelete.num_intervention));
      toast.success('Mission supprimée avec succès');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const getStatusColor = (date: string) => {
    const today = new Date();
    const missionDate = new Date(date);
    const diffTime = missionDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
    } else if (diffDays <= 3) {
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300';
    } else {
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300';
    }
  };

  const getStatusText = (date: string) => {
    const today = new Date();
    const missionDate = new Date(date);
    const diffTime = missionDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return 'En retard';
    } else if (diffDays <= 3) {
      return 'Urgent';
    } else {
      return 'Planifiée';
    }
  };

  const columns = [
    {
      key: 'num_intervention',
      label: 'N° Mission',
      sortable: true,
      render: (value: number) => (
        <div className="font-mono text-sm font-medium text-gray-900 dark:text-white">
          #{value}
        </div>
      )
    },
    {
      key: 'nature_intervention',
      label: 'Nature',
      sortable: true,
      render: (value: string, row: Mission) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {value}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
            {row.objectif_du_contrat}
          </div>
        </div>
      )
    },
    {
      key: 'client',
      label: 'Client',
      sortable: true,
      render: (value: Client) => (
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
            <Building className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {value.nom}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {value.entreprise}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'date_sortie_fiche_intervention',
      label: 'Date prévue',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-900 dark:text-white">
            {format(new Date(value), 'dd/MM/yyyy', { locale: fr })}
          </span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Statut',
      render: (value: any, row: Mission) => {
        const statusColor = getStatusColor(row.date_sortie_fiche_intervention || '');
        const statusText = getStatusText(row.date_sortie_fiche_intervention || '');
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
            <div className="w-1.5 h-1.5 bg-current rounded-full mr-1"></div>
            {statusText}
          </span>
        );
      }
    },
    {
      key: 'description',
      label: 'Description',
      render: (value: string) => (
        <div className="max-w-xs">
          <p className="text-sm text-gray-900 dark:text-white truncate" title={value}>
            {value}
          </p>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value: any, row: Mission) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleEditMission(row)}
            className="p-1 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            title="Modifier"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            className="p-1 text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 transition-colors"
            title="Voir détails"
          >
            <FileText className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteMission(row)}
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
            Gestion des missions
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Planifiez et suivez vos missions d'intervention
          </p>
        </div>
        <button 
          onClick={handleCreateMission}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle mission
        </button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <ClipboardList className="w-8 h-8 text-purple-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total missions</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{missions.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Planifiées</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {missions.filter(m => {
                  const today = new Date();
                  const missionDate = new Date(m.date_sortie_fiche_intervention || '');
                  return missionDate > today;
                }).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-amber-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Urgentes</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {missions.filter(m => {
                  const today = new Date();
                  const missionDate = new Date(m.date_sortie_fiche_intervention || '');
                  const diffTime = missionDate.getTime() - today.getTime();
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  return diffDays <= 3 && diffDays >= 0;
                }).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">En retard</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {missions.filter(m => {
                  const today = new Date();
                  const missionDate = new Date(m.date_sortie_fiche_intervention || '');
                  return missionDate < today;
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau des missions */}
      <DataTable
        columns={columns}
        data={missions}
        searchable={true}
        filterable={true}
        onSearch={handleSearch}
        onSort={handleSort}
        currentSort={currentSort}
        emptyMessage="Aucune mission trouvée"
      />

      {/* Modales */}
      <MissionModal
        isOpen={showMissionModal}
        onClose={() => setShowMissionModal(false)}
        mission={selectedMission}
        onSave={handleSaveMission}
        clients={clients}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteMission}
        title="Supprimer la mission"
        message="Êtes-vous sûr de vouloir supprimer cette mission ?"
        itemName={missionToDelete ? `#${missionToDelete.num_intervention} - ${missionToDelete.nature_intervention}` : ''}
      />
    </div>
  );
};