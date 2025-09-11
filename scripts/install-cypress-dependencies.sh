#!/bin/bash

# Script d'installation des dépendances Cypress sur le serveur
# Ce script installe Chrome et les dépendances nécessaires pour Cypress

set -e

echo "🚀 Installation des dépendances Cypress sur le serveur..."

# Fonction de logging
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Mettre à jour le système
log "📦 Mise à jour du système..."
apt-get update

# Installer les dépendances système nécessaires pour Cypress
log "📦 Installation des dépendances système..."

# Dépendances pour Cypress
apt-get install -y \
    libgtk2.0-0 \
    libgtk-3-0 \
    libgbm-dev \
    libnotify-dev \
    libnss3 \
    libxss1 \
    libasound2 \
    libxtst6 \
    xauth \
    xvfb \
    libxrandr2 \
    libasound2 \
    libpangocairo-1.0-0 \
    libatk1.0-0 \
    libcairo-gobject2 \
    libgtk-3-0 \
    libgdk-pixbuf2.0-0

log "✅ Dépendances système installées"

# Installer Google Chrome
log "🌐 Installation de Google Chrome..."

# Ajouter la clé GPG de Google
wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add -

# Ajouter le dépôt Chrome
echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list

# Mettre à jour et installer Chrome
apt-get update
apt-get install -y google-chrome-stable

log "✅ Google Chrome installé: $(google-chrome --version)"

# Installer Firefox (optionnel)
log "🦊 Installation de Firefox..."
apt-get install -y firefox-esr

log "✅ Firefox installé: $(firefox --version)"

# Installer les outils de développement
log "🔧 Installation des outils de développement..."

apt-get install -y \
    curl \
    wget \
    git \
    unzip \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release

log "✅ Outils de développement installés"

# Installer Node.js 18 si pas déjà installé
if ! command -v node &> /dev/null; then
    log "📦 Installation de Node.js 18..."
    
    # Installation via NodeSource
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
    
    log "✅ Node.js installé: $(node --version)"
else
    log "✅ Node.js déjà installé: $(node --version)"
fi

# Installer npm si pas déjà installé
if ! command -v npm &> /dev/null; then
    log "📦 Installation de npm..."
    apt-get install -y npm
    
    log "✅ npm installé: $(npm --version)"
else
    log "✅ npm déjà installé: $(npm --version)"
fi

# Installer les outils de test globaux
log "🧪 Installation des outils de test globaux..."

npm install -g \
    mochawesome \
    mochawesome-merge \
    mochawesome-report-generator

log "✅ Outils de test installés"

# Configurer les variables d'environnement pour Cypress
log "⚙️ Configuration des variables d'environnement..."

# Créer le fichier de configuration Cypress
cat > /etc/environment << EOF
# Configuration Cypress
CYPRESS_CACHE_FOLDER=/tmp/cypress_cache
CYPRESS_INSTALL_BINARY=0
DISPLAY=:99
EOF

# Créer le répertoire de cache Cypress
mkdir -p /tmp/cypress_cache
chmod 777 /tmp/cypress_cache

log "✅ Variables d'environnement configurées"

# Configurer Xvfb pour les tests headless
log "🖥️ Configuration de Xvfb..."

# Créer le script de démarrage Xvfb
cat > /usr/local/bin/start-xvfb.sh << 'EOF'
#!/bin/bash
# Démarrer Xvfb pour les tests headless
Xvfb :99 -screen 0 1280x720x24 -ac +extension GLX +render -noreset &
export DISPLAY=:99
EOF

chmod +x /usr/local/bin/start-xvfb.sh

log "✅ Xvfb configuré"

# Créer un script de test de l'installation
log "🧪 Création du script de test d'installation..."

cat > /tmp/test-cypress-install.sh << 'EOF'
#!/bin/bash

echo "🧪 Test de l'installation Cypress..."

# Tester Chrome
if command -v google-chrome &> /dev/null; then
    echo "✅ Chrome disponible: $(google-chrome --version)"
else
    echo "❌ Chrome non disponible"
fi

# Tester Firefox
if command -v firefox &> /dev/null; then
    echo "✅ Firefox disponible: $(firefox --version)"
else
    echo "❌ Firefox non disponible"
fi

# Tester Node.js
if command -v node &> /dev/null; then
    echo "✅ Node.js disponible: $(node --version)"
else
    echo "❌ Node.js non disponible"
fi

# Tester npm
if command -v npm &> /dev/null; then
    echo "✅ npm disponible: $(npm --version)"
else
    echo "❌ npm non disponible"
fi

# Tester les outils de test
if command -v mochawesome &> /dev/null; then
    echo "✅ mochawesome disponible"
else
    echo "❌ mochawesome non disponible"
fi

echo "🎉 Test d'installation terminé !"
EOF

chmod +x /tmp/test-cypress-install.sh

# Exécuter le test
log "🧪 Exécution du test d'installation..."
/tmp/test-cypress-install.sh

# Nettoyer
rm /tmp/test-cypress-install.sh

log "🎉 Installation des dépendances Cypress terminée !"
log "📋 Résumé de l'installation:"
log "   - Google Chrome: $(google-chrome --version)"
log "   - Firefox: $(firefox --version)"
log "   - Node.js: $(node --version)"
log "   - npm: $(npm --version)"
log "   - Outils de test: mochawesome, mochawesome-merge, mochawesome-report-generator"
log "   - Xvfb configuré pour les tests headless"
log "   - Variables d'environnement configurées"

log "✅ Installation terminée avec succès !"
