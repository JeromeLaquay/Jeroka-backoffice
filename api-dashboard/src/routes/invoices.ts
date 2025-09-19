import { Router, Request, Response } from 'express';
import { verifyToken, AuthRequest } from '../middleware/auth';
import { InvoiceService } from '../services/invoiceService';
import { InvoiceRepository } from '../repositories/invoiceRepository';
import UserRepository from '../repositories/userRepository';

const router = Router();

// All invoice routes require authentication
router.use(verifyToken);

/**
 * @route GET /api/v1/invoices
 * @desc Get all invoices for user's company
 * @access Private
 */
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 10, status, personId, dateFrom, dateTo } = req.query;
    
    const result = await InvoiceService.getInvoices(req.user!.id, {
      page: Number(page),
      limit: Number(limit),
      status: status as string,
      personId: personId as string,
      dateFrom: dateFrom as string,
      dateTo: dateTo as string
    });
    
    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des factures:', error);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération des factures',
        code: 'INTERNAL_ERROR',
        statusCode: 500
      }
    });
  }
});

/**
 * @route GET /api/v1/invoices/stats
 * @desc Get invoice statistics
 * @access Private
 */
router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const stats = await InvoiceService.getInvoiceStats(req.user!.id);
    
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
 * @route GET /api/v1/invoices/:id
 * @desc Get invoice by ID
 * @access Private
 */
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const invoice = await InvoiceService.getInvoice(req.user!.id, id);
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Facture non trouvée',
          code: 'INVOICE_NOT_FOUND',
          statusCode: 404
        }
      });
    }
    
    return res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la facture:', error);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la récupération de la facture',
        code: 'INTERNAL_ERROR',
        statusCode: 500
      }
    });
  }
});

/**
 * @route POST /api/v1/invoices
 * @desc Create new invoice
 * @access Private
 */
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const invoice = await InvoiceService.createInvoice(req.user!.id, req.body);
    
    return res.status(201).json({
      success: true,
      message: 'Facture créée avec succès',
      data: invoice
    });
  } catch (error) {
    console.error('Erreur lors de la création de la facture:', error);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la création de la facture',
        code: 'INTERNAL_ERROR',
        statusCode: 500
      }
    });
  }
});

/**
 * @route PUT /api/v1/invoices/:id
 * @desc Update invoice
 * @access Private
 */
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const invoice = await InvoiceService.updateInvoice(req.user!.id, id, req.body);
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Facture non trouvée',
          code: 'INVOICE_NOT_FOUND',
          statusCode: 404
        }
      });
    }
    
    return res.json({
      success: true,
      message: 'Facture mise à jour avec succès',
      data: invoice
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la facture:', error);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la mise à jour de la facture',
        code: 'INTERNAL_ERROR',
        statusCode: 500
      }
    });
  }
});

/**
 * @route DELETE /api/v1/invoices/:id
 * @desc Delete invoice
 * @access Private
 */
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await InvoiceService.deleteInvoice(req.user!.id, id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Facture non trouvée',
          code: 'INVOICE_NOT_FOUND',
          statusCode: 404
        }
      });
    }
    
    return res.json({
      success: true,
      message: 'Facture supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la facture:', error);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la suppression de la facture',
        code: 'INTERNAL_ERROR',
        statusCode: 500
      }
    });
  }
});

/**
 * @route PUT /api/v1/invoices/:id/status
 * @desc Update invoice status
 * @access Private
 */
router.put('/:id/status', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const invoice = await InvoiceService.updateInvoiceStatus(req.user!.id, id, status);
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Facture non trouvée',
          code: 'INVOICE_NOT_FOUND',
          statusCode: 404
        }
      });
    }
    
    return res.json({
      success: true,
      message: `Facture ${status === 'paid' ? 'marquée comme payée' : 'mise à jour'}`,
      data: invoice
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
 * @route POST /api/v1/invoices/:id/mark-paid
 * @desc Mark invoice as paid
 * @access Private
 */
router.post('/:id/mark-paid', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const invoice = await InvoiceService.markAsPaid(req.user!.id, id);
    
    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Facture non trouvée',
          code: 'INVOICE_NOT_FOUND',
          statusCode: 404
        }
      });
    }
    
    return res.json({
      success: true,
      message: 'Facture marquée comme payée',
      data: invoice
    });
  } catch (error) {
    console.error('Erreur lors du marquage de la facture:', error);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors du marquage de la facture',
        code: 'INTERNAL_ERROR',
        statusCode: 500
      }
    });
  }
});

/**
 * @route GET /api/v1/invoices/next-number
 * @desc Get next invoice number
 * @access Private
 */
router.get('/next-number', async (req: AuthRequest, res: Response) => {
  try {
    const invoiceNumber = await InvoiceRepository.generateInvoiceNumber(req.user!.company_id);
    
    return res.json({
      success: true,
      data: { invoiceNumber }
    });
  } catch (error) {
    console.error('Erreur lors de la génération du numéro de facture:', error);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la génération du numéro de facture',
        code: 'INTERNAL_ERROR',
        statusCode: 500
      }
    });
  }
});

export default router;


