# Tests E2E Playwright (backoffice)

## Prérequis

1. **Variables d’environnement** : copier [`.env.e2e.example`](../.env.e2e.example) vers `.env.e2e.local` à la racine du dossier `backoffice/` et renseigner **`PLAYWRIGHT_EMAIL` et `PLAYWRIGHT_PASSWORD` avec des valeurs non vides** (compte valide sur l’API). Les fichiers sont chargés par [`e2e/load-e2e-env.ts`](./load-e2e-env.ts) dans `playwright.config.ts` **et** dans `global-setup.ts` (processus séparé).
2. **API** : l’application s’appuie sur le backend ; pour un scénario complet, démarrer la stack `microservices` (Docker) si nécessaire.
3. Le **serveur Vite** est démarré automatiquement par Playwright (`npm run dev`) sauf s’il tourne déjà (`reuseExistingServer` hors CI).

## Commandes

| Commande | Description |
|----------|-------------|
| `npm run test:e2e` | Toute la suite |
| `npm run test:e2e -- e2e/sections/clients` | Une section (dossier) |
| `npm run test:e2e -- e2e/sections/clients/clients.spec.ts` | Un fichier |
| `npm run test:e2e:ui` | Mode UI interactif |
| `npm run test:e2e:report` | Ouvrir le dernier rapport HTML |

## Rapports et artefacts

- **Rapport HTML** : généré dans `playwright-report/` après un run (non versionné).
- **Traces / captures** : `test-results/` en cas d’échec ou retry (non versionné).
- **Session authentifiée** : `e2e/.auth/user.json` généré par `global-setup.ts` (non versionné).

## Structure

Chaque entrée du menu (et l’auth hors session) a un dossier sous [`e2e/sections/`](./sections/) avec :

- `README.md` — fonctionnalités métier + tableau des scénarios + comment relancer les tests.
- `*.spec.ts` — scénarios Playwright (niveau moyen : navigation + 1–2 actions).

## Documentation par section

| Section | Dossier |
|---------|---------|
| Authentification | [sections/auth](./sections/auth/) |
| Dashboard | [sections/dashboard](./sections/dashboard/) |
| Messages | [sections/messages](./sections/messages/) |
| Calendrier | [sections/calendrier](./sections/calendrier/) |
| Publications | [sections/publications](./sections/publications/) |
| Clients | [sections/clients](./sections/clients/) |
| Factures | [sections/factures](./sections/factures/) |
| Devis | [sections/devis](./sections/devis/) |
| Produits | [sections/produits](./sections/produits/) |
| Documents | [sections/documents](./sections/documents/) |
| Commandes | [sections/commandes](./sections/commandes/) |
| Fournisseurs | [sections/fournisseurs](./sections/fournisseurs/) |
| Emails | [sections/emails](./sections/emails/) |
| Comptabilité | [sections/comptabilite](./sections/comptabilite/) |
| Paramètres | [sections/parametres](./sections/parametres/) |
| Annonces | [sections/annonces](./sections/annonces/) |
| Admin | [sections/admin](./sections/admin/) |

## Sélecteurs

Les tests utilisent `data-cy` (voir `testIdAttribute` dans `playwright.config.ts`), aligné sur le backoffice Vue.
