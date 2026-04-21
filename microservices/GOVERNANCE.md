# Gouvernance microservices (monorepo)

Ce document fixe les conventions de développement et d'exploitation de la stack microservices.

## Build et versioning

- Artefacts Maven : `microservices/kafka-contracts/`, `microservices/jeroka-jwt-resource/`, `microservices/gateway/`, services domaine, `microservices/email-service/`, workers, `microservices/auth-service/`, etc. Les builds Docker (`context: ..`) installent d’abord les modules locaux requis (`kafka-contracts`, `jeroka-jwt-resource`, …).
- Version par défaut : `1.0.0-SNAPSHOT` ; aligner les releases sur les tags Git (`v1.x.y`) lorsque la CI publiera des images.
- Build local : `mvn -q -B -DskipTests package` dans chaque répertoire contenant un `pom.xml`.

## Secrets

- **Ne jamais** committer de secrets. Variables : `JWT_SECRET`, `INTERNAL_API_KEY`, clés Google/OpenAI via l’environnement ou fichiers `.env` non versionnés.
- Appels **service à service** : en-tête `X-Internal-Api-Key` (dev : valeur partagée documentée uniquement pour l’environnement local).
- OAuth utilisateur : credentials Google stockés dans `jeroka_organization.company_social_credentials` ; le service `email-service` lit via `organization-service` (`GET /api/v1/internal/emails/google-oauth/{userId}` + clé interne).

## Observabilité (cible)

- Logs structurés JSON (à généraliser), corrélation `X-Request-Id` / `correlationId` Kafka.
- Métriques : Actuator + Prometheus (à activer par profil `prod`).
- Traces : OpenTelemetry (hors périmètre immédiat ; prévoir côté gateway).

## CI par artefact

- Workflow GitHub Actions : `.github/workflows/ci-build.yml` — une matrice compile chaque module Maven sur `push` / `pull_request`.

## Routage email-service

- Le worker Kafka appelle directement `email-service` pour `POST .../sync/{jobId}/run`.

## Auth (`auth-service`)

- Base **`jeroka_auth`** (Flyway) : `auth_signing_keys`, `users`, `refresh_tokens`.
- JWT **RS256** + JWKS `/.well-known/jwks.json` ; **login / register / me / profile / change-password / refresh** sont servis par `auth-service` sur la base locale (plus de relay vers le socle historique).
- Variables : `AUTH_DB_*`, `JWT_ACCESS_TTL_MS` ; plus de `JEROKA_CORE_API_BASE_URL` pour l’auth.
- **Données existantes** : après démarrage Postgres + Flyway, exécuter `bash microservices/auth-service/scripts/copy-users-from-dashboard.sh` (depuis la racine du dépôt, avec le compose qui tourne). En cas de conflit de clés, relancer avec `REPLACE_AUTH_USERS=1` pour vider `users` / `refresh_tokens` dans `jeroka_auth` avant la copie (destructif côté auth).

## Kafka — enveloppe et schémas

- Messages : enveloppe `fr.jeroka.contracts.kafka.JerokaKafkaEventEnvelope` (`schemaVersion`, `eventId`, `eventType`, `correlationId`, `data`, …). Voir `microservices/kafka-schemas/README.md` et le module **`kafka-contracts`**.
- Les consumers implémentent **retry + DLT** (topic `*.DLT`) sur le worker email.

## Phase 4 — Découpage du reste (facturation, publications, …)

- **Anti-corruption layer** : le socle historique expose des DTO stables ; les nouveaux services traduisent leur modèle interne.
- **Ordre recommandé** après Email + Auth : facturation / CRM (cohésion métier), puis publications, puis intégrations Google (Drive/Calendar) si la charge l’impose.
- **Données** : une base (ou schéma isolé) par service ; pas de tables partagées en écriture entre services.

## Services livrés dans ce dépôt

| Service | Port local | Rôle |
|--------|---------------|------|
| `gateway` | 3000 | Routage vers les microservices ; CORS centralisé ; **`/api/v1/admin/**`** (hors audit) vers **`organization-service`** ; plus de route internal legacy. |
| `email-service` | 3003 | Domaine email + Postgres `jeroka_email` ; OAuth via `organization-service` (endpoint interne) ; validation JWT HS256 + RS256 (`jeroka-jwt-resource`). |
| `email-events-worker` | (interne) | Kafka → `POST .../emails/sync/{jobId}/run` sur `email-service`. |
| `auth-service` | 3004 | JWKS + JWT RS256 persistés ; comptes `users` dans `jeroka_auth` ; login/register/profil servis localement. |
| `organization-service` | 3005 | JWKS ; **GET/PUT `/api/v1/company`**, **GET `/api/v1/company/social-networks/credentials`**, **`/api/v1/users/**`** (équipe, rôles ADMIN / SUPER_ADMIN), **`/api/v1/settings/**`** (status/tests Google + stubs OAuth), **`/api/v1/companies/**`** et **`/api/v1/admin/**`** (stats, entreprises, utilisateurs admin) sur `jeroka_organization` ; plus de forward legacy. |
| `crm-service` | 3006 | JWKS ; **persons** + **messages** sur `jeroka_crm`. |
| `catalog-service` … `docs-service` | 3007–3011 | Services domaine exposés derrière la gateway ; OAuth2 resource server (JWKS). |
| `audit-service` | 3012 | Kafka → `history_logs` ; API admin `/api/v1/admin/audit`. |
| `dashboard-bff` | 3013 | **`GET /api/v1/dashboard/stats`** : agrégation **WebClient** vers **crm-service** et **billing-service** (`JEROKA_CRM_BASE_URL`, `JEROKA_BILLING_BASE_URL`). |
| `ia-docs-events-worker` | 3016 | Écoute `jeroka.ia.document.requested` (stub log). |

### JWT

- **HS256** (`JWT_SECRET`) : utilisé par `email-service` (compatibilité historique locale).
- **RS256** : `auth-service` ; validation via `JEROKA_AUTH_JWKS_URL` / module `jeroka-jwt-resource` sur les services concernés.
- Rotation : table `auth_signing_keys` (statut `ACTIVE` / futur `RETIRED`, plusieurs `kid`).

## Migration complète (zéro dépendance au socle historique)

Objectif : **zéro dépendance runtime au socle historique**. La stack locale s'exécute via `microservices/docker-compose.yml` avec une base dédiée par domaine (`microservices/postgres-init`).

### Ordre recommandé

1. **Auth** : **fait** — login / register / profil / refresh / change-password sur `auth-service` + script `microservices/auth-service/scripts/copy-users-from-dashboard.sh`. Prochaine évolution : persister les **refresh tokens** en base (table déjà là) si le front les utilise.
2. **Organization** : **fait côté endpoints** — table `companies` + GET/PUT `/api/v1/company` (Flyway V1) ; **`company_social_credentials`** + GET credentials (Flyway V2, stubs autres routes social) ; table **`users`** + **`/api/v1/users/**`** CRUD + stats + toggle statut (Flyway V3, **`companyId` imposé depuis le JWT** à la création ; **ne crée pas** de ligne dans **`auth-service`**) ; **`/api/v1/settings/**`** local pour les besoins du front (`google/status`, `google/test/*`, stubs `google/connect` et callback d’erreur) ; **`/api/v1/companies/**`** local (liste/CRUD admin + toggle statut). Scripts : `copy-companies-from-dashboard.sh`, `copy-company-social-credentials-from-dashboard.sh`, **`copy-org-users-from-dashboard.sh`**.
3. **CRM, catalog, billing, scheduling, content, docs** : même schéma (Flyway par service, code déplacé ou réécrit, plus de forward). **CRM** : **fait** — `persons` + **`messages`** (dont stats, mark-read, brouillon IA stub / `OPENAI_API_KEY`) sur `jeroka_crm` ; scripts `copy-persons-from-dashboard.sh` et `copy-messages-from-dashboard.sh` ; **plus de forward** ni dépendance legacy runtime pour `crm-service`. **Catalog** : **fait** — CRUD + stats + catégories sur **`/api/v1/products`** (`jeroka_catalog`, Flyway V1) ; script `copy-products-from-dashboard.sh` ; **plus de forward** ni dépendance legacy runtime pour `catalog-service`. **Billing** : **fait** — **`quotes`**, **`invoices`** (CRUD, stats, numéros suivants, `mark-paid`) et **`/api/v1/accounting`** sur `jeroka_billing` ; script `copy-billing-from-dashboard.sh` ; **plus de forward** ni dépendance legacy runtime pour `billing-service`. Les `person_id` ne sont pas validés contre `jeroka_crm` (pas d’appel inter-service). **Scheduling** : **fait** — **`/api/v1/appointments`** par **`user_id`** = sujet JWT (`jeroka_scheduling`, Flyway V1) ; script `microservices/scheduling-service/scripts/copy-appointments-from-dashboard.sh` ; **plus de forward** ni dépendance legacy runtime. **Content** : **fait** — **`/api/v1/publications`** en local (`jeroka_content`, Flyway V1, script `copy-publications-from-dashboard.sh`) ; **`/api/v1/announcements`** et **`/api/v1/orders`** en stub (alignés sur le socle historique minimal) ; **plus de forward** ni dépendance legacy runtime. **Docs** : **fait** côté autonomie compose — **`/api/v1/drive`** liste vide / détail 404 et **`/api/v1/documents`** liste vide (pas d’OAuth Google dans ce service ; brancher Drive réel une fois les credentials accessibles depuis ce domaine ou via BFF).
4. **Dashboard BFF** : **fait** — **`GET /api/v1/dashboard/stats`** agrège en parallèle **CRM** (personnes + messages : stats et listes récentes) et **billing** (factures + devis : stats, liste récente, **`/api/v1/invoices/analytics`** pour CA mensuel et comptages par statut) via **WebClient** ; propagation du header **`Authorization`** ; variables **`JEROKA_CRM_BASE_URL`**, **`JEROKA_BILLING_BASE_URL`** ; **plus de forward** ni dépendance legacy runtime pour `dashboard-bff`. **CRM / billing** : champs **`createdThisMonth`** ajoutés aux stats personnes / factures / devis pour coller au dashboard monolithe (côté monolithe, « nouveaux clients du mois » comptait les utilisateurs ; ici = **personnes** créées depuis le 1er du mois UTC).
5. **Admin** : **fait côté gateway** — **`/api/v1/admin/audit/**`** → `audit-service` ; le reste **`/api/v1/admin/**`** (stats, entreprises, utilisateurs) → **`organization-service`** (plus de route admin legacy pour ce préfixe).
6. **Internal** (`/api/v1/internal/**`) : **fait pour l’email OAuth** — `email-service` lit maintenant auprès de `organization-service`.
7. **Gateway** : route internal legacy supprimée ; vérifier qu’aucun chemin `/api/v1/**` utilisé par le front n’est orphelin.

### Vérifications après retrait du runtime legacy

- [x] Aucune variable `JEROKA_CORE_API_BASE_URL` requise au runtime compose.
- [x] `auth-service` autonome pour les comptes ; JWKS inchangé pour les consommateurs.
- [ ] Chaque domaine : tests d’intégration sur sa propre base.
- [x] `email-service` : plus d’appel `GET .../internal/emails/google-oauth/{userId}` vers le socle historique (endpoint servi par `organization-service`).

### Couverture gateway (rappel)

Les préfixes exposés par la gateway doivent couvrir tous les appels du backoffice. **`/api/v1/company`**, **`/api/v1/users`**, **`/api/v1/settings`**, **`/api/v1/companies`** et **`/api/v1/admin/**`** (hors **`/api/v1/admin/audit/**`**, servi par **`audit-service`**) sont servis localement par **`organization-service`**.
