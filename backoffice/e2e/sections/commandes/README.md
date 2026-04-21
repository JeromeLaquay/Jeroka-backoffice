# Section Commandes

## Fonctionnalités (synthèse)

- Liste des commandes (`OrdersView`, `/commandes`).
- Création (`/commandes/create`).

## Scénarios automatisés

| ID | Description | Fichier / test |
|----|-------------|----------------|
| CO1 | Menu → liste Commandes | `commandes.spec.ts` → CO1 |
| CO2 | Lien nouvelle commande visible | `commandes.spec.ts` → CO2 |

## Rapport des tests

```bash
cd backoffice
npm run test:e2e -- e2e/sections/commandes
npm run test:e2e:report
```
