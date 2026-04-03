# Guide pour agents IA (Cursor, Copilot, etc.)

Ce dépôt est un **monorepo** : back-office Vue (`backoffice/`), API Spring Boot (`api-java/`), règles Cursor (`.cursor/`).

## Avant de coder
1. Lire les règles **toujours actives** : `.cursor/rules/project-standards.mdc`, `ai-workflow.mdc`, `test-and-fix.mdc` (si la tâche concerne des tests navigateur).
2. Pour le Java : `.cursor/rules/java-spring.mdc` (globs `api-java/**`).
3. Pour SQL / Flyway : `.cursor/rules/sql.mdc`.
4. Pour le module Emails (Gmail ↔ catégories) : `.cursor/rules/emails-sync.mdc`.

## Environnement local typique
- Front : `http://localhost:3001` (`backoffice`, `npm run dev`).
- API : `http://localhost:3002/api/v1` (`api-java` via Docker — voir `java-spring.mdc` pour redémarrer).

## Outils MCP (projet)
Configuration : `.cursor/mcp.json` (playwright, fetch, postgres, git, filesystem).  
**Toujours** vérifier le schéma d’un outil MCP avant de l’appeler.

## Tests
- **Demande explicite « tester / tester et corriger »** : Playwright via MCP, pas un sous-agent navigateur inexistant — voir `test-and-fix.mdc`.
- **Suite E2E** (`npm run test:e2e` dans `backoffice/`) : voir `backoffice/e2e/README.md` et `.env.e2e.local`.

## Style de contribution
- Français (commentaires, messages).
- Méthodes courtes (≤ 30 lignes), ≤ 3 paramètres (sinon DTO / record).
- Diff minimal, pas de refactor gratuit hors périmètre.

## Prompts réutilisables
Fichiers dans `.cursor/prompts/` — utilisation dans le chat : `@nom-du-fichier` (sans extension).
