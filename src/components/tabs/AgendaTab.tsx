// src/components/tabs/AgendaTab.tsx
'use client';

import { useState, useEffect } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api/client';
import type { UserData } from '@/types';

type AgendaEvent = {
  id: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  timezone: string;
  status: string;
};

const STATUSES = [
  { value: 'available', label: 'Disponible', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  { value: 'busy', label: 'Occupé', color: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
  { value: 'uncertain', label: 'Incertain', color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
  { value: 'holiday', label: 'Férié / Weekend', color: 'bg-gray-100 text-gray-700', dot: 'bg-gray-400' },
];

const EMPTY_FORM = {
  title: '',
  description: '',
  startTime: '',
  endTime: '',
  timezone: 'Africa/Abidjan',
  status: 'available',
};

function statusMeta(status: string) {
  return STATUSES.find((s) => s.value === status) || STATUSES[0];
}

function formatDate(iso: string, tz: string) {
  try {
    return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', timeZone: tz }).format(new Date(iso));
  } catch {
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  }
}

function formatTime(iso: string, tz: string) {
  try {
    return new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: tz }).format(new Date(iso));
  } catch {
    return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }
}

export default function AgendaTab({ isOwner = true, initialData }: { isOwner?: boolean; initialData?: UserData }) {
  const [events, setEvents] = useState<AgendaEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  async function load() {
    try {
      const data = await apiGet<AgendaEvent[]>('/api/agenda');
      setEvents(data);
    } catch {
      setMessage({ type: 'error', text: 'Impossible de charger l\'agenda' });
    } finally {
      setLoading(false);
    }
  }

  // Synchroniser avec les données initiales
  useEffect(() => {
    if (initialData?.agendaEvents) {
      setEvents(initialData.agendaEvents);
      setLoading(false);
    }
  }, [initialData]);

  // Charger depuis API si pas de données initiales
  useEffect(() => {
    if (!initialData?.agendaEvents) {
      load();
      const interval = setInterval(load, 5000);
      return () => clearInterval(interval);
    }
  }, [initialData]);

  function toLocalInputValue(iso: string) {
    const d = new Date(iso);
    const offset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
  }

  function openNew() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function startEdit(ev: AgendaEvent) {
    setEditingId(ev.id);
    setForm({
      title: ev.title,
      description: ev.description || '',
      startTime: toLocalInputValue(ev.startTime),
      endTime: toLocalInputValue(ev.endTime),
      timezone: ev.timezone,
      status: ev.status,
    });
    setShowForm(true);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    try {
      const payload = {
        ...form,
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString(),
      };
      if (editingId) {
        await apiPut(`/api/agenda/${editingId}`, payload);
        setMessage({ type: 'success', text: 'Événement modifié' });
      } else {
        await apiPost('/api/agenda', payload);
        setMessage({ type: 'success', text: 'Événement ajouté' });
      }
      cancelEdit();
      await load();
    } catch (err) {
      setMessage({ type: 'error', text: (err as { error?: string })?.error || 'Erreur' });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cet événement ?')) return;
    try {
      await apiDelete(`/api/agenda/${id}`);
      setMessage({ type: 'success', text: 'Événement supprimé' });
      await load();
    } catch (err) {
      setMessage({ type: 'error', text: (err as { error?: string })?.error || 'Erreur' });
    }
  }

  // Stats
  const totalEvents = events.length;
  const busyCount = events.filter(e => e.status === 'busy').length;
  const availableCount = events.filter(e => e.status === 'available').length;

  // Navigation mois
  const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  const prevMonth = () => { if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); } else setCurrentMonth(m => m - 1); };
  const nextMonth = () => { if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); } else setCurrentMonth(m => m + 1); };

  function getEventsForDay(day: number) {
    return events.filter(e => {
      const d = new Date(e.startTime);
      return d.getDate() === day && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-10 h-10 rounded-full border-2 border-[#00E5FF] border-t-transparent animate-spin" />
    </div>
  );

  const sorted = [...events].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Agenda</h2>
          <p className="text-sm text-gray-500">{totalEvents} événement{totalEvents > 1 ? 's' : ''}</p>
        </div>
        <button onClick={openNew}
          className="px-4 py-2 rounded-xl text-white text-sm font-semibold transition-all flex items-center gap-1.5"
          style={{ background: 'linear-gradient(135deg, #00E5FF, #0077FF)', boxShadow: '0 4px 15px rgba(0, 229, 255, 0.3)' }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Ajouter
        </button>
      </div>

      {/* Stats mini */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{totalEvents}</p>
          <p className="text-xs text-gray-500">Total</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{availableCount}</p>
          <p className="text-xs text-gray-500">Disponible</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <p className="text-2xl font-bold text-red-500">{busyCount}</p>
          <p className="text-xs text-gray-500">Occupé</p>
        </div>
      </div>

      {/* Calendrier mensuel */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 transition">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h3 className="text-sm font-bold text-gray-900">{months[currentMonth]} {currentYear}</h3>
          <button onClick={nextMonth} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 transition">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>

        {/* Jours de la semaine */}
        <div className="grid grid-cols-7 mb-2">
          {dayNames.map(d => (
            <div key={d} className="text-center text-[10px] font-semibold text-gray-400 uppercase py-1">{d}</div>
          ))}
        </div>

        {/* Grille des jours */}
        <div className="grid grid-cols-7">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayEvents = getEventsForDay(day);
            const hasEvent = dayEvents.length > 0;
            const isToday = day === new Date().getDate() && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear();
            return (
              <div key={day} className={`aspect-square p-1 relative ${isToday ? 'bg-[#00E5FF]/5 rounded-lg' : ''}`}>
                <span className={`text-xs font-medium flex items-center justify-center w-7 h-7 rounded-full mx-auto
                  ${isToday ? 'bg-[#00E5FF] text-white' : 'text-gray-700'}`}>
                  {day}
                </span>
                {hasEvent && (
                  <div className="flex justify-center gap-0.5 mt-0.5">
                    {dayEvents.slice(0, 3).map((ev, idx) => {
                      const meta = statusMeta(ev.status);
                      return <div key={idx} className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />;
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Liste des événements en colonnes colorées selon l'occupation */}
      {totalEvents === 0 && !showForm && (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-500 font-medium">Aucun événement</p>
          <p className="text-gray-400 text-sm mt-1">Ajoutez vos disponibilités</p>
        </div>
      )}

      {/* Affichage en colonnes colorées selon le statut */}
      {totalEvents > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>📋</span> Événements par statut
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {STATUSES.map((status) => {
              const eventsForStatus = sorted.filter(e => e.status === status.value);
              if (eventsForStatus.length === 0) return null;
              
              return (
                <div key={status.value} className="space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded-full ${status.dot}`} />
                    <span className="text-sm font-semibold text-gray-700">{status.label}</span>
                    <span className="text-xs text-gray-400">({eventsForStatus.length})</span>
                  </div>
                  <div className="space-y-2">
                    {eventsForStatus.map((ev) => (
                      <div key={ev.id} className={`px-3 py-2 rounded-lg text-xs ${status.color} border border-current/20 hover:shadow-sm transition-all`}>
                        <p className="font-medium truncate">{ev.title}</p>
                        <p className="text-[10px] opacity-70">
                          {formatTime(ev.startTime, ev.timezone)} - {formatTime(ev.endTime, ev.timezone)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Liste détaillée des événements */}
      <div className="space-y-3">
        {sorted.map((ev) => {
          const meta = statusMeta(ev.status);
          return (
            <div key={ev.id} className="post-card group p-4">
              <div className="flex items-start gap-4">
                {/* Date badge */}
                <div className="shrink-0 w-14 text-center">
                  <p className="text-lg font-bold text-gray-900 leading-tight">{new Date(ev.startTime).getDate()}</p>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase">
                    {new Date(ev.startTime).toLocaleDateString('fr-FR', { month: 'short' })}
                  </p>
                </div>
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2 h-2 rounded-full ${meta.dot}`} />
                    <h4 className="font-semibold text-gray-900 text-sm">{ev.title}</h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${meta.color}`}>{meta.label}</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {formatDate(ev.startTime, ev.timezone)} • {formatTime(ev.startTime, ev.timezone)} — {formatTime(ev.endTime, ev.timezone)}
                  </p>
                  <p className="text-[10px] text-gray-400">{ev.timezone}</p>
                  {ev.description && <p className="text-xs text-gray-600 mt-1">{ev.description}</p>}
                </div>
                {/* Actions */}
                {isOwner && (
                  <div className="shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEdit(ev)} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-[#00E5FF]/10 text-gray-500 hover:text-[#00E5FF] flex items-center justify-center transition text-xs">✎</button>
                    <button onClick={() => handleDelete(ev.id)} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-500 flex items-center justify-center transition text-xs">✕</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de formulaire avec background flou et scrollable */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in-up">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 w-full max-w-2xl mx-4 animate-slide-up shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sticky top-0 bg-white z-10 pt-2 -mt-4 -mx-6 px-6">
              <h3 className="text-lg font-bold text-gray-900">{editingId ? 'Modifier l\'événement' : 'Nouvel événement'}</h3>
              <button type="button" onClick={cancelEdit} className="text-gray-400 hover:text-gray-600 transition">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Titre <span className="text-red-500">*</span></label>
              <input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/30 text-base" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Début <span className="text-red-500">*</span></label>
                <input type="datetime-local" required value={form.startTime} onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/30 text-base" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fin <span className="text-red-500">*</span></label>
                <input type="datetime-local" required value={form.endTime} onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/30 text-base" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fuseau horaire</label>
                <input value={form.timezone} onChange={(e) => setForm((f) => ({ ...f, timezone: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/30 text-base" placeholder="Africa/Abidjan" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/30 text-base">
                  {STATUSES.map((s) => (<option key={s.value} value={s.value}>{s.label}</option>))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description (optionnelle)</label>
              <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/30 text-base resize-none" />
            </div>

            {message && (
              <p className={`text-sm px-4 py-3 rounded-xl text-center ${message.type === 'success' ? 'text-green-700 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                {message.text}
              </p>
            )}

            <div className="flex gap-3 pt-2 sticky bottom-0 bg-white pb-4 -mx-6 px-6">
              <button type="submit" className="flex-1 px-6 py-3 rounded-xl text-white font-semibold transition"
                style={{ background: 'linear-gradient(135deg, #00E5FF, #0077FF)' }}>
                {editingId ? 'Enregistrer' : 'Ajouter'}
              </button>
              <button type="button" onClick={cancelEdit} className="flex-1 px-6 py-3 rounded-xl text-gray-600 font-semibold border border-gray-200 hover:bg-gray-50 transition">
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
