import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { logger } from '../../utils/logger';

type GmailMessage = {
  id: string;
  threadId: string;
  snippet?: string;
  internalDate?: string;
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

const toGmailQuery = (since: Date): string => {
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const y = since.getUTCFullYear();
  const m = pad(since.getUTCMonth() + 1);
  const d = pad(since.getUTCDate());
  return `after:${y}/${m}/${d}`;
};

export const getRecentEmails = async (credentials: any, since: Date, maxResults = 25): Promise<GmailMessage[]> => {
  const auth = createOAuthClient(credentials);
  const gmail = google.gmail({ version: 'v1', auth });
  const q = toGmailQuery(since);
  try {
    const res = await gmail.users.messages.list({ userId: 'me', q, maxResults });
    const messages = res.data.messages || [];
    const details = await Promise.all(
      messages.map(async (m) => {
        const r = await gmail.users.messages.get({ userId: 'me', id: m.id! });
        return {
          id: r.data.id!,
          threadId: r.data.threadId!,
          snippet: r.data.snippet ?? undefined,
          internalDate: r.data.internalDate ?? undefined
        } as GmailMessage;
      })
    );
    return details;
  } catch (error) {
    logger.error('Gmail getRecentEmails error', { error: error instanceof Error ? error.message : error });
    return [];
  }
};

export default { getRecentEmails };


