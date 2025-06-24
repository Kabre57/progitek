import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import { ClientsPage } from './pages/ClientsPage';
import { TechniciansPage } from './pages/TechniciansPage';
import { MissionsPage } from './pages/MissionsPage';
import { InterventionsPage } from './pages/InterventionsPage';
import { UsersPage } from './pages/UsersPage';
import { RolesPage } from './pages/RolesPage';
import { SpecialitesPage } from './pages/SpecialitesPage';
import { ReportsPage } from './pages/ReportsPage';
import { AuditPage } from './pages/AuditPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { DevisPage } from './pages/DevisPage';
import { FacturesPage } from './pages/FacturesPage';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#4ade80',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/users" element={
            <ProtectedRoute requiredRole="admin">
              <Layout>
                <UsersPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/roles" element={
            <ProtectedRoute requiredRole="admin">
              <Layout>
                <RolesPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/specialites" element={
            <ProtectedRoute requiredRole="admin">
              <Layout>
                <SpecialitesPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/clients" element={
            <ProtectedRoute>
              <Layout>
                <ClientsPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/technicians" element={
            <ProtectedRoute>
              <Layout>
                <TechniciansPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/missions" element={
            <ProtectedRoute>
              <Layout>
                <MissionsPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/interventions" element={
            <ProtectedRoute>
              <Layout>
                <InterventionsPage />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/devis" element={
            <ProtectedRoute>
              <Layout>
                <DevisPage />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/factures" element={
            <ProtectedRoute>
              <Layout>
                <FacturesPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/reports" element={
            <ProtectedRoute>
              <Layout>
                <ReportsPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/audit" element={
            <ProtectedRoute requiredRole="admin">
              <Layout>
                <AuditPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/notifications" element={
            <ProtectedRoute>
              <Layout>
                <NotificationsPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/settings" element={
            <ProtectedRoute>
              <Layout>
                <SettingsPage />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/unauthorized" element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900">Accès refusé</h1>
                <p className="text-gray-600 mt-2">Vous n'avez pas les permissions nécessaires.</p>
              </div>
            </div>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;