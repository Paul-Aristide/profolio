// src/app/cgu/page.tsx
import Link from 'next/link';

export const metadata = {
  title: 'Conditions Générales d\'Utilisation - ProFolio+',
  description: 'CGU de la plateforme ProFolio+',
};

export default function CguPage() {
  return (
    <main className="min-h-screen bg-[#F8F9FA] py-20">
      <div className="max-w-3xl mx-auto px-6 text-gray-800">
        <h1 className="text-3xl font-bold mb-8 text-[#0a1628]">
          Conditions Générales d&apos;Utilisation
        </h1>

        <p className="text-sm text-gray-500 mb-8">
          Dernière mise à jour : 3 août 2026
        </p>

        <div className="space-y-8 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-[#00E5FF] mb-3">1. Objet</h2>
            <p>
              Les présentes Conditions Générales d&apos;Utilisation (CGU) régissent l&apos;accès et l&apos;utilisation de la plateforme ProFolio+ (ci-après « la Plateforme »), hébergée à l&apos;adresse{' '}
              <a href="https://profolio.onrender.com" className="text-[#00E5FF]">profolio.onrender.com</a>.
            </p>
            <p className="mt-2">
              La Plateforme permet aux professionnels de créer, gérer et partager un portfolio en ligne personnalisé. Toute utilisation de la Plateforme implique l&apos;acceptation intégrale des présentes CGU.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#00E5FF] mb-3">2. Accès à la plateforme</h2>
            <p>
              L&apos;accès à la Plateforme est réservé aux utilisateurs titulaires d&apos;un identifiant d&apos;invitation délivré par l&apos;administrateur. Cet identifiant est à usage unique et expire automatiquement après utilisation ou à l&apos;issue d&apos;un délai fixé par l&apos;administrateur.
            </p>
            <p className="mt-2">
              L&apos;utilisateur s&apos;engage à fournir des informations exactes et à jour lors de l&apos;inscription. Il est responsable de la confidentialité de ses identifiants de connexion (mot de passe et code OTP) et de toutes les actions effectuées sous son compte.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#00E5FF] mb-3">3. Contenu et responsabilité</h2>
            <p>
              L&apos;utilisateur est seul responsable du contenu qu&apos;il publie sur sa page de portfolio (publications, formations, expériences, compétences, agenda, etc.). Le respect des droits de propriété intellectuelle, du droit à l&apos;image et de la vie privée est obligatoire.
            </p>
            <p className="mt-2">
              Tout contenu signalé comme contraires à la loi ou aux présentes CGU fera l&apos;objet d&apos;une modération par l&apos;administrateur, conformément au processus décrit à la section 6.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#00E5FF] mb-3">4. Durée et résiliation</h2>
            <p>
              La Plateforme est mise à disposition gratuitement pour une durée indéfinie. L&apos;administrateur se réserve le droit de modifier, suspendre ou interrompre l&apos;accès à la Plateforme à tout moment, sans préavis.
            </p>
            <p className="mt-2">
              Un compte utilisateur peut être bloqué par l&apos;administrateur en cas de manquement aux présentes CGU. Un compte bloqué depuis plus de 7 jours est définitivement supprimé par un job automatisé, conformément à l&apos;article 6.2.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#00E5FF] mb-3">5. Propriété intellectuelle</h2>
            <p>
              Tous les éléments graphiques, textuels et logiciels de la Plateforme (logos, couleurs, polices, code source) sont la propriété exclusive de l&apos;éditeur ou de ses partenaires, sauf mention contraire. Toute reproduction, même partielle, est interdite sans autorisation expresse.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#00E5FF] mb-3">6. Modération et signalements</h2>
            <p>
              Les visiteurs et utilisateurs peuvent signaler un contenu ou un profil inapproprié via le système de signalement intégré. Les signalements sont examinés par l&apos;administrateur, qui peut accéder au contenu signalé afin de prendre une décision de modération (résolution ou rejet du signalement, blocage éventuel du compte).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#00E5FF] mb-3">7. Droit applicable</h2>
            <p>
              Les présentes CGU sont régies par les lois de Côte d&apos;Ivoire. En cas de conflit relatif à l&apos;interprétation ou à l&apos;exécution des présentes, les parties compétentes sont les juridictions compétentes d&apos;Abidjan, sauf disposition légale contraire.
            </p>
          </section>
        </div>

        <footer className="mt-12 pt-8 border-t border-gray-200">
          <Link href="/" className="text-[#00E5FF] hover:underline">
            ← Retour à l&apos;accueil
          </Link>
        </footer>
      </div>
    </main>
  );
}
