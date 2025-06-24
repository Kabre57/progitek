import React, { useState, useEffect } from 'react';
import { X, Save, Loader, Plus, Trash2 } from 'lucide-react';
import { devisService, CreateDevisData } from '../../services/devisService';
import { clientService } from '../../services/clientService';
import { missionService } from '../../services/missionService';
import { Devis } from '../../types/api';
import toast from 'react-hot-toast';

interface DevisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  devis?: Devis | null;
}

interface LigneDevis {
  id?: number;
  designation: string;
  quantite: number;
  prixUnitaire: number;
  montantHT: number;
}

export const DevisModal: React.FC<DevisModalProps> = ({ isOpen, onClose, onSuccess, devis }) => {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [missions, setMissions] = useState<any[]>([]);
  const [formData, setFormData] = useState<CreateDevisData>({
    clientId: 0,
    missionId: undefined,
    titre: '',
    description: '',
    dateValidite: '',
    tauxTVA: 18,
    lignes: [
      {
        designation: '',
        quantite: 1,
        prixUnitaire: 0,
      }
    ]
  });

  useEffect(() => {
    if (isOpen) {
      loadClients();
      loadMissions();
    }
  }, [isOpen]);

  useEffect(() => {
    if (devis) {
      setFormData({
        clientId: devis.clientId,
        missionId: devis.missionId || undefined,
        titre: devis.titre,
        description: devis.description || '',
        dateValidite: devis.dateValidite.split('T')[0],
        tauxTVA: devis.tauxTVA,
        lignes: devis.lignes?.map(ligne => ({
          id: ligne.id,
          designation: ligne.designation,
          quantite: ligne.quantite,
          prixUnitaire: ligne.prixUnitaire,
          montantHT: ligne.montantHT,
        })) || []
      });
    } else {
      setFormData({
        clientId: 0,
        missionId: undefined,
        titre: '',
        description: '',
        dateValidite: '',
        tauxTVA: 18,
        lignes: [
          {
            designation: '',
            quantite: 1,
            prixUnitaire: 0,
          }
        ]
      });
    }
  }, [devis, isOpen]);

  const loadClients = async () => {
    try {
      const response = await clientService.getClients(1, 100);
      setClients(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des clients:', error);
    }
  };

  const loadMissions = async () => {
    try {
      const response = await missionService.getMissions(1, 100);
      setMissions(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des missions:', error);
    }
  };

  const handleLigneChange = (index: number, field: keyof LigneDevis, value: any) => {
    const newLignes = [...formData.lignes];
    newLignes[index] = {
      ...newLignes[index],
      [field]: value,
    };

    // Recalculer le montant HT si quantité ou prix unitaire change
    if (field === 'quantite' || field === 'prixUnitaire') {
      newLignes[index].montantHT = newLignes[index].quantite * newLignes[index].prixUnitaire;
    }

    setFormData({ ...formData, lignes: newLignes });
  };

  const addLigne = () => {
    setFormData({
      ...formData,
      lignes: [
        ...formData.lignes,
        {
          designation: '',
          quantite: 1,
          prixUnitaire: 0,
        }
      ]
    });
  };

  const removeLigne = (index: number) => {
    if (formData.lignes.length > 1) {
      const newLignes = formData.lignes.filter((_, i) => i !== index);
      setFormData({ ...formData, lignes: newLignes });
    }
  };

  const calculateTotals = () => {
    const montantHT = formData.lignes.reduce((sum, ligne) => {
      return sum + (ligne.quantite * ligne.prixUnitaire);
    }, 0);
    const montantTTC = montantHT * (1 + formData.tauxTVA / 100);
    return { montantHT, montantTTC };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const lignesFormatted = formData.lignes.map(ligne => ({
        designation: ligne.designation,
        quantite: ligne.quantite,
        prixUnitaire: ligne.prixUnitaire,
      }));

      const dataToSend = {
        ...formData,
        lignes: lignesFormatted,
        dateValidite: new Date(formData.dateValidite).toISOString(),
      };

      if (devis) {
        await devisService.updateDevis(devis.id, dataToSend);
        toast.success('Devis modifié avec succès');
      } else {
        await devisService.createDevis(dataToSend);
        toast.success('Devis créé avec succès');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'opération');
    } finally {
      setLoading(false);
    }
  };

  const { montantHT, montantTTC } = calculateTotals();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {devis ? 'Modifier le devis' : 'Nouveau devis'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations générales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client *
              </label>
              <select
                required
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={0}>Sélectionner un client...</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.nom} - {client.entreprise}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mission (optionnel)
              </label>
              <select
                value={formData.missionId || ''}
                onChange={(e) => setFormData({ ...formData, missionId: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Aucune mission...</option>
                {missions.map((mission) => (
                  <option key={mission.numIntervention} value={mission.numIntervention}>
                    #{mission.numIntervention} - {mission.natureIntervention}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titre *
              </label>
              <input
                type="text"
                required
                value={formData.titre}
                onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de validité *
              </label>
              <input
                type="date"
                required
                value={formData.dateValidite}
                onChange={(e) => setFormData({ ...formData, dateValidite: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Taux TVA (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.tauxTVA}
                onChange={(e) => setFormData({ ...formData, tauxTVA: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Lignes du devis */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-md font-medium text-gray-900">Lignes du devis</h4>
              <button
                type="button"
                onClick={addLigne}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
              >
                <Plus className="h-4 w-4 mr-1" />
                Ajouter une ligne
              </button>
            </div>

            <div className="space-y-3">
              {formData.lignes.map((ligne, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Désignation
                    </label>
                    <input
                      type="text"
                      required
                      value={ligne.designation}
                      onChange={(e) => handleLigneChange(index, 'designation', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Quantité
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={ligne.quantite}
                      onChange={(e) => handleLigneChange(index, 'quantite', parseFloat(e.target.value))}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Prix unitaire
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={ligne.prixUnitaire}
                      onChange={(e) => handleLigneChange(index, 'prixUnitaire', parseFloat(e.target.value))}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Montant HT
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={(ligne.quantite * ligne.prixUnitaire).toLocaleString('fr-FR')}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm bg-gray-50"
                    />
                  </div>
                  <div className="col-span-1">
                    <button
                      type="button"
                      onClick={() => removeLigne(index)}
                      disabled={formData.lignes.length === 1}
                      className="p-1 text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totaux */}
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Total HT:</span>
              <span className="text-sm font-bold text-gray-900">
                {montantHT.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">TVA ({formData.tauxTVA}%):</span>
              <span className="text-sm font-bold text-gray-900">
                {(montantTTC - montantHT).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}
              </span>
            </div>
            <div className="flex justify-between items-center border-t pt-2">
              <span className="text-lg font-bold text-gray-900">Total TTC:</span>
              <span className="text-lg font-bold text-blue-600">
                {montantTTC.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}
              </span>
            </div>
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
                  {devis ? 'Modifier' : 'Créer'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};