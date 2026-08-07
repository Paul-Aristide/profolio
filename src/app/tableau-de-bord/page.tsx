// src/app/tableau-de-bord/page.tsx — Plein écran
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { apiGet } from '@/lib/api/client';
import Header from '@/components/Header';
import ProfilTab from '@/components/tabs/ProfilTab';
import FormationTab from '@/components/tabs/FormationTab';
import ExperienceTab from '@/components/tabs/ExperienceTab';
import CompetencesTab from '@/components/tabs/CompetencesTab';
import AgendaTab from '@/components/tabs/AgendaTab';
import ActualitesTab from '@/components/tabs/ActualitesTab';
import ContactTab from '@/components/tabs/ContactTab';
import type { UserData } from '@/types';

// Les tabs disponibles (VoirPlus supprimé, contenu déplacé dans le menu dropdown)
const DEFAULT_TABS = [
  { id: 'profil', label: 'Profil' },
  { id: 'formation', label: 'Formation' },
  { id: 'experience', label: 'Parcours Pro' },
  { id: 'actualites', label: 'Actualités' },
  { id: 'agenda', label: 'Agenda' },
  { id: 'competences', label: 'Compétences' },
  { id: 'contact', label: 'Contact' },
];

export default function TableauDeBordPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profil');
  const [data, setData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Charger les données depuis /api/u/[username] avec polling pour synchronisation temps réel
  async function loadUserData() {
    if (!user?.username) return;
    
    try {
      const res = await apiGet<UserData>(`/api/u/${user.username}`);
      setData(res);
    } catch (err) {
      console.error('Erreur chargement données utilisateur:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/connexion');
      return;
    }
    
    if (user?.username) {
      loadUserData();
      // Polling toutes les 5 secondes pour synchronisation temps réel uniquement si on est sur l'onglet actualites
      const interval = setInterval(loadUserData, activeTab === 'actualites' ? 5000 : 30000);
      return () => clearInterval(interval);
    }
  }, [user, authLoading, router, activeTab, user?.username]);

  useEffect(() => {
    if (user?.username) {
      loadUserData();
    }
  }, [activeTab, user?.username]);

  if (authLoading || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-brand-bg">
        <div className="w-10 h-10 rounded-full border-2 border-[#00E5FF] border-t-transparent animate-spin" />
      </main>
    );
  }

  if (!user || !data) return null;

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Header
        expertise={data.profile?.expertise || user.expertise || 'Informaticien'}
        firstName={data.firstName || user.firstName}
        lastName={data.lastName || user.lastName}
        photo={data.profile?.profilePhoto || user.profilePhoto}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOwner={true}
        tabs={DEFAULT_TABS}
      />

      {/* Contenu plein écran */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="w-full max-w-7xl mx-auto">
           {activeTab === 'profil' ? (
             <ProfilTab initialData={data} />
           ) : activeTab === 'formation' ? (
             <FormationTab initialData={data} />
           ) : activeTab === 'experience' ? (
             <ExperienceTab initialData={data} />
           ) : activeTab === 'competences' ? (
             <CompetencesTab initialData={data} />
           ) : activeTab === 'agenda' ? (
             <AgendaTab initialData={data} />
           ) : activeTab === 'actualites' ? (
             <ActualitesTab initialData={data} />
           ) : activeTab === 'contact' ? (
             <ContactTab />
           ) : (
             <ProfilTab initialData={data} />
           )}
        </div>
      </div>
    </div>
  );
}
