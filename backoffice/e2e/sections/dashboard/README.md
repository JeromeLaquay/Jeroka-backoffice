# Section Dashboard

## Fonctionnalités (synthèse)

- Tableau de bord après connexion : message de bienvenue, statistiques d’activité (`DashboardView`).
- Accès depuis le menu **Dashboard** (`/`).

## Scénarios automatisés

| ID | Description | Fichier / test |
|----|-------------|----------------|
| D1 | Accès via le menu latéral, page dashboard visible | `dashboard.spec.ts` → D1 |
| D2 | Titre de bienvenue affiché | `dashboard.spec.ts` → D2 |

## Rapport des tests

1. Lancer uniquement cette section :

   ```bash
   cd backoffice
   npm run test:e2e -- e2e/sections/dashboard
   ```

2. Ouvrir le rapport HTML :

   ```bash
   npm run test:e2e:report
   ```

Les traces et captures d’échec sont sous `test-results/`. La vérité à jour des derniers runs est dans le rapport Playwright (dossier `playwright-report/`).
