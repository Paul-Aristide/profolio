// src/app/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminDashboard from '@/components/admin/AdminDashboard';

type AdminTabId = 'overview' | 'metrics' | 'users' | 'intervention';

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTabId>('overview');

  useEffect(() => {
    if (!loading && (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN'))) {
      router.push('/connexion');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-brand-bg">
        <p className="text-brand-text">Chargement...</p>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg">
      <AdminHeader activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="max-w-6xl mx-auto p-6">
        <AdminDashboard activeTab={activeTab} />
      </main>
    </div>
  );
}
