'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { IAdmin } from '../types';
import { api } from '../lib/api';

interface AuthContextType {
  admin: IAdmin | null;
  loading: boolean;
  login: (phone: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<IAdmin | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // الـ auth بيشتغل جوه /admin بس. التنقل بين صفحات الأدمن مش بيعيد الطلب.
  const isAdminRoute = pathname?.startsWith('/admin') ?? false;

  const refreshMe = useCallback(async () => {
    if (!isAdminRoute) {
      setAdmin(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await api.auth.me();
      setAdmin(res.success && res.data ? res.data : null);
    } catch {
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  }, [isAdminRoute]);

  useEffect(() => {
    refreshMe();
  }, [refreshMe]);

  const login = async (phone: string, pass: string) => {
    const res = await api.auth.login(phone, pass);
    if (res.success && res.data) {
      setAdmin(res.data.admin);
      router.push('/admin');
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } finally {
      setAdmin(null);
      router.push('/admin/login');
    }
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout, refreshMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}