// src/components/DashboardStats.tsx
'use client';

import { useState, useEffect } from 'react';
import { apiGet, apiPost } from '@/lib/api/client';

type StatsData = {
  profile: number;
  formations: number;
  skills: number;
  posts: number;
  messagesReceived: number;
  comments: number;
  views: number;
  viewsLast7Days: number;
  viewsLast30Days: number;
  followers: number;
  recentMessages: Array<{
    id: string;
    content: string;
    createdAt: string;
    senderName: string | null;
    senderEmail: string | null;
    sender: { firstName: string; lastName: string; email: string } | null;
  }>;
  recentPosts: Array<{ id: string; title: string | null; description: string | null; content: string | null; createdAt: string }>;
};

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  post: {
    id: string;
    title: string | null;
    description: string | null;
    content: string | null;
    createdAt: string;
  } | null;
};

export default function DashboardStats() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingCV, setDownloadingCV] = useState(false);

  useEffect(() => {
    async function loadStats() {
      try {
        const [statsData, commentsData] = await Promise.all([
          apiGet<StatsData>('/api/dashboard/stats'),
          apiGet<Comment[]>('/api/dashboard/comments'),
        ]);
        setStats(statsData);
        setComments(commentsData);
      } catch (err) {
        console.error('Erreur chargement stats :', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  // SSE : mise à jour en temps réel des statistiques
  useEffect(() => {
    const source = new EventSource('/api/sse/stats');

    source.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.error) return;
        setStats((prev) => prev ? {
          ...prev,
          posts: data.posts ?? prev.posts,
          messagesReceived: data.messagesReceived ?? prev.messagesReceived,
          views: data.views ?? prev.views,
          viewsLast7Days: data.viewsLast7Days ?? prev.viewsLast7Days,
          viewsLast30Days: data.viewsLast30Days ?? prev.viewsLast30Days,
          followers: data.followers ?? prev.followers,
        } : prev);
      } catch {
        // ignore malformed SSE data
      }
    };

    source.onerror = () => {
      // EventSource reconnecte automatiquement
    };

    return () => source.close();
  }, []);

  async function handleDownloadCV() {
    setDownloadingCV(true);
    try {
      const response = await fetch('/api/cv');
      if (!response.ok) throw new Error('Échec du téléchargement');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mon-cv-profolio.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert('Impossible de télécharger le CV. Veuillez réessayer.');
    } finally {
      setDownloadingCV(false);
    }
  }

  if (loading) {
    return <p className="text-brand-text">Chargement des statistiques...</p>;
  }

  if (!stats) {
    return <p className="text-red-500">Erreur lors du chargement des statistiques.</p>;
  }

  const statCards = [
    { label: 'Visites totales', value: stats.views, color: 'bg-brand-blue-bright', icon: '📊' },
    { label: 'Messages reçus', value: stats.messagesReceived, color: 'bg-brand-purple', icon: '💬' },
    { label: 'Publications', value: stats.posts, color: 'bg-brand-blue-sky', icon: '📝' },
    { label: 'Compétences', value: stats.skills, color: 'bg-green-500', icon: '⭐' },
    { label: 'Abonnés', value: stats.followers, color: 'bg-pink-500', icon: '👥' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-text">Tableau de bord</h1>
          <p className="text-gray-500 mt-1">Suivez l&apos;activité de votre portfolio</p>
        </div>
        <button
          onClick={handleDownloadCV}
          disabled={downloadingCV}
          className="bg-brand-blue-bright hover:bg-brand-blue-bright-2 disabled:bg-gray-400 text-white px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
        >
          {downloadingCV ? (
            <>
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Téléchargement...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Télécharger mon CV
            </>
          )}
        </button>
      </div>

      {/* Cartes de statistiques principales */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className={`p-6 rounded-xl text-white ${stat.color} shadow-lg transform transition-all duration-300 hover:scale-105`}
          >
            <div className="text-3xl mb-2">{stat.icon}</div>
            <p className="text-3xl font-bold">{stat.value}</p>
            <p className="text-sm opacity-90">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Graphique de performance (barres SVG) */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-brand-card">
        <h3 className="text-lg font-bold text-brand-text mb-4">📈 Performance sur 30 jours</h3>
        <PerformanceChart
          bars={[
            { label: '7j', value: stats.viewsLast7Days },
            { label: '30j', value: stats.viewsLast30Days },
            { label: 'Total', value: stats.views },
            { label: 'Messages', value: stats.messagesReceived },
            { label: 'Abonnés', value: stats.followers },
          ]}
          maxValue={Math.max(stats.views, stats.viewsLast30Days, stats.messagesReceived, stats.followers, 1)}
        />
      </div>

      {/* Vue d'ensemble: contenu + abonnés */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border border-brand-card">
          <h3 className="text-lg font-bold text-brand-text mb-4">📊 Visites</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">7 derniers jours</span>
              <span className="font-bold text-brand-text">{stats.viewsLast7Days}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">30 derniers jours</span>
              <span className="font-bold text-brand-text">{stats.viewsLast30Days}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total</span>
              <span className="font-bold text-brand-text">{stats.views}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-brand-card">
          <h3 className="text-lg font-bold text-brand-text mb-4">📝 Contenu & Abonnés</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Publications</span>
              <span className="font-bold text-brand-text">{stats.posts}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Formations</span>
              <span className="font-bold text-brand-text">{stats.formations}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Compétences</span>
              <span className="font-bold text-brand-text">{stats.skills}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Abonnés</span>
              <span className="font-bold text-pink-600">{stats.followers}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages récents */}
      {stats.recentMessages.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6 border border-brand-card">
          <h3 className="text-lg font-bold text-brand-text mb-4">💬 Messages récents</h3>
          <div className="space-y-3">
            {stats.recentMessages.map((msg) => (
              <div key={msg.id} className="border-b border-gray-100 pb-3 last:border-0">
                <p className="text-sm text-gray-800">{msg.content}</p>
                <p className="text-xs text-gray-500 mt-1">
                  De {msg.sender ? `${msg.sender.firstName} ${msg.sender.lastName}` : msg.senderName || 'Visiteur'} • {new Date(msg.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Commentaires reçus */}
      {comments.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6 border border-brand-card">
          <h3 className="text-lg font-bold text-brand-text mb-4">💭 Commentaires reçus</h3>
          <div className="space-y-3">
            {comments.map((comment) => (
              <div key={comment.id} className="border-b border-gray-100 pb-3 last:border-0">
                <p className="text-sm text-gray-800">{comment.content}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Par {comment.user ? `${comment.user.firstName} ${comment.user.lastName}` : 'Anonyme'} • {new Date(comment.createdAt).toLocaleDateString('fr-FR')}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Sur : {(comment.post?.content || comment.post?.description || '').slice(0, 100)}...
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

type ChartBar = { label: string; value: number };

function PerformanceChart({ bars, maxValue }: { bars: ChartBar[]; maxValue: number }) {
  const maxHeight = 160;
  const ratio = (v: number) => maxValue > 0 ? (v / maxValue) : 0;

  return (
    <div className="flex items-end justify-around gap-2 h-48">
      {bars.map((bar) => {
        const height = bar.value > 0 ? Math.max(ratio(bar.value) * maxHeight, 4) : 0;
        return (
          <div key={bar.label} className="flex flex-col items-center flex-1">
            <div className="relative w-full flex items-end justify-center" style={{ height: maxHeight }}>
              <div
                className="w-3/4 rounded-t-sm transition-all bg-gradient-to-t from-[#00E5FF] to-[#0077FF]"
                style={{
                  height: `${height}px`,
                  opacity: bar.value > 0 ? 1 : 0.3,
                }}
              />
              <span className="absolute -top-6 text-xs font-bold text-gray-700">
                {bar.value}
              </span>
            </div>
            <span className="text-xs text-gray-500 mt-1">{bar.label}</span>
          </div>
        );
      })}
    </div>
  );
}
