import React, { useState, useEffect } from 'react';
import { AdvancedDataTable } from '../../components/ui/AdvancedDataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { DurationCalculator } from '../../components/ui/DurationCalculator';
import { RealTimeStats } from '../../components/ui/RealTimeStats';
import { InterventionModal } from '../../components/modals/InterventionModal';
import { DeleteConfirmModal } from '../../components/modals/DeleteConfirmModal';
import { Intervention, Mission, Technicien } from '../../types';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Plus, Edit, Trash2, Wrench, Clock, CheckCircle, User, Calendar, Play, Pause, Square, Users, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { useAdvancedTable } from '../../hooks/useAdvancedTable';

export const InterventionsPage: React.FC = () => {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [technicians, setTechnicians] = useState<Technicien[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modales
  const [showInterventionModal, setShowInterventionModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedIntervention, setSelectedIntervention] = useState<Intervention | null>(null);
  const [interventionToDelete, setInterventionToDelete] = useState<Intervention | null>(null);

  // Hook pour table avancée
  const {
    data: filteredInterventions,
    handleSort,
    handleFilter,
    handleSearch,
    handleSelectRow,
    handleSelectAll,
    exportData,
    resetFilters,
    sortConfig,
    selectedRows,
    hasFilters,
    hasSelection
  } = useAdvancedTable({
    data: interventions,
    searchFields: ['mission.nature_intervention', 'technicien.nom', 'technicien.prenom'],
    initialSort: { key: 'date_heure_debut', direction: 'desc' }
  });

  useEffect(() => {
    loadInterventions();
    loadMissions();
    loadTechnicians();
  }, []);

  const loadInterventions = async () => {
    try {
      setIsLoading(true);
      // Simulation des données avec plus d'exemples
      const mockInterventions: Intervention[] = [
        {
          id: 1,
          date_heure_debut: '2024-01-15T09:00:00Z',
          date_heure_fin: '2024-01-15T12:30:00Z',
          duree: 3.5,
          mission: {
            num_intervention: 1001,
            nature_intervention: 'Maintenance réseau',
            objectif_du_contrat: 'Maintenance préventive du réseau informatique',
            client: {
              id: 1,
              nom: 'INFAS',
              email: 'contact@techcorp.com',
              entreprise: 'INFAS',
              date_d_inscription: '2024-01-01T00:00:00Z'
            }
          },
          technicien: {
            id: 1,
            nom: 'Yane',
            prenom: 'Konan',
            contact: '+225 06 12 34 56 78',
            specialite: { id: 1, libelle: 'Réseau' }
          }
        },
        {
          id: 2,
          date_heure_debut: '2024-01-16T14:00:00Z',
          date_heure_fin: null,
          duree: null,
          mission: {
            num_intervention: 1002,
            nature_intervention: 'Installation serveur',
            objectif_du_contrat: 'Installation et configuration d\'un nouveau serveur',
            client: {
              id: 2,
              nom: 'DataSys Industries',
              email: 'info@datasys.fr',
              entreprise: 'DataSys Industries',
              date_d_inscription: '2024-01-05T00:00:00Z'
            }
          },
          technicien: {
            id: 2,
            nom: 'Kabres',
            prenom: 'Theodore',
            contact: '+225 07 57 39 01 57',
            specialite: { id: 2, libelle: 'développeur web' }
          }
        },
        {
          id: 3,
          date_heure_debut: '2024-01-18T10:00:00Z',
          date_heure_fin: null,
          duree: null,
          mission: {
            num_intervention: 1003,
            nature_intervention: 'Audit développeur web',
            objectif_du_contrat: 'Audit complet de la développeur web informatique',
            client: {
              id: 3,
              nom: 'InnovateTech',
              email: 'hello@innovatetech.com',
              entreprise: 'InnovateTech',
              date_d_inscription: '2024-01-10T00:00:00Z'
            }
          },
          technicien: {
            id: 3,
            nom: 'BEIBRO',
            prenom: 'KOUASSI',
            contact: '+225 07 09 60 23 18 60',
            specialite: { id: 3, libelle: 'Hardware' }
          }
        }
      ];
      setInterventions(mockInterventions);
    } catch (error) {
      console.error('Erreur lors du chargement des interventions:', error);
      toast.error('Erreur lors du chargement des interventions');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMissions = async () => {
    try {
      const mockMissions: Mission[] = [
        {
          num_intervention: 1001,
          nature_intervention: 'Maintenance réseau',
          client: {
            id: 1,
            nom: 'INFAS',
            email: 'contact@techcorp.com',
            entreprise: 'INFAS',
            date_d_inscription: '2024-01-01T00:00:00Z'
          }
        },
        {
          num_intervention: 1002,
          nature_intervention: 'Installation serveur',
          client: {
            id: 2,
            nom: 'DataSys Industries',
            email: 'info@datasys.fr',
            entreprise: 'DataSys Industries',
            date_d_inscription: '2024-01-05T00:00:00Z'
          }
        }
      ];
      setMissions(mockMissions);
    } catch (error) {
      console.error('Erreur lors du chargement des missions:', error);
    }
  };

  const loadTechnicians = async () => {
    try {
      const mockTechnicians: Technicien[] = [
        {
          id: 1,
          nom: 'Yane',
          prenom: 'Konan',
          contact: '+225 06 12 34 56 78',
          specialite: { id: 1, libelle: 'Réseau' }
        },
        {
          id: 2,
          nom: 'Kabres',
          prenom: 'Theodore',
          contact: '+225 07 57 39 01 57',
          specialite: { id: 2, libelle: 'développeur web' }
        }
      ];
      setTechnicians(mockTechnicians);
    } catch (error) {
      console.error('Erreur lors du chargement des techniciens:', error);
    }
  };

  const handleCreateIntervention = () => {
    setSelectedIntervention(null);
    setShowInterventionModal(true);
  };

  const handleEditIntervention = (intervention: Intervention) => {
    setSelectedIntervention(intervention);
    setShowInterventionModal(true);
  };

  const handleDeleteIntervention = (intervention: Intervention) => {
    setInterventionToDelete(intervention);
    setShowDeleteModal(true);
  };

  const handleSaveIntervention = async (interventionData: any) => {
    try {
      if (selectedIntervention) {
        // Modification
        const mission = missions.find(m => m.num_intervention === interventionData.mission_id);
        const technicien = technicians.find(t => t.id === interventionData.technicien_id);
        const updatedIntervention = { 
          ...selectedIntervention, 
          ...interventionData,
          mission: mission!,
          technicien
        };
        setInterventions(interventions.map(i => i.id === selectedIntervention.id ? updatedIntervention : i));
      } else {
        // Création
        const mission = missions.find(m => m.num_intervention === interventionData.mission_id);
        const technicien = technicians.find(t => t.id === interventionData.technicien_id);
        const newIntervention = {
          id: Math.max(...interventions.map(i => i.id)) + 1,
          ...interventionData,
          mission: mission!,
          technicien
        };
        setInterventions([...interventions, newIntervention]);
      }
    } catch (error) {
      throw error;
    }
  };

  const confirmDeleteIntervention = async () => {
    if (!interventionToDelete) return;
    
    try {
      setInterventions(interventions.filter(intervention => intervention.id !== interventionToDelete.id));
      toast.success('Intervention supprimée avec succès');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const getStatusInfo = (intervention: Intervention) => {
    if (intervention.date_heure_fin) {
      return 'completed';
    } else if (intervention.date_heure_debut) {
      const startDate = new Date(intervention.date_heure_debut);
      const now = new Date();
      if (startDate <= now) {
        return 'in_progress';
      } else {
        return 'scheduled';
      }
    } else {
      return 'pending';
    }
  };

  // Statistiques en temps réel
  const realTimeStats = [
    {
      id: 'total',
      label: 'Total interventions',
      value: interventions.length,
      previousValue: interventions.length - 2,
      icon: Wrench,
      color: 'blue' as const
    },
    {
      id: 'in_progress',
      label: 'En cours',
      value: interventions.filter(i => getStatusInfo(i) === 'in_progress').length,
      previousValue: 1,
      icon: Play,
      color: 'blue' as const
    },
    {
      id: 'completed',
      label: 'Terminées',
      value: interventions.filter(i => getStatusInfo(i) === 'completed').length,
      previousValue: 0,
      icon: CheckCircle,
      color: 'green' as const
    },
    {
      id: 'avg_duration',
      label: 'Durée moyenne',
      value: interventions.filter(i => i.duree).reduce((acc, i) => acc + (i.duree || 0), 0) / interventions.filter(i => i.duree).length || 0,
      previousValue: 3.2,
      format: 'duration' as const,
      icon: Clock,
      color: 'purple' as const
    }
  ];

  const columns = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      filterable: false,
      render: (value: number) => (
        <div className="font-mono text-sm font-medium text-gray-900 dark:text-white">
          #{value}
        </div>
      )
    },
    {
      key: 'mission',
      label: 'Mission',
      sortable: true,
      filterable: true,
      filterType: 'text' as const,
      render: (value: Mission) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            #{value.num_intervention} - {value.nature_intervention}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {value.client.nom}
          </div>
        </div>
      )
    },
    {
      key: 'technicien',
      label: 'Technicien',
      filterable: true,
      filterType: 'select' as const,
      filterOptions: technicians.map(t => ({
        value: t.id.toString(),
        label: `${t.prenom} ${t.nom}`
      })),
      render: (value: Technicien | undefined) => value ? (
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
            <span className="text-emerald-600 dark:text-emerald-400 font-medium text-xs">
              {value.prenom.charAt(0)}{value.nom.charAt(0)}
            </span>
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white text-sm">
              {value.prenom} {value.nom}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {value.specialite?.libelle}
            </div>
          </div>
        </div>
      ) : (
        <span className="text-gray-400 dark:text-gray-500">Non assigné</span>
      )
    },
    {
      key: 'date_heure_debut',
      label: 'Début',
      sortable: true,
      filterable: true,
      filterType: 'date' as const,
      render: (value: string | null) => value ? (
        <div className="text-sm text-gray-900 dark:text-white">
          {format(new Date(value), 'dd/MM/yyyy HH:mm', { locale: fr })}
        </div>
      ) : '-'
    },
    {
      key: 'date_heure_fin',
      label: 'Fin',
      render: (value: string | null) => value ? (
        <div className="text-sm text-gray-900 dark:text-white">
          {format(new Date(value), 'dd/MM/yyyy HH:mm', { locale: fr })}
        </div>
      ) : '-'
    },
    {
      key: 'duree',
      label: 'Durée',
      sortable: true,
      render: (value: number | null, row: Intervention) => (
        <DurationCalculator
          startDate={row.date_heure_debut}
          endDate={row.date_heure_fin}
          showDetails={false}
        />
      )
    },
    {
      key: 'status',
      label: 'Statut',
      filterable: true,
      filterType: 'select' as const,
      filterOptions: [
        { value: 'completed', label: 'Terminée' },
        { value: 'in_progress', label: 'En cours' },
        { value: 'scheduled', label: 'Planifiée' },
        { value: 'pending', label: 'En attente' }
      ],
      render: (value: any, row: Intervention) => (
        <StatusBadge
          status={getStatusInfo(row)}
          type="intervention"
          showIcon={true}
        />
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value: any, row: Intervention) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleEditIntervention(row)}
            className="p-1 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            title="Modifier"
          >
            <Edit className="w-4 h-4" />
          </button>
          {!row.date_heure_fin && (
            <button
              className="p-1 text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 transition-colors"
              title="Terminer"
            >
              <Square className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => handleDeleteIntervention(row)}
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
            Gestion des interventions
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Suivez et gérez toutes vos interventions techniques en temps réel
          </p>
        </div>
        <button 
          onClick={handleCreateIntervention}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle intervention
        </button>
      </div>

      {/* Statistiques en temps réel */}
      <RealTimeStats
        stats={realTimeStats}
        refreshInterval={30000}
        onRefresh={async () => {
          // Simulation de mise à jour des stats
          await new Promise(resolve => setTimeout(resolve, 1000));
          return realTimeStats.map(stat => ({
            ...stat,
            value: stat.value + Math.floor(Math.random() * 3) - 1
          }));
        }}
      />

      {/* Tableau avancé des interventions */}
      <AdvancedDataTable
        columns={columns}
        data={filteredInterventions}
        searchable={true}
        filterable={true}
        exportable={true}
        refreshable={true}
        onSearch={handleSearch}
        onSort={(key, direction) => handleSort(key)}
        onFilter={(filters) => {
          Object.entries(filters).forEach(([key, value]) => {
            handleFilter(key, value);
          });
        }}
        onExport={() => exportData('csv')}
        onRefresh={loadInterventions}
        currentSort={sortConfig}
        emptyMessage="Aucune intervention trouvée"
        loading={isLoading}
      />

      {/* Modales */}
      <InterventionModal
        isOpen={showInterventionModal}
        onClose={() => setShowInterventionModal(false)}
        intervention={selectedIntervention}
        onSave={handleSaveIntervention}
        missions={missions}
        technicians={technicians}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteIntervention}
        title="Supprimer l'intervention"
        message="Êtes-vous sûr de vouloir supprimer cette intervention ?"
        itemName={interventionToDelete ? `#${interventionToDelete.id}` : ''}
      />
    </div>
  );
};