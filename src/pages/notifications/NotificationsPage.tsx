import React, { useState, useEffect } from 'react';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Bell, Check, Trash2, Settings, Filter, Mail, AlertCircle, Info, CheckCircle, X } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';

interface Notification {
  id: number;
  type: string;
  message: string;
  data?: any;
  read_at?: string;
  created_at: string;
}

interface NotificationPreferences {
  check_unusual_activity: boolean;
  check_new_sign_in: boolean;
  notify_latest_news: boolean;
  notify_feature_update: boolean;
  notify_account_tips: boolean;
}

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    check_unusual_activity: true,
    check_new_sign_in: false,
    notify_latest_news: true,
    notify_feature_update: false,
    notify_account_tips: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showPreferences, setShowPreferences] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      // Simulation des données
      const mockNotifications: Notification[] = [
        {
          id: 1,
          type: 'info',
          message: 'Nouvelle mission assignée: Maintenance réseau chez TechCorp',
          created_at: '2024-01-15T10:30:00Z',
          read_at: undefined
        },
        {
          id: 2,
          type: 'success',
          message: 'Intervention terminée avec succès pour DataSys Industries',
          created_at: '2024-01-15T09:15:00Z',
          read_at: '2024-01-15T09:20:00Z'
        },
        {
          id: 3,
          type: 'warning',
          message: 'Mission urgente: Installation serveur prévue dans 2 heures',
          created_at: '2024-01-15T08:00:00Z',
          read_at: undefined
        },
        {
          id: 4,
          type: 'error',
          message: 'Échec de connexion détecté depuis une adresse IP inconnue',
          created_at: '2024-01-14T22:45:00Z',
          read_at: undefined
        },
        {
          id: 5,
          type: 'info',
          message: 'Nouveau client enregistré: InnovateTech Solutions',
          created_at: '2024-01-14T16:30:00Z',
          read_at: '2024-01-14T16:35:00Z'
        }
      ];
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      setNotifications(notifications.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read_at: new Date().toISOString() }
          : notif
      ));
      toast.success('Notification marquée comme lue');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const markAllAsRead = async () => {
    try {
      const now = new Date().toISOString();
      setNotifications(notifications.map(notif => ({ ...notif, read_at: now })));
      toast.success('Toutes les notifications marquées comme lues');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const deleteNotification = async (notificationId: number) => {
    try {
      setNotifications(notifications.filter(notif => notif.id !== notificationId));
      toast.success('Notification supprimée');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const updatePreferences = async (newPreferences: NotificationPreferences) => {
    try {
      setPreferences(newPreferences);
      toast.success('Préférences mises à jour');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour des préférences');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return CheckCircle;
      case 'warning':
        return AlertCircle;
      case 'error':
        return X;
      default:
        return Info;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-emerald-500';
      case 'warning':
        return 'text-amber-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-blue-500';
    }
  };

  const getNotificationBg = (type: string, isRead: boolean) => {
    const opacity = isRead ? 'opacity-50' : '';
    switch (type) {
      case 'success':
        return `bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 ${opacity}`;
      case 'warning':
        return `bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 ${opacity}`;
      case 'error':
        return `bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 ${opacity}`;
      default:
        return `bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 ${opacity}`;
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.read_at;
    if (filter === 'read') return notif.read_at;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read_at).length;

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
            Notifications
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gérez vos notifications et préférences
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Toutes</option>
            <option value="unread">Non lues</option>
            <option value="read">Lues</option>
          </select>
          <button
            onClick={() => setShowPreferences(!showPreferences)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            <Settings className="w-4 h-4 mr-2" />
            Préférences
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Bell className="w-8 h-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total notifications</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{notifications.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center">
              <Mail className="w-4 h-4 text-amber-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Non lues</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{unreadCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Lues</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {notifications.length - unreadCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      {unreadCount > 0 && (
        <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Vous avez {unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue{unreadCount > 1 ? 's' : ''}
            </span>
          </div>
          <button
            onClick={markAllAsRead}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
          >
            Tout marquer comme lu
          </button>
        </div>
      )}

      {/* Préférences */}
      {showPreferences && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Préférences de notification
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900 dark:text-white">
                  Activité inhabituelle
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Recevoir des alertes pour les activités suspectes
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.check_unusual_activity}
                  onChange={(e) => updatePreferences({
                    ...preferences,
                    check_unusual_activity: e.target.checked
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900 dark:text-white">
                  Nouvelles connexions
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Être notifié des nouvelles connexions
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.check_new_sign_in}
                  onChange={(e) => updatePreferences({
                    ...preferences,
                    check_new_sign_in: e.target.checked
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900 dark:text-white">
                  Actualités
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Recevoir les dernières actualités
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.notify_latest_news}
                  onChange={(e) => updatePreferences({
                    ...preferences,
                    notify_latest_news: e.target.checked
                  })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Liste des notifications */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Aucune notification trouvée
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const Icon = getNotificationIcon(notification.type);
            const isRead = !!notification.read_at;
            
            return (
              <div
                key={notification.id}
                className={`border rounded-lg p-4 transition-all hover:shadow-sm ${getNotificationBg(notification.type, isRead)}`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full ${getNotificationColor(notification.type)}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${isRead ? 'text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {format(new Date(notification.created_at), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!isRead && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                        title="Marquer comme lu"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};