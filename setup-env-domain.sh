#!/bin/bash

echo "🔧 Configuration des variables d'environnement pour jerokaxperience.fr"
echo "===================================================================="

# Vérification si le fichier .env existe déjà
if [ -f .env ]; then
    echo "⚠️  Le fichier .env existe déjà."
    read -p "Voulez-vous le remplacer ? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Configuration annulée."
        exit 1
    fi
fi

# Génération de mots de passe sécurisés
echo "🔐 Génération de mots de passe sécurisés..."

DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64)
JWT_REFRESH_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64)

# Configuration SMTP
echo ""
echo "📧 Configuration SMTP (optionnel) :"
read -p "SMTP Host (ex: smtp.gmail.com): " SMTP_HOST
read -p "SMTP Port (ex: 587): " SMTP_PORT
read -p "SMTP User (ex: contact@jerokaxperience.fr): " SMTP_USER
read -s -p "SMTP Password: " SMTP_PASS
echo ""

# Création du fichier .env avec le domaine jerokaxperience.fr
cat > .env << EOF
# Variables d'environnement pour jerokaxperience.fr
# Générées le $(date)

# Base de données
DB_PASSWORD=${DB_PASSWORD}

# JWT Secrets
JWT_SECRET=${JWT_SECRET}
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}

# SMTP Configuration
SMTP_HOST=${SMTP_HOST}
SMTP_PORT=${SMTP_PORT}
SMTP_USER=${SMTP_USER}
SMTP_PASS=${SMTP_PASS}

# URLs de production avec jerokaxperience.fr
BACKOFFICE_URL=https://backoffice.jerokaxperience.fr
FRONTEND_URL=https://shop.jerokaxperience.fr
API_URL=https://api.jerokaxperience.fr
SITE_URL=https://jerokaxperience.fr
EOF

echo ""
echo "✅ Fichier .env créé avec succès !"
echo ""
echo "📋 Informations de connexion à la base de données :"
echo "• Base de données : jeroka_dashboard"
echo "• Utilisateur : jeroka"
echo "• Mot de passe : ${DB_PASSWORD}"
echo ""
echo "🌐 URLs configurées :"
echo "• Site principal : https://jerokaxperience.fr"
echo "• Backoffice : https://backoffice.jerokaxperience.fr"
echo "• API : https://api.jerokaxperience.fr"
echo "• E-boutique : https://shop.jerokaxperience.fr"
echo ""
echo "🔐 Fichier .env sauvegardé. Gardez ces informations en sécurité !"
echo ""
echo "🚀 Prochaines étapes :"
echo "1. Configurez vos enregistrements DNS"
echo "2. Lancez : ./setup-domain-ssl.sh"
echo "3. Testez vos domaines"
