import React, { useState, useEffect } from 'react';
import { DataTable } from '../../components/ui/DataTable';
import { ClientModal } from '../../components/modals/ClientModal';
import { DeleteConfirmModal } from '../../components/modals/DeleteConfirmModal';
import { Client } from '../../types';
import { clientService } from '../../services/clientService';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Plus, Edit, Trash2, Building, Mail, Phone, MapPin, Calendar, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';

export const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSort, setCurrentSort] = useState<{ key: string; direction: 'asc' | 'desc' } | undefined>();
  
  // Modales
  const [showClientModal, setShowClientModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setIsLoading(true);
      // Récupération des clients depuis l'API via le service
      const fetchedClients = await clientService.getAllClients();
      setClients(fetchedClients);
    } catch (error) {
      console.error('Erreur lors du chargement des clients:', error);
      toast.error('Erreur lors du chargement des clients');
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

  const handleCreateClient = () => {
    setSelectedClient(null);
    setShowClientModal(true);
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setShowClientModal(true);
  };

  const handleDeleteClient = (client: Client) => {
    setClientToDelete(client);
    setShowDeleteModal(true);
  };

  const handleSaveClient = async (clientData: any) => {
    try {
      if (selectedClient) {
        // Modification
        const updatedClient = await clientService.updateClient(selectedClient.id, clientData);
        setClients(clients.map(c => c.id === selectedClient.id ? updatedClient : c));
        toast.success('Client mis à jour avec succès');
      } else {
        // Création
        const newClient = await clientService.createClient(clientData);
        setClients([...clients, newClient]);
        toast.success('Client créé avec succès');
      }
      setShowClientModal(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du client:', error);
      toast.error('Erreur lors de la sauvegarde du client');
      throw error;
    }
  };

  const confirmDeleteClient = async () => {
    if (!clientToDelete) return;
    
    try {
      await clientService.deleteClient(clientToDelete.id);
      setClients(clients.filter(client => client.id !== clientToDelete.id));
      setShowDeleteModal(false);
      toast.success('Client supprimé avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression du client:', error);
      toast.error('Erreur lors de la suppression du client');
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

  const getCardTypeColor = (type: string) => {
    switch (type) {
      case 'Premium':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'Enterprise':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'Standard':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const columns = [
    {
      key: 'nom',
      label: 'Client',
      sortable: true,
      render: (value: string, row: Client) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
            <Building className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {row.nom}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {row.entreprise}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'email',
      label: 'Contact',
      render: (value: string, row: Client) => (
        <div className="space-y-1">
          <div className="flex items-center text-sm text-gray-900 dark:text-white">
            <Mail className="w-4 h-4 mr-2 text-gray-400" />
            {row.email}
          </div>
          {row.telephone && (
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Phone className="w-4 h-4 mr-2 text-gray-400" />
              {row.telephone}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'type_de_carte',
      label: 'Type de carte',
      sortable: true,
      render: (value: string) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCardTypeColor(value)}`}>
          {value}
        </span>
      )
    },
    {
      key: 'statut',
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
      key: 'localisation',
      label: 'Localisation',
      render: (value: string) => value ? (
        <div className="flex items-center text-sm text-gray-900 dark:text-white">
          <MapPin className="w-4 h-4 mr-2 text-gray-400" />
          {value}
        </div>
      ) : '-'
    },
    {
      key: 'date_d_inscription',
      label: 'Date d\'inscription',
      sortable: true,
      render: (value: string) => (
        <div className="flex items-center text-sm text-gray-900 dark:text-white">
          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
          {format(new Date(value), 'dd/MM/yyyy', { locale: fr })}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value: any, row: Client) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleEditClient(row)}
            className="p-1 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            title="Modifier"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteClient(row)}
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
            Gestion des clients
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gérez vos clients et leurs informations
          </p>
        </div>
        <button 
          onClick={handleCreateClient}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau client
        </button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Building className="w-8 h-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total clients</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{clients.length}</p>
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
                {clients.filter(c => c.statut === 'active').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Premium</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {clients.filter(c => c.type_de_carte === 'Premium').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">En attente</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {clients.filter(c => c.statut === 'pending').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau des clients */}
      <DataTable
        columns={columns}
        data={clients}
        searchable={true}
        filterable={true}
        onSearch={handleSearch}
        onSort={handleSort}
        currentSort={currentSort}
        emptyMessage="Aucun client trouvé"
      />

      {/* Modales */}
      <ClientModal
        isOpen={showClientModal}
        onClose={() => setShowClientModal(false)}
        client={selectedClient}
        onSave={handleSaveClient}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteClient}
        title="Supprimer le client"
        message="Êtes-vous sûr de vouloir supprimer ce client ?"
        itemName={clientToDelete ? clientToDelete.nom : ''}
      />
    </div>
  );
};