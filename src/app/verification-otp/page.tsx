// src/app/verification-otp/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';

export default function VerificationOtpPage() {
  const { verifyOtp } = useAuth();
  const router = useRouter();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);

  useEffect(() => {
    const t = sessionStorage.getItem('profolio_temp_token');
    const d = sessionStorage.getItem('profolio_device_id');
    if (!t || !d) {
      router.push('/connexion');
      return;
    }
    setTempToken(t);
    setDeviceId(d);
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tempToken || !deviceId) return;

    setError('');
    setLoading(true);

    try {
      const user = await verifyOtp(tempToken, otp, deviceId);
      sessionStorage.removeItem('profolio_temp_token');
      
      // Rediriger vers /admin si l'utilisateur est ADMIN ou SUPER_ADMIN
      if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
        router.push('/admin');
      } else {
        router.push('/tableau-de-bord');
      }
    } catch (err) {
      const message = (err as { error?: string })?.error || 'Code invalide';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center relative px-4">
      <div className="auth-bg">
        <div className="auth-blob auth-blob-1" />
        <div className="auth-blob auth-blob-2" />
        <div className="auth-blob auth-blob-3" />
        <div className="auth-blob auth-blob-4" />
        <div className="auth-shape auth-shape-1" />
        <div className="auth-shape auth-shape-2" />
        <div className="auth-shape auth-shape-3" />
        <div className="auth-shape auth-shape-4" />
        <div className="auth-shape auth-shape-5" />
        <div className="auth-shape auth-shape-6" />
        <div className="auth-grid-line auth-grid-line-1" />
        <div className="auth-grid-line auth-grid-line-2" />
        <div className="auth-grid-line auth-grid-line-3" />
        <div className="auth-grid-line auth-grid-line-4" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="auth-brand text-center mb-8">
          <h1 className="font-bold tracking-tight mb-2" style={{ fontSize: '2.2rem', color: '#ffffff' }}>
            ProFolio
          </h1>
          <p className="text-blue-100 text-sm font-medium tracking-wide uppercase">
            Vérification en deux étapes
          </p>
        </div>

        <div className="auth-card p-8 auth-form-wrapper">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800">Vérification</h2>
            <p className="text-sm text-gray-500 mt-1">
              Nouvel appareil détecté. Entrez le code reçu par email pour continuer.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Code OTP</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="auth-input text-center text-2xl tracking-[0.5em] font-mono"
                placeholder="000000"
              />
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="auth-btn"
            >
              {loading ? 'Vérification...' : 'Valider'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/connexion')}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Retour à la connexion
            </button>
          </div>
        </div>

        <p className="text-center text-blue-200/60 text-xs mt-6">
          © 2026 ProFolio — Plateforme de portfolios professionnels
        </p>
      </div>
    </main>
  );
}
