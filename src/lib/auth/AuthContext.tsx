// src/lib/auth/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiGet, getToken, setTokens, clearTokens } from '@/lib/api/client';

type User = {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  expertise?: string | null;
  profilePhoto?: string | null;
};

type LoginResult =
  | { requiresOTP: true; tempToken: string }
  | { requiresOTP: false; user: User };

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, deviceId: string) => Promise<LoginResult>;
  verifyOtp: (tempToken: string, otp: string, deviceId: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return 'server';
  let deviceId = localStorage.getItem('profolio_device_id');
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem('profolio_device_id', deviceId);
  }
  return deviceId;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshUser(): Promise<User | null> {
    try {
      const token = getToken();
      if (!token) {
        setUser(null);
        return null;
      }
      const data = await apiGet<User & { profile?: { expertise?: string | null; profilePhoto?: string | null } }>('/api/profile');
      const fetchedUser: User = {
        id: data.id,
        email: data.email,
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
        role: (data as unknown as { role: User['role'] }).role,
        expertise: data.profile?.expertise || null,
        profilePhoto: data.profile?.profilePhoto || null,
      };
      setUser(fetchedUser);
      return fetchedUser;
    } catch {
      setUser(null);
      return null;
    }
  }

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string, deviceId: string): Promise<LoginResult> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, deviceId }),
    });
    const data = await res.json();
    if (!res.ok) throw data;

    if (data.requiresOTP) {
      return { requiresOTP: true, tempToken: data.tempToken };
    }

    setTokens(data.token, data.refreshToken);
    await refreshUser();
    return { requiresOTP: false, user: data.user };
  }

  async function verifyOtp(tempToken: string, otp: string, deviceId: string): Promise<User> {
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tempToken, otp, deviceId }),
    });
    const data = await res.json();
    if (!res.ok) throw data;

    setTokens(data.token, data.refreshToken);
    const refreshedUser = await refreshUser();
    if (!refreshedUser) {
      throw new Error('Erreur lors de la récupération du profil utilisateur');
    }
    return refreshedUser;
  }

  async function logout() {
    const refreshToken = localStorage.getItem('profolio_refresh_token');
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
    } finally {
      clearTokens();
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, verifyOtp, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans un AuthProvider');
  return ctx;
}

export { getOrCreateDeviceId };
