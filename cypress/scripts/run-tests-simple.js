#!/usr/bin/env node

/**
 * Script simple pour exécuter les tests Cypress sans vérification des services
 * Utilisé quand les services sont déjà démarrés et accessibles
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🧪 Exécution des tests Cypress (mode simple)...');

try {
  // Aller dans le répertoire cypress
  const cypressDir = path.join(__dirname, '..');
  process.chdir(cypressDir);
  
  console.log('📁 Répertoire de travail:', process.cwd());
  
  // Vérifier que les services sont accessibles localement
  console.log('🔍 Vérification rapide des services locaux...');
  
  try {
    const http = require('http');
    
    // Test rapide du backoffice
    const backofficeTest = new Promise((resolve) => {
      const req = http.get('http://localhost:3001', (res) => {
        console.log('✅ Backoffice accessible sur http://localhost:3001');
        resolve(true);
      });
      req.on('error', () => {
        console.log('⚠️ Backoffice non accessible sur http://localhost:3001');
        resolve(false);
      });
      req.setTimeout(5000, () => {
        console.log('⚠️ Timeout pour le backoffice');
        resolve(false);
      });
    });
    
    // Test rapide de l'API
    const apiTest = new Promise((resolve) => {
      const req = http.get('http://localhost:3002/health', (res) => {
        console.log('✅ API accessible sur http://localhost:3002');
        resolve(true);
      });
      req.on('error', () => {
        console.log('⚠️ API non accessible sur http://localhost:3002');
        resolve(false);
      });
      req.setTimeout(5000, () => {
        console.log('⚠️ Timeout pour l\'API');
        resolve(false);
      });
    });
    
    // Attendre les tests
    await Promise.all([backofficeTest, apiTest]);
    
  } catch (error) {
    console.log('⚠️ Erreur lors de la vérification des services:', error.message);
  }
  
  // Exécuter les tests Cypress
  console.log('🚀 Exécution des tests Cypress...');
  
  // Configuration des variables d'environnement
  const testEnv = {
    ...process.env,
    CYPRESS_BASE_URL: 'http://localhost:3001',
    API_BASE_URL: 'http://localhost:3002',
    BACKOFFICE_URL: 'http://localhost:3001',
    TEST_USER_EMAIL: 'test@jeroka.com',
    TEST_USER_PASSWORD: 'testpassword123',
    ADMIN_EMAIL: 'admin@jeroka.com',
    ADMIN_PASSWORD: 'adminpassword123'
  };
  
  console.log('🔧 Variables d\'environnement configurées:');
  console.log('  - CYPRESS_BASE_URL:', testEnv.CYPRESS_BASE_URL);
  console.log('  - API_BASE_URL:', testEnv.API_BASE_URL);
  console.log('  - BACKOFFICE_URL:', testEnv.BACKOFFICE_URL);
  
  // Exécuter les tests
  execSync('npm run cypress:run:chrome', { 
    stdio: 'inherit',
    env: testEnv
  });
  
  console.log('✅ Tests Cypress terminés avec succès !');
  
} catch (error) {
  console.error('❌ Erreur lors de l\'exécution des tests:', error.message);
  process.exit(1);
}
