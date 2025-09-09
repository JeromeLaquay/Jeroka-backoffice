@echo off
echo 🔄 Réinitialisation complète PostgreSQL

echo 📋 Étape 1: Arrêt des services...
docker-compose -f docker-compose.dev.yml stop

echo.
echo 📋 Étape 2: Suppression du volume PostgreSQL...
docker volume rm jeroka-postgres-dev-data
if %ERRORLEVEL% equ 0 (
    echo ✅ Volume supprimé
) else (
    echo ⚠️  Impossible de supprimer le volume (peut-être déjà supprimé)
)

echo.
echo 📋 Étape 3: Suppression des conteneurs...
docker-compose -f docker-compose.dev.yml rm -f

echo.
echo 📋 Étape 4: Reconstruction PostgreSQL...
docker-compose -f docker-compose.dev.yml up -d postgres-dev

echo.
echo ⏳ Attente de l'initialisation PostgreSQL (45 secondes)...
timeout /t 45 /nobreak >nul

echo.
echo 📋 Étape 5: Vérification PostgreSQL...
docker exec jeroka-postgres-dev pg_isready -U postgres -d jeroka_dashboard

echo.
echo 📋 Étape 6: Test de connexion...
docker exec jeroka-postgres-dev psql -U postgres -d jeroka_dashboard -c "SELECT version();"

echo.
echo 📋 Étape 7: Vérification des tables...
docker exec jeroka-postgres-dev psql -U postgres -d jeroka_dashboard -c "\dt"

echo.
echo 📋 Étape 8: Démarrage de l'API...
docker-compose -f docker-compose.dev.yml up -d api-dev

echo.
echo ⏳ Attente du démarrage de l'API (20 secondes)...
timeout /t 20 /nobreak >nul

echo.
echo 📋 Étape 9: Test final...
curl -s http://localhost:3002/health

echo.
echo 🎯 Réinitialisation terminée !

pause
