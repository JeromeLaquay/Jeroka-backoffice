# Section Fournisseurs

## Fonctionnalités (synthèse)

- Liste fournisseurs (`SuppliersView`, `/fournisseurs`).
- Création (`/fournisseurs/create`).

## Scénarios automatisés

| ID | Description | Fichier / test |
|----|-------------|----------------|
| FO1 | Menu → liste Fournisseurs | `fournisseurs.spec.ts` → FO1 |
| FO2 | Lien nouveau fournisseur visible | `fournisseurs.spec.ts` → FO2 |

## Rapport des tests

```bash
cd backoffice
npm run test:e2e -- e2e/sections/fournisseurs
npm run test:e2e:report
```
