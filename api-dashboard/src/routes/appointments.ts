import { Router } from 'express';
import { Request, Response } from 'express';
import { verifyToken, AuthRequest } from '../middleware/auth';
import AppointmentService from '../services/appointmentService';
import { logger } from '../utils/logger';

const router = Router();

// GET /appointments - Récupérer tous les rendez-vous d'un utilisateur
router.get('/', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
    }

    const { startDate, endDate } = req.query;
    
    const appointments = await AppointmentService.findByUserId(userId, {
      startDate: startDate as string,
      endDate: endDate as string
    });
    
    return res.json({
      success: true,
      data: appointments
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération des rendez-vous', { error });
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération des rendez-vous' 
    });
  }
});

// GET /appointments/:id - Récupérer un rendez-vous par ID
router.get('/:id', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
    }

    const { id } = req.params;
    
    // TODO: Implémenter la récupération par ID dans le service
    return res.status(501).json({
      success: false,
      message: 'Récupération d\'un rendez-vous par ID non implémentée'
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération du rendez-vous', { error });
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération du rendez-vous' 
    });
  }
});

// POST /appointments - Créer un nouveau rendez-vous
router.post('/', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
    }

    const { 
      availabilityRuleId, 
      clientFirstName, 
      clientLastName, 
      clientEmail, 
      clientPhone, 
      notes 
    } = req.body;

    // Validation des paramètres
    if (!availabilityRuleId || !clientFirstName || !clientLastName || !clientEmail) {
      return res.status(400).json({
        success: false,
        message: 'Paramètres manquants: availabilityRuleId, clientFirstName, clientLastName, clientEmail sont requis'
      });
    }

    const appointment = await AppointmentService.create(availabilityRuleId, {
      clientFirstName,
      clientLastName,
      clientEmail,
      clientPhone,
      notes
    });
    
    return res.status(201).json({
      success: true,
      data: appointment,
      message: 'Rendez-vous créé avec succès'
    });
  } catch (error) {
    logger.error('Erreur lors de la création du rendez-vous', { error });
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la création du rendez-vous' 
    });
  }
});

export default router;
