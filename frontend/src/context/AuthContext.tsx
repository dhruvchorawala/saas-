'use client';
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api, { apiError } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

interface Credentials {
  name?: string;
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: Credentials) => Promise<boolean>;
  register: (data: Credentials) => Promise<boolean>;
  logout: () => Promise<void>;
  checkUserLoggedIn: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkUserLoggedIn = useCallback(async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkUserLoggedIn();
  }, [checkUserLoggedIn]);

  const login = async ({ email, password }: Credentials) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      setUser(res.data.data);
      toast.success(`Welcome back, ${res.data.data.name.split(' ')[0]}!`);
      return true;
    } catch (err) {
      toast.error(apiError(err, 'Login failed'));
      return false;
    }
  };

  const register = async ({ name, email, password }: Credentials) => {
    try {
      const res = await api.post('/auth/register', { name, email, password });
      setUser(res.data.data);
      toast.success('Account created');
      return true;
    } catch (err) {
      toast.error(apiError(err, 'Registration failed'));
      return false;
    }
  };

  const logout = async () => {
    try {
      await api.get('/auth/logout');
    } finally {
      setUser(null);
      toast.success('Logged out');
      router.push('/');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkUserLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
