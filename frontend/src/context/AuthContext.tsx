'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  checkUserLoggedIn: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkUserLoggedIn();
  }, []);

  const checkUserLoggedIn = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.data);
    } catch (err) {
      setUser(null);
    }
    setLoading(false);
  };

  const login = async ({ email, password }: any) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      setUser(res.data.data);
      toast.success('Logged in successfully');
      router.push('/profile');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Login failed');
    }
  };

  const register = async ({ name, email, password }: any) => {
    try {
      const res = await api.post('/auth/register', { name, email, password });
      setUser(res.data.data);
      toast.success('Registered successfully');
      router.push('/profile');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Registration failed');
    }
  };

  const logout = async () => {
    try {
      await api.get('/auth/logout');
      setUser(null);
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (err) {
      console.error(err);
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
