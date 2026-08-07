// src/components/PortfolioPage.tsx
'use client';

import { useState, useEffect } from 'react';
import { apiGet } from '@/lib/api/client';
import Header from '@/components/Header';
import ProfilTab from '@/components/tabs/ProfilTab';
import FormationTab from '@/components/tabs/FormationTab';
import CompetencesTab from '@/components/tabs/CompetencesTab';
import AgendaTab from '@/components/tabs/AgendaTab';
import ActualitesTab from '@/components/tabs/ActualitesTab';
import ContactTab from '@/components/tabs/ContactTab';

type PublicUserData = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  profile: {
    bio: string | null;
    expertise: string | null;
    city: string | null;
    country: string | null;
    profilePhoto: string | null;
    coverPhoto: string | null;
  } | null;
  formations: Array<{
    id: string;
    title: string;
    institution: string;
    year: number;
    description: string | null;
  }>;
  skills: Array<{
    id: string;
    category: string;
    title: string;
    description: string | null;
  }>;
  posts: Array<{
    id: string;
    title: string | null;
    description: string | null;
    content: string | null;
    mediaUrl: string | null;
    mediaType: string | null;
    createdAt: string;
  }>;
};

export default function PortfolioPage({ username }: { username: Promise<{ username: string }> }) {
  const [data, setData] = useState<PublicUserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('profil');

  useEffect(() => {
    async function load() {
      try {
        const { username: userUsername } = await username;
        const res = await apiGet<PublicUserData>(`/api/u/${userUsername}`);
        setData(res);
      } catch (err) {
        setError((err as { error?: string })?.error || 'Portfolio introuvable');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [username]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-brand-bg">
        <p className="text-brand-text">Chargement du portfolio...</p>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-brand-bg">
        <p className="text-red-500">{error}</p>
      </main>
    );
  }

  const fullName = `${data.firstName} ${data.lastName}`;
  const profilePhoto = data.profile?.profilePhoto || 'https://via.placeholder.com/120x120/00E5FF/FFFFFF?text=Photo';

  const tabs = [
    { id: 'profil', label: 'Profil' },
    { id: 'formation', label: 'Formation' },
    { id: 'actualites', label: 'Actualités' },
    { id: 'agenda', label: 'Agenda' },
    { id: 'competences', label: 'Compétences' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <div className="min-h-screen bg-brand-bg">
      <Header
        expertise={data.profile?.expertise || 'Portfolio'}
        firstName={data.firstName}
        lastName={data.lastName}
        photo={profilePhoto}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        tabs={tabs}
      />

      <main className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-brand-card">
          {activeTab === 'profil' && <ProfilTab isOwner={true} />}
          {activeTab === 'formation' && <FormationTab isOwner={true} />}
          {activeTab === 'competences' && <CompetencesTab isOwner={true} />}
          {activeTab === 'agenda' && <AgendaTab isOwner={true} />}
          {activeTab === 'actualites' && <ActualitesTab isOwner={true} />}
          {activeTab === 'contact' && <ContactTab isOwner={true} />}
        </div>
      </main>
    </div>
  );
}
