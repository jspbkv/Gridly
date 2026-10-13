import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import {
  getSupabaseClient,
  getActiveSupabaseConfig,
  signInWithGoogle,
  signOutFromSupabase,
  getCurrentAuthUser,
} from '../services/supabase';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  isConfigured: boolean;
  supabaseUrl: string;
  authGateOpen: boolean;
  authGateReason: string;
  configModalOpen: boolean;
  openAuthGate: (reason?: string) => void;
  closeAuthGate: () => void;
  openConfigModal: () => void;
  closeConfigModal: () => void;
  loginWithGoogle: () => Promise<{ error: Error | null }>;
  logout: () => Promise<void>;
  refreshConfig: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authGateOpen, setAuthGateOpen] = useState<boolean>(false);
  const [authGateReason, setAuthGateReason] = useState<string>('');
  const [configModalOpen, setConfigModalOpen] = useState<boolean>(false);
  const [configState, setConfigState] = useState(() => getActiveSupabaseConfig());

  const refreshConfig = () => {
    setConfigState(getActiveSupabaseConfig());
  };

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      const client = getSupabaseClient();
      if (!client) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const currentUser = await getCurrentAuthUser();
        setUser(currentUser);

        // Listen for auth changes (sign in, sign out, token refresh)
        const { data: listener } = client.auth.onAuthStateChange((_event, session) => {
          setUser(session?.user || null);
        });

        return () => {
          listener?.subscription.unsubscribe();
        };
      } catch (err) {
        console.warn('Auth initialization warning:', err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [configState.isConfigured, configState.url, configState.anonKey]);

  const openAuthGate = (reason?: string) => {
    setAuthGateReason(
      reason || 'Войдите через Google, чтобы разблокировать кастомизацию и участвовать в мировом рейтинге!'
    );
    setAuthGateOpen(true);
  };

  const closeAuthGate = () => {
    setAuthGateOpen(false);
  };

  const openConfigModal = () => {
    setConfigModalOpen(true);
  };

  const closeConfigModal = () => {
    setConfigModalOpen(false);
  };

  const login = async (): Promise<{ error: Error | null }> => {
    if (!configState.isConfigured) {
      // Prompt user to configure keys
      setConfigModalOpen(true);
      return {
        error: new Error('Для авторизации необходимо указать Supabase URL и Anon Key в настройках.'),
      };
    }
    const res = await signInWithGoogle();
    return res;
  };

  const logout = async () => {
    await signOutFromSupabase();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isGuest: !user,
        isLoading,
        isConfigured: configState.isConfigured,
        supabaseUrl: configState.url,
        authGateOpen,
        authGateReason,
        configModalOpen,
        openAuthGate,
        closeAuthGate,
        openConfigModal,
        closeConfigModal,
        loginWithGoogle: login,
        logout,
        refreshConfig,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
