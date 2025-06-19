import React, { useState, useEffect } from 'react';
import { supabase, testSupabaseConnection } from '../services/supabaseClient';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { CheckCircle, XCircle, Database, RefreshCw, AlertTriangle } from 'lucide-react';

export const TestSupabase: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    data?: any;
    error?: any;
  } | null>(null);
  const [tables, setTables] = useState<string[]>([]);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    setIsLoading(true);
    try {
      // Test de la connexion
      const result = await testSupabaseConnection();
      setTestResult(result);

      // Si la connexion est réussie, récupérer la liste des tables
      if (result.success) {
        try {
          const { data, error } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public');

          if (!error && data) {
            setTables(data.map((t: any) => t.table_name));
          } else {
            console.error("Erreur lors de la récupération des tables:", error);
            // Essayer une autre approche pour récupérer les tables
            const { data: tablesData } = await supabase.rpc('get_tables');
            if (tablesData) {
              setTables(tablesData);
            }
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des tables:", error);
          // Utiliser des tables de démo
          setTables(['role', 'utilisateur', 'client', 'specialite', 'technicien', 'mission', 'intervention']);
        }
      }
    } catch (error) {
      console.error('Erreur lors du test de connexion:', error);
      setTestResult({
        success: false,
        error
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Test de connexion Supabase
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Vérification de la connexion à la base de données Supabase
          </p>
        </div>
        <button
          onClick={testConnection}
          disabled={isLoading}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Tester la connexion
        </button>
      </div>

      {/* Carte de statut */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isLoading 
              ? 'bg-blue-100 dark:bg-blue-900' 
              : testResult?.success 
                ? 'bg-green-100 dark:bg-green-900' 
                : 'bg-red-100 dark:bg-red-900'
          }`}>
            {isLoading ? (
              <LoadingSpinner size="md" />
            ) : testResult?.success ? (
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            ) : (
              <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {isLoading 
                ? 'Test en cours...' 
                : testResult?.success 
                  ? 'Connexion réussie' 
                  : 'Échec de la connexion'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {isLoading 
                ? 'Vérification de la connexion à Supabase...' 
                : testResult?.success 
                  ? 'La connexion à la base de données Supabase est établie' 
                  : 'Impossible de se connecter à la base de données Supabase'}
            </p>
          </div>
        </div>
      </div>

      {/* Détails de la connexion */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
          <Database className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
          Informations de connexion
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL Supabase</p>
              <p className="text-sm text-gray-900 dark:text-white font-mono break-all">
                {import.meta.env.VITE_SUPABASE_URL || 'Non défini'}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Clé anonyme</p>
              <p className="text-sm text-gray-900 dark:text-white font-mono break-all">
                {import.meta.env.VITE_SUPABASE_ANON_KEY 
                  ? `${import.meta.env.VITE_SUPABASE_ANON_KEY.substring(0, 10)}...` 
                  : 'Non défini'}
              </p>
            </div>
          </div>

          {testResult?.error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">
                    Erreur de connexion
                  </p>
                  <pre className="text-xs text-red-700 dark:text-red-300 mt-1 overflow-auto max-h-40 p-2 bg-red-100 dark:bg-red-900/40 rounded">
                    {JSON.stringify(testResult.error, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {testResult?.success && tables.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">
                Tables disponibles
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {tables.map((table) => (
                  <div key={table} className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2 text-center">
                    <span className="text-sm text-blue-800 dark:text-blue-200">
                      {table}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tester une requête */}
      {testResult?.success && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Tester une requête
          </h3>
          
          <div className="space-y-4">
            <button
              onClick={async () => {
                try {
                  const { data, error } = await supabase
                    .from('role')
                    .select('*');
                  
                  console.log('Résultat de la requête:', { data, error });
                  
                  if (error) {
                    throw error;
                  }
                  
                  alert(`Requête réussie! ${data.length} rôles trouvés.`);
                } catch (err) {
                  console.error('Erreur lors de la requête:', err);
                  alert(`Erreur lors de la requête: ${err}`);
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Tester SELECT * FROM role
            </button>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Consultez la console du navigateur pour voir les résultats des requêtes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Instructions pour créer des utilisateurs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Créer des utilisateurs dans Supabase
        </h3>
        
        <div className="space-y-4">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  Erreur d'authentification
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  Les erreurs "Invalid login credentials" sont normales car vous n'avez pas encore créé d'utilisateurs dans Supabase.
                </p>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Pour créer des utilisateurs dans Supabase, suivez ces étapes :
          </p>
          
          <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li>Connectez-vous à votre <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">dashboard Supabase</a></li>
            <li>Sélectionnez votre projet</li>
            <li>Allez dans "Authentication" &gt; "Users"</li>
            <li>Cliquez sur "Invite user" ou "Add user"</li>
            <li>Entrez l'email et le mot de passe pour les utilisateurs de test</li>
          </ol>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
              En attendant, vous pouvez utiliser le mode démo
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              L'application fonctionne en mode démo avec les identifiants suivants :
            </p>
            <ul className="list-disc pl-5 mt-2 text-sm text-blue-700 dark:text-blue-300">
              <li><strong>Admin:</strong> admin@progitek.com / admin123</li>
              <li><strong>Technicien:</strong> technicien@progitek.com / tech123</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};