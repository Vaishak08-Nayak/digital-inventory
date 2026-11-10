import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { User, Business } from '../types';

interface AuthContextType {
  user: User | null;
  business: Business | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  login: (email: string, pass: string) => Promise<void>;
  registerOwner: (data: any) => Promise<void>;
  registerCustomer: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Load theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('kirana_theme') as 'light' | 'dark' | null;
    const initialTheme = savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(initialTheme);
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('kirana_theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data?.data) {
        setUser(res.data.data);
        if (res.data.data.ownedBusinesses?.length > 0) {
          // Fetch full business details
          const bRes = await api.get('/business');
          setBusiness(bRes.data.data);
        }
      }
    } catch {
      setUser(null);
      setBusiness(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.post('/auth/login', { email, password: pass });
    if (res.data?.data?.user) {
      setUser(res.data.data.user);
      await refreshUser();
    }
  };

  const registerOwner = async (data: any) => {
    const res = await api.post('/auth/register', data);
    if (res.data?.data?.user) {
      setUser(res.data.data.user);
      await refreshUser();
    }
  };

  const registerCustomer = async (data: any) => {
    const res = await api.post('/auth/register-customer', data);
    if (res.data?.data?.user) {
      setUser(res.data.data.user);
      await refreshUser();
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
      setBusiness(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        business,
        isAuthenticated: !!user,
        isLoading,
        theme,
        toggleTheme,
        login,
        registerOwner,
        registerCustomer,
        logout,
        refreshUser,
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
