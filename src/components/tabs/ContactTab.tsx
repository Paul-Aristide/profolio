// src/components/tabs/ContactTab.tsx
'use client';

import { useState, useEffect } from 'react';
import { apiGet } from '@/lib/api/client';

type ContactInfo = {
  email: string;
  phone: string;
  profile: { city: string | null; country: string | null } | null;
};

type Message = {
  id: string;
  content: string;
  createdAt: string;
  senderName: string | null;
  senderEmail: string | null;
  sender: { firstName: string; lastName: string; email: string; username?: string } | null;
};

export default function ContactTab({ isOwner = true }: { isOwner?: boolean }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    try {
      const messagesRes = await apiGet<Message[]>('/api/messages/received');
      setMessages(messagesRes);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-10 h-10 rounded-full border-2 border-[#00E5FF] border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Messages reçus</h2>
          <p className="text-sm text-gray-500">
            {messages.length} message{messages.length > 1 ? 's' : ''} de visiteurs
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2 rounded-xl text-white text-sm font-semibold transition-all flex items-center gap-1.5 disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #00E5FF, #0077FF)', boxShadow: '0 4px 15px rgba(0, 229, 255, 0.3)' }}
        >
          <svg className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {refreshing ? 'Actualisation...' : 'Rafraîchir'}
        </button>
      </div>

      {/* Liste des messages */}
      {messages.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">Aucun message pour le moment</p>
          <p className="text-gray-400 text-sm mt-1">Les visiteurs peuvent vous contacter via votre page publique</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className="post-card p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00E5FF]/20 to-[#B388FF]/20 flex items-center justify-center">
                    <span className="text-sm font-bold text-gradient">
                      {msg.sender ? (msg.sender.firstName?.[0] || '') + (msg.sender.lastName?.[0] || '') : (msg.senderName?.[0] || 'V')}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {msg.sender ? `${msg.sender.firstName} ${msg.sender.lastName}` : msg.senderName || 'Visiteur'}
                    </p>
                    <p className="text-xs text-gray-400">{msg.sender?.email || msg.senderEmail || 'Anonyme'}</p>
                  </div>
                </div>
                <span className="text-[10px] text-gray-400">
                  {new Date(msg.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="pl-[52px]">
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
