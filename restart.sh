#!/bin/bash

echo "🔄 Redémarrage de l'application Jeroka..."

# Éteindre Docker Compose
echo "⏹️  Arrêt de Docker Compose..."
docker compose -f docker-compose.prod.yml down

# Faire un git pull
echo "📥 Mise à jour du code depuis Git..."
git pull

# Redémarrer Docker Compose avec build
echo "🚀 Redémarrage de Docker Compose avec build..."
docker compose -f docker-compose.prod.yml up -d --build

echo "✅ Redémarrage terminé !"
echo "📊 Vérification du statut des conteneurs :"
docker compose -f docker-compose.prod.yml ps
