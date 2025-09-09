@echo off
echo 🚀 Redémarrage complet avec solution du problème PostgreSQL

echo ================================
echo 🔧 SOLUTION ÉTAPE PAR ÉTAPE
echo ================================

echo.
echo 📋 Étape 1/9: Arrêt complet...
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.pgadmin.yml down 2>nul

echo.
echo 📋 Étape 2/9: Nettoyage des volumes...
docker volume rm jeroka-postgres-dev-data 2>nul
docker volume rm jeroka-uploads-dev-data 2>nul
docker volume rm jeroka-logs-dev-data 2>nul
echo ✅ Volumes nettoyés

echo.
echo 📋 Étape 3/9: Nettoyage des conteneurs...
docker container rm jeroka-postgres-dev 2>nul
docker container rm jeroka-api-dev 2>nul
docker container rm jeroka-adminer-dev 2>nul
echo ✅ Conteneurs supprimés

echo.
echo 📋 Étape 4/9: Vérification du réseau...
docker network ls | findstr "jeroka-dev-network" >nul || docker network create jeroka-dev-network
echo ✅ Réseau prêt

echo.
echo 📋 Étape 5/9: Démarrage PostgreSQL seul...
docker-compose -f docker-compose.dev.yml up -d postgres-dev

echo.
echo ⏳ Étape 6/9: Attente PostgreSQL (75 secondes)...
echo    PostgreSQL a besoin de temps pour :
echo    - Initialiser la base de données
echo    - Exécuter les migrations
echo    - Créer les tables et utilisateurs
timeout /t 30 /nobreak >nul

echo.
echo 📋 Étape 7/9: Vérification PostgreSQL...
:check_postgres
docker exec jeroka-postgres-dev pg_isready -U postgres -d jeroka_dashboard >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ⏳ PostgreSQL pas encore prêt, attente supplémentaire...
    timeout /t 15 /nobreak >nul
    goto check_postgres
)
echo ✅ PostgreSQL prêt !

echo.
echo 🧪 Test de connexion PostgreSQL...
docker exec jeroka-postgres-dev psql -U postgres -d jeroka_dashboard -c "SELECT 1 as test;" >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo ✅ Connexion PostgreSQL fonctionnelle
) else (
    echo ❌ Problème de connexion PostgreSQL
    echo 🔧 Tentative de récupération...
    docker exec jeroka-postgres-dev psql -U postgres -c "ALTER USER postgres PASSWORD 'postgres';"
)

echo.
echo 📋 Étape 8/9: Démarrage de l'API...
docker-compose -f docker-compose.dev.yml up -d api-dev

echo.
echo ⏳ Attente du démarrage de l'API (45 secondes)...
timeout /t 20 /nobreak >nul

echo.
echo 📋 Étape 9/9: Tests finaux...
echo ===========================

echo 🧪 Test 1: Health Check...
curl -s http://localhost:3002/health | jq . 2>nul || curl -s http://localhost:3002/health

echo.
echo 🧪 Test 2: Login API...
curl -X POST http://localhost:3002/api/v1/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@jeroka.com\",\"password\":\"admin123\"}" ^
  -w "\nHTTP Status: %%{http_code}\n"

echo.
echo 📋 Logs récents de l'API...
echo =========================
docker logs jeroka-api-dev --tail 8

echo.
echo 🎯 Redémarrage terminé !
echo ======================

echo 🌐 Services disponibles :
echo    🚀 API: http://localhost:3002
echo    🏥 Health: http://localhost:3002/health
echo    🗂️ Adminer: http://localhost:8080 (pas encore démarré)

echo.
echo 💡 Pour démarrer Adminer :
echo    docker-compose -f docker-compose.dev.yml up -d adminer-dev

echo.
echo 💡 Si le problème persiste :
echo    1. Exécutez: diagnose-connection.bat
echo    2. Vérifiez les logs: docker logs jeroka-api-dev
echo    3. Vérifiez PostgreSQL: docker logs jeroka-postgres-dev

pause
