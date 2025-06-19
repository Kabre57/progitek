import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';
import { supabase } from '../services/supabaseClient';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          // Vérifier si l'utilisateur est connecté à Supabase
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            // Utiliser les données de session Supabase
            try {
              const userData = await authService.getCurrentUser();
              setUser(userData);
            } catch (error) {
              console.error("Erreur lors de la récupération des données utilisateur:", error);
              // Continuer en mode démo si l'utilisateur a un token démo
              if (token.startsWith('demo-token')) {
                const userData = await authService.getCurrentUser();
                setUser(userData);
              } else {
                localStorage.removeItem('token');
                setToken(null);
              }
            }
          } else if (token.startsWith('demo-token')) {
            // Mode démo
            try {
              const userData = await authService.getCurrentUser();
              setUser(userData);
            } catch (error) {
              console.error("Erreur en mode démo:", error);
              localStorage.removeItem('token');
              setToken(null);
            }
          } else {
            // Token invalide
            localStorage.removeItem('token');
            setToken(null);
          }
        } catch (error) {
          console.error("Erreur d'authentification:", error);
          // Vérifier si c'est un token de démo
          if (token.startsWith('demo-token')) {
            try {
              const userData = await authService.getCurrentUser();
              setUser(userData);
            } catch (innerError) {
              localStorage.removeItem('token');
              setToken(null);
            }
          } else {
            localStorage.removeItem('token');
            setToken(null);
          }
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      // Essayer d'abord avec Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        // Si échec avec Supabase, essayer avec l'API classique ou le mode démo
        const { user: userData, token: authToken } = await authService.login(email, password);
        setUser(userData);
        setToken(authToken);
        localStorage.setItem('token', authToken);
        toast.success(`Bienvenue ${userData.prenom} !`);
      } else if (data.session) {
        // Connexion Supabase réussie
        try {
          const { user: userData, token: authToken } = await authService.login(email, password);
          setUser(userData);
          setToken(data.session.access_token);
          localStorage.setItem('token', data.session.access_token);
          toast.success(`Bienvenue ${userData.prenom} !`);
        } catch (error) {
          console.error("Erreur lors de la récupération des données utilisateur:", error);
          toast.error("Erreur lors de la récupération des données utilisateur");
        }
      }
    } catch (error: any) {
      // Gérer les erreurs d'authentification
      if (email === 'admin@progitek.com' && password === 'admin123') {
        // Mode démo pour admin
        const { user: userData, token: authToken } = await authService.login(email, password);
        setUser(userData);
        setToken(authToken);
        localStorage.setItem('token', authToken);
        toast.success(`Bienvenue ${userData.prenom} ! (Mode démo)`);
      } else if (email === 'technicien@progitek.com' && password === 'tech123') {
        // Mode démo pour technicien
        const { user: userData, token: authToken } = await authService.login(email, password);
        setUser(userData);
        setToken(authToken);
        localStorage.setItem('token', authToken);
        toast.success(`Bienvenue ${userData.prenom} ! (Mode démo)`);
      } else {
        toast.error(error.response?.data?.message || error.message || 'Erreur de connexion');
        throw error;
      }
    }
  };

  const logout = async () => {
    // Déconnexion de Supabase
    await supabase.auth.signOut();
    
    // Nettoyage local
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    toast.success('Déconnexion réussie');
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};