#!/bin/bash

echo "🔄 Redémarrage avec les nouveaux ports"
echo "====================================="

# Arrêter les conteneurs
echo "🛑 Arrêt des conteneurs..."
docker-compose -f docker-compose.prod.yml down

# Relancer avec la nouvelle configuration
echo "🚀 Relance avec les nouveaux ports..."
docker-compose -f docker-compose.prod.yml up -d

# Vérifier le statut
echo "📊 Vérification du statut..."
sleep 5
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "✅ Redémarrage terminé !"
echo ""
echo "🌐 Accès aux services :"
echo "• Backoffice : http://votre-serveur:8080/backoffice/"
echo "• API : http://votre-serveur:8080/api/"
echo "• E-boutique : http://votre-serveur:8080/shop/"
echo "• Site principal : http://votre-serveur:8080/site/"
echo "• Adminer : http://votre-serveur:8080"
echo ""
echo "💡 Pour ajouter SSL plus tard :"
echo "1. Configurez vos certificats dans ./ssl/"
echo "2. Remplacez nginx-simple.conf par nginx.conf"
echo "3. Redémarrez les conteneurs"
