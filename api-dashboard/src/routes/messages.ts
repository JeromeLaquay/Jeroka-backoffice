import { Router, Request, Response } from 'express'
import { verifyToken } from '../middleware/auth'

const router = Router()

// Mock data for development
const mockMessages = [
  {
    id: '44444444-4444-4444-4444-444444444444',
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean.dupont@email.com',
    phone: '+33123456789',
    company: 'Entreprise ABC',
    subject: 'Demande de devis site web',
    message: 'Bonjour, je souhaiterais avoir un devis pour la création d\'un site web e-commerce. Merci.',
    status: 'new',
    priority: 'high',
    source: 'website',
    tags: [],
    assignedTo: null,
    assignedToName: null,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    readAt: null,
    repliedAt: null
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    firstName: 'Marie',
    lastName: 'Martin',
    email: 'marie.martin@email.com',
    phone: '+33987654321',
    company: 'StartupXYZ',
    subject: 'Question sur vos services',
    message: 'Bonjour, pouvez-vous me dire si vous proposez de l\'hébergement web ? Cordialement.',
    status: 'read',
    priority: 'medium',
    source: 'website',
    tags: [],
    assignedTo: null,
    assignedToName: null,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    readAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    repliedAt: null
  },
  {
    id: '66666666-6666-6666-6666-666666666666',
    firstName: 'Pierre',
    lastName: 'Bernard',
    email: 'pierre.bernard@email.com',
    phone: null,
    company: null,
    subject: 'Problème technique',
    message: 'Mon site web ne fonctionne plus depuis ce matin. Pouvez-vous m\'aider ?',
    status: 'replied',
    priority: 'high',
    source: 'email',
    tags: ['urgent'],
    assignedTo: null,
    assignedToName: null,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    readAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    repliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
]

/**
 * @route POST /api/v1/messages
 * @desc Create a new contact message
 * @access Public
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      firstName, lastName, email, phone, company, subject, message,
      source = 'website', priority = 'medium', tags = []
    } = req.body

    const newMessage = {
      id: `msg-${Date.now()}`,
      firstName, lastName, email, phone, company, subject, message,
      status: 'new',
      priority,
      source,
      tags,
      assignedTo: null,
      assignedToName: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      readAt: null,
      repliedAt: null
    }

    // In production, save to database
    mockMessages.unshift(newMessage)

    res.status(201).json({
      success: true,
      message: 'Message de contact créé avec succès',
      data: { id: newMessage.id, createdAt: newMessage.createdAt }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du message',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    })
  }
})

/**
 * @route GET /api/v1/messages
 * @desc Get all messages with filters and pagination
 * @access Private
 */
router.get('/', verifyToken, async (req: Request, res: Response) => {
  try {
    const {
      page = 1, limit = 20, search = '', status, priority
    } = req.query

    let filteredMessages = [...mockMessages]

    // Apply filters
    if (search) {
      const searchLower = String(search).toLowerCase()
      filteredMessages = filteredMessages.filter(m => 
        m.firstName.toLowerCase().includes(searchLower) ||
        m.lastName.toLowerCase().includes(searchLower) ||
        m.email.toLowerCase().includes(searchLower) ||
        m.subject.toLowerCase().includes(searchLower) ||
        m.message.toLowerCase().includes(searchLower)
      )
    }

    if (status) {
      filteredMessages = filteredMessages.filter(m => m.status === status)
    }

    if (priority) {
      filteredMessages = filteredMessages.filter(m => m.priority === priority)
    }

    // Apply pagination
    const totalCount = filteredMessages.length
    const totalPages = Math.ceil(totalCount / Number(limit))
    const offset = (Number(page) - 1) * Number(limit)
    const paginatedMessages = filteredMessages.slice(offset, offset + Number(limit))

    res.json({
      success: true,
      data: {
        messages: paginatedMessages,
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalCount,
          hasNextPage: Number(page) < totalPages,
          hasPrevPage: Number(page) > 1
        }
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des messages'
    })
  }
})

/**
 * @route GET /api/v1/messages/stats
 * @desc Get messages statistics
 * @access Private
 */
router.get('/stats', verifyToken, async (req: Request, res: Response) => {
  try {
    const total = mockMessages.length
    const newCount = mockMessages.filter(m => m.status === 'new').length
    const readCount = mockMessages.filter(m => m.status === 'read').length
    const repliedCount = mockMessages.filter(m => m.status === 'replied').length
    const archivedCount = mockMessages.filter(m => m.status === 'archived').length
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayCount = mockMessages.filter(m => new Date(m.createdAt) >= today).length
    
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const weekCount = mockMessages.filter(m => new Date(m.createdAt) >= weekAgo).length
    
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const monthCount = mockMessages.filter(m => new Date(m.createdAt) >= monthAgo).length

    res.json({
      success: true,
      data: {
        total,
        new: newCount,
        read: readCount,
        replied: repliedCount,
        archived: archivedCount,
        todayCount,
        weekCount,
        monthCount,
        averageResponseTime: 2.5,
        responseRate: 85
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques'
    })
  }
})

/**
 * @route GET /api/v1/messages/:id
 * @desc Get a specific message
 * @access Private
 */
router.get('/:id', verifyToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const message = mockMessages.find(m => m.id === id)

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message non trouvé'
      })
    }

    res.json({ success: true, data: message })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du message'
    })
  }
})

/**
 * @route PUT /api/v1/messages/:id
 * @desc Update a message
 * @access Private
 */
router.put('/:id', verifyToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status, priority, tags, assignedTo } = req.body

    const messageIndex = mockMessages.findIndex(m => m.id === id)
    if (messageIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Message non trouvé'
      })
    }

    const message = mockMessages[messageIndex]
    
    if (status !== undefined) {
      message.status = status
      if (status === 'read' || status === 'replied') {
        message.readAt = new Date().toISOString()
      }
      if (status === 'replied') {
        message.repliedAt = new Date().toISOString()
      }
    }

    if (priority !== undefined) message.priority = priority
    if (tags !== undefined) message.tags = tags
    if (assignedTo !== undefined) message.assignedTo = assignedTo

    message.updatedAt = new Date().toISOString()

    res.json({
      success: true,
      message: 'Message mis à jour avec succès',
      data: message
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du message'
    })
  }
})

/**
 * @route POST /api/v1/messages/:id/mark-read
 * @desc Mark a message as read
 * @access Private
 */
router.post('/:id/mark-read', verifyToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const message = mockMessages.find(m => m.id === id)

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message non trouvé'
      })
    }

    if (message.status === 'new') {
      message.status = 'read'
      message.readAt = new Date().toISOString()
      message.updatedAt = new Date().toISOString()
    }

    res.json({
      success: true,
      message: 'Message marqué comme lu',
      data: message
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors du marquage du message'
    })
  }
})

/**
 * @route POST /api/v1/messages/mark-all-read
 * @desc Mark all messages as read
 * @access Private
 */
router.post('/mark-all-read', verifyToken, async (req: Request, res: Response) => {
  try {
    let updatedCount = 0
    mockMessages.forEach(message => {
      if (message.status === 'new') {
        message.status = 'read'
        message.readAt = new Date().toISOString()
        message.updatedAt = new Date().toISOString()
        updatedCount++
      }
    })

    res.json({
      success: true,
      message: `${updatedCount} message(s) marqué(s) comme lu(s)`,
      data: { updatedCount }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors du marquage des messages'
    })
  }
})

/**
 * @route DELETE /api/v1/messages/:id
 * @desc Delete a message
 * @access Private
 */
router.delete('/:id', verifyToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const messageIndex = mockMessages.findIndex(m => m.id === id)

    if (messageIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Message non trouvé'
      })
    }

    mockMessages.splice(messageIndex, 1)

    res.json({
      success: true,
      message: 'Message supprimé avec succès'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du message'
    })
  }
})

/**
 * @route POST /api/v1/messages/:id/ai-draft
 * @desc Generate AI draft response for a message
 * @access Private
 */
router.post('/:id/ai-draft', verifyToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { tone = 'professionnel', language = 'fr', template } = req.body

    const message = mockMessages.find(m => m.id === id)
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message non trouvé'
      })
    }

    // Simulation de génération IA (en production, utiliser une vraie API IA)
    const generateAIDraft = (msg: any, options: any) => {
      const { tone, language } = options
      
      const greetings = {
        fr: 'Bonjour',
        en: 'Hello'
      }
      
      const thanks = {
        fr: 'Merci pour votre message.',
        en: 'Thank you for your message.'
      }
      
      const signatures = {
        fr: 'Cordialement,\nL\'équipe Jeroka',
        en: 'Kind regards,\nJeroka Team'
      }

      // Détection du type de message
      let responseContent = ''
      const subject = msg.subject.toLowerCase()
      const messageText = msg.message.toLowerCase()
      
      if (subject.includes('devis') || messageText.includes('devis')) {
        responseContent = language === 'fr'
          ? 'Nous avons bien reçu votre demande de devis. Notre équipe va étudier votre projet et vous recontacter sous 24-48h avec une proposition détaillée et un devis personnalisé.'
          : 'We have received your quote request. Our team will review your project and get back to you within 24-48 hours with a detailed proposal and personalized quote.'
      } else if (subject.includes('partenariat') || messageText.includes('partenariat')) {
        responseContent = language === 'fr'
          ? 'Votre proposition de partenariat nous intéresse. Nous allons examiner votre dossier et vous recontacter pour discuter des modalités de collaboration.'
          : 'Your partnership proposal interests us. We will review your file and get back to you to discuss collaboration terms.'
      } else if (subject.includes('information') || messageText.includes('information')) {
        responseContent = language === 'fr'
          ? 'Merci pour votre demande d\'information. Nous vous fournirons les détails demandés dans les plus brefs délais.'
          : 'Thank you for your information request. We will provide you with the requested details as soon as possible.'
      } else {
        responseContent = language === 'fr'
          ? 'Nous avons bien reçu votre message et nous vous remercions de nous avoir contactés. Nous vous répondrons dans les plus brefs délais.'
          : 'We have received your message and thank you for contacting us. We will respond as soon as possible.'
      }

      // Ajustement du ton
      if (tone === 'amical') {
        responseContent = responseContent.replace(/Nous/g, 'Nous').replace(/Merci/g, 'Merci beaucoup')
      } else if (tone === 'concis') {
        responseContent = responseContent.split('.')[0] + '.'
      } else if (tone === 'formel') {
        responseContent = responseContent.replace(/nous/g, 'nous').replace(/vous/g, 'vous')
      }

      const clientName = `${msg.firstName} ${msg.lastName}`.trim()
      const messageSummary = msg.message.slice(0, 200) + (msg.message.length > 200 ? '...' : '')
      
      const nextSteps = language === 'fr'
        ? 'Prochaine étape:\n- Nous revenons vers vous sous 24-48h avec les informations demandées\n- Si urgent, vous pouvez répondre à cet email en précisant votre disponibilité'
        : 'Next steps:\n- We will get back to you within 24-48 hours with the requested information\n- If urgent, you can reply to this email specifying your availability'

      return `${greetings[language]} ${clientName},

${thanks}

${responseContent}

Résumé de votre message:
${messageSummary}

${nextSteps}

${signatures[language]}`
    }

    // Simulation d'un délai de traitement IA
    await new Promise(resolve => setTimeout(resolve, 1500))

    const draft = generateAIDraft(message, { tone, language, template })

    res.json({
      success: true,
      data: {
        draft,
        messageId: id,
        generatedAt: new Date().toISOString(),
        options: { tone, language, template }
      },
      message: 'Brouillon IA généré avec succès'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération du brouillon IA',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    })
  }
})

export default router