import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { BarChart3, FileText, Download, Calendar, Filter, TrendingUp, Users, Wrench, Building } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const ReportsPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [chartData, setChartData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);

  useEffect(() => {
    loadReportsData();
  }, [selectedPeriod]);

  const loadReportsData = async () => {
    try {
      setIsLoading(true);
      // Simulation des données
      const mockChartData = [
        { name: 'Jan', interventions: 65, missions: 28, clients: 12 },
        { name: 'Fév', interventions: 78, missions: 32, clients: 15 },
        { name: 'Mar', interventions: 90, missions: 41, clients: 18 },
        { name: 'Avr', interventions: 103, missions: 38, clients: 22 },
        { name: 'Mai', interventions: 112, missions: 47, clients: 25 },
        { name: 'Jun', interventions: 98, missions: 35, clients: 20 }
      ];

      const mockPieData = [
        { name: 'Réseau', value: 35, color: '#3B82F6' },
        { name: 'développeur web', value: 25, color: '#EF4444' },
        { name: 'Hardware', value: 20, color: '#10B981' },
        { name: 'DevOps', value: 15, color: '#8B5CF6' },
        { name: 'Software', value: 5, color: '#F59E0B' }
      ];

      setChartData(mockChartData);
      setPieData(mockPieData);
    } catch (error) {
      console.error('Erreur lors du chargement des rapports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const reportTypes = [
    {
      title: 'Rapport d\'activité mensuel',
      description: 'Vue d\'ensemble des interventions et missions du mois',
      icon: BarChart3,
      color: 'bg-blue-500'
    },
    {
      title: 'Rapport de performance techniciens',
      description: 'Analyse des performances de l\'équipe technique',
      icon: Users,
      color: 'bg-emerald-500'
    },
    {
      title: 'Rapport client',
      description: 'Statistiques et satisfaction des clients',
      icon: Building,
      color: 'bg-purple-500'
    },
    {
      title: 'Rapport d\'interventions',
      description: 'Détail des interventions par type et durée',
      icon: Wrench,
      color: 'bg-amber-500'
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
            Rapports et analyses
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Consultez les statistiques et générez des rapports détaillés
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="quarter">Ce trimestre</option>
            <option value="year">Cette année</option>
          </select>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
            <Filter className="w-4 h-4 mr-2" />
            Filtres
          </button>
        </div>
      </div>

      {/* KPIs rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Interventions totales</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">546</p>
              <p className="text-sm text-emerald-600 dark:text-emerald-400">+12% vs mois dernier</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Wrench className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Temps moyen</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">3.2h</p>
              <p className="text-sm text-red-600 dark:text-red-400">+5% vs mois dernier</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Taux de satisfaction</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">94%</p>
              <p className="text-sm text-emerald-600 dark:text-emerald-400">+2% vs mois dernier</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenus</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">€45,2K</p>
              <p className="text-sm text-emerald-600 dark:text-emerald-400">+18% vs mois dernier</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution des interventions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Évolution des activités
            </h3>
            <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">
              Voir détails
            </button>
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
              <Line type="monotone" dataKey="interventions" stroke="#3B82F6" strokeWidth={3} name="Interventions" />
              <Line type="monotone" dataKey="missions" stroke="#10B981" strokeWidth={3} name="Missions" />
              <Line type="monotone" dataKey="clients" stroke="#8B5CF6" strokeWidth={3} name="Nouveaux clients" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Répartition par spécialité */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Interventions par spécialité
            </h3>
            <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">
              Exporter
            </button>
          </div>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {pieData.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {item.name} ({item.value}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Types de rapports disponibles */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Rapports disponibles
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reportTypes.map((report, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
              <div className="flex items-start space-x-4">
                <div className={`w-10 h-10 ${report.color} rounded-lg flex items-center justify-center`}>
                  <report.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                    {report.title}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    {report.description}
                  </p>
                  <div className="flex items-center space-x-2">
                    <button className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                      <FileText className="w-3 h-3 mr-1" />
                      Générer
                    </button>
                    <button className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                      <Download className="w-3 h-3 mr-1" />
                      Télécharger
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Graphique des performances */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Performance mensuelle
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Période:</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {format(new Date(), 'MMMM yyyy', { locale: fr })}
            </span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={400}>
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
            <Bar dataKey="interventions" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Interventions" />
            <Bar dataKey="missions" fill="#10B981" radius={[4, 4, 0, 0]} name="Missions" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};