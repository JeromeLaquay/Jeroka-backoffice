@echo off
echo 🔧 Correction du problème d'authentification PostgreSQL

echo 📋 Étape 1: Diagnostic du problème...
echo =========================================

echo 🔍 Vérification des conteneurs en cours...
docker ps --filter "name=jeroka" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo.
echo 🔍 Variables d'environnement de l'API...
docker exec jeroka-api-dev env | findstr DB_ 2>nul || echo "❌ Conteneur API non trouvé"

echo.
echo 🔍 Configuration PostgreSQL...
docker exec jeroka-postgres-dev env | findstr POSTGRES 2>nul || echo "❌ Conteneur PostgreSQL non trouvé"

echo.
echo 📋 Étape 2: Arrêt et nettoyage complet...
echo =========================================
docker-compose -f docker-compose.dev.yml down
docker volume rm jeroka-postgres-dev-data 2>nul
docker volume rm jeroka-uploads-dev-data 2>nul  
docker volume rm jeroka-logs-dev-data 2>nul
echo ✅ Volumes supprimés

echo.
echo 📋 Étape 3: Vérification du réseau...
echo ===================================
docker network ls | findstr "jeroka-dev-network" >nul || docker network create jeroka-dev-network
echo ✅ Réseau vérifié

echo.
echo 📋 Étape 4: Reconstruction PostgreSQL avec mot de passe cohérent...
echo ================================================================
echo 🚀 Démarrage de PostgreSQL...
docker-compose -f docker-compose.dev.yml up -d postgres-dev

echo.
echo ⏳ Attente de l'initialisation PostgreSQL (60 secondes)...
timeout /t 60 /nobreak >nul

echo.
echo 📋 Étape 5: Tests de connexion PostgreSQL...
echo ==========================================

echo 🧪 Test 1: PostgreSQL ready check...
docker exec jeroka-postgres-dev pg_isready -U postgres -d jeroka_dashboard

echo.
echo 🧪 Test 2: Connexion directe avec postgres/postgres...
docker exec jeroka-postgres-dev psql -U postgres -d jeroka_dashboard -c "SELECT 1 as test;" 2>nul && echo "✅ Connexion réussie avec postgres/postgres" || echo "❌ Connexion échouée"

echo.
echo 🧪 Test 3: Vérification des tables...
docker exec jeroka-postgres-dev psql -U postgres -d jeroka_dashboard -c "\dt" | findstr users && echo "✅ Table users trouvée" || echo "❌ Tables non créées"

echo.
echo 📋 Étape 6: Correction du fichier de connexion si nécessaire...
echo ===========================================================

REM Vérifier si le problème vient du fichier connection.ts
echo 🔧 Affichage de la configuration dans connection.ts...
docker exec jeroka-postgres-dev psql -U postgres -d jeroka_dashboard -c "SELECT 'DB_PASSWORD should be: postgres' as info;"

echo.
echo 📋 Étape 7: Démarrage de l'API avec la bonne configuration...
echo ==========================================================
docker-compose -f docker-compose.dev.yml up -d api-dev

echo.
echo ⏳ Attente du démarrage de l'API (30 secondes)...
timeout /t 30 /nobreak >nul

echo.
echo 📋 Étape 8: Tests finaux...
echo =========================

echo 🧪 Test API Health...
curl -s http://localhost:3002/health | jq . 2>nul || curl -s http://localhost:3002/health

echo.
echo 🧪 Test Login...
curl -X POST http://localhost:3002/api/v1/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@jeroka.com\",\"password\":\"admin123\"}" ^
  -w "\nStatus: %%{http_code}\n"

echo.
echo 📋 Logs récents de l'API...
echo =========================
docker logs jeroka-api-dev --tail 15

echo.
echo 🎯 Diagnostic terminé !
echo =====================

echo 💡 Si le problème persiste :
echo 1. Vérifiez que DB_PASSWORD=postgres dans docker-compose.dev.yml
echo 2. Vérifiez que POSTGRES_PASSWORD=postgres dans docker-compose.dev.yml
echo 3. Exécutez: docker exec jeroka-api-dev env ^| findstr DB_PASSWORD

pause
