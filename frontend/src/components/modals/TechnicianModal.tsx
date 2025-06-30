import React, { useState, useEffect } from 'react';
import { X, Save, Loader } from 'lucide-react';
import { technicianService, CreateTechnicianData } from '../../services/technicianService';
import { Technicien, Specialite } from '../../types/api';
import toast from 'react-hot-toast';

interface TechnicianModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  technicien?: Technicien | null;
}

export const TechnicianModal: React.FC<TechnicianModalProps> = ({ isOpen, onClose, onSuccess, technicien }) => {
  const [loading, setLoading] = useState(false);
  const [specialites, setSpecialites] = useState<Specialite[]>([]);
  const [formData, setFormData] = useState<CreateTechnicianData>({
    nom: '',
    prenom: '',
    contact: '',
    specialiteId: undefined
  });

  useEffect(() => {
    if (isOpen) {
      loadSpecialites();
    }
  }, [isOpen]);

  useEffect(() => {
    if (technicien) {
      setFormData({
        nom: technicien.nom,
        prenom: technicien.prenom,
        contact: technicien.contact || '',
        specialiteId: technicien.specialiteId
      });
    } else {
      setFormData({
        nom: '',
        prenom: '',
        contact: '',
        specialiteId: undefined
      });
    }
  }, [technicien, isOpen]);

  const loadSpecialites = async () => {
    try {
      const data = await technicianService.getSpecialites();
      setSpecialites(data);
    } catch (error) {
      console.error('Erreur lors du chargement des spécialités:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (technicien) {
        await technicianService.updateTechnician(technicien.id, formData);
        toast.success('Technicien modifié avec succès');
      } else {
        await technicianService.createTechnician(formData);
        toast.success('Technicien créé avec succès');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'opération');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {technicien ? 'Modifier le technicien' : 'Nouveau technicien'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom *
            </label>
            <input
              type="text"
              required
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prénom *
            </label>
            <input
              type="text"
              required
              value={formData.prenom}
              onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact
            </label>
            <input
              type="tel"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Spécialité
            </label>
            <select
              value={formData.specialiteId || ''}
              onChange={(e) => setFormData({ ...formData, specialiteId: e.target.value ? parseInt(e.target.value) : undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sélectionner une spécialité...</option>
              {specialites.map((specialite) => (
                <option key={specialite.id} value={specialite.id}>
                  {specialite.libelle}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {technicien ? 'Modifier' : 'Créer'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};