# Guide pour agents IA (Cursor, Copilot, etc.)

Ce dépôt est un **monorepo** : back-office Vue (`backoffice/`), microservices (`microservices/` : gateway, domaines, `email-service`, workers, `auth-service`, `kafka-contracts`, `jeroka-jwt-resource`, `jeroka-core-forward`), règles Cursor (`.cursor/`).

## Avant de coder
1. Lire les règles **toujours actives** : `.cursor/rules/project-standards.mdc`, `ai-workflow.mdc`, `test-and-fix.mdc` (si la tâche concerne des tests navigateur).
2. Pour le Java : appliquer les conventions Spring du projet (mêmes standards que les services existants).
3. Pour SQL / Flyway : `.cursor/rules/sql.mdc`.
4. Pour le module Emails (Gmail ↔ catégories) : `.cursor/rules/emails-sync.mdc`.

## Environnement local typique
- Front : `http://localhost:3001` (`backoffice`, `npm run dev`).
- **Point d’entrée API** : `http://localhost:3000/api/v1` — **gateway** Spring Cloud (`microservices/gateway`, Docker `:3000`). Variable `VITE_API_URL` / défaut dev dans `backoffice/src/services/api.ts`.
- Emails : **`email-service`** (`http://localhost:3003`) ; OAuth credentials lus via endpoint interne de `organization-service` ; conventions dans `microservices/GOVERNANCE.md`.
- **`dashboard-bff`** (`:3013`) : **`/api/v1/dashboard/stats`** agrège CRM + billing en parallèle (WebClient) ; `JEROKA_CRM_BASE_URL`, `JEROKA_BILLING_BASE_URL`, `JEROKA_AUTH_JWKS_URL` (voir `microservices/GOVERNANCE.md`).
- Compose (`microservices/docker-compose.yml`) : Postgres **unique** multi-bases (`microservices/postgres-init/`), Kafka, gateway, microservices domaine, `email-service`, workers, **`auth-service`** (`:3004`, JWT RS256 + JWKS, comptes dans `jeroka_auth` ; copie utilisateurs : `microservices/auth-service/scripts/copy-users-from-dashboard.sh`), **`ia-docs-events-worker`** (`:3016`).

## Outils MCP (projet)
Configuration : `.cursor/mcp.json` (playwright, fetch, postgres, git, filesystem).  
**Toujours** vérifier le schéma d’un outil MCP avant de l’appeler.

## Tests
- **Demande explicite « tester / tester et corriger »** : Playwright via MCP, pas un sous-agent navigateur inexistant — voir `test-and-fix.mdc` (API via gateway `:3000` si le front est configuré ainsi).
- **Suite E2E** (`npm run test:e2e` dans `backoffice/`) : voir `backoffice/e2e/README.md` et `.env.e2e.local`.

## Style de contribution
- Français (commentaires, messages).
- Méthodes courtes (≤ 30 lignes), ≤ 3 paramètres (sinon DTO / record).
- Diff minimal, pas de refactor gratuit hors périmètre.

## Prompts réutilisables
Fichiers dans `.cursor/prompts/` — utilisation dans le chat : `@nom-du-fichier` (sans extension).

## Décommissionnement legacy
Pour le suivi de migration et le retrait des reliquats legacy, suivre la checklist dans `microservices/GOVERNANCE.md`.
