#!/bin/bash

echo "🔧 Correction du problème de base de données PostgreSQL"
echo "======================================================"

# Arrêter tous les conteneurs
echo "🛑 Arrêt des conteneurs..."
docker-compose -f docker-compose.prod.yml down

# Supprimer le volume de données PostgreSQL pour repartir à zéro
echo "🗑️  Suppression du volume PostgreSQL..."
docker volume rm jeroka-postgres-data 2>/dev/null || echo "Volume déjà supprimé"

# Nettoyer les images orphelines
echo "🧹 Nettoyage des images..."
docker system prune -f

# Relancer le déploiement
echo "🚀 Relance du déploiement..."
docker-compose -f docker-compose.prod.yml up -d --build

# Vérifier le statut
echo "📊 Vérification du statut..."
sleep 10
docker-compose -f docker-compose.prod.yml ps

echo "✅ Correction terminée !"
echo ""
echo "💡 Si le problème persiste, vérifiez :"
echo "• Les logs PostgreSQL : docker logs jeroka-postgres"
echo "• Les logs API : docker logs jeroka-api"
echo "• Le fichier .env est bien configuré"
