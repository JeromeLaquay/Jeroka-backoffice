# Section Documents

## Fonctionnalités (synthèse)

- Explorateur Google Drive intégré (`DriveView`, `/documents`).

## Scénarios automatisés

| ID | Description | Fichier / test |
|----|-------------|----------------|
| DO1 | Menu → page Documents | `documents.spec.ts` → DO1 |
| DO2 | Bouton Rafraîchir visible | `documents.spec.ts` → DO2 |

## Rapport des tests

```bash
cd backoffice
npm run test:e2e -- e2e/sections/documents
npm run test:e2e:report
```
