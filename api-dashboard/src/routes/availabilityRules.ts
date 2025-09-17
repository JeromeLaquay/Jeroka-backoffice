import { Router } from 'express';
import { Request, Response } from 'express';
import { verifyToken, AuthRequest } from '../middleware/auth';
import AvailabilityRuleService from '../services/availabilityRuleService';
import { logger } from '../utils/logger';
import CredentialsService from '../services/credentialsService';
import GoogleCalendarService from '../api/google/calendar/googleCalendarService';

const router = Router();

// GET /availability-rules - Récupérer toutes les règles de disponibilité d'un utilisateur
router.get('/', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
    }

    const rules = await AvailabilityRuleService.findPendingWithoutAppointmentByUserId(userId);
    
    return res.json({
      success: true,
      data: rules
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération des règles de disponibilité', { error });
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération des règles de disponibilité' 
    });
  }
});

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

    const rules = await AvailabilityRuleService.createRules(userId, day, startTime, endTime, appointmentTime);
    
    return res.status(201).json({
      success: true,
      data: rules,
      message: `${rules.length} créneaux créés avec succès`
    });
  } catch (error) {
    logger.error('Erreur lors de la création des règles de disponibilité', { error });
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la création des règles de disponibilité' 
    });
  }
});

// PUT /availability-rules/:id - Mettre à jour une règle de disponibilité
router.put('/:id', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
    }

    const { id } = req.params;
    const updates = req.body;

    // TODO: Implémenter la mise à jour dans le service
    return res.status(501).json({
      success: false,
      message: 'Mise à jour des règles de disponibilité non implémentée'
    });
  } catch (error) {
    logger.error('Erreur lors de la mise à jour de la règle de disponibilité', { error });
        res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la mise à jour de la règle de disponibilité' 
    });
  }
});

// DELETE /availability-rules/:id - Supprimer une règle de disponibilité
router.delete('/:id', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
    }

    const { id } = req.params;

    // TODO: Implémenter la suppression dans le service
    return res.status(501).json({
      success: false,
      message: 'Suppression des règles de disponibilité non implémentée'
    });
  } catch (error) {
    logger.error('Erreur lors de la suppression de la règle de disponibilité', { error });
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la suppression de la règle de disponibilité' 
    });
  }
});

router.get('/test-connection', async (req: Request, res: Response) => {
  //const userId = req.user?.id;
  //if (!userId) {
    //return res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
  //}
    const userId = '1';
  //const credentials = await CredentialsService.getCredentials(userId, 'google');
  const ok = await GoogleCalendarService.testConnection({
    clientId: '970287844414-rfc4io1lije03bqge9liidn2nh8l7v7i.apps.googleusercontent.com',
    clientSecret: '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',
    //refreshToken: credentials.refreshToken,
    //accessToken: credentials.accessToken
  });
  return res.json({ success: true, data: { ok } });
});

export default router;
