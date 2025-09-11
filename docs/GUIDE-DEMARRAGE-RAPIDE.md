# 🚀 Guide de Démarrage Rapide - Tests Cypress

Ce guide vous permet de configurer et lancer les tests Cypress sur le serveur en quelques étapes simples.

## ⚡ Démarrage Rapide (5 minutes)

### 1. Configuration des Secrets GitHub

Allez dans **Settings** > **Secrets and variables** > **Actions** et ajoutez :

```bash
# Comptes de test (OBLIGATOIRE)
TEST_USER_EMAIL=test@jeroka.com
TEST_USER_PASSWORD=votre_mot_de_passe_test
ADMIN_EMAIL=admin@jeroka.com
ADMIN_PASSWORD=votre_mot_de_passe_admin

# Configuration serveur (OBLIGATOIRE)
SERVER_SSH_KEY=votre_clé_ssh_privée
SERVER_HOST=votre-serveur.com
SERVER_USER=utilisateur_serveur
SERVER_PROJECT_PATH=/var/www/jeroka-backoffice
TOKEN_GITHUB=votre_token_github

# Base de données (OBLIGATOIRE)
DB_PASSWORD=votre_mot_de_passe_db
JWT_SECRET=votre_jwt_secret
JWT_REFRESH_SECRET=votre_jwt_refresh_secret
```

### 2. Installation sur le Serveur

Connectez-vous au serveur et exécutez :

```bash
# Télécharger et exécuter le script d'installation
curl -fsSL https://raw.githubusercontent.com/JeromeLaquay/Jeroka-backoffice/main/scripts/install-cypress-dependencies.sh | bash

# Configurer l'environnement de test
cd /var/www/jeroka-backoffice
sudo bash scripts/setup-test-environment.sh
```

### 3. Ajout des Attributs data-cy

Ajoutez ces attributs dans vos composants Vue.js :

```vue
<!-- Page de connexion -->
<input data-cy="email-input" type="email" />
<input data-cy="password-input" type="password" />
<button data-cy="login-button">Se connecter</button>

<!-- Dashboard -->
<div data-cy="dashboard-stats">
  <div data-cy="stat-total-users">150</div>
  <div data-cy="stat-total-products">45</div>
</div>

<!-- Gestion des utilisateurs -->
<button data-cy="add-user-button">Ajouter</button>
<table data-cy="users-table">
  <tr data-cy="user-row">
    <button data-cy="edit-user-button">Modifier</button>
    <button data-cy="delete-user-button">Supprimer</button>
  </tr>
</table>
```

### 4. Lancement des Tests

#### Tests Automatiques
Les tests se lancent automatiquement :
- **Push/PR** sur `main` ou `develop`
- **Tous les jours à 2h du matin**
- **Manuellement** via GitHub Actions

#### Tests Manuels
```bash
# Sur le serveur
cd /var/www/jeroka-backoffice
./run-tests.sh

# Localement
cd cypress
npm run cypress:open
```

## 🔧 Configuration Avancée

### Variables d'Environnement Supplémentaires

```bash
# Email (optionnel)
SMTP_HOST=smtp.votre-provider.com
SMTP_PORT=587
SMTP_USER=votre_email
SMTP_PASS=votre_mot_de_passe_email

# Staging (optionnel)
DB_PASSWORD_STAGING=mot_de_passe_staging
JWT_SECRET_STAGING=b8e9f0a3d5c7e2f9a1d4c6e8b0f3a5d7c9e1f4a6d8c0e3f5a7d9c1e4f6a8d0c3f5a7e9c1f4a6d8c0e3f5a7d9c1e4f6a8d0c3f5a7e9c1f4a6d8c0e3f5a7d9c1e4f6a8
JWT_REFRESH_SECRET_STAGING=b8e9f0a3d5c7e2f9a1d4c6e8b0f3a5d7c9e1f4a6d8c0e3f5a7d9c1e4f6a8d0c3f5a7e9c1f4a6d8c0e3f5a7d9c1e4f6a8d0c3f5a7e9c1f4a6d8c0e3f5a7d9c1e4f6a8
```

### Workflows Disponibles

1. **Déploiement avec tests** : `.github/workflows/deploy.yml`
2. **Tests dédiés** : `.github/workflows/test-deployment.yml`
3. **Tests Cypress** : `.github/workflows/cypress-tests.yml`

### Environnements

- **Production** : `https://backoffice.jerokaxperience.fr`
- **Staging** : `https://staging-backoffice.jerokaxperience.fr`

## 📊 Rapports et Monitoring

### Accès aux Rapports

- **GitHub Actions** : Artifacts téléchargeables
- **Serveur** : `/var/www/jeroka-backoffice/cypress/reports/`
- **Local** : `cypress/reports/`

### Types de Rapports

- **HTML** : Rapport visuel avec captures d'écran
- **JSON** : Données structurées
- **Vidéos** : Enregistrements des tests
- **Captures** : Images des échecs

## 🐛 Dépannage Rapide

### Problèmes Courants

1. **Services non accessibles**
   ```bash
   docker compose -f docker-compose.prod.yml ps
   docker compose -f docker-compose.prod.yml logs
   ```

2. **Tests qui échouent**
   ```bash
   tail -f /var/log/jeroka-test-setup.log
   cd cypress && npm run test:chrome -- --spec "cypress/e2e/01-basic-setup.cy.ts"
   ```

3. **Permissions**
   ```bash
   chmod +x scripts/*.sh
   chmod +x run-tests.sh
   ```

### Logs Importants

```bash
# Logs des tests
tail -f /var/log/jeroka-test-setup.log

# Logs des tests programmés
tail -f /var/log/jeroka-scheduled-tests.log

# Logs Docker
docker compose -f docker-compose.prod.yml logs -f
```

## 🎯 Tests Disponibles

### Tests de Base
- ✅ Validation du setup Cypress
- ✅ Tests sur Google
- ✅ Navigation de base

### Tests d'Authentification
- ✅ Page de connexion
- ✅ Connexion valide/invalide
- ✅ Gestion des sessions
- ✅ Déconnexion

### Tests du Dashboard
- ✅ Affichage des statistiques
- ✅ Activités récentes
- ✅ Graphiques
- ✅ Responsive design

### Tests de Gestion
- ✅ Liste des utilisateurs
- ✅ CRUD utilisateurs
- ✅ Recherche et filtres
- ✅ Pagination

## 📞 Support

### Ressources
- **Documentation complète** : `docs/CONFIGURATION-TESTS-SERVEUR.md`
- **Tests Cypress** : `cypress/README.md`
- **Scripts** : `scripts/`

### Contact
- **Équipe** : [votre-email@jeroka.com]
- **Issues** : [GitHub Issues]
- **Documentation** : [Wiki du projet]

## ✅ Checklist de Démarrage

- [ ] Secrets GitHub configurés
- [ ] Serveur configuré avec les scripts
- [ ] Attributs `data-cy` ajoutés dans l'interface
- [ ] Services Docker en cours d'exécution
- [ ] Tests de base fonctionnels
- [ ] Rapports générés correctement

---

**🎉 Félicitations !** Vos tests Cypress sont maintenant configurés et prêts à fonctionner sur le serveur.

**💡 Conseil** : Commencez par les tests de base, puis ajoutez progressivement les tests spécifiques à votre application.
