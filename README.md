# 🚀 ProFolio+ - Plateforme de Portefeuilles Professionnels Personnalisés

> **Créez, gérez et partagez votre portfolio professionnel en ligne avec une gestion complète et sécurisée.**

---

## 📋 **Table des Matières**
- [🎯 Fonctionnalités](#-fonctionnalités)
- [🛠 Stack Technique](#-stack-technique)
- [🚀 Installation Locale](#-installation-locale)
- [📦 Déploiement](#-déploiement)
- [🔐 Configuration](#-configuration)
- [📊 Structure du Projet](#-structure-du-projet)
- [👥 Rôles et Permissions](#-rôles-et-permissions)
- [💡 Fonctionnalités Clés](#-fonctionnalités-clés)
- [📄 Licence](#-licence)

---

## 🎯 **Fonctionnalités**

### ✅ **Pour les Visiteurs**
- ✅ Accès en lecture seule aux portfolios publics
- ✅ Navigation entre les onglets (Profil, Formation, Actualités, Agenda, Compétences, Contact)
- ✅ Possibilité de commenter les publications
- ✅ Formulaire de contact fonctionnel
- ✅ Système de suivi (follow) des profils

### ✅ **Pour les Utilisateurs**
- ✅ **CRUD complet** sur leur espace personnel
- ✅ Tableau de bord avec **statistiques en temps réel**
- ✅ Gestion des informations personnelles et professionnelles
- ✅ Création et gestion des formations, expériences, compétences
- ✅ Publication d'articles, vidéos et liens
- ✅ Calendrier interactif avec gestion des fuseaux horaires
- ✅ Messagerie privée sécurisée

### ✅ **Pour les Administrateurs**
- ✅ **Génération de tokens d'invitation** (à usage unique, avec expiration)
- ✅ **Gestion des utilisateurs** (activation, blocage, suppression)
- ✅ **Accès aux statistiques globales** de la plateforme
- ✅ **Gestion des signalements** (contenu signalé uniquement)
- ✅ **Nettoyage automatique** des comptes bloqués depuis >7 jours

---

## 🛠 **Stack Technique**

| Catégorie | Technologie | Version | Usage |
|-----------|-------------|---------|-------|
| **Framework** | Next.js | 16.2.12 | Frontend + Backend (App Router) |
| **Base de données** | PostgreSQL | - | Stockage des données |
| **ORM** | Prisma | 7.9.1 | Accès à la base de données |
| **Stockage** | Cloudinary | - | Images et vidéos |
| **Emails** | Resend | - | Envoi d'emails (OTP, notifications) |
| **Authentification** | JWT + Argon2 | - | Sécurité des comptes |
| **Temps réel** | SSE | - | Statistiques live |
| **Hébergement** | Render | - | Déploiement recommandé |

---

## 🚀 **Installation Locale**

### 📥 **Prérequis**
- Node.js ≥ 18.x
- npm / yarn / pnpm
- PostgreSQL (Neon recommandé pour le développement)
- Compte Cloudinary
- Compte Resend

### 🛠 **Étapes d'installation**

```bash
# 1. Cloner le dépôt
git clone https://github.com/Paul-Aristide/profolio.git
cd profolio

# 2. Installer les dépendances
npm install

# 3. Configurer l'environnement (copier .env.example)
cp .env.example .env
nano .env  # Éditer avec vos propres clés

# 4. Générer le client Prisma
npx prisma generate

# 5. Appliquer les migrations
npx prisma migrate deploy

# 6. Démarrer le serveur de développement
npm run dev
```

### 🌐 **Accéder à l'application**
- **Local** : [http://localhost:3000](http://localhost:3000)
- **Admin** : [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 📦 **Déploiement**

### 🎯 **Sur Render (Recommandé)**

1. **Créer un compte** : [https://render.com/](https://render.com/)

2. **Nouveau Web Service** → Connecter votre dépôt GitHub

3. **Configurer le service** :
   ```bash
   # Build Command
   npm install && npx prisma generate && npx prisma migrate deploy
   
   # Start Command
   npm start
   
   # Branch
   main
   ```

4. **Configurer les variables d'environnement** (onglet "Environment") :
   ```env
   DATABASE_URL=""
   JWT_SECRET=""
   RESEND_API_KEY=""
   RESEND_FROM_EMAIL=""
   CLOUDINARY_URL=""
   CLOUDINARY_CLOUD_NAME=""
   CLOUDINARY_API_KEY=""
   CLOUDINARY_API_SECRET=""
   CRON_SECRET=""
   ```

5. **Déployer** → Votre app sera disponible sur `https://profolio.onrender.com`

---

## 🔐 **Configuration**

### 🗝 **Variables d'Environnement Requises**

| Variable | Description | Exemple |
|----------|-------------|---------|
| `DATABASE_URL` | URL de connexion PostgreSQL | `postgresql://user:pass@host:port/db` |
| `JWT_SECRET` | Clé secrète pour les tokens JWT | `base64:...` |
| `CRON_SECRET` | Secret pour les tâches planifiées | `random_string` |
| `RESEND_API_KEY` | Clé API Resend | `re_...` |
| `RESEND_FROM_EMAIL` | Email expéditeur | `onboarding@resend.dev` |
| `CLOUDINARY_URL` | URL Cloudinary | `cloudinary://key:secret@cloud` |
| `CLOUDINARY_CLOUD_NAME` | Nom du cloud | `p8m3mu5m` |
| `CLOUDINARY_API_KEY` | Clé API Cloudinary | `123456789` |
| `CLOUDINARY_API_SECRET` | Secret API Cloudinary | `abcdef...` |

---

## 📊 **Structure du Projet**

```
profolio/
├── public/                  # Assets statiques (images, favicon)
├── prisma/                  # Schéma Prisma + migrations
│   ├── schema.prisma        # Schéma de la base de données
│   └── migrations/          # Historique des migrations
├── src/
│   ├── app/                 # Pages Next.js (App Router)
│   │   ├── api/             # Routes API
│   │   │   ├── admin/       # Routes admin
│   │   │   ├── auth/        # Authentification
│   │   │   └── ...          # Autres routes
│   │   ├── admin/          # Page admin
│   │   ├── connexion/       # Page de connexion
│   │   ├── inscription/    # Page d'inscription
│   │   └── u/              # Pages publiques (/u/[username])
│   ├── components/          # Composants React
│   │   ├── admin/          # Composants admin
│   │   └── tabs/           # Onglets du portfolio
│   └── lib/                 # Utilitaires
│       ├── api/            # Client API
│       ├── auth/           # Authentification
│       ├── cloudinary.ts   # Configuration Cloudinary
│       ├── email.ts        # Fonctions d'email
│       └── prisma.ts       # Client Prisma
├── .env.example             # Exemple de configuration
├── .gitignore               # Fichiers ignorés
├── next.config.ts           # Configuration Next.js
├── package.json             # Dépendances
└── README.md                # Ce fichier
```

---

## 👥 **Rôles et Permissions**

| Rôle | Permissions |
|------|-------------|
| **Visiteur** | Lecture seule des portfolios publics, commentaires, contact, follow |
| **Utilisateur** | CRUD sur son propre espace, dashboard de statistiques, gestion complète de son profil |
| **Administrateur** | Génération de tokens, gestion des utilisateurs, accès aux signalements, **PAS d'accès au contenu utilisateur** |
| **Super Admin** | Même permissions que Admin + protection contre la suppression |

---

## 💡 **Fonctionnalités Clés**

### 🔒 **Sécurité**
- ✅ Authentification **JWT + Refresh Token**
- ✅ **OTP** (One-Time Password) pour la première connexion
- ✅ **Hashage des mots de passe** avec Argon2
- ✅ **Protection CSRF** pour les formulaires
- ✅ **Rate Limiting** sur les tentatives de connexion
- ✅ **Tokens d'invitation** à usage unique

### 📊 **Statistiques**
- ✅ **Temps réel** avec SSE (Server-Sent Events)
- ✅ Nombre de visiteurs par profil
- ✅ Nombre d'abonnés (followers)
- ✅ Nombre de commentaires reçus
- ✅ Graphiques de performance

### 📧 **Messagerie**
- ✅ Envoi d'emails via **Resend**
- ✅ **Notifications OTP** pour la connexion
- ✅ **Notifications de contact** pour les utilisateurs
- ✅ Messages privés entre utilisateurs

### 📁 **Gestion des Médias**
- ✅ **Upload d'images et vidéos** via Cloudinary
- ✅ **Validation des types MIME**
- ✅ **Limite de taille** (15 Mo par fichier)
- ✅ **Transformations automatiques** (redimensionnement, etc.)

### 🎨 **UI/UX**
- ✅ **Design professionnel et responsive**
- ✅ **Charte graphique stricte** (bleu #00E5FF, ciel #87CEEB, etc.)
- ✅ **Animations fluides** (transitions, fade-in, etc.)
- ✅ **Accessibilité** (contrastes, navigation clavier)

---

## 📄 **Licence**

Ce projet est développé dans le cadre d'un projet professionnel.

---

## 🆘 **Support**

Pour toute question ou problème :
- **Documentation** : Voir les fichiers dans `/docs/`
- **Configuration** : Vérifier le `.env.example`
- **Déploiement** : Suivre le guide ci-dessus

---

> **✨ ProFolio+ - Créez votre portfolio professionnel avec élégance et simplicité ✨**
