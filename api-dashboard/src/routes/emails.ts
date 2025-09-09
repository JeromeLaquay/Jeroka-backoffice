import express from 'express';
import { Request, Response } from 'express';
import multer from 'multer';
import { verifyToken } from '@/middleware/auth';
import { logger } from '@/utils/logger';

const router = express.Router();

// Configuration multer pour les pièces jointes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/email-attachments/');
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${timestamp}-${sanitizedName}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    // Accepter tous les types de fichiers pour les pièces jointes email
    cb(null, true);
  }
});

// Types pour TypeScript
interface EmailCategory {
  id: string;
  name: string;
  downloadAttachments: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface EmailSender {
  id: string;
  email: string;
  name?: string;
  categoryId?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Email {
  id: string;
  subject: string;
  from: string;
  to: string;
  date: Date;
  messageId: string;
  hasAttachments: boolean;
  attachments: EmailAttachment[];
  categoryId?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface EmailAttachment {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  emailId: string;
  analyzed: boolean;
  analysisResult?: any;
  createdAt: Date;
}

// ===== ROUTES CATÉGORIES EMAIL =====

// GET /api/v1/emails/categories - Récupérer toutes les catégories
router.get('/categories', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    // TODO: Remplacer par la vraie base de données
    const mockCategories: EmailCategory[] = [
      {
        id: '1',
        name: 'Fournisseurs',
        downloadAttachments: true,
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        name: 'Clients',
        downloadAttachments: true,
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        name: 'Factures',
        downloadAttachments: true,
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '4',
        name: 'Devis',
        downloadAttachments: false,
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    res.json({
      success: true,
      data: mockCategories
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération des catégories email:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur interne du serveur',
        code: 'INTERNAL_ERROR',
        statusCode: 500
      }
    });
  }
});

// POST /api/v1/emails/categories - Créer une nouvelle catégorie
router.post('/categories', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { name, downloadAttachments } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Le nom de la catégorie est requis',
          code: 'VALIDATION_ERROR',
          statusCode: 400
        }
      });
    }

    // TODO: Créer en base de données
    const newCategory: EmailCategory = {
      id: Date.now().toString(),
      name: name.trim(),
      downloadAttachments: Boolean(downloadAttachments),
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    res.status(201).json({
      success: true,
      data: newCategory,
      message: 'Catégorie créée avec succès'
    });
  } catch (error) {
    logger.error('Erreur lors de la création de la catégorie:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur interne du serveur',
        code: 'INTERNAL_ERROR',
        statusCode: 500
      }
    });
  }
});

// PUT /api/v1/emails/categories/:id - Modifier une catégorie
router.put('/categories/:id', verifyToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const { name, downloadAttachments } = req.body;

    // TODO: Vérifier que la catégorie existe et appartient à l'utilisateur
    // TODO: Mettre à jour en base de données

    const updatedCategory: EmailCategory = {
      id,
      name: name?.trim() || 'Catégorie mise à jour',
      downloadAttachments: Boolean(downloadAttachments),
      userId,
      createdAt: new Date(Date.now() - 86400000), // Date simulée
      updatedAt: new Date()
    };

    res.json({
      success: true,
      data: updatedCategory,
      message: 'Catégorie mise à jour avec succès'
    });
  } catch (error) {
    logger.error('Erreur lors de la mise à jour de la catégorie:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur interne du serveur',
        code: 'INTERNAL_ERROR',
        statusCode: 500
      }
    });
  }
});

// DELETE /api/v1/emails/categories/:id - Supprimer une catégorie
router.delete('/categories/:id', verifyToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    // TODO: Vérifier que la catégorie existe et appartient à l'utilisateur
    // TODO: Supprimer de la base de données

    res.json({
      success: true,
      message: 'Catégorie supprimée avec succès'
    });
  } catch (error) {
    logger.error('Erreur lors de la suppression de la catégorie:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur interne du serveur',
        code: 'INTERNAL_ERROR',
        statusCode: 500
      }
    });
  }
});

// ===== ROUTES EXPÉDITEURS EMAIL =====

// GET /api/v1/emails/senders - Récupérer tous les expéditeurs
router.get('/senders', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    // TODO: Remplacer par la vraie base de données
    const mockSenders: EmailSender[] = [
      {
        id: '1',
        email: 'fournisseur1@example.com',
        name: 'Fournisseur 1',
        categoryId: '1',
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        email: 'client@example.com',
        name: 'Client Important',
        categoryId: '2',
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        email: 'comptabilite@example.com',
        name: 'Service Comptabilité',
        categoryId: undefined,
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    res.json({
      success: true,
      data: mockSenders
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération des expéditeurs:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur interne du serveur',
        code: 'INTERNAL_ERROR',
        statusCode: 500
      }
    });
  }
});

// PUT /api/v1/emails/senders/:id/category - Associer un expéditeur à une catégorie
router.put('/senders/:id/category', verifyToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const { categoryId } = req.body;

    // TODO: Vérifier que l'expéditeur et la catégorie existent et appartiennent à l'utilisateur
    // TODO: Mettre à jour en base de données

    res.json({
      success: true,
      message: 'Expéditeur associé à la catégorie avec succès'
    });
  } catch (error) {
    logger.error('Erreur lors de l\'association expéditeur-catégorie:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur interne du serveur',
        code: 'INTERNAL_ERROR',
        statusCode: 500
      }
    });
  }
});

// ===== ROUTES EMAILS =====

// GET /api/v1/emails - Récupérer tous les emails
router.get('/', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { page = 1, limit = 20, categoryId, hasAttachments } = req.query;
    
    // TODO: Remplacer par la vraie base de données avec pagination
    const mockEmails: Email[] = [
      {
        id: '1',
        subject: 'Facture n°2024-001',
        from: 'fournisseur1@example.com',
        to: 'user@example.com',
        date: new Date('2024-01-15'),
        messageId: '<msg1@example.com>',
        hasAttachments: true,
        attachments: [
          {
            id: '1',
            filename: '1642248000000-facture_2024_001.pdf',
            originalName: 'facture_2024_001.pdf',
            mimeType: 'application/pdf',
            size: 256000,
            path: 'uploads/email-attachments/1642248000000-facture_2024_001.pdf',
            emailId: '1',
            analyzed: false,
            createdAt: new Date()
          }
        ],
        categoryId: '1',
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        subject: 'Devis travaux',
        from: 'client@example.com',
        to: 'user@example.com',
        date: new Date('2024-01-14'),
        messageId: '<msg2@example.com>',
        hasAttachments: true,
        attachments: [
          {
            id: '2',
            filename: '1642248000001-devis_travaux.pdf',
            originalName: 'devis_travaux.pdf',
            mimeType: 'application/pdf',
            size: 512000,
            path: 'uploads/email-attachments/1642248000001-devis_travaux.pdf',
            emailId: '2',
            analyzed: true,
            analysisResult: {
              type: 'devis',
              amount: 2500.00,
              currency: 'EUR',
              extractedData: {
                client: 'Client Important',
                date: '2024-01-14',
                items: []
              }
            },
            createdAt: new Date()
          }
        ],
        categoryId: '2',
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Filtrer selon les paramètres
    let filteredEmails = mockEmails;
    if (categoryId) {
      filteredEmails = filteredEmails.filter(email => email.categoryId === categoryId);
    }
    if (hasAttachments === 'true') {
      filteredEmails = filteredEmails.filter(email => email.hasAttachments);
    }

    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedEmails = filteredEmails.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedEmails,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: filteredEmails.length,
        totalPages: Math.ceil(filteredEmails.length / Number(limit))
      }
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération des emails:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur interne du serveur',
        code: 'INTERNAL_ERROR',
        statusCode: 500
      }
    });
  }
});

// POST /api/v1/emails/sync - Synchroniser les emails depuis la boîte mail
router.post('/sync', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    // TODO: Implémenter la synchronisation réelle avec IMAP/POP3
    // Cette route devrait:
    // 1. Se connecter à la boîte mail de l'utilisateur
    // 2. Récupérer les nouveaux emails
    // 3. Télécharger les pièces jointes selon les catégories
    // 4. Sauvegarder en base de données

    logger.info(`Synchronisation des emails demandée pour l'utilisateur ${userId}`);

    // Simulation d'une synchronisation
    await new Promise(resolve => setTimeout(resolve, 2000));

    res.json({
      success: true,
      message: 'Synchronisation des emails terminée',
      data: {
        newEmails: 3,
        downloadedAttachments: 2
      }
    });
  } catch (error) {
    logger.error('Erreur lors de la synchronisation des emails:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la synchronisation',
        code: 'SYNC_ERROR',
        statusCode: 500
      }
    });
  }
});

// ===== ROUTES PIÈCES JOINTES =====

// GET /api/v1/emails/attachments - Récupérer toutes les pièces jointes
router.get('/attachments', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { analyzed, page = 1, limit = 20 } = req.query;
    
    // TODO: Récupérer depuis la base de données
    const mockAttachments: EmailAttachment[] = [
      {
        id: '1',
        filename: '1642248000000-facture_2024_001.pdf',
        originalName: 'facture_2024_001.pdf',
        mimeType: 'application/pdf',
        size: 256000,
        path: 'uploads/email-attachments/1642248000000-facture_2024_001.pdf',
        emailId: '1',
        analyzed: false,
        createdAt: new Date()
      },
      {
        id: '2',
        filename: '1642248000001-devis_travaux.pdf',
        originalName: 'devis_travaux.pdf',
        mimeType: 'application/pdf',
        size: 512000,
        path: 'uploads/email-attachments/1642248000001-devis_travaux.pdf',
        emailId: '2',
        analyzed: true,
        analysisResult: {
          type: 'devis',
          amount: 2500.00,
          currency: 'EUR',
          extractedData: {
            client: 'Client Important',
            date: '2024-01-14',
            items: []
          }
        },
        createdAt: new Date()
      }
    ];

    let filteredAttachments = mockAttachments;
    if (analyzed !== undefined) {
      filteredAttachments = filteredAttachments.filter(att => 
        analyzed === 'true' ? att.analyzed : !att.analyzed
      );
    }

    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedAttachments = filteredAttachments.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedAttachments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: filteredAttachments.length,
        totalPages: Math.ceil(filteredAttachments.length / Number(limit))
      }
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération des pièces jointes:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur interne du serveur',
        code: 'INTERNAL_ERROR',
        statusCode: 500
      }
    });
  }
});

// POST /api/v1/emails/attachments/:id/analyze - Analyser une pièce jointe avec IA
router.post('/attachments/:id/analyze', verifyToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const { analysisType } = req.body; // 'facture', 'devis', 'auto'

    // TODO: Vérifier que la pièce jointe existe et appartient à l'utilisateur
    // TODO: Implémenter l'analyse réelle avec ChatGPT/IA
    
    logger.info(`Analyse demandée pour la pièce jointe ${id}, type: ${analysisType}`);

    // Simulation d'une analyse IA
    await new Promise(resolve => setTimeout(resolve, 3000));

    const mockAnalysisResult = {
      type: analysisType || 'facture',
      confidence: 0.95,
      amount: 1250.50,
      currency: 'EUR',
      extractedData: {
        supplier: 'Fournisseur Example',
        invoiceNumber: 'FAC-2024-001',
        date: '2024-01-15',
        dueDate: '2024-02-15',
        items: [
          {
            description: 'Prestation de service',
            quantity: 1,
            unitPrice: 1000.50,
            totalPrice: 1000.50
          },
          {
            description: 'Frais de déplacement',
            quantity: 1,
            unitPrice: 250.00,
            totalPrice: 250.00
          }
        ],
        tax: {
          rate: 0.20,
          amount: 250.10
        },
        totalHT: 1250.50,
        totalTTC: 1500.60
      },
      suggestions: {
        createInvoice: analysisType === 'facture',
        createQuote: analysisType === 'devis',
        clientMatch: 'Client détecté: Fournisseur Example'
      }
    };

    res.json({
      success: true,
      data: {
        attachmentId: id,
        analysisResult: mockAnalysisResult
      },
      message: 'Analyse terminée avec succès'
    });
  } catch (error) {
    logger.error('Erreur lors de l\'analyse de la pièce jointe:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de l\'analyse',
        code: 'ANALYSIS_ERROR',
        statusCode: 500
      }
    });
  }
});

// POST /api/v1/emails/attachments/:id/convert - Convertir l'analyse en facture/devis
router.post('/attachments/:id/convert', verifyToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const { convertTo, analysisData } = req.body; // 'invoice' ou 'quote'

    // TODO: Vérifier que la pièce jointe existe et a été analysée
    // TODO: Créer la facture/devis à partir des données analysées
    
    logger.info(`Conversion demandée pour la pièce jointe ${id} vers ${convertTo}`);

    // Simulation de la création
    await new Promise(resolve => setTimeout(resolve, 1000));

    const createdDocumentId = Date.now().toString();

    res.json({
      success: true,
      data: {
        documentId: createdDocumentId,
        type: convertTo,
        redirectUrl: convertTo === 'invoice' ? `/factures/${createdDocumentId}` : `/devis/${createdDocumentId}`
      },
      message: `${convertTo === 'invoice' ? 'Facture' : 'Devis'} créé avec succès`
    });
  } catch (error) {
    logger.error('Erreur lors de la conversion:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors de la conversion',
        code: 'CONVERSION_ERROR',
        statusCode: 500
      }
    });
  }
});

// GET /api/v1/emails/attachments/:id/download - Télécharger une pièce jointe
router.get('/attachments/:id/download', verifyToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    // TODO: Vérifier que la pièce jointe existe et appartient à l'utilisateur
    // TODO: Récupérer le chemin du fichier depuis la base de données
    
    // Simulation du téléchargement
    const mockFilePath = `uploads/email-attachments/1642248000000-facture_2024_001.pdf`;
    const mockOriginalName = 'facture_2024_001.pdf';

    // En production, utiliser res.download() avec le vrai chemin
    res.json({
      success: true,
      message: 'Téléchargement disponible',
      data: {
        downloadUrl: `/uploads/email-attachments/${id}`,
        filename: mockOriginalName
      }
    });
  } catch (error) {
    logger.error('Erreur lors du téléchargement:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Erreur lors du téléchargement',
        code: 'DOWNLOAD_ERROR',
        statusCode: 500
      }
    });
  }
});

export default router;
