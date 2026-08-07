// src/components/admin/AdminDashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { apiGet, apiPatch, apiDelete } from '@/lib/api/client';
import AdminTokenGenerator from './AdminTokenGenerator';
import AdminMetricsPanel from './AdminMetricsPanel';

type AdminStats = {
  totalUsers: number;
  activeUsers: number;
  blockedUsers: number;
  totalPosts: number;
  totalMessages: number;
  totalPageViews: number;
  pendingReports: number;
  recentUsers: Array<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    isBlocked: boolean;
    createdAt: string;
  }>;
};

type User = {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
  isBlocked: boolean;
  isProtected: boolean;
  blockedAt: string | null;
  createdAt: string;
  pageViewsCount?: number;
};

type AdminMetrics = {
  postsByDay: Array<{ date: string; count: number }>;
  messagesByDay: Array<{ date: string; count: number }>;
  viewsByDay: Array<{ date: string; count: number }>;
  commentsByDay: Array<{ date: string; count: number }>;
  totals: {
    users: number;
    activeUsers: number;
    blockedUsers: number;
    posts: number;
    messages: number;
    pageViews: number;
    comments: number;
    pendingReports: number;
  };
};

type Report = {
  id: string;
  status: string;
  reason: string;
  details: string | null;
  reportedUserId: string;
  reporterEmail: string | null;
  reporterName: string | null;
  adminNotes: string | null;
  reviewedByUserId: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type TabId = 'overview' | 'metrics' | 'users' | 'intervention';

type AdminDashboardProps = {
  activeTab?: TabId;
};

const CARD_GRADIENTS: Record<string, string> = {
  'bg-brand-blue-bright': 'linear-gradient(135deg, #00E5FF 0%, #00BFFF 100%)',
  'bg-green-500': 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
  'bg-red-500': 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
  'bg-brand-blue-sky': 'linear-gradient(135deg, #87CEEB 0%, #5DADE2 100%)',
  'bg-brand-purple': 'linear-gradient(135deg, #B388FF 0%, #9370DB 100%)',
  'bg-blue-600': 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
  'bg-orange-500': 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
};

const CARD_ICONS: Record<string, string> = {
  'Utilisateurs totaux': '👥',
  'Utilisateurs actifs': '✅',
  'Utilisateurs bloqués': '🚫',
  'Publications': '📝',
  'Messages échangés': '💬',
  'Visites totales': '📊',
  'Signalements en attente': '⚠️',
};

export default function AdminDashboard({ activeTab = 'overview' }: AdminDashboardProps) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, metricsData, usersData, reportsData] = await Promise.all([
          apiGet<AdminStats>('/api/admin/dashboard'),
          apiGet<AdminMetrics>('/api/admin/metrics'),
          apiGet<User[]>('/api/admin/users'),
          apiGet<Report[]>('/api/admin/reports'),
        ]);
        setStats(statsData);
        setMetrics(metricsData);
        setUsers(usersData);
        setReports(reportsData);
      } catch (err) {
        console.error('Erreur chargement données admin :', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  async function handleBlockUser(userId: string, isBlocked: boolean) {
    setActionLoading(userId);
    try {
      await apiPatch(`/api/admin/users/${userId}`, { action: isBlocked ? 'unblock' : 'block' });
      setUsers(users.map(u => u.id === userId ? { ...u, isBlocked: !isBlocked } : u));
      if (stats) {
        setStats({
          ...stats,
          activeUsers: stats.activeUsers + (!isBlocked ? -1 : 1),
          blockedUsers: stats.blockedUsers + (isBlocked ? -1 : 1),
        });
      }
    } catch (err) {
      console.error('Erreur blocage utilisateur :', err);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDeleteUser(userId: string) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.')) {
      return;
    }
    setActionLoading(userId);
    try {
      await apiDelete(`/api/admin/users/${userId}`);
      setUsers(users.filter(u => u.id !== userId));
      if (stats) {
        setStats({ ...stats, totalUsers: stats.totalUsers - 1 });
      }
    } catch (err) {
      console.error('Erreur suppression utilisateur :', err);
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-12 h-12 rounded-full border-4 border-[#00E5FF] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!stats || !metrics) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">Erreur lors du chargement des données.</p>
      </div>
    );
  }

  const overviewCards = [
    { label: 'Utilisateurs totaux', value: stats.totalUsers, color: 'bg-brand-blue-bright' },
    { label: 'Utilisateurs actifs', value: stats.activeUsers, color: 'bg-green-500' },
    { label: 'Utilisateurs bloqués', value: stats.blockedUsers, color: 'bg-red-500' },
    { label: 'Publications', value: stats.totalPosts, color: 'bg-brand-blue-sky' },
    { label: 'Messages échangés', value: stats.totalMessages, color: 'bg-brand-purple' },
    { label: 'Visites totales', value: stats.totalPageViews, color: 'bg-blue-600' },
    { label: 'Signalements en attente', value: stats.pendingReports, color: 'bg-orange-500' },
  ];

  const roleLabels: Record<string, { label: string; className: string }> = {
    USER: { label: 'Utilisateur', className: 'bg-brand-blue-sky/20 text-brand-blue-sky' },
    ADMIN: { label: 'Administrateur', className: 'bg-brand-purple/20 text-brand-purple' },
    SUPER_ADMIN: { label: 'Super Admin', className: 'bg-brand-blue-bright/20 text-brand-blue-bright' },
  };

  const reportStatusLabels: Record<string, { label: string; className: string }> = {
    pending: { label: 'En attente', className: 'bg-orange-100 text-orange-700' },
    resolved: { label: 'Résolu', className: 'bg-green-100 text-green-700' },
    rejected: { label: 'Rejeté', className: 'bg-gray-100 text-gray-700' },
  };

  return (
    <div className="space-y-8">
      {/* En-tête de page */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-text">Panel Administration</h1>
          <p className="text-gray-500 mt-1">Gérez les utilisateurs et surveillez la plateforme</p>
        </div>
      </div>

      {/* ======================================== ONGLET OVERVIEW ======================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Cartes de statistiques avec icônes et gradients */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {overviewCards.map((card) => {
              const icon = CARD_ICONS[card.label] || '📊';
              const gradient = CARD_GRADIENTS[card.color] || 'linear-gradient(135deg, #00E5FF, #0077FF)';
              return (
                <div
                  key={card.label}
                  className="group relative overflow-hidden rounded-2xl shadow-lg border border-gray-100 bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity"
                    style={{ background: gradient }} />
                  <div className="relative p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-3xl">{icon}</span>
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: gradient, opacity: 0.15 }}
                      >
                        <span className="text-white text-lg">{icon}</span>
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-brand-text mb-1">{card.value}</p>
                    <p className="text-sm text-gray-500">{card.label}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Utilisateurs récents */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-brand-text flex items-center gap-2">
                <span>👥</span> Utilisateurs récents
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Nom
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Rôle
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Inscription
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentUsers.map((user) => {
                    const roleInfo = roleLabels[user.role] || { label: user.role, className: 'bg-gray-100 text-gray-700' };
                    return (
                      <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 text-sm font-medium text-gray-800">
                          {user.firstName} {user.lastName}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{user.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${roleInfo.className}`}>
                            {roleInfo.label}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            user.isBlocked
                              ? 'bg-red-100 text-red-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {user.isBlocked ? 'Bloqué' : 'Actif'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================== ONGLET MÉTRIQUES ======================================== */}
      {activeTab === 'metrics' && (
        <div className={loading ? 'opacity-50' : ''}>
          {metrics ? <AdminMetricsPanel metrics={metrics} /> : null}
        </div>
      )}

      {/* ======================================== ONGLET GESTION UTILISATEURS ======================================== */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* Token generator */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00E5FF]/20 to-[#B388FF]/20 flex items-center justify-center">
                <span className="text-lg">🔑</span>
              </div>
              <h3 className="text-lg font-bold text-brand-text">Génération de token d&apos;invitation</h3>
            </div>
            <AdminTokenGenerator />
          </div>

          {/* Liste des utilisateurs */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-brand-text flex items-center gap-2">
                <span>👥</span> Gestion des utilisateurs
              </h3>
              <p className="text-sm text-gray-500 mt-1">{users.length} utilisateur{users.length !== 1 ? 's' : ''} enregistré{users.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Utilisateur
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Rôle
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Visites
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Inscription
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const roleInfo = roleLabels[user.role] || { label: user.role, className: 'bg-gray-100 text-gray-700' };
                    const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
                    return (
                      <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00E5FF]/20 to-[#B388FF]/20 flex items-center justify-center text-sm font-bold text-gradient">
                              {initials || '👤'}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-800">
                                {user.firstName} {user.lastName}
                              </p>
                              <p className="text-xs text-gray-500">@{user.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{user.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${roleInfo.className}`}>
                            {roleInfo.label}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            user.isBlocked
                              ? 'bg-red-100 text-red-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {user.isBlocked ? 'Bloqué' : 'Actif'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {user.pageViewsCount ?? 0}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">
                          {user.blockedAt && (
                            <p className="text-xs text-red-500">
                              Bloqué le {new Date(user.blockedAt).toLocaleDateString('fr-FR')}
                            </p>
                          )}
                          {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================== ONGLET INTERVENTION ======================================== */}
      {activeTab === 'intervention' && (
        <div className="space-y-6">
          {/* Actions sur les utilisateurs */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-brand-text flex items-center gap-2">
                <span>⚡</span> Actions sur les utilisateurs
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {users.filter(u => !u.isProtected).length} utilisateur{users.filter(u => !u.isProtected).length !== 1 ? 's' : ''} modifiables
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Utilisateur
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Rôle
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const roleInfo = roleLabels[user.role] || { label: user.role, className: 'bg-gray-100 text-gray-700' };
                    const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
                    return (
                      <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00E5FF]/20 to-[#B388FF]/20 flex items-center justify-center text-sm font-bold text-gradient">
                              {initials || '👤'}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-800">
                                {user.firstName} {user.lastName}
                              </p>
                              {user.isProtected && (
                                <span className="text-xs text-yellow-600">⚡ Protégé</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{user.email}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${roleInfo.className}`}>
                            {roleInfo.label}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            user.isBlocked
                              ? 'bg-red-100 text-red-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {user.isBlocked ? 'Bloqué' : 'Actif'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {user.isProtected && (
                              <span className="text-xs text-gray-400 italic">Protégé</span>
                            )}
                            {!user.isProtected && (
                              <>
                                <button
                                  onClick={() => handleBlockUser(user.id, user.isBlocked)}
                                  disabled={actionLoading === user.id}
                                  className={`px-4 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all duration-200 ${
                                    user.isBlocked
                                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
                                      : 'bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600'
                                  } disabled:opacity-60 disabled:cursor-not-allowed`}
                                >
                                  {user.isBlocked ? '🔓' : '🔒'}
                                  {user.isBlocked ? 'Débloquer' : 'Bloquer'}
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user.id)}
                                  disabled={actionLoading === user.id}
                                  className={`px-4 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed`}
                                >
                                  🗑
                                  {actionLoading === user.id ? '...' : 'Supprimer'}
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Signalements reçus */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-brand-text flex items-center gap-2">
                <span>⚠️</span> Signalements reçus
              </h3>
              <p className="text-sm text-gray-500 mt-1">{reports.length} signalement{reports.length !== 1 ? 's' : ''}</p>
            </div>
            {reports.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">✅</span>
                </div>
                <p className="text-gray-500 font-medium">Aucun signalement pour le moment.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Raison
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Signalé par
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => {
                      const statusInfo = reportStatusLabels[report.status] || { label: report.status, className: 'bg-gray-100 text-gray-700' };
                      return (
                        <tr key={report.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}>
                              {statusInfo.label}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-800 font-medium">
                            {report.reason}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {report.reporterName || report.reporterEmail || 'Anonyme'}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-500">
                            {new Date(report.createdAt).toLocaleDateString('fr-FR')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
