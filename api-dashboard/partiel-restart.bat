@echo off
echo 🔄 Redémarrage partiel de l'API Dashboard
echo ========================================

echo.
echo 📋 Étape 1/4: Arrêt de l'API uniquement...
docker-compose -f docker-compose.dev.yml stop api-dev

echo.
echo 📋 Étape 2/4: Suppression du conteneur API...
docker-compose -f docker-compose.dev.yml rm -f api-dev

echo.
echo 📋 Étape 3/4: Redémarrage de l'API...
docker-compose -f docker-compose.dev.yml up -d api-dev

echo.
echo ⏳ Attente du démarrage de l'API (30 secondes)...
timeout /t 15 /nobreak >nul

echo.
echo 📋 Étape 4/4: Tests de vérification...
echo =====================================

echo 🧪 Test 1: Health Check...
curl -s http://localhost:3002/health | jq . 2>nul || curl -s http://localhost:3002/health

echo.
echo 🧪 Test 2: Vérification des logs récents...
echo =========================================
docker logs jeroka-api-dev --tail 5

echo.
echo 🎯 Redémarrage partiel terminé !
echo ===============================

echo 🌐 Services disponibles :
echo    🚀 API: http://localhost:3002
echo    🏥 Health: http://localhost:3002/health
echo    🗄️ PostgreSQL: Toujours actif (non redémarré)

echo.
echo 💡 Si l'API ne répond toujours pas :
echo    1. Vérifiez les logs: docker logs jeroka-api-dev
echo    2. Utilisez le redémarrage complet: complete-restart.bat

pause
