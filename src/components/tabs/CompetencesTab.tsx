// src/components/tabs/CompetencesTab.tsx
'use client';

import { useState, useEffect } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api/client';
import type { UserData } from '@/types';

type Skill = {
  id: string;
  category: string;
  title: string;
  description: string | null;
};

const CATEGORIES = [
  { value: 'acquis', label: 'Compétence acquise', icon: '⭐', color: 'from-[#00E5FF]/10 to-[#00BFFF]/10 border-[#00E5FF]/20' },
  { value: 'poste_vise', label: 'Poste visé', icon: '🎯', color: 'from-[#B388FF]/10 to-[#D1C4E9]/10 border-[#B388FF]/20' },
  { value: 'domaine_formation', label: 'Domaine de formation', icon: '📚', color: 'from-[#87CEEB]/10 to-[#00BFFF]/10 border-[#87CEEB]/20' },
  { value: 'experience', label: 'Expérience', icon: '💼', color: 'from-green-100/50 to-emerald-100/50 border-green-200/50' },
];

const EMPTY_FORM = { category: 'acquis', title: '', description: '' };

export default function CompetencesTab({ isOwner = true, initialData }: { isOwner?: boolean; initialData?: UserData }) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);

  async function load() {
    try {
      const data = await apiGet<Skill[]>('/api/skills');
      setSkills(data);
    } catch {
      setMessage({ type: 'error', text: 'Impossible de charger les compétences' });
    } finally {
      setLoading(false);
    }
  }

  // Synchroniser avec les données initiales
  useEffect(() => {
    if (initialData?.skills) {
      setSkills(initialData.skills);
      setLoading(false);
    }
  }, [initialData]);

  // Charger depuis API si pas de données initiales
  useEffect(() => {
    if (!initialData?.skills) {
      load();
      const interval = setInterval(load, 5000);
      return () => clearInterval(interval);
    }
  }, [initialData]);

  function openNew() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function startEdit(s: Skill) {
    setEditingId(s.id);
    setForm({ category: s.category, title: s.title, description: s.description || '' });
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
      if (editingId) {
        await apiPut(`/api/skills/${editingId}`, form);
        setMessage({ type: 'success', text: 'Compétence modifiée' });
      } else {
        await apiPost('/api/skills', form);
        setMessage({ type: 'success', text: 'Compétence ajoutée' });
      }
      cancelEdit();
      await load();
    } catch (err) {
      setMessage({ type: 'error', text: (err as { error?: string })?.error || 'Erreur' });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cette compétence ?')) return;
    try {
      await apiDelete(`/api/skills/${id}`);
      setMessage({ type: 'success', text: 'Compétence supprimée' });
      await load();
    } catch (err) {
      setMessage({ type: 'error', text: (err as { error?: string })?.error || 'Erreur' });
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-10 h-10 rounded-full border-2 border-[#00E5FF] border-t-transparent animate-spin" />
    </div>
  );

  const grouped = CATEGORIES.map((cat) => ({
    ...cat,
    items: skills.filter((s) => s.category === cat.value),
  }));

  const total = skills.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Compétences</h2>
          <p className="text-sm text-gray-500">{total} compétence{total > 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={openNew}
          className="px-4 py-2 rounded-xl text-white text-sm font-semibold transition-all flex items-center gap-1.5"
          style={{ background: 'linear-gradient(135deg, #00E5FF, #0077FF)', boxShadow: '0 4px 15px rgba(0, 229, 255, 0.3)' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Ajouter
        </button>
      </div>

      {total === 0 && !showForm && (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">Aucune compétence pour l'instant</p>
          <p className="text-gray-400 text-sm mt-1">Ajoutez vos compétences et expériences</p>
        </div>
      )}

      {/* Skills grouped by category */}
      {grouped.map((group) =>
        group.items.length > 0 ? (
          <div key={group.value}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{group.icon}</span>
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">{group.label}</h3>
              <span className="text-xs text-gray-400">({group.items.length})</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {group.items.map((s) => (
                <div
                  key={s.id}
                  className="group bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all duration-200 card-hover"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm">{s.title}</h4>
                      {s.description && <p className="text-xs text-gray-500 mt-1">{s.description}</p>}
                    </div>
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button onClick={() => startEdit(s)}
                        className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-[#00E5FF]/10 text-gray-500 hover:text-[#00E5FF] flex items-center justify-center transition text-xs">
                        ✎
                      </button>
                      <button onClick={() => handleDelete(s.id)}
                        className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-500 flex items-center justify-center transition text-xs">
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null
      )}

      {/* Modal de formulaire avec background flou et scrollable */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in-up">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 w-full max-w-2xl mx-4 animate-slide-up shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sticky top-0 bg-white z-10 pt-2 -mt-4 -mx-6 px-6">
              <h3 className="text-lg font-bold text-gray-900">{editingId ? 'Modifier la compétence' : 'Nouvelle compétence'}</h3>
              <button type="button" onClick={cancelEdit} className="text-gray-400 hover:text-gray-600 transition">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
              <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/30 text-base">
                {CATEGORIES.map((c) => (<option key={c.value} value={c.value}>{c.label}</option>))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Titre <span className="text-red-500">*</span></label>
              <input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/30 text-base" />
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
