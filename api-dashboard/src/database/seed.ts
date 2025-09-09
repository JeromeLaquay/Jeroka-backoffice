import bcrypt from 'bcryptjs'
import { connectDatabase, query, closeDatabase } from './connection'
import { logger } from '@/utils/logger'

async function seedDatabase() {
  try {
    logger.info('🌱 Démarrage du seeding de la base de données...')
    
    // Se connecter à la base de données
    await connectDatabase()
    logger.info('✅ Connexion à la base de données établie')
    
    // Créer des utilisateurs de test
    await seedUsers()
    
    // Créer des clients de test
    await seedClients()
    
    // Créer des messages de test
    await seedMessages()
    
    // Créer des produits de test
    await seedProducts()
    
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
      const passwordHash = await bcrypt.hash(userData.password, 12)
      
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

async function seedClients() {
  logger.info('🤝 Création des clients de test...')
  
  const clients = [
    {
      type: 'company',
      companyName: 'Tech Solutions SARL',
      firstName: 'Marie',
      lastName: 'Dubois',
      email: 'marie@techsolutions.fr',
      phone: '01 23 45 67 89',
      city: 'Paris',
      status: 'active'
    },
    {
      type: 'company',
      companyName: 'Design Studio',
      firstName: 'Pierre',
      lastName: 'Martin',
      email: 'pierre@designstudio.fr',
      phone: '02 34 56 78 90',
      city: 'Lyon',
      status: 'active'
    },
    {
      type: 'individual',
      firstName: 'Sophie',
      lastName: 'Bernard',
      email: 'sophie.bernard@email.fr',
      phone: '03 45 67 89 01',
      city: 'Marseille',
      status: 'prospect'
    }
  ]
  
  for (const clientData of clients) {
    try {
      // Vérifier si le client existe déjà
      const existing = await query(
        'SELECT id FROM clients WHERE email = $1',
        [clientData.email]
      )
      
      if (existing.rows.length > 0) {
        logger.info(`⚠️  Client ${clientData.email} existe déjà`)
        continue
      }
      
      // Créer le client
      await query(
        `INSERT INTO clients (
          type, company_name, first_name, last_name, email, phone, city, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          clientData.type,
          clientData.companyName || null,
          clientData.firstName,
          clientData.lastName,
          clientData.email,
          clientData.phone,
          clientData.city,
          clientData.status
        ]
      )
      
      logger.info(`✅ Client créé: ${clientData.firstName} ${clientData.lastName}`)
    } catch (error) {
      logger.error(`❌ Erreur lors de la création du client ${clientData.email}:`, error)
    }
  }
}

async function seedMessages() {
  logger.info('📧 Création des messages de test...')
  
  const messages = [
    {
      name: 'Alice Moreau',
      email: 'alice.moreau@exemple.fr',
      subject: 'Demande de devis pour site web',
      message: 'Bonjour, je souhaiterais obtenir un devis pour la création d\'un site vitrine pour mon entreprise de cosmétiques bio.',
      type: 'devis',
      status: 'unread'
    },
    {
      name: 'Thomas Dupont',
      email: 'thomas.dupont@tech.fr',
      subject: 'Information sur l\'automatisation',
      message: 'Nous aimerions en savoir plus sur vos solutions d\'automatisation pour les PME.',
      type: 'information',
      status: 'unread'
    },
    {
      name: 'Sarah Johnson',
      email: 'sarah@agency.com',
      subject: 'Proposition de partenariat',
      message: 'Hello, We are a digital marketing agency and would like to explore partnership opportunities.',
      type: 'partnership',
      status: 'read'
    }
  ]
  
  for (const messageData of messages) {
    try {
      await query(
        `INSERT INTO contact_messages (
          name, email, subject, message, type, status
        ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          messageData.name,
          messageData.email,
          messageData.subject,
          messageData.message,
          messageData.type,
          messageData.status
        ]
      )
      
      logger.info(`✅ Message créé: ${messageData.subject}`)
    } catch (error) {
      logger.error(`❌ Erreur lors de la création du message:`, error)
    }
  }
}

async function seedProducts() {
  logger.info('📦 Création des produits de test...')
  
  const products = [
    {
      name: 'Site Web Vitrine',
      description: 'Création d\'un site web vitrine professionnel',
      priceHt: 1200.00,
      category: 'Web',
      isActive: true
    },
    {
      name: 'Site E-commerce',
      description: 'Création d\'une boutique en ligne complète',
      priceHt: 2500.00,
      category: 'Web',
      isActive: true
    },
    {
      name: 'Automatisation RPA',
      description: 'Solution d\'automatisation des processus robotiques',
      priceHt: 800.00,
      category: 'Automatisation',
      isActive: true
    },
    {
      name: 'Consulting Digital',
      description: 'Conseil en transformation digitale (par jour)',
      priceHt: 600.00,
      category: 'Conseil',
      isActive: true
    }
  ]
  
  for (const productData of products) {
    try {
      await query(
        `INSERT INTO products (
          name, description, price_ht, category, is_active
        ) VALUES ($1, $2, $3, $4, $5)`,
        [
          productData.name,
          productData.description,
          productData.priceHt,
          productData.category,
          productData.isActive
        ]
      )
      
      logger.info(`✅ Produit créé: ${productData.name}`)
    } catch (error) {
      logger.error(`❌ Erreur lors de la création du produit:`, error)
    }
  }
}

// Exécuter le seeding si ce fichier est appelé directement
if (require.main === module) {
  seedDatabase()
    .then(() => {
      logger.info('✨ Seeding terminé avec succès')
      process.exit(0)
    })
    .catch((error) => {
      logger.error('💥 Échec du seeding:', error)
      process.exit(1)
    })
}

export { seedDatabase }


