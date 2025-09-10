#!/bin/bash

echo "🔧 Correction du routage Nginx"
echo "=============================="

# Redémarrer seulement Nginx avec la nouvelle configuration
echo "🔄 Redémarrage de Nginx..."
docker-compose -f docker-compose.prod.yml restart nginx

# Vérifier le statut
echo "📊 Vérification du statut..."
sleep 3
docker-compose -f docker-compose.prod.yml ps nginx

echo ""
echo "✅ Correction terminée !"
echo ""
echo "🌐 Testez maintenant :"
echo "• Page d'accueil : http://51.38.185.108:8080/"
echo "• Backoffice : http://51.38.185.108:8080/backoffice/"
echo "• E-boutique : http://51.38.185.108:8080/shop/"
echo "• Site principal : http://51.38.185.108:8080/site/"
echo "• API : http://51.38.185.108:8080/api/health"
echo "• Adminer : http://51.38.185.108:8080 (direct)"
echo ""
echo "💡 Si ça ne fonctionne toujours pas, vérifiez les logs :"
echo "docker logs jeroka-nginx"
