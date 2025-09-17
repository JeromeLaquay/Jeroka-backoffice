import googleCalendarService, { CalendarEvent } from './googleCalendarService'
export class GoogleCalendarAvailabilityRuleService {
  static async createAvailabilityRuleEvent(userId: string, day: string, startTime: string, endTime: string): Promise<CalendarEvent | null> {
    const credentials = {} //récupérer les credentials de l'utilisateur pour google credentialsService.getCredentials(userId);
    if (!credentials) {
      throw new Error('Credentials not found');
      return null;
    }
    const event: Partial<CalendarEvent> = {
      summary: `Disponibilité ${day} ${startTime} - ${endTime}`,
      description: `Disponibilité ${day} ${startTime} - ${endTime}`,
      start: {
        dateTime: `${day}T${startTime}`,
        timeZone: 'Europe/Paris'
      },
      end: {
        dateTime: `${day}T${endTime}`,
        timeZone: 'Europe/Paris'
      }
    };
    const googleEvent = await googleCalendarService.createEvent(credentials, 'primary', event);
    return googleEvent;
  }
}
export default GoogleCalendarAvailabilityRuleService;