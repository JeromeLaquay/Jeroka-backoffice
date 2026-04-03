# Section Paramètres

## Fonctionnalités (synthèse)

- Paramètres utilisateur, entreprise, système, sécurité, etc. (`SettingsView`, `/parametres`).

## Scénarios automatisés

| ID | Description | Fichier / test |
|----|-------------|----------------|
| PA1 | Menu → page Paramètres | `parametres.spec.ts` → PA1 |
| PA2 | Changement d’onglet (Entreprise) | `parametres.spec.ts` → PA2 |

## Rapport des tests

```bash
cd backoffice
npm run test:e2e -- e2e/sections/parametres
npm run test:e2e:report
```
