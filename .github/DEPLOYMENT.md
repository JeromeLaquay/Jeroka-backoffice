# 🚀 Guide de Déploiement Automatique Jeroka

Ce document explique comment configurer le déploiement automatique via GitHub Actions pour le projet Jeroka.

## 📋 Prérequis

### 1. Serveur de Production
- Serveur Linux avec Docker et Docker Compose installés
- Accès SSH configuré
- Git installé sur le serveur
- Répertoire du projet cloné

### 2. Repository GitHub
- Repository avec les permissions d'écriture
- Accès aux paramètres du repository

## 🔐 Configuration des Secrets GitHub

Pour que le déploiement automatique fonctionne, vous devez configurer les secrets suivants dans votre repository GitHub :

### Accéder aux Secrets
1. Allez dans votre repository GitHub
2. Cliquez sur **Settings** (Paramètres)
3. Dans le menu de gauche, cliquez sur **Secrets and variables** → **Actions**
4. Cliquez sur **New repository secret**

### Secrets Requis

#### `SERVER_SSH_KEY`
- **Description** : Clé privée SSH pour se connecter au serveur
- **Valeur** : Le contenu complet de votre clé privée SSH (commence par `-----BEGIN OPENSSH PRIVATE KEY-----`)
- **Exemple** :
  ```
  -----BEGIN OPENSSH PRIVATE KEY-----
  b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAABlwAAAAdzc2gtcn
  ...
  -----END OPENSSH PRIVATE KEY-----
  ```

#### `SERVER_HOST`
- **Description** : Adresse IP ou nom de domaine du serveur
- **Valeur** : L'adresse de votre serveur de production
- **Exemple** : `192.168.1.100` ou `mon-serveur.com`

#### `SERVER_USER`
- **Description** : Nom d'utilisateur pour la connexion SSH
- **Valeur** : Le nom d'utilisateur SSH
- **Exemple** : `ubuntu`, `root`, ou `jeroka`

#### `SERVER_PROJECT_PATH`
- **Description** : Chemin vers le répertoire du projet sur le serveur
- **Valeur** : Le chemin absolu vers votre projet
- **Exemple** : `/home/jeroka/jeroka-backoffice` ou `/var/www/jeroka`

## 🔑 Configuration SSH

### 1. Générer une paire de clés SSH (si pas déjà fait)
```bash
ssh-keygen -t rsa -b 4096 -C "github-actions@jeroka.com"
```

### 2. Copier la clé publique sur le serveur
```bash
ssh-copy-id -i ~/.ssh/id_rsa.pub user@your-server.com
```

### 3. Tester la connexion
```bash
ssh user@your-server.com
```

### 4. Ajouter la clé privée aux secrets GitHub
- Copiez le contenu de `~/.ssh/id_rsa` (clé privée)
- Ajoutez-le comme secret `SERVER_SSH_KEY`

## 📁 Préparation du Serveur

### 1. Cloner le repository
```bash
cd /path/to/your/projects
git clone https://github.com/your-username/jeroka-backoffice.git
cd jeroka-backoffice
```

### 2. Créer le fichier d'environnement
```bash
cp .env.example .env.production
# Éditez le fichier avec vos valeurs de production
nano .env.production
```

### 3. Vérifier Docker
```bash
docker --version
docker-compose --version
```

## 🚀 Déclenchement du Déploiement

### Automatique
Le déploiement se déclenche automatiquement à chaque push sur la branche `main`.

### Manuel
1. Allez dans l'onglet **Actions** de votre repository
2. Sélectionnez le workflow "🚀 Déploiement Automatique Jeroka"
3. Cliquez sur **Run workflow**
4. Sélectionnez la branche `main`
5. Cliquez sur **Run workflow**

## 📊 Monitoring du Déploiement

### Logs GitHub Actions
- Allez dans **Actions** → Sélectionnez votre workflow
- Cliquez sur le job en cours ou terminé
- Consultez les logs de chaque étape

### Logs Serveur
```bash
# Voir les logs des conteneurs
docker compose -f docker-compose.prod.yml logs

# Voir les logs d'un service spécifique
docker compose -f docker-compose.prod.yml logs api
docker compose -f docker-compose.prod.yml logs backoffice
```

### Vérification des Services
```bash
# Statut des conteneurs
docker compose -f docker-compose.prod.yml ps

# Santé des services
curl http://localhost:3002/health  # API
curl http://localhost:3001         # Backoffice
```

## 🔧 Dépannage

### Problèmes Courants

#### 1. Erreur de connexion SSH
- Vérifiez que `SERVER_SSH_KEY` contient la clé privée complète
- Vérifiez que `SERVER_HOST` et `SERVER_USER` sont corrects
- Testez la connexion SSH manuellement

#### 2. Erreur de permissions
- Vérifiez que l'utilisateur SSH a les permissions sur le répertoire du projet
- Vérifiez que Docker est accessible sans sudo

#### 3. Erreur de build Docker
- Vérifiez que le fichier `.env.production` existe
- Vérifiez que toutes les variables d'environnement sont définies
- Consultez les logs Docker pour plus de détails

#### 4. Services non accessibles
- Vérifiez que les ports sont ouverts
- Vérifiez la configuration nginx
- Consultez les logs des conteneurs

### Commandes de Debug
```bash
# Sur le serveur, vérifier l'état
cd /path/to/project
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs --tail=50

# Redémarrer manuellement
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d --build
```

## 🔒 Sécurité

### Bonnes Pratiques
- Utilisez des clés SSH dédiées pour GitHub Actions
- Limitez les permissions de l'utilisateur SSH au minimum nécessaire
- Gardez vos secrets GitHub privés
- Surveillez les logs de déploiement
- Utilisez HTTPS pour toutes les communications

### Rotation des Clés
- Changez régulièrement vos clés SSH
- Mettez à jour les secrets GitHub en conséquence
- Testez la connexion après chaque changement

## 📞 Support

En cas de problème :
1. Consultez les logs GitHub Actions
2. Vérifiez les logs du serveur
3. Testez manuellement les commandes
4. Contactez l'équipe de développement

---

**Note** : Ce guide est spécifique au projet Jeroka. Adaptez les chemins et configurations selon votre environnement.
