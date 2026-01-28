import { Router } from 'express';
import AppointmentService from '../services/appointmentService';
import { HistoryLogs } from '../repositories/historyLogs';
import { AppointmentToUpdate } from '../repositories/appointmentRepository';
const router = Router();

/**
 * routes externes sans login depuis le site web
 *  - créer message client 
 *  - récupérer créneau RDV
 *  - créer RDV
 *  - récupérer les publications
 */

router.get('/create-message', (req, res) => {
    res.send('Hello World');
});

router.get('/get-appointment-slots/:company_id', async (req, res) => {
    try {
    const { company_id } = req.params;
        HistoryLogs.create({action: 'route: withoutLogin, action: GET/get-appointment-slots/:company_id', complementary_data: 'company_id: '+company_id, status: 'success'});
        const slots = await AppointmentService.getAvailableAppointmentsBycompanyId(company_id);
        return res.json({ success: true, data: slots });
    } catch (error) {
        HistoryLogs.create({action: 'route: withoutLogin, action: GET/get-appointment-slots/:company_id', complementary_data: 'Error inconnue: '+error, status: 'error'});
        return res.status(500).json({ success: false, message: 'Erreur lors de la récupération des créneaux de rendez-vous' + error });
    }
});

/**
 * @route GET /get-appointment-slots/:company_id
 * @desc Récupérer les créneaux de rendez-vous disponibles pour une entreprise
 * @access Public
 */
router.get('/get-appointment-slots/:company_id', async (req, res) => {
    try {
        const { company_id } = req.params;
        if(!company_id) {
            HistoryLogs.create({action: 'route: withoutLogin, action: GET/get-appointment-slots/:company_id', complementary_data: 'company_id manquant', status: 'error'});
            return res.status(400).json({ success: false, message: 'company_id manquant' });
        }
        HistoryLogs.create({action: 'route: withoutLogin, action: GET/get-appointment-slots/:company_id', complementary_data: 'company_id: '+company_id, status: 'success'});
        const slots = await AppointmentService.getAvailableAppointmentsBycompanyId(company_id);
        return res.json({ success: true, data: slots });
    } catch (error) {
        HistoryLogs.create({action: 'route: withoutLogin, action: GET/get-appointment-slots/:company_id', complementary_data: 'Error inconnue: '+error, status: 'error'});
        return res.status(500).json({ success: false, message: 'Erreur lors de la récupération des créneaux de rendez-vous' + error });
    }
});

/**
 * @route POST /reserve-appointment
 * @desc Réserver un rendez-vous avec les infos client et id du créneau
 * @access Public
 */
router.post('/reserve-appointment/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('=== DEBUG RESERVE APPOINTMENT ===');
        console.log('req.body:', req.body);
        console.log('req.headers:', req.headers);
        console.log('Content-Type:', req.headers['content-type']);
        console.log('id:', id);
        
        // Récupérer les données du body (form-data ou JSON)
        const appointment: AppointmentToUpdate = req.body;
        
        // Validation des paramètres requis
        if (!appointment || !id) {
            HistoryLogs.create({action: 'route: withoutLogin, action: POST/reserve-appointment/:id', complementary_data: 'Paramètres manquants', status: 'error'});
            return res.status(400).json({ success: false, message: 'Paramètres manquants' });
        }
        
        // Validation des champs requis
        if (!appointment.email || !appointment.first_name || !appointment.last_name || !appointment.phone) {
            console.log('Champs manquants:', {
                email: appointment.email,
                first_name: appointment.first_name,
                last_name: appointment.last_name,
                phone: appointment.phone
            });
            HistoryLogs.create({action: 'route: withoutLogin, action: POST/reserve-appointment/:id', complementary_data: 'Champs requis manquants', status: 'error'});
            return res.status(400).json({ 
                success: false, 
                message: 'Email, first_name, last_name et phone sont requis',
                received: appointment
            });
        }
        
        // Réserver le rendez-vous
        const appointmentCreated = await AppointmentService.update(id, appointment);
        HistoryLogs.create({action: 'route: withoutLogin, action: POST/reserve-appointment/:id', complementary_data: 'Rendez-vous réservé avec succès', status: 'success'});
        return res.json({ success: true, data: appointmentCreated });
    } catch (error) {
        console.error('Erreur lors de la réservation:', error);
        HistoryLogs.create({action: 'route: withoutLogin, action: POST/reserve-appointment/:id', complementary_data: 'Error inconnue: '+error, status: 'error'});
        return res.status(500).json({ success: false, message: 'Erreur lors de la réservation du rendez-vous: ' + error });
    }
});

router.get('/get-publications', (req, res) => {
    res.send('Hello World');
});

export default router;