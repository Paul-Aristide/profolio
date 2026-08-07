// src/components/Header.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';

export type HeaderTab = { id: string; label: string };

const DEFAULT_TABS: HeaderTab[] = [
  { id: 'profil', label: 'Profil' },
  { id: 'formation', label: 'Formation' },
  { id: 'actualites', label: 'Actualités' },
  { id: 'agenda', label: 'Agenda' },
  { id: 'competences', label: 'Compétences' },
  { id: 'contact', label: 'Contact' },
];

type HeaderProps = {
  expertise: string;
  firstName: string;
  lastName: string;
  photo?: string | null;
  tabs?: HeaderTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  isOwner?: boolean;
};

export default function Header({
  expertise,
  firstName,
  lastName,
  photo,
  tabs = DEFAULT_TABS,
  activeTab,
  onTabChange,
  isOwner = true,
}: HeaderProps) {
  const { logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleLogout() {
    setMenuOpen(false);
    await logout();
    router.push('/connexion');
  }

  return (
    <header className="sticky top-0 z-50 w-full"
      style={{
        background: 'linear-gradient(135deg, #0a1628 0%, #0f2038 40%, #162d50 70%, #0a1628 100%)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Ligne supérieure : Logo | Menu déroulant */}
        <div className="flex items-center justify-between h-14">
          {/* Logo ProFolio+ à gauche */}
          <div className="flex items-center gap-2.5 shrink-0">
            <img
              src="/logo-profolio.png"
              alt="ProFolio+"
              className="w-9 h-9 rounded-full object-cover border border-white/10"
            />
          </div>

          {/* Expertise en grand, centré */}
          <div className="absolute left-1/2 -translate-x-1/2 text-center hidden md:block">
            <p className="text-white font-bold text-lg tracking-tight">{expertise || 'Portfolio'}</p>
          </div>

          {/* Menu utilisateur à droite */}
          <div className="shrink-0 relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2.5 group px-2 py-1.5 rounded-xl hover:bg-white/5 transition-all"
            >
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-[#00E5FF]/20 to-[#B388FF]/20 flex items-center justify-center border-2 border-white/20 transition-transform duration-200 group-hover:scale-110">
                  {photo ? (
                    <img src={photo} alt={`${firstName} ${lastName}`} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-white">{initials}</span>
                  )}
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-white leading-tight">{firstName} {lastName}</p>
                  <p className="text-[10px] text-white/40">{expertise || 'Portfolio'}</p>
                </div>
              </div>
              {isOwner && (
                <svg
                  className={`w-3 h-3 text-white/50 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>

            {/* Menu déroulant */}
            {isOwner && menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-[#0f2038] backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 py-2 z-50 overflow-hidden animate-scale-in">
                {/* Info rapide avec photo */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-[#00E5FF]/20 to-[#B388FF]/20 flex items-center justify-center border border-white/20 shrink-0">
                    {photo ? (
                      <img src={photo} alt={`${firstName} ${lastName}`} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-white">{initials}</span>
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{firstName} {lastName}</p>
                    <p className="text-white/30 text-xs">{expertise || 'Portfolio'}</p>
                  </div>
                </div>

                {/* Lien vers les onglets */}
                <button
                  onClick={() => { setMenuOpen(false); router.push('/tableau-de-bord'); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Mon espace
                </button>

                {/* Stats & CV */}
                <button
                  onClick={() => { setMenuOpen(false); router.push('/dashboard'); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Statistiques & CV
                </button>

                {/* Séparateur */}
                <div className="border-t border-white/5 my-1" />

                {/* Déconnexion */}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Se déconnecter
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Onglets de navigation */}
        <div className="w-full">
          <nav className="hidden md:flex items-center w-full pb-2">
            <ul className="flex items-center w-full gap-1">
              {tabs.map((tab) => {
                const isActive = tab.id === activeTab;
                return (
                  <li key={tab.id} className="flex-1">
                    <button
                      onClick={() => onTabChange(tab.id)}
                      className="relative w-full px-2 py-2 text-sm font-medium rounded-xl transition-all duration-300 text-center"
                      style={{
                        color: isActive ? '#ffffff' : 'rgba(255,255,255,0.5)',
                      }}
                    >
                      {isActive && (
                        <span
                          className="absolute inset-x-0 inset-y-0 rounded-xl -z-0"
                          style={{
                            background: 'linear-gradient(135deg, rgba(0,229,255,0.12), rgba(0,119,255,0.08))',
                            border: '1px solid rgba(0,229,255,0.15)',
                          }}
                        />
                      )}
                      <span className="relative z-10 hover:text-white/80 transition-colors">{tab.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>

      {/* Version mobile : tabs scrollables */}
      <div className="md:hidden px-2 pb-2">
        <nav className="flex items-center overflow-x-auto no-scrollbar gap-1">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="shrink-0 px-4 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 whitespace-nowrap"
                style={{
                  background: isActive ? 'rgba(0,229,255,0.12)' : 'transparent',
                  color: isActive ? '#ffffff' : 'rgba(255,255,255,0.5)',
                  border: isActive ? '1px solid rgba(0,229,255,0.15)' : '1px solid transparent',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
