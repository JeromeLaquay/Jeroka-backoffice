# Section Authentification

## Fonctionnalités (synthèse)

- Connexion email / mot de passe (`LoginView`, route `/login`).
- Inscription (`RegisterView`, route `/register`).
- Ces tests **n’utilisent pas** le fichier `e2e/.auth/user.json` : contexte vierge pour valider les pages publiques.

## Scénarios automatisés

| ID | Description | Fichier / test |
|----|-------------|----------------|
| A1 | Page de connexion et champs principaux | `auth.spec.ts` → A1 |
| A2 | Navigation login → inscription | `auth.spec.ts` → A2 |
| A3 | Page inscription et bouton d’envoi | `auth.spec.ts` → A3 |

## Rapport des tests

```bash
cd backoffice
npm run test:e2e -- e2e/sections/auth
npm run test:e2e:report
```

Le `global-setup` exécute quand même un login pour générer la session des **autres** sections ; les tests ci-dessus restent isolés via `storageState` vide.
