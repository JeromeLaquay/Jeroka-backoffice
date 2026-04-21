# Section Comptabilité

## Fonctionnalités (synthèse)

- Tableaux de bord financiers (`AccountingView`, `/comptabilite`).
- Liste des transactions (`TransactionsView`, `/comptabilite/transactions`).

## Scénarios automatisés

| ID | Description | Fichier / test |
|----|-------------|----------------|
| CP1 | Menu → page Comptabilité | `comptabilite.spec.ts` → CP1 |
| CP2 | Lien « Voir tout » → Transactions | `comptabilite.spec.ts` → CP2 |

## Rapport des tests

```bash
cd backoffice
npm run test:e2e -- e2e/sections/comptabilite
npm run test:e2e:report
```
