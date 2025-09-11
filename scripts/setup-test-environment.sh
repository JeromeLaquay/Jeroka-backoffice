#!/bin/bash

# Script de configuration de l'environnement de test sur le serveur
# Ce script prépare le serveur pour exécuter les tests Cypress

set -e

echo "🚀 Configuration de l'environnement de test Jeroka..."

# Configuration des variables
PROJECT_DIR="/var/www/jeroka-backoffice"
CYPRESS_DIR="$PROJECT_DIR/cypress"
LOG_FILE="/var/log/jeroka-test-setup.log"

# Fonction de logging
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Vérifier que le répertoire du projet existe
if [ ! -d "$PROJECT_DIR" ]; then
    log "❌ Répertoire du projet non trouvé: $PROJECT_DIR"
    exit 1
fi

log "📁 Navigation vers le répertoire du projet: $PROJECT_DIR"
cd "$PROJECT_DIR"

# Vérifier que Docker est installé et en cours d'exécution
if ! command -v docker &> /dev/null; then
    log "❌ Docker n'est pas installé"
    exit 1
fi

if ! docker info &> /dev/null; then
    log "❌ Docker n'est pas en cours d'exécution"
    exit 1
fi

log "✅ Docker est disponible"

# Vérifier que Docker Compose est disponible
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    log "❌ Docker Compose n'est pas disponible"
    exit 1
fi

log "✅ Docker Compose est disponible"

# Vérifier que Node.js est installé
if ! command -v node &> /dev/null; then
    log "📦 Installation de Node.js..."
    
    # Installation de Node.js 18 via NodeSource
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    apt-get install -y nodejs
    
    log "✅ Node.js installé: $(node --version)"
else
    log "✅ Node.js déjà installé: $(node --version)"
fi

# Vérifier que npm est disponible
if ! command -v npm &> /dev/null; then
    log "❌ npm n'est pas disponible"
    exit 1
fi

log "✅ npm disponible: $(npm --version)"

# Vérifier que le répertoire Cypress existe
if [ ! -d "$CYPRESS_DIR" ]; then
    log "❌ Répertoire Cypress non trouvé: $CYPRESS_DIR"
    exit 1
fi

log "✅ Répertoire Cypress trouvé"

# Installer les dépendances Cypress
log "📦 Installation des dépendances Cypress..."
cd "$CYPRESS_DIR"

if [ -f "package-lock.json" ]; then
    npm install --production=false
else
    npm install
fi

log "✅ Dépendances Cypress installées"

# Créer le répertoire des rapports s'il n'existe pas
mkdir -p "$CYPRESS_DIR/reports"
mkdir -p "$CYPRESS_DIR/screenshots"
mkdir -p "$CYPRESS_DIR/videos"

log "✅ Répertoires de rapports créés"

# Vérifier que les services sont en cours d'exécution
log "🔍 Vérification des services Docker..."

# Vérifier que les conteneurs sont en cours d'exécution
if docker compose -f "$PROJECT_DIR/docker-compose.prod.yml" ps | grep -q "Up"; then
    log "✅ Services Docker en cours d'exécution"
else
    log "⚠️ Aucun service Docker en cours d'exécution"
    log "🚀 Démarrage des services..."
    
    cd "$PROJECT_DIR"
    docker compose -f docker-compose.prod.yml up -d
    
    # Attendre que les services soient prêts
    log "⏳ Attente du démarrage des services..."
    sleep 30
fi

# Vérifier l'accessibilité des services
log "🔍 Vérification de l'accessibilité des services..."

# Vérifier l'API
if curl -f http://localhost:3002/health > /dev/null 2>&1; then
    log "✅ API accessible sur http://localhost:3002"
else
    log "⚠️ API non accessible sur http://localhost:3002"
fi

# Vérifier le backoffice
if curl -f http://localhost:3001 > /dev/null 2>&1; then
    log "✅ Backoffice accessible sur http://localhost:3001"
else
    log "⚠️ Backoffice non accessible sur http://localhost:3001"
fi

# Vérifier l'accessibilité via les domaines de production
if curl -f https://apibackoffice.jerokaxperience.fr/health > /dev/null 2>&1; then
    log "✅ API accessible via https://apibackoffice.jerokaxperience.fr"
else
    log "⚠️ API non accessible via https://apibackoffice.jerokaxperience.fr"
fi

if curl -f https://backoffice.jerokaxperience.fr > /dev/null 2>&1; then
    log "✅ Backoffice accessible via https://backoffice.jerokaxperience.fr"
else
    log "⚠️ Backoffice non accessible via https://backoffice.jerokaxperience.fr"
fi

# Créer un fichier de configuration pour les tests
log "📝 Création du fichier de configuration des tests..."

cat > "$CYPRESS_DIR/.env.test" << EOF
# Configuration des tests Cypress pour le serveur
CYPRESS_BASE_URL=https://backoffice.jerokaxperience.fr
API_BASE_URL=https://apibackoffice.jerokaxperience.fr
BACKOFFICE_URL=https://backoffice.jerokaxperience.fr

# Comptes de test (à configurer dans GitHub Secrets)
TEST_USER_EMAIL=\${TEST_USER_EMAIL}
TEST_USER_PASSWORD=\${TEST_USER_PASSWORD}
ADMIN_EMAIL=\${ADMIN_EMAIL}
ADMIN_PASSWORD=\${ADMIN_PASSWORD}

# Configuration des timeouts pour les tests sur serveur
CYPRESS_DEFAULT_COMMAND_TIMEOUT=15000
CYPRESS_REQUEST_TIMEOUT=15000
CYPRESS_PAGE_LOAD_TIMEOUT=30000
EOF

log "✅ Fichier de configuration créé: $CYPRESS_DIR/.env.test"

# Créer un script de test rapide
log "📝 Création du script de test rapide..."

cat > "$PROJECT_DIR/run-tests.sh" << 'EOF'
#!/bin/bash

# Script de test rapide pour le serveur
set -e

PROJECT_DIR="/var/www/jeroka-backoffice"
CYPRESS_DIR="$PROJECT_DIR/cypress"

echo "🧪 Exécution des tests Cypress sur le serveur..."

cd "$CYPRESS_DIR"

# Charger les variables d'environnement
if [ -f ".env.test" ]; then
    export $(cat .env.test | grep -v '^#' | xargs)
fi

# Vérifier que les services sont accessibles
echo "🔍 Vérification de l'accessibilité des services..."
if ! curl -f "$CYPRESS_BASE_URL" > /dev/null 2>&1; then
    echo "❌ Backoffice non accessible: $CYPRESS_BASE_URL"
    exit 1
fi

if ! curl -f "$API_BASE_URL/health" > /dev/null 2>&1; then
    echo "❌ API non accessible: $API_BASE_URL"
    exit 1
fi

echo "✅ Services accessibles"

# Exécuter les tests
echo "🚀 Exécution des tests Cypress..."
npm run test:ci:chrome

# Générer le rapport
echo "📊 Génération du rapport..."
npm run test:report

echo "✅ Tests terminés !"
echo "📄 Rapport disponible dans: $CYPRESS_DIR/reports/consolidated/"
EOF

chmod +x "$PROJECT_DIR/run-tests.sh"

log "✅ Script de test créé: $PROJECT_DIR/run-tests.sh"

# Créer un cron job pour les tests programmés (optionnel)
log "📅 Configuration du cron job pour les tests programmés..."

# Créer le script cron
cat > "$PROJECT_DIR/run-scheduled-tests.sh" << 'EOF'
#!/bin/bash

# Script de tests programmés
PROJECT_DIR="/var/www/jeroka-backoffice"
LOG_FILE="/var/log/jeroka-scheduled-tests.log"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Début des tests programmés" >> "$LOG_FILE"

cd "$PROJECT_DIR"
./run-tests.sh >> "$LOG_FILE" 2>&1

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Tests programmés terminés" >> "$LOG_FILE"
EOF

chmod +x "$PROJECT_DIR/run-scheduled-tests.sh"

# Ajouter au crontab (tests tous les jours à 3h du matin)
(crontab -l 2>/dev/null; echo "0 3 * * * $PROJECT_DIR/run-scheduled-tests.sh") | crontab -

log "✅ Cron job configuré pour les tests programmés (3h du matin)"

# Résumé de la configuration
log "🎉 Configuration de l'environnement de test terminée !"
log "📋 Résumé:"
log "   - Répertoire du projet: $PROJECT_DIR"
log "   - Répertoire Cypress: $CYPRESS_DIR"
log "   - Script de test: $PROJECT_DIR/run-tests.sh"
log "   - Log des tests: $LOG_FILE"
log "   - Cron job configuré pour 3h du matin"

log "🚀 Pour exécuter les tests manuellement:"
log "   cd $PROJECT_DIR && ./run-tests.sh"

log "✅ Configuration terminée avec succès !"
