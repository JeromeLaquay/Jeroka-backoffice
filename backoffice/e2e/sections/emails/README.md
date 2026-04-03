# Section Emails

## Fonctionnalités (synthèse)

- Gestion des emails, catégories, sync Gmail (`EmailsView`, `/emails`).
- Voir règle projet `.cursor/rules/emails-sync.mdc` pour le domaine métier.

## Scénarios automatisés

| ID | Description | Fichier / test |
|----|-------------|----------------|
| E1 | Menu → page Emails | `emails.spec.ts` → E1 |
| E2 | Bouton synchroniser visible | `emails.spec.ts` → E2 |

## Rapport des tests

```bash
cd backoffice
npm run test:e2e -- e2e/sections/emails
npm run test:e2e:report
```
