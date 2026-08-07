// src/app/politique-confidentialite/page.tsx
import Link from 'next/link';

export const metadata = {
  title: 'Politique de Confidentialité - ProFolio+',
  description: 'Politique de confidentialité de la plateforme ProFolio+',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#F8F9FA] py-20">
      <div className="max-w-3xl mx-auto px-6 text-gray-800">
        <h1 className="text-3xl font-bold mb-8 text-[#0a1628]">
          Politique de Confidentialité
        </h1>

        <p className="text-sm text-gray-500 mb-8">
          Dernière mise à jour : 3 août 2026
        </p>

        <div className="space-y-8 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-[#00E5FF] mb-3">1. Données collectées</h2>
            <p>
              Lors de l&apos;inscription, ProFolio+ collecte les données suivantes : nom, prénom, email, téléphone, date et lieu de naissance, pays, ville, ainsi que la photo de profil et la photo de couverture (stockées via Cloudinary). Le mot de passe est haché avec Argon2 et ne peut être récupéré en clair.
            </p>
            <p className="mt-2">
              Les données générées automatiquement incluent : les journaux d&apos;accès serveur (adresse IP, User-Agent, horodatage), les journaux de connexion (appareils de confiance), les journaux d&apos;audit (signalements, actions administratives) et les métriques de visite du portfolio (via le système de PageView).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#00E5FF] mb-3">2. Finalités du traitement</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Fournir et sécuriser la plateforme (authentification, prévention des abus)</li>
              <li>Gérer le portfolio personnel et ses interactions (publications, commentaires, réactions)</li>
              <li>Envoyer les notifications OTP et de contact uniquement via Resend</li>
              <li>Produire des statistiques de visite du portfolio (nombre de visiteurs, sources de trafic)</li>
              <li>Permettre la modération des contenus signalés conformément à la section 4</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#00E5FF] mb-3">3. Conservation des données</h2>
            <p>
              Les données sont conservées pour la durée de vie du compte. Un compte bloqué par l&apos;administrateur depuis plus de 7 jours est définitivement supprimé, conformément au processus automatisé de nettoyage quotidien. Les tokens d&apos;inscription expirent et sont rendus inutilisables après usage.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#00E5FF] mb-3">4. Modération et transparence</h2>
            <p>
              L&apos;administrateur n&apos;a accès au contenu des profils, formations, publications, agendas ou messages que lorsqu&apos;aucun signalement n&apos;a été déposé. Lorsqu&apos;un contenu est signalé par un visiteur ou utilisateur, l&apos;administrateur peut consulter le contenu signalé et l&apos;identité de l&apos;utilisateur concerné, uniquement dans le cadre de la modération de ce signalement, avec traçabilité complète de l&apos;action.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#00E5FF] mb-3">5. Vos droits</h2>
            <p>
              Conformément à la loi n°2013-450 de la Côte d&apos;Ivoire relative à la protection des données à caractère personnel, vous disposez d&apos;un droit d&apos;accès, de rectification et d&apos;effacement de vos données. Vous pouvez exercer ces droits en contactant l&apos;administrateur via le formulaire de contact disponible sur chaque portfolio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#00E5FF] mb-3">6. Cookies et technologies similaires</h2>
            <p>
              La plateforme utilise des cookies strictement nécessaires à l&apos;authentification (JWT d&apos;accès de 1h). Le cookie d&apos;authentification est protégé par les drapeaux HttpOnly, Secure et SameSite=Lax. Aucun cookie de suivi publicitaire ou analytique n&apos;est déployé.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#00E5FF] mb-3">7. Sécurité</h2>
            <p>
              Les communications sont chiffrées via HTTPS (fournie automatiquement par Render). Les mots de passe sont hachés avec Argon2. Les jetons JWT d&apos;accès expirent après 1 heure et les refresh tokens sont hachés (SHA-256) et peuvent être révoqués côté serveur. Une protection CSRF par vérification de l&apos;en-tête Origin est appliquée sur toutes les requêtes mutantes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#00E5FF] mb-3">8. Modifications</h2>
            <p>
              Cette politique peut être mise à jour. Les modifications substantielles seront communiquées via l&apos;interface de la plateforme.
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
