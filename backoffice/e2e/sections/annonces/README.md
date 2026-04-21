# Section Annonces

## Fonctionnalités (synthèse)

- Communication des nouveautés produit (`AnnouncementsView`, `/annonces`).

## Scénarios automatisés

| ID | Description | Fichier / test |
|----|-------------|----------------|
| AN1 | Menu → page Annonces | `annonces.spec.ts` → AN1 |
| AN2 | Bouton nouvelle annonce visible | `annonces.spec.ts` → AN2 |

## Rapport des tests

```bash
cd backoffice
npm run test:e2e -- e2e/sections/annonces
npm run test:e2e:report
```
