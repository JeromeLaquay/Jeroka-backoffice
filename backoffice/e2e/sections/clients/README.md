# Section Clients

## Fonctionnalités (synthèse)

- Liste clients, recherche, statistiques (`ClientsView`, `/clients`).
- Création client (`/clients/create`).

## Scénarios automatisés

| ID | Description | Fichier / test |
|----|-------------|----------------|
| CL1 | Menu → liste Clients | `clients.spec.ts` → CL1 |
| CL2 | Bouton « Nouveau Client » visible | `clients.spec.ts` → CL2 |

## Rapport des tests

```bash
cd backoffice
npm run test:e2e -- e2e/sections/clients
npm run test:e2e:report
```
