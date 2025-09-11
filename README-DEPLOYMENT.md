# 🚀 Déploiement Automatique Jeroka

Ce projet utilise GitHub Actions pour déployer automatiquement l'application sur le serveur de production à chaque push sur la branche `main`.

## 📁 Fichiers de Déploiement

- `.github/workflows/deploy.yml` - Workflow GitHub Actions
- `.github/DEPLOYMENT.md` - Guide détaillé de configuration
- `deploy.sh` - Script de déploiement automatisé
- `env.production.example` - Exemple de configuration d'environnement

## ⚡ Démarrage Rapide

### 1. Configuration des Secrets GitHub

Ajoutez ces secrets dans votre repository GitHub (Settings → Secrets and variables → Actions) :

```
SERVER_SSH_KEY     # Clé privée SSH pour le serveur
SERVER_HOST        # Adresse IP/domaine du serveur
SERVER_USER        # Utilisateur SSH
SERVER_PROJECT_PATH # Chemin vers le projet sur le serveur
```

### 2. Préparation du Serveur

```bash
# Sur votre serveur de production
cd /path/to/your/project
git clone https://github.com/your-username/jeroka-backoffice.git
cd jeroka-backoffice

# Créer le fichier d'environnement
cp env.production.example .env.production
nano .env.production  # Configurez vos valeurs
```

### 3. Test du Déploiement

Le déploiement se déclenche automatiquement à chaque push sur `main`, ou vous pouvez le déclencher manuellement dans l'onglet Actions de GitHub.

## 🔧 Configuration Avancée

Consultez le fichier `.github/DEPLOYMENT.md` pour une configuration détaillée et le dépannage.

## 📊 Monitoring

- **Logs GitHub Actions** : Onglet Actions de votre repository
- **Logs Serveur** : `docker compose -f docker-compose.prod.yml logs`
- **Statut Services** : `docker compose -f docker-compose.prod.yml ps`

## 🆘 Support

En cas de problème, consultez :
1. Les logs GitHub Actions
2. Les logs du serveur
3. Le guide de dépannage dans `.github/DEPLOYMENT.md`
