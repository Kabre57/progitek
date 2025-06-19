import React, { useMemo } from 'react';
import { Clock, Calendar } from 'lucide-react';

interface DurationCalculatorProps {
  startDate?: string | null;
  endDate?: string | null;
  showDetails?: boolean;
  className?: string;
}

export const DurationCalculator: React.FC<DurationCalculatorProps> = ({
  startDate,
  endDate,
  showDetails = false,
  className = ''
}) => {
  const duration = useMemo(() => {
    if (!startDate || !endDate) return null;

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end <= start) return null;

    const diffMs = end.getTime() - start.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    const hours = Math.floor(diffHours);
    const minutes = Math.round((diffHours - hours) * 60);
    const days = Math.floor(diffDays);
    const remainingHours = Math.floor(diffHours - (days * 24));

    return {
      totalHours: diffHours,
      hours,
      minutes,
      days,
      remainingHours,
      formatted: days > 0 
        ? `${days}j ${remainingHours}h${minutes > 0 ? ` ${minutes}min` : ''}`
        : `${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`
    };
  }, [startDate, endDate]);

  if (!duration) {
    return (
      <div className={`flex items-center text-gray-400 dark:text-gray-500 ${className}`}>
        <Clock className="w-4 h-4 mr-1" />
        <span className="text-sm">-</span>
      </div>
    );
  }

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-center text-gray-900 dark:text-white">
        <Clock className="w-4 h-4 mr-1 text-blue-500" />
        <span className="text-sm font-medium">{duration.formatted}</span>
      </div>
      
      {showDetails && (
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
          <div className="flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            <span>Total: {duration.totalHours.toFixed(1)} heures</span>
          </div>
          {duration.days > 0 && (
            <div className="ml-4">
              <span>{duration.days} jour(s) et {duration.remainingHours} heure(s)</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};