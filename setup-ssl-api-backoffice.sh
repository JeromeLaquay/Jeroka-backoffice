#!/bin/bash

echo "🔒 Configuration SSL pour API et Backoffice seulement"
echo "===================================================="


# Création du dossier SSL
echo "📁 Création du dossier SSL..."
mkdir -p ssl

# Arrêt temporaire de Nginx pour libérer le port 80
echo "🛑 Arrêt temporaire de Nginx..."
docker compose -f docker-compose.prod.yml stop nginx

# Vérifier si le port 80 est libre
echo "🔍 Vérification du port 80..."
if netstat -tlnp | grep :80 > /dev/null; then
    echo "⚠️  Le port 80 est occupé. Arrêt de tous les services sur le port 80..."
    sudo fuser -k 80/tcp 2>/dev/null || true
    sleep 2
fi

# Génération du certificat SSL pour jerokaxperience.fr
echo "🔐 Génération du certificat SSL pour jerokaxperience.fr..."

sudo certbot certonly --standalone -d jerokaxperience.fr -d www.jerokaxperience.fr -d apibackoffice.jerokaxperience.fr -d backoffice.jerokaxperience.fr --non-interactive --agree-tos --email admin@jerokaxperience.fr

if [ $? -eq 0 ]; then
    echo "✅ Certificat généré pour jerokaxperience.fr"
    
    # Copier les certificats
    sudo cp /etc/letsencrypt/live/jerokaxperience.fr/fullchain.pem ssl/jerokaxperience.fr.crt
    sudo cp /etc/letsencrypt/live/jerokaxperience.fr/privkey.pem ssl/jerokaxperience.fr.key
    
    # Changer les permissions
    sudo chown $USER:$USER ssl/jerokaxperience.fr.crt ssl/jerokaxperience.fr.key
    chmod 644 ssl/jerokaxperience.fr.crt
    chmod 600 ssl/jerokaxperience.fr.key
else
    echo "❌ Erreur lors de la génération du certificat"
    echo "💡 Vérifiez que :"
    echo "   - Le domaine jerokaxperience.fr pointe vers 51.38.185.108"
    echo "   - Le port 80 est libre"
    echo "   - Le firewall autorise le port 80"
    exit 1
fi

echo ""
echo "🔧 Configuration de Nginx pour API et Backoffice..."

# Utiliser la configuration simplifiée
cp nginx-simple-api-backoffice.conf nginx.conf

echo ""
echo "🚀 Redémarrage avec SSL..."
docker compose -f docker-compose.prod.yml up -d

echo ""
echo "✅ Configuration SSL terminée !"
echo ""
echo "🌐 Accès sécurisé :"
echo "• Page d'accueil : https://jerokaxperience.fr"
echo "• Backoffice : https://backoffice.jerokaxperience.fr"
echo "• API : https://apibackoffice.jerokaxperience.fr"
echo "• Adminer : http://51.38.185.108:8080 (non sécurisé)"
echo ""
echo "📋 Configuration DNS requise :"
echo "Ajoutez ces enregistrements DNS chez votre fournisseur :"
echo "• A    jerokaxperience.fr        → 51.38.185.108"
echo "• A    www.jerokaxperience.fr    → 51.38.185.108"
echo "• A    apibackoffice.jerokaxperience.fr → 51.38.185.108"
echo "• A    backoffice.jerokaxperience.fr → 51.38.185.108"
echo ""
echo "🔄 Renouvellement automatique des certificats :"
echo "sudo crontab -e"
echo "Ajoutez : 0 12 * * * /usr/bin/certbot renew --quiet && docker-compose -f $(pwd)/docker-compose.prod.yml restart nginx"
