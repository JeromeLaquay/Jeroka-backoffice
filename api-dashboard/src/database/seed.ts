import bcrypt from 'bcryptjs'
import { connectDatabase, query, closeDatabase } from './connection'
import { logger } from '../utils/logger'

async function seedDatabase() {
  try {
    logger.info('🌱 Démarrage du seeding de la base de données...')
    
    // Se connecter à la base de données
    await connectDatabase()
    logger.info('✅ Connexion à la base de données établie')
    
    // Créer des utilisateurs de test
    await seedUsers()
    
    logger.info('🎉 Seeding terminé avec succès !')
    
  } catch (error) {
    logger.error('💥 Erreur lors du seeding:', error)
    process.exit(1)
  } finally {
    await closeDatabase()
    logger.info('🔌 Connexion à la base de données fermée')
  }
}

async function seedUsers() {
  logger.info('👥 Création des utilisateurs de test...')
  
  const users = [
    {
      email: 'admin@jeroka.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'Jeroka',
      role: 'admin'
    },
    {
      email: 'manager@jeroka.com',
      password: 'manager123',
      firstName: 'Manager',
      lastName: 'Jeroka',
      role: 'manager'
    },
    {
      email: 'user@jeroka.com',
      password: 'user123',
      firstName: 'User',
      lastName: 'Jeroka',
      role: 'user'
    }
  ]
  
  for (const userData of users) {
    try {
      // Vérifier si l'utilisateur existe déjà
      const existing = await query(
        'SELECT id FROM users WHERE email = $1',
        [userData.email]
      )
      
      if (existing.rows.length > 0) {
        logger.info(`⚠️  Utilisateur ${userData.email} existe déjà`)
        continue
      }
      
      // Hasher le mot de passe
      const passwordHash = "$2a$12$Uz/Ho.6RCKaqPGcI7Aupl.4ci/LPfM0tmLHpMiyie0tFKqc/.sj3y"
      
      // Créer l'utilisateur
      await query(
        `INSERT INTO users (email, password_hash, first_name, last_name, role, is_active, email_verified) 
         VALUES ($1, $2, $3, $4, $5, true, true)`,
        [userData.email, passwordHash, userData.firstName, userData.lastName, userData.role]
      )
      
      logger.info(`✅ Utilisateur créé: ${userData.email} (${userData.role})`)
    } catch (error) {
      logger.error(`❌ Erreur lors de la création de ${userData.email}:`, error)
    }
  }
}


export { seedDatabase }


