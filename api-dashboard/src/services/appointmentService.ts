import UserRepository from '@/repositories/userRepository';
import { AppointmentRepository } from '../repositories/appointmentRepository';
import { Appointment, AppointmentClient, AppointmentToUpdate } from '../repositories/appointmentRepository';
import GoogleCalendarAvailabilityRuleService from '../api/google/calendar/googleCalendarAvailabilityRuleService';
import { CalendarEvent } from '@/api/google/calendar/googleCalendarService';
import { HistoryLogs } from '../repositories/historyLogs';
import { AppointmentCreate } from '../repositories/appointmentRepository';
import PersonService from './personService';
import { Person } from '@/repositories/personRepository';
import { User } from '@/repositories/userRepository';
export class AppointmentService {
  static async findByUserIdWithClient(userId: string) : Promise<AppointmentClient[]> {
    return AppointmentRepository.findByUserIdWithClient(userId);
  }
  static async getByIdWithClient(id: string) : Promise<AppointmentClient> {
    return AppointmentRepository.getByIdWithClient(id);
  }
  static async create(userId: string, appointment: AppointmentCreate) : Promise<any> {
    return AppointmentRepository.create(userId, appointment);
  }
  static async delete(id: string) {
    return AppointmentRepository.delete(id);
  }
  static async update(id: string, appointmentToUpdate: AppointmentToUpdate) {
    if (!appointmentToUpdate.email || !appointmentToUpdate.first_name || !appointmentToUpdate.last_name || !appointmentToUpdate.phone) {
      throw new Error('Email, first_name, last_name et phone sont requis. ' + JSON.stringify(appointmentToUpdate));
    }
    const existingAppointment: Appointment = await AppointmentRepository.getById(id);
    if (!existingAppointment || !existingAppointment.user_id) {
      throw new Error('Rendez-vous non trouvé. ' + JSON.stringify(existingAppointment));
    }
    const user: User | null = await UserRepository.findById(existingAppointment.user_id);
    if (!user) {
      throw new Error('Utilisateur non trouvé. ' + JSON.stringify(user));
    }
    // Vérifier si le client existe
    if (!appointmentToUpdate.email || !existingAppointment.user_id || !existingAppointment.google_event_id) {
      throw new Error('Email du client ou user_id ou google_event_id manquant. ' + JSON.stringify(appointmentToUpdate));
    }
    //update google event 
    const googleEvent = await GoogleCalendarAvailabilityRuleService.updateGoogleEvent(user.id, existingAppointment.google_event_id, appointmentToUpdate.email, appointmentToUpdate.first_name, appointmentToUpdate.last_name, appointmentToUpdate.phone);
    if (!googleEvent) {
      throw new Error('Google event non trouvé. ' + JSON.stringify(googleEvent));
    }
    const clientData :Person = {
      company_id: user.company_id,
      email: appointmentToUpdate.email,
      first_name: appointmentToUpdate.first_name,
      last_name: appointmentToUpdate.last_name,
      phone: appointmentToUpdate.phone,
      type: 'client', // Type requis pour la validation
      type_client: 'individual' // Type requis pour la validation
    }
    const client = await PersonService.createPersonWithCheckUniqueEmail(clientData);
    if (!client.id) {
      throw new Error('Client non créé');
    }
    return AppointmentRepository.updateConfirmed(existingAppointment.user_id, id, client.id);
  }
  static async updateStatus(id: string, status: string) {
    return AppointmentRepository.updateStatus(id, status);
  }

  static async getAvailableAppointmentsBycompanyId(companyId: string): Promise<Appointment[]> { 
    //get all users by companyId
    const users = await UserRepository.findByCompany(companyId);
    console.log('users', users);
    //create empty list of available google events
    const allAppointments: Appointment[] = [];
    const now = new Date();
    //get all appointments for each user
    for (const user of users) {
      const userEvents = await AppointmentRepository.findByUserIdWithClient(user.id);

      const filteredEvents = userEvents.filter((event: AppointmentClient) => event.status === 'pending');

      allAppointments.push(...filteredEvents);
    }
    return allAppointments;
  }

  /**
   * Créer des créneaux dans Google Calendar pour un utilisateur donné pour un créneau donné
   *  etape 1 : générer les créneaux
   *  etape 2 : vérifier si le créneau existe déjà dans Google Calendar
   *  etape 3 : créer un événement Google Calendar
   *  etape 4 : retourner les événements créés
   * @param userId 
   * @param day 
   * @param startTime 
   * @param endTime 
   * @param appointmentTime 
   * @returns 
   */
  static async createRules(userId: string, day: string, startTime: string, endTime: string, appointmentTime: number): Promise<Appointment[]> {
    const appointmentsRules: AppointmentCreate[] = await this.generateAvailabilityRulesByAppointmentTime(userId, day, startTime, endTime, appointmentTime);
    
    const results: Appointment[] = [];
    
    for (const appointmentToCreate of appointmentsRules) {
      try {
        
        const existingGoogleEvent = await GoogleCalendarAvailabilityRuleService.findGoogleEventsByUserIdAndDay(userId, appointmentToCreate.start_time, appointmentToCreate.end_time);
        if (existingGoogleEvent?.length > 0) {
          continue; // Ignorer ce créneau au lieu de planter
        }
        // Vérifier que les paramètres nécessaires sont bien définis
        if (!userId || !appointmentToCreate.start_time || !appointmentToCreate.end_time) {
          throw new Error('Paramètres manquants pour la création de l\'événement Google Calendar');
        }

        // Créer un événement Google Calendar
        const googleEvent = await GoogleCalendarAvailabilityRuleService.createGoogleEvent(
          userId,
          appointmentToCreate.start_time,
          appointmentToCreate.end_time
        );
        console.log('googleEvent created', googleEvent);
        if (googleEvent && googleEvent.id) {
          appointmentToCreate.google_event_id = googleEvent.id;
          // Créer un rendez-vous dans la base de données
          console.log('appointmentToCreate', appointmentToCreate);
          const appointmentCreated: Appointment = await AppointmentRepository.create(
            userId,
            appointmentToCreate
          );
          console.log('appointmentCreated', appointmentCreated);
          results.push(appointmentCreated);
        }
      } catch (error) {
        console.error('Erreur lors de la création du créneau:', appointmentToCreate, error);
        // Continuer avec les autres créneaux même si un échoue
      }
    } 
    return results;
  }
    

  static async generateAvailabilityRulesByAppointmentTime(userId: string, day: string, startTime: string, endTime: string, appointmentTime: number): Promise<AppointmentCreate[]> {
    const rules: AppointmentCreate[] = [];
    
    // Créer les dates en spécifiant explicitement le fuseau horaire de Paris
    // Format: YYYY-MM-DDTHH:MM:SS+02:00 (heure d'été) ou +01:00 (heure d'hiver)
    const now = new Date();
    const isDST = this.isDaylightSavingTime(now);
    const timezoneOffset = isDST ? '+02:00' : '+01:00';
    
    const start = new Date(`${day}T${startTime}:00${timezoneOffset}`);
    const boundary = new Date(`${day}T${endTime}:00${timezoneOffset}`);
    let cursor = new Date(start);

    while (cursor < boundary) {
      const slotStart = new Date(cursor);
      const slotEnd = new Date(cursor);
      slotEnd.setMinutes(slotEnd.getMinutes() + appointmentTime);
      
      if (slotEnd > boundary) break;

      const newRule: AppointmentCreate = {
        user_id: userId,
        start_time: slotStart.toISOString(),
        end_time: slotEnd.toISOString(),
        status: 'pending'
      };
      
      console.log(`Créneau: ${slotStart.toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })} - ${slotEnd.toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}`);
      rules.push(newRule);

      cursor = slotEnd;
    }

    console.log(`Total créneaux générés: ${rules.length}`);
    return rules as any[];
  }

  // Fonction utilitaire pour détecter l'heure d'été en France
  private static isDaylightSavingTime(date: Date): boolean {
    // En France, l'heure d'été commence le dernier dimanche de mars et se termine le dernier dimanche d'octobre
    const year = date.getFullYear();
    
    // Dernier dimanche de mars
    const marchLastSunday = new Date(year, 2, 31);
    marchLastSunday.setDate(31 - marchLastSunday.getDay());
    
    // Dernier dimanche d'octobre
    const octoberLastSunday = new Date(year, 9, 31);
    octoberLastSunday.setDate(31 - octoberLastSunday.getDay());
    
    return date >= marchLastSunday && date < octoberLastSunday;
  }
}
export default AppointmentService;