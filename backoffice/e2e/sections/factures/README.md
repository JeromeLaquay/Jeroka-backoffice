# Section Factures

## Fonctionnalités (synthèse)

- Liste et filtres des factures (`InvoicesView`, `/factures`).
- Création (`/factures/create`).

## Scénarios automatisés

| ID | Description | Fichier / test |
|----|-------------|----------------|
| F1 | Menu → liste Factures | `factures.spec.ts` → F1 |
| F2 | Lien création facture visible | `factures.spec.ts` → F2 |

## Rapport des tests

```bash
cd backoffice
npm run test:e2e -- e2e/sections/factures
npm run test:e2e:report
```
