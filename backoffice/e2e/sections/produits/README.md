# Section Produits

## Fonctionnalités (synthèse)

- Catalogue produits / services (`ProductsView`, `/produits`).
- Import et création.

## Scénarios automatisés

| ID | Description | Fichier / test |
|----|-------------|----------------|
| PR1 | Menu → liste Produits | `produits.spec.ts` → PR1 |
| PR2 | Bouton nouveau produit visible | `produits.spec.ts` → PR2 |

## Rapport des tests

```bash
cd backoffice
npm run test:e2e -- e2e/sections/produits
npm run test:e2e:report
```
