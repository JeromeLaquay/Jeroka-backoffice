# Section Devis

## Fonctionnalités (synthèse)

- Liste des devis (`QuotesView`, `/devis`).
- Création (`/devis/create`).

## Scénarios automatisés

| ID | Description | Fichier / test |
|----|-------------|----------------|
| DV1 | Menu → liste Devis | `devis.spec.ts` → DV1 |
| DV2 | Lien nouveau devis visible | `devis.spec.ts` → DV2 |

## Rapport des tests

```bash
cd backoffice
npm run test:e2e -- e2e/sections/devis
npm run test:e2e:report
```
