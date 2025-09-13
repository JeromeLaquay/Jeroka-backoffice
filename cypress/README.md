# Tests Cypress - Backoffice Jeroka

Ce dossier contient tous les tests end-to-end (E2E) pour le backoffice Jeroka utilisant Cypress.

## 🎯 **Vue d'ensemble**

Les tests couvrent les fonctionnalités principales du backoffice :
- ✅ Authentification (connexion/inscription)
- ✅ Navigation et layout
- ✅ Gestion des clients
- ✅ Gestion des messages
- ✅ Dashboard et statistiques

## 📁 **Structure des tests**

```
cypress/
├── e2e/
│   ├── 00-complete-flow.cy.ts      # Test de flux complet
│   ├── 01-basic-setup.cy.ts        # Tests de base
│   ├── 02-backoffice-basic.cy.ts   # Tests de navigation
│   ├── 03-backoffice-auth.cy.ts    # Tests d'authentification
│   ├── 04-backoffice-dashboard.cy.ts # Tests du dashboard
│   ├── 05-backoffice-users.cy.ts   # Tests des utilisateurs
│   ├── 06-register-account.cy.ts   # Tests d'inscription
│   ├── 07-login-flow.cy.ts         # Tests de connexion
│   ├── 08-clients-module.cy.ts     # Tests du module clients
│   └── 09-messages-module.cy.ts    # Tests du module messages
├── fixtures/                       # Données de test
├── support/                        # Commandes personnalisées
├── screenshots/                    # Captures d'écran des échecs
├── videos/                         # Enregistrements vidéo
└── reports/                        # Rapports de tests
```

## 🚀 **Lancement des tests**

### **Tests interactifs (recommandé pour le développement)**
```bash
cd cypress
npm run cypress:open
```

### **Tests headless (pour CI/CD)**
```bash
cd cypress
npm run cypress:run
```

### **Tests avec Chrome**
```bash
cd cypress
npm run cypress:run:chrome
```

### **Tests spécifiques**
```bash
# Tester seulement l'authentification
npx cypress run --spec "cypress/e2e/06-register-account.cy.ts,cypress/e2e/07-login-flow.cy.ts"

# Tester seulement les modules
npx cypress run --spec "cypress/e2e/08-clients-module.cy.ts,cypress/e2e/09-messages-module.cy.ts"
```

## 🔧 **Configuration**

### **Variables d'environnement**
Créer un fichier `.env` dans le dossier `cypress/` :

```env
# URLs des services
CYPRESS_BASE_URL=http://localhost:3002
API_BASE_URL=http://localhost:3001
BACKOFFICE_URL=http://localhost:3002

# Identifiants de test
TEST_USER_EMAIL=test@jeroka.com
TEST_USER_PASSWORD=testpassword123
ADMIN_EMAIL=admin@jeroka.com
ADMIN_PASSWORD=adminpassword123
```

### **Configuration Cypress**
Le fichier `cypress.config.ts` contient :
- Timeouts configurés pour les environnements lents
- Support des rapports HTML
- Configuration pour ignorer les erreurs SSL
- Variables d'environnement

## 📊 **Rapports de tests**

Les rapports sont générés dans le dossier `cypress/reports/` :
- **HTML** : Rapport visuel avec captures d'écran
- **JSON** : Données structurées pour l'intégration CI/CD

## 🎨 **Attributs data-cy**

Tous les éléments testables utilisent des attributs `data-cy` pour une sélection stable :

```html
<!-- Exemple -->
<button data-cy="login-button">Se connecter</button>
<input data-cy="email-input" type="email" />
```

Voir `CYPRESS_DATA_ATTRIBUTES.md` pour la liste complète.

## 🧪 **Types de tests**

### **Tests d'authentification**
- Validation des formulaires
- Connexion/déconnexion
- Gestion des erreurs
- Redirections

### **Tests de navigation**
- Sidebar et menu mobile
- Navigation entre pages
- Layout responsive

### **Tests des modules**
- CRUD operations (Create, Read, Update, Delete)
- Recherche et filtres
- Pagination
- Gestion des erreurs API

### **Tests de flux complet**
- Scénarios utilisateur end-to-end
- Persistance de session
- Intégration entre modules

## 🐛 **Débogage**

### **Mode debug**
```bash
# Lancer Cypress en mode debug
DEBUG=cypress:* npm run cypress:open
```

### **Captures d'écran**
Les captures d'écran des échecs sont automatiquement sauvegardées dans `cypress/screenshots/`.

### **Vidéos**
Les enregistrements vidéo sont sauvegardés dans `cypress/videos/`.

## 🔄 **Intégration CI/CD**

### **GitHub Actions**
```yaml
- name: Run Cypress tests
  run: |
    cd cypress
    npm run cypress:run
```

### **Variables d'environnement CI**
```yaml
env:
  CYPRESS_BASE_URL: ${{ secrets.BACKOFFICE_URL }}
  API_BASE_URL: ${{ secrets.API_URL }}
```

## 📝 **Bonnes pratiques**

### **Écriture de tests**
1. **Un test = une fonctionnalité** : Chaque test doit vérifier une fonctionnalité spécifique
2. **Données de test** : Utiliser des données réalistes mais anonymisées
3. **Assertions claires** : Vérifier le comportement attendu, pas l'implémentation
4. **Nettoyage** : Toujours nettoyer les cookies/localStorage entre les tests

### **Maintenance**
1. **Attributs data-cy** : Ne jamais supprimer sans mettre à jour les tests
2. **Sélecteurs** : Préférer les attributs data-cy aux sélecteurs CSS
3. **Timeouts** : Ajuster selon la performance de l'environnement
4. **Données mockées** : Maintenir la cohérence avec l'API réelle

## 🆘 **Résolution de problèmes**

### **Erreurs communes**

**"Element not found"**
- Vérifier que l'attribut `data-cy` existe
- Attendre que l'élément soit visible avec `cy.get().should('be.visible')`

**"Request timeout"**
- Augmenter les timeouts dans `cypress.config.ts`
- Vérifier que l'API est accessible

**"Content-type error"**
- Vérifier que l'URL pointe vers le frontend (HTML) et non l'API (JSON)
- Configurer correctement `baseUrl`

### **Support**
- Consulter la [documentation Cypress](https://docs.cypress.io/)
- Vérifier les logs dans la console du navigateur
- Utiliser `cy.debug()` pour inspecter l'état de l'application

---

**Note** : Ces tests sont conçus pour fonctionner avec l'environnement de développement local. Pour les environnements de production, ajuster les URLs et les timeouts selon les besoins.