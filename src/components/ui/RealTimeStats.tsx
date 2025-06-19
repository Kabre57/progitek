import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';

interface StatItem {
  id: string;
  label: string;
  value: number;
  previousValue?: number;
  format?: 'number' | 'percentage' | 'currency' | 'duration';
  icon?: React.ComponentType<any>;
  color?: 'blue' | 'green' | 'yellow' | 'purple' | 'red';
}

interface RealTimeStatsProps {
  stats: StatItem[];
  refreshInterval?: number;
  onRefresh?: () => Promise<StatItem[]>;
  className?: string;
}

export const RealTimeStats: React.FC<RealTimeStatsProps> = ({
  stats,
  refreshInterval = 30000, // 30 secondes par défaut
  onRefresh,
  className = ''
}) => {
  const [currentStats, setCurrentStats] = useState(stats);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    setCurrentStats(stats);
  }, [stats]);

  useEffect(() => {
    if (!onRefresh) return;

    const interval = setInterval(async () => {
      setIsRefreshing(true);
      try {
        const newStats = await onRefresh();
        setCurrentStats(newStats);
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Erreur lors de la mise à jour des statistiques:', error);
      } finally {
        setIsRefreshing(false);
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [onRefresh, refreshInterval]);

  const formatValue = (value: number, format?: string) => {
    switch (format) {
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'currency':
        return new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'EUR'
        }).format(value);
      case 'duration':
        const hours = Math.floor(value);
        const minutes = Math.round((value - hours) * 60);
        return `${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`;
      default:
        return value.toLocaleString('fr-FR');
    }
  };

  const getTrendInfo = (current: number, previous?: number) => {
    if (previous === undefined) return null;

    const diff = current - previous;
    const percentage = previous !== 0 ? (diff / previous) * 100 : 0;

    if (Math.abs(percentage) < 0.1) {
      return { type: 'stable', percentage: 0, icon: Minus };
    }

    return {
      type: diff > 0 ? 'increase' : 'decrease',
      percentage: Math.abs(percentage),
      icon: diff > 0 ? TrendingUp : TrendingDown
    };
  };

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-500 text-white',
      green: 'bg-emerald-500 text-white',
      yellow: 'bg-amber-500 text-white',
      purple: 'bg-purple-500 text-white',
      red: 'bg-red-500 text-white'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className={className}>
      {/* En-tête avec dernière mise à jour */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Statistiques en temps réel
        </h3>
        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>
            Dernière mise à jour: {lastUpdate.toLocaleTimeString('fr-FR')}
          </span>
        </div>
      </div>

      {/* Grille des statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {currentStats.map((stat) => {
          const trend = getTrendInfo(stat.value, stat.previousValue);
          const Icon = stat.icon;

          return (
            <div
              key={stat.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatValue(stat.value, stat.format)}
                  </p>
                </div>
                {Icon && (
                  <div className={`p-3 rounded-lg ${getColorClasses(stat.color || 'blue')} bg-opacity-10 border border-opacity-20`}>
                    <Icon className={`w-6 h-6 ${getColorClasses(stat.color || 'blue').split(' ')[0].replace('bg-', 'text-')}`} />
                  </div>
                )}
              </div>

              {/* Tendance */}
              {trend && (
                <div className="flex items-center">
                  <trend.icon 
                    className={`w-4 h-4 mr-1 ${
                      trend.type === 'increase' 
                        ? 'text-emerald-500' 
                        : trend.type === 'decrease'
                        ? 'text-red-500'
                        : 'text-gray-400'
                    }`} 
                  />
                  <span 
                    className={`text-sm font-medium ${
                      trend.type === 'increase' 
                        ? 'text-emerald-600 dark:text-emerald-400' 
                        : trend.type === 'decrease'
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {trend.type === 'stable' 
                      ? 'Stable' 
                      : `${trend.percentage.toFixed(1)}%`
                    }
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                    vs période précédente
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};