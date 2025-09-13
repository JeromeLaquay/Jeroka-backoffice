import { readFileSync } from 'fs'
import { join } from 'path'
import { connectDatabase, query, closeDatabase } from './connection'
import { logger } from './utils/logger'

async function runMigrations() {
  try {
    logger.info('🚀 Démarrage des migrations de base de données...')
    
    // Se connecter à la base de données
    await connectDatabase()
    logger.info('✅ Connexion à la base de données établie')
    
    // Lire le fichier SQL de migration
    const migrationPath = join(__dirname, 'migrations.sql')
    const migrationSQL = readFileSync(migrationPath, 'utf8')
    
    logger.info('📄 Fichier de migration chargé')
    
    // Diviser en requêtes individuelles (par point-virgule)
    const queries = migrationSQL
      .split(';')
      .map(q => q.trim())
      .filter(q => q.length > 0 && !q.startsWith('--'))
    
    logger.info(`📊 ${queries.length} requêtes de migration à exécuter`)
    
    // Exécuter chaque requête
    for (let i = 0; i < queries.length; i++) {
      const sql = queries[i]
      
      try {
        await query(sql)
        logger.info(`✅ Migration ${i + 1}/${queries.length} réussie`)
      } catch (error: any) {
        // Ignorer certaines erreurs attendues (extensions déjà existantes, etc.)
        if (error.code === '42710' || // Extension déjà existe
            error.code === '42P07' || // Relation déjà existe
            error.message?.includes('already exists')) {
          logger.warn(`⚠️  Migration ${i + 1}/${queries.length} ignorée (déjà existante)`)
          continue
        }
        
        logger.error(`❌ Erreur dans la migration ${i + 1}:`, error)
        throw error
      }
    }
    
    logger.info('🎉 Toutes les migrations ont été exécutées avec succès !')
    
    // Vérifier que les tables principales existent
    const tables = ['users', 'clients', 'contact_messages', 'publications', 'products', 'quotes', 'invoices']
    
    for (const table of tables) {
      const result = await query(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        )`,
        [table]
      )
      
      if (result.rows[0].exists) {
        logger.info(`✅ Table '${table}' créée avec succès`)
      } else {
        logger.error(`❌ Table '${table}' manquante`)
      }
    }
    
    // Vérifier l'utilisateur admin par défaut
    const adminResult = await query(
      'SELECT email FROM users WHERE email = $1',
      ['admin@jeroka.com']
    )
    
    if (adminResult.rows.length > 0) {
      logger.info('✅ Utilisateur admin par défaut créé')
      logger.info('📧 Email: admin@jeroka.com')
      logger.info('🔑 Mot de passe: admin123')
    } else {
      logger.warn('⚠️  Utilisateur admin par défaut non trouvé')
    }
    
  } catch (error) {
    logger.error('💥 Erreur lors des migrations:', error)
    process.exit(1)
  } finally {
    await closeDatabase()
    logger.info('🔌 Connexion à la base de données fermée')
  }
}

// Exécuter les migrations si ce fichier est appelé directement
if (require.main === module) {
  runMigrations()
    .then(() => {
      logger.info('✨ Migrations terminées avec succès')
      process.exit(0)
    })
    .catch((error) => {
      logger.error('💥 Échec des migrations:', error)
      process.exit(1)
    })
}

export { runMigrations }


