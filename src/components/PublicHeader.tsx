// src/components/PublicHeader.tsx
'use client';

import { useRouter } from 'next/navigation';

type PublicHeaderProps = {
  expertise: string;
  firstName: string;
  lastName: string;
  photo?: string | null;
};

export default function PublicHeader({
  expertise,
  firstName,
  lastName,
  photo,
}: PublicHeaderProps) {
  const router = useRouter();

  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{
        background: 'linear-gradient(135deg, #0a1628 0%, #0f2038 40%, #162d50 70%, #0a1628 100%)',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo à gauche */}
          <div className="flex items-center gap-2.5">
            <img
              src="/logo-profolio.png"
              alt="ProFolio+"
              className="w-10 h-10 rounded-full object-cover border border-white/10"
            />
            <span className="text-white font-bold text-lg tracking-tight hidden sm:inline">
              ProFolio<span className="text-[#00E5FF]">+</span>
            </span>
          </div>

          {/* Nom du profil + Photo au centre */}
          <div className="hidden md:flex flex-1 justify-center">
            <div className="flex items-center gap-3">
              <div className="text-center">
                <h1 className="text-white font-bold text-xl tracking-tight">
                  {firstName} {lastName}
                </h1>
                {expertise && (
                  <p className="text-[#00E5FF] text-sm font-medium tracking-wide">
                    {expertise}
                  </p>
                )}
              </div>
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-[#00E5FF]/20 to-[#B388FF]/20 flex items-center justify-center border-2 border-white/20 shrink-0">
                {photo ? (
                  <img src={photo} alt={`${firstName} ${lastName}`} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-white">{`${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()}</span>
                )}
              </div>
            </div>
          </div>

          {/* Espace vide à droite pour équilibrer */}
          <div className="w-10" />
        </div>
      </div>
    </header>
  );
}
