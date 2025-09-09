@echo off
echo 🟣 Démarrage du Backoffice Jeroka

echo 📋 Vérification des prérequis...

REM Vérifier si Node.js est installé
node --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ Node.js n'est pas installé
    pause
    exit /b 1
)

REM Vérifier si les dépendances sont installées
if not exist "node_modules" (
    echo 📦 Installation des dépendances...
    npm install
)

echo 🔧 Configuration...

REM Vérifier si le fichier .env existe
if not exist ".env" (
    echo ⚠️  Fichier .env manquant, création automatique...
    echo # Configuration API > .env
    echo VITE_API_URL=http://localhost:3002/api/v1 >> .env
    echo VITE_APP_NAME=Jeroka Backoffice >> .env
    echo VITE_APP_VERSION=1.0.0 >> .env
    echo VITE_DEV_MODE=true >> .env
)

echo 🟣 Lancement du Backoffice Jeroka...
echo 📊 Interface disponible sur http://localhost:3001
echo 🔗 API Backend : http://localhost:3002
echo.
echo 🔑 Identifiants de test :
echo    Email: admin@jeroka.com
echo    Mot de passe: admin123
echo.
echo ⚠️  Assurez-vous que l'API backend est démarrée !
echo    (Exécutez start.bat dans le dossier api-dashboard)
echo.

npm run dev

echo.
echo 🛑 Backoffice arrêté
pause


