# Section Publications

## Fonctionnalités (synthèse)

- Gestion des publications (réseaux, statuts, filtres) (`PublicationsView`, `/publications`).
- Création et génération IA de contenus.

## Scénarios automatisés

| ID | Description | Fichier / test |
|----|-------------|----------------|
| P1 | Menu → page Publications | `publications.spec.ts` → P1 |
| P2 | Bouton créer publication visible | `publications.spec.ts` → P2 |

## Rapport des tests

```bash
cd backoffice
npm run test:e2e -- e2e/sections/publications
npm run test:e2e:report
```
