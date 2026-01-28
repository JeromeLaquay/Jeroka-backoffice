import { Router } from 'express';
import { Request, Response } from 'express';
import { verifyToken, AuthRequest } from '../middleware/auth';
import AppointmentService from '../services/appointmentService';
import { logger } from '../utils/logger';
import { HistoryLogs } from '../repositories/historyLogs';
import { AppointmentClient, AppointmentCreate } from '../repositories/appointmentRepository';
import GoogleCalendarAvailabilityRuleService from '@/api/google/calendar/googleCalendarAvailabilityRuleService';

const router = Router();

// GET /appointments - Récupérer tous les rendez-vous d'un utilisateur
router.get('/', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
      HistoryLogs.create({action: 'route: appointments, action: GET/appointments', complementary_data: 'Error: userId null', status: 'error', type_error: 'api'});
    }
    
    const appointments: AppointmentClient[] = await AppointmentService.findByUserIdWithClient(userId);
    HistoryLogs.create({action: 'route: appointments, action: GET/appointments', complementary_data: 'l utilisateur '+req.user?.email+' a récupéré ses rendez-vous', status: 'success'});
    return res.json({
      success: true,
      data: appointments
    });
  } catch (error) {
    HistoryLogs.create({action: 'route: appointments, action: GET/appointments', complementary_data: 'Error inconnue '+error, status: 'error', type_error: 'unknown'});
    logger.error('Erreur lors de la récupération des rendez-vous', { error });
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération des rendez-vous' 
    });
  }
});

/**
 * @route GET /api/v1/appointments/:id
 * @desc récupérer un rendez-vous par ID avec son client associé
 * @access Private
 */
router.get('/:id', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId || !id) {
      HistoryLogs.create({action: 'route: appointments, action: GET/appointments/:id', complementary_data: 'Error: userId null ou id null', status: 'error', type_error: 'api'});
      return res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
    }
    const appointment: AppointmentClient = await AppointmentService.getByIdWithClient(id);
    if (!appointment) {
      HistoryLogs.create({action: 'route: appointments, action: GET/appointments/:id', complementary_data: 'Error: appointment non trouvé', status: 'error', type_error: 'api'});
      return res.status(404).json({ success: false, message: 'Rendez-vous non trouvé' });
    }
    HistoryLogs.create({action: 'route: appointments, action: GET/appointments/:id', complementary_data: 'Rendez-vous trouvé', status: 'success'});
    return res.json({ success: true, data: appointment });
    
    
  } catch (error) {
    logger.error('Erreur lors de la récupération du rendez-vous', { error });
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération du rendez-vous' 
    });
  }
});

/**
 * @route POST /availability-rules
 * @desc Créer des créneaux dans Google Calendar
 * @access Private
 */
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
    const nbRules: any[] = await AppointmentService.createRules(userId, day, startTime, endTime, appointmentTime);

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


router.get('/get-google-calendar-colors', verifyToken, async (req: AuthRequest, res: Response) => {
  const colors = await GoogleCalendarAvailabilityRuleService.getAvailableColors(req.user!.id);
  return res.json({ success: true, data: colors });
});

router.put('/:id', verifyToken, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  console.log('id', id);
  console.log('status', status);
  if (!id || !status) {
    return res.status(400).json({ success: false, message: 'Paramètres manquants: id et status sont requis' });
  }
  const appointment = await AppointmentService.updateStatus(id, status);
  return res.json({ success: true, data: appointment });
});

export default router;
