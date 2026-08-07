// src/components/PostCard.tsx
'use client';

import { useState } from 'react';

type PostCardProps = {
  content: string;
  mediaUrl?: string | null;
  mediaType?: string | null;
  createdAt: string;
  isOwner?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
};

export default function PostCard({
  content,
  mediaUrl,
  mediaType,
  createdAt,
  isOwner = false,
  onEdit,
  onDelete,
}: PostCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="group bg-white rounded-xl shadow-sm border border-brand-card overflow-hidden hover:shadow-md transition">
      {mediaUrl && (
        <div className="w-full bg-black/5">
          {mediaType === 'video' ? (
            <video src={mediaUrl} controls className="w-full object-cover max-h-96" />
          ) : (
            <img src={mediaUrl} alt="" className="w-full object-cover max-h-96" />
          )}
        </div>
      )}
      <div className="p-4">
        <p className="text-sm text-brand-text whitespace-pre-wrap">{content}</p>
        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            {new Date(createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
          {isOwner && (
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="text-xs text-brand-blue-bright-2 hover:underline"
                >
                  Modifier
                </button>
              )}
              {onDelete && (
                <div className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={confirmDelete}
                    onChange={(e) => setConfirmDelete(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <button
                    onClick={onDelete}
                    disabled={!confirmDelete}
                    className="text-xs text-red-500 hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Supprimer
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
