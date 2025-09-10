#!/bin/bash

echo "🌐 Configuration SSL pour jerokaxperience.fr"
echo "============================================"

# Vérification des prérequis
if ! command -v certbot &> /dev/null; then
    echo "📦 Installation de Certbot..."
    sudo apt update
    sudo apt install -y certbot
fi

# Création du dossier SSL
echo "📁 Création du dossier SSL..."
mkdir -p ssl

# Arrêt temporaire de Nginx pour libérer le port 80
echo "🛑 Arrêt temporaire de Nginx..."
docker-compose -f docker-compose.prod.yml stop nginx

# Génération des certificats SSL pour jerokaxperience.fr
echo "🔐 Génération des certificats SSL pour jerokaxperience.fr..."

# Demander les sous-domaines
echo ""
echo "📝 Quels sous-domaines voulez-vous configurer ?"
echo "Exemple: backoffice.jerokaxperience.fr api.jerokaxperience.fr shop.jerokaxperience.fr"
read -p "Sous-domaines (séparés par des espaces): " subdomains

if [ -z "$subdomains" ]; then
    echo "❌ Aucun sous-domaine spécifié. Utilisation des sous-domaines par défaut..."
    subdomains="backoffice.jerokaxperience.fr api.jerokaxperience.fr shop.jerokaxperience.fr"
fi

# Ajouter le domaine principal
all_domains="jerokaxperience.fr www.jerokaxperience.fr $subdomains"

echo "🔐 Génération des certificats pour: $all_domains"

# Générer le certificat pour tous les domaines
sudo certbot certonly --standalone -d jerokaxperience.fr -d www.jerokaxperience.fr $subdomains --non-interactive --agree-tos --email admin@jerokaxperience.fr

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
    exit 1
fi

echo ""
echo "🔧 Configuration de Nginx avec SSL pour jerokaxperience.fr..."

# Créer la configuration Nginx avec SSL pour le domaine
cat > nginx-domain-ssl.conf << 'EOF'
# Configuration Nginx avec SSL pour jerokaxperience.fr
upstream api {
    server api:3002;
}

upstream backoffice {
    server backoffice:80;
}

upstream eboutique {
    server eboutique:80;
}

upstream jeroka-site {
    server jeroka-site:80;
}

# Redirection HTTP vers HTTPS
server {
    listen 80;
    server_name jerokaxperience.fr www.jerokaxperience.fr backoffice.jerokaxperience.fr api.jerokaxperience.fr shop.jerokaxperience.fr;
    return 301 https://$server_name$request_uri;
}

# Site principal - jerokaxperience.fr
server {
    listen 443 ssl http2;
    server_name jerokaxperience.fr www.jerokaxperience.fr;
    
    # Configuration SSL
    ssl_certificate /etc/nginx/ssl/jerokaxperience.fr.crt;
    ssl_certificate_key /etc/nginx/ssl/jerokaxperience.fr.key;
    
    # Paramètres SSL sécurisés
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Headers de sécurité
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Redirection www vers non-www
    if ($host = www.jerokaxperience.fr) {
        return 301 https://jerokaxperience.fr$request_uri;
    }
    
    # Site principal
    location / {
        proxy_pass http://jeroka-site;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Backoffice - backoffice.jerokaxperience.fr
server {
    listen 443 ssl http2;
    server_name backoffice.jerokaxperience.fr;
    
    # Configuration SSL
    ssl_certificate /etc/nginx/ssl/jerokaxperience.fr.crt;
    ssl_certificate_key /etc/nginx/ssl/jerokaxperience.fr.key;
    
    # Paramètres SSL sécurisés
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Headers de sécurité
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Backoffice
    location / {
        proxy_pass http://backoffice;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# API - api.jerokaxperience.fr
server {
    listen 443 ssl http2;
    server_name api.jerokaxperience.fr;
    
    # Configuration SSL
    ssl_certificate /etc/nginx/ssl/jerokaxperience.fr.crt;
    ssl_certificate_key /etc/nginx/ssl/jerokaxperience.fr.key;
    
    # Paramètres SSL sécurisés
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Headers de sécurité
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # API
    location / {
        proxy_pass http://api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# E-boutique - shop.jerokaxperience.fr
server {
    listen 443 ssl http2;
    server_name shop.jerokaxperience.fr;
    
    # Configuration SSL
    ssl_certificate /etc/nginx/ssl/jerokaxperience.fr.crt;
    ssl_certificate_key /etc/nginx/ssl/jerokaxperience.fr.key;
    
    # Paramètres SSL sécurisés
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Headers de sécurité
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # E-boutique
    location / {
        proxy_pass http://eboutique;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Modifier docker-compose.prod.yml pour utiliser SSL avec le domaine
echo "🔧 Mise à jour de docker-compose.prod.yml..."

# Sauvegarder la configuration actuelle
cp docker-compose.prod.yml docker-compose.prod.yml.backup

# Modifier les ports pour SSL standard
sed -i 's/"8081:80"/"80:80"/' docker-compose.prod.yml
sed -i 's/"8443:443"/"443:443"/' docker-compose.prod.yml

# Modifier la configuration Nginx
sed -i 's|./nginx-simple.conf:/etc/nginx/nginx.conf:ro|./nginx-domain-ssl.conf:/etc/nginx/nginx.conf:ro|' docker-compose.prod.yml

# Ajouter le volume SSL
sed -i '/volumes:/a\      - ./ssl:/etc/nginx/ssl:ro' docker-compose.prod.yml

# Mettre à jour les URLs dans les variables d'environnement
sed -i 's|https://apibackoffice.jerokaxperience.fr|https://api.jerokaxperience.fr|g' docker-compose.prod.yml
sed -i 's|https://shop.jerokaxperience.fr|https://shop.jerokaxperience.fr|g' docker-compose.prod.yml
sed -i 's|https://jerokaxperience.fr|https://jerokaxperience.fr|g' docker-compose.prod.yml

echo ""
echo "🚀 Redémarrage avec SSL et domaine jerokaxperience.fr..."
docker-compose -f docker-compose.prod.yml up -d

echo ""
echo "✅ Configuration SSL pour jerokaxperience.fr terminée !"
echo ""
echo "🌐 Accès sécurisé avec votre domaine :"
echo "• Site principal : https://jerokaxperience.fr"
echo "• Backoffice : https://backoffice.jerokaxperience.fr"
echo "• API : https://api.jerokaxperience.fr"
echo "• E-boutique : https://shop.jerokaxperience.fr"
echo "• Adminer : http://51.38.185.108:8080 (non sécurisé)"
echo ""
echo "📋 Configuration DNS requise :"
echo "Ajoutez ces enregistrements DNS chez votre fournisseur :"
echo "• A    jerokaxperience.fr        → 51.38.185.108"
echo "• A    www.jerokaxperience.fr    → 51.38.185.108"
echo "• A    backoffice.jerokaxperience.fr → 51.38.185.108"
echo "• A    api.jerokaxperience.fr    → 51.38.185.108"
echo "• A    shop.jerokaxperience.fr   → 51.38.185.108"
echo ""
echo "🔄 Renouvellement automatique des certificats :"
echo "sudo crontab -e"
echo "Ajoutez : 0 12 * * * /usr/bin/certbot renew --quiet && docker-compose -f $(pwd)/docker-compose.prod.yml restart nginx"
