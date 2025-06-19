import React from 'react';
import { CheckCircle, Clock, AlertCircle, XCircle, Play, Pause, Calendar } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  type?: 'intervention' | 'mission' | 'user' | 'client' | 'general';
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  type = 'general', 
  showIcon = true,
  size = 'md' 
}) => {
  const getStatusConfig = () => {
    const configs = {
      intervention: {
        completed: {
          color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300',
          icon: CheckCircle,
          text: 'Terminée'
        },
        in_progress: {
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
          icon: Play,
          text: 'En cours'
        },
        scheduled: {
          color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300',
          icon: Calendar,
          text: 'Planifiée'
        },
        pending: {
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300',
          icon: Pause,
          text: 'En attente'
        }
      },
      mission: {
        urgent: {
          color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
          icon: AlertCircle,
          text: 'Urgent'
        },
        planned: {
          color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300',
          icon: Calendar,
          text: 'Planifiée'
        },
        overdue: {
          color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
          icon: XCircle,
          text: 'En retard'
        }
      },
      user: {
        active: {
          color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300',
          icon: CheckCircle,
          text: 'Actif'
        },
        inactive: {
          color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
          icon: XCircle,
          text: 'Inactif'
        },
        pending: {
          color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300',
          icon: Clock,
          text: 'En attente'
        }
      },
      client: {
        active: {
          color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300',
          icon: CheckCircle,
          text: 'Actif'
        },
        inactive: {
          color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
          icon: XCircle,
          text: 'Inactif'
        },
        pending: {
          color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300',
          icon: Clock,
          text: 'En attente'
        }
      },
      general: {
        success: {
          color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300',
          icon: CheckCircle,
          text: 'Succès'
        },
        warning: {
          color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300',
          icon: AlertCircle,
          text: 'Attention'
        },
        error: {
          color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
          icon: XCircle,
          text: 'Erreur'
        },
        info: {
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
          icon: Clock,
          text: 'Information'
        }
      }
    };

    return configs[type]?.[status] || configs.general.info;
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  return (
    <span className={`inline-flex items-center ${sizeClasses[size]} rounded-full font-medium ${config.color}`}>
      {showIcon && <Icon className={`${iconSizes[size]} mr-1`} />}
      {config.text}
    </span>
  );
};