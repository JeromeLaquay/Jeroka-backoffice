# Jeroka API Dashboard

API backend complète pour le système de gestion d'entreprise Jeroka, développée avec Node.js, Express, TypeScript et PostgreSQL.

## 🚀 Fonctionnalités

### 🔐 Authentification & Sécurité
- **JWT** avec refresh tokens
- **Validation** robuste avec Joi
- **Rate limiting** et protection CORS
- **Middleware de sécurité** avec Helmet
- **Gestion des erreurs** centralisée
- **Logging** complet avec Winston

### 📊 Modules Métier
- **👥 Utilisateurs** - Gestion des comptes et profils
- **📧 Messages** - Formulaires de contact et communication
- **🤝 Clients** - CRM complet (particuliers/entreprises)
- **📱 Publications** - Gestion multi-plateformes (Facebook, Instagram, LinkedIn, site web)
- **📦 Produits** - Catalogue avec stock et tarification
- **📄 Devis** - Création et suivi des propositions commerciales
- **🧾 Factures** - Facturation avec calculs automatiques
- **📈 Dashboard** - Statistiques et KPIs en temps réel

### 🗄️ Base de Données
- **PostgreSQL** avec schéma complet
- **Migrations** automatisées
- **Fonctions** et **triggers** SQL
- **Vues** pour les statistiques
- **Contraintes** et validation au niveau DB

## 📋 Prérequis

- **Node.js** >= 18.0.0
- **PostgreSQL** >= 13
- **npm** ou **yarn**

## 🛠️ Installation

```bash
# Cloner le projet
cd api-dashboard

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos paramètres

# Créer la base de données PostgreSQL
createdb jeroka_dashboard

# Exécuter les migrations
npm run migrate

# Insérer des données de test (optionnel)
npm run seed
```

## ⚙️ Configuration

### Variables d'environnement (.env)

```env
# Environment
NODE_ENV=development
PORT=3002

# Database PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=jeroka_dashboard
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_REFRESH_EXPIRES_IN=30d

# CORS
FRONTEND_URL=http://localhost:3000
BACKOFFICE_URL=http://localhost:3001

# Email (pour notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

## 🚀 Démarrage

```bash
# Développement avec hot-reload
npm run dev

# Production
npm run build
npm start

# Tests
npm test

# Linting
npm run lint
```

## 📡 API Endpoints

### 🔐 Authentification (`/api/v1/auth`)
```
POST   /register          - Inscription
POST   /login             - Connexion
POST   /refresh           - Renouveler le token
POST   /logout            - Déconnexion
GET    /profile           - Profil utilisateur
PUT    /profile           - Modifier le profil
PUT    /change-password   - Changer le mot de passe
```

### 📧 Messages (`/api/v1/messages`)
```
GET    /                  - Lister les messages
POST   /                  - Créer un message
GET    /:id               - Détail d'un message
PUT    /:id               - Modifier un message
DELETE /:id               - Supprimer un message
PUT    /:id/status        - Changer le statut
```

### 🤝 Clients (`/api/v1/clients`)
```
GET    /                  - Lister les clients
POST   /                  - Créer un client
GET    /:id               - Détail d'un client
PUT    /:id               - Modifier un client
DELETE /:id               - Supprimer un client
```

### 📱 Publications (`/api/v1/publications`)
```
GET    /                  - Lister les publications
POST   /                  - Créer une publication
GET    /:id               - Détail d'une publication
PUT    /:id               - Modifier une publication
DELETE /:id               - Supprimer une publication
POST   /:id/publish       - Publier sur les réseaux
```

### 📊 Dashboard (`/api/v1/dashboard`)
```
GET    /stats             - Statistiques générales
GET    /recent-activity   - Activité récente
```

## 🗄️ Schéma de Base de Données

### Tables Principales
- **`users`** - Utilisateurs du système
- **`clients`** - Base clients (particuliers/entreprises)
- **`contact_messages`** - Messages du formulaire de contact
- **`publications`** - Articles et posts réseaux sociaux
- **`publication_platforms`** - Diffusion multi-plateformes
- **`products`** - Catalogue produits
- **`quotes`** - Devis avec items
- **`invoices`** - Factures avec items
- **`refresh_tokens`** - Tokens de rafraîchissement

### Fonctionnalités Avancées
- **Triggers** pour `updated_at` automatique
- **Fonctions** pour génération des numéros
- **Colonnes calculées** pour les totaux
- **Index** optimisés pour les performances
- **Vue** `dashboard_stats` pour les KPIs

## 🔒 Sécurité

### Authentification
- **JWT** avec expiration configurable
- **Refresh tokens** stockés en base avec révocation
- **Cookies sécurisés** (HttpOnly, Secure, SameSite)
- **Validation** des permissions par rôle

### Protection
- **Rate limiting** par IP
- **Validation** stricte des données avec Joi
- **Sanitisation** des entrées
- **Headers de sécurité** avec Helmet
- **CORS** configuré pour les domaines autorisés

### Logging & Monitoring
- **Winston** pour les logs structurés
- **Logs de sécurité** (tentatives de connexion, etc.)
- **Métriques** de performance des requêtes
- **Gestion d'erreurs** centralisée

## 📈 Performance

- **Connexions** PostgreSQL poolées
- **Compression** gzip des réponses
- **Cache** des requêtes fréquentes (à implémenter)
- **Index** optimisés sur les colonnes critiques
- **Pagination** pour les listes importantes

## 🧪 Tests

```bash
# Tests unitaires
npm test

# Tests d'intégration
npm run test:integration

# Coverage
npm run test:coverage
```

## 📝 Logs

Les logs sont organisés par niveau :
- **Error** - Erreurs système et exceptions
- **Warn** - Avertissements et erreurs client
- **Info** - Informations générales et événements
- **Debug** - Informations de débogage (dev uniquement)

Fichiers de logs (production) :
- `logs/error.log` - Erreurs uniquement
- `logs/combined.log` - Tous les logs
- `logs/exceptions.log` - Exceptions non gérées

## 🔄 Intégrations Futures

### Réseaux Sociaux
- **Facebook Graph API** - Publication automatique
- **Instagram Basic Display API** - Posts et stories
- **LinkedIn API** - Articles et posts entreprise

### Paiements
- **Stripe** - Paiements en ligne
- **PayPal** - Alternative de paiement

### Email & SMS
- **Nodemailer** - Envoi d'emails transactionnels
- **Twilio** - Notifications SMS

### Stockage
- **AWS S3** / **Cloudinary** - Stockage d'images
- **CDN** - Distribution de contenu

## 📚 Documentation API

Une documentation Swagger/OpenAPI est prévue pour documenter tous les endpoints avec :
- **Schémas** de requête/réponse
- **Exemples** d'utilisation
- **Codes d'erreur** détaillés
- **Authentification** requise

## 👥 Contributeurs

- **Jeroka Team** - Développement principal

## 📄 Licence

MIT License - Voir le fichier LICENSE pour plus de détails.

---

🚀 **API prête pour la production avec toutes les fonctionnalités essentielles d'un backoffice complet !**


