# Tests Cypress - Jeroka Backoffice

Ce projet contient les tests end-to-end (E2E) pour le backoffice Jeroka utilisant Cypress.

## 🚀 Installation

```bash
# Installer les dépendances
npm install

# Ou avec yarn
yarn install
```

## 🧪 Exécution des tests

### Tests en mode interactif
```bash
# Ouvrir l'interface Cypress
npm run cypress:open

# Ou directement
npx cypress open
```

### Tests en mode headless
```bash
# Exécuter tous les tests
npm run test

# Exécuter sur un navigateur spécifique
npm run test:chrome
npm run test:firefox
npm run test:edge

# Exécuter avec interface graphique
npm run test:headed
```

### Tests avec configuration CI
```bash
# Configuration complète pour CI
npm run test:ci

# Tests CI par navigateur
npm run test:ci:chrome
npm run test:ci:firefox
npm run test:ci:edge
```

## 📁 Structure du projet

```
cypress/
├── cypress/
│   ├── e2e/                    # Tests end-to-end
│   │   ├── 01-basic-setup.cy.ts      # Tests de validation du setup
│   │   ├── 02-backoffice-basic.cy.ts # Tests basiques du backoffice
│   │   ├── 03-backoffice-auth.cy.ts  # Tests d'authentification
│   │   ├── 04-backoffice-dashboard.cy.ts # Tests du dashboard
│   │   └── 05-backoffice-users.cy.ts # Tests de gestion des utilisateurs
│   ├── fixtures/               # Données de test
│   │   └── api-responses.json
│   ├── support/                # Configuration et commandes personnalisées
│   │   ├── commands.ts
│   │   └── e2e.ts
│   ├── screenshots/            # Captures d'écran des échecs
│   └── videos/                 # Enregistrements vidéo des tests
├── scripts/                    # Scripts utilitaires
│   ├── generate-report.js      # Génération de rapports
│   └── setup-test-env.js       # Configuration de l'environnement
├── reports/                    # Rapports de tests générés
├── cypress.config.ts          # Configuration Cypress
├── package.json               # Dépendances et scripts
└── README.md                  # Ce fichier
```

## ⚙️ Configuration

### Variables d'environnement

Copiez le fichier `env.example` vers `.env` et configurez les variables :

```bash
cp env.example .env
```

Variables disponibles :
- `CYPRESS_BASE_URL` : URL de base pour les tests (défaut: http://localhost:3000)
- `API_BASE_URL` : URL de l'API (défaut: http://localhost:3001)
- `BACKOFFICE_URL` : URL du backoffice (défaut: http://localhost:3000)
- `TEST_USER_EMAIL` : Email de l'utilisateur de test
- `TEST_USER_PASSWORD` : Mot de passe de l'utilisateur de test
- `ADMIN_EMAIL` : Email de l'administrateur
- `ADMIN_PASSWORD` : Mot de passe de l'administrateur

### Configuration Cypress

Le fichier `cypress.config.ts` contient la configuration principale :
- URLs de base
- Timeouts
- Configuration des rapports
- Variables d'environnement

## 🎯 Types de tests

### 1. Tests de base (01-basic-setup.cy.ts)
- Validation du setup Cypress
- Tests sur Google pour vérifier le fonctionnement
- Gestion des erreurs et timeouts

### 2. Tests basiques du backoffice (02-backoffice-basic.cy.ts)
- Accès aux pages principales
- Navigation de base
- Vérification des éléments HTML

### 3. Tests d'authentification (03-backoffice-auth.cy.ts)
- Page de connexion
- Connexion avec identifiants valides/invalides
- Validation des formulaires
- Gestion des sessions
- Déconnexion

### 4. Tests du dashboard (04-backoffice-dashboard.cy.ts)
- Affichage des statistiques
- Activités récentes
- Navigation entre sections
- Graphiques et visualisations
- Responsive design

### 5. Tests de gestion des utilisateurs (05-backoffice-users.cy.ts)
- Liste des utilisateurs
- Création d'utilisateurs
- Modification d'utilisateurs
- Suppression d'utilisateurs
- Recherche et filtres
- Pagination

## 📊 Rapports de tests

### Génération de rapports
```bash
# Générer un rapport consolidé
npm run test:report
```

### Types de rapports
- **HTML** : Rapport visuel avec captures d'écran
- **JSON** : Données structurées pour analyse
- **Vidéos** : Enregistrements des tests
- **Captures d'écran** : Images des échecs

### Localisation des rapports
- `cypress/reports/` : Rapports générés
- `cypress/screenshots/` : Captures d'écran
- `cypress/videos/` : Enregistrements vidéo

## 🔧 Commandes personnalisées

### Commandes disponibles
- `cy.loginAsAdmin()` : Connexion en tant qu'administrateur
- `cy.loginAsUser()` : Connexion en tant qu'utilisateur
- `cy.waitForPageLoad()` : Attendre le chargement complet
- `cy.checkElementInteractable(selector)` : Vérifier qu'un élément est interactif
- `cy.fillForm(formData)` : Remplir un formulaire
- `cy.checkNavigation(expectedUrl)` : Vérifier la navigation

### Exemple d'utilisation
```typescript
describe('Mon test', () => {
  it('Devrait se connecter en tant qu\'admin', () => {
    cy.loginAsAdmin()
    cy.waitForPageLoad()
    cy.checkNavigation('/dashboard')
  })
})
```

## 🚀 GitHub Actions

### Workflow automatique
Le fichier `.github/workflows/cypress-tests.yml` configure :
- Exécution sur push/PR vers main/develop
- Tests sur Chrome, Firefox et Edge
- Génération de rapports
- Upload des artifacts
- Commentaires automatiques sur les PR

### Déclenchement
- **Automatique** : Push/PR sur main/develop
- **Programmé** : Tous les jours à 2h du matin
- **Manuel** : Via l'interface GitHub Actions

### Variables secrètes requises
Configurez ces variables dans les paramètres du repository :
- `CYPRESS_BASE_URL`
- `API_BASE_URL`
- `BACKOFFICE_URL`
- `TEST_USER_EMAIL`
- `TEST_USER_PASSWORD`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

## 🐛 Débogage

### Mode debug
```bash
# Exécuter avec logs détaillés
DEBUG=cypress:* npm run test

# Ouvrir en mode debug
npm run cypress:open
```

### Problèmes courants
1. **Services non disponibles** : Vérifiez que le backoffice et l'API sont démarrés
2. **Timeouts** : Augmentez les timeouts dans `cypress.config.ts`
3. **Éléments non trouvés** : Vérifiez les sélecteurs `data-cy`

### Logs et captures
- Les captures d'écran sont automatiquement prises en cas d'échec
- Les vidéos sont enregistrées pour chaque test
- Les logs détaillés sont disponibles dans la console

## 📝 Bonnes pratiques

### Sélecteurs
- Utilisez `data-cy` pour les sélecteurs de test
- Évitez les sélecteurs CSS fragiles
- Privilégiez les sélecteurs sémantiques

### Tests
- Un test = une fonctionnalité
- Tests indépendants et isolés
- Nettoyage avant chaque test

### Maintenance
- Mettez à jour les tests lors des changements d'interface
- Vérifiez régulièrement les rapports
- Optimisez les timeouts selon les performances

## 🤝 Contribution

### Ajouter un nouveau test
1. Créez un fichier dans `cypress/e2e/`
2. Suivez la convention de nommage : `XX-description.cy.ts`
3. Utilisez les commandes personnalisées disponibles
4. Ajoutez des intercepts pour les requêtes API

### Modifier la configuration
1. Mettez à jour `cypress.config.ts`
2. Ajoutez les variables d'environnement nécessaires
3. Testez la configuration localement

## 📞 Support

Pour toute question ou problème :
1. Vérifiez la documentation Cypress : https://docs.cypress.io
2. Consultez les logs et rapports générés
3. Contactez l'équipe de développement

---

**Note** : Ce projet est configuré pour fonctionner avec le backoffice Jeroka. Assurez-vous que les services sont démarrés avant d'exécuter les tests.
