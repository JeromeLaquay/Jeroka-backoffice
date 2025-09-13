import { query } from '../database/connection'

async function seedMessages() {
  try {
    console.log('🌱 Seeding messages...')

    // Vérifier si des messages existent déjà
    const existingMessages = await query('SELECT COUNT(*) FROM messages WHERE company_id = $1', ['default-company-id'])
    if (parseInt(existingMessages.rows[0].count) > 0) {
      console.log('✅ Messages already exist, skipping seed')
      return
    }

    // Insérer des messages de test
    const messages = [
      {
        company_id: 'default-company-id',
        first_name: 'Jean',
        last_name: 'Dupont',
        email: 'jean.dupont@email.com',
        phone: '+33123456789',
        company: 'Entreprise ABC',
        subject: 'Demande de devis site web',
        message: 'Bonjour, je souhaiterais avoir un devis pour la création d\'un site web e-commerce. Merci.',
        status: 'new',
        priority: 'high',
        source: 'website',
        tags: ['devis', 'urgent']
      },
      {
        company_id: 'default-company-id',
        first_name: 'Marie',
        last_name: 'Martin',
        email: 'marie.martin@email.com',
        phone: '+33987654321',
        company: 'StartupXYZ',
        subject: 'Question sur vos services',
        message: 'Bonjour, pouvez-vous me dire si vous proposez de l\'hébergement web ? Cordialement.',
        status: 'read',
        priority: 'medium',
        source: 'website',
        tags: ['information']
      },
      {
        company_id: 'default-company-id',
        first_name: 'Pierre',
        last_name: 'Bernard',
        email: 'pierre.bernard@email.com',
        phone: null,
        company: null,
        subject: 'Problème technique',
        message: 'Mon site web ne fonctionne plus depuis ce matin. Pouvez-vous m\'aider ?',
        status: 'replied',
        priority: 'high',
        source: 'email',
        tags: ['urgent', 'technique']
      },
      {
        company_id: 'default-company-id',
        first_name: 'Sophie',
        last_name: 'Leroy',
        email: 'sophie.leroy@partnership.com',
        phone: '+33555666777',
        company: 'Partnership Corp',
        subject: 'Proposition de partenariat',
        message: 'Nous souhaiterions discuter d\'un partenariat stratégique avec votre entreprise.',
        status: 'new',
        priority: 'medium',
        source: 'website',
        tags: ['partnership']
      }
    ]

    for (const message of messages) {
      await query(`
        INSERT INTO messages (
          company_id, first_name, last_name, email, phone, company, subject, message,
          status, priority, source, tags, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
      `, [
        message.company_id,
        message.first_name,
        message.last_name,
        message.email,
        message.phone,
        message.company,
        message.subject,
        message.message,
        message.status,
        message.priority,
        message.source,
        message.tags
      ])
    }

    console.log('✅ Messages seeded successfully!')
  } catch (error) {
    console.error('❌ Error seeding messages:', error)
    throw error
  }
}

// Exécuter le seed si le script est appelé directement
if (require.main === module) {
  seedMessages()
    .then(() => {
      console.log('🎉 Seed completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Seed failed:', error)
      process.exit(1)
    })
}

export { seedMessages }
