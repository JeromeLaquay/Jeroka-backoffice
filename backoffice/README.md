# Jeroka Backoffice - Gestion TPE/PME

Une application moderne de gestion pour les Très Petites Entreprises (TPE) et Petites et Moyennes Entreprises (PME), développée avec Vue 3, TypeScript et Tailwind CSS.

## 🚀 Fonctionnalités

### ✅ Actuellement disponibles
- **Authentification** : Système de connexion sécurisé
- **Dashboard** : Vue d'ensemble avec statistiques et graphiques
- **Gestion des clients** : CRUD complet pour la gestion des clients
- **Interface responsive** : Optimisée pour desktop, tablette et mobile
- **Mode sombre** : Support du thème sombre
- **Navigation intuitive** : Sidebar avec navigation claire

### 🔄 En développement
- **Gestion des factures** : Création, édition et envoi de factures
- **Gestion des devis** : Système de devis et conversion en factures
- **Gestion des produits** : Catalogue de produits/services
- **Gestion des commandes** : Suivi des commandes clients
- **Comptabilité** : Tableaux de bord financiers
- **Paramètres** : Configuration de l'entreprise et préférences

### 🎯 Prochaines fonctionnalités
- **Intégration backend** : API REST pour la persistance des données
- **Notifications en temps réel** : WebSocket pour les mises à jour
- **Rapports avancés** : Génération de rapports PDF
- **Synchronisation bancaire** : Import automatique des relevés
- **Multi-entreprises** : Gestion de plusieurs entreprises
- **API publique** : Intégrations tierces

## 🛠️ Technologies utilisées

- **Frontend** : Vue 3 (Composition API) + TypeScript
- **Routing** : Vue Router 4
- **State Management** : Pinia
- **Styling** : Tailwind CSS
- **Icons** : Heroicons
- **Build Tool** : Vite
- **Charts** : Chart.js (à venir)

## 📦 Installation

```bash
# Cloner le repository
git clone [URL_DU_REPO]
cd backoffice

# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev

# Build pour production
npm run build
```

## 🎮 Utilisation

### Identifiants de test
- **Email** : `admin@jeroka.fr`
- **Mot de passe** : `admin123`

### Structure du projet
```
src/
├── components/          # Composants réutilisables
├── layouts/            # Layouts de l'application
├── stores/             # State management (Pinia)
├── views/              # Pages/vues de l'application
│   ├── auth/          # Pages d'authentification
│   ├── clients/       # Gestion des clients
│   ├── invoices/      # Gestion des factures (à venir)
│   └── ...
├── router/            # Configuration des routes
└── style.css          # Styles globaux
```

## 🎨 Design System

### Couleurs principales
- **Primary** : Bleu (#0ea5e9)
- **Secondary** : Violet (#d946ef)
- **Success** : Vert (#22c55e)
- **Warning** : Orange (#f59e0b)
- **Danger** : Rouge (#ef4444)

### Composants CSS personnalisés
- `.btn-primary`, `.btn-secondary`, etc. : Boutons stylisés
- `.card` : Cartes avec ombre et bordures
- `.form-input`, `.form-label` : Éléments de formulaire
- `.badge-*` : Badges de statut
- `.table-*` : Éléments de tableau

## 📱 Responsive Design

L'application est entièrement responsive avec :
- **Mobile First** : Conçue d'abord pour mobile
- **Breakpoints Tailwind** : sm (640px), md (768px), lg (1024px), xl (1280px)
- **Navigation adaptative** : Sidebar collapsible sur mobile
- **Grilles flexibles** : Adaptation automatique du contenu

## 🔒 Sécurité

- **Authentification JWT** : Tokens sécurisés (simulation frontend)
- **Guards de navigation** : Protection des routes
- **Validation des formulaires** : Validation côté client
- **Sanitisation** : Protection contre les injections (à implémenter côté backend)

## 🚀 Déploiement

```bash
# Build de production
npm run build

# Les fichiers sont générés dans le dossier dist/
# Déployer le contenu de dist/ sur votre serveur web
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👥 Équipe

Développé par **Jeroka Xperience** - Spécialistes en transformation digitale pour TPE/PME.

- 🌐 Site web : [www.jeroka.fr](https://www.jeroka.fr)
- 📧 Contact : contact@jeroka.fr
- 📱 Téléphone : +33 6 19 57 69 47

---

## 🗓️ Roadmap

### Phase 1 (Q1 2024) ✅
- [x] Authentification et sécurité
- [x] Interface utilisateur de base
- [x] Gestion des clients
- [x] Dashboard avec statistiques

### Phase 2 (Q2 2024) 🔄
- [ ] Gestion des factures et devis
- [ ] Gestion des produits
- [ ] Système de commandes
- [ ] Intégration backend API

### Phase 3 (Q3 2024) 📋
- [ ] Module comptabilité avancé
- [ ] Rapports et analytics
- [ ] Notifications temps réel
- [ ] App mobile (Progressive Web App)

### Phase 4 (Q4 2024) 🎯
- [ ] Intégrations tierces (banques, comptabilité)
- [ ] Multi-entreprises
- [ ] API publique
- [ ] Marketplace d'extensions


