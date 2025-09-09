import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { verifyToken } from '../middleware/auth';
import { Request, Response } from 'express';

const router = express.Router();

// Types pour le calendrier
interface TimeSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  isBooked: boolean;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AvailabilityRule {
  id: string;
  dayOfWeek: number; // 0 = dimanche, 1 = lundi, etc.
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ===========================================
// RÈGLES DE DISPONIBILITÉ
// ===========================================

// GET /api/v1/calendar/availability - Récupérer les règles de disponibilité
router.get('/availability', verifyToken, async (req: Request, res: Response) => {
  try {
    // TODO: Récupérer depuis la base de données
    const availabilityRules: AvailabilityRule[] = [
      {
        id: '1',
        dayOfWeek: 1, // Lundi
        startTime: '09:00',
        endTime: '17:00',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '2',
        dayOfWeek: 2, // Mardi
        startTime: '09:00',
        endTime: '17:00',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '3',
        dayOfWeek: 3, // Mercredi
        startTime: '09:00',
        endTime: '17:00',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '4',
        dayOfWeek: 4, // Jeudi
        startTime: '09:00',
        endTime: '17:00',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '5',
        dayOfWeek: 5, // Vendredi
        startTime: '09:00',
        endTime: '17:00',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    res.json({
      success: true,
      data: availabilityRules
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des règles de disponibilité:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des règles de disponibilité'
    });
  }
});

// POST /api/v1/calendar/availability - Créer une règle de disponibilité
router.post('/availability', [
  verifyToken,
  body('dayOfWeek').isInt({ min: 0, max: 6 }).withMessage('Jour de la semaine invalide (0-6)'),
  body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Heure de début invalide (HH:MM)'),
  body('endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Heure de fin invalide (HH:MM)'),
  body('isActive').isBoolean().withMessage('Statut actif invalide')
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

    const { dayOfWeek, startTime, endTime, isActive } = req.body;

    // TODO: Sauvegarder en base de données
    const newRule: AvailabilityRule = {
      id: Date.now().toString(),
      dayOfWeek,
      startTime,
      endTime,
      isActive,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    res.status(201).json({
      success: true,
      message: 'Règle de disponibilité créée avec succès',
      data: newRule
    });
  } catch (error) {
    console.error('Erreur lors de la création de la règle de disponibilité:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création de la règle de disponibilité'
    });
  }
});

// PUT /api/v1/calendar/availability/:id - Modifier une règle de disponibilité
router.put('/availability/:id', [
  verifyToken,
  param('id').isString().withMessage('ID invalide'),
  body('dayOfWeek').optional().isInt({ min: 0, max: 6 }).withMessage('Jour de la semaine invalide (0-6)'),
  body('startTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Heure de début invalide (HH:MM)'),
  body('endTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Heure de fin invalide (HH:MM)'),
  body('isActive').optional().isBoolean().withMessage('Statut actif invalide')
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
    const updates = req.body;

    // TODO: Mettre à jour en base de données
    const updatedRule: AvailabilityRule = {
      id,
      ...updates,
      updatedAt: new Date()
    };

    res.json({
      success: true,
      message: 'Règle de disponibilité mise à jour avec succès',
      data: updatedRule
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la règle de disponibilité:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour de la règle de disponibilité'
    });
  }
});

// DELETE /api/v1/calendar/availability/:id - Supprimer une règle de disponibilité
router.delete('/availability/:id', [
  verifyToken,
  param('id').isString().withMessage('ID invalide')
], async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // TODO: Supprimer de la base de données

    res.json({
      success: true,
      message: 'Règle de disponibilité supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la règle de disponibilité:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression de la règle de disponibilité'
    });
  }
});

// ===========================================
// CRÉNEAUX DISPONIBLES
// ===========================================

// GET /api/v1/calendar/slots - Récupérer les créneaux disponibles
router.get('/slots', [
  query('startDate').isISO8601().withMessage('Date de début invalide'),
  query('endDate').isISO8601().withMessage('Date de fin invalide')
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

    const { startDate, endDate } = req.query;

    // TODO: Générer les créneaux basés sur les règles de disponibilité
    const slots = generateTimeSlots(startDate as string, endDate as string);

    res.json({
      success: true,
      data: slots
    });
  } catch (error) {
    console.error('Erreur lors de la génération des créneaux:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la génération des créneaux'
    });
  }
});

// ===========================================
// RENDEZ-VOUS
// ===========================================

// GET /api/v1/calendar/appointments - Récupérer les rendez-vous
router.get('/appointments', [
  verifyToken,
  query('startDate').optional().isISO8601().withMessage('Date de début invalide'),
  query('endDate').optional().isISO8601().withMessage('Date de fin invalide')
], async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    // TODO: Récupérer depuis la base de données
    const appointments: TimeSlot[] = [];

    res.json({
      success: true,
      data: appointments
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des rendez-vous:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des rendez-vous'
    });
  }
});

// POST /api/v1/calendar/appointments - Créer un rendez-vous
router.post('/appointments', [
  verifyToken,
  body('date').isISO8601().withMessage('Date invalide'),
  body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Heure de début invalide (HH:MM)'),
  body('endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Heure de fin invalide (HH:MM)'),
  body('clientName').isString().isLength({ min: 2, max: 100 }).withMessage('Nom du client invalide'),
  body('clientEmail').isEmail().withMessage('Email du client invalide'),
  body('clientPhone').optional().isString().isLength({ min: 10, max: 20 }).withMessage('Téléphone du client invalide'),
  body('notes').optional().isString().isLength({ max: 500 }).withMessage('Notes trop longues (max 500 caractères)')
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

    const { date, startTime, endTime, clientName, clientEmail, clientPhone, notes } = req.body;

    // TODO: Vérifier que le créneau est disponible
    // TODO: Créer le rendez-vous en base de données
    // TODO: Synchroniser avec Google Calendar

    const newAppointment: TimeSlot = {
      id: Date.now().toString(),
      date,
      startTime,
      endTime,
      isAvailable: false,
      isBooked: true,
      clientName,
      clientEmail,
      clientPhone,
      notes,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    res.status(201).json({
      success: true,
      message: 'Rendez-vous créé avec succès',
      data: newAppointment
    });
  } catch (error) {
    console.error('Erreur lors de la création du rendez-vous:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création du rendez-vous'
    });
  }
});

// PUT /api/v1/calendar/appointments/:id - Modifier un rendez-vous
router.put('/appointments/:id', [
  verifyToken,
  param('id').isString().withMessage('ID invalide'),
  body('clientName').optional().isString().isLength({ min: 2, max: 100 }).withMessage('Nom du client invalide'),
  body('clientEmail').optional().isEmail().withMessage('Email du client invalide'),
  body('clientPhone').optional().isString().isLength({ min: 10, max: 20 }).withMessage('Téléphone du client invalide'),
  body('notes').optional().isString().isLength({ max: 500 }).withMessage('Notes trop longues (max 500 caractères)')
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
    const updates = req.body;

    // TODO: Mettre à jour en base de données
    // TODO: Synchroniser avec Google Calendar

    res.json({
      success: true,
      message: 'Rendez-vous mis à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du rendez-vous:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour du rendez-vous'
    });
  }
});

// DELETE /api/v1/calendar/appointments/:id - Supprimer un rendez-vous
router.delete('/appointments/:id', [
  verifyToken,
  param('id').isString().withMessage('ID invalide')
], async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // TODO: Supprimer de la base de données
    // TODO: Synchroniser avec Google Calendar

    res.json({
      success: true,
      message: 'Rendez-vous supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du rendez-vous:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression du rendez-vous'
    });
  }
});

// ===========================================
// GOOGLE CALENDAR INTEGRATION
// ===========================================

// POST /api/v1/calendar/google/sync - Synchroniser avec Google Calendar
router.post('/google/sync', verifyToken, async (req: Request, res: Response) => {
  try {
    // TODO: Implémenter la synchronisation avec Google Calendar API
    // 1. Authentification OAuth2
    // 2. Récupération des événements
    // 3. Synchronisation bidirectionnelle

    res.json({
      success: true,
      message: 'Synchronisation avec Google Calendar en cours...'
    });
  } catch (error) {
    console.error('Erreur lors de la synchronisation Google Calendar:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la synchronisation Google Calendar'
    });
  }
});

// ===========================================
// FONCTIONS UTILITAIRES
// ===========================================

function generateTimeSlots(startDate: string, endDate: string): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Générer des créneaux de 30 minutes pour chaque jour
  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    const dayOfWeek = date.getDay();
    
    // Vérifier si c'est un jour de travail (lundi-vendredi)
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      // Générer des créneaux de 9h à 17h
      for (let hour = 9; hour < 17; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          const endHour = minute === 30 ? hour + 1 : hour;
          const endMinute = minute === 30 ? 0 : 30;
          const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
          
          slots.push({
            id: `${date.toISOString().split('T')[0]}_${startTime}`,
            date: date.toISOString().split('T')[0],
            startTime,
            endTime,
            isAvailable: true,
            isBooked: false,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      }
    }
  }
  
  return slots;
}

export default router;
