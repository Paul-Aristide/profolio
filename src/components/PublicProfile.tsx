// src/components/PublicProfile.tsx — Page visiteur : LECTURE SEULEMENT + commentaires/contact
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { apiGet, apiPost } from '@/lib/api/client';
import { useAuth } from '@/lib/auth/AuthContext';
import PublicHeader from './PublicHeader';
import PageViewTracker from './PageViewTracker';
import PostCard from '@/components/tabs/PostCard';
import { SocialIconWithBackground } from '@/components/SocialIcons';

type PublicUserData = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  birthDate?: string;
  birthPlace?: string;
  phone?: string;
  totalViews?: number;
  profile: {
    bio: string | null;
    expertise: string | null;
    city: string | null;
    country: string | null;
    neighborhood: string | null;
    profilePhoto: string | null;
    coverPhoto: string | null;
    maritalStatus: string | null;
    hobbies: string[];
    interests: { sports: string[]; foods: string[]; preferences: string[] } | null;
    githubUrl: string | null;
    facebookUrl: string | null;
    youtubeUrl: string | null;
    linkedinUrl: string | null;
    whatsappUrl: string | null;
    instagramUrl: string | null;
  } | null;
  formations: Array<{
    id: string;
    title: string;
    institution: string;
    year: number;
    description: string | null;
    photo: string | null;
  }>;
  experiences: Array<{
    id: string;
    title: string;
    company: string;
    startDate: string;
    endDate: string | null;
    current: boolean;
    description: string | null;
    logo: string | null;
  }>;
  skills: Array<{
    id: string;
    category: string;
    title: string;
    description: string | null;
  }>;
   posts: Array<{
     id: string;
     title: string | null;
     description: string | null;
     content: string | null;
     mediaUrl: string | null;
     mediaType: string | null;
     backgroundColor: string | null;
     linkUrl: string | null;
     createdAt: string;
   }>;
   agendaEvents: Array<{
     id: string;
     title: string;
     startTime: string;
     endTime: string;
     timezone: string;
     status: string;
     description: string | null;
   }>;
   totalFollowers?: number;
};

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  isAnonymous?: boolean;
  user?: { firstName: string; lastName: string; email: string };
};

export default function PublicProfile({ username }: { username: string }) {
  const [data, setData] = useState<PublicUserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('profil');
  const [tabTransitionKey, setTabTransitionKey] = useState('profil');
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactLoading, setContactLoading] = useState(false);
  const [contactMessage, setContactMessage] = useState<string | null>(null);
  const router = useRouter();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const { user: authUser } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  // Changer d'onglet avec animation de transition
  const handleTabChange = (tabId: string) => {
    setTabTransitionKey(tabId);
    setTimeout(() => setActiveTab(tabId), 50);
  };

  // Animation de révélation au scroll (Intersection Observer)
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('data-animate-id');
          if (id) setVisibleSections((prev) => new Set(prev).add(id));
        }
      });
    }, { threshold: 0.1, rootMargin: '50px' });

    const elements = document.querySelectorAll('[data-animate-id]');
    elements.forEach((el) => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, [activeTab]);

  // Quand data est chargé, forcer l'affichage de TOUS les éléments animés
  useEffect(() => {
    if (data && !loading) {
      // Attendre que React ait rendu le DOM avec les données
      const timer = setTimeout(() => {
        const elements = document.querySelectorAll('[data-animate-id]');
        const allIds = new Set<string>();
        elements.forEach((el) => {
          const id = el.getAttribute('data-animate-id');
          if (id) allIds.add(id);
        });
        if (allIds.size > 0) {
          setVisibleSections(allIds);
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [data, loading]);

   // Charger les données du profil et polling global
  useEffect(() => {
    async function loadInitialData() {
      try {
        const res = await apiGet<PublicUserData>(`/api/u/${username}`);
        
        // Assurer l'unicité des posts
        const uniquePosts = res.posts ? res.posts.filter((post, index, self) => 
          index === self.findIndex(p => p.id === post.id)
        ) : [];
        
        // Assurer l'unicité des événements agenda
        const uniqueAgendaEvents = res.agendaEvents ? res.agendaEvents.filter((event, index, self) => 
          index === self.findIndex(e => e.id === event.id)
        ) : [];
        
         setData({ ...res, posts: uniquePosts, agendaEvents: uniqueAgendaEvents });
         setError(null);
         setFollowersCount(res.totalFollowers || 0);
        } catch (err) {
        setError((err as { error?: string })?.error || 'Portfolio introuvable');
        setData(null);
      } finally {
        setLoading(false);
      }
    }
    
    async function pollData() {
      try {
        const res = await apiGet<PublicUserData>(`/api/u/${username}`);
        
        // Assurer l'unicité des posts
        const uniquePosts = res.posts ? res.posts.filter((post, index, self) => 
          index === self.findIndex(p => p.id === post.id)
        ) : [];
        
        // Assurer l'unicité des événements agenda
        const uniqueAgendaEvents = res.agendaEvents ? res.agendaEvents.filter((event, index, self) => 
          index === self.findIndex(e => e.id === event.id)
        ) : [];
        
        // Mise à jour complète des données pour éviter les incohérences
        setData((prev) => {
          if (!prev) return { ...res, posts: uniquePosts, agendaEvents: uniqueAgendaEvents };
          return {
            ...res,
            posts: uniquePosts,
            agendaEvents: uniqueAgendaEvents,
            // Conserver les autres données si elles existent
            formations: res.formations || prev.formations,
            skills: res.skills || prev.skills,
            experiences: res.experiences || prev.experiences,
          };
        });
      } catch (err) {
        const errorObj = err as { error?: string; status?: number };
        if (errorObj.status === 404) return;
        if (process.env.NODE_ENV === 'development') {
          console.warn('Polling réseau:', errorObj.error || 'Erreur');
        }
      }
    }
    
    loadInitialData();
    
     // Polling toutes les 10 secondes pour synchronisation temps réel, optimisé pour éviter les rechargements inutiles
    const pollingInterval = setInterval(pollData, authUser ? 10000 : 30000);
    
    return () => clearInterval(pollingInterval);
  }, [username]);
  useEffect(() => {
    if (authUser && data && authUser.id !== data.id) {
      apiGet<{ following: boolean }>(`/api/follow?targetUserId=${data.id}`)
        .then(res => setIsFollowing(res.following))
        .catch(() => setIsFollowing(false));
    }
  }, [authUser, data]);

  // Charger les commentaires pour chaque post
  useEffect(() => {
    if (data) {
      data.posts.forEach(async (post) => {
        try {
          const res = await apiGet<Comment[]>(`/api/posts/${post.id}/comments`);
          setComments((prev) => ({ ...prev, [post.id]: res }));
        } catch (err) {
          console.error('Erreur chargement commentaires:', err);
        }
      });
    }
  }, [data]);

  // Envoyer un message de contact
  async function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!data) return;
    setContactLoading(true);
    setContactMessage(null);
    try {
      await apiPost('/api/contact/send', {
        toUsername: data.username,
        senderEmail: contactForm.email,
        senderName: contactForm.name,
        content: contactForm.message,
      });
      setContactMessage('Message envoyé avec succès !');
      setContactForm({ name: '', email: '', message: '' });
    } catch {
      setContactMessage('Erreur lors de l\'envoi du message. Veuillez réessayer.');
    } finally {
      setContactLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="w-12 h-12 rounded-full border-4 border-[#00E5FF] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Portfolio introuvable</h2>
          <p className="text-gray-500 mt-2">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-6 px-6 py-3 rounded-xl text-white font-semibold transition-all"
            style={{ background: 'linear-gradient(135deg, #00E5FF, #0077FF)' }}
          >
            Retour &agrave; l&apos;accueil
          </button>
        </div>
      </div>
    );
  }

  // Données formatées
  const fullName = `${data.firstName} ${data.lastName}`;
  const profilePhoto = data.profile?.profilePhoto;
  const coverPhoto = data.profile?.coverPhoto;
  const initials = `${data.firstName?.[0] || ''}${data.lastName?.[0] || ''}`.toUpperCase();

  // Onglets disponibles
  const tabs = [
    { id: 'profil', label: 'Profil', icon: '👤' },
    { id: 'formation', label: 'Formation', icon: '🎓' },
    { id: 'competences', label: 'Compétences', icon: '⭐' },
    { id: 'actualites', label: 'Actualités', icon: '📢' },
    { id: 'agenda', label: 'Agenda', icon: '📅' },
    { id: 'contact', label: 'Contact', icon: '💬' },
  ];

  // Helper pour les classes d'animation de scroll
  const getAnimateClass = (id: string, delay: string = '') => {
    return `transition-all duration-700 ${delay} animate-fade-in-up opacity-100`;
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Tracker de visites - seulement quand data est chargé */}
      {data && <PageViewTracker targetUserId={data.id} />}

      {/* Header visiteur (lecture seule) */}
      <PublicHeader
        expertise={data.profile?.expertise || 'Professionnel'}
        firstName={data.firstName}
        lastName={data.lastName}
        photo={profilePhoto}
      />

      {/* HERO SECTION - Plein écran */}
      <section className="relative w-full">
        {/* Photo de couverture */}
        <div className="h-80 sm:h-96 lg:h-[420px] w-full">
          {coverPhoto ? (
            <img
              src={coverPhoto}
              alt={`${fullName} cover`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full"
              style={{
                background: 'linear-gradient(135deg, rgba(0,229,255,0.2), rgba(135,206,235,0.2), rgba(179,136,255,0.2))',
              }}
            />
          )}
        </div>

        {/* Photo de profil superposée + nom sur la même ligne */}
        <div className="relative px-4 sm:px-8 lg:px-24 -mt-12 sm:-mt-16 lg:-mt-20 pb-8">
          <div className="flex items-end gap-4 sm:gap-6">
            {/* Photo de profil qui pend de la couverture */}
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-white shadow-2xl bg-white shrink-0">
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt={fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full bg-gradient-to-br from-[#00E5FF]/20 to-[#B388FF]/20 flex items-center justify-center"
                >
                  <span className="text-4xl sm:text-5xl font-bold text-gradient">
                    {initials}
                  </span>
                </div>
              )}
            </div>

            {/* Nom + expertise sur la même ligne */}
              <div className="flex-1 min-w-0 pb-2">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                {fullName}
              </h1>
               {data.profile?.expertise && (
                 <p className="text-[#00E5FF] text-lg font-semibold mt-2 tracking-wide">
                   {data.profile.expertise}
                 </p>
               )}

               {/* Bouton follow + compteur d'abonnés (visible uniquement si visiteur différent du propriétaire) */}
               {authUser && authUser.id !== data.id && (
                 <div className="mt-3 flex items-center gap-3">
                   <button
                     onClick={async () => {
                       if (followLoading) return;
                       setFollowLoading(true);
                       try {
                         const action = isFollowing ? 'unfollow' : 'follow';
                         await apiPost('/api/follow', { targetUserId: data.id, action });
                         if (isFollowing) {
                           setFollowersCount(c => Math.max(c - 1, 0));
                         } else {
                           setFollowersCount(c => c + 1);
                         }
                         setIsFollowing(!isFollowing);
                       } catch {
                         // silently handle error
                       } finally {
                         setFollowLoading(false);
                       }
                     }}
                     disabled={followLoading}
                     className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
                       isFollowing
                         ? 'bg-gradient-to-r from-[#00E5FF] to-[#0077FF] text-white'
                         : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                     }`}
                   >
                     {followLoading
                       ? '…'
                       : isFollowing
                       ? '✓ Suivi'
                       : '👀 S&apos;abonner'}
                   </button>
                   <span className="text-sm text-gray-500">
                     {followersCount} abonné{followersCount !== 1 ? 's' : ''}
                   </span>
                 </div>
               )}
            </div>
          </div>
        </div>
      </section>

      {/* BARRE DE NAVIGATION - Onglets */}
      <nav className="sticky top-16 z-40 bg-[#F8F9FA]/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-center -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-4 sm:px-8 py-4 text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'text-brand-blue-bright border-b-2 border-brand-blue-bright'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* CONTENU PRINCIPAL - Plein écran avec transition entre onglets */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div
          className={`transition-all duration-300 ${
            activeTab === tabTransitionKey
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
        >
          {/* ======================================== ONGLET PROFIL ======================================== */}
          {activeTab === 'profil' && (
            <section className="space-y-8">
              {/* Informations personnelles */}
              <div data-animate-id="profil-personal" className={getAnimateClass('profil-personal')}>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00E5FF]/20 to-[#B388FF]/20 flex items-center justify-center text-xl">👤</div>
                    <h2 className="text-xl font-bold text-gray-900">Informations personnelles</h2>
                  </div>
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
                    {(data.profile?.city || data.profile?.country) && (
                      <div className="flex items-start gap-3">
                        <span className="text-lg shrink-0 mt-0.5">🏠</span>
                        <div>
                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Résidence</p>
                          <p className="text-sm font-medium text-gray-800 mt-0.5">{data.profile.city}{data.profile.country ? `, ${data.profile.country}` : ''}</p>
                        </div>
                      </div>
                    )}
                    {data.profile?.neighborhood && (
                      <div className="flex items-start gap-3">
                        <span className="text-lg shrink-0 mt-0.5">🏘️</span>
                        <div>
                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Quartier</p>
                          <p className="text-sm font-medium text-gray-800 mt-0.5">{data.profile.neighborhood}</p>
                        </div>
                      </div>
                    )}
                    {data.profile?.maritalStatus && (
                      <div className="flex items-start gap-3">
                        <span className="text-lg shrink-0 mt-0.5">💍</span>
                        <div>
                          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Situation</p>
                          <p className="text-sm font-medium text-gray-800 mt-0.5">{data.profile.maritalStatus}</p>
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
              </div>

              {/* Biographie */}
              {data.profile?.bio && (
                <div data-animate-id="profil-bio" className={getAnimateClass('profil-bio', 'delay-100')}>
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00E5FF]/20 to-[#B388FF]/20 flex items-center justify-center text-xl">📝</div>
                      <h2 className="text-xl font-bold text-gray-900">Biographie</h2>
                    </div>
                    <p className="text-gray-700 leading-relaxed text-base">{data.profile.bio}</p>
                  </div>
                </div>
              )}

              {/* Réseaux sociaux */}
              {(data.profile?.githubUrl || data.profile?.facebookUrl || data.profile?.youtubeUrl || data.profile?.linkedinUrl || data.profile?.whatsappUrl || data.profile?.instagramUrl) && (
                <div data-animate-id="profil-social" className={getAnimateClass('profil-social', 'delay-150')}>
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00E5FF]/20 to-[#B388FF]/20 flex items-center justify-center text-xl">🌐</div>
                      <h2 className="text-xl font-bold text-gray-900">Réseaux sociaux</h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                      {data.profile?.githubUrl && (
                        <a href={data.profile.githubUrl} target="_blank" rel="noopener noreferrer" className="hover:scale-105 transition-transform">
                          <SocialIconWithBackground platform="github" size={12} showLabel={true} />
                        </a>
                      )}
                      {data.profile?.facebookUrl && (
                        <a href={data.profile.facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:scale-105 transition-transform">
                          <SocialIconWithBackground platform="facebook" size={12} showLabel={true} />
                        </a>
                      )}
                      {data.profile?.youtubeUrl && (
                        <a href={data.profile.youtubeUrl} target="_blank" rel="noopener noreferrer" className="hover:scale-105 transition-transform">
                          <SocialIconWithBackground platform="youtube" size={12} showLabel={true} />
                        </a>
                      )}
                      {data.profile?.linkedinUrl && (
                        <a href={data.profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="hover:scale-105 transition-transform">
                          <SocialIconWithBackground platform="linkedin" size={12} showLabel={true} />
                        </a>
                      )}
                      {data.profile?.whatsappUrl && (
                        <a href={data.profile.whatsappUrl} target="_blank" rel="noopener noreferrer" className="hover:scale-105 transition-transform">
                          <SocialIconWithBackground platform="whatsapp" size={12} showLabel={true} />
                        </a>
                      )}
                      {data.profile?.instagramUrl && (
                        <a href={data.profile.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:scale-105 transition-transform">
                          <SocialIconWithBackground platform="instagram" size={12} showLabel={true} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Parcours professionnels — logos avec animations et défilement horizontal */}
              {(data.formations.length > 0 || data.experiences?.length > 0) && (
                <div data-animate-id="profil-career" className={getAnimateClass('profil-career', 'delay-150')}>
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00E5FF]/20 to-[#B388FF]/20 flex items-center justify-center text-xl">💼</div>
                      <h2 className="text-xl font-bold text-gray-900">Parcours professionnels</h2>
                    </div>

                    {/* Logos d'écoles dynamiques avec descriptions */}
                    {data.formations.length > 0 && (
                      <div className="mb-6">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">🎓 Formations & Diplômes</p>
                        <div className="flex items-center gap-4 overflow-x-auto pb-4 no-scrollbar" style={{ scrollSnapType: 'x mandatory' }}>
                          {data.formations.map((f) => (
                            <div key={f.id} className="shrink-0 w-48" style={{ scrollSnapAlign: 'start' }}>
                              <div className="w-full h-32 rounded-full bg-white border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden mb-2">
                                {f.photo ? (
                                  <img src={f.photo} alt={f.institution} className="w-full h-full object-cover" />
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

                    {/* Logos d'entreprises dynamiques avec descriptions */}
                    {data.experiences && data.experiences.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">🏢 Expériences professionnelles</p>
                        <div className="flex items-center gap-4 overflow-x-auto pb-4 no-scrollbar" style={{ scrollSnapType: 'x mandatory' }}>
                          {data.experiences.map((exp) => (
                            <div key={exp.id} className="shrink-0 w-48" style={{ scrollSnapAlign: 'start' }}>
                              <div className="w-full h-32 rounded-full bg-white border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden mb-2">
                                {exp.logo ? (
                                  <img src={exp.logo} alt={exp.company} className="w-full h-full object-cover" />
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
                </div>
              )}

              {/* Divertissement & Loisirs */}
              {(((data.profile?.interests?.sports?.length ?? 0) > 0 || (data.profile?.interests?.foods?.length ?? 0) > 0 || (data.profile?.interests?.preferences?.length ?? 0) > 0 || (data.profile?.hobbies?.length ?? 0) > 0) && (
                <div data-animate-id="profil-leisure" className={getAnimateClass('profil-leisure', 'delay-200')}>
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00E5FF]/20 to-[#B388FF]/20 flex items-center justify-center text-xl">🎯</div>
                      <h2 className="text-xl font-bold text-gray-900">Divertissement & Loisirs</h2>
                    </div>
                    <div className="space-y-5">
                      {(data.profile?.interests?.sports?.length ?? 0) > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">🏃 Sports & Activités</h3>
                          <div className="flex flex-wrap gap-2">
                            {(data.profile?.interests?.sports ?? []).map((s, i) => (
                              <span key={`sport-${i}`} className="px-4 py-2 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 text-gray-700 border border-green-200 text-sm font-medium">{s}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {(data.profile?.interests?.foods?.length ?? 0) > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">🍽️ Nourritures préférées</h3>
                          <div className="flex flex-wrap gap-2">
                            {(data.profile?.interests?.foods ?? []).map((f, i) => (
                              <span key={`food-${i}`} className="px-4 py-2 rounded-full bg-gradient-to-r from-orange-100 to-amber-100 text-gray-700 border border-orange-200 text-sm font-medium">{f}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {(data.profile?.interests?.preferences?.length ?? 0) > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">⭐ Préférences diverses</h3>
                          <div className="flex flex-wrap gap-2">
                            {(data.profile?.interests?.preferences ?? []).map((p, i) => (
                              <span key={`pref-${i}`} className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-gray-700 border border-purple-200 text-sm font-medium">{p}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {(data.profile?.hobbies?.length ?? 0) > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">🎨 Autres loisirs</h3>
                          <div className="flex flex-wrap gap-2">
                            {(data.profile?.hobbies ?? []).map((h, i) => (
                              <span key={`hobby-${i}`} className="px-4 py-2 rounded-full bg-gradient-to-r from-[#00E5FF]/10 to-[#B388FF]/10 text-gray-700 border border-gray-100 text-sm font-medium">{h}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {!data.profile?.bio && !data.profile?.expertise && !data.profile?.city && !data.profile?.country &&
                !data.profile?.interests?.sports?.length && !data.profile?.interests?.foods?.length &&
                !data.profile?.interests?.preferences?.length && !(data.profile?.hobbies?.length) &&
                data.formations.length === 0 && (!data.experiences || data.experiences.length === 0) && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                  <p className="text-gray-500">Aucune information disponible pour le moment.</p>
                </div>
              )}
            </section>
          )}

          {/* ======================================== ONGLET FORMATION ======================================== */}
          {activeTab === 'formation' && (
            <section className="space-y-6">
              <div data-animate-id="formation-header" className={getAnimateClass('formation-header', 'delay-75')}>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <span>🎓</span> Formation & Diplômes
                  </h2>

                      {/* Logos d'écoles dynamiques avec descriptions */}
                      {data.formations.length > 0 && (
                        <div className="mb-6">
                          <div className="flex items-center gap-4 overflow-x-auto pb-4 no-scrollbar" style={{ scrollSnapType: 'x mandatory' }}>
                            {data.formations.map((f) => (
                              <div key={f.id} className="shrink-0 w-48" style={{ scrollSnapAlign: 'start' }}>
                                <div className="w-full h-32 rounded-2xl bg-white border border-gray-100 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden mb-2">
                                  {f.photo ? (
                                    <img src={f.photo} alt={f.institution} className="w-full h-full object-cover" />
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

                      {data.formations.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                        <svg
                          className="w-8 h-8 text-gray-400"
                          fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                          />
                        </svg>
                      </div>
                      <p className="text-gray-500 font-medium">
                        Aucune formation renseignée
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 sm:space-y-6">
                      {data.formations.map((formation) => (
                        <div
                          key={formation.id}
                          data-animate-id={`formation-${formation.id}`}
                          className={getAnimateClass(`formation-${formation.id}`, 'delay-100')}
                        >
                          <div className="p-6 rounded-xl bg-gray-50 border border-gray-100 hover:shadow-md transition-all duration-300">
                            <div className="flex flex-col lg:flex-row gap-6">
                              {/* Photo */}
                              <div className="lg:w-1/4 flex-shrink-0">
                                {formation.photo ? (
                                  <img
                                    src={formation.photo}
                                    alt={formation.title}
                                    className="w-full h-40 object-cover rounded-xl"
                                  />
                                ) : (
                                  <div className="w-full h-40 bg-gradient-to-br from-brand-blue-bright/10 to-brand-purple/10 rounded-xl flex items-center justify-center">
                                    <svg
                                      className="w-10 h-10 text-gray-300"
                                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1}
                                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                      />
                                    </svg>
                                  </div>
                                )}
                              </div>

                              {/* Détails */}
                              <div className="lg:w-3/4">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-xs font-semibold text-brand-blue-bright uppercase tracking-wider">
                                    {formation.institution}
                                  </span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                  {formation.title}
                                </h3>
                                <p className="text-sm text-gray-500 mb-3">
                                  {formation.year}
                                </p>
                                {formation.description && (
                                  <p className="text-gray-600 leading-relaxed">
                                    {formation.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* ======================================== ONGLET COMPÉTENCES ======================================== */}
          {activeTab === 'competences' && (
            <section className="space-y-6">
              <div data-animate-id="competences-header" className={getAnimateClass('competences-header', 'delay-75')}>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <span>⭐</span> Compétences Professionnelles
                  </h2>

                  {data.skills.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500 font-medium">
                        Aucune compétence renseignée
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {data.skills.map((skill, index) => (
                        <div
                          key={skill.id}
                          data-animate-id={`skill-${skill.id}`}
                          className={`p-5 rounded-xl bg-gray-50 border border-gray-100 hover:shadow-md transition-all duration-300 group ${
                            visibleSections.has(`skill-${skill.id}`)
                              ? 'animate-fade-in-up opacity-100'
                              : 'opacity-0 translate-y-8'
                          }`}
                          style={{ animationDelay: `${100 + index * 100}ms` }}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${
                                skill.category === 'acquis'
                                  ? 'bg-[#00E5FF]'
                                  : skill.category === 'poste_vise'
                                  ? 'bg-[#B388FF]'
                                  : skill.category === 'domaine_formation'
                                  ? 'bg-[#87CEEB]'
                                  : 'bg-green-500'
                              }`}
                            />
                            <div>
                              <span className="text-[10px] font-semibold text-brand-blue-bright uppercase tracking-wider">
                                {skill.category.replace('_', ' ')}
                              </span>
                              <h4 className="font-bold text-gray-900 text-sm mt-1">
                                {skill.title}
                              </h4>
                              {skill.description && (
                                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                                  {skill.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* ======================================== ONGLET ACTUALITÉS ======================================== */}
          {activeTab === 'actualites' && (
            <section className="space-y-6">
              <div data-animate-id="actualites-header" className={getAnimateClass('actualites-header', 'delay-75')}>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <span>📢</span> Actualités & Projets
                  </h2>

                  {data.posts.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500 font-medium">
                        Aucune publication pour le moment
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {data.posts.map((post, index) => (
                        <div
                          key={post.id}
                          data-animate-id={`post-${post.id}`}
                          className={`transition-all duration-700 ${
                            visibleSections.has(`post-${post.id}`)
                              ? 'animate-fade-in-up opacity-100'
                              : 'opacity-0 translate-y-8'
                          }`}
                          style={{ animationDelay: `${100 + index * 100}ms` }}
                        >
                          <PostCard
                            post={post}
                            comments={comments[post.id] || []}
                              onComment={async (pid, c) => {
                                await apiPost("/api/posts/" + pid + "/comments", {
                                  content: c,
                                  senderName: "Anonyme",
                                  senderEmail: null,
                                });
                                const res = await apiGet<Comment[]>("/api/posts/" + pid + "/comments");
                                setComments(prev => ({ ...prev, [pid]: res }));
                              }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* ======================================== ONGLET AGENDA ======================================== */}
          {activeTab === 'agenda' && (
            <section className="space-y-6">
              <div data-animate-id="agenda-header" className={getAnimateClass('agenda-header', 'delay-75')}>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <span>📅</span> Agenda & Disponibilités
                  </h2>

                  {data.agendaEvents && data.agendaEvents.length > 0 ? (
                    <div className="space-y-6">
                      {/* Affichage en colonnes colorées selon le statut */}
                      <div data-animate-id="agenda-columns" className={getAnimateClass('agenda-columns', 'delay-100')}>
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                          <span>📋</span> Événements par statut
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {['available', 'busy', 'uncertain', 'holiday'].map((statusValue) => {
                            const statusEvents = data.agendaEvents?.filter(e => e.status === statusValue) || [];
                            if (statusEvents.length === 0) return null;
                            
                            const getStatusInfo = (status: string) => {
                              switch (status) {
                                case 'available': return { label: 'Disponible', color: 'bg-green-50 border-green-200 text-green-700', dot: 'bg-green-500' };
                                case 'busy': return { label: 'Occupé', color: 'bg-red-50 border-red-200 text-red-700', dot: 'bg-red-500' };
                                case 'uncertain': return { label: 'Incertain', color: 'bg-yellow-50 border-yellow-200 text-yellow-700', dot: 'bg-yellow-500' };
                                case 'holiday': return { label: 'Férié/Week-end', color: 'bg-purple-50 border-purple-200 text-purple-700', dot: 'bg-purple-500' };
                                default: return { label: status, color: 'bg-gray-50 border-gray-200 text-gray-700', dot: 'bg-gray-400' };
                              }
                            };
                            
                            const statusInfo = getStatusInfo(statusValue);
                            
                            return (
                              <div key={statusValue} className="space-y-2">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className={`w-3 h-3 rounded-full ${statusInfo.dot}`} />
                                  <span className="text-sm font-semibold text-gray-700">{statusInfo.label}</span>
                                  <span className="text-xs text-gray-400">({statusEvents.length})</span>
                                </div>
                                <div className="space-y-2">
                                  {statusEvents.map((event) => {
                                    const startDate = new Date(event.startTime);
                                    return (
                                      <div key={event.id} className={`px-3 py-2 rounded-lg text-xs ${statusInfo.color} border border-current/20 hover:shadow-sm transition-all`}>
                                        <p className="font-medium truncate">{event.title}</p>
                                        <p className="text-[10px] opacity-70">
                                          {startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: event.timezone || 'UTC' })}
                                        </p>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      {/* Liste détaillée des événements */}
                      <div className="space-y-4">
                        {data.agendaEvents.map((event) => {
                          const getStatusColor = (status: string) => {
                            switch (status) {
                              case 'available': return 'bg-green-50 border-green-200 text-green-700';
                              case 'busy': return 'bg-red-50 border-red-200 text-red-700';
                              case 'uncertain': return 'bg-yellow-50 border-yellow-200 text-yellow-700';
                              case 'holiday': return 'bg-purple-50 border-purple-200 text-purple-700';
                              default: return 'bg-gray-50 border-gray-200 text-gray-700';
                            }
                          };

                          const getStatusLabel = (status: string) => {
                            switch (status) {
                              case 'available': return 'Disponible';
                              case 'busy': return 'Occupé';
                              case 'uncertain': return 'Incertain';
                              case 'holiday': return 'Férié/Week-end';
                              default: return status;
                            }
                          };

                          const startDate = new Date(event.startTime);
                          const endDate = new Date(event.endTime);

                          return (
                            <div
                              key={event.id}
                              data-animate-id={`event-${event.id}`}
                              className={`p-5 rounded-xl border ${getStatusColor(event.status)} transition-all duration-200 ${
                                visibleSections.has(`event-${event.id}`)
                                  ? 'animate-fade-in-up opacity-100'
                                  : 'opacity-0 translate-y-8'
                              }`}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                <div className="flex-1">
                                  <h3 className="text-lg font-bold text-gray-900">{event.title}</h3>
                                  {event.description && (
                                    <p className="text-sm text-gray-600 mt-2">{event.description}</p>
                                  )}
                                </div>
                                <div className="flex flex-col items-start sm:items-end gap-2">
                                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(event.status).replace('text-', '').replace('border-', '')}`}>
                                    {getStatusLabel(event.status)}
                                  </span>
                                  <div className="text-right">
                                    <p className="text-sm font-medium text-gray-800">
                                      {startDate.toLocaleDateString('fr-FR', {
                                        day: 'numeric',
                                        month: 'short',
                                        timeZone: event.timezone || 'UTC'
                                      })}
                                      {endDate > startDate && ` - ${endDate.toLocaleDateString('fr-FR', {
                                        day: 'numeric',
                                        month: 'short',
                                        timeZone: event.timezone || 'UTC'
                                      })}`}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {startDate.toLocaleTimeString('fr-FR', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        timeZone: event.timezone || 'UTC'
                                      })}
                                      {endDate > startDate && ` - ${endDate.toLocaleTimeString('fr-FR', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        timeZone: event.timezone || 'UTC'
                                      })}`}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div
                      data-animate-id="agenda-empty"
                      className={getAnimateClass('agenda-empty', 'delay-100')}
                    >
                      <div className="text-center py-12">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                          <svg
                            className="w-8 h-8 text-gray-400"
                            fill="none" viewBox="0 0 24 24" stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <p className="text-gray-500 font-medium">
                          Aucune disponibilité renseignée
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* ======================================== ONGLET CONTACT ======================================== */}
          {activeTab === 'contact' && (
            <section className="space-y-8">
              <div data-animate-id="contact-section" className={getAnimateClass('contact-section', 'delay-75')}>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <span>💬</span> Contacter {fullName}
                  </h2>
                  <p className="text-gray-500 mb-8">
                    Envoyez un message privé. Seul {fullName} pourra le lire.
                  </p>

                  <form onSubmit={handleContactSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Nom complet
                        </label>
                        <input
                          type="text"
                          required
                          value={contactForm.name}
                          onChange={(e) => setContactForm((f) => ({ ...f, name: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/30 text-sm"
                          placeholder="Votre nom et prénom"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          Adresse email
                        </label>
                        <input
                          type="email"
                          required
                          value={contactForm.email}
                          onChange={(e) => setContactForm((f) => ({ ...f, email: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/30 text-sm"
                          placeholder="votre@email.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Message
                      </label>
                      <textarea
                        required
                        value={contactForm.message}
                        onChange={(e) => setContactForm((f) => ({ ...f, message: e.target.value }))}
                        rows={5}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#00E5FF]/30 text-sm resize-none"
                        placeholder="Dites-moi ce que vous pensez de mon travail, posez-moi une question, ou proposez-moi une collaboration..."
                      />
                    </div>

                    {contactMessage && (
                      <div
                        className={`px-4 py-3 rounded-xl text-sm ${
                          contactMessage.includes('succès')
                            ? 'bg-green-50 border border-green-200 text-green-700'
                            : 'bg-red-50 border border-red-200 text-red-600'
                        }`}
                      >
                        {contactMessage}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={contactLoading}
                      className="w-full sm:w-auto px-8 py-3 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-50"
                      style={{
                        background: 'linear-gradient(135deg, #00E5FF, #0077FF)',
                        boxShadow: '0 4px 15px rgba(0, 229, 255, 0.3)',
                      }}
                    >
                      {contactLoading ? 'Envoi en cours...' : 'Envoyer le message'}
                    </button>
                  </form>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
