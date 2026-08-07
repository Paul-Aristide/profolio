// src/components/tabs/FormationTab.tsx — Style feed social
'use client';

import { useState, useEffect, useRef } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api/client';
import type { UserData } from '@/types';

type Formation = {
  id: string;
  title: string;
  institution: string;
  year: number;
  description: string | null;
  photo: string | null;
};

type FormData = {
  title: string;
  institution: string;
  year: number;
  description: string;
  photo: string;
};

const EMPTY_FORM: FormData = { title: '', institution: '', year: new Date().getFullYear(), description: '', photo: '' };

function toDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function FormationTab({ isOwner = true, initialData }: { isOwner?: boolean; initialData?: UserData }) {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  async function load() {
    try {
      const data = await apiGet<Formation[]>('/api/formations');
      setFormations(data);
    } catch {
      setMessage({ type: 'error', text: 'Impossible de charger les formations' });
    } finally {
      setLoading(false);
    }
  }

  // Synchroniser avec les données initiales
  useEffect(() => {
    if (initialData?.formations) {
      setFormations(initialData.formations);
      setLoading(false);
    }
  }, [initialData]);

  // Charger depuis API si pas de données initiales
  useEffect(() => {
    if (!initialData?.formations) {
      load();
      const interval = setInterval(load, 5000);
      return () => clearInterval(interval);
    }
  }, [initialData]);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setPhotoFile(file);
    if (file) setPhotoPreview(URL.createObjectURL(file));
    else setPhotoPreview(null);
  }

  function clearPhoto() {
    setPhotoFile(null);
    setPhotoPreview(null);
    setForm((f) => ({ ...f, photo: '' }));
    if (photoInputRef.current) photoInputRef.current.value = '';
  }

  function openNew() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    clearPhoto();
    setShowForm(true);
  }

  function startEdit(f: Formation) {
    setEditingId(f.id);
    setForm({ title: f.title, institution: f.institution, year: f.year, description: f.description || '', photo: f.photo || '' });
    setPhotoFile(null);
    setPhotoPreview(f.photo || null);
    setShowForm(true);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    clearPhoto();
    setShowForm(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    try {
      let photo = form.photo;
      if (photoFile) photo = await toDataUrl(photoFile);
      const payload = { ...form, photo: photo || null };

      if (editingId) {
        await apiPut(`/api/formations/${editingId}`, payload);
        setMessage({ type: 'success', text: 'Formation modifiée' });
      } else {
        await apiPost('/api/formations', payload);
        setMessage({ type: 'success', text: 'Formation ajoutée' });
      }
      cancelEdit();
      await load();
    } catch (err) {
      setMessage({ type: 'error', text: (err as { error?: string })?.error || 'Erreur' });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cette formation ?')) return;
    try {
      await apiDelete(`/api/formations/${id}`);
      setMessage({ type: 'success', text: 'Formation supprimée' });
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Formation</h2>
          <p className="text-sm text-gray-500">{formations.length} formation{formations.length > 1 ? 's' : ''}</p>
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

      {/* Logos d'écoles dynamiques avec descriptions en défilement horizontal */}
      {formations.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-4 overflow-x-auto pb-4 no-scrollbar" style={{ scrollSnapType: 'x mandatory' }}>
            {formations.map((f) => (
              <div key={f.id} className="shrink-0 w-48" style={{ scrollSnapAlign: 'start' }}>
                <div className="w-full h-32 rounded-2xl bg-white border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden mb-2">
                  {f.photo ? (
                    <img src={f.photo} alt={f.institution} className="w-full h-full object-cover max-h-32" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#00E5FF]/10 to-[#B388FF]/10 flex items-center justify-center text-3xl">🎓</div>
                  )}
                </div>
                <p className="text-xs font-semibold text-gray-800 truncate">{f.institution}</p>
                <p className="text-[10px] text-gray-500">{f.title} — {f.year}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Liste des formations — style feed */}
      <div className="space-y-4">
        {formations.length === 0 && !showForm && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">Aucune formation pour l'instant</p>
            <p className="text-gray-400 text-sm mt-1">Ajoutez votre première formation</p>
          </div>
        )}

        {formations.map((f) => (
          <div key={f.id} className="post-card group">
            <div className="flex flex-col sm:flex-row">
              {/* Media 3/4 */}
              <div className={`${f.photo ? 'sm:w-3/4' : 'w-full'} bg-gray-50 min-h-[200px] flex items-center justify-center relative`}>
                {f.photo ? (
                  <img src={f.photo} alt={f.title} className="w-full h-full object-cover max-h-72" />
                ) : (
                  <div className="text-center">
                    <svg className="w-12 h-12 text-gray-200 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                )}
                {/* Actions overlay */}
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => startEdit(f)}
                    className="px-3 py-1.5 rounded-lg bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-medium hover:bg-white shadow-sm transition"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(f.id)}
                    className="px-3 py-1.5 rounded-lg bg-red-500/90 backdrop-blur-sm text-white text-xs font-medium hover:bg-red-600 shadow-sm transition"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
              {/* Details 1/4 */}
              <div className={`${f.photo ? 'sm:w-1/4' : 'w-full'} p-5 flex flex-col justify-between`}>
                <div>
                  <span className="text-xs font-semibold text-[#00E5FF] uppercase tracking-wider">{f.institution}</span>
                  <h3 className="text-lg font-bold text-gray-900 mt-1">{f.title}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{f.year}</p>
                  {f.description && <p className="text-sm text-gray-600 mt-2 leading-relaxed">{f.description}</p>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de formulaire avec background flou et scrollable */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in-up">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 w-full max-w-2xl mx-4 animate-slide-up shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sticky top-0 bg-white z-10 pt-2 -mt-4 -mx-6 px-6">
              <h3 className="text-lg font-bold text-gray-900">{editingId ? 'Modifier la formation' : 'Nouvelle formation'}</h3>
              <button type="button" onClick={cancelEdit} className="text-gray-400 hover:text-gray-600 transition">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Titre / diplôme</label>
              <input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/30 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Institution</label>
              <input required value={form.institution} onChange={(e) => setForm((f) => ({ ...f, institution: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/30 text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Année</label>
              <input type="number" required value={form.year} onChange={(e) => setForm((f) => ({ ...f, year: Number(e.target.value) }))}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/30 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Photo (optionnel)</label>
              <div className="file-input-custom w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-400 cursor-pointer"
                onClick={() => photoInputRef.current?.click()}>
                {photoFile?.name || 'Choisir un fichier'}
                <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </div>
              {photoPreview && <img src={photoPreview} alt="" className="mt-2 h-16 rounded-lg object-cover" />}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={2} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/30 text-sm" />
          </div>

          {photoPreview && (
            <button type="button" onClick={clearPhoto} className="text-xs text-red-500 hover:underline">Supprimer la photo</button>
          )}

          {message && (
            <p className={`text-sm px-4 py-3 rounded-xl ${
              message.type === 'success' ? 'text-green-700 bg-green-50 border border-green-200' : 'text-red-600 bg-red-50 border border-red-200'
            }`}>{message.text}</p>
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
