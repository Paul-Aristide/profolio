// src/components/tabs/ActualitesTab.tsx — Grille responsive 1/2/3 colonnes
'use client';

import { useState, useEffect, useRef } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api/client';
import type { UserData, Post } from '@/types';

type FormData = {
  title: string;
  description: string;
  mediaUrl: string;
  mediaType: string;
  backgroundColor: string;
  linkUrl: string;
};

const EMOJIS = ['😀', '😂', '❤️', '🔥', '👍', '👏', '💪', '🎉', '🚀', '💯', '⭐'];

// Types de réactions
const REACTION_TYPES = [
  { type: 'like', icon: '❤️', emptyIcon: '🤍', color: 'text-red-500' },
  { type: 'upvote', icon: '👍', emptyIcon: '👎', color: 'text-blue-500' },
  { type: 'downvote', icon: '👎', emptyIcon: '👎', color: 'text-gray-500' },
  { type: 'favorite', icon: '⭐', emptyIcon: '✨', color: 'text-yellow-500' },
];

const EMPTY_FORM: FormData = { title: '', description: '', mediaUrl: '', mediaType: '', backgroundColor: '#00E5FF', linkUrl: '' };

function toDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ActualitesTab({ isOwner = true, initialData }: { isOwner?: boolean; initialData?: UserData }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [comments, setComments] = useState<Record<string, string>>({});
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [reactions, setReactions] = useState<Record<string, Record<string, number>>>({});
  const [userReactions, setUserReactions] = useState<Record<string, Set<string>>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function load() {
    try {
      const data = await apiGet<Post[]>('/api/posts');
      setPosts(data);
      // Charger les commentaires pour chaque post
      data.forEach(async (p) => {
        try {
          const res = await apiGet<{id: string; content: string; createdAt: string; user: {firstName: string; lastName: string} | null}[]>(`/api/posts/${p.id}/comments`);
          setComments((prev) => ({ ...prev, [p.id]: res.map(c => c.user ? `${c.user.firstName} ${c.user.lastName}: ${c.content}` : `Anonyme: ${c.content}`).join('\n') }));
        } catch {}
        // Charger les réactions pour chaque post
        try {
          const res = await fetch(`/api/posts/${p.id}/reactions`);
          const data = await res.json();
          if (data.success) {
            setReactions(prev => ({ ...prev, [p.id]: data.counts }));
          }
        } catch {}
      });
    } catch {
      setMessage({ type: 'error', text: 'Impossible de charger' });
    } finally {
      setLoading(false);
    }
  }

  // Synchroniser avec les données initiales
  useEffect(() => {
    if (initialData?.posts) {
      setPosts(initialData.posts);
      // Charger les commentaires et réactions pour chaque post
      initialData.posts.forEach(async (p) => {
        try {
          const res = await apiGet<{id: string; content: string; createdAt: string; user: {firstName: string; lastName: string} | null}[]>(`/api/posts/${p.id}/comments`);
          setComments((prev) => ({ ...prev, [p.id]: res.map(c => c.user ? `${c.user.firstName} ${c.user.lastName}: ${c.content}` : `Anonyme: ${c.content}`).join('\n') }));
        } catch {}
        try {
          const res = await fetch(`/api/posts/${p.id}/reactions`);
          const data = await res.json();
          if (data.success) {
            setReactions(prev => ({ ...prev, [p.id]: data.counts }));
          }
        } catch {}
      });
      setLoading(false);
    }
  }, [initialData]);

  // Charger depuis API si pas de données initiales
  useEffect(() => {
    if (!initialData?.posts) {
      load();
      const interval = setInterval(load, 5000);
      return () => clearInterval(interval);
    }
  }, [initialData]);

  async function handleReaction(postId: string, type: string) {
    const hasReaction = (userReactions[postId] || new Set()).has(type);
    try {
      const res = await fetch(`/api/posts/${postId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, remove: hasReaction }),
      });
      const data = await res.json();
      
      if (data.success) {
        setUserReactions(prev => {
          const postReactions = prev[postId] || new Set();
          const newSet = new Set(postReactions);
          if (hasReaction) {
            newSet.delete(type);
          } else {
            newSet.add(type);
          }
          return { ...prev, [postId]: newSet };
        });
        
        setReactions(prev => {
          const postReactionCounts = prev[postId] || { like: 0, upvote: 0, downvote: 0, favorite: 0 };
          const newCounts = { ...postReactionCounts };
          newCounts[type] = hasReaction ? (newCounts[type] || 0) - 1 : (newCounts[type] || 0) + 1;
          return { ...prev, [postId]: newCounts };
        });
      }
    } catch (err) {
      console.error('Erreur réaction:', err);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setMediaFile(file);
    if (file) { setMediaPreview(URL.createObjectURL(file)); setForm((f) => ({ ...f, mediaType: file.type.startsWith('video') ? 'video' : 'image' })); }
    else { setMediaPreview(null); setForm((f) => ({ ...f, mediaType: '' })); }
  }

  function clearMedia() { setMediaFile(null); setMediaPreview(null); setForm((f) => ({ ...f, mediaUrl: '', mediaType: '' })); if (fileInputRef.current) fileInputRef.current.value = ''; }
  function openNew() { setEditingId(null); setForm(EMPTY_FORM); clearMedia(); setShowForm(true); }
  function startEdit(p: Post) { setEditingId(p.id); setForm({ title: p.title || '', description: p.description || p.content || '', mediaUrl: p.mediaUrl || '', mediaType: p.mediaType || '', backgroundColor: p.backgroundColor || '#00E5FF', linkUrl: p.linkUrl || '' }); setMediaFile(null); setMediaPreview(p.mediaUrl || null); setShowForm(true); }
  function cancelEdit() { setEditingId(null); setForm(EMPTY_FORM); clearMedia(); setShowForm(false); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setMessage(null);
    try {
      let mediaUrl = form.mediaUrl;
      if (mediaFile) mediaUrl = await toDataUrl(mediaFile);
      const payload = { 
        title: form.title, 
        description: form.description, 
        mediaUrl: mediaUrl || null, 
        mediaType: mediaUrl ? (mediaFile?.type.startsWith('video') ? 'video' : form.mediaType || 'image') : null,
        backgroundColor: form.backgroundColor,
        linkUrl: form.linkUrl || null,
      };
      if (editingId) { await apiPut(`/api/posts/${editingId}`, payload); setMessage({ type: 'success', text: 'Publication modifiée' }); }
      else { await apiPost('/api/posts', payload); setMessage({ type: 'success', text: 'Publication ajoutée' }); }
      cancelEdit(); await load();
    } catch (err) { setMessage({ type: 'error', text: (err as { error?: string })?.error || 'Erreur' }); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ?')) return;
    try { await apiDelete(`/api/posts/${id}`); setMessage({ type: 'success', text: 'Publication supprimée' }); await load(); }
    catch (err) { setMessage({ type: 'error', text: (err as { error?: string })?.error || 'Erreur' }); }
  }

  async function handleCommentSubmit(postId: string) {
    const text = commentText[postId]?.trim();
    if (!text) return;
    try {
      await apiPost(`/api/posts/${postId}/comments`, { content: text });
      setCommentText((prev) => ({ ...prev, [postId]: '' }));
      // Recharger les commentaires
      const res = await apiGet<{id: string; content: string; createdAt: string; user: {firstName: string; lastName: string} | null}[]>(`/api/posts/${postId}/comments`);
      setComments((prev) => ({ ...prev, [postId]: res.map(c => c.user ? `${c.user.firstName} ${c.user.lastName}: ${c.content}` : `Anonyme: ${c.content}`).join('\n') }));
    } catch { alert('Erreur'); }
  }

  if (loading) return (<div className="flex items-center justify-center py-32"><div className="w-10 h-10 rounded-full border-2 border-[#00E5FF] border-t-transparent animate-spin" /></div>);

  const n = posts.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Actualités</h2>
          <p className="text-sm text-gray-500">{n} publication{n > 1 ? 's' : ''}</p>
        </div>
        <button onClick={openNew}
          className="px-4 py-2 rounded-xl text-white text-sm font-semibold transition-all flex items-center gap-1.5"
          style={{ background: 'linear-gradient(135deg, #00E5FF, #0077FF)' }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouveau post
        </button>
      </div>

      {/* Grille de publications - Layout Masonry */}
      {n === 0 && !showForm ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-500 font-medium">Aucune publication</p>
          <p className="text-gray-400 text-sm mt-1">Partagez vos projets</p>
        </div>
      ) : (
        <div className="masonry-grid">
          {posts.map((p) => {
            const postReactions = reactions[p.id] || { like: 0, upvote: 0, downvote: 0, favorite: 0 };
            const hasMedia = !!p.mediaUrl;
            
            return (
              <div 
                key={p.id} 
                className="post-card group flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 masonry-item"
              >
                {/* Titre - toujours visible, centré, grand et gras */}
                <div className="p-4 pt-5 px-6">
                  <h4 className="text-lg md:text-xl font-bold text-gray-900 text-center mb-2">{p.title}</h4>
                  <p className="text-[10px] text-gray-400 text-center">
                    Publié le {new Date(p.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                
                {/* Fond coloré si pas de média */}
                {!hasMedia && (
                  <div className="mx-6 mb-4 rounded-xl p-6" style={{ backgroundColor: p.backgroundColor || '#00E5FF' }}>
                    <p className="text-gray-800 whitespace-pre-wrap leading-relaxed font-medium text-lg md:text-xl">
                      {p.description || p.content}
                    </p>
                  </div>
                )}

                {/* Média (image/vidéo) */}
                {p.mediaUrl && (
                  <div className="relative mx-6 mb-4 rounded-xl overflow-hidden">
                    {p.mediaType === 'video' ? (
                      <video src={p.mediaUrl} controls className="w-full max-h-[500px] h-auto object-cover" />
                    ) : (
                      <img src={p.mediaUrl || undefined} alt={p.title || undefined} className="w-full max-h-[500px] h-auto object-cover" />
                    )}
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEdit(p)} className="px-3 py-1.5 rounded-lg bg-white/90 text-gray-700 text-xs font-medium hover:bg-white shadow-sm transition">Modifier</button>
                      <button onClick={() => handleDelete(p.id)} className="px-3 py-1.5 rounded-lg bg-red-500/90 text-white text-xs font-medium hover:bg-red-600 shadow-sm transition">Supprimer</button>
                    </div>
                  </div>
                )}
                
                {/* Description sous le média si média présent */}
                {hasMedia && (
                  <div className="p-6 pt-2">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed font-medium text-base">
                      {p.description || p.content}
                    </p>
                  </div>
                )}

                {/* Icônes de réaction */}
                <div className="p-4 pt-2 border-t border-gray-50 bg-gray-50/50">
                  <div className="flex items-center gap-4 mb-3">
                    {REACTION_TYPES.map(({ type, icon, emptyIcon, color }) => (
                      <button
                        key={type}
                        onClick={() => handleReaction(p.id, type)}
                        className={`flex items-center gap-1 text-sm text-gray-600 hover:${color} transition-colors`}
                      >
                        <span className="text-lg">{(userReactions[p.id] || new Set()).has(type) ? icon : emptyIcon}</span>
                        <span>{postReactions[type] || 0}</span>
                      </button>
                    ))}
                  </div>
                
                {/* Zone commentaires */}
                <div className="flex-1 flex flex-col justify-end">
                  {/* Emojis rapides */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {EMOJIS.slice(0, 6).map((emoji) => (
                      <button key={emoji} type="button" 
                        onClick={() => {
                          setCommentText(prev => ({ ...prev, [p.id]: (prev[p.id] || '') + emoji }));
                          const input = document.getElementById(`comment-input-${p.id}`) as HTMLInputElement;
                          if (input) input.focus();
                        }}
                        className="text-sm hover:scale-125 transition-transform">{emoji}</button>
                    ))}
                  </div>
                  {/* Commentaires existants */}
                  {comments[p.id] && (
                    <div className="text-xs text-gray-600 mb-2 max-h-20 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                      {comments[p.id]}
                    </div>
                  )}
                  {/* Input commentaire */}
                  <div className="flex gap-2">
                    <input
                      id={`comment-input-${p.id}`}
                      type="text"
                      value={commentText[p.id] || ''}
                      onChange={(e) => setCommentText((prev) => ({ ...prev, [p.id]: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit(p.id)}
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#00E5FF]/50 bg-white"
                      placeholder="Ajouter un commentaire..."
                    />
                    <button onClick={() => handleCommentSubmit(p.id)}
                      className="px-3 py-1.5 rounded-lg bg-[#00E5FF] text-white text-xs font-medium hover:bg-[#00BFFF] transition">
                      Envoyer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
          })}
        </div>
      )}

      {/* Modal de formulaire avec background flou et scrollable */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in-up">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 w-full max-w-2xl mx-4 animate-slide-up shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sticky top-0 bg-white z-10 pt-2 -mt-4 -mx-6 px-6">
              <h3 className="text-lg font-bold text-gray-900">{editingId ? 'Modifier la publication' : 'Nouvelle publication'}</h3>
              <button type="button" onClick={cancelEdit} className="text-gray-400 hover:text-gray-600 transition">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Champ Titre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Titre <span className="text-red-500">*</span></label>
              <input
                required
                type="text"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/30 text-base"
                placeholder="Donnez un titre à votre publication..."
              />
            </div>
            
            {/* Champ Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description <span className="text-red-500">*</span></label>
              <textarea
                required
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/30 text-base resize-none"
                placeholder="Partagez vos pensées, vos projets, vos réalisations..."
              />
            </div>
            
            {/* Sélecteur de couleur de fond */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Couleur de fond (pour les posts sans média)</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.backgroundColor}
                  onChange={(e) => setForm((f) => ({ ...f, backgroundColor: e.target.value }))}
                  className="w-12 h-10 rounded-lg border border-gray-200 cursor-pointer"
                />
                <span className="text-sm text-gray-600">{form.backgroundColor}</span>
              </div>
            </div>

            {/* Champ Lien partagé */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Lien partagé (optionnel)</label>
              <input
                type="url"
                value={form.linkUrl}
                onChange={(e) => setForm((f) => ({ ...f, linkUrl: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/30 text-base"
                placeholder="https://example.com/formation..."
              />
            </div>

            {/* Champ Media */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Média (optionnel)</label>
              <div className="file-input-custom w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-400 cursor-pointer transition"
                onClick={() => fileInputRef.current?.click()}>
                {mediaFile?.name || 'Ajouter une image ou vidéo'}
                <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={handleFileChange} />
              </div>
              {mediaPreview && (
                <div className="mt-3 relative inline-block">
                  {form.mediaType === 'video' ? (
                    <video src={mediaPreview} controls className="max-h-48 rounded-xl" />
                  ) : (
                    <img src={mediaPreview} alt="Aperçu" className="max-h-48 rounded-xl" />
                  )}
                  <button type="button" onClick={clearMedia} className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600 transition">
                    ×
                  </button>
                </div>
              )}
            </div>
            
            {/* Message d'erreur/succès */}
            {message && (
              <p className={`text-sm px-4 py-3 rounded-xl text-center ${message.type === 'success' ? 'text-green-700 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                {message.text}
              </p>
            )}
            
            {/* Boutons */}
            <div className="flex gap-3 pt-2 sticky bottom-0 bg-white pb-4 -mx-6 px-6">
              <button 
                type="submit"
                className="flex-1 px-6 py-3 rounded-xl text-white font-semibold transition"
                style={{ background: 'linear-gradient(135deg, #00E5FF, #0077FF)' }}
              >
                {editingId ? 'Enregistrer' : 'Publier'}
              </button>
              <button 
                type="button" 
                onClick={cancelEdit}
                className="flex-1 px-6 py-3 rounded-xl text-gray-600 font-semibold border border-gray-200 hover:bg-gray-50 transition"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
