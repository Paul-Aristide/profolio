// src/components/tabs/PostCard.tsx - Pour affichage visiteur
'use client';

import { useState, useEffect } from 'react';
import { apiGet, apiPost } from '@/lib/api/client';

type Post = {
  id: string;
  title: string | null;
  description: string | null;
  content: string | null;
  mediaUrl: string | null;
  mediaType: string | null;
  backgroundColor: string | null;
  linkUrl: string | null;
  createdAt: string;
};

type Comment = {
  id: string;
  content: string;
  createdAt: string;
};

type PostCardProps = {
  post: Post;
  comments: Comment[];
  onComment: (postId: string, content: string) => Promise<void>;
};

// Types de réactions
type ReactionType = 'like' | 'upvote' | 'downvote' | 'favorite';

const REACTION_TYPES = [
  { type: 'like' as ReactionType, icon: '❤️', emptyIcon: '🤍', color: 'text-red-500' },
  { type: 'upvote' as ReactionType, icon: '👍', emptyIcon: '👍', color: 'text-blue-500' },
  { type: 'downvote' as ReactionType, icon: '👎', emptyIcon: '👎', color: 'text-gray-600' },
  { type: 'favorite' as ReactionType, icon: '⭐', emptyIcon: '☆', color: 'text-yellow-500' },
];

export default function PostCard({ post, comments, onComment }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [reactions, setReactions] = useState<Record<ReactionType, number>>({
    like: 0,
    upvote: 0,
    downvote: 0,
    favorite: 0
  });
  const [userReactions, setUserReactions] = useState<Set<ReactionType>>(new Set());
  const [newCommentText, setNewCommentText] = useState('');
  const [sendingComment, setSendingComment] = useState(false);

  // Charger les réactions au montage
  useEffect(() => {
    async function loadReactions() {
      try {
        const data = await apiGet(`/api/posts/${post.id}/reactions`) as { success: boolean; counts: Record<string, number>; userReactions: string[] } | null;
        if (data?.success) {
          setReactions({
            like: data.counts?.like || 0,
            upvote: data.counts?.upvote || 0,
            downvote: data.counts?.downvote || 0,
            favorite: data.counts?.favorite || 0,
          });
          setUserReactions(new Set((data.userReactions || []) as ReactionType[]));
        }
      } catch (err) {
        console.error('Erreur chargement réactions:', err);
      }
    }
    loadReactions();
  }, [post.id]);

  // Gérer une réaction (toggle)
  async function handleReaction(type: ReactionType) {
    const hasReaction = userReactions.has(type);
    try {
      const data = await apiPost<{ success: boolean; action: string }>(`/api/posts/${post.id}/reactions`, { type });

      if (data.success) {
        setUserReactions(prev => {
          const newSet = new Set(prev);
          if (hasReaction) {
            newSet.delete(type);
          } else {
            newSet.add(type);
          }
          return newSet;
        });

        setReactions(prev => ({
          ...prev,
          [type]: hasReaction
            ? Math.max((prev[type] || 0) - 1, 0)
            : (prev[type] || 0) + 1,
        }));
      }
    } catch (err) {
      console.error('Erreur réaction:', err);
    }
  }

  // Envoyer un commentaire
  async function handleSendComment() {
    if (!newCommentText.trim()) return;
    setSendingComment(true);
    try {
      await onComment(post.id, newCommentText);
      setNewCommentText('');
    } catch (err) {
      console.error('Erreur envoi commentaire:', err);
    } finally {
      setSendingComment(false);
    }
  }

  return (
    <article className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
      {/* Titre du post - grand, gras, centré */}
      <div className="p-6 pb-2">
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 text-center mb-4">
          {post.title}
        </h3>
        <p className="text-xs text-gray-400 text-center">
          Publié le {new Date(post.createdAt).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </p>
      </div>

      {/* Fond coloré si pas de média */}
      {!post.mediaUrl && (
        <div className="mx-6 mb-4 rounded-xl p-6" style={{ backgroundColor: post.backgroundColor || '#00E5FF' }}>
          <p className="text-gray-800 whitespace-pre-wrap leading-relaxed font-medium text-lg md:text-xl">
            {post.description || post.content}
          </p>
        </div>
      )}

       {/* Média (image/vidéo) */}
       {post.mediaUrl && (
         <div className="relative px-6">
           {post.mediaType === 'video' ? (
             <video
               src={post.mediaUrl}
               controls
               className="w-full h-auto max-h-[500px] object-cover rounded-xl"
             />
           ) : (
             <img
               src={post.mediaUrl}
               alt={post.title || "Publication"}
               className="w-full h-auto max-h-[500px] object-cover rounded-xl"
             />
           )}
       </div>
       )}

       {/* Lien partagé */}
       {post.linkUrl && (
         <div className="px-6">
           <a
             href={post.linkUrl}
             target="_blank"
             rel="noopener noreferrer"
             className="block group"
           >
             <div className="mb-2 pb-2 border-t border-gray-100 pt-3">
               <p className="text-xs text-gray-400 uppercase tracking-wider">Lien partagé</p>
             </div>
             <div className="flex items-start gap-3">
               <div className="mt-0.5 text-2xl shrink-0">🔗</div>
               <div className="flex-1 min-w-0">
                 <p className="text-sm text-gray-500 truncate">
                   {post.linkUrl.replace(/^https?:\/\//, '')}
                 </p>
               </div>
             </div>
           </a>
         </div>
       )}

      {/* Description sous le média si média présent */}
      {post.mediaUrl && (
        <div className="p-6 pt-4">
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed font-medium text-base">
            {post.description || post.content}
          </p>
        </div>
      )}

      {/* Boutons de réaction */}
      <div className="p-4 pt-2 border-t border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-4">
            {REACTION_TYPES.map(({ type, icon, emptyIcon, color }) => {
              const isActive = userReactions.has(type);
              return (
                <button
                  key={type}
                  onClick={() => handleReaction(type)}
                  className={`flex items-center gap-1 transition-all ${
                    isActive
                      ? `${color} scale-110`
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <span className="text-lg">{isActive ? icon : emptyIcon}</span>
                  <span className="text-sm">{reactions[type] || 0}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bouton pour afficher/masquer les commentaires */}
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#00E5FF] transition-colors w-full justify-center py-2"
        >
          <span className="text-lg">💬</span>
          <span>
            {showComments 
              ? 'Masquer les commentaires'
              : `Voir ${comments.length} commentaire${comments.length > 1 ? 's' : ''}`}
          </span>
          <svg
            className={`w-4 h-4 transition-transform ${showComments ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Section commentaires (masquée par défaut) */}
        {showComments && (
          <div className="mt-4 p-4 bg-white rounded-xl border border-gray-100">
            {/* Emojis rapides */}
            <div className="flex flex-wrap gap-2 mb-3">
              {['😀', '😂', '❤️', '🔥', '👍', '👏'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setNewCommentText(prev => prev + emoji + ' ')}
                  className="text-2xl hover:scale-125 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Zone de saisie */}
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                placeholder="Ajouter un commentaire (anonyme)..."
                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/30 text-sm"
              />
              <button
                onClick={handleSendComment}
                disabled={!newCommentText.trim() || sendingComment}
                className="px-4 py-2 rounded-xl text-white text-xs font-semibold transition-all disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #00E5FF, #0077FF)',
                }}
              >
                {sendingComment ? 'Envoi...' : 'Envoyer'}
              </button>
            </div>

            {/* Liste des commentaires (ANONYMES - seulement le contenu) */}
            <div className="space-y-3">
              {comments.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  Soyez le premier à commenter cette publication.
                </p>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="p-3 rounded-xl bg-gray-50 border border-gray-100"
                  >
                    {/* AFFICHAGE ANONYME - seulement le contenu */}
                    <p className="text-sm text-gray-700">{comment.content}</p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {new Date(comment.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
