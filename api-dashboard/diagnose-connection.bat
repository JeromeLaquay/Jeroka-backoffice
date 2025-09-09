@echo off
echo 🔍 Diagnostic de connexion PostgreSQL

echo 📋 1. Vérification des conteneurs...
docker ps --filter "name=jeroka" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo.
echo 📋 2. Test de connexion PostgreSQL depuis le conteneur...
echo ======================================================
docker exec jeroka-postgres-dev pg_isready -U postgres -d jeroka_dashboard
if %ERRORLEVEL% equ 0 (
    echo ✅ PostgreSQL est prêt
) else (
    echo ❌ PostgreSQL n'est pas prêt
)

echo.
echo 📋 3. Test de connexion directe...
echo ================================
docker exec jeroka-postgres-dev psql -U postgres -d jeroka_dashboard -c "SELECT 1 as test;"
if %ERRORLEVEL% equ 0 (
    echo ✅ Connexion PostgreSQL réussie
) else (
    echo ❌ Connexion PostgreSQL échouée
)

echo.
echo 📋 4. Vérification des variables PostgreSQL...
echo =============================================
docker exec jeroka-postgres-dev env | findstr POSTGRES

echo.
echo 📋 5. Test de connexion depuis l'API...
echo ====================================
docker exec jeroka-api-dev node -e "
const { Pool } = require('pg');
const pool = new Pool({
  host: 'postgres-dev',
  port: 5432,
  database: 'jeroka_dashboard',
  user: 'postgres',
  password: 'postgres'
});
pool.query('SELECT 1 as test')
  .then(() => console.log('✅ Connexion API → PostgreSQL réussie'))
  .catch(err => console.log('❌ Erreur:', err.message))
  .finally(() => pool.end());
"

echo.
echo 📋 6. Logs PostgreSQL récents...
echo ==============================
docker logs jeroka-postgres-dev --tail 10

echo.
echo 📋 7. Logs API récents...
echo =======================
docker logs jeroka-api-dev --tail 10

pause
