import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../api/apiClient';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'OWNER' | 'MANAGER' | 'STAFF';
  organization: {
    id: string;
    name: string;
    businessType: string;
    monthlyTarget: number;
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string, businessName: string, businessType: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('revenueai_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('revenueai_token');
  });

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMe = async () => {
      if (token) {
        try {
          const res = await apiClient.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.data.user);
            localStorage.setItem('revenueai_user', JSON.stringify(res.data.data.user));
          }
        } catch (err) {
          console.error('Session restoration failed:', err);
          logout();
        }
      }
      setLoading(false);
    };
    fetchMe();
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await apiClient.post('/auth/login', { email, password });
    if (res.data.success) {
      const { token: newToken, user: newUser } = res.data.data;
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('revenueai_token', newToken);
      localStorage.setItem('revenueai_user', JSON.stringify(newUser));
    }
  };

  const register = async (fullName: string, email: string, password: string, businessName: string, businessType: string) => {
    const res = await apiClient.post('/auth/register', { fullName, email, password, businessName, businessType });
    if (res.data.success) {
      const { token: newToken, user: newUser } = res.data.data;
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('revenueai_token', newToken);
      localStorage.setItem('revenueai_user', JSON.stringify(newUser));
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('revenueai_token');
    localStorage.removeItem('revenueai_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
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
