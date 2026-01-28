import googleCalendarService, { CalendarEvent } from './googleCalendarService'
import { SocialCredentials, SocialCredentialsRepository } from '../../../repositories/socialCredentialsRepository'
import { EncryptionService } from '../../../services/encryptionService'
import { logger } from '../../../utils/logger'
import { SocialNetworkService } from '@/api/social-network/socialNetworkService'
import { UserRepository } from '@/repositories/userRepository'

// Couleurs Google Calendar disponibles
export const GOOGLE_CALENDAR_COLORS = {
  LAVENDER: '1',      // #7986cb - Lavande
  SAGE: '2',          // #33b679 - Sage (vert clair)
  GRAPE: '3',         // #8e24aa - Raisin (violet)
  FLAMINGO: '4',      // #e67c73 - Flamingo (rose)
  BANANA: '5',        // #f6c026 - Banana (jaune)
  TANGERINE: '6',     // #f5511d - Mandarin (orange)
  PEACOCK: '7',       // #039be5 - Peacock (bleu clair)
  GRAPHITE: '8',      // #616161 - Graphite (gris)
  BLUEBERRY: '9',     // #3f51b5 - Blueberry (bleu)
  BASIL: '10',        // #0d8043 - Basil (vert foncé)
  TOMATO: '11'        // #d60000 - Tomato (rouge)
} as const

export type CalendarEventType = 'available' | 'reserved' | 'confirmed' | 'cancelled'

// Fonction utilitaire pour obtenir la couleur selon le type d'événement
export const getEventColor = (eventType: CalendarEventType): string => {
  switch (eventType) {
    case 'available':
      return GOOGLE_CALENDAR_COLORS.SAGE // Vert clair pour les créneaux disponibles
    case 'reserved':
      return GOOGLE_CALENDAR_COLORS.BLUEBERRY // Bleu pour les RDV réservés
    case 'confirmed':
      return GOOGLE_CALENDAR_COLORS.BASIL // Vert foncé pour les RDV confirmés
    case 'cancelled':
      return GOOGLE_CALENDAR_COLORS.TOMATO // Rouge pour les RDV annulés
    default:
      return GOOGLE_CALENDAR_COLORS.GRAPHITE // Gris par défaut
  }
}

export class GoogleCalendarAvailabilityRuleService {
  static async createGoogleEvent(userId: string, startTime: string, endTime: string): Promise<CalendarEvent | null> {
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
      const user = await UserRepository.findById(userId);
      const userName = `${user?.first_name} ${user?.last_name}`;
      const event: Partial<CalendarEvent> = {
        summary: `Dispo RDV ${userName}`,
        description: `Créneau disponible pour rendez-vous`,
        start: {
          dateTime: `${startTime}`,
          timeZone: 'Europe/Paris'
        },
        end: {
          dateTime: `${endTime}`,
          timeZone: 'Europe/Paris'
        },
        colorId: getEventColor('available')
      };
        const googleEvent = await googleCalendarService.createEvent(credentials, event);
      return googleEvent;
    } catch (error) {
      console.error('Erreur lors de la création de l\'événement Google Calendar:', error)
      return null
    }
  }

  static async findGoogleEventsByUserIdAndDay(userId: string, startDateTime?: string, endDateTime?: string): Promise<CalendarEvent[]> {
    console.log('findGoogleEventsByUserIdAndDay', userId, startDateTime, endDateTime);
    const credentialsRecord: SocialCredentials | null = await SocialCredentialsRepository.getByUserIdAndPlatform(userId, 'google')
    console.log('credentialsRecord', credentialsRecord);
    if(!credentialsRecord || !credentialsRecord.isActive) {
      console.log('Aucun credential Google actif trouvé pour l\'utilisateur:', userId);
      return [];
    }
    const credentialsData = credentialsRecord.credentials
    if (!credentialsData || !credentialsData.refreshToken) {
      console.log('Credentials Google invalides ou manquants pour l\'utilisateur:', userId);
      return [];
    }
    const credentials = {
      clientId: credentialsData.oauthClientId,
      clientSecret: credentialsData.oauthClientSecret,
      refreshToken: credentialsData.refreshToken
    }
    // existingGoogleEvent is an array of CalendarEvent
    const existingGoogleEvent = await googleCalendarService.listEvents(credentials, startDateTime, endDateTime);
    //return list
    return existingGoogleEvent;
  }

  static async updateGoogleEvent(userId: string, googleEventId: string, email: string, firstName: string, lastName: string, phone: string): Promise<CalendarEvent | null> {
    const credentialsRecord: SocialCredentials | null = await SocialCredentialsRepository.getByUserIdAndPlatform(userId, 'google')
    if (!credentialsRecord || !credentialsRecord.isActive) {
      console.log('Aucun credential Google actif trouvé pour l\'utilisateur:', userId)
      return null
    }
    const credentialsData = credentialsRecord.credentials
    if (!credentialsData || !credentialsData.refreshToken) {
      console.log('Credentials Google invalides ou manquants pour l\'utilisateur:', userId);
      return null
    }
    const credentials = {
      clientId: credentialsData.oauthClientId,
      clientSecret: credentialsData.oauthClientSecret,
      refreshToken: credentialsData.refreshToken
    }
    const googleEvent = await googleCalendarService.updateEvent(credentials, googleEventId, {
      summary: `RDV réservé par ${firstName} ${lastName}`,
      description: `Rendez-vous confirmé\nClient: ${firstName} ${lastName}\nEmail: ${email}\nTéléphone: ${phone}`,
      colorId: getEventColor('reserved'),
      attendees: [{ email, responseStatus: 'accepted' }]
    });
    return googleEvent;
  }

  /**
   * Met à jour la couleur d'un événement selon son statut
   */
  static async updateEventColor(userId: string, googleEventId: string, eventType: CalendarEventType): Promise<CalendarEvent | null> {
    const credentialsRecord: SocialCredentials | null = await SocialCredentialsRepository.getByUserIdAndPlatform(userId, 'google')
    if (!credentialsRecord || !credentialsRecord.isActive) {
      console.log('Aucun credential Google actif trouvé pour l\'utilisateur:', userId)
      return null
    }
    const credentialsData = credentialsRecord.credentials
    if (!credentialsData || !credentialsData.refreshToken) {
      console.log('Credentials Google invalides ou manquants pour l\'utilisateur:', userId);
      return null
    }
    const credentials = {
      clientId: credentialsData.oauthClientId,
      clientSecret: credentialsData.oauthClientSecret,
      refreshToken: credentialsData.refreshToken
    }
    
    const googleEvent = await googleCalendarService.updateEvent(credentials, googleEventId, {
      colorId: getEventColor(eventType)
    });
    return googleEvent;
  }

  /**
   * Récupère les couleurs disponibles depuis l'API Google Calendar
   */
  static async getAvailableColors(userId: string): Promise<{ event: { [key: string]: { background: string; foreground: string } } } | null> {
    const credentialsRecord: SocialCredentials | null = await SocialCredentialsRepository.getByUserIdAndPlatform(userId, 'google')
    if (!credentialsRecord || !credentialsRecord.isActive) {
      console.log('Aucun credential Google actif trouvé pour l\'utilisateur:', userId)
      return null
    }
    const credentialsData = credentialsRecord.credentials
    if (!credentialsData || !credentialsData.refreshToken) {
      console.log('Credentials Google invalides ou manquants pour l\'utilisateur:', userId);
      return null
    }
    const credentials = {
      clientId: credentialsData.oauthClientId,
      clientSecret: credentialsData.oauthClientSecret,
      refreshToken: credentialsData.refreshToken
    }
    
    const colors = await googleCalendarService.getColors(credentials);
    return colors ? { event: colors.event } : null;
  }

  /**
   * Affiche les couleurs disponibles dans la console (pour debug)
   */
  static async logAvailableColors(userId: string): Promise<void> {
    const colors = await this.getAvailableColors(userId);
    if (colors) {
      console.log('=== Couleurs Google Calendar disponibles ===');
      Object.entries(colors.event).forEach(([id, colorDef]) => {
        console.log(`ID: ${id} | Background: ${colorDef.background} | Foreground: ${colorDef.foreground}`);
      });
    } else {
      console.log('Impossible de récupérer les couleurs Google Calendar');
    }
  }
}
export default GoogleCalendarAvailabilityRuleService;