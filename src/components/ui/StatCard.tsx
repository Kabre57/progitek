import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  icon: LucideIcon;
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'red';
}

const colorClasses = {
  blue: 'bg-blue-500 text-white',
  green: 'bg-emerald-500 text-white',
  yellow: 'bg-amber-500 text-white',
  purple: 'bg-purple-500 text-white',
  red: 'bg-red-500 text-white'
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  color
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {value}
          </p>
          {change && (
            <div className="flex items-center">
              <span className={`text-xs font-medium ${
                change.type === 'increase'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {change.type === 'increase' ? '+' : '-'}{Math.abs(change.value)}%
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                vs mois dernier
              </span>
            </div>
          )}
        </div>
        <div
          className={`p-3 rounded-lg ${colorClasses[color]} bg-opacity-10 border border-opacity-20`}
        >
          <Icon className={`w-6 h-6 ${colorClasses[color].split(' ')[0].replace('bg-', 'text-')}`} />
        </div>
      </div>
    </div>
  );
};