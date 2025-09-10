#!/bin/bash

echo "🔒 Configuration SSL alternative (port 8080)"
echo "==========================================="

# Création du dossier SSL
echo "📁 Création du dossier SSL..."
mkdir -p ssl

# Arrêt temporaire de Nginx
echo "🛑 Arrêt temporaire de Nginx..."
docker compose -f docker-compose.prod.yml stop nginx

# Génération du certificat SSL avec port alternatif
echo "🔐 Génération du certificat SSL pour jerokaxperience.fr (port 8080)..."

sudo certbot certonly --standalone --http-01-port 8080 -d jerokaxperience.fr -d www.jerokaxperience.fr -d apibackoffice.jerokaxperience.fr -d backoffice.jerokaxperience.fr --non-interactive --agree-tos --email admin@jerokaxperience.fr

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
    echo "   - Le port 8080 est libre"
    echo "   - Le firewall autorise le port 8080"
    exit 1
fi

echo ""
echo "🔧 Configuration de Nginx pour API et Backoffice..."

# Créer la configuration Nginx simplifiée
cat > nginx.conf << 'EOF'
# Configuration Nginx simplifiée pour API et Backoffice seulement
upstream api {
    server api:3002;
}

upstream backoffice {
    server backoffice:80;
}

# Redirection HTTP vers HTTPS
server {
    listen 80;
    server_name jerokaxperience.fr www.jerokaxperience.fr apibackoffice.jerokaxperience.fr backoffice.jerokaxperience.fr;
    return 301 https://$server_name$request_uri;
}

# Site principal - jerokaxperience.fr (page d'accueil)
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
    
    # Page d'accueil avec navigation vers API et Backoffice
    location / {
        return 200 '<!DOCTYPE html>
<html>
<head>
    <title>Jeroka Xperience - API & Backoffice</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #0ea5e9; text-align: center; }
        .services { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 30px; margin-top: 40px; }
        .service { padding: 30px; border: 1px solid #ddd; border-radius: 10px; text-align: center; background: #fafafa; }
        .service h3 { color: #1f2937; margin-bottom: 15px; }
        .service a { text-decoration: none; color: #0ea5e9; font-weight: bold; font-size: 16px; }
        .service a:hover { color: #d946ef; }
        .ssl-badge { background: #22c55e; color: white; padding: 5px 10px; border-radius: 15px; font-size: 12px; margin-left: 10px; }
        .description { color: #6b7280; margin-top: 10px; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏢 Jeroka Xperience <span class="ssl-badge">🔒 SSL</span></h1>
        <p style="text-align: center; color: #666; font-size: 18px;">L\'IA qui transforme votre PME en entreprise digitale performante</p>
        
        <div class="services">
            <div class="service">
                <h3>📊 Backoffice</h3>
                <a href="https://backoffice.jerokaxperience.fr">Accéder au Backoffice</a>
                <div class="description">Interface d\'administration pour gérer votre entreprise</div>
            </div>
            
            <div class="service">
                <h3>🔧 API</h3>
                <a href="https://apibackoffice.jerokaxperience.fr/health">Vérifier l\'API</a>
                <div class="description">API REST pour intégrer vos applications</div>
            </div>
            
            <div class="service">
                <h3>🗄️ Base de Données</h3>
                <a href="http://51.38.185.108:8080">Adminer (BDD)</a>
                <div class="description">Gestion de la base de données PostgreSQL</div>
            </div>
        </div>
        
        <div style="margin-top: 40px; padding: 20px; background: #f0f9ff; border-radius: 8px; border-left: 4px solid #0ea5e9;">
            <h4 style="color: #0ea5e9; margin-bottom: 10px;">📋 Informations de Connexion</h4>
            <p style="margin: 5px 0; color: #374151;"><strong>Base de données :</strong> jeroka_dashboard</p>
            <p style="margin: 5px 0; color: #374151;"><strong>Utilisateur :</strong> jeroka</p>
            <p style="margin: 5px 0; color: #374151;"><strong>Serveur :</strong> postgres</p>
        </div>
    </div>
</body>
</html>';
        add_header Content-Type text/html;
    }
}

# API - apibackoffice.jerokaxperience.fr
server {
    listen 443 ssl http2;
    server_name apibackoffice.jerokaxperience.fr;
    
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
EOF

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
echo "Ajoutez : 0 12 * * * /usr/bin/certbot renew --quiet && docker compose -f $(pwd)/docker-compose.prod.yml restart nginx"
