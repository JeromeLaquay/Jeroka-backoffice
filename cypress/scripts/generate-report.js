#!/usr/bin/env node

/**
 * Script pour générer un rapport consolidé des tests Cypress
 * Utilisé par GitHub Actions pour créer un rapport unifié
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const REPORTS_DIR = path.join(__dirname, '../reports');
const CONSOLIDATED_DIR = path.join(REPORTS_DIR, 'consolidated');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-');

console.log('🚀 Génération du rapport consolidé des tests Cypress...');

// Créer le dossier consolidated s'il n'existe pas
if (!fs.existsSync(CONSOLIDATED_DIR)) {
  fs.mkdirSync(CONSOLIDATED_DIR, { recursive: true });
}

try {
  // Trouver tous les fichiers mochawesome.json
  const jsonFiles = [];
  
  if (fs.existsSync(REPORTS_DIR)) {
    const findJsonFiles = (dir) => {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          findJsonFiles(filePath);
        } else if (file === 'mochawesome.json') {
          jsonFiles.push(filePath);
        }
      });
    };
    
    findJsonFiles(REPORTS_DIR);
  }
  
  if (jsonFiles.length === 0) {
    console.log('⚠️  Aucun fichier mochawesome.json trouvé');
    process.exit(0);
  }
  
  console.log(`📁 ${jsonFiles.length} fichier(s) de rapport trouvé(s)`);
  
  // Fusionner les rapports
  const mergeCommand = `npx mochawesome-merge ${jsonFiles.join(' ')} > ${path.join(CONSOLIDATED_DIR, 'consolidated-report.json')}`;
  console.log('🔄 Fusion des rapports...');
  execSync(mergeCommand, { stdio: 'inherit' });
  
  // Générer le rapport HTML
  const generateCommand = `npx marge ${path.join(CONSOLIDATED_DIR, 'consolidated-report.json')} --reportDir ${CONSOLIDATED_DIR} --inline --timestamp`;
  console.log('📊 Génération du rapport HTML...');
  execSync(generateCommand, { stdio: 'inherit' });
  
  // Créer un fichier de métadonnées
  const metadata = {
    timestamp: new Date().toISOString(),
    buildNumber: process.env.GITHUB_RUN_NUMBER || 'local',
    branch: process.env.GITHUB_REF_NAME || 'local',
    commit: process.env.GITHUB_SHA || 'local',
    totalReports: jsonFiles.length,
    reportFiles: jsonFiles.map(f => path.relative(REPORTS_DIR, f))
  };
  
  fs.writeFileSync(
    path.join(CONSOLIDATED_DIR, 'metadata.json'),
    JSON.stringify(metadata, null, 2)
  );
  
  console.log('✅ Rapport consolidé généré avec succès !');
  console.log(`📄 Rapport disponible dans: ${CONSOLIDATED_DIR}`);
  
} catch (error) {
  console.error('❌ Erreur lors de la génération du rapport:', error.message);
  process.exit(1);
}
