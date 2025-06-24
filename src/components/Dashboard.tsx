import React, { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';
import { dashboardService } from '../services/dashboardService';
import { 
  Users, 
  Building, 
  Wrench, 
  Briefcase,
  BarChart2,
  Clock,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Settings,
  RefreshCw
} from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Enregistrer les composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const Dashboard: React.FC = () => {
  const { data, loading, error, refetch } = useApi(() => dashboardService.getDashboardData(), []);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Rafraîchir les données toutes les 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
      setLastUpdate(new Date());
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [refetch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">Erreur: {error}</p>
      </div>
    );
  }

  const stats = data?.stats || {
    totalClients: 85,
    totalTechniciens: 24,
    totalMissions: 342,
    totalInterventions: 127,
    missionsEnCours: 15,
    interventionsEnCours: 8
  };

  // Préparer les données pour le graphique d'évolution des interventions
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'];
  const interventionValues = [40, 45, 55, 65, 60, 55];

  // Données pour le graphique d'évolution des interventions
  const interventionsData = {
    labels: months,
    datasets: [
      {
        label: 'Interventions',
        data: interventionValues,
        fill: false,
        borderColor: 'rgb(59, 130, 246)',
        tension: 0.1,
      },
    ],
  };

  // Préparer les données pour le graphique de répartition des missions
  const missionMonths = data?.monthlyStats?.map(item => item.month) || months;
  const missionCounts = data?.monthlyStats?.map(item => item.count) || [25, 30, 35, 40, 45, 35];

  // Données pour le graphique de répartition des missions
  const missionsData = {
    labels: missionMonths,
    datasets: [
      {
        label: 'Missions',
        data: missionCounts,
        backgroundColor: 'rgb(139, 92, 246)',
      },
    ],
  };

  // Options pour les graphiques
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-600">Vue d'ensemble de l'activité de votre système de gestion</p>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg relative">
          <div className="absolute top-0 right-0 mt-4 mr-4">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="flex flex-col">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Utilisateurs
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                127
              </dd>
              <dd className="mt-2 text-sm text-green-600">
                +8.2% vs mois dernier
              </dd>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg relative">
          <div className="absolute top-0 right-0 mt-4 mr-4">
            <Building className="h-6 w-6 text-green-600" />
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="flex flex-col">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Clients
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {stats.totalClients}
              </dd>
              <dd className="mt-2 text-sm text-green-600">
                +5.3% vs mois dernier
              </dd>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg relative">
          <div className="absolute top-0 right-0 mt-4 mr-4">
            <Wrench className="h-6 w-6 text-purple-600" />
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="flex flex-col">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Techniciens
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {stats.totalTechniciens}
              </dd>
              <dd className="mt-2 text-sm text-green-600">
                +3.7% vs mois dernier
              </dd>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg relative">
          <div className="absolute top-0 right-0 mt-4 mr-4">
            <Briefcase className="h-6 w-6 text-yellow-600" />
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="flex flex-col">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Missions
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {stats.totalMissions}
              </dd>
              <dd className="mt-2 text-sm text-green-600">
                +6.2% vs mois dernier
              </dd>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique d'évolution des interventions */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Évolution des interventions</h3>
            <div className="flex items-center text-sm text-gray-500">
              <RefreshCw className="h-4 w-4 mr-1" />
              Dernière mise à jour: {lastUpdate.toLocaleTimeString()}
            </div>
          </div>
          <div className="h-64">
            <Line data={interventionsData} options={chartOptions} />
          </div>
        </div>

        {/* Activité récente */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Activité récente</h3>
            <button 
              onClick={() => refetch()}
              className="text-blue-600 hover:text-blue-800"
              title="Actualiser"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
          <div className="space-y-4">
            {data?.recentActivities?.slice(0, 4).map((activity, index) => (
              <div key={activity.id || index} className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    {activity.entity === 'INTERVENTION' && <Wrench className="h-4 w-4 text-green-600" />}
                    {activity.entity === 'MISSION' && <Briefcase className="h-4 w-4 text-blue-600" />}
                    {activity.entity === 'USER' && <Users className="h-4 w-4 text-purple-600" />}
                    {activity.entity === 'CLIENT' && <Building className="h-4 w-4 text-yellow-600" />}
                    {activity.entity === 'TECHNICIEN' && <Wrench className="h-4 w-4 text-red-600" />}
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.action === 'CREATE' && 'Création'}
                    {activity.action === 'UPDATE' && 'Modification'}
                    {activity.action === 'DELETE' && 'Suppression'}
                    {' '}
                    {activity.entity === 'INTERVENTION' && "d'intervention"}
                    {activity.entity === 'MISSION' && 'de mission'}
                    {activity.entity === 'USER' && "d'utilisateur"}
                    {activity.entity === 'CLIENT' && 'de client'}
                    {activity.entity === 'TECHNICIEN' && 'de technicien'}
                  </p>
                  <p className="text-sm text-gray-500">{activity.details}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(activity.timestamp).toLocaleString('fr-FR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Répartition des missions par mois */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Répartition des missions par mois</h3>
          <button 
            onClick={() => refetch()}
            className="text-blue-600 hover:text-blue-800"
            title="Actualiser"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
        <div className="h-64">
          <Bar data={missionsData} options={chartOptions} />
        </div>
      </div>

      {/* Statistiques supplémentaires */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Taux de réussite</h3>
              <p className="text-3xl font-bold text-gray-900">98.5%</p>
              <p className="text-sm text-gray-500">Interventions réussies</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Temps moyen</h3>
              <p className="text-3xl font-bold text-gray-900">2h 45m</p>
              <p className="text-sm text-gray-500">Durée d'intervention</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Interventions urgentes</h3>
              <p className="text-3xl font-bold text-gray-900">{stats.interventionsEnCours}</p>
              <p className="text-sm text-gray-500">En attente</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};