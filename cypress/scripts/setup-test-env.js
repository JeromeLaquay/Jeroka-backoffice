#!/usr/bin/env node

/**
 * Script pour configurer l'environnement de test
 * Vérifie que tous les services nécessaires sont disponibles
 */

const http = require('http');
const https = require('https');

// Configuration
const SERVICES = [
  {
    name: 'Backoffice',
    url: process.env.BACKOFFICE_URL || 'http://localhost:3001',
    timeout: 10000
  },
  {
    name: 'API Dashboard',
    url: process.env.API_BASE_URL || 'http://localhost:3002',
    timeout: 10000
  }
];

/**
 * Vérifier si un service est disponible
 */
function checkService(service) {
  return new Promise((resolve, reject) => {
    const url = new URL(service.url);
    const client = url.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      method: 'GET',
      timeout: service.timeout
    };
    
    const req = client.request(options, (res) => {
      resolve({
        service: service.name,
        status: res.statusCode,
        available: res.statusCode < 500
      });
    });
    
    req.on('error', (error) => {
      resolve({
        service: service.name,
        status: 'ERROR',
        available: false,
        error: error.message
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({
        service: service.name,
        status: 'TIMEOUT',
        available: false,
        error: 'Service timeout'
      });
    });
    
    req.end();
  });
}

/**
 * Attendre qu'un service soit disponible
 */
async function waitForService(service, maxAttempts = 30, delay = 2000) {
  console.log(`⏳ Attente de ${service.name} (${service.url})...`);
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const result = await checkService(service);
    
    if (result.available) {
      console.log(`✅ ${service.name} est disponible (${result.status})`);
      return true;
    }
    
    console.log(`⏳ Tentative ${attempt}/${maxAttempts} - ${service.name} non disponible (${result.status})`);
    
    if (attempt < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  console.log(`❌ ${service.name} n'est pas disponible après ${maxAttempts} tentatives`);
  return false;
}

/**
 * Fonction principale
 */
async function main() {
  console.log('🚀 Configuration de l\'environnement de test...');
  
  const results = [];
  
  for (const service of SERVICES) {
    const isAvailable = await waitForService(service);
    results.push({
      service: service.name,
      available: isAvailable
    });
  }
  
  // Afficher le résumé
  console.log('\n📊 Résumé de la configuration:');
  results.forEach(result => {
    const status = result.available ? '✅' : '❌';
    console.log(`${status} ${result.service}: ${result.available ? 'Disponible' : 'Non disponible'}`);
  });
  
  // Vérifier si tous les services sont disponibles
  const allAvailable = results.every(result => result.available);
  
  if (allAvailable) {
    console.log('\n🎉 Tous les services sont disponibles ! Les tests peuvent commencer.');
    process.exit(0);
  } else {
    console.log('\n⚠️  Certains services ne sont pas disponibles. Les tests peuvent échouer.');
    process.exit(1);
  }
}

// Exécuter le script
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Erreur lors de la configuration:', error);
    process.exit(1);
  });
}

module.exports = { checkService, waitForService };
