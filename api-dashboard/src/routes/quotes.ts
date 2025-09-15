import { Router, Request, Response } from 'express';
import { verifyToken, AuthRequest } from '../middleware/auth';
import { QuoteService } from '../services/quoteService';

const router = Router();

// All quote routes require authentication
router.use(verifyToken);

/**
 * @route GET /api/v1/quotes
 * @desc Get all quotes for user's company
 * @access Private
 */
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 10, status, clientId, dateFrom, dateTo } = req.query;
    
    const result = await QuoteService.getQuotes(req.user!, {
      page: Number(page),
      limit: Number(limit),
      status: status as string,
      clientId: clientId as string,
      dateFrom: dateFrom as string,
      dateTo: dateTo as string
    });
    
    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des devis:', error);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération des devis',
        code: 'INTERNAL_ERROR',
        statusCode: 500
      }
    });
  }
});

/**
 * @route GET /api/v1/quotes/stats
 * @desc Get quote statistics
 * @access Private
 */
router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const stats = await QuoteService.getQuoteStats(req.user!.id);
    
    return res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération des statistiques',
        code: 'INTERNAL_ERROR',
        statusCode: 500
      }
    });
  }
});

/**
 * @route GET /api/v1/quotes/:id
 * @desc Get quote by ID
 * @access Private
 */
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const quote = await QuoteService.getQuote(req.user!.id, id);
    
    if (!quote) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Devis non trouvé',
          code: 'QUOTE_NOT_FOUND',
          statusCode: 404
        }
      });
    }
    
    return res.json({
      success: true,
      data: quote
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du devis:', error);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération du devis',
        code: 'INTERNAL_ERROR',
        statusCode: 500
      }
    });
  }
});

/**
 * @route POST /api/v1/quotes
 * @desc Create new quote
 * @access Private
 */
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    console.log('req.user', req.user);
    const quote = await QuoteService.createQuote(req.user!, req.body);
    
    return res.status(201).json({
      success: true,
      message: 'Devis créé avec succès',
      data: quote
    });
  } catch (error) {
    console.error('Erreur lors de la création du devis:', error);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la création du devis',
        code: 'INTERNAL_ERROR',
        statusCode: 500
      }
    });
  }
});

/**
 * @route PUT /api/v1/quotes/:id
 * @desc Update quote
 * @access Private
 */
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const quote = await QuoteService.updateQuote(req.user!.id, id, req.body);
    
    if (!quote) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Devis non trouvé',
          code: 'QUOTE_NOT_FOUND',
          statusCode: 404
        }
      });
    }
    
    return res.json({
      success: true,
      message: 'Devis mis à jour avec succès',
      data: quote
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du devis:', error);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la mise à jour du devis',
        code: 'INTERNAL_ERROR',
        statusCode: 500
      }
    });
  }
});

/**
 * @route DELETE /api/v1/quotes/:id
 * @desc Delete quote
 * @access Private
 */
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await QuoteService.deleteQuote(req.user!.id, id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Devis non trouvé',
          code: 'QUOTE_NOT_FOUND',
          statusCode: 404
        }
      });
    }
    
    return res.json({
      success: true,
      message: 'Devis supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du devis:', error);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la suppression du devis',
        code: 'INTERNAL_ERROR',
        statusCode: 500
      }
    });
  }
});

/**
 * @route PUT /api/v1/quotes/:id/status
 * @desc Update quote status
 * @access Private
 */
router.put('/:id/status', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const quote = await QuoteService.updateQuoteStatus(req.user!.id, id, status);
    
    if (!quote) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Devis non trouvé',
          code: 'QUOTE_NOT_FOUND',
          statusCode: 404
        }
      });
    }
    
    return res.json({
      success: true,
      message: `Devis ${status === 'sent' ? 'envoyé' : 'mis à jour'}`,
      data: quote
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la mise à jour du statut',
        code: 'INTERNAL_ERROR',
        statusCode: 500
      }
    });
  }
});

/**
 * @route POST /api/v1/quotes/:id/convert
 * @desc Convert quote to invoice
 * @access Private
 */
router.post('/:id/convert', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await QuoteService.convertToInvoice(req.user!.id, id);
    
    return res.json({
      success: true,
      message: 'Devis converti en facture avec succès',
      data: result
    });
  } catch (error) {
    console.error('Erreur lors de la conversion du devis:', error);
    return res.status(500).json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Erreur lors de la conversion du devis',
        code: 'INTERNAL_ERROR',
        statusCode: 500
      }
    });
  }
});

export default router;


