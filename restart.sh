#!/bin/bash

echo "🔄 Redémarrage de l'application Jeroka..."

# Éteindre Docker Compose
echo "⏹️  Arrêt de Docker Compose..."
docker compose -f docker-compose.prod.yml down

# Faire un git pull avec authentification automatique
echo "📥 Mise à jour du code depuis Git..."

# Option 1: Utiliser les credentials stockés (recommandé)
git pull

# Option 2: Utiliser un token d'accès personnel (plus sécurisé)
# git pull https://username:token@github.com/owner/repo.git

# Option 3: Utiliser les variables d'environnement
export GIT_USERNAME="JeromeLaquay"
export GIT_PASSWORD="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"
git pull https://$GIT_USERNAME:$GIT_PASSWORD@github.com/JeromeLaquay/Jeroka-backoffice.git

# Option 4: Utiliser git credential helper (configuration une seule fois)
# git config --global credential.helper store
# git pull

# Pour l'instant, on utilise la méthode standard
#git pull

# Redémarrer Docker Compose avec build
echo "🚀 Redémarrage de Docker Compose avec build..."
docker compose -f docker-compose.prod.yml up -d --build

echo "✅ Redémarrage terminé !"
echo "📊 Vérification du statut des conteneurs :"
docker compose -f docker-compose.prod.yml ps
