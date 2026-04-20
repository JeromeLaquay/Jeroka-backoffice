# Microservices (découplage par domaine)

Voir **`GOVERNANCE.md`** (conventions, CI, ports, Kafka).

## Socle partagé
- **`kafka-contracts`** : enveloppe d’événements (`eventId`), topics par domaine, payloads email, outbox, utilitaires consommateur.
- **`jeroka-jwt-resource`** : auto-config Spring — `JwtDecoder` JWKS si `jeroka.auth.jwks-url` (ou `JEROKA_AUTH_JWKS_URL` selon binding) est défini.
- **`jeroka-core-forward`** : module legacy de proxy vers le socle historique, conservé pour archivage (non utilisé dans la stack runtime actuelle).

## Services
- **`gateway`** : Spring Cloud Gateway, port **3000** — seul point d’entrée prévu pour le front (`VITE_API_URL`) ; **`/api/v1/admin/audit/**`** → `audit-service`, le reste de **`/api/v1/admin/**`** → `organization-service` ; plus de route **`/api/v1/internal/**`** vers le socle historique.
- **`auth-service`** : **3004** — Flyway `jeroka_auth`, clés RSA persistées, JWKS, **comptes utilisateurs locaux** (login/register/profil/refresh) + **accessToken RS256** ; migration données : `scripts/copy-users-from-dashboard.sh`.
- **`organization-service`** : base **`jeroka_organization`** (Flyway) ; **GET/PUT `/api/v1/company`**, **GET `/api/v1/company/social-networks/credentials`**, **`/api/v1/users/**`**, **`/api/v1/settings/**`** (status/tests Google + stubs OAuth), **`/api/v1/companies/**`**, **`/api/v1/admin/**`** (stats, entreprises, utilisateurs admin, hors audit), et endpoint interne **`GET /api/v1/internal/emails/google-oauth/{userId}`** (clé `X-Internal-Api-Key`) consommé par `email-service` ; scripts `copy-companies-from-dashboard.sh`, `copy-company-social-credentials-from-dashboard.sh`, **`copy-org-users-from-dashboard.sh`**.
- **`crm-service`** : base **`jeroka_crm`** ; **persons** + **messages** en local ; scripts `scripts/copy-persons-from-dashboard.sh` et `scripts/copy-messages-from-dashboard.sh` ; plus de proxy vers le socle historique.
- **`catalog-service`** : base **`jeroka_catalog`** ; **produits** (`/api/v1/products`) en local ; script `scripts/copy-products-from-dashboard.sh` ; plus de proxy vers le socle historique.
- **`billing-service`** : base **`jeroka_billing`** ; **devis**, **factures**, **comptabilité** (`/api/v1/quotes`, `/api/v1/invoices`, `/api/v1/accounting`) en local ; script `scripts/copy-billing-from-dashboard.sh` ; plus de proxy vers le socle historique.
- **`scheduling-service`** : base **`jeroka_scheduling`** ; **`/api/v1/appointments`** (par utilisateur JWT) ; script `scripts/copy-appointments-from-dashboard.sh`.
- **`content-service`** : base **`jeroka_content`** ; **`/api/v1/publications`** en local ; annonces + commandes en stub (comme le socle historique minimal) ; script `scripts/copy-publications-from-dashboard.sh`.
- **`docs-service`** : **`/api/v1/drive`** et **`/api/v1/documents`** en stub (liste vide / 404) en attendant OAuth Google dans ce domaine.
- **`email-service`** : **3003**, base **`jeroka_email`** (même instance Postgres que le dev compose).
- **`dashboard-bff`** : **3013**, agrège **`/api/v1/dashboard/stats`** via **WebClient** vers **crm-service** et **billing-service** (`JEROKA_CRM_BASE_URL`, `JEROKA_BILLING_BASE_URL`).
- **`audit-service`** : **3012**, consommateur Kafka → `history_logs` (`jeroka_audit`), API admin `/api/v1/admin/audit`.
- **`email-events-worker`**, **`ia-docs-events-worker`** : workers Kafka.

## Docker
`microservices/docker-compose.yml` (contexte build = **racine du monorepo**) : Postgres unique + script `microservices/postgres-init/`, Kafka, gateway, tous les services ci-dessus, Adminer.

### Mode recommandé : init automatique via Flyway

- Démarrage standard :
  ```bash
  docker compose -f microservices/docker-compose.yml down -v
  docker compose -f microservices/docker-compose.yml up -d --build
  ```
- Script prêt à l'emploi :
  - PowerShell : `.\microservices\scripts\start-back-and-db.ps1`
  - Bash : `bash microservices/scripts/start-back-and-db.sh`
  - Reset propre : ajouter `--fresh`
- `postgres-init` crée les bases `jeroka_*`.
- Chaque microservice applique ensuite ses migrations Flyway (`classpath:db/migration`) au démarrage.
- Ce mode suffit pour obtenir une base prête côté structure (tables/index).

### Mode optionnel : scripts SQL manuels

- Utiliser `microservices/sql/` seulement si tu veux piloter explicitement :
  - l'initialisation SQL,
  - la migration des données depuis `jeroka_dashboard`,
  - un seed de démo.
- Voir `microservices/sql/README.md`.

**Ports** : gateway **3000**, email **3003**, auth **3004**, organization **3005**, crm **3006**, catalog **3007**, billing **3008**, scheduling **3009**, content **3010**, docs **3011**, audit **3012**, dashboard-bff **3013**, worker IA/docs **3016**, Adminer **8080**.
