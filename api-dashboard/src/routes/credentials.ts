import { Router, Request, Response } from 'express';
import { verifyToken, AuthRequest } from '../middleware/auth';
import { body, param, validationResult } from 'express-validator';
import { CompanySocialNetworkService } from '../services/companySocialNetworkService';

const router = Router();

/**
 * @route POST /api/v1/company/social-networks/:platform/configure
 * @desc Configure les identifiants pour une plateforme
 * @access Private
 */
router.post('/:platform/configure', [
  param('platform').isIn(['meta', 'linkedin', 'twitter', 'site web', 'google']).withMessage('Plateforme invalide'),
  body('credentials').isObject().withMessage('Les identifiants sont requis')
], verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Paramètres invalides',
        errors: errors.array()
      });
    }

    const { platform } = req.params;
    const { credentials } = req.body;
    const companyId = req.user!.company_id;

    await CompanySocialNetworkService.configureCredentials(companyId, platform, credentials);

    return res.status(200).json({
      success: true,
      message: `Identifiants ${platform} configurés avec succès`
    });
  } catch (error) {
    console.error(`Erreur configuration ${req.params.platform}:`, error);
    return res.status(500).json({
      success: false,
      message: `Erreur lors de la configuration de ${req.params.platform}`,
      error: {
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        code: 'CREDENTIALS_CONFIG_ERROR',
        statusCode: 500
      }
    });
  }
});

/**
 * @route GET /api/v1/company/social-networks/credentials
 * @desc Récupère les plateformes configurées (sans les identifiants)
 * @access Private
 */
router.get('/credentials', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const companyId = req.user!.company_id;
    const credentialsCompany = await CompanySocialNetworkService.getAllCredentials(companyId);
    const credentialsUser = await CompanySocialNetworkService.getAllCredentials(req.user!.id);
    const credentials = { ...credentialsCompany, ...credentialsUser };
    // Retourner seulement les plateformes configurées, pas les identifiants
    const configuredPlatforms = Object.keys(credentials).map(platform => ({
      platform,
      isConfigured: true,
      hasValidCredentials: true // À implémenter avec un test de connexion
    }));

    res.json({
      success: true,
      data: {
        configuredPlatforms,
        count: configuredPlatforms.length
      }
    });

  } catch (error) {
    console.error('Erreur récupération identifiants:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des identifiants',
      error: {
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        code: 'CREDENTIALS_FETCH_ERROR',
        statusCode: 500
      }
    });
  }
});

/**
 * @route DELETE /api/v1/company/social-networks/:platform/deactivate
 * @desc Désactive les identifiants d'une plateforme
 * @access Private
 */
router.delete('/:platform/deactivate', [
  param('platform').isIn(['facebook', 'linkedin', 'twitter']).withMessage('Plateforme invalide')
], verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { platform } = req.params;
    const companyId = req.user!.company_id;

    await CompanySocialNetworkService.deactivateCredentials(companyId, req.user!.id, platform);

    res.json({
      success: true,
      message: `Identifiants ${platform} désactivés avec succès`
    });

  } catch (error) {
    console.error(`Erreur désactivation ${req.params.platform}:`, error);
    res.status(500).json({
      success: false,
      message: `Erreur lors de la désactivation de ${req.params.platform}`,
      error: {
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        code: 'CREDENTIALS_DEACTIVATE_ERROR',
        statusCode: 500
      }
    });
  }
});

export default router;
