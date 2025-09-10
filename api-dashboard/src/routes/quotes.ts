import { Router } from 'express';
import { verifyToken } from '@/middleware/auth';

const router = Router();

// All quote routes require authentication
router.use(verifyToken);

// Mock data for quotes
const mockQuotes = [
  {
    id: 1,
    quoteNumber: 'QUO-2024-001',
    clientId: 1,
    clientName: 'Client Test',
    status: 'sent',
    total: 299.99,
    tax: 59.99,
    subtotal: 240.00,
    validUntil: new Date('2024-03-15'),
    issueDate: new Date('2024-01-15'),
    items: [
      {
        id: 1,
        description: 'Service de développement',
        quantity: 1,
        unitPrice: 240.00,
        total: 240.00
      }
    ],
    notes: 'Devis valable 30 jours',
    createdAt: new Date()
  }
];

/**
 * @route GET /api/v1/quotes
 * @desc Get all quotes
 * @access Private
 */
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, clientId, dateFrom, dateTo } = req.query;
    
    let filteredQuotes = [...mockQuotes];
    
    // Apply filters
    if (status) {
      filteredQuotes = filteredQuotes.filter(quote => quote.status === status);
    }
    
    if (clientId) {
      filteredQuotes = filteredQuotes.filter(quote => quote.clientId === parseInt(clientId as string));
    }
    
    if (dateFrom) {
      const fromDate = new Date(dateFrom as string);
      filteredQuotes = filteredQuotes.filter(quote => new Date(quote.issueDate) >= fromDate);
    }
    
    if (dateTo) {
      const toDate = new Date(dateTo as string);
      filteredQuotes = filteredQuotes.filter(quote => new Date(quote.issueDate) <= toDate);
    }
    
    // Pagination
    const startIndex = ((page as number) - 1) * (limit as number);
    const endIndex = startIndex + (limit as number);
    const paginatedQuotes = filteredQuotes.slice(startIndex, endIndex);
    
    return res.json({
      success: true,
      data: {
        quotes: paginatedQuotes,
        total: filteredQuotes.length,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(filteredQuotes.length / (limit as number))
      }
    });
  } catch (error) {
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
 * @route GET /api/v1/quotes/:id
 * @desc Get quote by ID
 * @access Private
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const quote = mockQuotes.find(quote => quote.id === parseInt(id));
    
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
router.post('/', async (req, res) => {
  try {
    const { clientId, items, validUntil, notes } = req.body;
    
    // TODO: Implement quote creation with database
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);
    const tax = subtotal * 0.2; // 20% TVA
    const total = subtotal + tax;
    
    const newQuote = {
      id: mockQuotes.length + 1,
      quoteNumber: `QUO-2024-${String(mockQuotes.length + 1).padStart(3, '0')}`,
      clientId,
      clientName: 'Client Test', // TODO: Get from client data
      status: 'draft',
      total,
      tax,
      subtotal,
      validUntil: new Date(validUntil),
      issueDate: new Date(),
      items,
      notes,
      createdAt: new Date()
    };
    
    return res.status(201).json({
      success: true,
      message: 'Devis créé avec succès',
      data: newQuote
    });
  } catch (error) {
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
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const quoteIndex = mockQuotes.findIndex(quote => quote.id === parseInt(id));
    
    if (quoteIndex === -1) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Devis non trouvé',
          code: 'QUOTE_NOT_FOUND',
          statusCode: 404
        }
      });
    }
    
    // TODO: Implement quote update with database
    const updatedQuote = {
      ...mockQuotes[quoteIndex],
      ...req.body,
      id: parseInt(id)
    };
    
    return res.json({
      success: true,
      message: 'Devis mis à jour avec succès',
      data: updatedQuote
    });
  } catch (error) {
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
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const quoteIndex = mockQuotes.findIndex(quote => quote.id === parseInt(id));
    
    if (quoteIndex === -1) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Devis non trouvé',
          code: 'QUOTE_NOT_FOUND',
          statusCode: 404
        }
      });
    }
    
    // TODO: Implement quote deletion with database
    return res.json({
      success: true,
      message: 'Devis supprimé avec succès'
    });
  } catch (error) {
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
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const quoteIndex = mockQuotes.findIndex(quote => quote.id === parseInt(id));
    
    if (quoteIndex === -1) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Devis non trouvé',
          code: 'QUOTE_NOT_FOUND',
          statusCode: 404
        }
      });
    }
    
    // TODO: Implement status update with database
    const updatedQuote = {
      ...mockQuotes[quoteIndex],
      status
    };
    
    return res.json({
      success: true,
      message: `Devis ${status === 'sent' ? 'envoyé' : 'mis à jour'}`,
      data: updatedQuote
    });
  } catch (error) {
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
router.post('/:id/convert', async (req, res) => {
  try {
    const { id } = req.params;
    const quote = mockQuotes.find(quote => quote.id === parseInt(id));
    
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
    
    if (quote.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Seuls les devis acceptés peuvent être convertis en facture',
          code: 'INVALID_QUOTE_STATUS',
          statusCode: 400
        }
      });
    }
    
    // TODO: Implement quote to invoice conversion
    const newInvoice = {
      id: Date.now(), // Temporary ID
      invoiceNumber: `INV-2024-${String(Date.now()).slice(-3)}`,
      clientId: quote.clientId,
      clientName: quote.clientName,
      status: 'draft',
      total: quote.total,
      tax: quote.tax,
      subtotal: quote.subtotal,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      issueDate: new Date(),
      items: quote.items,
      notes: `Facture générée à partir du devis ${quote.quoteNumber}`,
      createdAt: new Date()
    };
    
    return res.json({
      success: true,
      message: 'Devis converti en facture avec succès',
      data: {
        quote: { ...quote, status: 'converted' },
        invoice: newInvoice
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la conversion du devis',
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
router.get('/stats', async (req, res) => {
  try {
    const totalQuotes = mockQuotes.length;
    const sentQuotes = mockQuotes.filter(quote => quote.status === 'sent').length;
    const acceptedQuotes = mockQuotes.filter(quote => quote.status === 'accepted').length;
    const expiredQuotes = mockQuotes.filter(quote => 
      quote.status === 'sent' && new Date(quote.validUntil) < new Date()
    ).length;
    const totalValue = mockQuotes
      .filter(quote => quote.status === 'accepted')
      .reduce((sum, quote) => sum + quote.total, 0);
    
    return res.json({
      success: true,
      data: {
        total: totalQuotes,
        sent: sentQuotes,
        accepted: acceptedQuotes,
        expired: expiredQuotes,
        totalValue,
        averageQuote: totalQuotes > 0 ? mockQuotes.reduce((sum, quote) => sum + quote.total, 0) / totalQuotes : 0
      }
    });
  } catch (error) {
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

export default router;


