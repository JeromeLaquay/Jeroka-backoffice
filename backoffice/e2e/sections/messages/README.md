# Section Messages

## Fonctionnalités (synthèse)

- Liste / gestion des messages (`MessagesView`, `/messages`).
- Action « tout marquer comme lu » (`mark-all-read-button`).

## Scénarios automatisés

| ID | Description | Fichier / test |
|----|-------------|----------------|
| M1 | Menu → page Messages | `messages.spec.ts` → M1 |
| M2 | Bouton marquer tout lu visible | `messages.spec.ts` → M2 |

## Rapport des tests

```bash
cd backoffice
npm run test:e2e -- e2e/sections/messages
npm run test:e2e:report
```
