# Configuration des Tests Cypress sur le Serveur

Ce guide explique comment configurer et faire fonctionner les tests Cypress sur le serveur de production Jeroka.

## 🚀 Configuration Initiale du Serveur

### 1. Installation des Dépendances

Exécutez le script d'installation sur le serveur :

```bash
# Se connecter au serveur
ssh user@votre-serveur.com

# Télécharger et exécuter le script d'installation
curl -fsSL https://raw.githubusercontent.com/votre-repo/scripts/install-cypress-dependencies.sh | bash
```

Ou manuellement :

```bash
# Mettre à jour le système
sudo apt-get update

# Installer les dépendances système
sudo apt-get install -y \
    libgtk2.0-0 libgtk-3-0 libgbm-dev libnotify-dev \
    libnss3 libxss1 libasound2 libxtst6 xauth xvfb \
    libxrandr2 libpangocairo-1.0-0 libatk1.0-0 \
    libcairo-gobject2 libgdk-pixbuf2.0-0

# Installer Google Chrome
wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" | sudo tee /etc/apt/sources.list.d/google-chrome.list
sudo apt-get update
sudo apt-get install -y google-chrome-stable

# Installer Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Configuration de l'Environnement de Test

Exécutez le script de configuration :

```bash
# Dans le répertoire du projet
cd /var/www/jeroka-backoffice

# Exécuter le script de configuration
sudo bash scripts/setup-test-environment.sh
```

## 🔐 Configuration des Variables d'Environnement

### Variables GitHub Secrets

Configurez ces variables dans les paramètres de votre repository GitHub :

1. Allez dans **Settings** > **Secrets and variables** > **Actions**
2. Ajoutez les secrets suivants :

#### Secrets Requis

```bash
# Comptes de test
TEST_USER_EMAIL=test@jeroka.com
TEST_USER_PASSWORD=votre_mot_de_passe_test
ADMIN_EMAIL=admin@jeroka.com
ADMIN_PASSWORD=votre_mot_de_passe_admin

# Configuration serveur
SERVER_SSH_KEY=votre_clé_ssh_privée
SERVER_HOST=votre-serveur.com
SERVER_USER=utilisateur_serveur
SERVER_PROJECT_PATH=/var/www/jeroka-backoffice
TOKEN_GITHUB=votre_token_github

# Base de données
DB_PASSWORD=votre_mot_de_passe_db
JWT_SECRET=votre_jwt_secret
JWT_REFRESH_SECRET=votre_jwt_refresh_secret

# Email (optionnel)
SMTP_HOST=smtp.votre-provider.com
SMTP_PORT=587
SMTP_USER=votre_email
SMTP_PASS=votre_mot_de_passe_email
```

#### Variables d'Environnement Automatiques

Ces variables sont automatiquement configurées dans le workflow :

```bash
CYPRESS_BASE_URL=https://backoffice.jerokaxperience.fr
API_BASE_URL=https://apibackoffice.jerokaxperience.fr
BACKOFFICE_URL=https://backoffice.jerokaxperience.fr
```

### Configuration Locale sur le Serveur

Créez le fichier `.env.test` dans le répertoire `cypress/` :

```bash
# Configuration des tests Cypress pour le serveur
CYPRESS_BASE_URL=https://backoffice.jerokaxperience.fr
API_BASE_URL=https://apibackoffice.jerokaxperience.fr
BACKOFFICE_URL=https://backoffice.jerokaxperience.fr

# Comptes de test
TEST_USER_EMAIL=test@jeroka.com
TEST_USER_PASSWORD=votre_mot_de_passe_test
ADMIN_EMAIL=admin@jeroka.com
ADMIN_PASSWORD=votre_mot_de_passe_admin

# Configuration des timeouts pour les tests sur serveur
CYPRESS_DEFAULT_COMMAND_TIMEOUT=15000
CYPRESS_REQUEST_TIMEOUT=15000
CYPRESS_PAGE_LOAD_TIMEOUT=30000
```

## 🎯 Attributs data-cy à Ajouter dans l'Interface

Pour que les tests fonctionnent correctement, vous devez ajouter des attributs `data-cy` dans vos composants Vue.js.

### Page de Connexion (`/login`)

```vue
<template>
  <div class="login-page">
    <!-- Champ email -->
    <input 
      data-cy="email-input"
      type="email" 
      v-model="email" 
      placeholder="Email"
    />
    
    <!-- Champ mot de passe -->
    <input 
      data-cy="password-input"
      type="password" 
      v-model="password" 
      placeholder="Mot de passe"
    />
    
    <!-- Bouton de connexion -->
    <button 
      data-cy="login-button"
      @click="login"
      :disabled="loading"
    >
      Se connecter
    </button>
    
    <!-- Message d'erreur -->
    <div 
      v-if="error" 
      data-cy="error-message"
      class="error-message"
    >
      {{ error }}
    </div>
  </div>
</template>
```

### Dashboard (`/dashboard`)

```vue
<template>
  <div class="dashboard">
    <!-- Statistiques -->
    <div data-cy="dashboard-stats" class="stats-container">
      <div data-cy="stat-total-users" class="stat-card">
        <h3>Utilisateurs</h3>
        <p>{{ stats.totalUsers }}</p>
      </div>
      <div data-cy="stat-total-products" class="stat-card">
        <h3>Produits</h3>
        <p>{{ stats.totalProducts }}</p>
      </div>
      <div data-cy="stat-total-orders" class="stat-card">
        <h3>Commandes</h3>
        <p>{{ stats.totalOrders }}</p>
      </div>
      <div data-cy="stat-total-revenue" class="stat-card">
        <h3>Chiffre d'affaires</h3>
        <p>{{ stats.totalRevenue }}</p>
      </div>
    </div>
    
    <!-- Activités récentes -->
    <div data-cy="recent-activity" class="recent-activity">
      <h3>Activités récentes</h3>
      <div 
        v-for="activity in activities" 
        :key="activity.id"
        data-cy="activity-item"
        class="activity-item"
      >
        {{ activity.message }}
      </div>
    </div>
    
    <!-- Bouton de rafraîchissement -->
    <button 
      data-cy="refresh-button"
      @click="refreshData"
    >
      Actualiser
    </button>
    
    <!-- Graphiques -->
    <div data-cy="chart-container" class="chart-container">
      <!-- Vos graphiques ici -->
    </div>
  </div>
</template>
```

### Gestion des Utilisateurs (`/users`)

```vue
<template>
  <div class="users-page">
    <!-- Barre de recherche -->
    <input 
      data-cy="user-search"
      type="text" 
      v-model="searchQuery" 
      placeholder="Rechercher un utilisateur..."
    />
    
    <!-- Filtre par rôle -->
    <select data-cy="role-filter" v-model="roleFilter">
      <option value="">Tous les rôles</option>
      <option value="admin">Administrateur</option>
      <option value="user">Utilisateur</option>
    </select>
    
    <!-- Bouton d'ajout -->
    <button 
      data-cy="add-user-button"
      @click="showAddUserForm = true"
    >
      Ajouter un utilisateur
    </button>
    
    <!-- Tableau des utilisateurs -->
    <table data-cy="users-table" class="users-table">
      <thead>
        <tr>
          <th>Email</th>
          <th>Nom</th>
          <th>Rôle</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr 
          v-for="user in filteredUsers" 
          :key="user.id"
          data-cy="user-row"
        >
          <td>{{ user.email }}</td>
          <td>{{ user.name }}</td>
          <td>{{ user.role }}</td>
          <td>
            <button 
              data-cy="edit-user-button"
              @click="editUser(user)"
            >
              Modifier
            </button>
            <button 
              data-cy="delete-user-button"
              @click="deleteUser(user)"
            >
              Supprimer
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    
    <!-- Pagination -->
    <div data-cy="pagination" class="pagination">
      <button 
        data-cy="prev-page"
        @click="previousPage"
        :disabled="currentPage === 1"
      >
        Précédent
      </button>
      <span data-cy="current-page">{{ currentPage }}</span>
      <button 
        data-cy="next-page"
        @click="nextPage"
        :disabled="currentPage === totalPages"
      >
        Suivant
      </button>
    </div>
    
    <!-- Formulaire d'ajout/modification -->
    <div 
      v-if="showAddUserForm || editingUser"
      data-cy="user-form"
      class="user-form"
    >
      <input 
        data-cy="user-email"
        type="email" 
        v-model="userForm.email" 
        placeholder="Email"
      />
      <input 
        data-cy="user-name"
        type="text" 
        v-model="userForm.name" 
        placeholder="Nom"
      />
      <input 
        data-cy="user-password"
        type="password" 
        v-model="userForm.password" 
        placeholder="Mot de passe"
      />
      <select data-cy="user-role" v-model="userForm.role">
        <option value="user">Utilisateur</option>
        <option value="admin">Administrateur</option>
      </select>
      
      <button 
        data-cy="submit-user"
        @click="submitUser"
      >
        {{ editingUser ? 'Modifier' : 'Ajouter' }}
      </button>
    </div>
  </div>
</template>
```

### Navigation et Menu

```vue
<template>
  <div class="navigation">
    <!-- Menu principal -->
    <nav data-cy="nav-menu" class="main-nav">
      <a data-cy="nav-dashboard" href="/dashboard">Dashboard</a>
      <a data-cy="nav-users" href="/users">Utilisateurs</a>
      <a data-cy="nav-products" href="/products">Produits</a>
    </nav>
    
    <!-- Menu mobile -->
    <div data-cy="mobile-menu" class="mobile-menu" v-if="isMobile">
      <button 
        data-cy="mobile-menu-toggle"
        @click="toggleMobileMenu"
      >
        Menu
      </button>
    </div>
    
    <!-- Bouton de déconnexion -->
    <button 
      data-cy="logout-button"
      @click="logout"
    >
      Se déconnecter
    </button>
  </div>
</template>
```

### Messages et Notifications

```vue
<template>
  <div class="notifications">
    <!-- Notification de succès -->
    <div 
      v-if="successMessage"
      data-cy="notification-success"
      class="notification success"
    >
      {{ successMessage }}
    </div>
    
    <!-- Notification d'erreur -->
    <div 
      v-if="errorMessage"
      data-cy="notification-error"
      class="notification error"
    >
      {{ errorMessage }}
    </div>
    
    <!-- Notification d'avertissement -->
    <div 
      v-if="warningMessage"
      data-cy="notification-warning"
      class="notification warning"
    >
      {{ warningMessage }}
    </div>
    
    <!-- Notification d'information -->
    <div 
      v-if="infoMessage"
      data-cy="notification-info"
      class="notification info"
    >
      {{ infoMessage }}
    </div>
  </div>
</template>
```

## 🚀 Exécution des Tests

### Tests Automatiques via GitHub Actions

Les tests s'exécutent automatiquement :
- **Lors des push/PR** sur les branches `main` et `develop`
- **Tous les jours à 2h du matin** (tests programmés)
- **Manuellement** via l'interface GitHub Actions

### Tests Manuels sur le Serveur

```bash
# Se connecter au serveur
ssh user@votre-serveur.com

# Aller dans le répertoire du projet
cd /var/www/jeroka-backoffice

# Exécuter les tests
./run-tests.sh
```

### Tests Locaux

```bash
# Dans le répertoire cypress
cd cypress

# Tests interactifs
npm run cypress:open

# Tests headless
npm run test

# Tests sur un navigateur spécifique
npm run test:chrome
npm run test:firefox
npm run test:edge
```

## 📊 Rapports de Tests

### Localisation des Rapports

- **GitHub Actions** : Artifacts téléchargeables
- **Serveur** : `/var/www/jeroka-backoffice/cypress/reports/`
- **Local** : `cypress/reports/`

### Types de Rapports

1. **Rapport HTML** : `mochawesome.html` - Rapport visuel complet
2. **Rapport JSON** : `mochawesome.json` - Données structurées
3. **Vidéos** : `cypress/videos/` - Enregistrements des tests
4. **Captures d'écran** : `cypress/screenshots/` - Images des échecs

### Accès aux Rapports

```bash
# Sur le serveur
cd /var/www/jeroka-backoffice/cypress/reports/consolidated/
ls -la

# Ouvrir le rapport HTML
firefox mochawesome.html
```

## 🔧 Dépannage

### Problèmes Courants

1. **Services non accessibles**
   ```bash
   # Vérifier le statut des conteneurs
   docker compose -f docker-compose.prod.yml ps
   
   # Vérifier les logs
   docker compose -f docker-compose.prod.yml logs
   ```

2. **Tests qui échouent**
   ```bash
   # Vérifier les logs des tests
   tail -f /var/log/jeroka-test-setup.log
   
   # Exécuter un test simple
   cd cypress && npm run test:chrome -- --spec "cypress/e2e/01-basic-setup.cy.ts"
   ```

3. **Problèmes de permissions**
   ```bash
   # Donner les permissions d'exécution
   chmod +x scripts/*.sh
   chmod +x run-tests.sh
   ```

### Logs et Monitoring

```bash
# Logs des tests
tail -f /var/log/jeroka-test-setup.log

# Logs des tests programmés
tail -f /var/log/jeroka-scheduled-tests.log

# Logs Docker
docker compose -f docker-compose.prod.yml logs -f
```

## 📞 Support

Pour toute question ou problème :

1. **Vérifiez les logs** : `/var/log/jeroka-test-setup.log`
2. **Consultez les rapports** : `cypress/reports/consolidated/`
3. **Testez manuellement** : `./run-tests.sh`
4. **Contactez l'équipe** : [votre-email@jeroka.com]

---

**Note** : Assurez-vous que tous les services sont démarrés et accessibles avant d'exécuter les tests. Les tests nécessitent que le backoffice et l'API soient en cours d'exécution.
