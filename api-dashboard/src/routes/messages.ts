import { Router, Request, Response } from 'express'
import { verifyToken, AuthRequest } from '../middleware/auth'
import { MessageService } from '../services/messageService'

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

    // En dev: garder le mock. En prod: on persiste
    if (process.env.NODE_ENV !== 'development') {
      // Si on a un companyId (via optionalAuth plus tard), on persiste
      return res.status(501).json({ success: false, message: 'Not implemented in dev' })
    }
    mockMessages.unshift(newMessage)

    return res.status(201).json({
      success: true,
      message: 'Message de contact créé avec succès',
      data: { id: newMessage.id, createdAt: newMessage.createdAt }
    })
  } catch (error) {
    return res.status(500).json({
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
router.get('/', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.id ? req.user!.id /* to replace by company_id from user */ : ''
    // NOTE: ici, utilisez req.user.company_id quand disponible dans middleware
    const result = await MessageService.getMessages(companyId, req.query as any)
    return res.json({ success: true, data: { messages: result.data, pagination: {
      currentPage: result.currentPage,
      totalPages: result.totalPages,
      totalCount: result.total,
      hasNextPage: result.currentPage < result.totalPages,
      hasPrevPage: result.currentPage > 1
    } } })
  } catch (error) {
    return res.status(500).json({
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
router.get('/stats', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.id // remplacez par req.user.company_id
    const stats = await MessageService.getStats(companyId)
    return res.json({ success: true, data: stats })
  } catch (error) {
    return res.status(500).json({
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
router.get('/:id', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const companyId = req.user!.id // remplacez par req.user.company_id
    const message = await MessageService.getById(id, companyId)
    if (!message) return res.status(404).json({ success: false, message: 'Message non trouvé' })
    return res.json({ success: true, data: message })
  } catch (error) {
    return res.status(500).json({
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
router.put('/:id', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const companyId = req.user!.id // remplacez par req.user.company_id
    const updated = await MessageService.update(id, companyId, req.body)
    if (!updated) return res.status(404).json({ success: false, message: 'Message non trouvé' })
    return res.json({ success: true, message: 'Message mis à jour avec succès', data: updated })
  } catch (error) {
    return res.status(500).json({
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
router.post('/:id/mark-read', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const companyId = req.user!.id // remplacez par req.user.company_id
    const updated = await MessageService.markRead(id, companyId)
    if (!updated) return res.status(404).json({ success: false, message: 'Message non trouvé' })
    return res.json({ success: true, message: 'Message marqué comme lu', data: updated })
  } catch (error) {
    return res.status(500).json({
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
router.post('/mark-all-read', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.id // remplacez par req.user.company_id
    const result = await MessageService.markAllRead(companyId)
    return res.json({ success: true, message: `${result.updatedCount} message(s) marqué(s) comme lu(s)`, data: result })
  } catch (error) {
    return res.status(500).json({
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
router.delete('/:id', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const companyId = req.user!.id // remplacez par req.user.company_id
    const ok = await MessageService.remove(id, companyId as any)
    if (!ok) return res.status(404).json({ success: false, message: 'Message non trouvé' })
    return res.json({ success: true, message: 'Message supprimé avec succès' })
  } catch (error) {
    return res.status(500).json({
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
      
      const greetings: { fr: string; en: string } = {
        fr: 'Bonjour',
        en: 'Hello'
      }
      
      const thanks: { fr: string; en: string } = {
        fr: 'Merci pour votre message.',
        en: 'Thank you for your message.'
      }
      
      const signatures: { fr: string; en: string } = {
        fr: 'Cordialement,\nL\'équipe Jeroka',
        en: 'Kind regards,\nJeroka Team'
      }

      // Normaliser la langue
      const lang: 'fr' | 'en' = language === 'en' ? 'en' : 'fr'

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

        return `${greetings[lang]} ${clientName},

${thanks[lang]}

${responseContent}

Résumé de votre message:
${messageSummary}

${nextSteps}

${signatures[lang]}`
    }

    // Simulation d'un délai de traitement IA
    await new Promise(resolve => setTimeout(resolve, 1500))

    const draft = generateAIDraft(message, { tone, language, template })

    return res.json({
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
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération du brouillon IA',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    })
  }
})

export default router