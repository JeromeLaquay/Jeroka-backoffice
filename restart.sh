#!/bin/bash

echo "🔄 Redémarrage de l'application Jeroka..."

# Éteindre Docker Compose
echo "⏹️  Arrêt de Docker Compose..."
docker compose -f docker-compose.prod.yml down

# Faire un git pull avec authentification automatique
echo "📥 Mise à jour du code depuis Git..."

# Utiliser un token d'accès personnel (remplacez YOUR_TOKEN par votre token)
git pull https://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@github.com/JeromeLaquay/Jeroka-backoffice.git

# Redémarrer Docker Compose avec build
echo "🚀 Redémarrage de Docker Compose avec build..."
docker compose -f docker-compose.prod.yml up -d --build

echo "✅ Redémarrage terminé !"
echo "📊 Vérification du statut des conteneurs :"
docker compose -f docker-compose.prod.yml ps
