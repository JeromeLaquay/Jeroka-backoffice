import { Router, Request, Response } from 'express';
import { verifyToken } from '@/middleware/auth';
import { query, body, param, validationResult } from 'express-validator';

const router = Router();

// Interface pour les clients
interface Client {
  id: string;
  type: 'individual' | 'company';
  firstName: string;
  lastName: string;
  companyName?: string;
  name: string; // Nom complet formaté
  company?: string;
  email: string;
  phone?: string;
  mobile?: string;
  website?: string;
  address: {
    line1?: string;
    line2?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
  siret?: string;
  vatNumber?: string;
  notes?: string;
  avatarUrl?: string;
  status: 'active' | 'inactive' | 'prospect';
  source?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

// Données simulées
let clients: Client[] = [
  {
    id: '1',
    type: 'company',
    firstName: 'Jean',
    lastName: 'Dupont',
    companyName: 'Entreprise Dupont SARL',
    name: 'Jean Dupont',
    company: 'Entreprise Dupont SARL',
    email: 'jean.dupont@entreprise-dupont.fr',
    phone: '01 23 45 67 89',
    mobile: '06 12 34 56 78',
    website: 'https://entreprise-dupont.fr',
    address: {
      line1: '123 Avenue des Champs',
      line2: 'Bâtiment A',
      city: 'Paris',
      postalCode: '75001',
      country: 'France'
    },
    siret: '12345678901234',
    vatNumber: 'FR12345678901',
    notes: 'Client premium depuis 2020. Très satisfait de nos services.',
    status: 'active',
    source: 'website',
    tags: ['premium', 'fidèle'],
    createdAt: '2020-03-15T10:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z'
  },
  {
    id: '2',
    type: 'individual',
    firstName: 'Marie',
    lastName: 'Martin',
    name: 'Marie Martin',
    email: 'marie.martin@email.com',
    phone: '01 98 76 54 32',
    mobile: '06 87 65 43 21',
    address: {
      line1: '456 Rue de la République',
      city: 'Lyon',
      postalCode: '69001',
      country: 'France'
    },
    notes: 'Particulier intéressé par nos services de consultation.',
    status: 'prospect',
    source: 'referral',
    tags: ['prospect', 'consultation'],
    createdAt: '2024-01-10T09:15:00Z',
    updatedAt: '2024-01-18T16:45:00Z'
  },
  {
    id: '3',
    type: 'company',
    firstName: 'Pierre',
    lastName: 'Durand',
    companyName: 'Tech Solutions SAS',
    name: 'Pierre Durand',
    company: 'Tech Solutions SAS',
    email: 'p.durand@tech-solutions.com',
    phone: '04 56 78 90 12',
    mobile: '06 34 56 78 90',
    website: 'https://tech-solutions.com',
    address: {
      line1: '789 Boulevard de la Technologie',
      city: 'Toulouse',
      postalCode: '31000',
      country: 'France'
    },
    siret: '98765432109876',
    vatNumber: 'FR98765432109',
    notes: 'Startup prometteuse dans le domaine de l\'IA.',
    status: 'active',
    source: 'social_media',
    tags: ['startup', 'technology', 'ai'],
    createdAt: '2023-06-20T11:30:00Z',
    updatedAt: '2024-01-12T10:20:00Z'
  },
  {
    id: '4',
    type: 'individual',
    firstName: 'Sophie',
    lastName: 'Bernard',
    name: 'Sophie Bernard',
    email: 'sophie.bernard@freelance.fr',
    phone: '02 34 56 78 90',
    address: {
      line1: '321 Rue des Artisans',
      city: 'Nantes',
      postalCode: '44000',
      country: 'France'
    },
    notes: 'Freelance en design graphique, très créative.',
    status: 'active',
    source: 'networking',
    tags: ['freelance', 'design', 'créatif'],
    createdAt: '2023-11-05T14:00:00Z',
    updatedAt: '2024-01-20T09:30:00Z'
  },
  {
    id: '5',
    type: 'company',
    firstName: 'Michel',
    lastName: 'Leblanc',
    companyName: 'Restaurant Le Gourmet',
    name: 'Michel Leblanc',
    company: 'Restaurant Le Gourmet',
    email: 'contact@restaurant-gourmet.fr',
    phone: '05 67 89 01 23',
    address: {
      line1: '654 Place du Marché',
      city: 'Bordeaux',
      postalCode: '33000',
      country: 'France'
    },
    siret: '45678901234567',
    notes: 'Restaurant familial, client depuis 3 ans.',
    status: 'inactive',
    source: 'word_of_mouth',
    tags: ['restaurant', 'familial'],
    createdAt: '2021-08-12T12:00:00Z',
    updatedAt: '2023-12-01T15:00:00Z'
  }
];

router.use(verifyToken);

/**
 * @route GET /api/v1/clients
 * @desc Get all clients with pagination and filters
 * @access Private
 */
router.get('/', [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('search').optional().isString().trim(),
  query('status').optional().isIn(['active', 'inactive', 'prospect']),
  query('type').optional().isIn(['individual', 'company']),
  query('source').optional().isString().trim(),
  query('tags').optional().isString().trim(),
  query('sortBy').optional().isString().trim(),
  query('sortOrder').optional().isIn(['asc', 'desc'])
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Paramètres invalides',
        errors: errors.array()
      });
    }

    const {
      page = 1,
      limit = 10,
      search,
      status,
      type,
      source,
      tags,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    let filteredClients = [...clients];

    // Filtrage par recherche
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      filteredClients = filteredClients.filter(client =>
        client.name.toLowerCase().includes(searchTerm) ||
        client.email.toLowerCase().includes(searchTerm) ||
        (client.company && client.company.toLowerCase().includes(searchTerm)) ||
        (client.phone && client.phone.includes(searchTerm))
      );
    }

    // Filtrage par statut
    if (status) {
      filteredClients = filteredClients.filter(client => client.status === status);
    }

    // Filtrage par type
    if (type) {
      filteredClients = filteredClients.filter(client => client.type === type);
    }

    // Filtrage par source
    if (source) {
      filteredClients = filteredClients.filter(client => client.source === source);
    }

    // Filtrage par tags
    if (tags) {
      const tagList = (tags as string).split(',').map(tag => tag.trim().toLowerCase());
      filteredClients = filteredClients.filter(client =>
        client.tags && client.tags.some(tag => 
          tagList.some(searchTag => tag.toLowerCase().includes(searchTag))
        )
      );
    }

    // Tri
    const sortField = sortBy === 'created_at' ? 'createdAt' : 
                     sortBy === 'updated_at' ? 'updatedAt' :
                     sortBy === 'name' ? 'name' : 'createdAt';

    filteredClients.sort((a, b) => {
      let aVal, bVal;

      if (sortField === 'createdAt' || sortField === 'updatedAt') {
        aVal = new Date(a[sortField]).getTime();
        bVal = new Date(b[sortField]).getTime();
      } else {
        aVal = a[sortField as keyof Client] as string;
        bVal = b[sortField as keyof Client] as string;
      }

      if (sortOrder === 'desc') {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      } else {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      }
    });

    // Pagination
    const total = filteredClients.length;
    const totalPages = Math.ceil(total / (limit as number));
    const offset = ((page as number) - 1) * (limit as number);
    const paginatedClients = filteredClients.slice(offset, offset + (limit as number));

    return res.json({
      success: true,
      data: paginatedClients,
      pagination: {
        page: page as number,
        limit: limit as number,
        total,
        totalPages
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des clients',
      error: {
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        code: 'FETCH_CLIENTS_ERROR',
        statusCode: 500
      }
    });
  }
});

/**
 * @route POST /api/v1/clients
 * @desc Create a new client
 * @access Private
 */
router.post('/', [
  body('type').isIn(['individual', 'company']),
  body('firstName').notEmpty().trim().withMessage('Le prénom est requis'),
  body('lastName').notEmpty().trim().withMessage('Le nom est requis'),
  body('email').isEmail().withMessage('Email invalide'),
  body('companyName').optional().trim(),
  body('phone').optional().trim(),
  body('mobile').optional().trim(),
  body('website').optional().isURL().withMessage('URL invalide'),
  body('siret').optional().trim(),
  body('vatNumber').optional().trim(),
  body('status').optional().isIn(['active', 'inactive', 'prospect'])
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: errors.array()
      });
    }

    // Vérifier si l'email existe déjà
    const existingClient = clients.find(client => client.email === req.body.email);
    if (existingClient) {
      return res.status(409).json({
        success: false,
        message: 'Un client avec cet email existe déjà'
      });
    }

    const newClient: Client = {
      id: `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: req.body.type,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      companyName: req.body.companyName,
      name: `${req.body.firstName} ${req.body.lastName}`,
      company: req.body.companyName,
      email: req.body.email,
      phone: req.body.phone,
      mobile: req.body.mobile,
      website: req.body.website,
      address: {
        line1: req.body.address?.line1,
        line2: req.body.address?.line2,
        city: req.body.address?.city,
        postalCode: req.body.address?.postalCode,
        country: req.body.address?.country || 'France'
      },
      siret: req.body.siret,
      vatNumber: req.body.vatNumber,
      notes: req.body.notes,
      status: req.body.status || 'prospect',
      source: req.body.source,
      tags: req.body.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    clients.unshift(newClient);

    return res.status(201).json({
      success: true,
      message: 'Client créé avec succès',
      data: newClient
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du client',
      error: {
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        code: 'CREATE_CLIENT_ERROR',
        statusCode: 500
      }
    });
  }
});

/**
 * @route GET /api/v1/clients/stats
 * @desc Get client statistics
 * @access Private
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const total = clients.length;
    const active = clients.filter(c => c.status === 'active').length;
    const prospects = clients.filter(c => c.status === 'prospect').length;
    const inactive = clients.filter(c => c.status === 'inactive').length;
    const companies = clients.filter(c => c.type === 'company').length;
    const individuals = clients.filter(c => c.type === 'individual').length;

    // Sources de clients
    const sources = clients.reduce((acc, client) => {
      const source = client.source || 'unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Évolution récente (derniers 30 jours)
    const now = new Date();
    const recentClients = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayClients = clients.filter(client => 
        client.createdAt.startsWith(dateStr)
      ).length;
      
      recentClients.push({
        date: dateStr,
        count: dayClients
      });
    }

    return res.json({
      success: true,
      data: {
        total,
        active,
        prospects,
        inactive,
        companies,
        individuals,
        sources,
        recentActivity: recentClients
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: {
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        code: 'FETCH_STATS_ERROR',
        statusCode: 500
      }
    });
  }
});

/**
 * @route GET /api/v1/clients/:id
 * @desc Get a specific client
 * @access Private
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const client = clients.find(c => c.id === id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client non trouvé'
      });
    }

    return res.json({
      success: true,
      data: client
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du client',
      error: {
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        code: 'FETCH_CLIENT_ERROR',
        statusCode: 500
      }
    });
  }
});

/**
 * @route PUT /api/v1/clients/:id
 * @desc Update a client
 * @access Private
 */
router.put('/:id', [
  body('type').optional().isIn(['individual', 'company']),
  body('firstName').optional().notEmpty().trim(),
  body('lastName').optional().notEmpty().trim(),
  body('email').optional().isEmail(),
  body('phone').optional().trim(),
  body('mobile').optional().trim(),
  body('website').optional().isURL(),
  body('siret').optional().trim(),
  body('vatNumber').optional().trim(),
  body('status').optional().isIn(['active', 'inactive', 'prospect'])
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const clientIndex = clients.findIndex(c => c.id === id);

    if (clientIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Client non trouvé'
      });
    }

    // Vérifier si l'email existe déjà (sauf pour le client actuel)
    if (req.body.email) {
      const existingClient = clients.find(client => 
        client.email === req.body.email && client.id !== id
      );
      if (existingClient) {
        return res.status(409).json({
          success: false,
          message: 'Un autre client avec cet email existe déjà'
        });
      }
    }

    const currentClient = clients[clientIndex];
    const updatedClient: Client = {
      ...currentClient,
      ...req.body,
      name: req.body.firstName && req.body.lastName 
        ? `${req.body.firstName} ${req.body.lastName}`
        : currentClient.name,
      company: req.body.companyName || currentClient.company,
      address: {
        ...currentClient.address,
        ...req.body.address
      },
      updatedAt: new Date().toISOString()
    };

    clients[clientIndex] = updatedClient;

    return res.json({
      success: true,
      message: 'Client mis à jour avec succès',
      data: updatedClient
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour',
      error: {
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        code: 'UPDATE_CLIENT_ERROR',
        statusCode: 500
      }
    });
  }
});

/**
 * @route DELETE /api/v1/clients/:id
 * @desc Delete a client
 * @access Private
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clientIndex = clients.findIndex(c => c.id === id);

    if (clientIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Client non trouvé'
      });
    }

    clients.splice(clientIndex, 1);

    return res.json({
      success: true,
      message: 'Client supprimé avec succès'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression',
      error: {
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        code: 'DELETE_CLIENT_ERROR',
        statusCode: 500
      }
    });
  }
});

export default router;