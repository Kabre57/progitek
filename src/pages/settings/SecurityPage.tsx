import React, { useState } from 'react';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { 
  Shield, 
  Lock, 
  Key, 
  Smartphone, 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  Save, 
  CheckCircle,
  History,
  LogOut
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const SecurityPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  // Données simulées pour l'historique de connexion
  const loginHistory = [
    { 
      id: 1, 
      date: new Date(2024, 5, 15, 10, 30), 
      ip: '192.168.1.1', 
      device: 'Chrome sur Windows', 
      location: "Abidjan, Côte d'ivoire",
      status: 'success'
    },
    { 
      id: 2, 
      date: new Date(2024, 5, 14, 15, 45), 
      ip: '192.168.1.1', 
      device: 'Firefox sur Windows', 
      location: "Abidjan, Côte d'ivoire",
      status: 'success'
    },
    { 
      id: 3, 
      date: new Date(2024, 5, 12, 8, 15), 
      ip: '85.214.132.117', 
      device: 'Safari sur iPhone', 
      location: "Abangouro, Côte d'ivoire",
      status: 'success'
    },
    { 
      id: 4, 
      date: new Date(2024, 5, 10, 22, 30), 
      ip: '203.0.113.42', 
      device: 'Chrome sur Android', 
      location: "Bouake, Côte d'ivoire",
      status: 'failed'
    }
  ];

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!passwordData.currentPassword) {
      toast.error('Veuillez saisir votre mot de passe actuel');
      return;
    }
    
    if (!passwordData.newPassword) {
      toast.error('Veuillez saisir un nouveau mot de passe');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulation d'une requête API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Mot de passe modifié avec succès');
      
      // Réinitialiser le formulaire
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast.error('Erreur lors de la modification du mot de passe');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle2FA = async () => {
    setIsLoading(true);
    
    try {
      // Simulation d'une requête API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!twoFactorEnabled) {
        setShowQRCode(true);
      } else {
        setTwoFactorEnabled(false);
        setShowQRCode(false);
        toast.success('Authentification à deux facteurs désactivée');
      }
    } catch (error) {
      toast.error('Erreur lors de la modification des paramètres 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!verificationCode) {
      toast.error('Veuillez saisir le code de vérification');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Simulation d'une requête API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (verificationCode === '123456') {
        setTwoFactorEnabled(true);
        setShowQRCode(false);
        setVerificationCode('');
        toast.success('Authentification à deux facteurs activée');
      } else {
        toast.error('Code de vérification incorrect');
      }
    } catch (error) {
      toast.error('Erreur lors de la vérification du code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoutAllDevices = async () => {
    setIsLoading(true);
    
    try {
      // Simulation d'une requête API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Déconnexion de tous les appareils effectuée');
    } catch (error) {
      toast.error('Erreur lors de la déconnexion des appareils');
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    if (!password) return 0;
    
    let strength = 0;
    
    // Longueur minimale
    if (password.length >= 8) strength += 1;
    
    // Complexité
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 1;
    
    return strength;
  };

  const getStrengthLabel = (strength: number) => {
    if (strength <= 2) return 'Faible';
    if (strength <= 3) return 'Moyen';
    return 'Fort';
  };

  const getStrengthColor = (strength: number) => {
    if (strength <= 2) return 'bg-red-500';
    if (strength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Paramètres de développeur web
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gérez les paramètres de développeur web de votre compte
          </p>
        </div>
        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
          <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
      </div>

      {/* Changement de mot de passe */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
          <Lock className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
          Changer le mot de passe
        </h3>
        
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mot de passe actuel
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            
            {passwordData.newPassword && (
              <div className="mt-2">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${getStrengthColor(getPasswordStrength(passwordData.newPassword))}`}
                      style={{ width: `${(getPasswordStrength(passwordData.newPassword) / 5) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {getStrengthLabel(getPasswordStrength(passwordData.newPassword))}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            
            {passwordData.newPassword && passwordData.confirmPassword && 
              passwordData.newPassword !== passwordData.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  Les mots de passe ne correspondent pas
                </p>
              )
            }
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Conseils pour un mot de passe fort :
                </p>
                <ul className="text-xs text-blue-700 dark:text-blue-300 mt-1 space-y-1 list-disc list-inside">
                  <li>Au moins 8 caractères</li>
                  <li>Au moins une lettre majuscule</li>
                  <li>Au moins une lettre minuscule</li>
                  <li>Au moins un chiffre</li>
                  <li>Au moins un caractère spécial</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Enregistrer
            </button>
          </div>
        </form>
      </div>

      {/* Authentification à deux facteurs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
          <Key className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
          Authentification à deux facteurs (2FA)
        </h3>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {twoFactorEnabled 
                ? 'L\'authentification à deux facteurs est activée' 
                : 'L\'authentification à deux facteurs est désactivée'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {twoFactorEnabled 
                ? 'Votre compte est protégé par une couche de développeur web supplémentaire' 
                : 'Activez cette option pour renforcer la développeur web de votre compte'}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={twoFactorEnabled}
              onChange={handleToggle2FA}
              disabled={isLoading || showQRCode}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
        
        {showQRCode && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
            <div className="text-center mb-4">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Scannez ce QR code avec votre application d'authentification
              </p>
              <div className="inline-block bg-white p-2 rounded">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg" 
                  alt="QR Code 2FA" 
                  className="w-48 h-48"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Code de vérification
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="123456"
                  maxLength={6}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Entrez le code à 6 chiffres généré par votre application
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowQRCode(false)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleVerify2FA}
                  disabled={isLoading}
                  className="px-3 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2 inline" />
                  )}
                  Vérifier
                </button>
              </div>
            </div>
          </div>
        )}
        
        {twoFactorEnabled && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  Authentification à deux facteurs activée
                </p>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                  Votre compte est maintenant protégé par une couche de développeur web supplémentaire.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-4">
          <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-2">
            Applications recommandées :
          </p>
          <div className="flex flex-wrap gap-2">
            <div className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs text-gray-700 dark:text-gray-300">
              Google Authenticator
            </div>
            <div className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs text-gray-700 dark:text-gray-300">
              Microsoft Authenticator
            </div>
            <div className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs text-gray-700 dark:text-gray-300">
              Authy
            </div>
          </div>
        </div>
      </div>

      {/* Appareils connectés */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
            <Smartphone className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
            Appareils connectés
          </h3>
          
          <button
            onClick={handleLogoutAllDevices}
            disabled={isLoading}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
          >
            <LogOut className="w-3 h-3 mr-1" />
            Déconnecter tous les appareils
          </button>
        </div>
        
        <div className="space-y-3">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center mr-3">
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Cet appareil
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Chrome sur Windows • Abidjan, Côte d'ivoire
                  </p>
                </div>
              </div>
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                Actif
              </span>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center mr-3">
                  <Smartphone className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    iPhone de Konan
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Safari sur iOS • Lyon, France
                  </p>
                </div>
              </div>
              <button className="text-xs text-red-600 dark:text-red-400 font-medium hover:underline">
                Déconnecter
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Historique de connexion */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
          <History className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
          Historique de connexion
        </h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Appareil
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Localisation
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Adresse IP
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loginHistory.map((login) => (
                <tr key={login.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {format(login.date, 'dd/MM/yyyy HH:mm', { locale: fr })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {login.device}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {login.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 dark:text-white">
                    {login.ip}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {login.status === 'success' ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                        Réussi
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
                        Échoué
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alertes de développeur web */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
          Alertes de développeur web
        </h3>
        
        <div className="space-y-4">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  Tentative de connexion suspecte détectée
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                  Une tentative de connexion depuis une localisation inhabituelle a été détectée le 10/06/2024 à 22:30.
                </p>
                <button className="text-xs text-amber-800 dark:text-amber-200 underline mt-2 hover:no-underline">
                  Voir les détails
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-gray-500 dark:text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Aucune autre alerte de développeur web
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Votre compte ne présente pas d'autres alertes de développeur web pour le moment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};