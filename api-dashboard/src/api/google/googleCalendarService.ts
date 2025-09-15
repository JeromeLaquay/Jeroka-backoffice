import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { logger } from '../../utils/logger';

export type CalendarEvent = {
  id: string;
  summary?: string;
  description?: string;
  start?: { dateTime?: string; timeZone?: string };
  end?: { dateTime?: string; timeZone?: string };
  location?: string;
  attendees?: Array<{ email: string; responseStatus?: string }>;
};

const createOAuthClient = (credentials: any): OAuth2Client => {
  const clientId = credentials.clientId || '';
  const clientSecret = credentials.clientSecret || '';
  const refreshToken = credentials.refreshToken || '';
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'urn:ietf:wg:oauth:2.0:oob';
  const client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  client.setCredentials({ refresh_token: refreshToken });
  return client;
};

export const listEvents = async (credentials: any, calendarId = 'primary', timeMin?: string, timeMax?: string, maxResults = 50): Promise<CalendarEvent[]> => {
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

export const createEvent = async (credentials: any, calendarId = 'primary', event: Partial<CalendarEvent>): Promise<CalendarEvent | null> => {
  const auth = createOAuthClient(credentials);
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
    const res = await calendar.events.insert({ calendarId, requestBody });
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
    logger.error('Calendar createEvent error', { error: error instanceof Error ? error.message : error });
    return null;
  }
};

export const updateEvent = async (credentials: any, calendarId = 'primary', eventId: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent | null> => {
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

export const deleteEvent = async (credentials: any, calendarId = 'primary', eventId: string): Promise<boolean> => {
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

export default { listEvents, createEvent, updateEvent, deleteEvent };


