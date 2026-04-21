# Section Calendrier

## Fonctionnalités (synthèse)

- Gestion des rendez-vous et disponibilités (`CalendarView`, `/calendrier`).

## Scénarios automatisés

| ID | Description | Fichier / test |
|----|-------------|----------------|
| C1 | Menu → page Calendrier | `calendrier.spec.ts` → C1 |
| C2 | Titre principal visible | `calendrier.spec.ts` → C2 |

## Rapport des tests

```bash
cd backoffice
npm run test:e2e -- e2e/sections/calendrier
npm run test:e2e:report
```
