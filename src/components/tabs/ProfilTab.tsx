// src/components/tabs/ProfilTab.tsx — Profil moderne structuré par catégories
'use client';

import { useState, useEffect, useRef } from 'react';
import { apiGet, apiPut } from '@/lib/api/client';
import { SocialIconWithBackground } from '@/components/SocialIcons';
import type { UserData } from '@/types';

type ProfileData = {
  bio: string;
  expertise: string;
  maritalStatus: string;
  hobbies: string[];
  city: string;
  country: string;
  neighborhood: string;
  interests: { sports: string[]; foods: string[]; preferences: string[] };
  username: string;
  email: string;
  phone: string;
  birthDate: string;
  birthPlace: string;
  profilePhoto: string | null;
  coverPhoto: string | null;
  githubUrl: string;
  facebookUrl: string;
  youtubeUrl: string;
  linkedinUrl: string;
  whatsappUrl: string;
  instagramUrl: string;
};

type Formation = {
  id: string;
  title: string;
  institution: string;
  year: number;
  description: string | null;
  photo: string | null;
};

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

const EMPTY_PROFILE: ProfileData = {
  bio: '',
  expertise: '',
  maritalStatus: '',
  hobbies: [],
  city: '',
  country: '',
  neighborhood: '',
  interests: { sports: [], foods: [], preferences: [] },
  username: '',
  email: '',
  phone: '',
  birthDate: '',
  birthPlace: '',
  profilePhoto: null,
  coverPhoto: null,
  githubUrl: '',
  facebookUrl: '',
  youtubeUrl: '',
  linkedinUrl: '',
  whatsappUrl: '',
  instagramUrl: '',
};

function toDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ProfilTab({ isOwner = true, initialData }: { isOwner?: boolean; initialData?: UserData }) {
  const [data, setData] = useState<ProfileData>(EMPTY_PROFILE);
  const [formations, setFormations] = useState<Formation[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<ProfileData>(EMPTY_PROFILE);
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [coverPhotoFile, setCoverPhotoFile] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const [coverPhotoPreview, setCoverPhotoPreview] = useState<string | null>(null);
  const profileRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  // Synchroniser avec les données initiales du tableau de bord
  useEffect(() => {
    if (initialData) {
      const p = initialData.profile || {} as ProfileData;
      const merged: ProfileData = {
        username: initialData.username,
        email: initialData.email,
        phone: initialData.phone || '',
        birthDate: initialData.birthDate ? new Date(initialData.birthDate).toISOString().split('T')[0] : '',
        birthPlace: initialData.birthPlace || '',
        bio: p.bio || '',
        expertise: p.expertise || '',
        maritalStatus: p.maritalStatus || '',
        hobbies: p.hobbies || [],
        city: p.city || '',
        country: p.country || '',
        neighborhood: p.neighborhood || '',
        interests: (p.interests as ProfileData['interests']) || { sports: [], foods: [], preferences: [] },
        profilePhoto: p.profilePhoto || null,
        coverPhoto: p.coverPhoto || null,
        githubUrl: p.githubUrl || '',
        facebookUrl: p.facebookUrl || '',
        youtubeUrl: p.youtubeUrl || '',
        linkedinUrl: p.linkedinUrl || '',
        whatsappUrl: p.whatsappUrl || '',
        instagramUrl: p.instagramUrl || '',
      };
      setData(merged);
      setEditForm(merged);
      setProfilePhotoPreview(merged.profilePhoto);
      setCoverPhotoPreview(merged.coverPhoto);
      setFormations(initialData.formations || []);
      setExperiences(initialData.experiences || []);
      setLoading(false);
    }
  }, [initialData]);

  // Charger les données depuis API si initialData n'est pas disponible
  useEffect(() => {
    if (!initialData) {
      async function load() {
        try {
          const res = await apiGet<{
            username: string;
            email: string;
            phone: string;
            birthDate: string;
            birthPlace: string;
            firstName: string;
            lastName: string;
            profile: ProfileData | null;
          }>('/api/profile');
          const p = res.profile || {} as ProfileData;
          const merged: ProfileData = {
            username: res.username,
            email: res.email,
            phone: res.phone,
            birthDate: res.birthDate ? new Date(res.birthDate).toISOString().split('T')[0] : '',
            birthPlace: res.birthPlace || '',
            bio: p.bio || '',
            expertise: p.expertise || '',
            maritalStatus: p.maritalStatus || '',
            hobbies: p.hobbies || [],
            city: p.city || '',
            country: p.country || '',
            neighborhood: p.neighborhood || '',
            interests: (p.interests as ProfileData['interests']) || { sports: [], foods: [], preferences: [] },
            profilePhoto: p.profilePhoto || null,
            coverPhoto: p.coverPhoto || null,
            githubUrl: p.githubUrl || '',
            facebookUrl: p.facebookUrl || '',
            youtubeUrl: p.youtubeUrl || '',
            linkedinUrl: p.linkedinUrl || '',
            whatsappUrl: p.whatsappUrl || '',
            instagramUrl: p.instagramUrl || '',
          };
          setData(merged);
          setEditForm(merged);
          setProfilePhotoPreview(merged.profilePhoto);
          setCoverPhotoPreview(merged.coverPhoto);
        } catch {
          setMessage({ type: 'error', text: 'Impossible de charger le profil' });
        } finally {
          setLoading(false);
        }
      }
      load();
    } else {
      setLoading(false);
    }
  }, [initialData]);

  useEffect(() => {
    if (!initialData) {
      async function loadExtras() {
        try {
          const [fRes, eRes] = await Promise.all([
            apiGet<Formation[]>('/api/formations'),
            apiGet<Experience[]>('/api/experiences'),
          ]);
          setFormations(fRes);
          setExperiences(eRes);
        } catch {
          // Silently fail — formations/experiences are optional
        }
      }
      loadExtras();
    }
  }, [initialData]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      let profilePhoto = editForm.profilePhoto;
      let coverPhoto = editForm.coverPhoto;
      if (profilePhotoFile) profilePhoto = await toDataUrl(profilePhotoFile);
      if (coverPhotoFile) coverPhoto = await toDataUrl(coverPhotoFile);

      const hobbies = editForm.hobbies;
      await apiPut('/api/profile', { ...editForm, hobbies, profilePhoto, coverPhoto });
      setMessage({ type: 'success', text: 'Profil mis à jour' });
      setData({ ...editForm, profilePhoto, coverPhoto });
      setProfilePhotoFile(null);
      setCoverPhotoFile(null);
      if (profilePhoto) setProfilePhotoPreview(profilePhoto);
      if (coverPhoto) setCoverPhotoPreview(coverPhoto);
      setEditing(false);
    } catch (err) {
      setMessage({ type: 'error', text: (err as { error?: string })?.error || 'Erreur' });
    } finally {
      setSaving(false);
    }
  }

  function update(field: keyof ProfileData, value: any) {
    setEditForm((f) => ({ ...f, [field]: value }));
  }

  const initials = data.username ? data.username.slice(0, 2).toUpperCase() : '?';

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="w-10 h-10 rounded-full border-2 border-[#00E5FF] border-t-transparent animate-spin" />
    </div>
  );

  // ============ MODE VISUALISATION ============
  if (!editing) {
    return (
      <div className="w-full space-y-8">
        {/* Cover + Avatar */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#0a1628] via-[#0f2038] to-[#162d50]">
          <div className="h-48 sm:h-56 lg:h-64">
            {data.coverPhoto ? (
              <img src={data.coverPhoto} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, rgba(0,229,255,0.1), rgba(179,136,255,0.1))' }}>
                <svg className="w-16 h-16 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628]/80 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-6 sm:left-10 flex items-end gap-4">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-white shadow-2xl bg-white shrink-0">
              {data.profilePhoto ? (
                <img src={data.profilePhoto} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#00E5FF]/20 to-[#B388FF]/20 flex items-center justify-center">
                  <span className="text-3xl font-bold text-gradient">{initials}</span>
                </div>
              )}
            </div>
            <div className="pb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">{data.username}</h1>
              {data.expertise && (
                <p className="text-[#00E5FF] text-sm font-semibold mt-1">{data.expertise}</p>
              )}
            </div>
          </div>
          {isOwner && (
            <button
              onClick={() => {
                setEditForm({ ...data });
                setProfilePhotoPreview(data.profilePhoto);
                setCoverPhotoPreview(data.coverPhoto);
                setProfilePhotoFile(null);
                setCoverPhotoFile(null);
                setEditing(true);
              }}
              className="absolute top-4 right-4 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all"
              style={{ background: 'linear-gradient(135deg, #00E5FF, #0077FF)', boxShadow: '0 4px 15px rgba(0,229,255,0.3)' }}
            >
              ✎ Modifier le profil
            </button>
          )}
        </div>

        {/* ====== CATÉGORIES ====== */}
        <div className="space-y-8 px-4 sm:px-0">

          {/* --- INFORMATIONS PERSONNELLES --- */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00E5FF]/20 to-[#B388FF]/20 flex items-center justify-center">
                <span className="text-base">👤</span>
              </div>
              <h2 className="text-lg font-bold text-gray-900">Informations personnelles</h2>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {data.birthDate && (
                  <div className="flex items-start gap-3">
                    <span className="text-lg shrink-0 mt-0.5">🎂</span>
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Date de naissance</p>
                      <p className="text-sm font-medium text-gray-800 mt-0.5">{new Date(data.birthDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                  </div>
                )}
                {data.birthPlace && (
                  <div className="flex items-start gap-3">
                    <span className="text-lg shrink-0 mt-0.5">📍</span>
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Lieu de naissance</p>
                      <p className="text-sm font-medium text-gray-800 mt-0.5">{data.birthPlace}</p>
                    </div>
                  </div>
                )}
                {(data.city || data.country) && (
                  <div className="flex items-start gap-3">
                    <span className="text-lg shrink-0 mt-0.5">🏠</span>
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Résidence</p>
                      <p className="text-sm font-medium text-gray-800 mt-0.5">{data.city}{data.country ? `, ${data.country}` : ''}</p>
                    </div>
                  </div>
                )}
                {data.neighborhood && (
                  <div className="flex items-start gap-3">
                    <span className="text-lg shrink-0 mt-0.5">🏘️</span>
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Quartier</p>
                      <p className="text-sm font-medium text-gray-800 mt-0.5">{data.neighborhood}</p>
                    </div>
                  </div>
                )}
                {data.maritalStatus && (
                  <div className="flex items-start gap-3">
                    <span className="text-lg shrink-0 mt-0.5">💍</span>
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Situation</p>
                      <p className="text-sm font-medium text-gray-800 mt-0.5">{data.maritalStatus}</p>
                    </div>
                  </div>
                )}
                {data.phone && (
                  <div className="flex items-start gap-3">
                    <span className="text-lg shrink-0 mt-0.5">📞</span>
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Téléphone</p>
                      <p className="text-sm font-medium text-gray-800 mt-0.5">{data.phone}</p>
                    </div>
                  </div>
                )}
                {data.email && (
                  <div className="flex items-start gap-3">
                    <span className="text-lg shrink-0 mt-0.5">📧</span>
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Email</p>
                      <p className="text-sm font-medium text-gray-800 mt-0.5">{data.email}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* --- BIOGRAPHIE --- */}
          {data.bio && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00E5FF]/20 to-[#B388FF]/20 flex items-center justify-center">
                  <span className="text-base">📝</span>
                </div>
                <h2 className="text-lg font-bold text-gray-900">Biographie</h2>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <p className="text-gray-700 leading-relaxed text-base">{data.bio}</p>
              </div>
            </section>
          )}

          {/* --- RÉSEAUX SOCIAUX --- */}
          {(data.githubUrl || data.facebookUrl || data.youtubeUrl || data.linkedinUrl || data.whatsappUrl || data.instagramUrl) && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00E5FF]/20 to-[#B388FF]/20 flex items-center justify-center">
                  <span className="text-base">🌐</span>
                </div>
                <h2 className="text-lg font-bold text-gray-900">Réseaux sociaux</h2>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  {data.githubUrl && (
                    <a href={data.githubUrl} target="_blank" rel="noopener noreferrer" className="hover:scale-105 transition-transform">
                      <SocialIconWithBackground platform="github" size={12} showLabel={true} />
                    </a>
                  )}
                  {data.facebookUrl && (
                    <a href={data.facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:scale-105 transition-transform">
                      <SocialIconWithBackground platform="facebook" size={12} showLabel={true} />
                    </a>
                  )}
                  {data.youtubeUrl && (
                    <a href={data.youtubeUrl} target="_blank" rel="noopener noreferrer" className="hover:scale-105 transition-transform">
                      <SocialIconWithBackground platform="youtube" size={12} showLabel={true} />
                    </a>
                  )}
                  {data.linkedinUrl && (
                    <a href={data.linkedinUrl} target="_blank" rel="noopener noreferrer" className="hover:scale-105 transition-transform">
                      <SocialIconWithBackground platform="linkedin" size={12} showLabel={true} />
                    </a>
                  )}
                  {data.whatsappUrl && (
                    <a href={data.whatsappUrl} target="_blank" rel="noopener noreferrer" className="hover:scale-105 transition-transform">
                      <SocialIconWithBackground platform="whatsapp" size={12} showLabel={true} />
                    </a>
                  )}
                  {data.instagramUrl && (
                    <a href={data.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:scale-105 transition-transform">
                      <SocialIconWithBackground platform="instagram" size={12} showLabel={true} />
                    </a>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* --- PARCOURS PROFESSIONNELS (logos dynamiques) --- */}
          {(formations.length > 0 || experiences.length > 0) && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00E5FF]/20 to-[#B388FF]/20 flex items-center justify-center">
                  <span className="text-base">💼</span>
                </div>
                <h2 className="text-lg font-bold text-gray-900">Parcours professionnels</h2>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                {/* Formations */}
                {formations.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">🎓 Formations & Diplômes</h3>
                    <div className="flex items-center gap-4 overflow-x-auto pb-4 no-scrollbar" style={{ scrollSnapType: 'x mandatory' }}>
                      {formations.map((f) => (
                        <div key={f.id} className="shrink-0 w-48" style={{ scrollSnapAlign: 'start' }}>
                          <div className="w-full h-32 rounded-full bg-white border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden mb-2">
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

                {/* Expériences */}
                {experiences.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">🏢 Expériences professionnelles</h3>
                    <div className="flex items-center gap-4 overflow-x-auto pb-4 no-scrollbar" style={{ scrollSnapType: 'x mandatory' }}>
                      {experiences.map((exp) => (
                        <div key={exp.id} className="shrink-0 w-48" style={{ scrollSnapAlign: 'start' }}>
                          <div className="w-full h-32 rounded-full bg-white border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden mb-2">
                                {exp.logo ? (
                                  <img src={exp.logo} alt={exp.company} className="w-full h-full object-cover max-h-32" />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-green-100/50 to-emerald-100/50 flex items-center justify-center text-3xl">💼</div>
                                )}
                              </div>
                              <p className="text-xs font-semibold text-gray-800 truncate">{exp.company}</p>
                              <p className="text-[10px] text-gray-500">{exp.title}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* --- DIVERTISSEMENT & LOISIRS --- */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00E5FF]/20 to-[#B388FF]/20 flex items-center justify-center">
                <span className="text-base">🎯</span>
              </div>
              <h2 className="text-lg font-bold text-gray-900">Divertissement & Loisirs</h2>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
              {(data.interests?.sports?.length > 0 || data.hobbies?.length > 0) && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">🏃 Sports & Activités</h3>
                  <div className="flex flex-wrap gap-2">
                    {(data.interests?.sports || []).map((s, i) => (
                      <span key={`sport-${i}`} className="px-4 py-2 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 text-gray-700 border border-green-200 text-sm font-medium">{s}</span>
                    ))}
                    {(data.hobbies || []).map((h, i) => (
                      <span key={`hobby-${i}`} className="px-4 py-2 rounded-full bg-gradient-to-r from-[#00E5FF]/10 to-[#B388FF]/10 text-gray-700 border border-gray-100 text-sm font-medium">{h}</span>
                    ))}
                  </div>
                </div>
              )}
              {data.interests?.foods?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">🍽️ Nourritures préférées</h3>
                  <div className="flex flex-wrap gap-2">
                    {data.interests.foods.map((f, i) => (
                      <span key={`food-${i}`} className="px-4 py-2 rounded-full bg-gradient-to-r from-orange-100 to-amber-100 text-gray-700 border border-orange-200 text-sm font-medium">{f}</span>
                    ))}
                  </div>
                </div>
              )}
              {data.interests?.preferences?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">⭐ Préférences diverses</h3>
                  <div className="flex flex-wrap gap-2">
                    {data.interests.preferences.map((p, i) => (
                      <span key={`pref-${i}`} className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-gray-700 border border-purple-200 text-sm font-medium">{p}</span>
                    ))}
                  </div>
                </div>
              )}
              {(!data.interests?.sports?.length && !data.interests?.foods?.length && !data.interests?.preferences?.length && !(data.hobbies?.length)) && (
                <p className="text-gray-400 text-sm text-center py-4">Aucune information de loisirs pour le moment.</p>
              )}
            </div>
          </section>

          {/* URL publique */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <p className="text-xs text-gray-400">URL publique</p>
            <p className="text-sm font-mono text-gray-700 mt-1">profolio.onrender.com/u/{data.username}</p>
          </div>
        </div>

        {message && (
          <div className="px-4 sm:px-0 mt-4">
            <p className={`text-sm px-4 py-3 rounded-xl ${message.type === 'success' ? 'text-green-700 bg-green-50 border border-green-200' : 'text-red-600 bg-red-50 border border-red-200'}`}>
              {message.text}
            </p>
          </div>
        )}
      </div>
    );
  }

  // ============ MODE ÉDITION ============
  const inputClass = 'w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/30 focus:border-[#00E5FF]/50 transition-all text-sm bg-white';
  const labelClass = 'block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5';
  const hobbiesText = editForm.hobbies.join(', ');

  return (
    <form onSubmit={handleSave} className="w-full space-y-8">
      {/* Cover */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#0a1628] via-[#0f2038] to-[#162d50]">
        <div className="h-48 sm:h-56 lg:h-64">
          {(coverPhotoPreview || editForm.coverPhoto) ? (
            <img src={coverPhotoPreview || editForm.coverPhoto || ''} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(0,229,255,0.1), rgba(179,136,255,0.1))' }}>
              <svg className="w-16 h-16 text-white/10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
        <button type="button" onClick={() => coverRef.current?.click()}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#00E5FF] text-white flex items-center justify-center shadow-md hover:bg-[#00BFFF] transition text-sm">✎</button>
        <input ref={coverRef} type="file" accept="image/*" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0] || null; setCoverPhotoFile(f); if (f) setCoverPhotoPreview(URL.createObjectURL(f)); }} />
      </div>

      {/* Avatar */}
      <div className="relative px-6 -mt-12">
        <div className="flex justify-end mb-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl bg-white">
              {(profilePhotoPreview || editForm.profilePhoto) ? (
                <img src={profilePhotoPreview || editForm.profilePhoto || ''} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#00E5FF]/20 to-[#B388FF]/20 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gradient">{initials}</span>
                </div>
              )}
            </div>
            <button type="button" onClick={() => profileRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#00E5FF] text-white flex items-center justify-center shadow-md hover:bg-[#00BFFF] transition text-sm">✎</button>
            <input ref={profileRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0] || null; setProfilePhotoFile(f); if (f) setProfilePhotoPreview(URL.createObjectURL(f)); }} />
          </div>
        </div>
      </div>

      <div className="px-6 pb-6 space-y-8">
        {/* --- INFORMATIONS PERSONNELLES --- */}
        <div>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span>👤</span> Informations personnelles
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Nom d'utilisateur</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">@</span>
                <input value={editForm.username} onChange={(e) => update('username', e.target.value)} className={`${inputClass} pl-6`} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Expertise</label>
              <input value={editForm.expertise} onChange={(e) => update('expertise', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Date de naissance</label>
              <input type="date" value={editForm.birthDate} onChange={(e) => update('birthDate', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Lieu de naissance</label>
              <input value={editForm.birthPlace} onChange={(e) => update('birthPlace', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Ville</label>
              <input value={editForm.city} onChange={(e) => update('city', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Pays</label>
              <input value={editForm.country} onChange={(e) => update('country', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Quartier / Résidence</label>
              <input value={editForm.neighborhood} onChange={(e) => update('neighborhood', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Situation matrimoniale</label>
              <input value={editForm.maritalStatus} onChange={(e) => update('maritalStatus', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Téléphone</label>
              <input value={editForm.phone} onChange={(e) => update('phone', e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input value={editForm.email} onChange={(e) => update('email', e.target.value)} className={inputClass} />
            </div>
          </div>
        </div>

        {/* --- BIOGRAPHIE --- */}
        <div>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span>📝</span> Biographie
          </h3>
          <textarea value={editForm.bio} onChange={(e) => update('bio', e.target.value)} rows={4}
            className={`${inputClass} resize-none`} placeholder="Écrivez votre histoire breve..." />
        </div>

        {/* --- RÉSEAUX SOCIAUX --- */}
        <div>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span>🌐</span> Réseaux sociaux
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>GitHub (URL)</label>
              <input value={editForm.githubUrl} onChange={(e) => update('githubUrl', e.target.value)} className={inputClass} placeholder="https://github.com/votre-utilisateur" />
            </div>
            <div>
              <label className={labelClass}>Facebook (URL)</label>
              <input value={editForm.facebookUrl} onChange={(e) => update('facebookUrl', e.target.value)} className={inputClass} placeholder="https://facebook.com/votre-page" />
            </div>
            <div>
              <label className={labelClass}>YouTube (URL)</label>
              <input value={editForm.youtubeUrl} onChange={(e) => update('youtubeUrl', e.target.value)} className={inputClass} placeholder="https://youtube.com/votre-chaine" />
            </div>
            <div>
              <label className={labelClass}>LinkedIn (URL)</label>
              <input value={editForm.linkedinUrl} onChange={(e) => update('linkedinUrl', e.target.value)} className={inputClass} placeholder="https://linkedin.com/in/votre-profil" />
            </div>
            <div>
              <label className={labelClass}>WhatsApp (URL)</label>
              <input value={editForm.whatsappUrl} onChange={(e) => update('whatsappUrl', e.target.value)} className={inputClass} placeholder="https://wa.me/225XXXXXXXXX" />
            </div>
            <div>
              <label className={labelClass}>Instagram (URL)</label>
              <input value={editForm.instagramUrl} onChange={(e) => update('instagramUrl', e.target.value)} className={inputClass} placeholder="https://instagram.com/votre-utilisateur" />
            </div>
          </div>
        </div>

        {/* --- DIVERTISSEMENT & LOISIRS --- */}
        <div>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <span>🎯</span> Divertissement & Loisirs
          </h3>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Sports & Activités (séparés par des virgules)</label>
              <input value={editForm.interests.sports.join(', ')}
                onChange={(e) => update('interests', { ...editForm.interests, sports: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) })}
                className={inputClass} placeholder="Football, Natation, Yoga..." />
            </div>
            <div>
              <label className={labelClass}>Nourritures préférées (séparées par des virgules)</label>
              <input value={editForm.interests.foods.join(', ')}
                onChange={(e) => update('interests', { ...editForm.interests, foods: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) })}
                className={inputClass} placeholder="Cuisine française, Sushi, Pâtisserie..." />
            </div>
            <div>
              <label className={labelClass}>Préférences diverses (séparées par des virgules)</label>
              <input value={editForm.interests.preferences.join(', ')}
                onChange={(e) => update('interests', { ...editForm.interests, preferences: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) })}
                className={inputClass} placeholder="Voyage, Photographie, Lecture..." />
            </div>
            <div>
              <label className={labelClass}>Autres loisirs (séparés par des virgules)</label>
              <input value={hobbiesText} onChange={(e) => update('hobbies', e.target.value.split(',').map((h: string) => h.trim()).filter(Boolean))}
                className={inputClass} placeholder="Jeux vidéo, Randonnée, Musique..." />
            </div>
          </div>
        </div>

        {message && (
          <p className={`text-sm px-4 py-3 rounded-xl ${message.type === 'success' ? 'text-green-700 bg-green-50 border border-green-200' : 'text-red-600 bg-red-50 border border-red-200'}`}>
            {message.text}
          </p>
        )}

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #00E5FF, #0077FF)' }}>
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
          <button type="button" onClick={() => { setEditing(false); setEditForm(data); setProfilePhotoPreview(data.profilePhoto); setCoverPhotoPreview(data.coverPhoto); setProfilePhotoFile(null); setCoverPhotoFile(null); }}
            className="px-6 py-2.5 rounded-xl text-gray-500 text-sm font-medium border border-gray-200 hover:bg-gray-50 transition">
            Annuler
          </button>
        </div>
      </div>
    </form>
  );
}