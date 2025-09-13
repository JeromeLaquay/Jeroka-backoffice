import { Router, Request, Response } from 'express'
import { verifyToken, AuthRequest } from '../middleware/auth'
import { MessageService } from '../services/messageService'
import { MessageIAService } from '../services/messageIAService'

const router = Router();

router.use(verifyToken);


/**
 * @route POST /api/v1/messages
 * @desc Create a new contact message
 * @access Public
 */
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const {
      firstName, lastName, email, phone, subject, message,
      source = 'website', priority = 'medium', tags = []
    } = req.body

    const companyId = "11111111-1111-1111-1111-111111111111";

    const messageData = {
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      subject,
      message
    }

    const result = await MessageService.create(companyId, messageData)

    return res.status(201).json({
      success: true,
      message: 'Message de contact créé avec succès',
      data: result
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
    const companyId = req.user!.company_id;
    console.log('get messages', companyId)
    const result = await MessageService.getMessages(companyId, req.query as any)
    return res.json({ success: true, data: { messages: result.data, pagination: {
      currentPage: result.currentPage,
      totalPages: result.totalPages,
      totalCount: result.total,
      hasNextPage: result.currentPage < result.totalPages,
      hasPrevPage: result.currentPage > 1
    } } })
  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error)
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des messages',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
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
    const companyId = req.user!.company_id;
    const stats = await MessageService.getStats(companyId)
    return res.json({ success: true, data: stats })
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error)
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
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
    const companyId = req.user!.company_id;
    const message = await MessageService.getById(id, companyId)
    if (!message) return res.status(404).json({ success: false, message: 'Message non trouvé' })
    return res.json({ success: true, data: message })
  } catch (error) {
    console.error('Erreur lors de la récupération du message:', error)
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du message',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
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
    const companyId = req.user!.company_id;
    const updated = await MessageService.update(id, companyId, req.body)
    if (!updated) return res.status(404).json({ success: false, message: 'Message non trouvé' })
    return res.json({ success: true, message: 'Message mis à jour avec succès', data: updated })
  } catch (error) {
    console.error('Erreur lors de la mise à jour du message:', error)
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du message',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
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
    const companyId = req.user!.company_id;
    const updated = await MessageService.markRead(id, companyId)
    if (!updated) return res.status(404).json({ success: false, message: 'Message non trouvé' })
    return res.json({ success: true, message: 'Message marqué comme lu', data: updated })
  } catch (error) {
    console.error('Erreur lors du marquage du message:', error)
    return res.status(500).json({
      success: false,
      message: 'Erreur lors du marquage du message',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
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
    const companyId = req.user!.company_id;
    const result = await MessageService.markAllRead(companyId)
    return res.json({ success: true, message: `${result.updatedCount} message(s) marqué(s) comme lu(s)`, data: result })
  } catch (error) {
    console.error('Erreur lors du marquage des messages:', error)
    return res.status(500).json({
      success: false,
      message: 'Erreur lors du marquage des messages',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
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
    const companyId = req.user!.company_id;
    const ok = await MessageService.remove(id, companyId)
    if (!ok) return res.status(404).json({ success: false, message: 'Message non trouvé' })
    return res.json({ success: true, message: 'Message supprimé avec succès' })
  } catch (error) {
    console.error('Erreur lors de la suppression du message:', error)
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du message',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    })
  }
})


/**
 * @route POST /api/v1/messages/:id/mark-unread
 * @desc Mark a message as unread
 * @access Private
 */
router.post('/:id/mark-unread', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const companyId = req.user!.company_id;
    const message = await MessageService.update(id, companyId, { status: 'new', read_at: null })
    if (!message) return res.status(404).json({ success: false, message: 'Message non trouvé' })
    return res.json({ success: true, data: message, message: 'Message marqué comme non lu' })
  } catch (error) {
    console.error('Erreur lors du marquage du message:', error)
    return res.status(500).json({
      success: false,
      message: 'Erreur lors du marquage du message',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    })
  }
})


/**
 * @route POST /api/v1/messages/:id/ai-draft
 * @desc Generate AI draft response for a message
 * @access Private
 */
router.post('/:id/ai-draft', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { tone = 'professionnel', language = 'fr' } = req.body
    const companyId = req.user!.company_id;

    // Utilisation du service IA
    const draft = await MessageIAService.generateEmailDraft(id, companyId, {
      tone: tone as 'professionnel' | 'amical' | 'formel' | 'concis',
      language: language as 'fr' | 'en',
    })

    return res.json({
      success: true,
      data: {
        draft,
        messageId: id,
        generatedAt: new Date().toISOString(),
        options: { tone, language },
        provider: 'chatgpt'
      },
      message: 'Brouillon IA généré avec succès'
    })
  } catch (error) {
    console.error('Erreur génération IA:', error)
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération du brouillon IA',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    })
  }
})

export default router