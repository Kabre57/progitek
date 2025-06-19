import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Layout } from './components/layouts/Layout';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { UsersPage } from './pages/users/UsersPage';
import { ClientsPage } from './pages/clients/ClientsPage';
import { TechniciansPage } from './pages/technicians/TechniciansPage';
import { MissionsPage } from './pages/missions/MissionsPage';
import { InterventionsPage } from './pages/interventions/InterventionsPage';
import { ReportsPage } from './pages/reports/ReportsPage';
import { AuditPage } from './pages/audit/AuditPage';
import { NotificationsPage } from './pages/notifications/NotificationsPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { TestSupabase } from './pages/TestSupabase';
import { testSupabaseConnection } from './services/supabaseClient';
import toast from 'react-hot-toast';

function App() {
  useEffect(() => {
    // Tester la connexion à Supabase au chargement de l'application
    const testConnection = async () => {
      const result = await testSupabaseConnection();
      if (result.success) {
        toast.success('Connexion à Supabase établie avec succès');
      } else {
        toast.error('Erreur de connexion à Supabase. Vérifiez vos identifiants.');
      }
    };

    testConnection();
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            <Routes>
              {/* Route de connexion */}
              <Route path="/login" element={<LoginPage />} />
              
              {/* Routes protégées */}
              <Route path="/*" element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<DashboardPage />} />
                      <Route path="/users" element={<UsersPage />} />
                      <Route path="/clients" element={<ClientsPage />} />
                      <Route path="/technicians" element={<TechniciansPage />} />
                      <Route path="/missions" element={<MissionsPage />} />
                      <Route path="/interventions" element={<InterventionsPage />} />
                      <Route path="/reports" element={<ReportsPage />} />
                      <Route path="/audit" element={<AuditPage />} />
                      <Route path="/notifications" element={<NotificationsPage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="/test-supabase" element={<TestSupabase />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              } />
            </Routes>
          </div>
          
          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--toast-bg)',
                color: 'var(--toast-color)',
              },
            }}
          />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;