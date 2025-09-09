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

export default router