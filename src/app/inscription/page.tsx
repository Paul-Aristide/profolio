// src/app/inscription/page.tsx
'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { setTokens } from '@/lib/api/client';

function toDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function InscriptionPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    token: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    birthDate: '',
    birthPlace: '',
    phone: '',
    country: '',
    city: '',
  });
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const [coverPhotoFile, setCoverPhotoFile] = useState<File | null>(null);
  const [coverPhotoPreview, setCoverPhotoPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const profileRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    try {
      let profilePhoto: string | null = null;
      let coverPhoto: string | null = null;

      if (profilePhotoFile) profilePhoto = await toDataUrl(profilePhotoFile);
      if (coverPhotoFile) coverPhoto = await toDataUrl(coverPhotoFile);

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          profilePhoto,
          coverPhoto,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw data;

      setTokens(data.token, data.refreshToken);
      router.push('/tableau-de-bord');
    } catch (err) {
      const message = (err as { error?: string })?.error || 'Erreur lors de l\'inscription';
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
      <div className="relative z-10 w-full lg:w-1/2 min-h-screen overflow-y-auto flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">
          {/* Logo mini */}
          <div className="flex items-center gap-2 mb-8 auth-brand">
            <div className="w-9 h-9 rounded-full border-2 border-[#00E5FF]/50 flex items-center justify-center">
              <span className="text-[#00E5FF] font-bold text-xs">PF+</span>
            </div>
            <span className="text-white font-bold text-base tracking-tight">
              ProFolio<span className="text-[#00E5FF]">+</span>
            </span>
          </div>

          <div className="auth-card p-8 lg:p-10 auth-form-wrapper">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white">Inscription</h2>
              <p className="text-white/50 text-sm mt-1.5">
                Un token d&apos;invitation valide est requis
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Token */}
              <div>
                <label className="auth-label">Token d&apos;invitation</label>
                <input
                  required
                  value={form.token}
                  onChange={(e) => update('token', e.target.value)}
                  className="auth-input"
                  placeholder="Fourni par l'administrateur"
                />
              </div>

              {/* Nom / Prénom */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="auth-label">Prénom</label>
                  <input required value={form.firstName} onChange={(e) => update('firstName', e.target.value)} className="auth-input" />
                </div>
                <div>
                  <label className="auth-label">Nom</label>
                  <input required value={form.lastName} onChange={(e) => update('lastName', e.target.value)} className="auth-input" />
                </div>
              </div>

              {/* Date / Lieu naissance */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="auth-label">Date de naissance</label>
                  <input type="date" required value={form.birthDate} onChange={(e) => update('birthDate', e.target.value)} className="auth-input" />
                </div>
                <div>
                  <label className="auth-label">Lieu de naissance</label>
                  <input required value={form.birthPlace} onChange={(e) => update('birthPlace', e.target.value)} className="auth-input" />
                </div>
              </div>

              {/* Email / Téléphone */}
              <div>
                <label className="auth-label">Email</label>
                <input type="email" required value={form.email} onChange={(e) => update('email', e.target.value)} className="auth-input" />
              </div>
              <div>
                <label className="auth-label">Téléphone</label>
                <input required value={form.phone} onChange={(e) => update('phone', e.target.value)} className="auth-input" />
              </div>

              {/* Pays / Ville */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="auth-label">Pays</label>
                  <input required value={form.country} onChange={(e) => update('country', e.target.value)} className="auth-input" placeholder="Côte d'Ivoire" />
                </div>
                <div>
                  <label className="auth-label">Ville</label>
                  <input required value={form.city} onChange={(e) => update('city', e.target.value)} className="auth-input" placeholder="Abidjan" />
                </div>
              </div>

              {/* Photos */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="auth-label">Photo de profil</label>
                  <div
                    className="file-input-custom auth-input flex items-center justify-between cursor-pointer"
                    onClick={() => profileRef.current?.click()}
                  >
                    <span className="text-white/40 text-sm truncate">
                      {profilePhotoFile?.name || 'Choisir...'}
                    </span>
                    <span className="text-[#00E5FF] text-xs">📷</span>
                    <input
                      ref={profileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0] || null;
                        setProfilePhotoFile(f);
                        if (f) setProfilePhotoPreview(URL.createObjectURL(f));
                      }}
                    />
                  </div>
                  {profilePhotoPreview && (
                    <img src={profilePhotoPreview} alt="" className="w-14 h-14 rounded-full object-cover mt-2 border-2 border-[#00E5FF]/30" />
                  )}
                </div>
                <div>
                  <label className="auth-label">Photo de couverture</label>
                  <div
                    className="file-input-custom auth-input flex items-center justify-between cursor-pointer"
                    onClick={() => coverRef.current?.click()}
                  >
                    <span className="text-white/40 text-sm truncate">
                      {coverPhotoFile?.name || 'Choisir...'}
                    </span>
                    <span className="text-[#00E5FF] text-xs">🖼️</span>
                    <input
                      ref={coverRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0] || null;
                        setCoverPhotoFile(f);
                        if (f) setCoverPhotoPreview(URL.createObjectURL(f));
                      }}
                    />
                  </div>
                  {coverPhotoPreview && (
                    <img src={coverPhotoPreview} alt="" className="w-full h-14 rounded-lg object-cover mt-2 border border-[#00E5FF]/30" />
                  )}
                </div>
              </div>

               {/* Mot de passe */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="auth-label">Mot de passe</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={form.password}
                    onChange={(e) => update('password', e.target.value)}
                    className="auth-input"
                  />
                  {form.password && (
                    <div className="mt-1 space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className={form.password.length >= 8 ? 'text-green-400' : 'text-gray-500'}>• 8+ caractères</span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className={/[A-Z]/.test(form.password) ? 'text-green-400' : 'text-gray-500'}>• Majuscule</span>
                        <span className={/[a-z]/.test(form.password) ? 'text-green-400' : 'text-gray-500'}>• Minuscule</span>
                        <span className={/[0-9]/.test(form.password) ? 'text-green-400' : 'text-gray-500'}>• Chiffre</span>
                        <span className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(form.password) ? 'text-green-400' : 'text-gray-500'}>• Spécial</span>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="auth-label">Confirmation</label>
                  <input type="password" required value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} className="auth-input" />
                </div>
              </div>

              <div className="mt-4 text-center">
                <label className="flex items-center gap-2 text-xs text-white/60 cursor-pointer">
                  <input type="checkbox" required className="w-3 h-3 rounded border border-white/30" />
                  <span>
                    J&apos;accepte les{' '}
                    <a href="/cgu" className="text-[#00E5FF] hover:underline" target="_blank">CGU</a>
                    {' '}et la{' '}
                    <a href="/politique-confidentialite" className="text-[#00E5FF] hover:underline" target="_blank">politique de confidentialité</a>
                  </span>
                </label>
              </div>

              {error && <div className="auth-error">{error}</div>}

              <button type="submit" disabled={loading} className="auth-btn">
                {loading ? 'Création...' : 'Créer mon compte'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-white/40 text-sm">
                Déjà un compte ?{' '}
                <a href="/connexion" className="auth-link">Se connecter</a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section droite — Branding */}
      <div className="hidden lg:flex relative z-10 w-1/2 min-h-screen items-center justify-center bg-gradient-to-br from-white/[0.02] to-transparent">
        <div className="text-center space-y-8 max-w-md px-12">
          <div className="flex justify-center animate-float">
            <div className="relative">
              <div className="w-52 h-52 rounded-full border-2 border-[#00E5FF]/20 flex items-center justify-center"
                style={{ animation: 'pulseGlow 3s ease-in-out infinite' }}
              >
                <div className="w-40 h-40 rounded-full border-2 border-[#B388FF]/20 flex items-center justify-center">
                  <div className="w-28 h-28 rounded-full flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, rgba(0,229,255,0.12), rgba(179,136,255,0.12))' }}
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
          <div className="space-y-3 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <h2 className="text-3xl font-bold text-white">
              ProFolio<span className="text-[#00E5FF]">+</span>
            </h2>
            <p className="text-[#87CEEB] text-sm font-medium tracking-[0.2em] uppercase">
              Design. Create. Impact.
            </p>
            <p className="text-white/40 text-sm leading-relaxed">
              Créez votre portfolio professionnel en quelques minutes.
              Gérez votre profil, vos formations, compétences et projets.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
