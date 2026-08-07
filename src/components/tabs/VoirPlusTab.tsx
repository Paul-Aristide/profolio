// src/components/tabs/VoirPlusTab.tsx
'use client';

import { useState, useEffect } from 'react';
import { apiGet } from '@/lib/api/client';

type Stat = {
  label: string;
  value: number | string;
  icon: string;
  color: string;
};

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  user: { firstName: string; lastName: string; email: string };
  post: { id: string; content: string; createdAt: string };
};

export default function VoirPlusTab() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  async function downloadCv() {
    setDownloading(true);
    try {
      const res = await fetch('/api/cv', { credentials: 'include' });
      if (!res.ok) throw new Error('Échec');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'CV.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Impossible de générer le CV pour le moment.');
    } finally {
      setDownloading(false);
    }
  }

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, commentsRes] = await Promise.all([
          apiGet<Stat[]>('/api/dashboard/sts'),
          apiGet<Comment[]>('/api/dashboard/comments'),
        ]);
        setStats(statsRes);
        setComments(commentsRes);
      } catch (err) {
        console.error('Erreur chargement voir plus', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-10 h-10 rounded-full border-2 border-[#00E5FF] border-t-transparent animate-spin" />
    </div>
  );

  const scoreTotal = stats.reduce((acc, s) => acc + (typeof s.value === 'number' ? s.value : 0), 0);

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Voir plus</h2>
        <p className="text-sm text-gray-500">Statistiques, commentaires et téléchargement du CV</p>
      </div>

      {/* Stats cards */}
      {stats.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 stagger-children">
          {stats.map((stat) => (
            <div key={stat.label}
              className={`p-4 rounded-xl text-white ${stat.color} shadow-sm card-hover`}>
              <p className="text-2xl mb-1">{stat.icon}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-[10px] opacity-80 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Score total */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Score d'activité</p>
            <p className="text-3xl font-bold text-gray-900">{scoreTotal}</p>
          </div>
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00E5FF]/20 to-[#B388FF]/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-[#00E5FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </div>
      </div>

      {/* CV */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00E5FF]/20 to-[#B388FF]/20 flex items-center justify-center shrink-0">
            <svg className="w-7 h-7 text-[#00E5FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900">Mon CV</h3>
            <p className="text-sm text-gray-500 mt-1">Génère automatiquement un CV PDF à partir des données de votre portfolio.</p>
            <button onClick={downloadCv} disabled={downloading}
              className="mt-4 px-6 py-2.5 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #00E5FF, #0077FF)' }}>
              {downloading ? 'Génération...' : 'Télécharger mon CV (PDF)'}
            </button>
          </div>
        </div>
      </div>

      {/* Commentaires */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-[#00E5FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Commentaires reçus ({comments.length})
        </h3>
        {comments.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Aucun commentaire pour le moment</p>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00E5FF]/20 to-[#B388FF]/20 flex items-center justify-center shrink-0">
                    <span className="text-[10px] font-bold text-gradient">
                      {(comment.user.firstName?.[0] || '') + (comment.user.lastName?.[0] || '')}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{comment.user.firstName} {comment.user.lastName}</span>
                      <span className="text-[10px] text-gray-400">{new Date(comment.createdAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{comment.content}</p>
                    <p className="text-[11px] text-gray-400 mt-1 italic">Sur : {comment.post.content.slice(0, 100)}...</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
