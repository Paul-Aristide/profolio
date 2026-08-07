// src/app/connexion/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, getOrCreateDeviceId } from '@/lib/auth/AuthContext';

export default function ConnexionPage() {
  const { login, user } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
        router.push('/admin');
      } else {
        router.push('/tableau-de-bord');
      }
    }
  }, [user, loading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const deviceId = getOrCreateDeviceId();
      const result = await login(email, password, deviceId);

      if (result.requiresOTP) {
        sessionStorage.setItem('profolio_temp_token', result.tempToken);
        sessionStorage.setItem('profolio_device_id', deviceId);
        router.push('/verification-otp');
      }
    } catch (err) {
      const message = (err as { error?: string })?.error || 'Erreur de connexion';
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen relative overflow-hidden flex">
      {/* Fond dynamique */}
      <div className="auth-bg">
        <div className="auth-blob auth-blob-1" />
        <div className="auth-blob auth-blob-2" />
        <div className="auth-blob auth-blob-3" />
        <div className="auth-blob auth-blob-4" />
      </div>

      {/* Section gauche — Formulaire */}
      <div className="relative z-10 w-full lg:w-1/2 min-h-screen flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Logo mini en haut */}
          <div className="flex items-center gap-3 mb-10 auth-brand">
            <img src="/logo-profolio.png" alt="ProFolio+" className="w-10 h-10 rounded-full object-cover" />
            <span className="text-white font-bold text-lg tracking-tight">
              ProFolio<span className="text-[#00E5FF]">+</span>
            </span>
          </div>

          <div className="auth-card p-8 lg:p-10 auth-form-wrapper">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white">Connexion</h2>
              <p className="text-white/50 text-sm mt-1.5">
                Accédez à votre espace personnel
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="auth-label">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="auth-input"
                  placeholder="vous@exemple.com"
                />
              </div>

              <div>
                <label className="auth-label">Mot de passe</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-input"
                  placeholder="••••••••"
                />
              </div>

              {error && <div className="auth-error">{error}</div>}

              <button
                type="submit"
                disabled={loading}
                className="auth-btn"
              >
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-white/40 text-sm">
                Pas encore de compte ?{' '}
                <a href="/inscription" className="auth-link">
                  S'inscrire
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section droite — Logo + Branding */}
      <div className="hidden lg:flex relative z-10 w-1/2 min-h-screen items-center justify-center bg-gradient-to-br from-white/[0.02] to-transparent">
        <div className="text-center space-y-8 max-w-md px-12">
          {/* Logo animé */}
          <div className="flex justify-center animate-float">
            <div className="relative">
              <div className="w-52 h-52 rounded-full border-2 border-[#00E5FF]/20 flex items-center justify-center"
                style={{ animation: 'pulseGlow 3s ease-in-out infinite' }}
              >
                <div className="w-40 h-40 rounded-full border-2 border-[#B388FF]/20 flex items-center justify-center">
                  <div className="w-28 h-28 rounded-full flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, rgba(0,229,255,0.12), rgba(179,136,255,0.12))',
                    }}
                  >
                    <span className="text-4xl font-bold text-gradient">PF+</span>
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 rounded-full border border-[#00E5FF]/10 animate-spin" style={{ animationDuration: '20s' }}>
                <div className="absolute top-0 left-1/2 w-2 h-2 rounded-full bg-[#00E5FF]/50 -translate-x-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          {/* Texte de marque */}
          <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <h2 className="text-3xl font-bold text-white">
              ProFolio<span className="text-[#00E5FF]">+</span>
            </h2>
            <p className="text-[#87CEEB] text-sm font-medium tracking-[0.2em] uppercase">
              Design. Create. Impact.
            </p>
            <p className="text-white/40 text-sm leading-relaxed">
              La plateforme qui vous permet de créer un portfolio professionnel unique,
              de générer votre CV en un clic et de partager votre parcours avec le monde.
            </p>
          </div>

          {/* Petites stats */}
          <div className="flex justify-center gap-8 pt-4">
            {[
              ['100+', 'Portfolios'],
              ['7', 'Onglets'],
              ['1 Clique', 'CV'],
            ].map(([val, label]) => (
              <div key={label} className="text-center">
                <p className="text-xl font-bold text-white">{val}</p>
                <p className="text-[10px] text-white/30 uppercase tracking-wider">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
