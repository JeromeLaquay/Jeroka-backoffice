import GoogleCalendarAvailabilityRuleService from '../api/google/calendar/googleCalendarAvailabilityRuleService';

export class AvailabilityRuleService {

  static async createRules(userId: string, day: string, startTime: string, endTime: string, appointmentTime: number): Promise<any[]> {
    console.log('createRules generate AvailabilityRules');
    const availabilityRules = await this.generateAvailabilityRulesByAppointmentTime(userId, day, startTime, endTime, appointmentTime);
    
    const results: any[] = [];
    
    for (const rule of availabilityRules) {
      try {
        console.log('createRules pour le crenau', rule.day, rule.startTime, rule.endTime);
        
        // Vérifier si le créneau existe déjà dans Google Calendar
        const existingGoogleEvent = await GoogleCalendarAvailabilityRuleService.findAvailabilityRuleEventByUserIdAndDay(userId, rule.day, rule.startTime, rule.endTime);
        if (existingGoogleEvent?.id) {
          console.log('Créneau existant trouvé dans Google Calendar, ignoré');
          continue; // Ignorer ce créneau au lieu de planter
        }
        
        // Créer un événement Google Calendar
        console.log('createRules créer un événement Google Calendar');
        const googleEvent = await GoogleCalendarAvailabilityRuleService.createAvailabilityRuleEvent(userId, rule.day, rule.startTime, rule.endTime);
        if (googleEvent?.id) {
          console.log('createRules événement Google Calendar créé:', googleEvent.id);
          results.push({
            id: googleEvent.id,
            day: rule.day,
            startTime: rule.startTime,
            endTime: rule.endTime,
            status: 'created'
          });
        } else {
          console.log('Erreur lors de la création de l\'événement Google Calendar pour le créneau:', rule);
        }
      } catch (error) {
        console.error('Erreur lors de la création du créneau:', rule, error);
        // Continuer avec les autres créneaux même si un échoue
      }
    }
    
    console.log('results', results);
    console.log('createRules fin de la création des règles de disponibilité');
    return results;
  }

  static async generateAvailabilityRulesByAppointmentTime(userId: string, day: string, startTime: string, endTime: string, appointmentTime: number): Promise<any[]> {
    const rules: any[] = [];
    const start = new Date(`${day}T${startTime}`);
    const boundary = new Date(`${day}T${endTime}`);
    let cursor = new Date(start);

    const toHHMMSS = (d: Date) => d.toTimeString().slice(0, 8);

    while (cursor < boundary) {
      const slotStart = new Date(cursor);
      const slotEnd = new Date(cursor);
      slotEnd.setMinutes(slotEnd.getMinutes() + appointmentTime);
      if (slotEnd > boundary) break;

      rules.push({
        userId,
        day,
        startTime: toHHMMSS(slotStart),
        endTime: toHHMMSS(slotEnd),
        status: 'pending'
      });

      cursor = slotEnd;
    }

    return rules as any[];
  }
}
export default AvailabilityRuleService;