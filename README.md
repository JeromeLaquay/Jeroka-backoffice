# Jeroka Back-Office

Back-office de gestion pour TPE/PME — Jeroka Xperience.

## Stack technique

| Composant | Technologies |
|-----------|-------------|
| **Frontend** | Vue.js 3, TypeScript, Vite, Tailwind CSS, Pinia |
| **API** | Spring Boot 3.4, Java 21, JWT, Spring Security, AOP |
| **Base de données** | PostgreSQL (migrations Flyway) |
| **Déploiement** | Docker, Docker Compose, GitHub Actions (CI/CD SSH) |
| **Tests** | Cypress (E2E), Playwright (MCP) |

## Structure du projet

```
back-office/
├── backoffice/        # Frontend Vue.js 3 (SPA)
├── microservices/     # API microservices Spring Boot (Java 21)
└── .github/workflows/ # CI/CD GitHub Actions
```

---

## Fonctionnalités

### Dashboard
- Statistiques globales : clients, messages, factures, devis
- Activité récente : messages non lus, dernières factures, nouveaux clients
- Indicateurs mensuels/hebdomadaires

### Gestion des clients
- Liste filtrée et paginée (search, statut, type)
- Fiche client détaillée (coordonnées, historique)
- Création, modification, suppression
- Export et import
- Gestion des fournisseurs (même module)

### Messages de contact
- Réception et gestion des messages entrants (formulaire web)
- Filtres : type (devis, information, partenariat), statut (lu/non lu), date
- Marquage lu / non lu, réponse par email
- Génération de brouillon de réponse via IA (OpenAI / Claude)
- Conversion d'un message en devis

### Publications (réseaux sociaux)
- Création et planification de publications
- Diffusion multi-plateformes : Facebook, LinkedIn, Twitter
- Statut de publication (brouillon, programmé, publié)

### Factures
- Création de factures avec lignes de produits, TVA, remises
- Numérotation automatique (format FAC-YYYY-NNNN)
- Statuts : brouillon → envoyée → payée / en retard
- Marquage comme payée
- Détail complet et historique

### Devis
- Création de devis liés à des clients et des produits
- Numérotation automatique (format DV-YYYY-NNNN)
- Statuts : brouillon → envoyé → accepté / refusé / expiré
- Conversion d'un devis en facture

### Produits & Catalogue
- Gestion du catalogue produits/services
- Catégories, prix HT, taux TVA, unité, stock
- Statistiques produits

### Commandes
- Gestion des commandes (création, suivi, détail)

### Fournisseurs
- Annuaire fournisseurs (coordonnées, SIRET, TVA)
- Historique des échanges

### Comptabilité
- Tableau de bord financier : chiffre d'affaires, dépenses, bénéfice net, TVA due
- Liste des transactions récentes dérivées des factures
- Actions rapides : rapports TVA, compte de résultat, flux de trésorerie
- Import / export de données comptables

### Calendrier & Rendez-vous
- Gestion des créneaux de disponibilité
- Liste et filtrage des rendez-vous (statut, date, période)
- Intégration Google Calendar (vue embarquée)
- Génération de créneaux via IA

### Emails (Google Workspace)
- Synchronisation Gmail via OAuth2 Google
- Lecture et catégorisation des emails
- Gestion des expéditeurs et catégories

### Documents (Google Drive)
- Accès à Google Drive depuis le back-office
- Liste, téléchargement et upload de fichiers
- Analyse de documents par IA (factures, devis, etc.)

### Annonces
- Gestion des annonces internes ou publiables

### Paramètres
- **Profil** : modification prénom, nom, téléphone, avatar
- **Entreprise** : raison sociale, SIRET, TVA, adresse, logo
- **Système** : intégrations Meta (Facebook/Instagram), LinkedIn, Twitter, Google
- **Sécurité** : changement de mot de passe
- **Sauvegardes** : création et restauration
- **Intégrations** : configuration des APIs tierces
- **Développement** : basculer entre API locale et production

### Administration (rôle admin)
- Dashboard super-admin (stats globales multi-sociétés)
- Gestion des entreprises (CRUD)
- Gestion des utilisateurs (CRUD, activation/désactivation, rôles)

---

## Lancement en développement

### Prérequis

- Node.js 20+
- JDK 21+, Maven 3.9+
- Docker Desktop

### Frontend

```bash
cd backoffice
npm install
npm run dev          # http://localhost:3001
```

### API microservices + PostgreSQL (Docker)

```bash
docker compose -f microservices/docker-compose.yml up -d --build
# API (gateway) : http://localhost:3000/api/v1
# Health gateway : http://localhost:3000/actuator/health
```

> Recommande pour une init propre des BDD : `down -v` puis `up -d --build` (bases recreees par `postgres-init`, schema cree par Flyway au demarrage des services).

### Variables d'environnement API

Créer `.env` à la racine (utilisé par `microservices/docker-compose.yml`) à partir des variables suivantes :

| Variable | Description |
|----------|-------------|
| `DB_PASSWORD` | Mot de passe PostgreSQL |
| `JWT_SECRET` | Secret JWT (min. 32 caractères) |
| `GOOGLE_CLIENT_ID` | OAuth2 Google Client ID |
| `GOOGLE_CLIENT_SECRET` | OAuth2 Google Client Secret |
| `OPENAI_API_KEY` | Clé OpenAI (IA) |
| `ANTHROPIC_API_KEY` | Clé Anthropic/Claude (IA) |
| `CORS_ORIGINS` | Origines autorisées (ex. `http://localhost:3001`) |

## CI/CD

Déploiement automatique sur push `main` via `.github/workflows/deploy.yml` :
1. Connexion SSH au serveur cible
2. `git pull` + `docker compose -f docker-compose.prod.yml up -d --build`
3. Exécution des tests Cypress contre les URLs de production

Secrets GitHub requis : `SERVER_SSH_KEY`, `SERVER_HOST`, `SERVER_USER`, `SERVER_PROJECT_PATH`, `TOKEN_GITHUB`.

---

## Architecture API

```
Controller → MappingService → Service → Repository → PostgreSQL
```

- **Controller** : validation des entrées, délègue au MappingService
- **MappingService** : conversion DTO ↔ entités, orchestration
- **Service** : logique métier, `@Transactional`
- **Repository** : accès données JPA

Voir [`microservices/README.md`](microservices/README.md) pour le détail des services, endpoints et conventions.
