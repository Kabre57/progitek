import React, { useState, useEffect } from 'react';
import { X, Save, Wrench, ClipboardList, UserCheck, Calendar, Clock } from 'lucide-react';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Intervention, Mission, Technicien } from '../../types';
import toast from 'react-hot-toast';

interface InterventionModalProps {
  isOpen: boolean;
  onClose: () => void;
  intervention?: Intervention | null;
  onSave: (interventionData: any) => Promise<void>;
  missions: Mission[];
  technicians: Technicien[];
}

export const InterventionModal: React.FC<InterventionModalProps> = ({
  isOpen,
  onClose,
  intervention,
  onSave,
  missions,
  technicians
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    date_heure_debut: '',
    date_heure_fin: '',
    mission_id: '',
    technicien_id: ''
  });

  useEffect(() => {
    if (intervention) {
      setFormData({
        date_heure_debut: intervention.date_heure_debut ? 
          new Date(intervention.date_heure_debut).toISOString().slice(0, 16) : '',
        date_heure_fin: intervention.date_heure_fin ? 
          new Date(intervention.date_heure_fin).toISOString().slice(0, 16) : '',
        mission_id: intervention.mission?.num_intervention?.toString() || '',
        technicien_id: intervention.technicien?.id?.toString() || ''
      });
    } else {
      setFormData({
        date_heure_debut: '',
        date_heure_fin: '',
        mission_id: '',
        technicien_id: ''
      });
    }
  }, [intervention, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const submitData = {
        date_heure_debut: formData.date_heure_debut || null,
        date_heure_fin: formData.date_heure_fin || null,
        mission_id: parseInt(formData.mission_id),
        technicien_id: formData.technicien_id ? parseInt(formData.technicien_id) : null
      };

      await onSave(submitData);
      onClose();
      toast.success(intervention ? 'Intervention modifiée avec succès' : 'Intervention créée avec succès');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Wrench className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {intervention ? 'Modifier l\'intervention' : 'Nouvelle intervention'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <ClipboardList className="w-4 h-4 inline mr-1" />
              Mission *
            </label>
            <select
              required
              value={formData.mission_id}
              onChange={(e) => setFormData({ ...formData, mission_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sélectionner une mission</option>
              {missions.map((mission) => (
                <option key={mission.num_intervention} value={mission.num_intervention}>
                  #{mission.num_intervention} - {mission.nature_intervention}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <UserCheck className="w-4 h-4 inline mr-1" />
              Technicien
            </label>
            <select
              value={formData.technicien_id}
              onChange={(e) => setFormData({ ...formData, technicien_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Aucun technicien assigné</option>
              {technicians.map((technician) => (
                <option key={technician.id} value={technician.id}>
                  {technician.prenom} {technician.nom} - {technician.specialite?.libelle}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Date et heure de début
            </label>
            <input
              type="datetime-local"
              value={formData.date_heure_debut}
              onChange={(e) => setFormData({ ...formData, date_heure_debut: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Date et heure de fin
            </label>
            <input
              type="datetime-local"
              value={formData.date_heure_fin}
              onChange={(e) => setFormData({ ...formData, date_heure_fin: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Durée calculée */}
          {formData.date_heure_debut && formData.date_heure_fin && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Durée calculée: {
                    Math.round(
                      (new Date(formData.date_heure_fin).getTime() - 
                       new Date(formData.date_heure_debut).getTime()) / (1000 * 60 * 60) * 10
                    ) / 10
                  } heures
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 flex items-center"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {intervention ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};