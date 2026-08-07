// src/app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import Header from '@/components/Header';
import DashboardStats from '@/components/DashboardStats';
import VoirPlusTab from '@/components/tabs/VoirPlusTab';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('stats');

  useEffect(() => {
    if (!loading && !user) {
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

  const tabs = [
    { id: 'stats', label: 'Statistiques' },
    { id: 'cv', label: 'CV' },
  ];

  return (
    <div className="min-h-screen bg-brand-bg">
      <Header
        expertise={user.expertise || 'Expertise non spécifiée'}
        firstName={user.firstName}
        lastName={user.lastName}
        photo={user.profilePhoto}
        activeTab="dashboard"
        onTabChange={() => {}}
      />
      <main className="max-w-5xl mx-auto p-6">
        {/* Onglets Statistique & CV */}
        <nav className="mb-6">
          <div className="flex items-center gap-1 bg-brand-card rounded-xl p-1 border border-brand-border">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-[#00E5FF] to-[#0077FF] text-white shadow-md'
                    : 'text-gray-600 hover:text-brand-text hover:bg-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </nav>
        
        {/* Contenu selon l'onglet */}
        <div className="bg-white rounded-xl shadow-lg border border-brand-card p-6">
          {activeTab === 'stats' && <DashboardStats />}
          {activeTab === 'cv' && <VoirPlusTab />}
        </div>
      </main>
    </div>
  );
}
