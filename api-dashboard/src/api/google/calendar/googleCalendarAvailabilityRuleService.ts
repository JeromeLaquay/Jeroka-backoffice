import googleCalendarService, { CalendarEvent } from './googleCalendarService'
import { SocialCredentials, SocialCredentialsRepository } from '../../../repositories/socialCredentialsRepository'
import { EncryptionService } from '../../../services/encryptionService'
import { logger } from '../../../utils/logger'

export class GoogleCalendarAvailabilityRuleService {
  static async createAvailabilityRuleEvent(userId: string, day: string, startTime: string, endTime: string): Promise<CalendarEvent | null> {
    try {
      // Récupérer les credentials Google de l'utilisateur
      const credentialsRecord: SocialCredentials | null = await SocialCredentialsRepository.getByUserIdAndPlatform(userId, 'google')
      if (!credentialsRecord || !credentialsRecord.isActive) {
        console.log('Aucun credential Google actif trouvé pour l\'utilisateur:', userId)
        return null
      }
      // Utiliser les credentials déjà décryptés
      const credentialsData = credentialsRecord.credentials
      if (!credentialsData || !credentialsData.refreshToken) {
        console.log('Credentials Google invalides ou manquants pour l\'utilisateur:', userId)
        return null
      }

      const credentials = {
        clientId: credentialsData.oauthClientId,
        clientSecret: credentialsData.oauthClientSecret,
        refreshToken: credentialsData.refreshToken
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
        const googleEvent = await googleCalendarService.createEvent(credentials, event);
      return googleEvent;
    } catch (error) {
      console.error('Erreur lors de la création de l\'événement Google Calendar:', error)
      return null
    }
  }

  static async findAvailabilityRuleEventByUserIdAndDay(userId: string, day: string, startTime: string, endTime: string): Promise<CalendarEvent | null> {
    const credentialsRecord: SocialCredentials | null = await SocialCredentialsRepository.getByUserIdAndPlatform(userId, 'google')
    if (!credentialsRecord || !credentialsRecord.isActive) {
      throw new Error('Aucun credential Google actif trouvé pour l\'utilisateur:' + userId)
    }
    const credentialsData = credentialsRecord.credentials
    if (!credentialsData || !credentialsData.refreshToken) {
      throw new Error('Credentials Google invalides ou manquants pour l\'utilisateur:' + userId)
    }
    const credentials = {
      clientId: credentialsData.oauthClientId,
      clientSecret: credentialsData.oauthClientSecret,
      refreshToken: credentialsData.refreshToken
    }
    const dateTimeStart = new Date(`${day}T${startTime}`);
    const dateTimeEnd = new Date(`${day}T${endTime}`);
    const existingGoogleEvent = await googleCalendarService.listEvents(credentials, dateTimeStart.toISOString(), dateTimeEnd.toISOString());
    return existingGoogleEvent[0];
  }
}
export default GoogleCalendarAvailabilityRuleService;