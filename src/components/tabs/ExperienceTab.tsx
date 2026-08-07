// src/components/tabs/ExperienceTab.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api/client';
import type { UserData } from '@/types';

type Experience = {
  id: string;
  title: string;
  company: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  description: string | null;
  logo: string | null;
};

type FormData = {
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  logo: string;
};

const EMPTY_FORM: FormData = {
  title: '',
  company: '',
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
  current: false,
  description: '',
  logo: '',
};

function toDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ExperienceTab({ isOwner = true, initialData }: { isOwner?: boolean; initialData?: UserData }) {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  async function load() {
    try {
      const data = await apiGet<Experience[]>('/api/experiences');
      setExperiences(data);
    } catch {
      setMessage({ type: 'error', text: 'Impossible de charger les expériences' });
    } finally {
      setLoading(false);
    }
  }

  // Synchroniser avec les données initiales
  useEffect(() => {
    if (initialData?.experiences) {
      setExperiences(initialData.experiences);
      setLoading(false);
    }
  }, [initialData]);

  // Charger depuis API si pas de données initiales
  useEffect(() => {
    if (!initialData?.experiences) {
      load();
      const interval = setInterval(load, 5000);
      return () => clearInterval(interval);
    }
  }, [initialData]);

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setLogoFile(file);
    if (file) setLogoPreview(URL.createObjectURL(file));
    else setLogoPreview(null);
  }

  function clearLogo() {
    setLogoFile(null);
    setLogoPreview(null);
    setForm((f) => ({ ...f, logo: '' }));
    if (logoInputRef.current) logoInputRef.current.value = '';
  }

  function openNew() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    clearLogo();
    setShowForm(true);
  }

  function startEdit(exp: Experience) {
    setEditingId(exp.id);
    setForm({
      title: exp.title,
      company: exp.company,
      startDate: exp.startDate ? new Date(exp.startDate).toISOString().split('T')[0] : '',
      endDate: exp.endDate ? new Date(exp.endDate).toISOString().split('T')[0] : '',
      current: exp.current,
      description: exp.description || '',
      logo: exp.logo || '',
    });
    setLogoFile(null);
    setLogoPreview(exp.logo || null);
    setShowForm(true);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    clearLogo();
    setShowForm(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    try {
      let logo = form.logo;
      if (logoFile) logo = await toDataUrl(logoFile);
      const payload = { ...form, logo: logo || null };

      if (editingId) {
        await apiPut(`/api/experiences/${editingId}`, payload);
        setMessage({ type: 'success', text: 'Expérience modifiée' });
      } else {
        await apiPost('/api/experiences', payload);
        setMessage({ type: 'success', text: 'Expérience ajoutée' });
      }
      cancelEdit();
      await load();
    } catch (err) {
      setMessage({ type: 'error', text: (err as { error?: string })?.error || 'Erreur' });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cette expérience ?')) return;
    try {
      await apiDelete(`/api/experiences/${id}`);
      setMessage({ type: 'success', text: 'Expérience supprimée' });
      await load();
    } catch (err) {
      setMessage({ type: 'error', text: (err as { error?: string })?.error || 'Erreur' });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 rounded-full border-2 border-[#00E5FF] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Parcours Professionnel</h2>
          <p className="text-sm text-gray-500">{experiences.length} expérience{experiences.length > 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={openNew}
          className="px-4 py-2 rounded-xl text-white text-sm font-semibold transition-all duration-200 flex items-center gap-1.5"
          style={{
            background: 'linear-gradient(135deg, #00E5FF, #0077FF)',
            boxShadow: '0 4px 15px rgba(0, 229, 255, 0.3)',
          }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Ajouter
        </button>
      </div>

      {experiences.length === 0 && !showForm && (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 10-4 0v14m-4 0H7a2 2 0 01-2-2V9a2 2 0 012-2h2m10 10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">Aucune expérience professionnelle pour l'instant</p>
          <p className="text-gray-400 text-sm mt-1">Ajoutez votre première expérience</p>
        </div>
      )}

      {/* Logos dynamiques avec descriptions en défilement horizontal */}
      {experiences.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-4 overflow-x-auto pb-4 no-scrollbar" style={{ scrollSnapType: 'x mandatory' }}>
            {experiences.map((exp) => (
              <div key={exp.id} className="shrink-0 w-48" style={{ scrollSnapAlign: 'start' }}>
                <div className="w-full h-32 rounded-2xl bg-white border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden mb-2">
                  {exp.logo ? (
                    <img src={exp.logo} alt={exp.company} className="w-full h-full object-cover max-h-32" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#00E5FF]/10 to-[#B388FF]/10 flex items-center justify-center text-3xl">💼</div>
                  )}
                </div>
                <p className="text-xs font-semibold text-gray-800 truncate">{exp.company}</p>
                <p className="text-[10px] text-gray-500">{exp.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {experiences.map((exp) => (
          <div key={exp.id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              {exp.logo && (
                <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0">
                  <img src={exp.logo} alt={exp.company} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{exp.title}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{exp.company}</p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => startEdit(exp)}
                      className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-[#00E5FF]/10 text-gray-500 hover:text-[#00E5FF] flex items-center justify-center transition text-xs"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => handleDelete(exp.id)}
                      className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-500 flex items-center justify-center transition text-xs"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(exp.startDate).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
                  {' → '}
                  {exp.current ? 'Présent' : exp.endDate ? new Date(exp.endDate).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }) : ''}
                </p>
                {exp.description && (
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">{exp.description}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in-up">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 w-full max-w-2xl mx-4 animate-slide-up shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sticky top-0 bg-white z-10 pt-2 -mt-4 -mx-6 px-6">
              <h3 className="text-lg font-bold text-gray-900">{editingId ? 'Modifier l\'expérience' : 'Nouvelle expérience'}</h3>
              <button type="button" onClick={cancelEdit} className="text-gray-400 hover:text-gray-600 transition">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l6 6m0 0l6 6M12 6v12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Titre / poste *</label>
                <input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/30 text-sm bg-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Entreprise / Organisation *</label>
                <input required value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/30 text-sm bg-white" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Date de début *</label>
                <input type="date" required value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/30 text-sm bg-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Date de fin</label>
                <input type="date" value={form.current ? '' : form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                  disabled={form.current}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/30 text-sm bg-white disabled:opacity-50" />
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input type="checkbox" checked={form.current} onChange={(e) => setForm((f) => ({ ...f, current: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-[#00E5FF] focus:ring-[#00E5FF]" />
                  <span className="text-sm text-gray-700">Actuellement en poste</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Logo de l'entreprise (optionnel)</label>
              <div className="file-input-custom w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-400 cursor-pointer"
                onClick={() => logoInputRef.current?.click()}>
                {logoFile?.name || 'Choisir un fichier'}
                <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
              </div>
              {logoPreview && <img src={logoPreview} alt="" className="mt-2 h-16 rounded-lg object-cover" />}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Description (optionnelle)</label>
              <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={2} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/30 text-sm resize-none" />
            </div>

            {logoPreview && (
              <button type="button" onClick={clearLogo} className="text-xs text-red-500 hover:underline">Supprimer le logo</button>
            )}

            {message && (
              <p className={`text-sm px-4 py-3 rounded-xl ${message.type === 'success' ? 'text-green-700 bg-green-50 border border-green-200' : 'text-red-600 bg-red-50 border border-red-200'}`}>
                {message.text}
              </p>
            )}

            <div className="flex gap-3 pt-2 sticky bottom-0 bg-white pb-4 -mx-6 px-6">
              <button type="submit" className="flex-1 px-6 py-3 rounded-xl text-white font-semibold transition-all"
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
