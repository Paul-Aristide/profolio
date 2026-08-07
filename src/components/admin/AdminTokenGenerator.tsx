// src/components/admin/AdminTokenGenerator.tsx
'use client';

import { useState, useEffect } from 'react';
import { apiGet, apiPost } from '@/lib/api/client';

type Token = {
  id: string;
  token: string;
  expiresAt: string;
  usedAt: string | null;
  usedByEmail: string | null;
  createdAt: string;
};

export default function AdminTokenGenerator() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [expiresInDays, setExpiresInDays] = useState(7);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadTokens() {
      try {
        const data = await apiGet<Token[]>('/api/admin/tokens');
        setTokens(data);
      } catch (err) {
        console.error('Erreur chargement tokens :', err);
      }
    }
    loadTokens();
  }, []);

  async function handleGenerate() {
    setLoading(true);
    setMessage(null);
    setGeneratedToken(null);
    setCopied(false);
    try {
      const token = await apiPost<Token>('/api/admin/tokens', { expiresInDays });
      setTokens([token, ...tokens]);
      setGeneratedToken(token.token);
      setMessage('Token généré avec succès — copiez-le maintenant, il ne sera plus affiché');
    } catch (err) {
      const msg = (err as { error?: string })?.error || 'Erreur lors de la génération';
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy(tokenValue: string) {
    try {
      await navigator.clipboard.writeText(tokenValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert('Erreur lors de la copie. Veuillez copier manuellement : ' + tokenValue);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Durée de validité :</label>
          <input
            type="number"
            min="1"
            max="365"
            value={expiresInDays}
            onChange={(e) => setExpiresInDays(Number(e.target.value))}
            className="w-24 px-3 py-2 rounded-lg border border-brand-card focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/30 text-sm text-center"
          />
          <span className="text-sm text-gray-600">jours</span>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-6 py-2.5 rounded-xl text-white text-sm font-semibold transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2"
          style={{
            background: 'linear-gradient(135deg, #00E5FF, #0077FF)',
            boxShadow: '0 4px 15px rgba(0, 229, 255, 0.3)',
          }}
        >
          {loading ? '⏳' : '🔑'}
          {loading ? 'Génération...' : "Générer un token d'invitation"}
        </button>
      </div>

      {message && (
        <div className={`text-sm px-4 py-2.5 rounded-lg ${
          message.includes('Erreur')
            ? 'text-red-600 bg-red-50 border border-red-200'
            : 'text-green-700 bg-green-50 border border-green-200'
        }`}>
          {message}
        </div>
      )}

      {generatedToken && (
        <div className="p-4 bg-gradient-to-r from-[#00E5FF]/10 to-[#B388FF]/10 rounded-xl border-2 border-dashed border-[#00E5FF] mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🔑</span>
            <span className="font-bold text-sm text-gray-800">Token d&apos;invitation généré</span>
            <span className="text-xs text-orange-600 font-medium">(à copier maintenant — ne sera plus affiché)</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 bg-white rounded-lg border border-gray-200 font-mono text-sm break-all text-gray-800">
              {generatedToken}
            </code>
            <button
              onClick={() => handleCopy(generatedToken)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                copied
                  ? 'bg-green-100 text-green-700'
                  : 'bg-[#00E5FF]/20 text-[#00E5FF] hover:bg-[#00E5FF]/30'
              }`}
            >
              {copied ? '✓ Copié' : '📋 Copier'}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <span>🔐</span> Tokens existants
        </h4>
        {tokens.length === 0 && (
          <p className="text-sm text-gray-500">Aucun token généré pour le moment.</p>
        )}
        {tokens.map((token) => {
          const isUsed = !!token.usedAt;
          const isExpired = new Date(token.expiresAt) < new Date();
          const statusColor = isUsed
            ? 'bg-gray-200 text-gray-700'
            : isExpired
            ? 'bg-red-100 text-red-700'
            : 'bg-green-100 text-green-700';
          const statusLabel = isUsed ? 'Utilisé' : isExpired ? 'Expiré' : 'Disponible';
          return (
            <div
              key={token.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-sm transition-all"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                   <p className="text-sm font-mono text-gray-800 break-all">{token.token}</p>
                   {token.token && (
                   <button
                     onClick={() => handleCopy(token.token)}
                     className="px-2 py-1 bg-brand-blue-bright/20 text-brand-blue-bright rounded-lg text-xs font-medium hover:bg-brand-blue-bright/30 transition-colors"
                   >
                     📋 Copier
                   </button>
                   )}
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                  <span>Expire le: {new Date(token.expiresAt).toLocaleDateString('fr-FR')}</span>
                  {token.usedAt && (
                    <>
                      <span>•</span>
                      <span>Utilisé par: {token.usedByEmail || 'inconnu'}</span>
                    </>
                  )}
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                {statusLabel}
              </span>

              {/* Bouton de régénération pour les tokens expirés et non utilisés */}
              {!isUsed && isExpired && (
                <button
                  onClick={async () => {
                    const newExpires = prompt('Nouvelle durée de validité (jours) ?', '7');
                    if (newExpires === null) return;
                    try {
                       const data = await apiPost<{ token: string; expiresAt: string; wasExpired: boolean }>(
                         `/api/admin/tokens/${token.id}/regenerate`,
                         { expiresInDays: Number(newExpires) || 7 }
                       );
                       setGeneratedToken(data.token);
                       setCopied(false);
                       setTokens(tokens.map(t => t.id === token.id ? {
                         ...t,
                         token: data.token,
                         expiresAt: data.expiresAt,
                         usedAt: null,
                         usedByEmail: null,
                       } : t));
                       setMessage('Token régénéré — copiez-le maintenant');
                     } catch (err) {
                       const msg = (err as { error?: string })?.error || 'Erreur';
                       setMessage(msg);
                     }
                  }}
                  className="ml-3 px-3 py-1 rounded-lg bg-gradient-to-r from-[#00E5FF] to-[#0077FF] text-white text-xs font-medium hover:from-[#00BFFF] hover:to-[#0066FF] transition-all"
                >
                  🔄 Régénérer
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
