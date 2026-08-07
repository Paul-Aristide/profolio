// src/app/page.tsx — Landing Page ProFolio+
export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Fond dynamique */}
      <div className="fixed inset-0 overflow-hidden -z-10"
        style={{
          background: 'linear-gradient(135deg, #0a1628 0%, #0f2038 30%, #162d50 60%, #0a1628 100%)',
        }}
      >
        <div className="absolute w-[600px] h-[600px] rounded-full top-[-15%] right-[-8%]"
          style={{
            background: 'radial-gradient(circle, rgba(0,229,255,0.15) 0%, transparent 70%)',
            animation: 'blobBounce 25s ease-in-out infinite',
          }}
        />
        <div className="absolute w-[500px] h-[500px] rounded-full bottom-[-20%] left-[-10%]"
          style={{
            background: 'radial-gradient(circle, rgba(179,136,255,0.12) 0%, transparent 70%)',
            animation: 'blobBounce 22s ease-in-out infinite 5s',
          }}
        />
        <div className="absolute w-[300px] h-[300px] rounded-full top-1/3 left-1/4"
          style={{
            background: 'radial-gradient(circle, rgba(0,191,255,0.1) 0%, transparent 70%)',
            animation: 'blobBounce 18s ease-in-out infinite 10s',
          }}
        />
      </div>

      {/* Navigation minimaliste */}
      <nav className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-[#00E5FF]/50 flex items-center justify-center">
            <span className="text-[#00E5FF] font-bold text-sm">PF+</span>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">
            ProFolio<span className="text-[#00E5FF]">+</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="/connexion"
            className="text-white/80 hover:text-white text-sm font-medium transition-colors px-4 py-2"
          >
            Connexion
          </a>
          <a
            href="/inscription"
            className="text-sm font-semibold px-5 py-2.5 rounded-xl text-white transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, #00E5FF, #0077FF)',
              boxShadow: '0 4px 20px rgba(0, 229, 255, 0.3)',
            }}
          >
            Créer un compte
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Texte gauche */}
          <div className="space-y-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[#87CEEB] text-sm">
              <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse" />
              Plateforme de portfolios nouvelle génération
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight tracking-tight">
              Créez votre{' '}
              <span className="text-gradient">portfolio</span>
              {' '}professionnel
            </h1>

            <p className="text-lg text-white/60 max-w-lg leading-relaxed">
              ProFolio+ vous permet de créer, personnaliser et partager un portfolio en ligne
              qui reflète votre parcours, vos compétences et vos ambitions.
            </p>

            <div className="flex flex-wrap gap-4">
              <a
                href="/inscription"
                className="px-8 py-3.5 rounded-xl text-white font-semibold text-base transition-all duration-300 inline-flex items-center gap-2 group"
                style={{
                  background: 'linear-gradient(135deg, #00E5FF, #0077FF)',
                  boxShadow: '0 4px 20px rgba(0, 229, 255, 0.3)',
                }}
              >
                Commencer maintenant
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <a
                href="#demo"
                className="px-8 py-3.5 rounded-xl text-white/80 font-medium text-base border border-white/20 hover:border-white/40 transition-all"
              >
                Voir la démo
              </a>
            </div>

            {/* Mini stats */}
            <div className="flex gap-8 pt-4">
              {[
                ['100+', 'Portfolios créés'],
                ['5', 'Onglets dédiés'],
                ['1 Clique', 'CV généré'],
              ].map(([val, label]) => (
                <div key={label}>
                  <p className="text-2xl font-bold text-white">{val}</p>
                  <p className="text-xs text-white/40">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Logo / Visuel droite */}
          <div className="hidden lg:flex items-center justify-center animate-float">
            <div className="relative">
              <div className="w-80 h-80 rounded-full border-2 border-[#00E5FF]/20 flex items-center justify-center animate-pulseGlow"
                style={{ animationDelay: '0.5s' }}
              >
                <div className="w-60 h-60 rounded-full border-2 border-[#B388FF]/20 flex items-center justify-center">
                  <div className="w-40 h-40 rounded-full"
                    style={{
                      background: 'linear-gradient(135deg, rgba(0,229,255,0.15), rgba(179,136,255,0.15))',
                      boxShadow: '0 0 60px rgba(0,229,255,0.1)',
                    }}
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-5xl font-bold text-gradient">PF+</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Orbites */}
              <div className="absolute inset-0 rounded-full border border-[#00E5FF]/10 animate-spin" style={{ animationDuration: '20s' }}>
                <div className="absolute top-0 left-1/2 w-3 h-3 rounded-full bg-[#00E5FF]/40 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="absolute inset-0 rounded-full border border-[#B388FF]/10 animate-spin" style={{ animationDuration: '25s', animationDirection: 'reverse' }}>
                <div className="absolute bottom-0 left-1/2 w-2 h-2 rounded-full bg-[#B388FF]/40 -translate-x-1/2 translate-y-1/2" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-32">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: 'Portfolio personnalisé', desc: 'Créez votre profil, ajoutez formations, compétences et projets en quelques clics.', icon: '🎨' },
            { title: 'CV automatique', desc: 'Générez un CV PDF professionnel à partir des données de votre portfolio.', icon: '📄' },
            { title: 'Espace public', desc: 'Partagez votre lien unique avec le monde. Les visiteurs peuvent vous contacter.', icon: '🔗' },
          ].map((feat, i) => (
            <div
              key={feat.title}
              className="p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 card-hover"
              style={{ animation: `slideUp 0.5s ease-out ${0.1 + i * 0.1}s forwards`, opacity: 0 }}
            >
              <span className="text-3xl mb-4 block">{feat.icon}</span>
              <h3 className="text-white font-bold text-lg mb-2">{feat.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-white/30 text-sm">
            © 2026 ProFolio+ — Design. Create. Impact.
          </p>
        </div>
      </footer>
    </main>
  );
}
