import { Router } from 'express';
import { Request, Response } from 'express';
import { verifyToken, AuthRequest } from '../middleware/auth';
import AvailabilityRuleService from '../services/availabilityRuleService';
import { logger } from '../utils/logger';
const router = Router();


// POST /availability-rules - Créer de nouvelles règles de disponibilité
router.post('/', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
    }

    const { day, startTime, endTime, appointmentTime } = req.body;

    // Validation des paramètres
    if (!day || !startTime || !endTime || !appointmentTime) {
      return res.status(400).json({
        success: false,
        message: 'Paramètres manquants: day, startTime, endTime, appointmentTime sont requis'
      });
    }
    const nbRules: any[] = await AvailabilityRuleService.createRules(userId, day, startTime, endTime, appointmentTime);

    return res.status(201).json({
      success: true,
      data: nbRules,
      message: `${nbRules} créneaux créés avec succès`
    });
  } catch (error) {
    logger.error('Erreur lors de la création des règles de disponibilité', { error });
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la création des règles de disponibilité' 
    });
  }
});



/**router.get('/test-connection', async (req: Request, res: Response) => {
  //const userId = req.user?.id;
  //if (!userId) {
    //return res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
  //}
    const userId = '1';
  //const credentials = await CredentialsService.getCredentials(userId, 'google');
  const ok = await Service.testConnection({
    clientId: '970287844414-rfc4io1lije03bqge9liidn2nh8l7v7i.apps.googleusercontent.com',
    clientSecret: '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',
    //refreshToken: credentials.refreshToken,
    //accessToken: credentials.accessToken
  });
  return res.json({ success: true, data: { ok } });
});**/

export default router;
