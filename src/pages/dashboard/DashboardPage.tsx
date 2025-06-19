import React, { useState, useEffect } from 'react';
import { StatCard } from '../../components/ui/StatCard';
import { TestIcons } from '../../components/ui/TestIcons';
import { 
  Users, 
  Building, 
  UserCheck, 
  ClipboardList, 
  Wrench, 
  TrendingUp, 
  Clock,
  CheckCircle
} from 'lucide-react';
import { dashboardService } from '../../services/dashboardService';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { DashboardStats } from '../../types';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        // Simulation des données en attendant l'API
        const mockStats: DashboardStats = {
          totalUsers: 127,
          totalClients: 85,
          totalTechniciens: 24,
          totalMissions: 342,
          totalInterventions: 1247,
          activeInterventions: 18
        };

        const mockChartData = [
          { name: 'Jan', interventions: 65, missions: 28 },
          { name: 'Fév', interventions: 78, missions: 32 },
          { name: 'Mar', interventions: 90, missions: 41 },
          { name: 'Avr', interventions: 103, missions: 38 },
          { name: 'Mai', interventions: 112, missions: 47 },
          { name: 'Jun', interventions: 98, missions: 35 }
        ];

        setStats(mockStats);
        setChartData(mockChartData);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Tableau de bord
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Vue d'ensemble de l'activité de votre système de gestion
        </p>
      </div>

      {/* Test des icônes */}
      <TestIcons />

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Utilisateurs"
          value={stats?.totalUsers || 0}
          change={{ value: 8.2, type: 'increase' }}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Clients"
          value={stats?.totalClients || 0}
          change={{ value: 12.5, type: 'increase' }}
          icon={Building}
          color="green"
        />
        <StatCard
          title="Techniciens"
          value={stats?.totalTechniciens || 0}
          change={{ value: 3.1, type: 'increase' }}
          icon={UserCheck}
          color="purple"
        />
        <StatCard
          title="Missions"
          value={stats?.totalMissions || 0}
          change={{ value: 15.3, type: 'increase' }}
          icon={ClipboardList}
          color="yellow"
        />
      </div>

      {/* Graphiques et activité récente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique des interventions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Évolution des interventions
            </h3>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="interventions" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Activité récente */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Activité récente
            </h3>
            <Clock className="w-5 h-5 text-blue-500" />
          </div>
          <div className="space-y-4">
            {[
              {
                icon: CheckCircle,
                title: 'Intervention terminée',
                description: 'Maintenance réseau chez TechCorp',
                time: 'Il y a 2h',
                color: 'text-emerald-500'
              },
              {
                icon: Wrench,
                title: 'Nouvelle intervention',
                description: 'Installation serveur - DataSys',
                time: 'Il y a 4h',
                color: 'text-blue-500'
              },
              {
                icon: Users,
                title: 'Nouveau technicien',
                description: 'Marie Dubois - Spécialité Réseau',
                time: 'Il y a 6h',
                color: 'text-purple-500'
              },
              {
                icon: Building,
                title: 'Nouveau client',
                description: 'InnovateTech Solutions',
                time: 'Il y a 1j',
                color: 'text-amber-500'
              }
            ].map((item, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-700 ${item.color}`}>
                  <item.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {item.title}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {item.description}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {item.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Graphique missions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Répartition des missions par mois
          </h3>
          <ClipboardList className="w-5 h-5 text-purple-500" />
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
            <XAxis dataKey="name" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: 'none', 
                borderRadius: '8px',
                color: '#F9FAFB'
              }} 
            />
            <Bar dataKey="missions" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};