import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { logger } from '../../../utils/logger';

export type CalendarEvent = {
  id?: string;
  summary?: string;
  description?: string;
  start?: { dateTime?: string; timeZone?: string };
  end?: { dateTime?: string; timeZone?: string };
  location?: string;
  attendees?: Array<{ email: string; responseStatus?: string }>;
  colorId?: string; // Utilise colorId au lieu de color selon la documentation Google
};

export type GoogleCalendarColors = {
  kind: string;
  updated: string;
  calendar: { [key: string]: { background: string; foreground: string } };
  event: { [key: string]: { background: string; foreground: string } };
};

const calendarId = 'c63d2465ed5e47c30e0253bfa96748a438bf315e3d1fe62d730d7738ad4e18aa@group.calendar.google.com'


const createOAuthClient = (credentials: any): OAuth2Client => {
  const clientId = credentials.clientId || process.env.GOOGLE_CLIENT_ID || '';
  const clientSecret = credentials.clientSecret || process.env.GOOGLE_CLIENT_SECRET || '';
  const refreshToken = credentials.refreshToken || '';
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'urn:ietf:wg:oauth:2.0:oob';
  
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Missing required OAuth credentials: clientId, clientSecret, or refreshToken');
  }
  
  const client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  client.setCredentials({ refresh_token: refreshToken });
  return client;
};

export const listEvents = async (credentials: any, timeMin?: string, timeMax?: string, maxResults = 50): Promise<CalendarEvent[]> => {
  const auth = createOAuthClient(credentials);
  const calendar = google.calendar({ version: 'v3', auth });
  try {
    const res = await calendar.events.list({ calendarId, timeMin, timeMax, maxResults, singleEvents: true, orderBy: 'startTime' });
    const items = res.data.items || [];
    return items.map(ev => ({
      id: ev.id!,
      summary: ev.summary ?? undefined,
      description: ev.description ?? undefined,
      start: ev.start as any,
      end: ev.end as any,
      location: ev.location ?? undefined,
      attendees: (ev.attendees || []).map(a => ({ email: a.email!, responseStatus: a.responseStatus ?? undefined }))
    }));
  } catch (error) {
    logger.error('Calendar listEvents error', { error: error instanceof Error ? error.message : error });
    return [];
  }
};

export const createEvent = async (credentials: any, event: Partial<CalendarEvent>): Promise<CalendarEvent | null> => {
  const auth = createOAuthClient(credentials);
  console.log('createEvent auth', auth);
  const calendar = google.calendar({ version: 'v3', auth });
  try {
    const requestBody: any = {
      summary: event.summary,
      description: event.description,
      start: event.start,
      end: event.end,
      location: event.location,
      attendees: event.attendees
    };
    console.log('createEvent requestBody', requestBody);
    console.log('createEvent calendarId', calendarId);
    const res = await calendar.events.insert({ calendarId, requestBody });
    console.log('createEvent result jerome', res);
    const ev = res.data;
    console.log('createEvent ev', ev);
    return ev.id ? {
      id: ev.id,
      summary: ev.summary ?? undefined,
      description: ev.description ?? undefined,
      start: ev.start as any,
      end: ev.end as any,
      location: ev.location ?? undefined,
      attendees: (ev.attendees || []).map(a => ({ email: a.email!, responseStatus: a.responseStatus ?? undefined }))
    } : null;
  } catch (error) {
    logger.error('Calendar createEvent error', { error: error instanceof Error ? error.message : error });
    return null;
  }
};

export const updateEvent = async (credentials: any, eventId: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent | null> => {
  const auth = createOAuthClient(credentials);
  const calendar = google.calendar({ version: 'v3', auth });
  try {
    const requestBody: any = {
      summary: updates.summary,
      description: updates.description,
      start: updates.start,
      end: updates.end,
      location: updates.location,
      attendees: updates.attendees
    };
    const res = await calendar.events.patch({ calendarId, eventId, requestBody });
    const ev = res.data;
    return ev.id ? {
      id: ev.id,
      summary: ev.summary ?? undefined,
      description: ev.description ?? undefined,
      start: ev.start as any,
      end: ev.end as any,
      location: ev.location ?? undefined,
      attendees: (ev.attendees || []).map(a => ({ email: a.email!, responseStatus: a.responseStatus ?? undefined }))
    } : null;
  } catch (error) {
    logger.error('Calendar updateEvent error', { error: error instanceof Error ? error.message : error, eventId });
    return null;
  }
};

export const deleteEvent = async (credentials: any, eventId: string): Promise<boolean> => {
  const auth = createOAuthClient(credentials);
  const calendar = google.calendar({ version: 'v3', auth });
  try {
    await calendar.events.delete({ calendarId, eventId });
    return true;
  } catch (error) {
    logger.error('Calendar deleteEvent error', { error: error instanceof Error ? error.message : error, eventId });
    return false;
  }
};

export const getColors = async (credentials: any): Promise<GoogleCalendarColors | null> => {
  const auth = createOAuthClient(credentials);
  const calendar = google.calendar({ version: 'v3', auth });
  try {
    const res = await calendar.colors.get();
    return res.data as GoogleCalendarColors;
  } catch (error) {
    logger.error('Calendar getColors error', { error: error instanceof Error ? error.message : error });
    return null;
  }
};

const testConnection = async (credentials: any): Promise<boolean> => {
  const auth = createOAuthClient(credentials);
  const calendar = google.calendar({ version: 'v3', auth });
  try {
    await calendar.events.list({ calendarId: 'primary' });
    return true;
  } catch (error) {
    logger.error('Calendar testConnection error', { error: error instanceof Error ? error.message : error });
    return false;
  }
};

export class GoogleCalendarService {
  static async listEvents(credentials: any, timeMin?: string, timeMax?: string, maxResults = 50): Promise<CalendarEvent[]> {
    return listEvents(credentials, timeMin, timeMax, maxResults);
  }

  static async createEvent(credentials: any, event: Partial<CalendarEvent>): Promise<CalendarEvent | null> {
    return createEvent(credentials, event);
  }

  static async updateEvent(credentials: any, eventId: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent | null> {
    return updateEvent(credentials, eventId, updates);
  }

  static async deleteEvent(credentials: any, eventId: string): Promise<boolean> {
    return deleteEvent(credentials, eventId);
  }

  static async testConnection(credentials: any): Promise<boolean> {
    return testConnection(credentials);
  }

  static async getColors(credentials: any): Promise<GoogleCalendarColors | null> {
    return getColors(credentials);
  }
}

export default GoogleCalendarService;


