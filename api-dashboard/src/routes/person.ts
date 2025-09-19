import { Router, Response } from 'express';
import { verifyToken, AuthRequest } from '../middleware/auth';
import { query, body, validationResult } from 'express-validator';
import { personService } from '../services/personService';

const router = Router();

router.use(verifyToken);

/**
 * @route GET /api/v1/persons
 * @desc Get all persons for the user's company with pagination and filters
 * @access Private
 */
router.get('/', [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 1000 }).toInt(),
  query('search').optional().isString().trim(),
  query('status').optional().isIn(['active', 'inactive', 'prospect']),
  query('type').optional().isIn(['client', 'supplier']),
  query('source').optional().isString().trim(),
  query('tags').optional().isString().trim(),
  query('sortBy').optional().isString().trim(),
  query('sortOrder').optional().isIn(['asc', 'desc'])
], async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Paramètres invalides',
        errors: errors.array()
      });
    }

    const companyId = req.user!.company_id;
    const { page = 1, limit = 10, search, status, type, source, tags, sortBy = 'created_at', sortOrder = 'desc' } = req.query as any;

    // Normaliser tags: string "a,b" -> ["a","b"]
    const normalizedTags = Array.isArray(tags)
      ? tags
      : typeof tags === 'string' && tags.trim().length > 0
        ? tags.split(',').map((t: string) => t.trim()).filter(Boolean)
        : undefined;

    console.log('getpersons', req.query);
    const dataResult = await personService.getpersons(companyId, {
      page: Number(page),
      limit: Number(limit),
      search: search as string,
      status: status as any,
      type: type as any,
      source: source as string,
      tags: normalizedTags,
      sortBy: sortBy as string,
      sortOrder: (sortOrder as string) === 'asc' ? 'asc' : 'desc'
    });

    return res.json({
      success: true,
      data: dataResult.data,
      pagination: {
        page: page as number,
        limit: limit as number,
        total: dataResult.total,
        totalPages: dataResult.totalPages
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des persons:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des persons',
      error: {
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        code: 'FETCH_personS_ERROR',
        statusCode: 500
      }
    });
  }
});

/**
 * @route POST /api/v1/persons
 * @desc Create a new person for the user's company
 * @access Private
 */
router.post('/', [
  body('type').isIn(['individual', 'company']),
  body('firstName').optional().trim(),
  body('lastName').optional().trim(),
  body('first_name').optional().trim(),
  body('last_name').optional().trim(),
  body('email').isEmail().withMessage('Email invalide'),
  body('company_name').optional().trim(),
  body('phone').optional().trim(),
  body('mobile').optional().trim(),
  body('website').optional().isURL().withMessage('URL invalide'),
  body('siret').optional().trim(),
  body('vat_number').optional().trim(),
  body('status').optional().isIn(['active', 'inactive', 'prospect'])
], async (req: AuthRequest, res: Response) => {
  try {
    console.log('req.body', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: errors.array()
      });
    }

    const companyId = req.user!.company_id;
    
    // Validation personnalisée pour first_name et last_name
    const firstName = req.body.firstName || req.body.first_name;
    const lastName = req.body.lastName || req.body.last_name;
    
    if (!firstName || firstName.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Le prénom est requis'
      });
    }
    
    if (!lastName || lastName.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Le nom est requis'
      });
    }
    
    // Mapping des champs camelCase vers snake_case
    const payload = {
      ...req.body,
      company_id: companyId,
      first_name: firstName,
      last_name: lastName,
      // Mapping de l'adresse si elle existe
      address_line1: req.body.address?.line1,
      address_line2: req.body.address?.line2,
      city: req.body.address?.city,
      postal_code: req.body.address?.postalCode,
      country: req.body.address?.country
    };
    
    // Supprimer les champs camelCase pour éviter les doublons
    delete payload.firstName;
    delete payload.lastName;
    delete payload.address;
    
    const newperson = await personService.createperson(payload);

    return res.status(201).json({ success: true, message: 'person créé avec succès', data: newperson });
  } catch (error) {
    console.error('Erreur lors de la création du person:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du person',
      error: {
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        code: 'CREATE_person_ERROR',
        statusCode: 500
      }
    });
  }
});

/**
 * @route GET /api/v1/persons/stats
 * @desc Get person statistics for the user's company
 * @access Private
 */
router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.company_id;
    const stats = await personService.getpersonStats(companyId);
    // Conserver la même structure de réponse qu'avant
    return res.json({ success: true, data: {
      total: Number(stats.total),
      active: Number(stats.active),
      prospects: Number(stats.prospects),
      inactive: Number(stats.inactive),
      companies: Number(stats.companies),
      individuals: Number(stats.individuals),
      // sources et recentActivity peuvent être ajoutés par une méthode dédiée si nécessaire
      sources: {},
      recentActivity: []
    } });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
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
 * @route GET /api/v1/persons/:id
 * @desc Get a specific person (only if it belongs to the user's company)
 * @access Private
 */
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user!.company_id;
    const person = await personService.getpersonById(id, companyId);
    if (!person) {
      return res.status(404).json({ success: false, message: 'person non trouvé ou vous n\'avez pas accès à ce person' });
    }
    return res.json({ success: true, data: person });
  } catch (error) {
    console.error('Erreur lors de la récupération du person:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du person',
      error: {
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        code: 'FETCH_person_ERROR',
        statusCode: 500
      }
    });
  }
});

/**
 * @route PUT /api/v1/persons/:id
 * @desc Update a person (only if it belongs to the user's company)
 * @access Private
 */
router.put('/:id', [
  body('type').optional().isIn(['individual', 'company']),
  body('first_name').optional().notEmpty().trim(),
  body('last_name').optional().notEmpty().trim(),
  body('email').optional().isEmail(),
  body('phone').optional().trim(),
  body('mobile').optional().trim(),
  body('website').optional().isURL(),
  body('siret').optional().trim(),
  body('vat_number').optional().trim(),
  body('status').optional().isIn(['active', 'inactive', 'prospect'])
], async (req: AuthRequest, res: Response) => {
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
    const companyId = req.user!.company_id;
    
    // Mapping des champs camelCase vers snake_case pour la mise à jour
    const updatePayload = { ...req.body };
    if (req.body.firstName !== undefined) updatePayload.first_name = req.body.firstName;
    if (req.body.lastName !== undefined) updatePayload.last_name = req.body.lastName;
    
    // Mapping de l'adresse si elle existe
    if (req.body.address) {
      if (req.body.address.line1 !== undefined) updatePayload.address_line1 = req.body.address.line1;
      if (req.body.address.line2 !== undefined) updatePayload.address_line2 = req.body.address.line2;
      if (req.body.address.city !== undefined) updatePayload.city = req.body.address.city;
      if (req.body.address.postalCode !== undefined) updatePayload.postal_code = req.body.address.postalCode;
      if (req.body.address.country !== undefined) updatePayload.country = req.body.address.country;
    }
    
    // Supprimer les champs camelCase pour éviter les doublons
    delete updatePayload.firstName;
    delete updatePayload.lastName;
    delete updatePayload.address;
    
    const updated = await personService.updateperson(id, companyId, updatePayload);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'person non trouvé ou vous n\'avez pas accès à ce person' });
    }
    return res.json({ success: true, message: 'person mis à jour avec succès', data: updated });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du person:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour',
      error: {
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        code: 'UPDATE_person_ERROR',
        statusCode: 500
      }
    });
  }
});

/**
 * @route DELETE /api/v1/persons/:id
 * @desc Delete a person (only if it belongs to the user's company)
 * @access Private
 */
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const companyId = req.user!.company_id;
    const ok = await personService.deleteperson(id, companyId);
    if (!ok) {
      return res.status(404).json({ success: false, message: 'person non trouvé ou vous n\'avez pas accès à ce person' });
    }
    return res.json({ success: true, message: 'person supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du person:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression',
      error: {
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        code: 'DELETE_person_ERROR',
        statusCode: 500
      }
    });
  }
});

export default router;