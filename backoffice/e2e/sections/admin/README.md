# Section Admin

## Fonctionnalités (synthèse)

- Tableau de bord admin (`AdminDashboard`, `/admin`).
- Gestion sociétés (`/admin/companies`) et utilisateurs (`/admin/users`).
- Visible uniquement pour les comptes **admin** (menu **Admin**).

## Scénarios automatisés

| ID | Description | Fichier / test |
|----|-------------|----------------|
| AD1 | Menu Admin → dashboard (skip si non admin) | `admin.spec.ts` → AD1 |
| AD2 | Boutons gestion sociétés / utilisateurs (skip si non admin) | `admin.spec.ts` → AD2 |

## Rapport des tests

```bash
cd backoffice
npm run test:e2e -- e2e/sections/admin
npm run test:e2e:report
```

Si l’utilisateur E2E n’est pas admin, les tests **AD1** et **AD2** sont marqués **skipped** dans le rapport Playwright.
