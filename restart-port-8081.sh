#!/bin/bash

echo "🔄 Redémarrage avec le port 8081"
echo "==============================="

# Arrêter les conteneurs
echo "🛑 Arrêt des conteneurs..."
docker-compose -f docker-compose.prod.yml down

# Relancer avec le nouveau port
echo "🚀 Relance avec le port 8081..."
docker-compose -f docker-compose.prod.yml up -d

# Vérifier le statut
echo "📊 Vérification du statut..."
sleep 5
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "✅ Redémarrage terminé !"
echo ""
echo "🌐 Accès aux services :"
echo "• Page d'accueil : http://51.38.185.108:8081/"
echo "• Backoffice : http://51.38.185.108:8081/backoffice/"
echo "• E-boutique : http://51.38.185.108:8081/shop/"
echo "• Site principal : http://51.38.185.108:8081/site/"
echo "• API : http://51.38.185.108:8081/api/health"
echo "• Adminer : http://51.38.185.108:8080 (direct)"
echo ""
echo "💡 Ports utilisés :"
echo "• 8081 : Nginx (Jeroka services)"
echo "• 8080 : Adminer (gestion BDD)"
echo "• 5678 : n8n (automation)"
