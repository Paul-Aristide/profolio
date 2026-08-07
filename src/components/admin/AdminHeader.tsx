// src/components/admin/AdminHeader.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';

type TabId = 'overview' | 'metrics' | 'users' | 'intervention';

const ADMIN_TABS: Array<{ id: TabId; label: string }> = [
  { id: 'overview', label: "Vue d'ensemble" },
  { id: 'metrics', label: 'Métriques' },
  { id: 'users', label: 'Gestion utilisateurs' },
  { id: 'intervention', label: 'Intervention' },
];

type AdminHeaderProps = {
  activeTab: TabId;
  onTabChange: (tabId: TabId) => void;
};

export default function AdminHeader({ activeTab, onTabChange }: AdminHeaderProps) {
  const { logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
    <header className="sticky top-0 z-50 w-full" style={{
      background: 'linear-gradient(135deg, #0a2540 0%, #1a3f6e 40%, #0d5fa3 70%, #07294a 100%)',
      boxShadow: '0 10px 40px rgba(10, 37, 64, 0.35)'
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="shrink-0 min-w-0">
            <span className="text-sm sm:text-base font-semibold text-white/90 truncate block max-w-[140px] sm:max-w-none">
              Panel Administration
            </span>
          </div>
          <div className="shrink-0 relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2.5 group"
            >
              <div className="w-9 h-9 rounded-full overflow-hidden bg-white/20 flex items-center justify-center border border-white/40 transition-transform duration-200 group-hover:scale-110">
                <span className="text-xs font-bold text-white">A</span>
              </div>
              <svg
                className={`w-3.5 h-3.5 text-white/80 hidden sm:block transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  Se déconnecter
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="w-full">
          <nav className="hidden md:flex items-center w-full">
            <ul className="flex items-center w-full">
              {ADMIN_TABS.map((tab) => {
                const isActive = tab.id === activeTab;
                return (
                  <li key={tab.id} className="flex-1">
                    <button
                      onClick={() => onTabChange(tab.id)}
                      className="relative w-full px-2 py-2 text-sm font-medium rounded-full transition-all duration-300 ease-out text-center"
                      style={{
                        color: isActive ? '#ffffff' : '#bfdbfe',
                      }}
                    >
                      {isActive && (
                        <span
                          className="absolute inset-x-1 inset-y-0 rounded-full -z-0"
                          style={{
                            background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.25) 0%, rgba(0, 191, 255, 0.18) 100%)',
                            boxShadow: '0 0 25px rgba(0, 229, 255, 0.35), inset 0 0 12px rgba(255, 255, 255, 0.1)',
                          }}
                        />
                      )}
                      <span className="relative z-10">{tab.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>

      <div className="md:hidden">
        <nav className="flex items-center overflow-x-auto no-scrollbar gap-1 px-4 pb-2">
          {ADMIN_TABS.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="shrink-0 px-3 py-2 text-xs font-medium rounded-full transition-all duration-300"
                style={{
                  background: isActive ? 'rgba(0, 229, 255, 0.25)' : 'transparent',
                  color: isActive ? '#ffffff' : '#bfdbfe',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      <span
        className="absolute pointer-events-none hidden md:block"
        style={{
          bottom: '0',
          left: '0',
          right: '0',
          height: '2px',
          background: 'linear-gradient(90deg, transparent, rgba(0, 229, 255, 0.35), transparent)'
        }}
      />
    </header>
  );
}
