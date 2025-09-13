import { Router } from 'express';
import { verifyToken } from '../middleware/auth';

const router = Router();

// All invoice routes require authentication
router.use(verifyToken);

// Mock data for invoices
const mockInvoices = [
  {
    id: 1,
    invoiceNumber: 'INV-2024-001',
    clientId: 1,
    clientName: 'Client Test',
    status: 'paid',
    total: 299.99,
    tax: 59.99,
    subtotal: 240.00,
    dueDate: new Date('2024-02-15'),
    issueDate: new Date('2024-01-15'),
    paidDate: new Date('2024-01-20'),
    items: [
      {
        id: 1,
        description: 'Service de développement',
        quantity: 1,
        unitPrice: 240.00,
        total: 240.00
      }
    ],
    createdAt: new Date()
  }
];

/**
 * @route GET /api/v1/invoices
 * @desc Get all invoices
 * @access Private
 */
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, clientId, dateFrom, dateTo } = req.query;
    
    let filteredInvoices = [...mockInvoices];
    
    // Apply filters
    if (status) {
      filteredInvoices = filteredInvoices.filter(inv => inv.status === status);
    }
    
    if (clientId) {
      filteredInvoices = filteredInvoices.filter(inv => inv.clientId === parseInt(clientId as string));
    }
    
    if (dateFrom) {
      const fromDate = new Date(dateFrom as string);
      filteredInvoices = filteredInvoices.filter(inv => new Date(inv.issueDate) >= fromDate);
    }
    
    if (dateTo) {
      const toDate = new Date(dateTo as string);
      filteredInvoices = filteredInvoices.filter(inv => new Date(inv.issueDate) <= toDate);
    }
    
    // Pagination
    const startIndex = ((page as number) - 1) * (limit as number);
    const endIndex = startIndex + (limit as number);
    const paginatedInvoices = filteredInvoices.slice(startIndex, endIndex);
    
    return res.json({
      success: true,
      data: {
        invoices: paginatedInvoices,
        total: filteredInvoices.length,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(filteredInvoices.length / (limit as number))
      }
    });
  } catch (error) {
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
 * @route GET /api/v1/invoices/:id
 * @desc Get invoice by ID
 * @access Private
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = mockInvoices.find(inv => inv.id === parseInt(id));
    
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
router.post('/', async (req, res) => {
  try {
    const { clientId, items, dueDate, notes } = req.body;
    
    // TODO: Implement invoice creation with database
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);
    const tax = subtotal * 0.2; // 20% TVA
    const total = subtotal + tax;
    
    const newInvoice = {
      id: mockInvoices.length + 1,
      invoiceNumber: `INV-2024-${String(mockInvoices.length + 1).padStart(3, '0')}`,
      clientId,
      clientName: 'Client Test', // TODO: Get from client data
      status: 'draft',
      total,
      tax,
      subtotal,
      dueDate: new Date(dueDate),
      issueDate: new Date(),
      items,
      notes,
      createdAt: new Date()
    };
    
    return res.status(201).json({
      success: true,
      message: 'Facture créée avec succès',
      data: newInvoice
    });
  } catch (error) {
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
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const invoiceIndex = mockInvoices.findIndex(inv => inv.id === parseInt(id));
    
    if (invoiceIndex === -1) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Facture non trouvée',
          code: 'INVOICE_NOT_FOUND',
          statusCode: 404
        }
      });
    }
    
    // TODO: Implement invoice update with database
    const updatedInvoice = {
      ...mockInvoices[invoiceIndex],
      ...req.body,
      id: parseInt(id)
    };
    
    return res.json({
      success: true,
      message: 'Facture mise à jour avec succès',
      data: updatedInvoice
    });
  } catch (error) {
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
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const invoiceIndex = mockInvoices.findIndex(inv => inv.id === parseInt(id));
    
    if (invoiceIndex === -1) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Facture non trouvée',
          code: 'INVOICE_NOT_FOUND',
          statusCode: 404
        }
      });
    }
    
    // TODO: Implement invoice deletion with database
    return res.json({
      success: true,
      message: 'Facture supprimée avec succès'
    });
  } catch (error) {
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
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const invoiceIndex = mockInvoices.findIndex(inv => inv.id === parseInt(id));
    
    if (invoiceIndex === -1) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Facture non trouvée',
          code: 'INVOICE_NOT_FOUND',
          statusCode: 404
        }
      });
    }
    
    // TODO: Implement status update with database
    const updatedInvoice = {
      ...mockInvoices[invoiceIndex],
      status,
      paidDate: status === 'paid' ? new Date() : null
    };
    
    return res.json({
      success: true,
      message: `Facture ${status === 'paid' ? 'marquée comme payée' : 'mise à jour'}`,
      data: updatedInvoice
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
 * @route GET /api/v1/invoices/stats
 * @desc Get invoice statistics
 * @access Private
 */
router.get('/stats', async (req, res) => {
  try {
    const totalInvoices = mockInvoices.length;
    const paidInvoices = mockInvoices.filter(inv => inv.status === 'paid').length;
    const pendingInvoices = mockInvoices.filter(inv => inv.status === 'pending').length;
    const overdueInvoices = mockInvoices.filter(inv => 
      inv.status === 'pending' && new Date(inv.dueDate) < new Date()
    ).length;
    const totalRevenue = mockInvoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.total, 0);
    
    return res.json({
      success: true,
      data: {
        total: totalInvoices,
        paid: paidInvoices,
        pending: pendingInvoices,
        overdue: overdueInvoices,
        totalRevenue,
        averageInvoice: totalInvoices > 0 ? totalRevenue / paidInvoices : 0
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


