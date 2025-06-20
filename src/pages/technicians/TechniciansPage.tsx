import React, { useState, useEffect } from 'react';
import { DataTable } from '../../components/ui/DataTable';
import { TechnicianModal } from '../../components/modals/TechnicianModal';
import { DeleteConfirmModal } from '../../components/modals/DeleteConfirmModal';
import { Technicien, Specialite } from '../../types';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Plus, Edit, Trash2, UserCheck, Phone, Wrench, Award, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export const TechniciansPage: React.FC = () => {
  const [technicians, setTechnicians] = useState<Technicien[]>([]);
  const [specialites, setSpecialites] = useState<Specialite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSort, setCurrentSort] = useState<{ key: string; direction: 'asc' | 'desc' } | undefined>();
  
  // Modales
  const [showTechnicianModal, setShowTechnicianModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState<Technicien | null>(null);
  const [technicianToDelete, setTechnicianToDelete] = useState<Technicien | null>(null);

  useEffect(() => {
    loadTechnicians();
    loadSpecialites();
  }, []);

  const loadTechnicians = async () => {
    try {
      setIsLoading(true);
      // Simulation des données
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
        },
        {
          id: 3,
          nom: 'BEIBRO',
          prenom: 'KOUASSI',
          contact: '+225 07 09 60 23 18 60',
          specialite: { id: 3, libelle: 'Hardware' }
        },
        {
          id: 4,
          nom: 'EVRARD',
          prenom: 'ANGUI',
          contact: '+225 07 68 59 33 71',
          specialite: { id: 4, libelle: 'DevOps' }
        }
      ];
      setTechnicians(mockTechnicians);
    } catch (error) {
      console.error('Erreur lors du chargement des techniciens:', error);
      toast.error('Erreur lors du chargement des techniciens');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSpecialites = async () => {
    try {
      const mockSpecialites: Specialite[] = [
        { id: 1, libelle: 'Réseau' },
        { id: 2, libelle: 'développeur web' },
        { id: 3, libelle: 'Hardware' },
        { id: 4, libelle: 'DevOps' },
        { id: 5, libelle: 'Software' }
      ];
      setSpecialites(mockSpecialites);
    } catch (error) {
      console.error('Erreur lors du chargement des spécialités:', error);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleSort = (key: string, direction: 'asc' | 'desc') => {
    setCurrentSort({ key, direction });
  };

  const handleCreateTechnician = () => {
    setSelectedTechnician(null);
    setShowTechnicianModal(true);
  };

  const handleEditTechnician = (technician: Technicien) => {
    setSelectedTechnician(technician);
    setShowTechnicianModal(true);
  };

  const handleDeleteTechnician = (technician: Technicien) => {
    setTechnicianToDelete(technician);
    setShowDeleteModal(true);
  };

  const handleSaveTechnician = async (technicianData: any) => {
    try {
      if (selectedTechnician) {
        // Modification
        const specialite = specialites.find(s => s.id === technicianData.specialite_id);
        const updatedTechnician = { 
          ...selectedTechnician, 
          ...technicianData,
          specialite 
        };
        setTechnicians(technicians.map(t => t.id === selectedTechnician.id ? updatedTechnician : t));
      } else {
        // Création
        const specialite = specialites.find(s => s.id === technicianData.specialite_id);
        const newTechnician = {
          id: Math.max(...technicians.map(t => t.id)) + 1,
          ...technicianData,
          specialite
        };
        setTechnicians([...technicians, newTechnician]);
      }
    } catch (error) {
      throw error;
    }
  };

  const confirmDeleteTechnician = async () => {
    if (!technicianToDelete) return;
    
    try {
      setTechnicians(technicians.filter(tech => tech.id !== technicianToDelete.id));
      toast.success('Technicien supprimé avec succès');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const getSpecialiteColor = (specialite: string) => {
    const colors = {
      'Réseau': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      'développeur web': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      'Hardware': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      'DevOps': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
      'Software': 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300'
    };
    return colors[specialite as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
  };

  const columns = [
    {
      key: 'nom',
      label: 'Technicien',
      sortable: true,
      render: (value: string, row: Technicien) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
            <span className="text-emerald-600 dark:text-emerald-400 font-medium text-sm">
              {row.prenom.charAt(0)}{row.nom.charAt(0)}
            </span>
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {row.prenom} {row.nom}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Technicien spécialisé
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'specialite',
      label: 'Spécialité',
      sortable: true,
      render: (value: Specialite) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSpecialiteColor(value.libelle)}`}>
          <Wrench className="w-3 h-3 mr-1" />
          {value.libelle}
        </span>
      )
    },
    {
      key: 'contact',
      label: 'Contact',
      render: (value: string) => value ? (
        <div className="flex items-center text-sm text-gray-900 dark:text-white">
          <Phone className="w-4 h-4 mr-2 text-gray-400" />
          {value}
        </div>
      ) : '-'
    },
    {
      key: 'status',
      label: 'Statut',
      render: () => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300">
          <div className="w-1.5 h-1.5 bg-current rounded-full mr-1"></div>
          Disponible
        </span>
      )
    },
    {
      key: 'interventions',
      label: 'Interventions',
      render: () => (
        <div className="text-sm text-gray-900 dark:text-white font-medium">
          {Math.floor(Math.random() * 50) + 10}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value: any, row: Technicien) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleEditTechnician(row)}
            className="p-1 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            title="Modifier"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteTechnician(row)}
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
            Gestion des techniciens
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gérez votre équipe de techniciens et leurs spécialités
          </p>
        </div>
        <button 
          onClick={handleCreateTechnician}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau technicien
        </button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-emerald-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total techniciens</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{technicians.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Disponibles</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{technicians.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Award className="w-8 h-8 text-purple-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Spécialités</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{specialites.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Wrench className="w-8 h-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Interventions</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {technicians.reduce((acc) => acc + Math.floor(Math.random() * 50) + 10, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Répartition par spécialité */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Répartition par spécialité
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {specialites.map((specialite) => {
            const count = technicians.filter(t => t.specialite?.id === specialite.id).length;
            return (
              <div key={specialite.id} className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-2 ${getSpecialiteColor(specialite.libelle)}`}>
                  {specialite.libelle}
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{count}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">technicien{count > 1 ? 's' : ''}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tableau des techniciens */}
      <DataTable
        columns={columns}
        data={technicians}
        searchable={true}
        filterable={true}
        onSearch={handleSearch}
        onSort={handleSort}
        currentSort={currentSort}
        emptyMessage="Aucun technicien trouvé"
      />

      {/* Modales */}
      <TechnicianModal
        isOpen={showTechnicianModal}
        onClose={() => setShowTechnicianModal(false)}
        technician={selectedTechnician}
        onSave={handleSaveTechnician}
        specialites={specialites}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteTechnician}
        title="Supprimer le technicien"
        message="Êtes-vous sûr de vouloir supprimer ce technicien ?"
        itemName={technicianToDelete ? `${technicianToDelete.prenom} ${technicianToDelete.nom}` : ''}
      />
    </div>
  );
};